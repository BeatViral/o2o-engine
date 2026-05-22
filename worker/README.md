# O2O Engine Worker

Cloudflare Worker backend for O2O Engine. This service holds your OpenAI API key and exposes two endpoints to the static GitHub Pages frontend.

## Endpoints

- `GET /api/health`
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
  "allowAssumptions": true
}
```

### `POST /api/refine`

```json
{
  "command": "Turn this into SOPs for a 3-person team",
  "userDeltaContext": "Keep tool stack to Notion and Slack",
  "currentSystem": { "...": "previous response object" }
}
```

## Deploy

1. Install dependencies.
2. Copy `wrangler.toml.example` to `wrangler.toml`.
3. Set `ALLOWED_ORIGIN` to your GitHub Pages origin.
4. Set secret:
   - `wrangler secret put OPENAI_API_KEY`
5. Optional: bind KV and uncomment `RATE_LIMIT_KV` in `wrangler.toml`.
6. Deploy:
   - `npm run deploy`

## Local dev

- `npm run dev`
- Health check: `http://localhost:8787/api/health`
