# Pierre Tracker

Baby tracker dashboard — daily summary, feeding volume chart, and recent activity timeline. Built with Next.js 15 and Supabase.

## Quick start

```bash
npm install
# Create .env.local with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (from Supabase Dashboard)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Install as a mobile app (PWA)

Pierre Tracker can be added to a phone home screen as a standalone app. Install checks need **HTTPS** (Vercel production/preview) or a local production server — the service worker is **not** registered in `npm run dev`.

To verify locally:

```bash
npm run build && npm run start
```

Then open the site on your phone (or use desktop Chrome’s Application → Manifest / Service Workers panels).

**iOS Safari**
1. Open the site in Safari.
2. Tap Share → **Add to Home Screen**.
3. Confirm the name and tap Add. Launch from the new home-screen icon (standalone).

**Android Chrome**
1. Open the site in Chrome.
2. Use the browser menu → **Install app** / **Add to Home Screen** (wording varies), or the install banner if shown.
3. Launch from the home-screen icon (standalone).

The app still requires network access for activity data; this PWA setup is for install/launch only, not offline use.

## Project layout

- **`src/app/`** — Next.js app router (layout, page, globals)
- **`src/components/`** — TodaySummary, FeedingTrendChart, RecentActivity, EventRow
- **`src/lib/`** — Supabase client and data queries
- **`docs/prototypes/`** — [UI prototype screenshots and notes](docs/prototypes/README.md) for the dashboard

## Scripts

| Command      | Description        |
|-------------|--------------------|
| `npm run dev`   | Start dev server   |
| `npm run build` | Production build   |
| `npm run start` | Run production    |
| `npm run lint`  | Run ESLint        |

## Tech stack

- Next.js 15, React 19, TypeScript
- Tailwind CSS, Recharts, Lucide React
- Supabase (backend and auth)
