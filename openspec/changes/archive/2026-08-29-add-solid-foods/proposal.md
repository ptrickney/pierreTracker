## Why

Pierre is entering the solid-foods stage. The tracker today only logs bottle feeds (ml) and diapers, so parents have no structured way to record what he tried, whether he liked it, allergen involvement, reactions, or casual notes — nor a quick answer to “what have we already introduced?” Baby-led feeding makes a food passport more valuable than portion sizes.

## What Changes

- Extend the activity logger with a **Bottle / Solids** feeding-type toggle (bottle keeps today’s ml stepper; solids do not track quantity)
- Log **one solid food per entry**: food name (autocomplete from previously logged foods), preference emoji (dislike / neutral / like), optional classic-9 allergen tags, optional non-allergy comment, optional reaction notes at log time
- Add a **Food Passport** milestone card on the dashboard summarizing unique foods tried and top allergens passed
- Add an **Explore Passport** view listing foods by category, with reaction-flagged items visually distinct
- Add a **Food Detail** view (tap a food): full exposure history, preference per try, reactions, comments; actions to **Report reaction** (including delayed) and **Add comment** on a past exposure
- Allow re-logging the same food anytime (including after a prior reaction); passport keeps one card per food and accumulates history
- Show solid-food events in Recent Activity without mixing them into bottle feeding volume totals/charts

## Capabilities

### New Capabilities
- `solid-food-logger`: Solids branch of activity logging — food name + autocomplete, preference, classic-9 allergen tags, comments, optional reaction at log time; persists exposures linked to canonical foods
- `food-passport`: Passport card, explore-by-category view, food detail with full history, delayed reaction reporting, and non-allergy comments on exposures

### Modified Capabilities
- `activity-logger`: Feeding section gains Bottle vs Solids toggle; solids path replaces the ml stepper/CTA while bottle/diaper behavior stays unchanged
- `event-timeline`: Timeline supports solid-food events (label, preference, reaction hint, comment snippet) distinct from bottle feeds

## Impact

- **Schema**: New Supabase tables (or structured columns) for canonical foods and per-exposure solid logs — existing bottle `logs` rows stay as `action_type: "feed"` with ml
- **UI**: Updates to `ActivityLogger`; new Passport card, Explore modal/sheet, Food Detail surface; timeline row styling for solids
- **Queries**: Create/lookup food by name, list foods for autocomplete and passport, fetch exposures per food, update exposure reaction/comment
- **Dashboard metrics**: Bottle “Fed Today” / feeding chart remain ml-only; solids never contribute to volume sums
- **Dependencies**: No new packages required unless a lightweight modal/sheet primitive is already desired; stick to existing Tailwind + React patterns
