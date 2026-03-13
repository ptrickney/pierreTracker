## Context

The app is a client-rendered Next.js 15 dashboard backed by Supabase. Activities are rows in the `logs` table; the page fetches today's logs and passes them to `TodaySummary` and `RecentActivity` (which renders `EventRow` per log). There is no delete path today; inserts go through `insertLog()` in `src/lib/queries.ts`. Row identity is `id` (UUID from Supabase).

## Goals / Non-Goals

**Goals:**

- User can delete one activity from the timeline via a per-row control (e.g., trash icon).
- The deleted row is removed from the `logs` table by `id`.
- After delete, the dashboard refreshes (re-fetch today's logs) so Today's Summary and Recent Activity update without a full page reload.

**Non-Goals:**

- Confirmation dialog or undo (MVP is single-tap delete); can be added later.
- Bulk delete or delete from anywhere other than the timeline row.
- Soft delete or audit trail; delete is hard delete.

## Decisions

1. **Delete API**: Add `deleteLog(id: string)` in `src/lib/queries.ts` that calls Supabase `.from('logs').delete().eq('id', id)`. No return value needed beyond success/error; caller refreshes data on success.
   - *Alternative*: Expose a Route Handler that performs delete and returns JSON; rejected to keep all data access in the existing client-side Supabase usage.

2. **Who triggers refresh**: The component that owns the log list state (e.g., `page.tsx`) will own the delete callback: call `deleteLog(id)`, then re-run `fetchTodayLogs()` and set state so `RecentActivity` and `TodaySummary` both get new data.
   - *Alternative*: EventRow could call a global store or context; rejected to avoid new state layer for a single action.

3. **Delete control placement**: Trash icon (e.g., Lucide `Trash2`) at the end of each event row, right of the timestamp, with grey outline style to match the timeline. Minimum touch target 44px for mobile (per existing activity-logger spec).
   - *Alternative*: Swipe-to-delete; rejected for MVP to avoid extra gesture handling.

4. **Loading and error**: Disable or visually indicate loading on the row (or only the trash button) while delete is in progress. On error, surface a brief message (e.g., toast or inline) and do not remove the row.
   - *Alternative*: Optimistic remove then rollback on error; acceptable as a later improvement.

## Risks / Trade-offs

- **Accidental delete** → MVP has no confirm; we accept the risk. Can add confirmation or undo in a follow-up.
- **Supabase RLS** → If RLS is enabled later, delete must be allowed for the same principal that can insert/select; no change to design, just policy.
- **Stale UI if multiple tabs** → Out of scope; single-tab refresh is sufficient for MVP.
