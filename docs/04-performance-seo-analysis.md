# 04. Performance & SEO Analysis — TicketSpace

> Optimization strategies for a shared-hosting PHP + React SPA deployment.

---

## Frontend Performance

### Build Optimization (Vite)

The Vite build uses manual chunk splitting to optimize loading:

```
dist/
├── index.html                    0.77 kB (gzip: 0.37 kB)
├── assets/index.css             16.14 kB (gzip: 4.50 kB)
├── assets/rolldown-runtime.js    0.69 kB (gzip: 0.42 kB)
├── assets/index.js              20.82 kB (gzip: 5.88 kB)  ← App code
├── assets/i18n.js               42.45 kB (gzip: 13.47 kB) ← i18n library
├── assets/modules.js            83.41 kB (gzip: 29.56 kB) ← Other node_modules
└── assets/vendor.js            226.88 kB (gzip: 73.39 kB) ← React + Router
```

**Total gzipped**: ~128 kB — Well within performance budget.

### Chunk Strategy
```javascript
manualChunks(id) {
  if (id.includes('node_modules')) {
    if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
      return 'vendor';    // Cached long-term — React rarely changes
    }
    if (id.includes('i18next') || id.includes('react-i18next')) {
      return 'i18n';      // Separate i18n chunk
    }
    return 'modules';     // All other deps
  }
}
```

### Font Loading
Google Fonts are loaded with `display=swap` to prevent FOIT (Flash of Invisible Text):
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono&display=swap');
```

### CSS Strategy
- **Tailwind CSS 3** with `@tailwind` directives — only used classes are included in the build (tree-shaken by PurgeCSS).
- **Custom properties** for theme tokens — runtime switchable without rebuild.
- **No CSS-in-JS** — zero runtime CSS processing cost.

---

## Backend Performance

### Database
- **Prepared statements** — Compiled once, executed many times by MySQL.
- **InnoDB engine** — Row-level locking, MVCC for concurrent reads.
- **Indexes** — Primary keys (auto-index), unique indexes on `uuid`, `email`, `token`, `slug`.
- **Connection pooling** — PDO singleton pattern ensures one connection per PHP request (no reconnect overhead).

### Rate Limiting
- File-based with `LOCK_EX` — avoids Redis/Memcached dependency.
- Files are small JSON blobs (~50 bytes), fast to read/write.
- Automatic cleanup via TTL checks on read.

### Response Compression
On Hostinger shared hosting, gzip compression is enabled at the Apache level via `mod_deflate`. No PHP-level compression needed.

---

## SEO Considerations

### SPA Limitations
React SPAs are client-rendered, which means search engine crawlers may not execute JavaScript. Current mitigations:

1. **Meta tags in `index.html`** — Title, description, and OG tags are set in the static HTML.
2. **Semantic HTML** — Proper heading hierarchy, landmarks, and ARIA attributes.
3. **Unique IDs** — All interactive elements have descriptive IDs for accessibility and testing.

### Future Improvements
| Enhancement | Impact | Priority |
|:------------|:-------|:---------|
| Pre-rendering (react-snap) | Crawlable HTML for key pages | Medium |
| SSR (Next.js migration) | Full SEO for dynamic pages | Low (later phase) |
| Sitemap.xml | Search engine discovery | Medium |
| robots.txt | Crawler directives | Low |
| Structured data (JSON-LD) | Rich search results for events | High |

### Recommended JSON-LD (future)
```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "Summer Festival 2026",
  "startDate": "2026-08-15T18:00:00+02:00",
  "location": {
    "@type": "Place",
    "name": "Estadio Municipal",
    "address": "Calle Principal 1, Madrid"
  },
  "offers": {
    "@type": "Offer",
    "price": "25.00",
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock",
    "url": "https://ticketspace.es/events/summer-festival"
  }
}
```

---

## Security Performance

| Protection | Implementation | Overhead |
|:-----------|:---------------|:---------|
| CORS | Middleware (header-only) | Negligible |
| Rate Limiting | File I/O (~1ms) | Very Low |
| JWT Verification | HMAC-SHA256 (~0.5ms) | Very Low |
| Argon2ID Hashing | ~200ms per hash | Only on register/login |
| Prepared Statements | Native PDO | Zero (faster than string concat) |
| Input Validation | PHP string ops | Negligible |

---

## Monitoring (Planned)

| Metric | Tool | Status |
|:-------|:-----|:-------|
| Error tracking | File logger (`Logger.php`) | ✅ Implemented |
| Uptime monitoring | External (UptimeRobot or similar) | 🔲 Not yet |
| API response times | Custom middleware timer | 🔲 Not yet |
| Database slow queries | MySQL slow query log | 🔲 Not yet |
| Frontend errors | `window.onerror` + API reporting | 🔲 Not yet |

---

## Deployment Architecture (Vercel + Hostinger)

TicketSpace uses a split deployment model for maximum performance and cost-efficiency:

### Frontend (Vercel)
The React SPA is deployed on Vercel, providing global CDN edge caching, automatic HTTPS, and CI/CD integration with GitHub.
1. Code pushed to the `development` or `main` branches automatically triggers a build (`npm run build`).
2. Vercel serves the static assets (`dist/`) globally.
3. Environment variables (like `VITE_API_URL`) are configured in the Vercel dashboard.

### Backend API (Hostinger)
The PHP REST API and MySQL database run on Hostinger shared hosting.
1. The `api/` folder is uploaded to the Hostinger file manager.
2. The `api/public` folder acts as the web root, hiding sensitive files like `.env` and `src/`.
3. `composer install --no-dev --optimize-autoloader` is run to build dependencies.
4. The database schema is initialized using `php migrations/migrate.php`.
5. An `.htaccess` at the root redirects all traffic to `public/index.php`.

### Caching Headers (Hostinger .htaccess)
```apache
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType font/woff2 "access plus 1 year"
</IfModule>
```

Vite appends content hashes to filenames (e.g., `vendor-CmHzj8aU.js`), so aggressive caching is safe — the filename changes when the content changes.
