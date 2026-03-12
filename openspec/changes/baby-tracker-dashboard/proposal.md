## Why

Pierre's baby events (feeds, sleep, diapers) are already being tracked and ingested into a Supabase database via a backend webhook, but there is no way to visualize this data. Parents need a quick, glanceable dashboard to understand daily patterns — how much Pierre has eaten, how long he's slept, and diaper counts — without digging through raw data.

## What Changes

- Build a new Next.js (App Router) web dashboard from scratch
- Add a "Today's Summary" section with a prominent "Last Feed" card and three aggregated stat cards (fed today, slept today, diapers today) in a 2x2 grid
- Add a "Recent Activity" timeline of today's events, visually distinguished by action type (feed, sleep, diaper), with a "View All History" link
- Add a "Feeding Volume (7 Days)" bar chart showing daily total feeding volume
- Connect to the existing Supabase `logs` table as a read-only data source

## Capabilities

### New Capabilities

- `daily-overview`: "Today's Summary" section with a 2x2 card grid — a highlighted "Last Feed" card (time + amount of most recent feed), plus three stat cards for today's totals (fed volume, sleep hours, diaper count)
- `event-timeline`: "Recent Activity" chronological scrollable feed of today's events with type-specific icons and color coding, sorted by timestamp descending, with "View All History" footer link
- `feeding-trend-chart`: "Feeding Volume (7 Days)" bar chart visualizing total daily feeding volume with "Mar DD" date labels

### Modified Capabilities

_(none — this is a greenfield project)_

## Impact

- **New codebase**: Full Next.js App Router project with Tailwind CSS
- **Dependencies**: `next`, `react`, `tailwindcss`, `@supabase/supabase-js`, and a charting library (e.g., Recharts)
- **External systems**: Read-only connection to existing Supabase PostgreSQL database (`logs` table)
- **Environment**: Requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY`) environment variables
