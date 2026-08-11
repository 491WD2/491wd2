# Attached Figma Style Audit

**Visual source of truth:** [https://floor-double-99844517.figma.site/](https://floor-double-99844517.figma.site/) (published FamilyHub Make site — colorful per-nav active pills, indigo brand mark, Fraunces clock).

**Reference code:** Make `App.tsx` from `491WD2_491wd2-app.zip` (layouts for Home / Tools pages). Do **not** use the mauve salon POS `Sidebar.tsx` leftovers as chrome.

## Visual style summary

Clean, soft, airy FamilyHub household dashboard (floor-double):

- Soft canvas (`#F8F6F2` / stone)
- White left sidebar (~256px) with **colorful per-nav active pills** (not mauve)
- Large rounded white cards, subtle borders, soft shadows
- Section accents: indigo Home, pink Messages, emerald Shopping, lime Pantry, etc.
- Fraunces display clock + weather strip on Home
- Green / olive quick-add CTAs (`#10B981` / `#6D9C0E`)

## Colors used / inferred

| Token | Value |
|-------|--------|
| App bg | `#F8F7F5` |
| Surface | `#FFFFFF` |
| Border soft | `#F1F2F4` |
| Text main | `#111827` |
| Text muted | `#9CA3AF` |
| Accent mauve | `#8B5A7C` |
| Accent mauve soft | `#F5E6F1` |
| Alert warm bg | `#FFF4E8` |
| Alert warm text | `#8B7A5A` |

## Typography

- Heading / UI: Inter + DM Sans
- Page titles ~30px medium/semibold
- Helper text muted gray
- No decorative serif emphasis on core dashboard pages

## Sidebar rules

- White surface, border-right `#F3F4F6`
- Section labels uppercase / tracked
- Nav items ~48–56px, radius ~20px
- Active: `#F5E6F1` bg + `#8B5A7C` text/icon
- Hover: `#F9FAFB`
- Bottom profile / family identity block

## Card / button / input rules

- Cards: ~28px radius, soft shadow, 1px soft border
- Primary button: mauve fill, ~18px radius
- Secondary: white + border
- Search: tall rounded input, left icon, mauve focus

## Page mappings (reference → FamilyHub)

| Reference | FamilyHub |
|-----------|-----------|
| Salon sidebar chrome | FamilyHub sidebar |
| Stock Management | Pantry & Inventory |
| Calendar appointments UI | Family schedule |
| Reports cards | Home summary / stat cards |
| Settings forms | FamilyHub settings |

## Intentionally not copied

- Salon / Clients / Staff / Reports / History business routes
- Appointment / stylist / client mock data
- Product stock mock inventory
- Reference `package.json` / MUI / backend code

## Data safety notes

- Style-only pass on `src/familyhub/*` + CSS/docs
- `FAMILY_DATA_STORAGE_KEY` unchanged (`familysite-491:first-family-build`)
- Vault key unchanged
- No `localStorage.clear` / destructive migration added
- Projects view reads existing `FamilyData.projects` only (no overwrite)
- Photos / Routines are empty shells; do not seed or delete data
