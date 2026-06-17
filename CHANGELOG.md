# Changelog

All notable changes to the TicketSpace project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.3] - 2026-06-18

### Changed
- Layout: Enforced strict `100dvh` no-scroll layout system across all pages.
- Layout: Navbar changed from `position: fixed` to a relative flex item (`shrink-0`) so the content area always fills the exact remaining viewport height.
- CSS: Added `--navbar-height: 64px` token and new `.page-content` utility class with design-system-aware padding (`--space-lg` × `--space-md`).
- CSS: `100vw` replaced with `100%` throughout to prevent Windows scrollbar overflow artifacts.
- CSS: Added `min-height: 0` to flex children to allow correct shrinking behavior.
- Pages: `Landing`, `Login`, `Register` completely rewritten to fit within the single-screen constraint.
- Docs: Updated `03-design-system.md` to document the new layout patterns.

## [0.1.2] - 2026-06-17

### Added
- Architecture: Switched to remote Vercel deployment for frontend React SPA to skip local testing and ensure production parity.
- Architecture: Switched to Hostinger Premium Shared Hosting with remote MySQL cluster for backend testing.
- Backend: Added root `.htaccess` file to automatically route subdomain traffic into the `public/index.php` entry point on Hostinger.
- Backend: Generated pure SQL schema (`migrations/schema.sql`) for bypassing local PHP dependencies and importing directly via phpMyAdmin.
- Tutorial: Added `01-development-connections.md` to document the remote free-tier services used for staging.

## [0.1.1] - 2026-06-15

### Added
- Documentation: Full App Overview (`docs/01-app-overview.md`) — architecture, ticket lifecycle, payment flow, QR security, RBAC.
- Documentation: Technical Deep Dive (`docs/02-technical-deepdive.md`) — code-level walkthrough of every backend module.
- Documentation: Design System (`docs/03-design-system.md`) — glassmorphism tokens, components, layout patterns.
- Documentation: Performance & SEO Analysis (`docs/04-performance-seo-analysis.md`) — build stats, optimization strategies.
- Tutorial: Connections Guide (`tutorials/00-connections-guide.md`) — step-by-step setup for PHP, MySQL, Stripe, PayPal, SMTP, Apple/Google Wallet, Hostinger, and GitHub.
- Created missing `backend/storage/` directories with `.gitkeep` files (`qrcodes/`, `cache/`, `rate_limits/`, `logs/`).
- Created `backend/public/uploads/.gitkeep` for user-uploaded files.
- Created `docs/` and `tutorials/` directories.

### Fixed
- Added `backend/certs/` and `backend/storage/logs/` to `.gitignore` for security.
- Updated CHANGELOG to reflect documentation and infrastructure additions.

### Changed
- Git repository initialized and first working version pushed to `development` branch on `acortesba/ticketspace`.

## [0.1.0] - 2026-06-14

### Added
- Initial project scaffolding with backend (PHP) and frontend (React + Vite) structure.
- `.gitignore` configured for PHP, Node.js, IDE, and OS files.
- `.env.example` with all configuration variables documented.
- `README.md` with project overview and setup instructions.
- `LICENSE` file (MIT).
- Backend: Composer configuration with all dependencies (`endroid/qr-code`, `firebase/php-jwt`, `phpmailer/phpmailer`, `stripe/stripe-php`, `tschoffelen/php-pkpass`).
- Backend: PSR-4 autoloading via Composer.
- Backend: Configuration system (`Config/App.php`, `Config/Database.php`).
- Backend: Database connection singleton with PDO (`Utils/Database.php`).
- Backend: Custom lightweight router with method and middleware support (`Routes/Router.php`).
- Backend: API entry point with `.htaccess` rewrite rules (`public/index.php`).
- Backend: Response helper for standardized JSON responses (`Utils/Response.php`).
- Backend: Input validator with extensible rule system (`Utils/Validator.php`).
- Backend: PSR-3 compatible file logger (`Utils/Logger.php`).
- Backend: Input sanitizer utility (`Utils/Sanitizer.php`).
- Backend: CORS middleware with configurable allowed origins (`Middleware/CORSMiddleware.php`).
- Backend: JWT authentication middleware (`Middleware/AuthMiddleware.php`).
- Backend: File-based rate limiting middleware (`Middleware/RateLimitMiddleware.php`).
- Backend: Role-Based Access Control middleware (`Middleware/RBACMiddleware.php`).
- Backend: Base Model class with common CRUD operations (`Models/BaseModel.php`).
- Backend: User model with authentication methods (`Models/User.php`).
- Backend: Role model (`Models/Role.php`).
- Backend: Auth controller with register, login, logout, refresh, password reset, email verification (`Controllers/AuthController.php`).
- Backend: User controller with profile management (`Controllers/UserController.php`).
- Backend: Route definitions for auth and user endpoints (`Routes/api.php`).
- Backend: Email service with PHPMailer and HTML templates (`Services/EmailService.php`).
- Backend: i18n locale files for EN and ES (`Locales/en.json`, `Locales/es.json`).
- Database: Full initial migration with 17 tables — users, roles, permissions, user_roles, role_permissions, events, ticket_types, tickets, ticket_state_history, ticket_scans, payments, payment_refunds, event_staff, audit_log, app_settings, sessions, email_templates.
- Database: Seed data with 5 roles, 20+ permissions, and default app settings.
- Frontend: Vite + React 18 project initialized.
- Frontend: Glassmorphism design system with CSS custom properties.
- Frontend: Core glass components — GlassCard, GlassButton, GlassInput, GlassModal.
- Frontend: Layout components — Navbar, PageLayout.
- Frontend: Auth context provider with JWT token management.
- Frontend: API service layer with interceptors and token refresh.
- Frontend: i18n setup with react-i18next (EN/ES).
- Frontend: React Router with protected routes and role-based guards.
- Frontend: Login and Register pages with glass UI.
- Frontend: Landing page shell with hero section.
- Frontend: Toast notification system.
- Documentation folder structure created (`docs/`).
- Tutorials folder structure created (`tutorials/`).
