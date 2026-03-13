## ADDED Requirements

### Requirement: Display 7-day feeding volume bar chart

The dashboard SHALL display a bar chart showing the total feeding volume per day for the last 7 days (including today). Each bar represents one day, and the height corresponds to the summed `amount` for all `logs` entries where `action_type = 'feed'` on that day.

#### Scenario: Feeding data exists for the past 7 days

- **WHEN** there are feed events in the last 7 days
- **THEN** the chart displays one bar per day with height proportional to that day's total volume

#### Scenario: No feeding data for some days

- **WHEN** some days in the 7-day range have no feed events
- **THEN** those days display a bar with zero height (or no bar) while still showing the day label on the x-axis

#### Scenario: No feeding data at all

- **WHEN** there are no feed events in the last 7 days
- **THEN** the chart displays an empty state with all bars at zero

### Requirement: Chart axes and labels

The bar chart SHALL display:
- X-axis: Day labels in "Mar DD" format (e.g., "Mar 07", "Mar 08")
- Y-axis: Numeric volume scale (e.g., 0, 8, 16, 24, 32)
- Section heading: "Feeding Volume (7 Days)"

#### Scenario: Axis rendering

- **WHEN** the chart renders with data
- **THEN** the x-axis shows "Mar DD" labels for each day and the y-axis shows a numeric volume scale

### Requirement: Chart is rendered using Recharts

The bar chart SHALL be implemented using the Recharts library to keep the bundle size small and maintain React-idiomatic patterns.

#### Scenario: Recharts integration

- **WHEN** the chart component mounts
- **THEN** it renders a Recharts `BarChart` with `Bar`, `XAxis`, `YAxis`, and `Tooltip` components
