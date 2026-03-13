## Context

Pierre's baby events are ingested into a Supabase PostgreSQL `logs` table via a backend webhook. The table stores feeds, sleep, and diaper events with timestamps, amounts, and units. There is currently no frontend — this is a greenfield Next.js project that will provide a read-only dashboard for visualizing this data.

The dashboard is consumed by parents on both desktop and mobile, so responsiveness is important.

## Goals / Non-Goals

**Goals:**

- Provide a single-page dashboard that shows today's activity at a glance
- Display a "Today's Summary" section with a prominent Last Feed card and three aggregated stat cards in a 2x2 grid
- Show a "Recent Activity" scrollable timeline of today's events with a "View All History" footer link
- Visualize "Feeding Volume (7 Days)" with a bar chart
- Keep the tech stack minimal and maintainable

**Non-Goals:**

- No write/input capabilities (data entry happens via webhook)
- No authentication or multi-user support (single baby, single household)
- No historical date navigation beyond the 7-day chart (future enhancement)
- No push notifications or real-time WebSocket subscriptions
- No SSR/ISR optimization — client-side fetching is acceptable for this MVP

## Decisions

### 1. Next.js App Router with Client Components

**Decision**: Use Next.js App Router. Dashboard components will be client components that fetch data on mount using `@supabase/supabase-js` directly.

**Rationale**: The dashboard is a single-page read-only view. Client-side fetching with `useEffect` keeps the architecture simple and avoids server component complexity for this MVP. The App Router is the modern Next.js standard.

**Alternatives considered**:
- Server Components with `fetch`: Would require API routes or server actions. Adds complexity without clear benefit for a single-user dashboard.
- Pages Router: Legacy pattern; App Router is the recommended approach.

### 2. Tailwind CSS for Styling

**Decision**: Use Tailwind CSS with no additional component library.

**Rationale**: Tailwind provides utility-first styling that is fast to iterate on. No component library overhead — the UI is simple enough to build with raw Tailwind classes.

**Alternatives considered**:
- shadcn/ui: Good components, but adds unnecessary abstraction for three simple views.
- Material UI: Heavy bundle, opinionated design system not needed here.

### 3. Recharts for Data Visualization

**Decision**: Use Recharts for the 7-day feeding trend bar chart.

**Rationale**: Recharts is lightweight, React-native, well-documented, and handles simple bar charts with minimal configuration. It integrates naturally with React component patterns.

**Alternatives considered**:
- Tremor: More opinionated, larger bundle, designed for full dashboard suites.
- Chart.js / react-chartjs-2: More setup required, imperative API less natural in React.
- D3: Overkill for a single bar chart.

### 4. Supabase Client-Side Queries

**Decision**: Query Supabase directly from client components using `@supabase/supabase-js` with the **publishable key** (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`). Supabase has deprecated the legacy anon key in favor of publishable keys; the client supports both for backward compatibility. Use Row Level Security (RLS) policies or disable RLS with a public read policy on the `logs` table.

**Rationale**: Simplest path for a read-only, single-user dashboard. No API routes needed. The publishable key is safe for client-side use with RLS.

**Alternatives considered**:
- Next.js API routes as proxy: Adds a layer of indirection with no security benefit for a read-only, no-auth app.

### 5. Single-Page Layout with 2x2 Summary Grid

**Decision**: One page (`app/page.tsx`) composed of three sections stacked vertically:
1. **Header**: "Pierre Tracker" title + current date (e.g., "Thursday, March 12") + baby avatar icon
2. **Today's Summary**: 2x2 card grid — Last Feed card (highlighted, blue bg, top-left, larger), Fed Today (top-right), Slept Today (bottom-left), Diapers Today (bottom-right)
3. **Feeding Volume (7 Days)**: Recharts bar chart in a white card
4. **Recent Activity**: Event timeline list in a white card, with "View All History" link at the bottom

**Rationale**: The Last Feed card is the single most glanceable piece of information for a parent ("when/how much was the last feed?"). Giving it visual priority in the grid ensures the dashboard answers the most urgent question instantly. The remaining three stat cards provide daily context. The chart and timeline sit below for deeper detail.

## Risks / Trade-offs

- **[Client-side Supabase key exposure]** → The publishable key is visible in the browser (by design). Mitigation: RLS policies restrict access to read-only on the `logs` table. No sensitive data beyond baby event logs.
- **[No caching / rate limiting]** → Every page load queries Supabase. Mitigation: Acceptable for single-user MVP. Can add SWR or React Query later if needed.
- **[Timezone handling]** → "Today" must be calculated relative to the user's local timezone, but `timestamptz` is stored in UTC. Mitigation: Convert to local timezone on the client using standard JS `Date` APIs; query with UTC-converted day boundaries.
- **[No loading/error states in MVP]** → Mitigation: Include basic loading skeletons and error boundaries to avoid a broken UX.
