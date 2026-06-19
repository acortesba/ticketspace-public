# 01. App Overview — TicketSpace

> A comprehensive digital event ticketing platform built for security, scalability, and a premium user experience.

---

## What is TicketSpace?

TicketSpace is a full-stack event ticketing platform that enables event hosts to create, sell, and validate digital tickets. Every ticket carries a unique, cryptographically secure QR code that is scanned at the venue door for instant check-in.

The system connects three parties:
- **Event Hosts** — Create events, configure ticket types, manage staff, and track sales.
- **Ticket Buyers** — Browse events, purchase tickets, receive them by email, and add them to digital wallets.
- **Event Staff** — Scan QR codes at the door to validate tickets in real time.

---

## Core Principles

### 1. Security First
Every ticket token is a 64-character cryptographically random string (`random_bytes(32)`) combined with a server-generated UUID. QR codes encode only the token — never PII. Server-side validation prevents screenshot reuse, duplication, and replay attacks.

### 2. Cross-Entity Validation
Tickets are relationally linked to three entities: the **event**, the **host**, and the **buyer**. On scan, the system verifies all three relationships match, plus checks the ticket status is `active` and the event is currently running.

### 3. No Framework Overhead
The backend is written in **vanilla PHP 8.2+** with a custom router, middleware pipeline, and model layer. This avoids framework bloat, keeps the deploy footprint minimal (ideal for shared hosting), and gives us full control over every HTTP header and response.

### 4. Premium UX
The frontend follows a "crystal-clear glassmorphism" design language — dark backgrounds, frosted-glass panels, subtle borders, and no heavy gradients. The design targets a feeling of trust and modernity.

---

## User Roles (RBAC)

| Role | Description | Key Permissions |
|:-----|:------------|:----------------|
| **Super Admin** | Platform owner | Full system access, role management, platform settings |
| **Admin** | Platform manager | User management, event moderation, refund processing |
| **Host** | Event organizer | Create/edit own events, manage ticket types, assign staff, view sales |
| **Staff** | Door scanner | Scan tickets at assigned events only |
| **Buyer** | Ticket purchaser | Browse events, buy tickets, view own tickets, request refunds |

Roles are stored in a `roles` table and assigned via the `user_roles` junction table. Permissions are granular and stored in `permissions` / `role_permissions`. The `RBACMiddleware` checks the user's roles against the route requirements on every request.

---

## Ticket Lifecycle

```
Reserved ──► Pending Payment ──► Paid ──► Active ──► Checked-In ──► Used
     │                │                                    │
     ▼                ▼                                    ▼
  Expired          Failed                              (event ends)
     │                                                     │
     ▼                                                     ▼
  Cancelled ◄─────────────────── Refunded              Expired
```

Every state transition is recorded in the `ticket_state_history` table with who changed it, when, and why — providing a full audit trail.

---

## Payment Flow

1. **Cart** → User selects ticket types and quantities.
2. **Reservation** → Tickets are reserved (status `reserved`) for 15 minutes (`TICKET_RESERVATION_TTL`), decrementing `quantity_sold` in `ticket_types` to prevent overselling.
3. **Payment** → User is redirected to Stripe Checkout, PayPal, or shown a SEPA bank transfer form.
4. **Webhook** → The payment provider sends a webhook confirming success/failure.
5. **Fulfillment** → On success, tickets move to `paid` → `active`, QR codes are generated, and the email with the tickets is dispatched.
6. **Expiry** → If the reservation TTL expires without payment, tickets are released back to inventory.

### Supported Providers
- **Stripe (Dual Model)** 
  - *Option A (Centralized)*: Funds go to TicketSpace main account. TicketSpace manually wires money to hosts (Eventbrite model).
  - *Option B (Decentralized)*: Host connects their own Stripe Express account via Stripe Connect. Funds are split at checkout and go directly to the host instantly.
- **PayPal** — PayPal balance and linked cards
- **Bank Transfer** — Manual SEPA transfer with reference code (admin confirms)

### Platform Fees
The platform charges a configurable fee on each transaction:
- `PLATFORM_FEE_FIXED` — Fixed amount per transaction (default: €0.50)
- `PLATFORM_FEE_PERCENT` — Percentage of the total (default: 2.0%)

## Promoters & Affiliates System

TicketSpace includes a powerful built-in promoter system that allows event hosts to track external sales and issue discount codes.

- **Unique UID Tracking**: Promoters are identified by a Unique ID (UID).
- **Promo Codes**: Hosts can associate specific text codes (e.g., `SUMMER20`) to a promoter. If a code is not provided, the system acts as a silent link tracker.
- **Commission Structures**: Hosts can assign either a fixed amount (€) or a percentage (%) commission per ticket sold to a specific promoter.
- **Provisional Users**: When a host invites a new promoter by email, the backend securely generates a "Provisional" user account (with `email_verified=0` and no password) and links them to the event. The invitation link allows the user to claim their account and set a password.

---

## QR Code Security

Each ticket's QR code encodes a **64-character hex token** — never the ticket ID, user email, or any other PII.

### Scan Validation Process:
1. Staff scans the QR code with the browser-based scanner.
2. The frontend sends the token to `POST /api/v1/tickets/scan`.
3. The server:
   - Looks up the ticket by token.
   - Verifies the ticket status is `active`.
   - Verifies the event matches the scanner's assigned event.
   - Verifies the event is currently in its check-in window (`doors_open` to `event_end`).
   - Transitions the ticket to `checked_in`.
4. The scan result (`success`, `already_used`, `invalid`, `wrong_event`) is stored in `ticket_scans`.
5. The staff device shows an instant green/red visual feedback.

---

## Digital Wallet Integration

### Apple Wallet
- Uses the `php-pkpass` library to generate `.pkpass` files.
- Requires an Apple Developer Account with a Pass Type ID certificate.
- Passes include the QR code, event details, and venue location.

### Google Wallet
- Uses the Google Wallet API to create Generic Pass objects.
- Requires a Google Cloud project with Wallet API enabled and a service account.
- Passes include the same data as Apple Wallet, formatted for Google's schema.

---

## Email Delivery

All emails are sent via **PHPMailer** using the Hostinger SMTP server (`smtp.hostinger.com:465`).

### Email Types:
| Email | Trigger | Content |
|:------|:--------|:--------|
| Welcome | Registration | Verification link |
| Email Verification | Registration | Token-based verification URL |
| Password Reset | Forgot password | Time-limited reset link (1 hour) |
| Ticket Delivery | Payment confirmed | PDF/image ticket with QR code + wallet links |
| Refund Confirmation | Refund processed | Refund details and timeline |

Email templates are stored in the `email_templates` table and can be customized per language.

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────┐
│                     React SPA                       │
│   Vite • React Router • Zustand • Glassmorphism     │
│             https://ticketspace.vercel.app           │
└──────────────────────┬──────────────────────────────┘
                       │ Axios (JWT Bearer)
                       ▼
┌─────────────────────────────────────────────────────┐
│                 PHP REST API                        │
│  Router → CORS → RateLimit → Auth → RBAC → Ctrl    │
│           https://api.ticketspace.es/api/v1          │
└──────────────────────┬──────────────────────────────┘
                       │ PDO (Prepared Statements)
                       ▼
┌─────────────────────────────────────────────────────┐
│               MySQL 8.0 Database                    │
│          18 tables • InnoDB • utf8mb4               │
└─────────────────────────────────────────────────────┘
```

---

## File Structure

```
ticketspace/
├── api/                        ← Backend API
│   ├── composer.json
│   ├── .env.example
│   ├── migrations/
│   │   └── schema.sql          ← 18 tables + schema
│   ├── public/
│   │   ├── index.php           ← API entry point
│   │   ├── .htaccess           ← URL rewriting
│   │   └── uploads/            ← User-uploaded images
│   ├── src/
│   │   ├── Config/App.php      ← .env loader + config access
│   │   ├── Controllers/        ← AuthController, UserController, EventController
│   │   ├── Middleware/         ← CORS, Auth, RateLimit, RBAC
│   │   ├── Models/             ← BaseModel, User, Role, Event
│   │   ├── Routes/             ← Router + api.php definitions
│   │   └── Utils/              ← Database, Logger, Response, Validator, Sanitizer
│   └── storage/                ← QR codes, cache, logs, rate limits
├── frontend/
│   ├── src/
│   │   ├── components/         ← Glass UI, Layout, Auth, Events, Tickets
│   │   ├── context/            ← AuthContext, ToastContext
│   │   ├── locales/            ← EN, ES translation JSONs
│   │   ├── pages/              ← Landing, Login, Register
│   │   ├── services/api.js     ← Axios + JWT interceptors
│   │   ├── styles/index.css    ← Design system tokens
│   │   ├── App.jsx             ← React Router tree
│   │   └── main.jsx            ← Entry point
│   └── vite.config.js
├── docs/                       ← Documentation
├── tutorials/                  ← Setup & deployment guides
├── CHANGELOG.md
├── LICENSE (MIT)
└── README.md
```
