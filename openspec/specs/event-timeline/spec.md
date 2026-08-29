## ADDED Requirements

### Requirement: Display "Recent Activity" timeline of today's events

The dashboard SHALL display a "Recent Activity" section containing a scrollable list of all events from the `logs` table where the `timestamp` falls within the current local day, sorted by `timestamp` descending (most recent first).

#### Scenario: Events exist today

- **WHEN** there are events logged today
- **THEN** the dashboard displays all events in a vertical list under the "Recent Activity" heading, sorted most recent first

#### Scenario: No events today

- **WHEN** there are no events logged today
- **THEN** the dashboard displays an empty state message (e.g., "No events recorded today")

### Requirement: Each event shows type, time, and details

Each event row in the timeline SHALL display:
- A circular icon on the left matching the `action_type` (colored: feed=blue, sleep=purple, diaper=green)
- The `action_type` label in bold (e.g., "Feed", "Diaper", "Sleep")
- The `amount` and `unit` in a secondary line (e.g., "4 oz", "2.5 hours", "1 wet")
- The `details` text separated by a pipe character (e.g., "| crushed the whole bottle")
- The formatted `timestamp` right-aligned with a clock icon (e.g., "06:30 AM")

#### Scenario: Feed event display

- **WHEN** a feed event is rendered
- **THEN** it shows a blue icon, "Feed" label, amount with unit (e.g., "4 oz"), details if present, and the formatted time on the right

#### Scenario: Sleep event display

- **WHEN** a sleep event is rendered
- **THEN** it shows a purple icon, "Sleep" label, duration with unit (e.g., "4 hours"), details if present, and the formatted time on the right

#### Scenario: Diaper event display

- **WHEN** a diaper event is rendered
- **THEN** it shows a green icon, "Diaper" label, count and type (e.g., "1 wet" or "1 dirty"), details if present, and the formatted time on the right

### Requirement: Events are visually distinguished by action type

Each event in the timeline SHALL have a distinct circular icon and color based on its kind. Feed, sleep, diaper, and solid events MUST be immediately distinguishable from each other.

#### Scenario: Visual distinction across types

- **WHEN** the timeline contains events of different kinds including a solid exposure
- **THEN** each event kind has a unique colored circular icon that makes it visually distinguishable

### Requirement: "View All History" footer link

The Recent Activity section SHALL display a "View All History" link centered at the bottom of the event list. This link is styled as a text link (blue, no button chrome).

#### Scenario: Footer link rendering

- **WHEN** the Recent Activity section renders with events
- **THEN** a "View All History" text link is displayed centered below the last event

#### Scenario: Footer link action (MVP)

- **WHEN** the user clicks "View All History"
- **THEN** no navigation occurs in the MVP (placeholder for future functionality)

### Requirement: Each event row has a delete control

Each event row in the Recent Activity timeline SHALL display a delete control (e.g., trash icon) that allows the user to delete that activity. The control SHALL be visually distinct and placed so it is clear which activity it applies to (e.g., right-aligned on the row). The control SHALL meet the minimum touch target size of 44x44px for mobile usability.

#### Scenario: Delete control visible per row

- **WHEN** the timeline renders one or more event rows
- **THEN** each row displays a delete control (e.g., trash icon) associated with that event

#### Scenario: Delete control triggers delete

- **WHEN** the user activates the delete control for an event (e.g., taps the trash icon)
- **THEN** the system initiates delete for that event's `id` and, on success, refreshes the timeline so the row is removed

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
