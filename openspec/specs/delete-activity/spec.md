## ADDED Requirements

### Requirement: User can delete an activity by ID

The system SHALL allow the user to delete a single activity (log row) by its `id`. Deleting SHALL remove the corresponding row from the `logs` table. After a successful delete, the dashboard SHALL refresh the log list (e.g., re-fetch today's logs) so that Today's Summary and Recent Activity reflect the removal without a full page reload.

#### Scenario: Successful delete

- **WHEN** the user triggers delete for an activity with a valid `id` and the delete succeeds
- **THEN** the row is removed from the `logs` table and the UI updates so the activity no longer appears in the timeline or in Today's Summary

#### Scenario: Delete in progress

- **WHEN** a delete request is in progress for an activity
- **THEN** the delete control (or row) is disabled or otherwise indicates loading until the request completes

#### Scenario: Delete fails

- **WHEN** the delete request fails (e.g., network or server error)
- **THEN** the activity remains in the UI and the user is informed of the error (e.g., toast or inline message); the row is not removed
