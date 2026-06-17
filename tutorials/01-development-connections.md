# 01. Development Connections — TicketSpace

> Guide to setting up free-tier cloud services for remote development. Since we are skipping local database installations, we will use real cloud implementations with free tiers to ensure parity with production.

---

## 1. Remote Database (MySQL)

Since TicketSpace is currently configured for MySQL (via PDO), we need a cloud MySQL database with a free tier.

### Recommended Provider: Aiven (Free Tier)
Aiven offers a completely free, managed MySQL database that is perfect for development.

**Setup Steps:**
1. Sign up at [Aiven.io](https://console.aiven.io/signup).
2. Create a new project.
3. Click **Create Service** and select **MySQL**.
4. Select the **Free Plan** (available in specific regions like DigitalOcean or AWS).
5. Once provisioned, copy the connection details (Host, Port, User, Password, Database Name).

**Alternatively: Clever Cloud (Free Tier)**
1. Sign up at [Clever Cloud](https://www.clever-cloud.com/).
2. Create an add-on -> **MySQL**.
3. Choose the "DEV" plan (free, 10MB limit - enough for initial structure and testing).
4. Get the connection URI.

### Update `.env` with Cloud Credentials:
```env
DB_HOST=mysql-xxxx-your-project.aivencloud.com
DB_PORT=25060
DB_NAME=defaultdb
DB_USER=avnadmin
DB_PASS=your_secure_cloud_password
DB_CHARSET=utf8mb4
```

> **Note:** If you prefer to switch to **PostgreSQL** (e.g., Supabase or Render free tiers), we will need to update the `PDO` connection string in `backend/src/Utils/Database.php` from `mysql:host=...` to `pgsql:host=...`. Let me know if you want to make this architectural switch.

---

## 2. Remote Backend Hosting (PHP API)

If you don't want to run PHP locally at all, you can deploy the backend to a free cloud provider.

### Recommended Provider: Render or Railway
Both offer free tiers for web services, though they are Docker-based. Alternatively, since you mentioned Hostinger for production, you can set up a "staging" subdomain on your Hostinger account right now.

**Staging on Hostinger (Recommended):**
1. Go to your Hostinger hPanel.
2. Create a subdomain: `api-dev.ticketspace.es`.
3. Upload the `backend/` folder there.
4. Run Composer install via SSH or upload the `vendor/` folder.
5. Set up your `.env` there pointing to your cloud MySQL.
6. The frontend can be run locally (or deployed to Vercel/Netlify) pointing to this API.

---

## 3. Frontend Deployment (React SPA)

To test the frontend without running Node locally:

### Recommended Provider: Vercel (Free)
Vercel is the easiest way to host a Vite + React app for free.

**Setup Steps:**
1. Sign up at [Vercel.com](https://vercel.com) using your GitHub account.
2. Click **Add New Project** and select your `ticketspace` private repository.
3. Vercel will auto-detect Vite. 
4. Add the Environment Variable for your backend API:
   ```env
   VITE_API_URL=https://api-dev.ticketspace.es/api/v1
   ```
5. Click **Deploy**.

---

## 4. Other Services (Stripe, Email)

As outlined in the Connections Guide, these services are already remote by nature:

- **Stripe:** Use the Stripe Dashboard to get your test keys (`pk_test_...` and `sk_test_...`).
- **SMTP Email:** Use a free tier of SendGrid, Resend, or Mailtrap, OR use your Hostinger email account.

### Mailtrap (Free Email Testing)
Instead of sending real emails during development:
1. Sign up at [Mailtrap.io](https://mailtrap.io).
2. Go to Email Testing -> Inboxes.
3. Copy the SMTP credentials and update `.env`:
```env
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_ENCRYPTION=tls
SMTP_USER=your_user
SMTP_PASS=your_pass
```

---

## Summary of Next Actions

To start remote development right now without local installs:
1. **Database:** Register for Aiven MySQL and paste the credentials into `.env`.
2. **Migrations:** I can run the migrations against that remote database directly from my environment if you provide the credentials, or you can run `php migrations/migrate.php` from Hostinger SSH.
3. **API:** Upload backend to Hostinger `api-dev`.
4. **Frontend:** Deploy to Vercel and point it to `api-dev`.
