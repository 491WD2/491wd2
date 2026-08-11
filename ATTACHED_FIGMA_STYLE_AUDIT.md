# Attached Figma Style Audit

**Reference file:** `491WD2_491wd2-app.zip` (also uploaded as `theme.css` / `tailwind.css`)

## Visual style summary

Clean, soft, airy premium dashboard chrome from a salon/admin Community template:

- Soft off-white app canvas (`#F8F7F5`)
- White left sidebar (~256px) with mauve active state
- Large rounded white cards, subtle borders, soft shadows
- Mauve / lavender accent system (`#8B5A7C`, `#F5E6F1`)
- Warm cream alert panels (`#FFF4E8`)
- Inter / DM Sans UI typography (Fraunces display reduced)

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
