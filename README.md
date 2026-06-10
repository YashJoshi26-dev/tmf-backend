# Saree Showroom — Backend

Modular Node.js + Express + MongoDB API for a luxury saree e-commerce platform.
Inventory is driven by **CSV uploads** and an optional **Google Sheets sync**, so non-technical staff can manage 2500+ products from a spreadsheet.

Pairs with the React + Vite frontend (saree-showroom-frontend).

---

## Quick start

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
# edit .env — set MONGO_URI, JWT secrets, CLIENT_URL, SMTP, Cloudinary (min required)

# 3. Make sure MongoDB is running locally (or use Atlas via MONGO_URI)

# 4. Seed sample data
npm run seed

# 5. Run
npm run dev
```

- API:     `http://localhost:5000/api/v1`
- Docs:    `http://localhost:5000/api-docs`
- Health:  `http://localhost:5000/health`

Or via Docker: `docker compose up --build`

## Default credentials (after seed)

| Role  | Email                | Password    |
|-------|----------------------|-------------|
| Admin | admin@example.com    | Admin@1234  |

Coupons: `WELCOME10` (10% off, min ₹1500), `FESTIVE25` (25% off, min ₹5000).

---

## Architecture

```
src/
├── app.js                  # Express assembly (security → webhooks → JSON → routes → errors)
├── server.js               # bootstrap (db, sockets, cron, graceful shutdown)
│
├── config/                 # env (Joi-validated), db, redis stub, cloudinary, razorpay, cors
├── modules/                # ONE FOLDER PER DOMAIN — controller, service, model, validation, routes
│   ├── auth/               # email/password + OTP, refresh rotation, reset
│   ├── users/              # profile, addresses
│   ├── categories/         # tree (parent/child)
│   ├── products/           # variants, sizes, reviews aggregate
│   ├── inventory/          # CSV/Sheets sync — biggest module
│   │   ├── csv/            # parse, validate, preview, chunk, image map, failed-rows
│   │   ├── sync/           # google sheet, stock-only sync, cache invalidate
│   │   ├── jobs/           # cron + queue handler
│   │   ├── queues/         # thin queue wrappers
│   │   ├── models/         # ImportLog, ProductHistory
│   │   └── helpers/        # SKU, slug, stock, bulkWrite
│   ├── cart/               # server-side price re-verification
│   ├── wishlist/
│   ├── orders/             # transactional stock decrement, state machine
│   ├── payments/           # Razorpay integration + webhook
│   ├── reviews/            # 1-per-user, verified-purchase flag
│   ├── coupons/            # percent off, usage limits, min order
│   ├── banners/            # hero/mid/footer scheduled banners
│   ├── analytics/          # admin dashboard aggregations
│   ├── notifications/      # email + sms + whatsapp + push (stubs where needed)
│   └── admin/              # cross-module overview
│
├── middleware/             # auth, admin, upload (image+csv), validate, errors, rate limit, security
├── services/               # shared cross-module: jwt, otp, upload, cache, queue, search
├── routes/                 # top-level: index, health, webhooks
├── sockets/                # stubs (real-time order/inventory events) — ready for Socket.IO
├── docs/                   # Swagger
└── utils/                  # ApiError, ApiResponse, asyncHandler, logger, pagination, validators
```

**Layering rules:**
- Controllers parse `req`, call services, hand result to `ApiResponse`. No business logic.
- Services take plain args, throw `ApiError`. No `req`/`res`.
- Repositories own DB access. Services don't directly touch Mongoose where avoidable.
- Models are pure schema + instance methods.

This makes every service trivially unit-testable.

---

## Inventory: CSV / Google Sheets

The interesting bit. Three flows are supported:

### 1. CSV upload (admin UI)

```
GET  /api/v1/inventory/template       → download blank CSV with sample row
POST /api/v1/inventory/preview        → upload CSV, get row-by-row validation result
POST /api/v1/inventory/upload         → run the import (sync=true to block, false to queue)
POST /api/v1/inventory/stock          → bulk stock-only updates: [{sku, qty}]
```

The response includes a **`failedCsvBase64`** field with rows that failed validation — admin can decode, fix, and re-upload.

### 2. Google Sheet sync (master inventory)

1. Build a sheet with the columns in `GET /inventory/template`
2. **File → Share → Publish to web → CSV** — copy the link
3. Set `GOOGLE_SHEET_CSV_URL` in `.env`
4. Set `SYNC_ENABLED=true`
5. Either wait for cron (default every 5 min) or call `POST /api/v1/inventory/sync`

Sync is idempotent (`upsert` by SKU) — re-running with the same sheet won't duplicate.

### 3. Manual API (programmatic)

```
POST /products    (admin)
PATCH /products/:id
```

### Audit

Every import writes an `ImportLog` (visible at `GET /inventory/logs`).
Every product change writes a `ProductHistory` row.

---

## Auth

Two methods, both supported simultaneously:

- **Email + password**  → admins and customers who prefer it
- **Phone + OTP**       → primary customer flow in India

OTP provider: console (dev), MSG91, or Twilio — set `OTP_PROVIDER` in `.env`.
In dev with `OTP_PROVIDER=console`, the OTP code is printed to the server log.

JWT: 15m access + 30d refresh with rotation. Cookies are `httpOnly`/`secure` in prod.

---

## API surface

| Domain | Public | Authed | Admin |
|---|---|---|---|
| Auth        | `POST /auth/login`, `POST /auth/otp/send`, `POST /auth/otp/verify`, `POST /auth/refresh` | `/auth/logout`, `/auth/change-password` | — |
| Users       | — | `GET/PATCH /users/me`, addresses | — |
| Products    | `GET /products`, `GET /products/:id`, `GET /products/slug/:slug`, `GET /products/search` | — | `POST/PATCH/DELETE /products` |
| Categories  | `GET /categories`, `GET /categories/tree` | — | `POST/PATCH/DELETE /categories` |
| Inventory   | — | — | `/inventory/template`, `/preview`, `/upload`, `/sync`, `/logs`, `/stock` |
| Cart        | — | `GET/POST/DELETE /cart` | — |
| Wishlist    | — | `GET /wishlist`, `POST /wishlist/:productId` | — |
| Orders      | — | `POST /orders`, `GET /orders/mine`, `GET /orders/:id` | `GET /orders`, `PATCH /orders/:id/status` |
| Payments    | — | `POST /payments/razorpay/verify` | — |
| Webhooks    | `POST /webhooks/razorpay` (HMAC verified) | — | — |
| Reviews     | `GET /products/:productId/reviews` | `POST /products/:productId/reviews`, `PATCH/DELETE /reviews/:id` | — |
| Coupons     | — | `POST /coupons/apply` | `GET/POST/PATCH/DELETE /coupons` |
| Banners     | `GET /banners?position=hero` | — | `POST/PATCH/DELETE /banners` |
| Analytics   | — | — | `/analytics/summary`, `/sales`, `/top-products` |
| Admin       | — | — | `/admin/overview`, `/admin/users` |

Every response uses the same envelope:

```json
{ "success": true, "message": "...", "data": ..., "meta": { ... } }
```

---

## Security checklist

- Joi-validated env on boot
- bcrypt (12 rounds) for passwords
- JWT access short-lived, refresh rotated on use, `passwordChangedAt` invalidates older tokens
- Rate limits on auth (`10 / 15min`), OTP (`8 / hour`), email (`5 / hour`)
- Helmet, `express-mongo-sanitize`, `xss-clean`, `hpp`
- CORS allow-list (no wildcard)
- Razorpay signature verification before trusting any payment success
- Webhooks parse the raw body (HMAC verified)
- Server-side price re-verification on every cart save AND order creation
- Forgot-password is silent (no account enumeration)
- Docker image runs as non-root

---

## Pragmatic choices (worth knowing)

- **Redis** is stubbed with an in-memory Map — same API, swap to `ioredis` later
- **BullMQ** is stubbed with an in-process queue — jobs run inline, swap later
- **Sockets** are stubbed — calls to `emitToAdmin` log instead. Wire Socket.IO when you want real-time updates
- **Stripe** is stubbed (Razorpay primary for India). Slot exists.
- **WhatsApp & Push** are stubbed.

All four can be activated without changing any caller code — only the implementation file changes.

---

## Production checklist

- [ ] Generate strong secrets: `openssl rand -hex 32` for each `*_SECRET`
- [ ] Use MongoDB Atlas with TLS + a dedicated user
- [ ] `NODE_ENV=production`, behind nginx/Cloudflare with TLS
- [ ] Set real SMTP provider (SendGrid, SES, Postmark)
- [ ] Set real OTP provider (MSG91 cheapest for India)
- [ ] Configure Razorpay live keys + webhook URL
- [ ] Add real Redis if you have queue/cache load
- [ ] Set up uptime monitoring (UptimeRobot) + error tracking (Sentry)

## License

MIT
