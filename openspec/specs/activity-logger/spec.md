## ADDED Requirements

### Requirement: Log Activity accordion trigger

The dashboard SHALL display a "LOG ACTIVITY" button between the header and the Today's Summary section. The button SHALL have a "+" icon on the left and uppercase "LOG ACTIVITY" text. When tapped, it expands an accordion panel containing the logging controls. The button area SHALL have a light blue-gray background with a rounded border to match the dashboard card style.

#### Scenario: Accordion collapsed (default state)

- **WHEN** the page loads
- **THEN** only the "LOG ACTIVITY" button is visible; the logging form is hidden

#### Scenario: Expanding the accordion

- **WHEN** the user taps the "LOG ACTIVITY" button
- **THEN** the accordion smoothly expands to reveal the cancel button, time picker, feed logger, and diaper buttons

### Requirement: Cancel button to collapse accordion

The expanded accordion SHALL display a "CANCEL" button with an "X" icon at the top. Tapping it SHALL collapse the accordion, discard any in-progress input, and return to the default collapsed state.

#### Scenario: Cancelling activity logging

- **WHEN** the user taps the "CANCEL" button while the accordion is expanded
- **THEN** the accordion collapses, all form inputs reset to defaults, and only the "LOG ACTIVITY" button is visible

### Requirement: Event time picker with 5-minute increments

The accordion SHALL display an "EVENT TIME" field showing a time value in `HH:MM` format (24-hour). The time SHALL be adjustable and SHALL only allow values in 5-minute increments (e.g., 15:50, 15:55, 16:00). The default value SHALL be the current time minus 15 minutes, rounded down to the nearest 5-minute mark.

#### Scenario: Default time on accordion open

- **WHEN** the accordion expands at 16:07
- **THEN** the time picker displays "15:50" (16:07 minus 15 minutes = 15:52, rounded down to nearest 5 = 15:50)

#### Scenario: Default time on accordion open (exact 5-minute boundary)

- **WHEN** the accordion expands at 16:15
- **THEN** the time picker displays "16:00" (16:15 minus 15 minutes = 16:00, already on 5-minute boundary)

#### Scenario: Adjusting the time

- **WHEN** the user interacts with the time picker
- **THEN** only values on 5-minute increments are selectable

### Requirement: Feed amount stepper

The accordion SHALL display a feed amount stepper with a "-" button, a numeric display showing the current amount with "ml" unit label, and a "+" button. The stepper SHALL increment/decrement by 10ml per tap. The minimum value SHALL be 0ml and the maximum SHALL be 500ml. The default value SHALL be 120ml.

#### Scenario: Default feed amount

- **WHEN** the accordion expands
- **THEN** the feed amount stepper displays "120 ml"

#### Scenario: Incrementing feed amount

- **WHEN** the user taps the "+" button while the amount is 120ml
- **THEN** the displayed amount changes to "130 ml"

#### Scenario: Decrementing feed amount

- **WHEN** the user taps the "-" button while the amount is 120ml
- **THEN** the displayed amount changes to "110 ml"

#### Scenario: Minimum bound

- **WHEN** the user taps the "-" button while the amount is 0ml
- **THEN** the amount remains at "0 ml" and the "-" button appears disabled

#### Scenario: Maximum bound

- **WHEN** the user taps the "+" button while the amount is 500ml
- **THEN** the amount remains at "500 ml" and the "+" button appears disabled

### Requirement: Log Feed button

The accordion SHALL display a prominent "Log Feed" button (blue background, white text, bottle/feed emoji icon) below the feed amount stepper. Tapping it SHALL insert a new feed event into the `logs` table with the selected time and amount.

#### Scenario: Logging a feed

- **WHEN** the user sets time to 15:50, amount to 130ml, and taps "Log Feed"
- **THEN** a new row is inserted into `logs` with `action_type: "feed"`, `amount: 130`, `unit: "ml"`, `timestamp` set to today at 15:50, and `details: null`

#### Scenario: After successful feed log

- **WHEN** a feed event is successfully logged
- **THEN** the accordion collapses, the form resets to defaults, and the dashboard data refreshes to show the new event in Today's Summary and Recent Activity

#### Scenario: Preventing double submission

- **WHEN** the user taps "Log Feed" and the request is in progress
- **THEN** the button is disabled until the insert completes

### Requirement: Diaper type buttons (Wet / Dirty)

The accordion SHALL display two diaper buttons below the feed section: a "Wet" button (green tint, water droplet emoji) and a "Dirty" button (yellow/brown tint, poop emoji). Each button is a one-tap action that immediately logs a diaper event.

#### Scenario: Logging a wet diaper

- **WHEN** the user taps the "Wet" button with time set to 15:50
- **THEN** a new row is inserted into `logs` with `action_type: "diaper"`, `amount: 1`, `unit: "wet"`, `timestamp` set to today at 15:50, and `details: null`

#### Scenario: Logging a dirty diaper

- **WHEN** the user taps the "Dirty" button with time set to 15:50
- **THEN** a new row is inserted into `logs` with `action_type: "diaper"`, `amount: 1`, `unit: "dirty"`, `timestamp` set to today at 15:50, and `details: null`

#### Scenario: After successful diaper log

- **WHEN** a diaper event is successfully logged
- **THEN** the accordion collapses, the form resets to defaults, and the dashboard data refreshes

#### Scenario: Preventing double submission on diaper buttons

- **WHEN** the user taps a diaper button and the request is in progress
- **THEN** both diaper buttons are disabled until the insert completes

### Requirement: Dashboard data refresh after logging

After any successful log (feed or diaper), the dashboard SHALL re-fetch today's logs from the `logs` table and update all dependent components (Today's Summary, Recent Activity) with the new data. No full page reload SHALL occur.

#### Scenario: Data refresh after logging

- **WHEN** a new event is successfully inserted
- **THEN** `fetchTodayLogs()` is called, and `TodaySummary` and `RecentActivity` components re-render with the updated log list

### Requirement: Mobile-friendly touch targets

All interactive elements in the accordion (buttons, stepper controls, time picker) SHALL have a minimum touch target size of 44x44px to ensure usability on mobile devices.

#### Scenario: Touch target sizes

- **WHEN** the accordion is rendered on a mobile device
- **THEN** all tappable elements meet the 44x44px minimum touch target guideline
