# 491WD2 Family Hub

Household command center (`AdminUX`), chore kiosk PWA, UI Builder, and Help Center.

**Stack:** React · Vite · TypeScript · Tailwind CSS · Jest · Supabase client · Netlify · PWA

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server at http://localhost:5173 |
| `npm run build` | Production build |
| `npm run start` | Preview production build on :4173 |
| `npm run test` | Jest unit tests |
| `npm run lint` | Oxlint |
| `npm run handoff` | Package a client zip into `handoff/` |

## Routes

- `/` — AdminUX command center
- `/chores` — touch-first chore kiosk (PWA start URL)
- `/builder` — UI Builder block toggles
- `/help` — Help Center

## Environment

Copy `.env.example` to `.env.local` and set Supabase keys when ready. Without them the app runs on local seed data.

Do not commit `.env`, `.env.local`, or `.env.production`.

## Deploy

Netlify uses `netlify.toml` (`npm run build` → `dist`, SPA redirect).
