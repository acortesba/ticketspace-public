# TicketSpace

> **Digital event ticketing platform** — Create, sell, and validate event tickets with secure QR codes, digital wallet integration, and real-time analytics.

**Domain:** [ticketspace.es](https://ticketspace.es)

---

## Features

- **Event Management** — Create and manage events with multiple ticket types (general admission, seated, VIP, time-slot, season passes)
- **Secure QR Tickets** — Cryptographically unique QR codes with server-side validation and anti-fraud protection
- **Payment Processing** — Stripe, PayPal, and SEPA bank transfer support
- **Digital Wallets** — Add tickets to Apple Wallet and Google Wallet
- **Email Delivery** — Automatic ticket delivery via email with branded templates
- **QR Scanner** — Browser-based scanner for event staff at the door
- **Role-Based Access** — 5 user roles: Super Admin, Admin, Host, Staff, Buyer
- **Full Ticket Lifecycle** — Reserved → Pending Payment → Paid → Active → Checked-In → Used → Expired + Cancelled/Refunded
- **Multi-Language** — English and Spanish, with i18n architecture ready for more
- **Audit Logging** — Complete trail of all system actions for security and compliance
- **Glassmorphism UI** — Premium crystal-clear glass design with dark mode

---

## Tech Stack

| Layer | Technology |
|:---|:---|
| Frontend | React 18, Vite 6, React Router, react-i18next |
| Backend | PHP 8.2+ (vanilla, no framework) |
| Database | MySQL 8.0 |
| Payments | Stripe SDK, PayPal REST API |
| QR Codes | endroid/qr-code |
| Email | PHPMailer + SMTP |
| Wallets | php-pkpass (Apple), Google Wallet API |
| Auth | JWT (firebase/php-jwt) |

---

## Project Structure

```
├── frontend/          ← React SPA (Vite)
├── backend/           ← PHP REST API
├── docs/              ← Documentation
├── tutorials/         ← Setup & deployment guides
├── CHANGELOG.md
├── LICENSE
└── README.md
```

---

## Local Development Setup

See [tutorials/01-local-development-setup.md](tutorials/01-local-development-setup.md) for detailed instructions.

### Quick Start

**Prerequisites:** PHP 8.2+, MySQL 8.0+, Node.js 18+, Composer 2.x

```bash
# 1. Clone the repository
git clone git@github.com:acortesba/ticketspace.git
cd ticketspace

# 2. Backend setup
cd backend
cp .env.example .env       # Edit with your database credentials
composer install
php migrations/migrate.php  # Run database migrations

# 3. Frontend setup
cd ../frontend
npm install
npm run dev                 # Starts dev server at http://localhost:5173

# 4. Start PHP dev server (separate terminal)
cd ../backend
php -S localhost:8000 -t public
```

---

## Documentation

- [01. App Overview](docs/01-app-overview.md) — Features, architecture, and design decisions
- [02. Technical Deep Dive](docs/02-technical-deepdive.md) — Code walkthrough with snippets
- [03. Design System](docs/03-design-system.md) — Colors, typography, components
- [04. Performance & SEO](docs/04-performance-seo-analysis.md) — Optimization and metrics

---

## License

[MIT](LICENSE)
