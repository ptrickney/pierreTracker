## ADDED Requirements

### Requirement: Log a solid food exposure

When Solids is selected, the activity logger SHALL allow the user to log exactly one solid food per submit. Submitting SHALL create (or reuse) a canonical food and insert one food exposure with the selected event timestamp, preference, optional reaction fields, optional comment, and allergen tags applied to the food.

#### Scenario: Logging a new solid food

- **WHEN** the user enters a new food name "Avocado", leaves preference at neutral, and taps "Log Solid Food"
- **THEN** a `foods` row is created for Avocado and a `food_exposures` row is inserted linked to that food with `preference: "neutral"`, `had_reaction: false`, and the chosen timestamp

#### Scenario: Re-logging an existing food

- **WHEN** the user selects an existing food "Avocado" from autocomplete and logs again with preference "like"
- **THEN** no duplicate food row is created and a new `food_exposures` row is inserted for Avocado with `preference: "like"`

#### Scenario: Empty food name blocked

- **WHEN** the food name field is empty and the user taps "Log Solid Food"
- **THEN** no insert occurs and the user is prompted to enter a food name

#### Scenario: After successful solid log

- **WHEN** a solid food is successfully logged
- **THEN** the accordion collapses, form state resets, and the dashboard refreshes (passport, timeline)

### Requirement: Food name autocomplete

The solids food name field SHALL offer autocomplete suggestions from previously logged foods as the user types. Matching SHALL be case-insensitive against the food's identity key. Selecting a suggestion SHALL fill the field with that food's display name and reuse that food on submit.

#### Scenario: Suggestions appear while typing

- **WHEN** foods "Avocado" and "Sweet Potato" exist and the user types "av"
- **THEN** "Avocado" appears as a suggestion

#### Scenario: Selecting a suggestion

- **WHEN** the user selects "Avocado" from suggestions
- **THEN** the input shows "Avocado" and submit links the exposure to that existing food

### Requirement: Preference emoji selector

The solids form SHALL display three preference choices: dislike, neutral, and like (presented as distinctive emoji buttons). Exactly one SHALL be selected. The default SHALL be neutral.

#### Scenario: Default preference

- **WHEN** the solids form is shown
- **THEN** the neutral preference is selected

#### Scenario: Changing preference

- **WHEN** the user taps the like preference
- **THEN** like becomes the selected preference for the pending log

### Requirement: Classic 9 allergen tagging

The solids form SHALL offer the classic nine allergens as selectable chips: Milk, Egg, Peanut, Tree nuts, Soy, Wheat, Fish, Shellfish, Sesame. The user MAY select zero or more. Selected allergens SHALL be stored on the food record (not only on the exposure).

#### Scenario: Tagging peanut on first log

- **WHEN** the user logs "Peanut Butter" with the Peanut chip selected
- **THEN** the food's `allergens` include peanut

#### Scenario: No allergen selected

- **WHEN** the user logs "Avocado" with no allergen chips selected
- **THEN** the food's `allergens` is empty

### Requirement: Optional non-allergy comment on log

The solids form SHALL provide an optional free-text comment field for notes unrelated to allergic reaction. Comments SHALL NOT use allergy/reaction visual treatment.

#### Scenario: Logging with a comment

- **WHEN** the user enters comment "mashed well" and logs the food
- **THEN** the exposure is stored with that comment text

### Requirement: Optional reaction at log time

The solids form SHALL allow the user to optionally mark an allergic reaction at log time (e.g. "Report reaction"), capturing reaction notes. When reported, the exposure SHALL have `had_reaction: true` and the provided notes.

#### Scenario: Logging with a reaction

- **WHEN** the user enables Report reaction, enters "hives around mouth", and submits
- **THEN** the exposure is stored with `had_reaction: true` and those reaction notes

#### Scenario: Logging without a reaction

- **WHEN** the user does not enable Report reaction and submits
- **THEN** the exposure is stored with `had_reaction: false` and null reaction notes

### Requirement: Prevent double submission on solid log

While a solid log request is in progress, the "Log Solid Food" button SHALL be disabled until the request completes.

#### Scenario: Submit in progress

- **WHEN** the user taps "Log Solid Food" and the request is in progress
- **THEN** the button is disabled until the insert completes
