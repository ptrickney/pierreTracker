## Purpose

Food Passport explore and detail overlays must own scroll interaction so parents can browse foods without moving the dashboard underneath.

## ADDED Requirements

### Requirement: Passport overlay contains scroll

While Explore Passport or Food Detail is open, scroll gestures SHALL apply to the overlay’s scrollable content area when that content overflows. Scroll gestures SHALL NOT move the dashboard (or other page content) behind the overlay.

#### Scenario: Long passport list scrolls inside overlay

- **WHEN** Explore Passport is open and the categorized food list is taller than the visible overlay
- **THEN** vertical scroll moves the passport list inside the overlay and the dashboard behind stays fixed

#### Scenario: Short passport content does not scroll the page

- **WHEN** Explore Passport is open and the content fits without overflowing
- **THEN** vertical scroll gestures do not move the dashboard behind the overlay

#### Scenario: Food Detail contains scroll the same way

- **WHEN** Food Detail is open with an exposure history longer than the visible overlay
- **THEN** vertical scroll moves the detail content inside the overlay and the dashboard behind stays fixed
