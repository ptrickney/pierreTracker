## Context

`inferFoodCategory` and `inferAllergens` in `src/lib/foodConstants.ts` run whole-word/phrase matching of English keyword lists against `normalizeFoodNameKey(name)` (trim + lowercase). They are called once at food creation (`foodQueries.ts` `upsertFood` / `logSolidFoods`) and the result is persisted to the `foods` table, and again live in the passport edit form. French names never match, so every French food is stored as `other` with no allergens.

## Goals / Non-Goals

**Goals**: French names categorize and tag allergens as well as English ones; accents don't matter; existing French rows get fixed once.

**Non-Goals**: changing `name_key` normalization or dedup semantics; merging French/English duplicates; new UI.

## Decisions

### 1. Accent-insensitive matching via a match-time fold

Add a `foldKey` helper: NFD-normalize, strip combining marks, replace `œ → oe` / `æ → ae`. `nameContainsPhrase` folds both the name key and the keyword before testing. Keywords are written unaccented in the lists (folding makes accented spellings in user input match anyway). `normalizeFoodNameKey` — and therefore stored `name_key` values and dedup — is untouched.

### 2. French keywords in the same ranked lists

French keywords are appended to the existing per-category and per-allergen keyword arrays. The existing longest-keyword-first ranking already resolves phrase conflicts ("pomme de terre" > "pomme", "noix de coco" > "noix", "beurre de cacahuete" > "beurre"). Exclusions extend the existing plant-butter pattern:

- milk: keyword "beurre" is skipped when the name contains "beurre de cacahuete", "beurre d'amande"/"beurre d amande", or "beurre de cajou" (folded matching handles apostrophes via a small apostrophe-normalization in `foldKey`)
- tree_nuts: keyword "noix" is skipped when the name contains "noix de coco"

Apostrophe note: French uses `'` and `’`; `foldKey` maps `’ → '` so keyword lists only need the ASCII form.

### 3. Unit tests with node:test

New `src/lib/foodConstants.test.ts` mirroring `trendWindow.test.ts` (runs via `npx tsx --test`): English regressions (sweet potato, peanut butter/dairy exclusion) plus French cases (carotte, pêche accents, pomme de terre, beurre de cacahuète, œuf, noix de coco).

### 4. One-off backfill script

`scripts/backfill-food-categories.ts` (run with `npx tsx`, reads `.env.local`): fetches all foods, computes inference with the new lists, updates rows where `category === "other"` and inference differs, and fills `allergens` where currently empty and inference is non-empty. Prints a per-food summary. Uses the same publishable key the browser uses (RLS already allows these updates from the client). Committed for documentation/reuse but intended as a one-time run.

## Risks / Trade-offs

- **Keyword coverage is heuristic**: uncommon French names may still land in "other"; the manual category editor remains the escape hatch (same as English today).
- **Shared-word collisions**: folded matching means "mure" (blackberry) also matches "mûre"; no known harmful collisions in the combined lists — verified by unit tests for the tricky pairs.
- **Backfill touches production data**: constrained to `other`-category / empty-allergen rows only, so manual curation can't be lost; the script logs every change it makes.
