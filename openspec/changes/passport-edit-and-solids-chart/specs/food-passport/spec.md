## Purpose

Food Passport is the place to review and correct solid-food history: full-screen explore/detail, and editable exposure logs.

## ADDED Requirements

### Requirement: Full-screen passport overlays

Explore Passport and Food Detail SHALL render as full-screen overlays that cover the entire viewport (no visible dashboard chrome above or beside the sheet). Background page scroll SHALL remain locked while either overlay is open (see scroll-containment behavior from `fix-passport-scroll-lock`).

#### Scenario: Opening explore covers the screen

- **WHEN** the user taps Explore Passport
- **THEN** the passport view fills the viewport and the dashboard title/date are not visible behind a partial sheet

#### Scenario: Food Detail is also full-screen

- **WHEN** the user opens a food from Explore Passport
- **THEN** Food Detail fills the viewport the same way

### Requirement: Visually distinct category groups in Explore Passport

Explore Passport SHALL render each food category as a visually contained group (a tinted, bordered panel with its own header) so adjacent categories are distinguishable at a glance. Each category SHALL have its own color tint that remains legible in both light and dark themes. Each group header SHALL show the category label and its food count, and the foods in the group SHALL be visually nested inside that group.

#### Scenario: Adjacent categories are distinguishable

- **WHEN** the passport shows Vegetables and Fruits with foods in each
- **THEN** each category’s foods appear inside a distinct color-tinted container with that category’s header and count

#### Scenario: Tints stay legible in dark mode

- **WHEN** the passport is viewed with the dark theme active
- **THEN** every category panel renders a dark tint with readable text

### Requirement: Passport stats are labeled

Passport summary statistics (foods explored, top allergens passed) SHALL be presented as labeled elements where any icon is attached to the statistic it represents. A decorative icon SHALL NOT appear detached from its statistic.

#### Scenario: Allergen stat carries its icon

- **WHEN** the passport header or card displays the top-allergens-passed count
- **THEN** the shield icon appears as part of that statistic’s label rather than orphaned on its own line

### Requirement: Edit solid exposure from Food Detail history

Each exposure row in Food Detail SHALL offer a control to edit that solid-food entry. The edit form SHALL allow changing food name, category, preference, and classic-9 allergen tags. Saving SHALL persist those fields and refresh Food Detail and passport data without a full page reload.

#### Scenario: Correct preference on a past log

- **WHEN** the user opens Avocado history, edits the Aug 3 exposure, changes preference from neutral to like, and saves
- **THEN** that exposure’s preference is like and the history row shows the updated preference

#### Scenario: Change food name on one exposure

- **WHEN** the user edits an exposure’s food name from “Avacado” to “Avocado” (or another food) and saves
- **THEN** that exposure is linked to the food matching the saved name (existing food reused or new food created), and category/allergens saved on that food are applied

#### Scenario: Update category and allergens

- **WHEN** the user edits an exposure and sets category to Fruits and tags Egg
- **THEN** the linked food’s category is Fruits and its allergens include Egg after save

## MODIFIED Requirements

### Requirement: Passport refresh after solid activity

After a successful solid log, delayed reaction report, comment update, **or exposure edit**, the dashboard SHALL refresh passport summary and explore data without a full page reload.

#### Scenario: Refresh after log

- **WHEN** a new solid food is logged
- **THEN** the passport unique-food count and recent-tried preview update to include it

#### Scenario: Refresh after exposure edit

- **WHEN** an exposure’s food name or preference is edited from Food Detail
- **THEN** passport explore lists and Food Detail history reflect the saved values without a full page reload
