# Figma Make export — Tablet POS Dashboard (Community)

Archived from the uploaded Make zip. Despite the Community template name, the **entry UI in `src/app/App.tsx` is FamilyHub** (warm `#F8F6F2` tablet shell, DM Sans + Fraunces).

## What to use

| Path | Role |
|------|------|
| `src/app/App.tsx` | FamilyHub mock shell (visual reference only) |
| `src/styles/theme.css` | Warm shadcn tokens (mirrored in `src/styles/figma-theme.css`) |
| `src/styles/fonts.css` | DM Sans + Fraunces |

## What to ignore

`src/app/components/*` outside FamilyHub — salon POS leftovers (`Sidebar`, `StockView`, `ClientsView`, `CheckoutModal`, etc.). They are **not** mounted by `App.tsx` and must not replace the live FamilyHub data layer.

## Live app mapping

Product source of truth is `src/familyhub/App.tsx` + `useFamilyData` / vault:

- Home landing, no Projects / Photos / Routines / kiosk collections
- Subscriptions = password + payer
- Pantry = custom storage places
- Bridged live household data (not Make demo arrays)
