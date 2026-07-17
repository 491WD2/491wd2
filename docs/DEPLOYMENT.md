# Deployment

## Netlify

1. Connect this repository.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add env vars from `.env.example` if using Supabase.

SPA routing is handled by the redirect in `netlify.toml`.

## Chore kiosk PWA

1. Deploy the site.
2. On the wall tablet, open `/chores`.
3. Add to Home Screen.
4. Disable screen sleep in the tablet settings.

The web app manifest `start_url` is `/chores`.
