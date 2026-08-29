## Why

The Food Passport overlay still leaves the dashboard visible at the top, which feels incomplete and invites background interaction. Parents also need to correct solid-food logs (wrong name, preference, category, or allergens) without deleting and re-logging. Finally, the dashboard already charts bottle and diaper trends but has no day-by-day view of how many solids Pierre ate.

## What Changes

- Make Explore Passport and Food Detail **full-screen overlays** (edge-to-edge; no dashboard peek)
- From Food Detail history, open an **edit flow** for a solid exposure to change food name, category, preference, and allergens
- Add a **Solid Foods (7 Days)** bar chart on the dashboard showing daily solid exposure counts (patterned after Diaper Changes)

## Capabilities

### New Capabilities

- `solids-trend-chart`: 7-day bar chart of daily solid-food exposure counts with window navigation and rolling average

### Modified Capabilities

- `food-passport`: Full-screen explore/detail overlays; edit an exposure from history (food, category, preference, allergens)

Note: `food-passport` is not yet archived under `openspec/specs/`; this change’s delta specs define the updated behavior. Prior change `fix-passport-scroll-lock` remains relevant for scroll containment inside the overlay.

## Impact

- `src/components/FoodPassport.tsx` — full-screen layout; exposure edit UI
- `src/lib/foodQueries.ts` — update exposure + linked food fields; query exposures for trend window
- New `src/components/SolidsTrendChart.tsx` (or equivalent); wire into `src/app/page.tsx`
- No Supabase schema migration expected (reuse `foods` + `food_exposures`)
