## ADDED Requirements

### Requirement: Bottle versus Solids feeding toggle

The activity logger feed section SHALL display a segmented control with two options: "Bottle" and "Solids". Exactly one option SHALL be selected at a time. The default selection SHALL be "Bottle". Switching mode SHALL swap the feed controls between the bottle amount stepper / "Log Feed" path and the solids logging path without changing the shared date/time or diaper controls.

#### Scenario: Default mode is Bottle

- **WHEN** the accordion expands
- **THEN** "Bottle" is selected and the ml stepper and "Log Feed" button are visible

#### Scenario: Switching to Solids

- **WHEN** the user taps "Solids"
- **THEN** the ml stepper and "Log Feed" button are hidden and the solids logging controls are shown

#### Scenario: Switching back to Bottle

- **WHEN** the user taps "Bottle" while Solids is selected
- **THEN** the solids controls are hidden and the bottle ml stepper and "Log Feed" button are shown again

### Requirement: Solids path does not collect quantity

When Solids is selected, the activity logger SHALL NOT display an amount stepper or any portion/quantity field for the solid food entry.

#### Scenario: No quantity controls on Solids

- **WHEN** Solids is selected
- **THEN** no ml (or other quantity) stepper is visible in the feed section
