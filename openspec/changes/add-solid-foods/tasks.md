## 1. Schema and types

- [x] 1.1 Create Supabase migration for `foods` and `food_exposures` (columns, indexes on `name_key` / `food_id`+`timestamp`, RLS aligned with `logs`)
- [x] 1.2 Add TypeScript types for foods, exposures, preferences, classic-9 allergen keys, and categories
- [x] 1.3 Add shared constants for classic-9 allergens and food categories

## 2. Data access layer

- [x] 2.1 Implement food lookup/create by normalized `name_key` and allergen/category updates
- [x] 2.2 Implement insert/update/delete for `food_exposures` (create exposure, update reaction notes, update comment)
- [x] 2.3 Implement passport queries: list foods with latest preference + any-reaction flag, unique count, allergens-passed count, recent tried preview
- [x] 2.4 Implement food detail query: food metadata + exposures ordered newest first
- [x] 2.5 Implement autocomplete search by `name_key` prefix/substring
- [x] 2.6 Extend recent-activity fetch to merge `logs` with solid exposures and support deleting an exposure from the timeline

## 3. Solids logging UI

- [x] 3.1 Add Bottle | Solids segmented control to `ActivityLogger`; keep bottle/diaper paths unchanged
- [x] 3.2 Build solids form: food name input, preference emoji selector, allergen chips, optional comment, optional report-reaction panel, "Log Solid Food" CTA
- [x] 3.3 Wire autocomplete suggestions into the food name field
- [x] 3.4 Wire submit to create/reuse food + insert exposure; disable button while submitting; refresh dashboard; fix accordion height for solids content
- [x] 3.5 Validate empty food name and reset solids form state on cancel/success

## 4. Food Passport UI

- [x] 4.1 Add Food Passport summary card to the dashboard (counts, recent tried chips, Explore CTA, empty state)
- [x] 4.2 Build Explore Passport modal/sheet grouped by category with reaction badges
- [x] 4.3 Build Food Detail view with full exposure history
- [x] 4.4 Add Report reaction action on Food Detail (update exposure + refresh passport)
- [x] 4.5 Add Add/edit comment action on Food Detail (non-allergy styling + refresh)

## 5. Timeline integration

- [x] 5.1 Render solid events in `EventRow` / Recent Activity with distinct icon/color, food name, preference, reaction hint, comment snippet (no ml)
- [x] 5.2 Wire delete control for solid rows to delete `food_exposures` and refresh timeline/passport

## 6. Verification

- [x] 6.1 Manually verify bottle feed volume totals/charts ignore solids
- [x] 6.2 Manually verify log → passport → explore → detail → delayed reaction → comment flows on mobile viewport
- [x] 6.3 Run `npm run lint` and `npm run build`
