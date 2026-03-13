# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Pierre Tracker is a single-service Next.js 15 baby activity dashboard (feeding, sleep, diapers) backed by Supabase. See `README.md` for scripts and project layout.

### Environment variables

The app requires a `.env.local` file with two keys sourced from environment secrets:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

These are injected as environment variables. Create `.env.local` before running the dev server:
```bash
echo "NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL" > .env.local
echo "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" >> .env.local
```

### Running the app

- **Dev server**: `npm run dev` (port 3000)
- **Lint**: `npm run lint`
- **Build**: `npm run build`

### Gotchas

- The `.eslintrc.json` uses `next/core-web-vitals`; `next lint` is deprecated in Next.js 16+ but works in the current Next.js 15 setup.
- The app is a client-side rendered page (`"use client"` in `page.tsx`); Supabase queries run in the browser, not server-side.
- No automated test suite exists (no `test` script in `package.json`). Validation is done via lint + build + manual browser testing.
