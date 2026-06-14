# Connections Guide — TicketSpace

> Step-by-step instructions to connect every external service required to run and test TicketSpace locally and in production.

---

## Table of Contents

1. [PHP & MySQL (Local Development)](#1-php--mysql-local-development)
2. [Composer Dependencies](#2-composer-dependencies)
3. [MySQL Database Setup](#3-mysql-database-setup)
4. [JWT Secret Generation](#4-jwt-secret-generation)
5. [Stripe (Payments)](#5-stripe-payments)
6. [PayPal (Payments)](#6-paypal-payments)
7. [SMTP Email (Hostinger)](#7-smtp-email-hostinger)
8. [Apple Wallet (Passes)](#8-apple-wallet-passes)
9. [Google Wallet (Passes)](#9-google-wallet-passes)
10. [Hostinger Deployment](#10-hostinger-deployment)
11. [GitHub Repository](#11-github-repository)
12. [Environment Variables Reference](#12-environment-variables-reference)

---

## 1. PHP & MySQL (Local Development)

You need PHP 8.2+ and MySQL 8.0+ running on your machine. The easiest way on Windows:

### Option A: Laragon (Recommended)
1. Download **Laragon Full** from [laragon.org](https://laragon.org/download/)
2. Install and start Laragon. It bundles PHP 8.2, MySQL 8.0, Apache, and phpMyAdmin.
3. PHP and MySQL are automatically added to your system PATH.
4. Verify:
   ```powershell
   php -v      # Should show PHP 8.2+
   mysql -V    # Should show MySQL 8.0+
   ```

### Option B: XAMPP
1. Download XAMPP with PHP 8.2 from [apachefriends.org](https://www.apachefriends.org/)
2. Install and start Apache + MySQL from the XAMPP Control Panel.
3. Add PHP to PATH manually:
   ```powershell
   # Add to your PowerShell profile or run temporarily:
   $env:PATH += ";C:\xampp\php"
   ```
4. Verify with `php -v` and `mysql -V`.

### Option C: Manual Install
1. Download PHP 8.2 from [windows.php.net](https://windows.php.net/download/)
2. Extract to `C:\php` and add to PATH.
3. Install MySQL 8.0 from [dev.mysql.com](https://dev.mysql.com/downloads/installer/)
4. Enable required PHP extensions in `php.ini`:
   ```ini
   extension=pdo_mysql
   extension=mbstring
   extension=openssl
   extension=gd
   extension=fileinfo
   extension=sodium    ; Required for Argon2ID
   ```

---

## 2. Composer Dependencies

Install Composer (PHP dependency manager):

1. Download from [getcomposer.org](https://getcomposer.org/download/)
2. Run the installer (it auto-detects your PHP).
3. Navigate to the backend folder and install:
   ```powershell
   cd backend
   composer install
   ```

This installs:
- `firebase/php-jwt` — JWT encoding/decoding
- `vlucas/phpdotenv` — .env file parser
- `endroid/qr-code` — QR code generation
- `phpmailer/phpmailer` — Email sending via SMTP
- `stripe/stripe-php` — Stripe SDK
- `tschoffelen/php-pkpass` — Apple Wallet pass generation
- `google/apiclient` — Google APIs (Wallet)

---

## 3. MySQL Database Setup

### 3.1 Create the Database

Open a MySQL terminal or phpMyAdmin and run:

```sql
CREATE DATABASE ticketspace CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ticketspace_user'@'localhost' IDENTIFIED BY 'your_secure_password_here';
GRANT ALL PRIVILEGES ON ticketspace.* TO 'ticketspace_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3.2 Configure the `.env` File

```powershell
cd backend
copy .env.example .env
```

Edit `backend/.env` and fill in your database credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ticketspace
DB_USER=ticketspace_user
DB_PASS=your_secure_password_here
```

### 3.3 Run Migrations

```powershell
cd backend
php migrations/migrate.php
```

This creates all 17 tables and seeds the default roles (`super_admin`, `admin`, `host`, `staff`, `buyer`) and application settings.

### 3.4 Verify

```powershell
php -r "
require 'vendor/autoload.php';
\TicketSpace\Config\App::load();
\$db = \TicketSpace\Utils\Database::getInstance();
\$stmt = \$db->query('SELECT COUNT(*) FROM roles');
echo 'Roles count: ' . \$stmt->fetchColumn() . PHP_EOL;
"
```

Expected output: `Roles count: 5`

---

## 4. JWT Secret Generation

Generate a cryptographically secure 256-bit secret:

```powershell
php -r "echo bin2hex(random_bytes(32));"
```

Copy the output and paste it into `backend/.env`:

```env
JWT_SECRET=a1b2c3d4e5f6...your_64_char_hex_string
```

> **⚠ IMPORTANT**: Never commit this value to version control. The `.gitignore` already excludes `.env` files.

---

## 5. Stripe (Payments)

### 5.1 Create a Stripe Account
1. Sign up at [stripe.com](https://stripe.com)
2. Complete the onboarding (you can skip identity verification for test mode).

### 5.2 Get API Keys
1. Go to **Dashboard → Developers → API Keys**
2. Copy your **test** keys:
   - `Publishable key` → starts with `pk_test_`
   - `Secret key` → starts with `sk_test_`

### 5.3 Configure in `.env`

```env
STRIPE_PUBLIC_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
```

### 5.4 Set Up Webhooks (for payment confirmation)
1. Go to **Developers → Webhooks → Add Endpoint**
2. Set the endpoint URL:
   - **Local testing**: Use [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward:
     ```powershell
     stripe listen --forward-to localhost:8000/api/v1/payments/webhook
     ```
   - **Production**: `https://ticketspace.es/api/v1/payments/webhook`
3. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Copy the **webhook signing secret** → starts with `whsec_`

```env
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 5.5 Install Stripe CLI (Local Testing)
```powershell
# Using Scoop (Windows package manager)
scoop install stripe

# Or download directly from:
# https://github.com/stripe/stripe-cli/releases
```

### 5.6 SEPA via Stripe
SEPA Direct Debit is enabled through Stripe. No additional configuration needed — just enable it in your Stripe Dashboard under **Settings → Payment Methods**.

```env
SEPA_ENABLED=true
```

### 5.7 Test Cards
| Card Number | Scenario |
|:------------|:---------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Declined |
| `4000 0000 0000 3220` | 3D Secure required |
| `4000 0025 0000 3155` | SCA required |

Use any future expiry date, any CVC, and any billing ZIP.

---

## 6. PayPal (Payments)

### 6.1 Create a PayPal Developer Account
1. Go to [developer.paypal.com](https://developer.paypal.com/)
2. Log in with your PayPal account (or create one).

### 6.2 Create a Sandbox App
1. Go to **Dashboard → My Apps & Credentials**
2. Select **Sandbox** tab
3. Click **Create App**
4. Name it `TicketSpace Dev`
5. Copy the **Client ID** and **Secret**

### 6.3 Configure in `.env`

```env
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
PAYPAL_MODE=sandbox
```

### 6.4 Sandbox Test Accounts
PayPal automatically creates sandbox buyer/seller accounts. Find them under:
**Dashboard → Sandbox → Accounts**

Default sandbox buyer credentials are shown there.

### 6.5 Switch to Production
When ready:
1. Switch to the **Live** tab in PayPal Developer Dashboard.
2. Create a Live app.
3. Update `.env`:
   ```env
   PAYPAL_MODE=live
   PAYPAL_CLIENT_ID=your_live_client_id
   PAYPAL_CLIENT_SECRET=your_live_client_secret
   ```

---

## 7. SMTP Email (Hostinger)

### 7.1 Create an Email Account on Hostinger
1. Log in to [hpanel.hostinger.com](https://hpanel.hostinger.com/)
2. Go to **Emails → Email Accounts** under your `ticketspace.es` domain.
3. Create an email account: `noreply@ticketspace.es`
4. Set a strong password.

### 7.2 Configure in `.env`

```env
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_ENCRYPTION=ssl
SMTP_USER=noreply@ticketspace.es
SMTP_PASS=your_email_password
SMTP_FROM_EMAIL=noreply@ticketspace.es
SMTP_FROM_NAME=TicketSpace
```

### 7.3 Test Email Sending

```powershell
cd backend
php -r "
require 'vendor/autoload.php';
\TicketSpace\Config\App::load();
\$mail = new \PHPMailer\PHPMailer\PHPMailer(true);
\$mail->isSMTP();
\$mail->Host = \TicketSpace\Config\App::get('smtp.host');
\$mail->Port = (int) \TicketSpace\Config\App::get('smtp.port');
\$mail->SMTPAuth = true;
\$mail->Username = \TicketSpace\Config\App::get('smtp.user');
\$mail->Password = \TicketSpace\Config\App::get('smtp.pass');
\$mail->SMTPSecure = \TicketSpace\Config\App::get('smtp.encryption');
\$mail->setFrom(\TicketSpace\Config\App::get('smtp.from_email'), \TicketSpace\Config\App::get('smtp.from_name'));
\$mail->addAddress('your_test_email@gmail.com');
\$mail->Subject = 'TicketSpace Test';
\$mail->Body = 'SMTP connection is working!';
\$mail->send();
echo 'Email sent successfully!' . PHP_EOL;
"
```

### 7.4 For Local Development (Without SMTP)
If you don't want to use real SMTP locally, you can use [Mailtrap](https://mailtrap.io/):
1. Sign up at mailtrap.io (free tier).
2. Create an inbox.
3. Use the provided SMTP credentials in your `.env`:
   ```env
   SMTP_HOST=sandbox.smtp.mailtrap.io
   SMTP_PORT=2525
   SMTP_ENCRYPTION=tls
   SMTP_USER=your_mailtrap_user
   SMTP_PASS=your_mailtrap_pass
   ```

---

## 8. Apple Wallet (Passes)

> **Requires**: Apple Developer Account ($99/year)

### 8.1 Create a Pass Type ID
1. Go to [developer.apple.com/account](https://developer.apple.com/account)
2. Navigate to **Certificates, Identifiers & Profiles → Identifiers**
3. Click **+** and select **Pass Type IDs**
4. Set:
   - Description: `TicketSpace Event Ticket`
   - Identifier: `pass.es.ticketspace.ticket`
5. Click **Register**

### 8.2 Create a Pass Certificate
1. Select your new Pass Type ID.
2. Click **Create Certificate**.
3. Generate a CSR from your Mac's Keychain Access.
4. Upload the CSR and download the certificate (`.cer`).
5. Double-click to import into Keychain Access.
6. Export as `.p12` with a password.

### 8.3 Download the WWDR Certificate
Download Apple's Worldwide Developer Relations (WWDR) intermediate certificate:
[Apple WWDR Certificate (G4)](https://www.apple.com/certificateauthority/AppleWWDRCAG4.cer)

### 8.4 Place Certificates in the Backend

```powershell
# Create a certificates directory (NOT in the web root!)
New-Item -ItemType Directory -Force -Path backend/certs

# Copy your files:
# - backend/certs/pass.p12       (your exported pass certificate)
# - backend/certs/wwdr.pem       (WWDR certificate converted to PEM)
```

Convert WWDR from `.cer` to `.pem`:
```bash
openssl x509 -in AppleWWDRCAG4.cer -inform DER -out wwdr.pem -outform PEM
```

### 8.5 Configure in `.env`

```env
APPLE_PASS_TYPE_ID=pass.es.ticketspace.ticket
APPLE_TEAM_ID=YOUR_10_CHAR_TEAM_ID
APPLE_CERT_PATH=certs/pass.p12
APPLE_CERT_PASS=your_certificate_password
APPLE_WWDR_CERT_PATH=certs/wwdr.pem
```

### 8.6 Add certs to `.gitignore`
Already covered:
```gitignore
*.p12
*.pem
*.key
*.cert
```

---

## 9. Google Wallet (Passes)

### 9.1 Create a Google Cloud Project
1. Go to [console.cloud.google.com](https://console.cloud.google.com/)
2. Create a new project: `TicketSpace`
3. Enable the **Google Wallet API**:
   - Go to **APIs & Services → Library**
   - Search for "Google Wallet API"
   - Click **Enable**

### 9.2 Create a Service Account
1. Go to **IAM & Admin → Service Accounts**
2. Click **Create Service Account**:
   - Name: `ticketspace-wallet`
   - Role: None needed (Wallet API uses the Issuer ID)
3. Create a JSON key:
   - Click on the service account → **Keys → Add Key → Create New Key → JSON**
   - Download the JSON file.

### 9.3 Become a Google Wallet Issuer
1. Go to [pay.google.com/business/console](https://pay.google.com/business/console)
2. Sign up as an Issuer.
3. Note your **Issuer ID** (numeric).
4. Add the service account email (`ticketspace-wallet@your-project.iam.gserviceaccount.com`) as a user.

### 9.4 Place the Service Account Key

```powershell
# Place in backend/certs (not in the web root)
# backend/certs/google-wallet-key.json
```

### 9.5 Configure in `.env`

```env
GOOGLE_WALLET_ISSUER_ID=1234567890
GOOGLE_WALLET_SERVICE_ACCOUNT_KEY=certs/google-wallet-key.json
```

### 9.6 Add to `.gitignore`
Already covered — JSON keys containing `key` in the name are sensitive:
```gitignore
backend/certs/
*.json  # The service account key
```

> **Note**: Add `backend/certs/` to `.gitignore` explicitly — see step 12.

---

## 10. Hostinger Deployment

### 10.1 Hosting Plan
TicketSpace is designed for **Hostinger Premium Shared Hosting** which includes:
- PHP 8.2
- MySQL 8.0
- 100 GB SSD storage
- Free SSL (Let's Encrypt)
- SSH access

### 10.2 Domain Setup
1. In Hostinger hPanel, point `ticketspace.es` to your hosting.
2. Enable **Force HTTPS** under SSL settings.

### 10.3 Deploy Backend
1. SSH into your Hostinger server.
2. Upload the `backend/` folder to a directory like `/home/user/ticketspace-api/`.
3. Set the domain's web root (or a subdomain like `api.ticketspace.es`) to point to `/home/user/ticketspace-api/public/`.
4. Install dependencies:
   ```bash
   cd /home/user/ticketspace-api
   composer install --no-dev --optimize-autoloader
   ```
5. Create and configure `.env`:
   ```bash
   cp .env.example .env
   nano .env  # Fill in production credentials
   ```
6. Run migrations:
   ```bash
   php migrations/migrate.php
   ```
7. Set permissions:
   ```bash
   chmod -R 755 storage/
   chmod -R 755 public/uploads/
   ```

### 10.4 Deploy Frontend
1. Build locally:
   ```powershell
   cd frontend
   npm run build
   ```
2. Upload the contents of `frontend/dist/` to the web root for `ticketspace.es`.
3. Add an `.htaccess` in the frontend web root for SPA routing:
   ```apache
   <IfModule mod_rewrite.c>
       RewriteEngine On
       RewriteBase /
       RewriteRule ^index\.html$ - [L]
       RewriteCond %{REQUEST_FILENAME} !-f
       RewriteCond %{REQUEST_FILENAME} !-d
       RewriteRule . /index.html [L]
   </IfModule>
   ```

### 10.5 CORS Configuration (Production)
Update `backend/.env` to allow only the frontend origin:
```env
CORS_ALLOWED_ORIGINS=https://ticketspace.es
```

---

## 11. GitHub Repository

### 11.1 Repository Setup
The project uses two repositories:
- **Private**: `acortesba/ticketspace` — Full source code
- **Public**: `acortesba/ticketspace-public` — Sanitized for portfolio

### 11.2 Initial Push

```powershell
cd "c:\Users\Alberto\Desktop\ESTUDIOS Y DESARROLLO\PROYECTOS\6. TICKETING\12. APP"

# Initialize git
git init
git remote add origin git@github.com:acortesba/ticketspace.git

# Create and push to development branch
git checkout -b development
git add .
git commit -m "feat: initial project foundation — Phase 1 complete

- Backend: PHP 8.2 REST API with JWT auth, RBAC, rate limiting
- Frontend: React 18 SPA with glassmorphism design system
- Database: 17-table schema with migrations and seed data
- Auth: Register, login, logout, token refresh, password reset
- i18n: English and Spanish support
- Docs: App overview, technical deep dive, design system, performance"

git push -u origin development
```

### 11.3 Branch Strategy
| Branch | Purpose |
|:-------|:--------|
| `main` | Production-ready releases |
| `development` | Active development, feature integration |
| `feature/*` | Individual feature branches |

---

## 12. Environment Variables Reference

Full list of all `.env` variables:

| Variable | Required | Default | Description |
|:---------|:---------|:--------|:------------|
| `APP_NAME` | No | TicketSpace | Application name |
| `APP_URL` | Yes | — | Public URL |
| `APP_ENV` | No | production | `production` or `development` |
| `APP_DEBUG` | No | false | Enable debug mode |
| `APP_LOCALE` | No | es | Default language |
| `APP_TIMEZONE` | No | Europe/Madrid | Server timezone |
| `DB_HOST` | Yes | localhost | MySQL host |
| `DB_PORT` | No | 3306 | MySQL port |
| `DB_NAME` | Yes | — | Database name |
| `DB_USER` | Yes | — | Database user |
| `DB_PASS` | Yes | — | Database password |
| `DB_CHARSET` | No | utf8mb4 | Database charset |
| `JWT_SECRET` | Yes | — | 256-bit hex secret |
| `JWT_EXPIRY` | No | 3600 | Access token TTL (seconds) |
| `JWT_REFRESH_EXPIRY` | No | 604800 | Refresh token TTL (seconds) |
| `STRIPE_PUBLIC_KEY` | Yes* | — | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Yes* | — | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Yes* | — | Stripe webhook signing secret |
| `PAYPAL_CLIENT_ID` | Yes* | — | PayPal app client ID |
| `PAYPAL_CLIENT_SECRET` | Yes* | — | PayPal app secret |
| `PAYPAL_MODE` | No | sandbox | `sandbox` or `live` |
| `SEPA_ENABLED` | No | true | Enable SEPA payments |
| `SMTP_HOST` | Yes | — | SMTP server hostname |
| `SMTP_PORT` | No | 465 | SMTP port |
| `SMTP_ENCRYPTION` | No | ssl | `ssl` or `tls` |
| `SMTP_USER` | Yes | — | SMTP username |
| `SMTP_PASS` | Yes | — | SMTP password |
| `SMTP_FROM_EMAIL` | Yes | — | Sender email address |
| `SMTP_FROM_NAME` | No | TicketSpace | Sender display name |
| `APPLE_PASS_TYPE_ID` | No | — | Apple Pass Type Identifier |
| `APPLE_TEAM_ID` | No | — | Apple Developer Team ID |
| `APPLE_CERT_PATH` | No | — | Path to .p12 certificate |
| `APPLE_CERT_PASS` | No | — | Certificate password |
| `APPLE_WWDR_CERT_PATH` | No | — | Path to WWDR .pem |
| `GOOGLE_WALLET_ISSUER_ID` | No | — | Google Wallet Issuer ID |
| `GOOGLE_WALLET_SERVICE_ACCOUNT_KEY` | No | — | Path to service account JSON |
| `PLATFORM_FEE_FIXED` | No | 0.50 | Fixed fee per transaction (EUR) |
| `PLATFORM_FEE_PERCENT` | No | 2.0 | Percentage fee per transaction |
| `PLATFORM_CURRENCY` | No | EUR | Platform currency |
| `RATE_LIMIT_REQUESTS` | No | 100 | Max requests per window |
| `RATE_LIMIT_WINDOW` | No | 60 | Rate limit window (seconds) |
| `CORS_ALLOWED_ORIGINS` | Yes | — | Comma-separated allowed origins |
| `TICKET_RESERVATION_TTL` | No | 900 | Reservation timeout (seconds) |
| `UPLOAD_MAX_SIZE` | No | 5242880 | Max upload size (bytes) |
| `UPLOAD_ALLOWED_TYPES` | No | image/jpeg,image/png,image/webp | Allowed MIME types |
| `UPLOAD_PATH` | No | uploads | Upload directory |

*\*Required for payment processing. App will still function for non-payment features without them.*

---

## Quick Start Checklist

- [ ] Install PHP 8.2+ (Laragon/XAMPP/manual)
- [ ] Install MySQL 8.0+
- [ ] Install Composer
- [ ] Install Node.js 18+
- [ ] Create MySQL database & user
- [ ] Copy `.env.example` → `.env` and fill credentials
- [ ] Run `composer install`
- [ ] Run `php migrations/migrate.php`
- [ ] Generate and set `JWT_SECRET`
- [ ] Run `npm install` (frontend)
- [ ] Start backend: `php -S localhost:8000 -t public`
- [ ] Start frontend: `npm run dev`
- [ ] Open `http://localhost:5173`
- [ ] (Optional) Set up Stripe test keys for payment testing
- [ ] (Optional) Set up Mailtrap for email testing
