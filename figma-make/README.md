# Figma Make export (scaffold only)

Source: [491WD2 / Tablet POS Dashboard Make file](https://www.figma.com/design/mdjDGIdr0EFIMFTQ4CWlmK/Tablet-POS-Dashboard--Community-).

These files are the Make project root (package/vite/theme scaffolding). They are **not** the live FamilyHub app entrypoint.

## Wired into the app

- Theme CSS → `src/styles/default_shadcn_theme.css` (imported by `src/styles/figma-theme.css`)
- Attributions → `/ATTRIBUTIONS.md`

## Not used as-is

- `package.json` — Make’s dependency dump would break our PWA/typecheck build
- `vite.config.ts` — we keep PWA + `0.0.0.0` host in the repo root config
- `index.html` — keep FamilyHub title/fonts/PWA meta at repo root

## Missing for a full Make redesign

Upload the Make **`src/`** tree (especially `src/app/**` components) or authenticate Figma MCP in Cursor Desktop so we can pull design context. Scaffold alone cannot replace FamilyHub screens.
