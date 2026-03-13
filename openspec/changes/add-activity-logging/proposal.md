## Why

The dashboard currently displays baby activity data (feeds, diapers, sleep) but provides no way to log new events from within the app. Parents must add records directly to the database. Adding in-app activity logging makes the tracker self-contained and usable in practice — especially during the hectic moments of feeding and diaper changes.

## What Changes

- Add a "Log Activity" accordion button on the main dashboard that expands to reveal logging controls
- Support logging **feed** events with a volume selector (ml, adjustable in increments via +/- buttons)
- Support logging **diaper** events with type selectors (Wet / Dirty)
- Include a time picker that uses **5-minute increments** and defaults to **15 minutes before the current time** (reflecting the typical delay of logging after feeding)
- Insert new events into the Supabase `logs` table and refresh the dashboard data after logging
- Cancel button to collapse the accordion and discard in-progress input

## Capabilities

### New Capabilities
- `activity-logger`: Accordion-based UI for logging feed and diaper events, including time picker with 5-minute increments and volume/type selectors. Handles Supabase inserts and dashboard refresh.

### Modified Capabilities
- `daily-overview`: The "Log Activity" accordion replaces the static header area — the accordion trigger sits between the header and the summary cards.

## Impact

- **New component**: `ActivityLogger` (accordion UI with feed/diaper logging forms)
- **Modified page**: `src/app/page.tsx` — integrates the activity logger between header and summary
- **New mutation**: `src/lib/queries.ts` — `insertLog()` function for Supabase inserts
- **Data**: Writes to the existing `logs` table (no schema changes)
- **Dependencies**: No new packages required (using native HTML time input + Tailwind styling)
