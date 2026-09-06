## ADDED Requirements

### Requirement: French food names infer passport categories

Category inference SHALL recognize common French baby-food names (fruits, vegetables, proteins, grains, dairy) in addition to English ones, matching accent-insensitively, so French-named foods land in the correct passport category instead of "Other". Multi-word French keywords SHALL take precedence over shorter contained words (e.g. "pomme de terre" is a vegetable even though "pomme" is a fruit).

#### Scenario: French vegetable

- **WHEN** a food named "Carotte" is created
- **THEN** its inferred category is `vegetables`

#### Scenario: Accented French fruit

- **WHEN** a food named "Pêche" is created
- **THEN** its inferred category is `fruits` (with or without the accent)

#### Scenario: Longer phrase wins

- **WHEN** a food named "Pomme de terre" is created
- **THEN** its inferred category is `vegetables`, not `fruits`

#### Scenario: English names keep working

- **WHEN** a food named "Sweet Potato" is created
- **THEN** its inferred category is `vegetables`, exactly as before

### Requirement: French food names infer classic-9 allergens

Allergen inference SHALL recognize French names for the classic-9 allergens (accent-insensitively), including exclusions mirroring the English rules: plant butters ("beurre de cacahuète", "beurre d'amande", "beurre de cajou") are not dairy, and "noix de coco" is not a tree nut.

#### Scenario: French peanut butter

- **WHEN** a food named "Beurre de cacahuète" is created
- **THEN** its inferred allergens include `peanut` and do not include `milk`

#### Scenario: French egg

- **WHEN** a food named "Œuf" is created
- **THEN** its inferred allergens include `egg`

#### Scenario: Coconut is not a tree nut

- **WHEN** a food named "Noix de coco" is created
- **THEN** its inferred allergens do not include `tree_nuts`

### Requirement: Existing mis-categorized French foods are backfilled

Foods already stored with category `other` whose name now infers a real category SHALL be updated to that category, and foods with an empty allergen list whose name now infers allergens SHALL receive them. Manually assigned categories (anything other than `other`) and non-empty allergen lists SHALL never be overwritten.

#### Scenario: Previously logged French food

- **WHEN** the backfill runs and a food "Carotte" is stored with category `other`
- **THEN** its category becomes `vegetables`

#### Scenario: Manual choices preserved

- **WHEN** the backfill runs and a food was manually set to `dairy` or has manually curated allergens
- **THEN** that food's category and allergens are unchanged
