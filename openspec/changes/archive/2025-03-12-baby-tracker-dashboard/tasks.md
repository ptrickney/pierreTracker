## 1. Project Setup

- [x] 1.1 Initialize Next.js project: `npx create-next-app@latest . --typescript --tailwind --app --eslint --src-dir --no-import-alias`
- [x] 1.2 Remove default boilerplate: clear `src/app/page.tsx` content, strip default styles from `src/app/globals.css` (keep Tailwind directives only), delete any placeholder images/icons
- [x] 1.3 Install runtime dependencies: `npm install @supabase/supabase-js recharts lucide-react`
- [x] 1.4 Create `.env.local` with placeholder values for `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (anon key deprecated)
- [x] 1.5 Create Supabase client utility (`src/lib/supabase.ts`) that exports `getSupabase()` using publishable key (fallback to anon key)
- [x] 1.6 Update `src/app/layout.tsx`: set page metadata (title: "Pierre Tracker"), configure font (Inter or system default), set light gray body background (`bg-gray-50`)

## 2. Data Layer

- [x] 2.1 Define TypeScript types (`src/types/log.ts`): `LogRow` interface with fields `id: string`, `created_at: string`, `action_type: 'feed' | 'sleep' | 'diaper'`, `amount: number`, `unit: string`, `details: string | null`, `timestamp: string`
- [x] 2.2 Create `src/lib/queries.ts` — `fetchTodayLogs()`: compute local day start/end as UTC ISO strings using `new Date()` and `toISOString()`, query Supabase `logs` table with `.gte('timestamp', startUTC).lt('timestamp', endUTC)`, return `LogRow[]`
- [x] 2.3 Create `src/lib/queries.ts` — `fetchLast7DaysFeedLogs()`: compute 7-day-ago start boundary in UTC, query `logs` where `action_type = 'feed'` and `timestamp >= 7daysAgoUTC`, return raw `LogRow[]` (aggregation by day is done client-side in the chart component)

## 3. Today's Summary Section

- [x] 3.1 Create `src/components/TodaySummary.tsx` (`'use client'`) with a "Today's Summary" heading and a responsive card grid using Tailwind CSS Grid (`grid grid-cols-1 md:grid-cols-2 gap-4`) — single column on mobile, 2x2 on desktop
- [x] 3.2 Create `LastFeedCard` sub-component: highlighted card (solid blue background `bg-blue-500`, white text) in top-left position. Display a clock icon (`Clock` from lucide-react), "LAST FEED" label, the formatted time of the most recent feed event ("HH:MM AM/PM"), and its amount+unit (e.g., "4 oz"). Derive by finding the feed log with the latest `timestamp`.
- [x] 3.3 Create three stat cards as a shared `StatCard` sub-component, each receiving: label, value, unit, icon, and color theme. Render:
  - **FED TODAY** (top-right): blue icon, sum of `amount` for all `action_type='feed'` logs, unit "oz"
  - **SLEPT TODAY** (bottom-left): purple icon (`Moon`), sum of `amount` for `action_type='sleep'`, unit "hrs"
  - **DIAPERS TODAY** (bottom-right): green icon (`Droplets`), count of `action_type='diaper'` logs, unit "chgs"
- [x] 3.4 Style stat cards: white/light background, colored circular icon badge on the left, uppercase gray label, large bold value, smaller gray unit text
- [x] 3.5 Handle zero/empty states: stat cards show "0", Last Feed card shows "—" when no feed events exist today

## 4. Recent Activity Timeline

- [x] 4.1 Create `src/components/RecentActivity.tsx` (`'use client'`) with a "Recent Activity" heading, rendering a white card containing a vertical list of event rows
- [x] 4.2 Receive today's logs as props (shared fetch with TodaySummary), sort by `timestamp` descending
- [x] 4.3 Create `src/components/EventRow.tsx` sub-component with layout: circular colored icon (left) | event content (center: bold type label on first line, amount+unit + "| details" on second line) | clock icon + formatted time (right-aligned, e.g., "06:30 AM")
- [x] 4.4 Apply distinct icon and color per `action_type`: feed=blue (`Globe` or bottle icon), sleep=purple (`Moon`), diaper=green (`Droplets`). Match the same color scheme as the summary cards.
- [x] 4.5 Add divider lines between event rows (light gray border-bottom)
- [x] 4.6 Add "View All History" centered text link (blue, no button chrome) at the bottom of the list — no-op in MVP (placeholder href="#")
- [x] 4.7 Handle empty state: display centered "No events recorded today" message

## 5. Feeding Volume Chart

- [x] 5.1 Create `src/components/FeedingTrendChart.tsx` (`'use client'`) with a "Feeding Volume (7 Days)" heading, chart rendered inside a white card
- [x] 5.2 Fetch 7-day feed logs via `fetchLast7DaysFeedLogs()` in a `useEffect`, then aggregate client-side: group by local date, sum `amount` per day, produce array `[{ day: "Mar 07", volume: 28 }, ...]` — fill in zero for days with no data
- [x] 5.3 Wrap chart in `<ResponsiveContainer width="100%" height={300}>` for responsive sizing
- [x] 5.4 Render `<BarChart>` with `<Bar fill="#4F86F7">` (blue), `<XAxis dataKey="day">` ("Mar DD" format), `<YAxis>` (numeric volume scale), `<Tooltip>`, and `<CartesianGrid strokeDasharray="3 3" />`
- [x] 5.5 Handle empty state: chart renders with zero-height bars and all day labels still visible on x-axis

## 6. Page Assembly and Polish

- [x] 6.1 Compose `src/app/page.tsx` (`'use client'`): header section with "Pierre Tracker" title (bold, large), current date subtitle (e.g., "Thursday, March 12"), and a baby avatar emoji/icon (top-right). Below: TodaySummary, FeedingTrendChart, RecentActivity in vertical stack with section spacing.
- [x] 6.2 Lift today's logs fetch into the page component, pass data as props to TodaySummary and RecentActivity to avoid duplicate fetches
- [x] 6.3 Add loading state: show Tailwind animated pulse skeleton placeholders for each section while data is being fetched
- [x] 6.4 Add error handling: wrap fetches in try/catch and display a user-friendly error banner if Supabase query fails
- [x] 6.5 Ensure responsive layout: single column on mobile, comfortable max-width container (`max-w-2xl mx-auto`) on desktop, appropriate padding. Cards have white backgrounds with subtle rounded corners and shadow.
