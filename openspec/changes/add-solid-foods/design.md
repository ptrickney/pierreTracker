## Context

Pierre Tracker is a Next.js 15 client-rendered dashboard over Supabase. Activity today lives in a single `logs` table (`action_type`: feed | sleep | diaper) with `amount` / `unit` / `details` / `timestamp`. Bottle feeds are the only feeding path (ml stepper). Solid foods need a different model: named foods, preference, allergen tags, comments, reactions, and a passport of unique foods — without polluting bottle volume totals.

Parents are the stakeholders; primary use is phone, during/after meals. Designs cover Bottle/Solids toggle, preference emoji, reaction panel, passport card, and explore-by-category; Food Detail was agreed in conversation but has no mock.

## Goals / Non-Goals

**Goals:**
- Log one solid food per entry with preference, optional classic-9 allergen tags, optional comment, optional reaction
- Autocomplete food names from previously logged foods; re-log the same food anytime
- Dashboard Food Passport + explore-by-category + food detail with full exposure history
- Report delayed reactions and add non-allergy comments from food detail (per exposure)
- Surface solids in Recent Activity without affecting bottle Fed Today / feeding charts

**Non-Goals:**
- Quantity / portion tracking for solids
- Multi-food meal as a single log entry
- Pediatric “wait N days between allergens” scheduling or medical advice
- Breastmilk/formula session pairing with solids
- Seed catalog of every possible baby food (only classic-9 allergen chips + free-text names)
- Offline / multi-baby support
- Redesigning bottle feed or diaper flows beyond the Bottle/Solids toggle shell

## Decisions

### 1. Data model: `foods` + `food_exposures` (source of truth for solids)

**Decision:** Add two Supabase tables instead of overloading `logs` alone.

```
foods
  id uuid PK
  name text              -- display name (first-seen casing)
  name_key text UNIQUE   -- lower(trim(name)) for identity / autocomplete
  category text          -- fixed enum-ish set, default 'other'
  allergens text[]       -- subset of classic 9 keys
  created_at timestamptz

food_exposures
  id uuid PK
  food_id uuid FK → foods
  timestamp timestamptz
  preference text        -- 'dislike' | 'neutral' | 'like'
  had_reaction boolean default false
  reaction_notes text null
  comment text null      -- non-allergy notes
  created_at timestamptz
```

**Alternatives considered:**
- Encode everything in `logs.details` JSON with `action_type: "solid"` — fastest, but passport uniqueness, allergen aggregation, and per-exposure edits become fragile
- Dual-write solids to both `logs` and exposures — timeline stays simple, but delayed reaction / comment edits must sync two rows

**Rationale:** Passport and food detail are first-class. Separate tables make autocomplete, unique foods, allergen “passed” counts, and history updates natural. Timeline merges sources in the query/UI layer.

### 2. Classic 9 allergen keys (app constant)

**Decision:** Fixed key list in app code: `milk`, `egg`, `peanut`, `tree_nuts`, `soy`, `wheat`, `fish`, `shellfish`, `sesame`. UI shows chips; stored on `foods.allergens`. Tagging happens when logging a food (especially first time) and remains editable on later logs of the same food (updates the food’s allergen set).

**“Passed” rule:** An allergen counts as passed when at least one exposure exists for a food tagged with that allergen **and** no exposure of any food tagged with that allergen has `had_reaction = true`.

### 3. Categories

**Decision:** Small fixed category list for grouping in Explore Passport: `vegetables`, `fruits`, `proteins`, `grains`, `dairy`, `other`. Default new foods to `other`. Optional category picker on log (advanced defaults later via heuristics — not required for v1).

### 4. Autocomplete / identity

**Decision:** Match on `name_key`. Typing selects an existing food or creates a new one on submit. Preserve the first display `name`; do not create duplicates that differ only by case/whitespace.

### 5. Activity logger UX

**Decision:** Inside the feed section, segmented control **Bottle | Solids**. Bottle path unchanged (ml + Log Feed). Solids path: food name input + suggestions, preference emoji (default neutral), allergen chips, optional comment field, optional “Report reaction” expand with notes, CTA **Log Solid Food**. Diapers remain below, shared date/time.

Accordion `max-height` must increase to fit the solids form (or switch to height:auto / content-driven expand).

### 6. Passport UI placement

**Decision:** Food Passport card on the main dashboard (below Log Activity / near Todays Summary, matching prior mocks). Explore Passport = full-screen or large modal listing categories. Tapping a food opens Food Detail (modal/sheet): header stats for that food, chronological exposure list, per-row or screen-level **Report reaction** and **Add comment**.

### 7. Timeline integration

**Decision:** Extend recent-activity fetch to merge `food_exposures` (joined to `foods`) with `logs`, sort by timestamp, map solids to a shared display shape (`kind: "solid"`). Delete on a solid row deletes the exposure (and does not remove the `foods` row even if history becomes empty — orphan cleanup optional later).

Bottle feed queries continue filtering `action_type = 'feed'` only.

### 8. Preference vs reaction vs comment

**Decision:** Preferance is always set (emoji). Reaction is orthogonal (`had_reaction` + notes). Comment is free text, never styled as allergy UI. Delayed reaction updates an existing exposure’s `had_reaction` / `reaction_notes` from Food Detail.

## Risks / Trade-offs

- **[Risk] Free-text still creates near-duplicates (“PB” vs “Peanut Butter”)** → Autocomplete + name_key helps; accept residual dupes; no merge UI in v1
- **[Risk] Timeline merge complexity / pagination across two tables** → Fetch a small page from each, merge-sort client-side for v1; revisit if history grows large
- **[Risk] Accordion overflow on mobile with solids form** → Content-driven expand; test on small viewports
- **[Trade-off] No quantity** → Matches BLW practice; parents who want volume keep using bottle logs only
- **[Trade-off] Allergen “passed” is simplistic** → Explicit product choice, not medical certification; show count as progress, not a guarantee

## Migration Plan

1. Apply Supabase migration creating `foods` and `food_exposures` with RLS consistent with `logs` (open write for the app’s current anon/publishable key pattern)
2. Deploy UI that reads empty passport gracefully
3. No backfill — solids start from first log
4. Rollback: remove UI feature flag or revert deploy; tables can remain empty/unused

## Open Questions

- Exact dashboard placement of Passport card relative to charts (default: after Log Activity / before or after Todays Summary — match mock: after Log Activity)
- Whether category should be required on first log or always default to Other with optional edit on Food Detail (default: optional, default Other)
- Empty-state copy for passport before any solids logged
