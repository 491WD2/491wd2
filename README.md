# 491WD2 FamilyHub

**This is the combined household app** (`491WD2/491wd2`). It includes the former `491wd2-app` codebase plus the Figma Make FamilyHub shell.

Primary UI: `src/familyhub` — always-on **Home** wake page, Desktop/App preview toggle, Subscriptions & Passwords vault. Projects / Photos / Routines / Kiosk removed from the shell. FamilyData persists in localStorage.

```bash
npm install
npm run dev
```

Open **http://localhost:5173/** — use **Desktop view** or **App view** at the top.

---

Legacy notes (AdminUX / Help Center / UI Builder still in-repo):

## Help Center & hover tips

- Open **Help Center** from the top switcher for structured docs (categories A–L), search, and filters.
- In **UI Builder**, use the **?** control in the lower sidebar to toggle **help tips on/off** (saved as `491wd-help-mode-enabled`). When on, hover or focus supported controls to see short descriptions.

## Frontend dev & build

```bash
npm install
npm run dev
```

Open **http://localhost:5173/** (Vite defaults to port 5173 with this repo’s scripts).

**Production:**

```bash
npm run test       # Jest + React Testing Library (chore analytics, a11y, nav)
npm run build      # typecheck + optimized dist/
npm run start      # serve dist/ on :4173 (kiosk LAN testing)
```

**Chore kiosk** (`/chores`): analytics agent, client AI suggestions, offline snapshot, PWA, and performance code-splitting. QA checklist: **[docs/QA_KIOSK.md](docs/QA_KIOSK.md)**.

Deployment, SPA routing, and accessibility: **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** · **[docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md)**.

### Deploy to production

1. `npm ci && npm run test && npm run build`
2. Upload the **`dist/`** folder to your static host (Netlify, Vercel, nginx, S3, etc.).
3. Configure **SPA fallback** so all routes serve `index.html` (see DEPLOYMENT.md).
4. Open **`/chores`** on kiosk hardware; install as PWA (Add to Home Screen) for offline shell.
5. Optional client handoff zip: `npm run handoff` → `handoff/` at repo root.

## Optional: AI backend (paused)

A separate `server/` Express proxy was scaffolded for a future ChatGPT-style assistant and is **not required** for Help Center or the rest of the app.
# 491wd2
