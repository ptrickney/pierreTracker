## Context

See proposal.md for motivation. Solids already use `foods` + `food_exposures`; the logger still collects one name, required preference, allergen chips, comment, and reaction, then closes. Bottle/diaper/date-time stay as they are. Food Detail already supports delayed reaction and editing preference/allergens (passport-edit change). Preference in the database is currently required text.

## Goals / Non-Goals

**Goals:**
- One submit writes N exposure rows with a shared timestamp and shared comment
- Optional per-food preference without defaulting to neutral
- Keep passport uniqueness and solids trend counts on per-food exposures
- Infer allergens for **new** foods only; do not clobber edited allergen sets on re-log

**Non-Goals:**
- A `meals` table or grouped timeline row
- Quantity / portion tracking
- Allergen chips or Report reaction on the logger
- Changing Food Detail reaction/edit flows beyond displaying unrated preference
- Offline / multi-baby

## Decisions

### 1. No meal entity — copy comment, same timestamp

**Decision:** Generate one timestamp from the existing date/time picker. Insert one `food_exposures` row per chip. Copy the single comment string onto each row (or null). No `meal_id`.

**Alternatives considered:**
- `meals` table + FK — real grouping and single comment storage; extra migration and timeline work we are not doing
- Comment only on the first exposure — Food Detail for other foods in the meal would miss the note

**Rationale:** Specs require separate timeline rows and separate counts. Duplicating a short comment is enough. Parents can still edit one exposure's comment later in Food Detail (that edit is per-row, not a meal update).

### 2. Nullable `preference`, not a sentinel

**Decision:** Migrate `food_exposures.preference` to nullable. Unrated means SQL `NULL`. Types become `FoodPreference | null`. Display helpers return empty string / omit emoji when null — never fall back to the neutral face.

**Alternatives considered:**
- Keep NOT NULL and write `neutral` when skipped — contradicts "optional, not silent neutral"
- Add `unrated` to the enum — extra value to thread through edit UI for little gain

**Rationale:** Absence is the natural model. Existing rows stay rated. Food Detail edit can still set a preference on a past unrated exposure.

### 3. Chip composer in `ActivityLogger` (replace single-food Solids path)

**Decision:** Pending foods live in client state: `{ name, nameKey, preference: FoodPreference | null }[]`. Selected index drives the preference row. Autocomplete + "Add “Name”" only mutate that list. Submit maps the list through a batch helper that loops `upsertFood` + `insertFoodExposure`.

**Alternatives considered:**
- Stack of full mini-forms — too tall in the accordion
- Names-only, rate later only — slower to capture likes when they *do* know in the moment

**Rationale:** Matches the agreed B flow: names-first, preference row appears because the new chip is selected.

### 4. Allergen inference only on create

**Decision:** On submit, call `inferAllergens(name)` only when `upsertFood` creates a new `foods` row. If the food already exists, do not pass inferred allergens into the update.

**Alternatives considered:**
- Always pass inferred chips like today's form — would overwrite Food Detail allergen edits on every re-log
- Never infer — more missed peanut tags on first log of "peanut butter"

**Rationale:** Logger no longer shows chips; inference is the only first-touch tagging. Must not fight later edits.

### 5. Sequential inserts, keep successes on partial failure

**Decision:** Insert exposures in chip order. If one fails, stop, refresh data for rows that landed, remove those chips from pending, show an error, leave remaining chips so the user can retry. Disable the CTA for the whole attempt.

**Alternatives considered:**
- All-or-nothing RPC/transaction — cleaner, more backend than this app uses today
- Continue after failure — harder to explain which names failed

**Rationale:** The client already talks to Supabase per row; no existing transaction helper.

### 6. Unrated UI in timeline and passport

**Decision:** `preferenceEmoji` (or a wrapper) accepts `FoodPreference | null` and returns no glyph for null. EventRow / passport preview / explore / detail history omit the emoji rather than showing 😐.

## Risks / Trade-offs

- **[Risk] Same timestamp + duplicated comments look like three unrelated logs** → Accept for v1; timeline stays one row per food as specified
- **[Risk] Partial submit leaves a half-logged meal** → Surface error and keep leftover chips; user retries
- **[Risk] Near-duplicate names still possible ("PB" vs "Peanut Butter")** → Unchanged; autocomplete + name_key only
- **[Trade-off] Comment edits in Food Detail are per exposure** → Meal-wide comment is only at log time
- **[Trade-off] No logger reaction** → Slightly slower to flag a reaction during the meal; Food Detail covers it

## Migration Plan

1. Apply Supabase migration: `food_exposures.preference` drop NOT NULL (keep check/constraint on allowed values when present)
2. Deploy UI that reads null preference as unrated
3. Rollback: revert UI first (treat null as neutral only if an emergency); column can stay nullable

## Open Questions

None. Remaining product choices (chip vs row, comment-per-meal, no logger reaction) were decided in brainstorming.
