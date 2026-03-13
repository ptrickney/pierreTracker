## ADDED Requirements

### Requirement: Display "Last Feed" highlighted card

The "Today's Summary" section SHALL display a prominent "Last Feed" card that shows the time and amount of the most recent feed event today. This card occupies the top-left position in a 2x2 grid and is visually highlighted (blue background, white text) to draw immediate attention. It displays a clock icon, the label "LAST FEED", the formatted time (e.g., "06:30 AM"), and the amount with unit (e.g., "4 oz").

#### Scenario: Feed events exist today

- **WHEN** there are feed events logged today
- **THEN** the Last Feed card displays the time and amount of the most recent feed, formatted as "HH:MM AM/PM" and "X oz"

#### Scenario: No feeds today

- **WHEN** there are no feed events logged today
- **THEN** the Last Feed card displays a dash or "—" indicating no recent feed

### Requirement: Display today's total feeding volume

The "Today's Summary" section SHALL display a "FED TODAY" stat card showing the total feeding volume for today, calculated by summing the `amount` field of all `logs` entries where `action_type = 'feed'` and the `timestamp` falls within the current local day. The value SHALL be displayed with its unit (e.g., "7.5 oz").

#### Scenario: Feeds exist today

- **WHEN** there are feed events logged today
- **THEN** the FED TODAY card displays the summed total volume with its unit

#### Scenario: No feeds today

- **WHEN** there are no feed events logged today
- **THEN** the FED TODAY card displays "0"

### Requirement: Display today's total sleep hours

The "Today's Summary" section SHALL display a "SLEPT TODAY" stat card showing the total sleep duration for today, calculated by summing the `amount` field of all `logs` entries where `action_type = 'sleep'` and the `timestamp` falls within the current local day. The value SHALL be displayed in hours (e.g., "2.5 hrs").

#### Scenario: Sleep events exist today

- **WHEN** there are sleep events logged today
- **THEN** the SLEPT TODAY card displays the summed total hours

#### Scenario: No sleep events today

- **WHEN** there are no sleep events logged today
- **THEN** the SLEPT TODAY card displays "0"

### Requirement: Display today's total diaper count

The "Today's Summary" section SHALL display a "DIAPERS TODAY" stat card showing the total number of diaper changes for today, calculated by counting all `logs` entries where `action_type = 'diaper'` and the `timestamp` falls within the current local day. The value SHALL be displayed with unit "chgs" (e.g., "2 chgs").

#### Scenario: Diaper events exist today

- **WHEN** there are diaper events logged today
- **THEN** the DIAPERS TODAY card displays the count with "chgs" unit

#### Scenario: No diaper events today

- **WHEN** there are no diaper events logged today
- **THEN** the DIAPERS TODAY card displays "0"

### Requirement: Summary cards arranged in a 2x2 grid

The four summary cards SHALL use a responsive layout:
- **Desktop (md and above)**: 2-column, 2-row grid. Last Feed card (top-left, highlighted blue), Fed Today (top-right), Slept Today (bottom-left), Diapers Today (bottom-right).
- **Mobile (below md)**: Single-column vertical stack. Last Feed card (full-width, top), then Fed Today, Slept Today, Diapers Today stacked below.

Each card (except Last Feed) has a light background with a colored icon matching its type. The Last Feed card is visually dominant with a solid blue background and white text. On mobile, each card spans the full width.

#### Scenario: Desktop grid layout

- **WHEN** the Today's Summary section renders on a screen width >= 768px
- **THEN** the four cards are displayed in a 2x2 grid with the Last Feed card visually prominent in the top-left position

#### Scenario: Mobile stacked layout

- **WHEN** the Today's Summary section renders on a screen width < 768px
- **THEN** the four cards are displayed in a single vertical column, full-width, with the Last Feed card on top

### Requirement: Each stat card has a distinct icon and color

Each stat card SHALL display a circular icon matching its type:
- Last Feed: clock icon on blue background
- Fed Today: globe/bottle icon on light blue
- Slept Today: moon icon on light purple
- Diapers Today: droplet icon on light green

#### Scenario: Visual distinction

- **WHEN** the Today's Summary section renders
- **THEN** each card displays its type-specific icon and color scheme
