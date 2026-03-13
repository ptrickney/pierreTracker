## Why

Users need to correct mistakes (e.g., duplicate or wrong entries) by removing an activity from the timeline. The dashboard currently has no way to delete a logged event; adding delete support keeps the log accurate without requiring manual database edits.

## What Changes

- Add a delete control (trash icon) to each event row in the Recent Activity timeline.
- Implement delete action: remove the corresponding row from the `logs` table and refresh the dashboard so Today's Summary and Recent Activity reflect the change.
- Optional: brief confirmation (e.g., confirm dialog or undo toast) to avoid accidental deletes; MVP can be single-tap delete with immediate removal.

## Capabilities

### New Capabilities

- `delete-activity`: User can delete a single activity (log row) by ID. The row is removed from the `logs` table and the UI (timeline and today's summary) is updated without a full page reload.

### Modified Capabilities

- `event-timeline`: Each event row SHALL display a delete control (e.g., trash icon) that allows the user to delete that activity.

## Impact

- **Data**: Supabase `logs` table — delete by primary key `id`.
- **Code**: `src/lib/queries.ts` (new `deleteLog(id)`), `src/components/EventRow.tsx` (delete button + handler), `src/app/page.tsx` or parent (refresh after delete). Today's Summary and Recent Activity already depend on fetched logs and will update when state is refreshed after delete.
