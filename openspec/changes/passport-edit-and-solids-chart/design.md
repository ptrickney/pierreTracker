## Context

Explore/Detail overlays in `FoodPassport.tsx` are bottom sheets (`items-end`, `max-h-[92vh]`), which leaves dashboard chrome visible (see proposal). Scroll lock already exists from `fix-passport-scroll-lock`. Diaper trend chart + `trendWindow` helpers define the 7-day chart pattern. Food edits need a write path that updates `food_exposures` and `foods` without a schema migration.

## Goals / Non-Goals

**Goals:**

- Edge-to-edge full-screen passport overlays
- Per-exposure edit for name, category, preference, allergens
- Daily solids count bar chart (7-day window + rolling average)

**Non-Goals:**

- Editing timestamp, reaction, or comment in this edit form (existing detail actions remain)
- Orphan-food cleanup when an exposure is reassigned away from a food
- Changing bottle feeding charts

## Decisions

### 1. Full-screen overlay layout

**Decision:** Use `fixed inset-0` panel at `h-dvh` / `max-h-none`, not a 92vh bottom sheet. Keep header sticky; body `flex-1 min-h-0 overflow-y-auto overscroll-contain`. Retain body scroll lock.

### 2. Edit semantics for food name

**Decision:** Saving an edit upserts the food by normalized name (reuse existing or create). Update that food’s category and allergens from the form. Point the exposure at that food and update preference. If the name matches the current food, update that food in place (including category — unlike logging’s non-overwrite rule).

**Rationale:** Matches “edit this log” and the logger’s food identity model. Documented assumption: renaming one exposure reassigns that exposure; it does not rename sibling exposures unless they share the same food after upsert.

### 3. Edit UI placement

**Decision:** Tap an exposure row (or an Edit control on the row) in Food Detail to open an inline/full-panel edit form with food autocomplete, category select, preference control, and allergen toggles — same field vocabulary as Activity Logger solids.

### 4. Solids chart

**Decision:** Mirror `DiaperTrendChart` structure with a single Bar series (`count`) + Line for 7-day average. Query `food_exposures` in the lookback window via a new `fetchSolidTrendExposures` helper. Place chart on the dashboard after `DiaperTrendChart` (or between feeding and diaper — prefer after diaper to keep feeding/diaper pair, or after Feeding before Diaper; **choose after Diaper** to avoid disrupting existing layout familiarity — actually proposal says near diaper; place **after FeedingTrendChart and before DiaperTrendChart** so all “intake” charts group — wait, solids aren't bottle. Place **after DiaperTrendChart** as a third chart.

## Risks / Trade-offs

- [Reassign leaves empty foods] → Accept for v1; no delete cascade
- [Category overwrite on shared food] → Editing allergens/category updates the shared `foods` row, affecting passport display for all exposures of that food — intentional for passport consistency
- [Full-screen on desktop] → Still max-width content column centered if desired; overlay itself is full viewport
