# O2O Engine

O2O launches as O2O for Recruiters: a recruitment operating system generator that diagnoses blind spots before building sourcing and execution systems.

## Project Structure

- `frontend/` GitHub Pages static app
- `worker/` Cloudflare Worker API (OpenAI key stored as secret)
- `pdf-export-service/` Puppeteer Markdown-to-PDF service used by Worker export proxy
- `vertical-template/` Reusable blueprint for launching standalone O2O vertical apps

## What is Implemented

- Diagnosis engine (type, clarity, pathway)
- Routing engine (Discovery, Workflow, Full OS)
- Mandatory System Card contract
- Mandatory Responsibility Contract (context attachment, constraint acknowledgement, smallest safe test, escalation triggers)
- Structured consulting-grade output sections
- Clarification protocol with up to 5 questions
- Prioritization scoring labels
- Iteration loop to refine existing system
- Anti-generic grounding check
- Subscriber access menu with access-code activation
- Plan-based generation quotas and image upload limits
- Lemon Squeezy webhook sync endpoint for plan/status updates
- Deterministic user identity support (`x-o2o-user-id`)
- Version-locked refine flow with stale-version conflict protection (`409`)
- System memory routes (`/api/monday-morning`, `/api/systems`, system detail/actions/export)
- Worker-driven markdown and PDF export for persisted systems
- Mandatory recruiter blind-spot diagnosis layer with corrected search thesis

## Verticalization Template Saved

Recruitment is the first spearhead vertical.

Reusable templates for future standalone vertical apps are saved in `vertical-template/`:

- `vertical-template/vertical-app-template.json`
- `vertical-template/recruiters-reference.md`
- `vertical-template/industries-roadmap.md`

This keeps the parent O2O Engine architecture intact while allowing fast cloning for industry-specific apps.

## Responsibility Design

- The engine returns decision support, not blind prescriptions.
- Every output must surface known, assumed, and unknown information.
- Recommendations are constrained by user context and stated limitations.
- A smallest safe test is always included before scale actions.
- Escalation triggers are included for high-risk scenarios.

## Quick Start

1. Deploy Worker first.
2. Set frontend `env.js` with Worker URL.
3. Publish frontend folder to GitHub Pages.

## CI/CD Included

The project already includes automation workflows:

- `.github/workflows/deploy-pages.yml` deploys `frontend/` to GitHub Pages on push to `main`.
- `.github/workflows/deploy-worker.yml` deploys `worker/` to Cloudflare on push to `main`.

Required GitHub repository secrets for worker CI deploy:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

OpenAI key remains in Cloudflare Worker secrets (not GitHub). Set once using:

- `wrangler secret put OPENAI_API_KEY`

## Deploy Worker

1. Open terminal in `o2o-engine/worker`.
2. Install dependencies:
   - `npm install`
3. Copy config:
   - copy `wrangler.toml.example` to `wrangler.toml`
4. Edit this value in `wrangler.toml`:
   - `ALLOWED_ORIGIN = "https://YOUR_GITHUB_USERNAME.github.io"`
5. Configure billing/access vars in `wrangler.toml`:
   - `BILLING_ENFORCED = "true"` when you are ready to lock behind paywall
   - `LEMON_VARIANT_PLAN_MAP = "<starter_variant>:starter,<pro_variant>:pro,<scale_variant>:scale"`
   - Optional checkout links: `CHECKOUT_URL_STARTER`, `CHECKOUT_URL_PRO`, `CHECKOUT_URL_SCALE`
6. Bind KV namespaces:
   - Required: `SUBSCRIBER_KV` (subscriber records + monthly usage)
   - Recommended: `SYSTEM_MEMORY_KV` (persisted system versions + next actions)
   - Optional: `RATE_LIMIT_KV` (IP-level throttle)
7. Set secrets:
   - `wrangler secret put OPENAI_API_KEY`
   - `wrangler secret put SESSION_SIGNING_SECRET`
   - Optional for webhook verification: `wrangler secret put LEMON_WEBHOOK_SECRET`
8. Set Worker var for PDF export proxy:
   - `PDF_EXPORT_SERVICE_URL = "https://your-pdf-service.example.com"`
9. Deploy:
   - `npm run deploy`
10. Copy deployed workers.dev URL.

## Deploy PDF Export Service

1. Open terminal in `pdf-export-service`.
2. Install dependencies:
   - `npm install`
3. Start service:
   - `npm run start`
4. Verify health endpoint:
   - `GET /health`
5. Deploy to your host of choice, then set `PDF_EXPORT_SERVICE_URL` in Worker config.

## Configure Frontend

1. Open `frontend/env.js`.
2. Set:
   - `apiBase: "https://YOUR_WORKER_NAME.YOUR_SUBDOMAIN.workers.dev"`
   - Optional checkout links under `checkoutUrls` for upgrade buttons in the subscriber menu.
3. Save.

## Publish Frontend to GitHub Pages

Use one of these options:

- Option A: Upload `frontend` folder content to repo root and enable Pages from branch root.
- Option B: Keep folder structure and enable Pages from `/o2o-engine/frontend` if your repository setup supports it.

After publishing, open your site URL and click "Diagnose & Build System".

## Connect Git Remote

Run these in `o2o-engine` after you create the GitHub repo:

- `git remote add origin https://github.com/<your-user>/<your-repo>.git`
- `git branch -M main`
- `git push -u origin main`

## API Endpoints

- `GET /api/health`
- `GET /api/account`
- `POST /api/access/activate`
- `POST /api/billing/webhook/lemon`
- `POST /api/build`
- `POST /api/refine`
- `GET /api/monday-morning`
- `GET /api/systems`
- `GET /api/systems/:id`
- `POST /api/systems/:id/next-actions`
- `GET /api/systems/:id/export?format=markdown`
- `GET /api/systems/:id/export?format=pdf`

`POST /api/refine` now requires `systemId` and `versionNumber`.

## Security Notes

- OpenAI key is never in frontend code.
- Restrict CORS using `ALLOWED_ORIGIN`.
- Billing and usage enforcement happen server-side on every generation request.
- Subscriber sessions are signed using `SESSION_SIGNING_SECRET`.
- Lemon webhooks can be signature-verified with `LEMON_WEBHOOK_SECRET`.

## Suggested Next Upgrade

- Team auth + workspace sharing
- Export to Notion
- Background job queue for large generation workflows
