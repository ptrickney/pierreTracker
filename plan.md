# Plan: Dashboard Activity Persistence

## Problem

The dashboard fetches only "today's" logs via `fetchTodayLogs()` (midnight-to-midnight filter) and passes them to all components. This means:

- **Last Feed card** resets to "—" at midnight, even if the baby was fed 30 minutes ago.
- **Recent Activity section** shows "No events recorded today" at midnight, losing visibility into recent events.

Daily totals (Fed Today, Slept Today, Diapers Today) resetting at midnight is correct behavior.

## Root Cause

`page.tsx` makes a single query (`fetchTodayLogs`) and shares the result with both `TodaySummary` and `RecentActivity`. Both components inherit the today-only date filter.

## Solution

Separate the data fetching so that date-independent components get their own queries:

### 1. New queries in `src/lib/queries.ts`

- **`fetchLastFeed()`** — Fetch the single most recent feed log with no date filter (`.eq("action_type", "feed").order("timestamp", desc).limit(1)`).
- **`fetchRecentLogs(limit)`** — Fetch the N most recent logs with no date filter (`.order("timestamp", desc).limit(N)`, default N=20).

### 2. Update `src/app/page.tsx`

- Call `fetchTodayLogs()` for daily totals (existing behavior).
- Call `fetchLastFeed()` for the Last Feed card.
- Call `fetchRecentLogs()` for the Recent Activity section.
- Run all three fetches in parallel with `Promise.all`.

### 3. Update `src/components/TodaySummary.tsx`

- Accept a new `lastFeed` prop (`LogRow | null`) alongside existing `logs`.
- `LastFeedCard` uses `lastFeed` directly instead of filtering from today's logs.
- Format the timestamp to also show the date if the feed is not from today.

### 4. Update `src/components/RecentActivity.tsx`

- Accept a `recentLogs` prop instead of (or in addition to) `logs`.
- Use `recentLogs` for rendering instead of today-only logs.
- Update empty state text from "No events recorded today" to "No recent events".
- Show relative date info for entries not from today.

## Files Changed

| File | Change |
|------|--------|
| `src/lib/queries.ts` | Add `fetchLastFeed()` and `fetchRecentLogs()` |
| `src/app/page.tsx` | Fetch all three datasets in parallel, pass to components |
| `src/components/TodaySummary.tsx` | Accept `lastFeed` prop, use it in `LastFeedCard` |
| `src/components/RecentActivity.tsx` | Accept and use `recentLogs`, update empty state text |

## Validation

- `npm run lint` passes
- `npm run build` passes
- Manual browser testing confirms:
  - Daily totals still show today-only data
  - Last Feed card shows the absolute last feed regardless of day
  - Recent Activity shows recent events across day boundaries
