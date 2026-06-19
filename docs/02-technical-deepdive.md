# 02. Technical Deep Dive — TicketSpace

> Code-level walkthrough of the backend architecture, patterns, and security mechanisms.

---

## 1. Configuration System — `Config/App.php`

The configuration is loaded from `.env` using `vlucas/phpdotenv`. The `App` class provides a static `get()` accessor with dot-notation and default values:

```php
// Usage
$secret = App::get('jwt.secret');
$debug  = App::isDebug();
$locale = App::get('app.locale', 'es');
```

### Why not a framework config?
We use a single flat class to avoid any autoloading or container overhead. The `.env` file is parsed once at boot, and values are cached in a static array. This is the fastest possible configuration access pattern for shared hosting.

### Key mapping
Environment variables are mapped to a nested associative array:
- `DB_HOST` → `App::get('db.host')`
- `JWT_SECRET` → `App::get('jwt.secret')`
- `STRIPE_SECRET_KEY` → `App::get('stripe.secret_key')`

---

## 2. Database Layer — `Utils/Database.php`

PDO singleton with strict mode enabled:

```php
$pdo = Database::getInstance();

// Strict mode settings applied on connection:
// - ERRMODE_EXCEPTION    → Throw on errors, never silently fail
// - FETCH_ASSOC          → Return associative arrays, not indexed
// - EMULATE_PREPARES off → Real prepared statements for security
// - SET sql_mode = 'STRICT_TRANS_TABLES' → Reject invalid data
```

### Transaction support
Static convenience methods wrap PDO transactions:

```php
Database::beginTransaction();
try {
    // e.g., EventController creating Event + Tickets + Promoters
    $event = $this->createEvent($data);
    $this->createTicketTypes($event['id'], $data['tickets']);
    $this->createEventPromoters($event['id'], $data['promoters']);
    Database::commit();
} catch (\Exception $e) {
    Database::rollback();
    throw $e;
}
```

---

## 3. Router — `Routes/Router.php`

A lightweight custom router that supports:
- **HTTP methods**: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`
- **Route groups** with prefix and shared middleware
- **Path parameters**: `/events/{id}` → `$params['id']`
- **Middleware pipeline**: Executed in order before the handler

### Route registration
```php
$router->group('/api/v1', function (Router $router) {
    $router->get('/health', function () { /* ... */ });
    
    $router->group('/auth', function (Router $router) {
        $router->post('/login',  [AuthController::class, 'login'], [RateLimitMiddleware::class]);
        $router->post('/logout', [AuthController::class, 'logout'], [AuthMiddleware::class]);
    });
}, [CORSMiddleware::class]); // CORS applied to all routes in this group
```

### Resolution
1. Extract the method and URI from `$_SERVER`.
2. Iterate registered routes, matching method + path pattern.
3. Extract path parameters via regex.
4. Build the middleware chain and execute.

---

## 4. Middleware Pipeline

Middleware follows a functional pipeline pattern. Each middleware receives the request params and a `$next` callable:

```php
class AuthMiddleware
{
    public static function handle(array $params, callable $next): void
    {
        // Extract & verify JWT from Authorization header
        $token = self::extractBearerToken();
        $payload = self::verifyToken($token);
        
        // Attach user data to request context
        $_REQUEST['_user'] = $payload;
        
        // Continue to next middleware or controller
        $next($params);
    }
}
```

### Middleware stack order (per route):
1. `CORSMiddleware` — Handles preflight OPTIONS and sets CORS headers
2. `RateLimitMiddleware` — File-based rate limiting (IP + endpoint)
3. `AuthMiddleware` — JWT verification, token refresh detection
4. `RBACMiddleware` — Role-based access control check

---

## 5. Base Model — `Models/BaseModel.php`

Abstract model providing CRUD operations for all entities:

```php
abstract class BaseModel
{
    protected string $table;           // Table name
    protected array  $fillable = [];   // Mass-assignable fields
    protected array  $hidden = [];     // Fields to strip from output (passwords, tokens)
    protected bool   $softDeletes = false; // Soft delete support
    
    // CRUD
    public function find(int $id): ?array;
    public function findByUuid(string $uuid): ?array;
    public function findBy(string $column, mixed $value): ?array;
    public function where(string $column, mixed $value, string $operator = '='): array;
    public function all(int $page, int $perPage, string $orderBy, string $direction): array;
    public function create(array $data): ?array;
    public function update(int $id, array $data): ?array;
    public function delete(int $id): bool;
    public function exists(string $column, mixed $value, ?int $excludeId = null): bool;
}
```

### SQL Injection Prevention
- All values use **prepared statements** (`:placeholder`).
- Column and operator names are validated against allowlists via `validateColumn()` and `validateOperator()` — preventing injection through dynamic column names.

### Soft Deletes
When `$softDeletes = true`, `delete()` sets `deleted_at = NOW()` instead of removing the row. All `find*` methods automatically append `AND deleted_at IS NULL`.

---

## 6. User Model — `Models/User.php`

Extends BaseModel with authentication-specific methods:

### Password Hashing — Argon2ID
```php
password_hash($password, PASSWORD_ARGON2ID, [
    'memory_cost' => 65536,  // 64MB
    'time_cost'   => 4,      // 4 iterations
    'threads'     => 3,      // 3 parallel threads
]);
```

We use Argon2ID (winner of the Password Hashing Competition) instead of bcrypt because:
- It's resistant to both side-channel and GPU attacks.
- The memory cost parameter makes brute-force prohibitively expensive.
- PHP 8.2+ supports it natively.

### Session Management
JWT sessions are tracked in the `sessions` table. Each session stores:
- A UUID (`jti` claim in the JWT)
- Hashed refresh token (`hash('sha256', $refreshToken)`)
- IP address and user agent
- Expiry timestamp

This allows us to invalidate specific sessions (logout one device) or all sessions (force logout everywhere after a password change).

---

## 7. JWT Authentication

### Access Token (short-lived)
```json
{
  "iss": "ticketspace.es",
  "sub": 42,
  "jti": "session-uuid",
  "roles": ["buyer"],
  "exp": 1718500000,
  "iat": 1718496400
}
```
- Expires in **1 hour** (`JWT_EXPIRY`).
- Sent in the `Authorization: Bearer <token>` header.
- Stateless — no server-side lookup needed for validation.

### Refresh Token (long-lived)
- A 64-character random hex string.
- Stored **hashed** (SHA-256) in the `sessions` table.
- Expires in **7 days** (`JWT_REFRESH_EXPIRY`).
- Used to obtain a new access token without re-entering credentials.

### Token Refresh Flow
1. Frontend interceptor detects a `401 Unauthorized` response.
2. Sends `POST /api/v1/auth/refresh` with the refresh token.
3. Server validates the refresh token against the sessions table.
4. If valid, issues a new access token and returns it.
5. If invalid/expired, redirects to login.

---

## 8. Rate Limiting — `Middleware/RateLimitMiddleware.php`

File-based rate limiting (no Redis needed on shared hosting):

```
storage/rate_limits/
├── 192.168.1.1_api_v1_auth_login.json
├── 10.0.0.5_api_v1_auth_register.json
└── ...
```

Each file contains:
```json
{
  "count": 5,
  "window_start": 1718496000
}
```

### Modes:
| Mode | Requests | Window | Used for |
|:-----|:---------|:-------|:---------|
| Default | 100 | 60s | General API endpoints |
| Strict | 10 | 60s | Login, registration |

Uses `LOCK_EX` for file locking to prevent race conditions under concurrent requests.

---

## 9. Input Validation — `Utils/Validator.php`

Declarative validation with composable rules:

```php
[$valid, $errors] = Validator::make($data, [
    'email'      => 'required|email|max:255',
    'password'   => 'required|min:8|max:100',
    'first_name' => 'required|string|max:100',
    'phone'      => 'nullable|string|max:20',
]);
```

### Supported rules:
`required`, `nullable`, `string`, `integer`, `email`, `min:N`, `max:N`, `in:a,b,c`, `confirmed` (checks `field_confirmation`), `url`, `uuid`, `date`, `boolean`, `array`, `numeric`, `alpha`, `alpha_num`, `regex:pattern`

---

## 10. Input Sanitization — `Utils/Sanitizer.php`

Applied after validation, before database insertion:

```php
$sanitized = Sanitizer::sanitize($data, [
    'email'      => 'email',      // lowercased + trimmed
    'first_name' => 'string',     // htmlspecialchars + trimmed
    'phone'      => 'string',
]);
```

### Utility methods:
- `Sanitizer::generateUuid()` — UUID v4 generation
- `Sanitizer::generateToken(int $length)` — Crypto-secure hex token
- `Sanitizer::sanitize()` — Batch field sanitization

---

## 11. Logger — `Utils/Logger.php`

PSR-3 compatible file logger with automatic data redaction:

```php
Logger::info('User registered', ['email' => 'test@example.com']);
Logger::error('Payment failed', ['stripe_error' => $e->getMessage()]);
```

### Redaction
The logger automatically redacts sensitive fields from log context:
- `password`, `password_hash`
- `token`, `refresh_token`, `verification_token`, `reset_token`
- `credit_card`, `card_number`, `cvv`

These are replaced with `[REDACTED]` before writing to the log file.

---

## 12. Database Schema

### Entity Relationship Summary

```
users ─┬─ user_roles ── roles ── role_permissions ── permissions
       │
       ├─ sessions (JWT refresh tokens)
       │
       ├─ events ─┬─ ticket_types
       │          ├─ event_staff ── users
       │          └─ payments ── payment_refunds
       │
       └─ tickets ─┬─ ticket_state_history
                   └─ ticket_scans
                   
audit_log (cross-entity)
app_settings (key-value config)
email_templates (per-language email content)
```

### Tables (18 total):
1. `users` — Accounts with Argon2ID hashes and `email_verified` flags
2. `roles` — 5 default roles
3. `permissions` — Granular permission slugs
4. `user_roles` — User ↔ Role junction
5. `role_permissions` — Role ↔ Permission junction
6. `events` — Event metadata (`event_type`, `allocation_type`), venue, dates, capacity
7. `ticket_types` — Pricing, quantities, sections, seat ranges
8. `tickets` — Individual tickets with QR tokens
9. `ticket_state_history` — Audit trail for ticket status changes
10. `ticket_scans` — Scan attempts with results
11. `payments` — Payment records with provider details
12. `payment_refunds` — Refund tracking
13. `event_staff` — Staff assigned to specific events
14. `event_promoters` — Tracks which promoters are allowed to sell tickets for which event
15. `audit_log` — System-wide action log
16. `app_settings` — Key-value platform configuration
17. `sessions` — JWT refresh token sessions
18. `email_templates` — Customizable email content

---

## 13. Frontend Architecture

### Stack
- **React 18** with functional components and hooks
- **Vite** for build tooling with HMR
- **React Router v6** with nested routes and `<Outlet />`
- **react-leaflet** & **Nominatim API** for maps and forward/reverse geocoding
- **Axios** with request/response interceptors
- **Tailwind CSS 3** + custom CSS variables for the glassmorphism design system

### State Management
- **AuthContext** — Global auth state (user, token, login/logout/register)
- **ToastContext** — Non-intrusive toast notifications
- No heavy state management library (Redux, Zustand) needed at this stage

### Component Hierarchy
```
<BrowserRouter>
  <ToastProvider>
    <AuthProvider>
      <App>
        <Routes>
          <PageLayout>
            <Navbar />
            <Outlet />  ← Landing, Login, Register, Dashboard, etc.
          </PageLayout>
        </Routes>
      </App>
    </AuthProvider>
  </ToastProvider>
</BrowserRouter>
```
