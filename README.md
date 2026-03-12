# Pierre Tracker

Baby tracker dashboard — daily summary, feeding volume chart, and recent activity timeline. Built with Next.js 15 and Supabase.

## Quick start

```bash
npm install
# Create .env.local with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (from Supabase Dashboard)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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
