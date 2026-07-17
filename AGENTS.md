# AGENTS.md

## Cursor Cloud specific instructions

This repository is a **GitHub profile README** repo (`491WD2/491wd2`). Its only purpose is that
`README.md` renders on the owner's GitHub profile page at https://github.com/491WD2.

- There is **no application, service, backend, frontend, database, build step, or test suite**, and
  **no package manager** (no `package.json`, `requirements.txt`, etc.). There is nothing to
  lint/test/build in the traditional sense — "development" means editing `README.md` (Markdown).
- The default template's body lives inside an HTML comment (`<!-- ... -->`), so only the
  `## Hi there 👋` heading renders until that comment is removed/edited. This is expected, not a bug.
- To preview the README exactly as GitHub renders it, use `grip` (GitHub Readme Instant Preview):
  `grip README.md 0.0.0.0:6419` then open `http://localhost:6419`. `grip` renders via GitHub's
  markdown API, so it needs network access. It live-reloads on file save.
- The committed `.gitignore` is Node/Vite-oriented, hinting a future JS app *may* be added. If a
  `package.json` ever appears, install deps with the matching package manager (lockfile decides:
  `package-lock.json`→npm, `pnpm-lock.yaml`→pnpm, `yarn.lock`→yarn) and re-run environment discovery.
