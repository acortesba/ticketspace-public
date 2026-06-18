# Connections Guide — TicketSpace

> Step-by-step instructions to connect external services required to run and test TicketSpace.
> **Note**: Infrastructure (Hostinger API + Database, Vercel Frontend) is already configured and live!

---

## Table of Contents

1. [Stripe (Payments)](#1-stripe-payments)
2. [PayPal (Payments)](#2-paypal-payments)
3. [SMTP Email (Hostinger)](#3-smtp-email-hostinger)
4. [Apple Wallet (Passes)](#4-apple-wallet-passes)
5. [Google Wallet (Passes)](#5-google-wallet-passes)
6. [Environment Variables Reference](#6-environment-variables-reference)

---

## 1. Stripe (Payments)

### 1.1 Create a Stripe Account
1. Sign up at [stripe.com](https://stripe.com)
2. Complete the onboarding (you can skip identity verification for test mode).

### 1.2 Get API Keys
1. Go to **Dashboard → Developers → API Keys**
2. Copy your **test** keys:
   - `Publishable key` → starts with `pk_test_`
   - `Secret key` → starts with `sk_test_`

### 1.3 Configure in `.env`

```env
STRIPE_PUBLIC_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
```

### 1.4 Set Up Webhooks (for payment confirmation)
1. Go to **Developers → Webhooks → Add Endpoint**
2. Set the endpoint URL: `https://api.ticketspace.es/api/v1/payments/webhook`
3. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Copy the **webhook signing secret** → starts with `whsec_`

```env
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 1.5 Test Cards
| Card Number | Scenario |
|:------------|:---------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Declined |
| `4000 0000 0000 3220` | 3D Secure required |

---

## 2. PayPal (Payments)

### 2.1 Create a PayPal Developer Account
1. Go to [developer.paypal.com](https://developer.paypal.com/)
2. Log in with your PayPal account (or create one).

### 2.2 Create a Sandbox App
1. Go to **Dashboard → My Apps & Credentials**
2. Select **Sandbox** tab
3. Click **Create App**
4. Name it `TicketSpace Dev`
5. Copy the **Client ID** and **Secret**

### 2.3 Configure in `.env`

```env
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
PAYPAL_MODE=sandbox
```

---

## 3. SMTP Email (Hostinger)

### 3.1 Create an Email Account on Hostinger
1. Log in to [hpanel.hostinger.com](https://hpanel.hostinger.com/)
2. Go to **Emails → Email Accounts** under your `ticketspace.es` domain.
3. Create an email account: `noreply@ticketspace.es`
4. Set a strong password.

### 3.2 Configure in `.env`

```env
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_ENCRYPTION=ssl
SMTP_USER=noreply@ticketspace.es
SMTP_PASS=your_email_password
SMTP_FROM_EMAIL=noreply@ticketspace.es
SMTP_FROM_NAME=TicketSpace
```

---

## 4. Apple Wallet (Passes)

> **Requires**: Apple Developer Account ($99/year)

### 4.1 Create a Pass Type ID
1. Go to [developer.apple.com/account](https://developer.apple.com/account)
2. Navigate to **Certificates, Identifiers & Profiles → Identifiers**
3. Click **+** and select **Pass Type IDs**
4. Set Identifier: `pass.es.ticketspace.ticket`

### 4.2 Create a Pass Certificate
1. Select your new Pass Type ID and click **Create Certificate**.
2. Generate a CSR from your Mac's Keychain Access.
3. Upload the CSR, download the certificate (`.cer`), and import it.
4. Export as `.p12` with a password.

### 4.3 Configure in `.env`

```env
APPLE_PASS_TYPE_ID=pass.es.ticketspace.ticket
APPLE_TEAM_ID=YOUR_10_CHAR_TEAM_ID
APPLE_CERT_PATH=certs/pass.p12
APPLE_CERT_PASS=your_certificate_password
APPLE_WWDR_CERT_PATH=certs/wwdr.pem
```

---

## 5. Google Wallet (Passes)

### 5.1 Create a Google Cloud Project
1. Go to [console.cloud.google.com](https://console.cloud.google.com/)
2. Create project `TicketSpace` and enable **Google Wallet API**.

### 5.2 Create a Service Account
1. Go to **IAM & Admin → Service Accounts**
2. Create account `ticketspace-wallet`.
3. Create a JSON key and download it.

### 5.3 Configure in `.env`

```env
GOOGLE_WALLET_ISSUER_ID=1234567890
GOOGLE_WALLET_SERVICE_ACCOUNT_KEY=certs/google-wallet-key.json
```

---

## 6. Environment Variables Reference

| Variable | Required | Default | Description |
|:---------|:---------|:--------|:------------|
| `APP_URL` | Yes | — | Public URL |
| `DB_HOST` | Yes | localhost | MySQL host |
| `DB_NAME` | Yes | — | Database name |
| `DB_USER` | Yes | — | Database user |
| `DB_PASS` | Yes | — | Database password |
| `JWT_SECRET` | Yes | — | 256-bit hex secret |
| `STRIPE_PUBLIC_KEY` | Yes* | — | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Yes* | — | Stripe secret key |
| `PAYPAL_CLIENT_ID` | Yes* | — | PayPal app client ID |
| `SMTP_HOST` | Yes | — | SMTP server hostname |

---

## Connection & Setup Checklist

- `[x]` Set up Hostinger MySQL Database remotely
- `[x]` Install Composer & Node.js dependencies
- `[x]` Generate and set `JWT_SECRET`
- `[x]` Set up backend architecture (now under `/api/` folder)
- `[x]` Deploy frontend to Vercel (`ticketspace.vercel.app`)
- `[x]` Deploy backend to Hostinger (`api.ticketspace.es/api/v1`)
- `[ ]` Configure Stripe test keys for payment routing
- `[ ]` Configure PayPal test keys
- `[ ]` Configure Hostinger SMTP email
- `[ ]` Configure Apple Wallet Certificates
- `[ ]` Configure Google Wallet Issuer API
