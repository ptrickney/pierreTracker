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

Each event in the timeline SHALL have a distinct circular icon and color based on its `action_type`. Feed, sleep, and diaper events MUST be immediately distinguishable from each other using the same color scheme as the summary cards.

#### Scenario: Visual distinction across types

- **WHEN** the timeline contains events of different action types
- **THEN** each event type has a unique colored circular icon that makes it visually distinguishable

### Requirement: "View All History" footer link

The Recent Activity section SHALL display a "View All History" link centered at the bottom of the event list. This link is styled as a text link (blue, no button chrome).

#### Scenario: Footer link rendering

- **WHEN** the Recent Activity section renders with events
- **THEN** a "View All History" text link is displayed centered below the last event

#### Scenario: Footer link action (MVP)

- **WHEN** the user clicks "View All History"
- **THEN** no navigation occurs in the MVP (placeholder for future functionality)
