## ADDED Requirements

### Requirement: Each event row has a delete control

Each event row in the Recent Activity timeline SHALL display a delete control (e.g., trash icon) that allows the user to delete that activity. The control SHALL be visually distinct and placed so it is clear which activity it applies to (e.g., right-aligned on the row). The control SHALL meet the minimum touch target size of 44x44px for mobile usability.

#### Scenario: Delete control visible per row

- **WHEN** the timeline renders one or more event rows
- **THEN** each row displays a delete control (e.g., trash icon) associated with that event

#### Scenario: Delete control triggers delete

- **WHEN** the user activates the delete control for an event (e.g., taps the trash icon)
- **THEN** the system initiates delete for that event's `id` and, on success, refreshes the timeline so the row is removed
