# AGENTS.md

## Cursor Cloud specific instructions

This repository is the **491WD2 Family Hub** app (`familysite-491`).

### Stack

React + Vite + TypeScript + Tailwind CSS v4 + Jest + Supabase JS client + Netlify + `vite-plugin-pwa`.

### Commands

- Install: `npm install`
- Dev: `npm run dev` (port 5173)
- Test: `npm run test`
- Build: `npm run build`
- Preview: `npm run start` (port 4173)
- Lint: `npm run lint`

### Notes

- Without Supabase env vars the UI uses local seed data (`src/data/seed.ts`).
- Do not commit `.env*` secrets or `.cursor/`.
- Primary UX surfaces: AdminUX (`/`), chore kiosk (`/chores`), UI Builder (`/builder`), Help (`/help`).
