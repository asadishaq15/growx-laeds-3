# grow-x-leads-3

Vite + React lead form project with the **SSDI CPA CS** form only.

## Routes

- `/` — SSDI CPA CS form
- `/ssdi-cpa-cs` — same form

## Local development

Run the API and Vite app in two terminals:

```bash
npm run api
npm run dev
```

- API: `http://localhost:5001` (`/api/ping18`, `/api/post18`)
- App: Vite default (`http://localhost:5173`), with `/api` proxied to port 5001

## Deploy

Vercel uses `api/ping18.js` and `api/post18.js` as serverless functions. Optional env overrides:

- `TRACKDRIVE_NUMBER_18` (default `+18777991582`)
- `TRAFFIC_SOURCE_ID_18` (default `1000`)
# growx-laeds-3
