# grow-x-leads-3

Vite + React lead form project for Growx SSDI buyer-check and lead posting forms.

## Routes

- `/` — SSDI CPA CS form
- `/ssdi-cpa-cs` — SSDI CPA CS form
- `/ssdi-cpa-tj` — SSDI CPA TJ form (`+18778581849`)
- `/ssdi-cpa-ld` — SSDI CPA LD form (`+18776431423`)
- `/ticket-to-work` — Ticket to Work form (lead_token `20b38f6b063e46ed880a73ddf388f963`)

## Local development

Run the API and Vite app in two terminals:

```bash
npm run api
npm run dev
```

- API: `http://localhost:5001` (`/api/ping18`–`post18`, `/api/ping19`–`post19`, `/api/ping20`–`post20`)
- App: Vite default (`http://localhost:5173`), with `/api` proxied to port 5001
- Ticket to Work posts directly to Growx `/api/v1/leads` (no local API proxy)

## Deploy

Vercel uses `api/ping18.js`, `api/post18.js`, `api/ping19.js`, `api/post19.js`, `api/ping20.js`, and `api/post20.js` as serverless functions.

Optional env overrides:

- `TRACKDRIVE_NUMBER_18` (default `+18777991582`)
- `TRAFFIC_SOURCE_ID_18` (default `1000`)
- `TRACKDRIVE_NUMBER_19` (default `+18778581849`)
- `TRAFFIC_SOURCE_ID_19` (default `1000`)
- `TRACKDRIVE_NUMBER_20` (default `+18776431423`)
- `TRAFFIC_SOURCE_ID_20` (default `1000`)
