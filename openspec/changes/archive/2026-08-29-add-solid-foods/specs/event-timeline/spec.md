## ADDED Requirements

### Requirement: Solid food events appear in Recent Activity

The Recent Activity timeline SHALL include solid food exposures merged with `logs` events, sorted by timestamp descending. Solid rows SHALL be visually distinct from bottle feeds (distinct color/icon) and SHALL NOT display an ml amount.

#### Scenario: Solid exposure in timeline

- **WHEN** a solid exposure for "Avocado" with preference like exists among recent activity
- **THEN** the timeline shows a solid row labeled appropriately (e.g. "Solid" or "Solid Food") with the food name and preference indicator

#### Scenario: Solid does not look like a bottle feed

- **WHEN** both a bottle feed and a solid exposure are listed
- **THEN** they use different icons/colors and the solid row does not show an ml volume

### Requirement: Solid timeline row content

Each solid timeline row SHALL display the food name, preference indicator, a reaction hint when `had_reaction` is true, and a comment snippet when a comment exists, plus the formatted timestamp. Deleting a solid row SHALL delete that food exposure (not the canonical food) and refresh the timeline.

#### Scenario: Reaction and comment visible

- **WHEN** an exposure has `had_reaction: true` and comment "mashed well"
- **THEN** the row indicates a reaction and shows the comment snippet

#### Scenario: Delete solid exposure

- **WHEN** the user deletes a solid timeline row
- **THEN** that `food_exposures` row is removed and the timeline refreshes; the `foods` row remains unless product later defines orphan cleanup

## MODIFIED Requirements

### Requirement: Events are visually distinguished by action type

Each event in the timeline SHALL have a distinct circular icon and color based on its kind. Feed, sleep, diaper, and solid events MUST be immediately distinguishable from each other.

#### Scenario: Visual distinction across types

- **WHEN** the timeline contains events of different kinds including a solid exposure
- **THEN** each event kind has a unique colored circular icon that makes it visually distinguishable
