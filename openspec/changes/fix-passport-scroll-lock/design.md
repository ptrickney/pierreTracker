## Context

Explore Passport and Food Detail are `fixed inset-0` overlays in `FoodPassport.tsx`. The dialog panel uses `max-h-[92vh] flex flex-col` with an `overflow-y-auto` body, but:

1. The scrollable body is not a constrained flex child (`flex-1 min-h-0`), so overflow often fails to create an internal scrollport.
2. `document.body` is never locked, so wheel/touch gestures scroll the page behind.

See proposal.md for motivation; see specs for required behavior.

## Goals / Non-Goals

**Goals:**

- Internal scroll when passport/detail content overflows
- No background scroll while either overlay is open
- Restore page scroll on close

**Non-Goals:**

- Reworking passport layout, categories, or data loading
- A shared modal system for the whole app
- Changing focus trap / a11y beyond scroll (unless trivial with the same change)

## Decisions

### 1. Body scroll lock via effect

**Decision:** When Explore Passport or Food Detail mounts, set `document.body.style.overflow = "hidden"` and restore the previous value on unmount.

**Alternatives:** CSS-only (`overscroll-behavior` alone) — insufficient on mobile Safari / when the scrollport isn’t established. Library (`react-remove-scroll`) — unnecessary for one modal pair.

### 2. Constrain the flex scroll child

**Decision:** On both dialog panels: `overflow-hidden` on the panel; `flex-1 min-h-0 overflow-y-auto overscroll-contain` on the content region so height is bounded by `max-h-[92vh]` and scrolling stays inside.

### 3. Backdrop does not scroll

**Decision:** Keep the dimmed backdrop non-scrollable; optional `touch-none` / preventDefault on backdrop wheel only if body lock + constrained scrollport is not enough after manual check.

## Risks / Trade-offs

- [iOS rubber-banding] → Mitigation: `overscroll-behavior: contain` on the scroll region plus body lock; verify on mobile viewport in browser.
- [Nested Food Detail replacing Explore] → Mitigation: both overlays run the same lock effect so lock stays active across the transition and clears only when both are gone.
