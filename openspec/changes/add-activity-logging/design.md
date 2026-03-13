## Context

Pierre Tracker is a Next.js 15 + React 19 baby activity dashboard backed by Supabase. The `logs` table stores events with `action_type` (feed/sleep/diaper), `amount`, `unit`, `details`, and `timestamp`. The app currently only reads data — there is no write path. The dashboard is mobile-first, used primarily on phones during or after feeding sessions.

The mockups show an accordion pattern: a "LOG ACTIVITY" button that expands to reveal a cancel button, a time picker, a feed logger (amount in ml with +/- buttons), and diaper type buttons (Wet / Dirty).

## Goals / Non-Goals

**Goals:**
- Enable parents to log feed and diaper events directly from the dashboard
- Accordion UX that keeps the dashboard clean when not logging
- Time picker with 5-minute increments, defaulting to 15 minutes before now
- Optimistic local state refresh after logging (no full page reload)
- Mobile-friendly touch targets and layout

**Non-Goals:**
- Sleep logging (not shown in mocks — can be added later)
- Editing or deleting existing events
- Multi-baby support
- Offline/PWA support
- Undo after logging

## Decisions

### 1. Accordion component approach: CSS transition with React state

**Decision:** Use a single boolean `isOpen` state to toggle the accordion. Animate with `max-height` + `overflow-hidden` CSS transition for smooth expand/collapse.

**Alternatives considered:**
- Headless UI / Radix accordion — adds a dependency for a simple toggle; overkill
- `<details>`/`<summary>` — inconsistent animation support across browsers

**Rationale:** Zero-dependency, simple state management, smooth animation on mobile.

### 2. Time picker: custom 5-minute increment stepper

**Decision:** Build a custom time input that displays `HH:MM` and uses a clock-icon button to step through times in 5-minute increments. Default value = `roundDown5(now - 15min)`.

**Alternatives considered:**
- Native `<input type="time">` — no support for step increments on mobile Safari; visually inconsistent
- Third-party time picker library — unnecessary dependency

**Rationale:** The 5-minute constraint and default-to-15-minutes-ago behavior are domain-specific. A controlled input with `roundToNearest5Minutes(now - 15min)` as initial value is straightforward.

### 3. Feed amount: stepper with +/- buttons

**Decision:** Numeric stepper showing amount in ml. Increment/decrement by 10ml per tap. Default to 120ml (the most common feed amount for a newborn). Minimum 0ml, maximum 500ml.

**Rationale:** Matches the mockup. Physical +/- buttons are easier to tap on mobile than typing numbers. 10ml steps balance precision with speed.

### 4. Diaper type: toggle buttons (Wet / Dirty)

**Decision:** Two toggle buttons that each independently log a diaper event when tapped. Wet = `unit: "wet"`, Dirty = `unit: "dirty"`. Each button inserts a separate `logs` row.

**Rationale:** Matches the mockup. Simple, one-tap logging. A diaper can be both wet and dirty (two separate events) or just one type.

### 5. Data mutation: direct Supabase insert + local state refresh

**Decision:** Add an `insertLog()` function to `queries.ts` that does a Supabase `.insert()`. After successful insert, re-fetch today's logs to update the dashboard.

**Alternatives considered:**
- Optimistic update (add to local state before server confirms) — risk of showing phantom data on failure
- Server Actions (Next.js) — the app currently uses client-side Supabase directly; switching patterns would be a larger refactor

**Rationale:** Consistent with existing read pattern. Simple. The insert + refetch round-trip is fast enough for this use case.

### 6. Component structure

**Decision:** Single `ActivityLogger` component placed between the header and `TodaySummary` in `page.tsx`. It manages its own accordion state, form state, and mutation logic. Takes an `onLogSaved` callback prop to trigger parent refetch.

**Rationale:** Self-contained component keeps `page.tsx` clean. The callback pattern lets the parent control data refresh.

## Risks / Trade-offs

- **[Risk] Accidental double-tap logging** → Disable the submit button for 1 second after a successful log and show brief feedback
- **[Risk] Time picker UX on small screens** → Keep the time display large and tappable; test on mobile viewport
- **[Trade-off] No sleep logging** → Intentionally deferred to keep scope tight; the architecture supports adding it later with the same pattern
- **[Trade-off] Re-fetch vs optimistic update** → Slightly slower but more reliable; acceptable for the expected low frequency of events (~8-12/day)
