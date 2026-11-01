# grow-x-leads-3

Vite + React lead form project for Growx SSDI buyer-check forms.

## Routes

- `/` — SSDI CPA CS form
- `/ssdi-cpa-cs` — SSDI CPA CS form
- `/ssdi-cpa-tj` — SSDI CPA TJ form (`+18778581849`)

## Local development

Run the API and Vite app in two terminals:

```bash
npm run api
npm run dev
```

- API: `http://localhost:5001` (`/api/ping18`, `/api/post18`, `/api/ping19`, `/api/post19`)
- App: Vite default (`http://localhost:5173`), with `/api` proxied to port 5001

## Deploy

Vercel uses `api/ping18.js`, `api/post18.js`, `api/ping19.js`, and `api/post19.js` as serverless functions.

Optional env overrides:

- `TRACKDRIVE_NUMBER_18` (default `+18777991582`)
- `TRAFFIC_SOURCE_ID_18` (default `1000`)
- `TRACKDRIVE_NUMBER_19` (default `+18778581849`)
- `TRAFFIC_SOURCE_ID_19` (default `1000`)
