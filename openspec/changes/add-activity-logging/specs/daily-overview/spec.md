## MODIFIED Requirements

### Requirement: Summary cards arranged in a 2x2 grid

The four summary cards SHALL use a responsive layout:
- **Desktop (md and above)**: 2-column, 2-row grid. Last Feed card (top-left, highlighted blue), Fed Today (top-right), Slept Today (bottom-left), Diapers Today (bottom-right).
- **Mobile (below md)**: Single-column vertical stack. Last Feed card (full-width, top), then Fed Today, Slept Today, Diapers Today stacked below.

The "Log Activity" accordion SHALL be placed above the Today's Summary section, between the page header and the summary cards. The summary cards layout itself is unchanged.

#### Scenario: Desktop grid layout

- **WHEN** the Today's Summary section renders on a screen width >= 768px
- **THEN** the four cards are displayed in a 2x2 grid with the Last Feed card visually prominent in the top-left position

#### Scenario: Mobile stacked layout

- **WHEN** the Today's Summary section renders on a screen width < 768px
- **THEN** the four cards are displayed in a single vertical column, full-width, with the Last Feed card on top

#### Scenario: Log Activity accordion placement

- **WHEN** the dashboard renders
- **THEN** the "LOG ACTIVITY" accordion appears between the page header and the Today's Summary cards
