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
- [ ] Optional: create KV and bind `RATE_LIMIT_KV`
- [ ] Run `npm run deploy`
- [ ] Copy worker URL

## 2) Frontend Config

- [ ] Open `o2o-engine/frontend/env.js`
- [ ] Paste worker URL into `apiBase`
- [ ] Commit and push `frontend/env.js`

## 3) GitHub Pages

- [ ] Push frontend files to the branch/folder used by Pages
- [ ] Enable GitHub Pages in repository settings
- [ ] In repo secrets, set `CLOUDFLARE_API_TOKEN`
- [ ] In repo secrets, set `CLOUDFLARE_ACCOUNT_ID`
- [ ] Open your live URL

## 4) Post-Deploy Validation

- [ ] `GET /api/health` returns ok
- [ ] Build request returns a System Card
- [ ] Refine command updates revision number
- [ ] CORS only allows your GitHub Pages origin
