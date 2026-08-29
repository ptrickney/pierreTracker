## Why

Logging a mixed plate currently means repeating the full Solids form once per food — accordion close, reopen, re-pick time. Pierre often eats several foods in one meal, so that friction is the main reason solids don’t get logged. Parents still want each food stored and counted separately (passport uniqueness, per-food preference), with preference optional at log time and one comment for the meal.

## What Changes

- Replace the single-food Solids form with a **chip composer**: type a name, add as a chip (autocomplete or **Add “Name”** for new foods), add as many as needed, then submit once
- Each chip becomes its own `food_exposures` row (same timestamp); passport unique-food counts and the solids trend chart still count **per exposure / per food**, not per meal
- **Preference is per food and optional** — adding a chip selects it and shows a preference row; skip the emojis to leave the exposure unrated (not a silent “neutral”)
- **One optional comment** applies to every exposure in that submit
- **Remove from the initial log:** allergen chips and “Report reaction” (keep name-based allergen inference on save; reactions stay on Food Detail)
- **BREAKING** (schema): `food_exposures.preference` becomes nullable so unrated logs are representable

## Capabilities

### New Capabilities

- _(none)_

### Modified Capabilities

- `solid-food-logger`: Multi-food chip composer, optional per-food preference, shared meal comment, new-name “Add” row, no allergen/reaction UI on submit
- `event-timeline`: Unrated solid rows omit a preference emoji rather than implying a rating
- `food-passport`: Unrated latest/history preference is displayed as unrated; unique-food counting unchanged (still one passport row per canonical food)

## Impact

- `src/components/ActivityLogger.tsx` — Solids form rewrite (chips, pending list, submit N exposures)
- `src/lib/foodQueries.ts` — batch log helper; nullable preference on insert
- `src/types/food.ts`, `src/types/activity.ts` — `preference` optional/nullable
- `src/components/EventRow.tsx`, `src/components/FoodPassport.tsx`, `src/lib/foodConstants.ts` — unrated display
- Supabase: migrate `food_exposures.preference` to nullable; no meals table
- Bottle feed, diapers, date/time, passport explore/edit, and reaction-from-detail are unchanged
