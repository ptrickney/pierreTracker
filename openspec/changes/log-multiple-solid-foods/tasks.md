## 1. Schema and types

- [x] 1.1 Apply Supabase migration making `food_exposures.preference` nullable (keep allowed-value check when present)
- [x] 1.2 Update TypeScript types so exposure/activity/passport preference is `FoodPreference | null`
- [x] 1.3 Update `preferenceEmoji` (or a wrapper) to omit a glyph for null — never fall back to neutral

## 2. Data access

- [x] 2.1 Change food upsert so inferred allergens apply only when creating a new `foods` row, not when re-logging an existing name
- [x] 2.2 Allow inserting exposures with `preference: null`; keep comment, timestamp, and `had_reaction: false` on each row
- [x] 2.3 Add a batch log helper that inserts one exposure per pending food (shared timestamp + copied comment) and stops on first failure
- [x] 2.4 Thread nullable preference through passport summaries, food detail, and recent-activity mapping

## 3. Solids logger UI

- [x] 3.1 Replace the single-food Solids fields with a pending-chip list, name input, autocomplete, and Add “Name” for unmatched text
- [x] 3.2 Select the newly added chip, show optional per-chip preference (no default), block duplicate `name_key` chips, and keep one meal comment field
- [x] 3.3 Remove allergen chips and Report reaction from the Solids form; CTA logs N foods and disables while in flight
- [x] 3.4 On partial failure, refresh succeeded rows, drop those chips, keep remaining chips, and show an error
- [x] 3.5 Block submit with no chips; reset composer on cancel/success; collapse accordion after full success

## 4. Unrated display

- [x] 4.1 Omit preference emoji on unrated solid rows in Recent Activity; still show one row per exposure
- [x] 4.2 Omit preference emoji for unrated latest/history in passport preview, explore, and Food Detail (do not imply neutral)
- [x] 4.3 Ensure Food Detail edit does not crash or silently save neutral when opening an unrated exposure

## 5. Verification

- [x] 5.1 Lint and build
- [x] 5.2 In the browser: empty → three foods (mix of known, new, rated, unrated) + meal comment; confirm three timeline rows, passport unique count, and solids trend
- [x] 5.3 In the browser: re-log an existing food does not overwrite allergens; Food Detail still reports reactions; bottle/diaper paths unchanged
