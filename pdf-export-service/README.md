# O2O PDF Export Service

Server-side Markdown-to-PDF renderer used by the O2O Worker export route.

## Endpoints

- `GET /health`
- `POST /api/export/pdf`

`POST /api/export/pdf` request body:

```json
{
  "title": "Recruitment Operating System",
  "markdown": "# Heading\n\nYour markdown content..."
}
```

Returns: `application/pdf` attachment.

## Environment Variables

- `PORT` (default `8080`)
- `ALLOWED_ORIGIN` (default `*`; set to your Worker origin or deployment domain)
- `PUPPETEER_EXECUTABLE_PATH` (optional, for custom Chromium paths)

## Local Run

1. Install dependencies:
   - `npm install`
2. Start service:
   - `npm run start`
3. Health check:
   - `http://localhost:8080/health`

## Wire To Worker

Set this variable in Worker `wrangler.toml`:

- `PDF_EXPORT_SERVICE_URL = "https://YOUR_PDF_SERVICE_URL"`

Then call Worker endpoint:

- `GET /api/systems/:id/export?format=pdf`

The Worker forwards markdown to this service and streams back the PDF.
