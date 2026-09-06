## Why

The French UI shipped, but the food categorization heuristics in `foodConstants.ts` only know English keywords ("carrot", "apple", "yogurt"…). Foods logged with French names — which is how Pierre's grandmother will log everything — all fall into the "Autre" (Other) passport category, and their allergen tags are never inferred (e.g. "Beurre de cacahuète" gets no peanut tag). The passport's category grouping and allergens-passed count are therefore useless for French entries.

## What Changes

- Add French keywords to the category inference lists (fruits, légumes, protéines, céréales, produits laitiers) alongside the existing English ones
- Add French keywords to the classic-9 allergen inference lists (arachide, fruits à coque, lait, œuf, soja, blé, poisson, crustacés, sésame)
- Make keyword matching **accent-insensitive** (é/è/ê → e, ç → c, œ → oe, etc.) so "Pêche", "pêche", and "peche" all match; the stored `name_key` normalization is unchanged, only matching is affected
- Extend the French exclusion logic mirroring the existing English plant-butter rule: "beurre de cacahuète/d'amande/de cajou" is not dairy, and "noix de coco" is not a tree nut
- Add unit tests for the inference functions (English regression + French coverage), following the existing `trendWindow.test.ts` node-test pattern
- **Backfill existing data**: one-off script recategorizes foods currently stored as `other` whose name now infers a real category, and fills allergens for foods with an empty allergen list whose name now infers some

## Non-goals

- No change to `normalizeFoodNameKey` or stored `name_key` values (deduplication behavior is untouched; "Carotte" and "Carrot" remain distinct foods)
- No translation or merging of existing food names
- No new UI; category can still be manually corrected from the food detail view as before

## Assumptions recorded

- Backfill only touches foods in `other` (never overrides a manually chosen real category) and only fills allergens when the current list is empty (never overrides manual tags)
- Shared French/English words (riz/rice via "riz", "orange", "kiwi", "tofu", "quinoa") need only one entry

## Capabilities

### Modified Capabilities
- `ui-localization`: adds French food-name recognition for passport category and allergen inference

## Impact

- **Code**: `src/lib/foodConstants.ts` (keyword lists, accent-insensitive matching, exclusions); new `src/lib/foodConstants.test.ts`; one-off `scripts/backfill-food-categories.ts`
- **Data**: one-time Supabase update of mis-categorized `foods` rows (category and/or allergens)
- **Schema / dependencies**: none
