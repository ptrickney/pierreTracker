## Purpose

Show how many solid-food exposures Pierre logged each day so parents can see solids volume over a week, similar to diaper trends.

## ADDED Requirements

### Requirement: Solid foods daily count chart

The dashboard SHALL display a Solid Foods trend chart for a 7-day window. Each day SHALL show a bar for the count of solid-food exposures logged that local calendar day. The chart SHALL support previous/next/today window navigation consistent with other 7-day trend charts and SHALL show a running 7-day average of daily exposure counts.

#### Scenario: Days with solids

- **WHEN** three solid exposures were logged on Monday and one on Tuesday in the visible window
- **THEN** Monday’s bar is 3 and Tuesday’s bar is 1

#### Scenario: Empty days

- **WHEN** no solid exposures exist for a day in the window
- **THEN** that day’s count is 0

#### Scenario: Placement

- **WHEN** the dashboard loads with charts
- **THEN** the solids chart appears with the other trend charts (after feeding / near diaper)
