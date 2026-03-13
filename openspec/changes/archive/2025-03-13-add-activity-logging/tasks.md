## 1. Data Layer

- [x] 1.1 Add `insertLog` mutation function to `src/lib/queries.ts` that inserts a row into the `logs` table via Supabase and returns the inserted row
- [x] 1.2 Add a `buildTimestamp` utility that takes a date and a `HH:MM` string and returns an ISO timestamp for Supabase insertion

## 2. Time Picker Utilities

- [x] 2.1 Create `roundDownTo5Minutes(date: Date): Date` utility that rounds a Date down to the nearest 5-minute mark
- [x] 2.2 Create `getDefaultEventTime(): string` that returns `HH:MM` for (now - 15 minutes) rounded down to nearest 5 minutes
- [x] 2.3 Create `generateTimeOptions(): string[]` that returns all `HH:MM` values in 5-minute increments from 00:00 to 23:55

## 3. ActivityLogger Component — Accordion Shell

- [x] 3.1 Create `src/components/ActivityLogger.tsx` with accordion toggle state (`isOpen`), "LOG ACTIVITY" trigger button with "+" icon, and CSS transition for expand/collapse
- [x] 3.2 Add "CANCEL" button with "X" icon inside the expanded panel that collapses the accordion and resets all form state
- [x] 3.3 Wire `onLogSaved` callback prop for parent to trigger data refetch after a successful log

## 4. ActivityLogger Component — Time Picker

- [x] 4.1 Add time picker row inside accordion showing "EVENT TIME:" label and current time value in `HH:MM` format with a clock icon
- [x] 4.2 Connect time picker to a `<select>` or scrollable input using the 5-minute increment options from task 2.3
- [x] 4.3 Set default time using `getDefaultEventTime()` each time the accordion opens

## 5. ActivityLogger Component — Feed Logger

- [x] 5.1 Add feed amount stepper with "-" / amount display / "+" buttons, default 120ml, step 10ml, range 0–500ml
- [x] 5.2 Disable "-" button at 0ml and "+" button at 500ml with visual feedback
- [x] 5.3 Add "Log Feed" button (blue, bottle emoji) that calls `insertLog` with `action_type: "feed"`, the stepper amount, `unit: "ml"`, and the selected timestamp
- [x] 5.4 Disable "Log Feed" button while request is in-flight to prevent double submission

## 6. ActivityLogger Component — Diaper Logger

- [x] 6.1 Add "Wet" button (green tint, water droplet emoji) that calls `insertLog` with `action_type: "diaper"`, `amount: 1`, `unit: "wet"`, and the selected timestamp
- [x] 6.2 Add "Dirty" button (yellow/brown tint, poop emoji) that calls `insertLog` with `action_type: "diaper"`, `amount: 1`, `unit: "dirty"`, and the selected timestamp
- [x] 6.3 Disable both diaper buttons while any diaper insert is in-flight

## 7. Page Integration

- [x] 7.1 Import `ActivityLogger` in `src/app/page.tsx` and place it between the header and `TodaySummary`
- [x] 7.2 Wire `onLogSaved` to re-fetch today's logs and update the `logs` state so `TodaySummary` and `RecentActivity` reflect the new event
- [x] 7.3 After successful log, collapse the accordion and reset form defaults

## 8. Styling & Polish

- [x] 8.1 Style all accordion elements to match the mockup: rounded card container, light background, consistent spacing with the rest of the dashboard
- [x] 8.2 Ensure all interactive elements meet 44x44px minimum touch target on mobile
- [x] 8.3 Test accordion expand/collapse animation smoothness on mobile viewport
