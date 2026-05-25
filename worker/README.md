# O2O Engine Worker

Cloudflare Worker backend for O2O Engine. This service holds your OpenAI API key, enforces billing and quotas, persists versioned systems, and proxies Markdown/PDF exports.

Generation modes:

- `mode: "fast"` (default): GPT construction pipeline + O2O Quality Gate.
- `mode: "deep"`: accepted for backward compatibility and mapped to the same GPT pipeline.

## Endpoints

- `GET /api/health`
- `GET /api/account`
- `POST /api/access/activate`
- `POST /api/billing/webhook/lemon`
- `GET /api/monday-morning`
- `GET /api/systems`
- `GET /api/systems/:id`
- `POST /api/systems/:id/next-actions`
- `GET /api/systems/:id/export?format=markdown`
- `GET /api/systems/:id/export?format=pdf`
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

Recruitment outputs also include `recruitment_operating_system.blind_spot_diagnosis` before persona/sourcing artifacts:

- `stated_need`
- `likely_real_need`
- `false_assumptions[]`
- `hidden_failure_modes[]`
- `wrong_candidate_risks[]`
- `missing_success_definition[]`
- `compensation_or_level_mismatch[]`
- `passive_candidate_reality`
- `corrected_search_thesis`

## Request Contract

### `POST /api/build`

```json
{
  "idea": "I want to turn our messy onboarding process into an AI-assisted operating system",
  "mode": "fast",
  "title": "Optional system title",
  "verticalFocus": "Recruitment / Headhunting",
  "demoMode": true,
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

`mode` is optional. If omitted, backend defaults to `"fast"`.

`imageContext` is optional. Supported types: PNG, JPEG, WebP, GIF up to 2 MB.

Deterministic identity can be provided via header:

- `x-o2o-user-id: <stable_user_id>`

When billing is enforced, include the subscriber session token:

- `Authorization: Bearer <session_token>`

### `POST /api/refine`

```json
{
  "systemId": "sys_abc123",
  "versionNumber": 1,
  "mode": "fast",
  "command": "Turn this into SOPs for a 3-person team",
  "userDeltaContext": "Keep tool stack to Notion and Slack"
}
```

Refine is version-locked. If `versionNumber` is stale, the API returns `409` with `latest_version_number`.

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

### `GET /api/monday-morning`

Returns last active system summary plus overdue/upcoming next actions for the resolved user identity.

### `GET /api/systems`

Returns the user system index with metadata and latest version numbers.

### `GET /api/systems/:id`

Returns latest persisted system JSON, metadata, current version number, and next actions.

### `POST /api/systems/:id/next-actions`

```json
{
  "actions": [
    {
      "description": "Source 25 candidates from adjacent profile list",
      "owner": "Recruiter",
      "due_date": "2026-05-31",
      "status": "todo"
    }
  ]
}
```

### `GET /api/systems/:id/export`

- `?format=markdown` streams text/markdown
- `?format=pdf` streams `application/pdf` using `PDF_EXPORT_SERVICE_URL`

## Deploy

1. Install dependencies.
2. Copy `wrangler.toml.example` to `wrangler.toml`.
3. Set `ALLOWED_ORIGIN` to your GitHub Pages origin.
4. Set secret:
   - `wrangler secret put OPENAI_API_KEY`
   - `wrangler secret put SESSION_SIGNING_SECRET`
   - Optional: `wrangler secret put LEMON_WEBHOOK_SECRET`
5. Bind `SUBSCRIBER_KV` in `wrangler.toml`.
6. Bind `SYSTEM_MEMORY_KV` in `wrangler.toml` (recommended).
   - If not bound, system memory falls back to `SUBSCRIBER_KV`.
7. Optional: bind `RATE_LIMIT_KV` in `wrangler.toml`.
8. Set `PDF_EXPORT_SERVICE_URL` to your Puppeteer service URL for PDF exports.
9. Deploy:
   - `npm run deploy`

## Local dev

- `npm run dev`
- Health check: `http://localhost:8787/api/health`
