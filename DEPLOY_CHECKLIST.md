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
- [ ] Optional: create KV and bind `RATE_LIMIT_KV`
- [ ] Set `BILLING_ENFORCED = "true"` when paywall lock is ready
- [ ] Set `LEMON_VARIANT_PLAN_MAP` with your Lemon variant IDs
- [ ] Optional: set `CHECKOUT_URL_STARTER`, `CHECKOUT_URL_PRO`, `CHECKOUT_URL_SCALE`
- [ ] Run `npm run deploy`
- [ ] Copy worker URL

## 2) Frontend Config

- [ ] Open `o2o-engine/frontend/env.js`
- [ ] Paste worker URL into `apiBase`
- [ ] Optional: set `checkoutUrls` values for upgrade links
- [ ] Commit and push `frontend/env.js`

## 3) Lemon Squeezy Webhook

- [ ] In Lemon Squeezy, point webhook URL to `/api/billing/webhook/lemon`
- [ ] Enable subscription create/update/cancel events
- [ ] Test webhook and confirm subscriber record sync

## 4) GitHub Pages

- [ ] Push frontend files to the branch/folder used by Pages
- [ ] Enable GitHub Pages in repository settings
- [ ] In repo secrets, set `CLOUDFLARE_API_TOKEN`
- [ ] In repo secrets, set `CLOUDFLARE_ACCOUNT_ID`
- [ ] Open your live URL

## 5) Post-Deploy Validation

- [ ] `GET /api/health` returns ok
- [ ] `GET /api/account` returns billing mode + auth status
- [ ] `POST /api/access/activate` accepts valid buyer code
- [ ] Build request returns a System Card
- [ ] Refine command updates revision number
- [ ] CORS only allows your GitHub Pages origin
