## 1. Inference engine

- [x] 1.1 Add `foldKey` (diacritic stripping, œ/æ ligatures, curly-apostrophe normalization) and use it in `nameContainsPhrase`
- [x] 1.2 Add French keywords to the five category lists in `CATEGORY_KEYWORDS`
- [x] 1.3 Add French keywords to the nine allergen lists in `ALLERGEN_KEYWORDS`
- [x] 1.4 Extend exclusions: French plant butters not dairy; "noix de coco" not tree nut

## 2. Tests

- [x] 2.1 Create `src/lib/foodConstants.test.ts` with English regression + French category/allergen/exclusion cases; all pass via `npx tsx --test`

## 3. Backfill

- [x] 3.1 Write `scripts/backfill-food-categories.ts` (recategorize `other` foods, fill empty allergens, log changes)
- [x] 3.2 Run it against the project database and record the result

## 4. Validation

- [x] 4.1 `npm run lint` and `npm run build` pass
- [x] 4.2 Manual browser check: previously logged "Carotte" now appears under "Légumes" in the passport; logging a new accented French food (e.g. "Pêche") lands in the right category with correct allergen defaults in the edit view
