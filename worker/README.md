# O2O Engine Worker

Cloudflare Worker backend for O2O Engine. This service holds your OpenAI API key and exposes two endpoints to the static GitHub Pages frontend.

## Endpoints

- `GET /api/health`
- `GET /api/account`
- `POST /api/access/activate`
- `POST /api/billing/webhook/lemon`
- `POST /api/build`
- `POST /api/refine`

## Response Guarantees

Each generated system includes a strict `responsibility_contract` object with:

- `decision_support_mode` (context-attached decision support)
- `context_attachment_checks`
- `constraint_acknowledgement`
- `smallest_safe_test`
- `non_prescriptive_notice`
- `escalation_triggers`

## Request Contract

### `POST /api/build`

```json
{
  "idea": "I want to turn our messy onboarding process into an AI-assisted operating system",
  "opportunityTypeHint": "Auto",
  "stage": "Discovery",
  "goal": "Build Full OS",
  "constraints": "2 people, 20 hours per week, no new headcount",
  "context": "B2B SaaS onboarding for enterprise clients",
  "imageContext": {
    "fileName": "onboarding-board.jpg",
    "mimeType": "image/jpeg",
    "dataUrl": "data:image/jpeg;base64,/9j/4AAQSk..."
  },
  "allowAssumptions": true
}
```

`imageContext` is optional. Supported types: PNG, JPEG, WebP, GIF up to 2 MB.

When billing is enforced, include the subscriber session token:

- `Authorization: Bearer <session_token>`

### `POST /api/refine`

```json
{
  "command": "Turn this into SOPs for a 3-person team",
  "userDeltaContext": "Keep tool stack to Notion and Slack",
  "currentSystem": { "...": "previous response object" }
}
```

### `POST /api/access/activate`

```json
{
  "accessCode": "O2O-ABCD-1234"
}
```

Returns a signed session token plus the account usage snapshot.

### `GET /api/account`

Returns whether billing is enforced, whether the request is authenticated, and plan usage/limits when available.

### `POST /api/billing/webhook/lemon`

Use this as your Lemon Squeezy webhook target. If `LEMON_WEBHOOK_SECRET` is set, signature verification is enforced.

## Deploy

1. Install dependencies.
2. Copy `wrangler.toml.example` to `wrangler.toml`.
3. Set `ALLOWED_ORIGIN` to your GitHub Pages origin.
4. Set secret:
   - `wrangler secret put OPENAI_API_KEY`
  - `wrangler secret put SESSION_SIGNING_SECRET`
  - Optional: `wrangler secret put LEMON_WEBHOOK_SECRET`
5. Bind `SUBSCRIBER_KV` in `wrangler.toml`.
6. Optional: bind `RATE_LIMIT_KV` in `wrangler.toml`.
7. Deploy:
   - `npm run deploy`

## Local dev

- `npm run dev`
- Health check: `http://localhost:8787/api/health`
