## 1. Data layer

- [x] 1.1 Add `deleteLog(id: string): Promise<void>` in `src/lib/queries.ts` that calls Supabase `logs` table `.delete().eq('id', id)`; throw on error.

## 2. Timeline UI

- [x] 2.1 In `EventRow`, add a delete control (e.g., Lucide `Trash2`) right-aligned on the row with grey outline style and minimum 44x44px touch target; accept optional `onDelete?: (id: string) => Promise<void>` and `deleting?: boolean` props.
- [x] 2.2 When the delete control is clicked, call `onDelete(log.id)` if provided; disable the control or show loading state while `deleting` is true.
- [x] 2.3 In `RecentActivity`, accept optional `onDelete?: (id: string) => Promise<void>` and pass it to each `EventRow`; manage per-row deleting state (e.g., track `deletingId`) and pass `deleting={deletingId === log.id}` to `EventRow`.

## 3. Page wiring and refresh

- [x] 3.1 In `page.tsx`, implement a delete handler that calls `deleteLog(id)`, then `refetch()` on success; on failure, set or display an error (e.g., `setError` or inline message) and do not remove the row.
- [x] 3.2 Pass the delete handler to `RecentActivity` so timeline rows can trigger delete; ensure `refetch()` updates both today's summary and recent activity (existing `refetch` already does this).
