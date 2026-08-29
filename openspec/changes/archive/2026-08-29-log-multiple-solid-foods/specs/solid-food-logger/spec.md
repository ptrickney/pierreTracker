## ADDED Requirements

### Requirement: Pending food chips

When Solids is selected, the activity logger SHALL let the user add one or more pending foods as chips before submit. Typing a food name and confirming (Enter, or choosing a suggestion) SHALL add a chip. The most recently added chip SHALL be selected so a per-food preference control is visible. The user MAY add further foods without submitting. Rated chips SHALL show a small preference indicator; unrated chips SHALL show the name only.

#### Scenario: First food becomes a chip

- **WHEN** the user types "Avocado" and confirms
- **THEN** an Avocado chip appears, it is selected, and the preference control for Avocado is shown

#### Scenario: Adding a second food

- **WHEN** an Avocado chip already exists and the user adds "Banana"
- **THEN** both chips are present and Banana is selected

### Requirement: Add a food not in autocomplete

When the typed name does not match an existing food, the suggestions list SHALL include an explicit action to add that name (e.g. Add “Quinoa”). Confirming that action or pressing Enter SHALL add a pending chip with that display name. No `foods` or `food_exposures` row SHALL be written until submit.

#### Scenario: Unknown name offered as add

- **WHEN** no existing food matches "quinoa"
- **THEN** the user is offered Add “Quinoa” (or equivalent) and can add it as a chip

### Requirement: Duplicate pending food blocked

The pending list SHALL NOT contain two chips with the same identity key (case-insensitive trimmed name). Attempting to add a duplicate SHALL leave the list unchanged and inform the user.

#### Scenario: Same name added twice

- **WHEN** Avocado is already a pending chip and the user tries to add "avocado"
- **THEN** a second chip is not added

## MODIFIED Requirements

### Requirement: Log a solid food exposure

When Solids is selected, the activity logger SHALL allow the user to log one or more pending foods in a single submit. Submitting SHALL, for each chip, create (or reuse) a canonical food and insert one food exposure with the shared event timestamp, that chip's preference (or unrated), optional comment copied from the meal comment field, inferred allergen tags applied only when creating a new food, and `had_reaction: false`. Unique foods SHALL still be counted separately in the passport.

#### Scenario: Logging a new solid food

- **WHEN** the user adds a new food name "Avocado" as the only chip, leaves preference unrated, and taps the log control
- **THEN** a `foods` row is created for Avocado and a `food_exposures` row is inserted linked to that food with unrated preference, `had_reaction: false`, and the chosen timestamp

#### Scenario: Re-logging an existing food

- **WHEN** the user adds existing food "Avocado" from autocomplete, sets preference "like", and logs
- **THEN** no duplicate food row is created and a new `food_exposures` row is inserted for Avocado with `preference: "like"`

#### Scenario: Logging several foods in one submit

- **WHEN** the user has chips Avocado, Banana, and Oatmeal and taps the log control
- **THEN** three `food_exposures` rows are inserted (one per food), all with the same timestamp, and the accordion collapses after success

#### Scenario: Empty pending list blocked

- **WHEN** there are no pending food chips and the user taps the log control
- **THEN** no insert occurs and the user is prompted to add a food

#### Scenario: After successful solid log

- **WHEN** one or more solid foods are successfully logged
- **THEN** the accordion collapses, form state resets, and the dashboard refreshes (passport, timeline, solids trend)

### Requirement: Food name autocomplete

The solids food name field SHALL offer autocomplete suggestions from previously logged foods as the user types. Matching SHALL be case-insensitive against the food's identity key. Selecting a suggestion SHALL add that food as a pending chip (not merely fill a single text field) and reuse that food on submit.

#### Scenario: Suggestions appear while typing

- **WHEN** foods "Avocado" and "Sweet Potato" exist and the user types "av"
- **THEN** "Avocado" appears as a suggestion

#### Scenario: Selecting a suggestion

- **WHEN** the user selects "Avocado" from suggestions
- **THEN** an Avocado chip is added and submit links the exposure to that existing food

### Requirement: Preference emoji selector

The solids form SHALL display preference choices matching the product set (dislike, neutral, okay, like) for the currently selected pending chip. Preference SHALL be optional: no choice is selected until the user taps one. Tapping a selected preference again MAY clear it back to unrated. Preference SHALL NOT default to neutral.

#### Scenario: Default preference

- **WHEN** a new chip is added
- **THEN** that food is unrated until the user taps a preference

#### Scenario: Changing preference

- **WHEN** the user selects the Avocado chip and taps like
- **THEN** like is stored on the pending Avocado item and the chip shows a like indicator

#### Scenario: Leaving preference unrated

- **WHEN** the user logs a chip without tapping a preference
- **THEN** the exposure is stored as unrated (preference absent), not as neutral

### Requirement: Classic 9 allergen tagging

The solids log form SHALL NOT display classic-nine allergen chips. On submit, allergen keys inferred from a **new** food's name SHALL be stored on that food record. Re-logging an existing food SHALL NOT overwrite that food's allergen set from inference.

#### Scenario: Tagging peanut on first log

- **WHEN** the user logs a new food "Peanut Butter" and the name infers peanut
- **THEN** the food's `allergens` include peanut

#### Scenario: No allergen inferred

- **WHEN** the user logs a new food "Avocado" with no inferred allergens
- **THEN** the food's `allergens` is empty

#### Scenario: Existing food allergens preserved

- **WHEN** Avocado already exists with a user-edited allergen set and the user re-logs Avocado from the chip composer
- **THEN** Avocado's stored allergens are unchanged

### Requirement: Optional non-allergy comment on log

The solids form SHALL provide a single optional free-text comment field for the submit (the meal). That text SHALL be stored on every exposure created by the submit. Comments SHALL NOT use allergy/reaction visual treatment.

#### Scenario: Logging with a comment

- **WHEN** the user has chips Avocado and Banana, enters comment "mashed well", and logs
- **THEN** both exposures are stored with that comment text

#### Scenario: Logging without a comment

- **WHEN** the user logs one or more chips with the comment field empty
- **THEN** each exposure is stored with a null comment

### Requirement: Prevent double submission on solid log

While a solid log request is in progress, the log control SHALL be disabled until the request completes (success or failure).

#### Scenario: Submit in progress

- **WHEN** the user taps the log control and the request is in progress
- **THEN** the button is disabled until the inserts complete

## REMOVED Requirements

### Requirement: Optional reaction at log time

**Reason**: The initial log must stay light; reactions are per food and already captured from Food Detail (including delayed).

**Migration**: Use Report reaction on Food Detail for any exposure after it is logged. Existing exposures with `had_reaction` are unchanged.
