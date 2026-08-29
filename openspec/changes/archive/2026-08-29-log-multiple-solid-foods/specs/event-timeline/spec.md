## MODIFIED Requirements

### Requirement: Solid food events appear in Recent Activity

The Recent Activity timeline SHALL include solid food exposures merged with `logs` events, sorted by timestamp descending. Solid rows SHALL be visually distinct from bottle feeds (distinct color/icon) and SHALL NOT display an ml amount. A meal logged as several foods SHALL appear as several rows (one per exposure), not a single grouped meal row.

#### Scenario: Solid exposure in timeline

- **WHEN** a solid exposure for "Avocado" with preference like exists among recent activity
- **THEN** the timeline shows a solid row labeled appropriately (e.g. "Solid" or "Solid Food") with the food name and preference indicator

#### Scenario: Unrated solid in timeline

- **WHEN** a solid exposure for "Banana" is unrated
- **THEN** the row shows the food name and does not display a preference emoji

#### Scenario: Solid does not look like a bottle feed

- **WHEN** both a bottle feed and a solid exposure are listed
- **THEN** they use different icons/colors and the solid row does not show an ml volume

#### Scenario: Multi-food submit appears as multiple rows

- **WHEN** Avocado, Banana, and Oatmeal were logged in one submit at the same timestamp
- **THEN** the timeline shows three distinct solid rows

### Requirement: Solid timeline row content

Each solid timeline row SHALL display the food name, a preference indicator when a preference is set, a reaction hint when `had_reaction` is true, and a comment snippet when a comment exists, plus the formatted timestamp. Unrated exposures SHALL omit the preference indicator. Deleting a solid row SHALL delete that food exposure (not the canonical food) and refresh the timeline.

#### Scenario: Reaction and comment visible

- **WHEN** an exposure has `had_reaction: true` and comment "mashed well"
- **THEN** the row indicates a reaction and shows the comment snippet

#### Scenario: Delete solid exposure

- **WHEN** the user deletes a solid timeline row
- **THEN** that `food_exposures` row is removed and the timeline refreshes; the `foods` row remains unless product later defines orphan cleanup
