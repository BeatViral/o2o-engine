# O2O Engine Deploy Checklist

## 0) GitHub Repo Connect

- [ ] In `o2o-engine`: `git remote add origin https://github.com/<your-user>/<your-repo>.git`
- [ ] In `o2o-engine`: `git branch -M main`
- [ ] In `o2o-engine`: `git push -u origin main`
- [ ] Confirm Actions tab shows 2 workflows:
- [ ] `Deploy Frontend to GitHub Pages`
- [ ] `Deploy Worker to Cloudflare`

## 1) Cloudflare Worker

- [ ] In `o2o-engine/worker`: run `npm install`
- [ ] Copy `wrangler.toml.example` to `wrangler.toml`
- [ ] Set `ALLOWED_ORIGIN` to your GitHub Pages URL
- [ ] Run `wrangler secret put OPENAI_API_KEY`
- [ ] Run `wrangler secret put SESSION_SIGNING_SECRET`
- [ ] Optional: run `wrangler secret put LEMON_WEBHOOK_SECRET`
- [ ] Create KV and bind `SUBSCRIBER_KV`
- [ ] Create KV and bind `SYSTEM_MEMORY_KV` (recommended)
- [ ] Optional: create KV and bind `RATE_LIMIT_KV`
- [ ] Set `BILLING_ENFORCED = "true"` when paywall lock is ready
- [ ] Set `LEMON_VARIANT_PLAN_MAP` with your Lemon variant IDs
- [ ] Optional: set `CHECKOUT_URL_STARTER`, `CHECKOUT_URL_PRO`, `CHECKOUT_URL_SCALE`
- [ ] Set `PDF_EXPORT_SERVICE_URL` to deployed Puppeteer service URL
- [ ] Run `npm run deploy`
- [ ] Copy worker URL

## 2) PDF Export Service

- [ ] In `o2o-engine/pdf-export-service`: run `npm install`
- [ ] Start locally with `npm run start` and verify `GET /health`
- [ ] Deploy service and capture live base URL
- [ ] Confirm Worker `PDF_EXPORT_SERVICE_URL` points to this URL

## 3) Frontend Config

- [ ] Open `o2o-engine/frontend/env.js`
- [ ] Paste worker URL into `apiBase`
- [ ] Optional: set `checkoutUrls` values for upgrade links
- [ ] Commit and push `frontend/env.js`

## 4) Lemon Squeezy Webhook

- [ ] In Lemon Squeezy, point webhook URL to `/api/billing/webhook/lemon`
- [ ] Enable subscription create/update/cancel events
- [ ] Test webhook and confirm subscriber record sync

## 5) GitHub Pages

- [ ] Push frontend files to the branch/folder used by Pages
- [ ] Enable GitHub Pages in repository settings
- [ ] In repo secrets, set `CLOUDFLARE_API_TOKEN`
- [ ] In repo secrets, set `CLOUDFLARE_ACCOUNT_ID`
- [ ] Open your live URL

## 6) Post-Deploy Validation

- [ ] `GET /api/health` returns ok
- [ ] `GET /api/account` returns billing mode + auth status
- [ ] `POST /api/access/activate` accepts valid buyer code
- [ ] Build request returns a persisted system with `system_id` and `version_number`
- [ ] Refine with `systemId` + `versionNumber` updates revision number
- [ ] Refine with stale `versionNumber` returns `409` and `latest_version_number`
- [ ] `GET /api/monday-morning` returns last active summary and next actions
- [ ] `GET /api/systems` and `GET /api/systems/:id` return persisted records
- [ ] `GET /api/systems/:id/export?format=markdown` streams markdown
- [ ] `GET /api/systems/:id/export?format=pdf` downloads PDF
- [ ] CORS only allows your GitHub Pages origin
