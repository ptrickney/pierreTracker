## Purpose

Shows unique foods Pierre has tried, classic-nine allergen progress, and per-food exposure history so parents can explore the passport, correct past logs, and update reactions or comments.

## ADDED Requirements

### Requirement: Food Passport summary card

The dashboard SHALL display a "Pierre's Food Passport" (or equivalent milestone) card summarizing solid-food progress: count of unique foods introduced and count of classic-9 top allergens passed. The card SHALL include a control to open Explore Passport and a short preview of recently tried foods (name plus preference indicator when rated; unrated foods show the name without a preference emoji; reaction-flagged foods visually distinct). Unique-food count SHALL increase when a newly named food is logged, including when it is logged together with other foods in one submit.

#### Scenario: Passport with foods logged

- **WHEN** six unique foods have exposures and two classic-9 allergens meet the passed rule
- **THEN** the card shows 6 unique foods and 2 top allergens passed, plus a recent-tried preview

#### Scenario: Empty passport

- **WHEN** no solid food exposures exist
- **THEN** the card shows zero unique foods / zero allergens passed and an empty-state message inviting the user to log a solid

#### Scenario: Unrated food in preview

- **WHEN** the most recent try of a food in the preview is unrated
- **THEN** the preview shows that food's name without a preference emoji

#### Scenario: Multi-food log counts unique names

- **WHEN** the user logs Avocado (already in the passport) and new food Quinoa in one submit
- **THEN** the unique-food count increases by one

### Requirement: Top allergens passed definition

An allergen among the classic nine SHALL count as "passed" when at least one exposure exists for a food tagged with that allergen AND no exposure for any food tagged with that allergen has `had_reaction = true`.

#### Scenario: Allergen passed after clean try

- **WHEN** Egg is tagged on scrambled egg and that exposure has `had_reaction: false` with no other egg-tagged reaction exposures
- **THEN** Egg counts toward top allergens passed

#### Scenario: Allergen not passed after reaction

- **WHEN** Peanut is tagged on peanut butter and any peanut-tagged exposure has `had_reaction: true`
- **THEN** Peanut does NOT count as passed even if another exposure was clean

### Requirement: Explore Passport by category

Tapping Explore Passport SHALL open a view listing unique foods grouped by category. Each category SHALL show a count of foods. Each food row SHALL show display name, preference indicator from the latest exposure when that exposure is rated (omit the emoji when the latest exposure is unrated), first-tried or latest-tried date, and a reaction badge when any exposure for that food has `had_reaction: true`.

#### Scenario: Opening explore

- **WHEN** the user taps Explore Passport
- **THEN** a categorized list of unique foods is displayed

#### Scenario: Reaction-flagged food

- **WHEN** peanut butter has at least one reaction exposure
- **THEN** its row shows a reaction badge and distinct visual treatment

#### Scenario: Latest exposure unrated

- **WHEN** a food's latest exposure has no preference
- **THEN** its explore row does not show a preference emoji

### Requirement: Food Detail with full history

Tapping a food in Explore Passport SHALL open a Food Detail view for that food. The view SHALL list all exposures in reverse chronological order, each showing timestamp, preference when set (unrated when absent), reaction flag/notes if any, and comment if any.

#### Scenario: Opening food detail

- **WHEN** the user taps "Avocado" which has three exposures
- **THEN** Food Detail shows Avocado's metadata and all three exposures ordered newest first

#### Scenario: Re-logged food keeps one passport entry

- **WHEN** the same food is logged multiple times
- **THEN** Explore Passport still shows one row for that food and Food Detail shows every exposure

#### Scenario: Unrated exposure in history

- **WHEN** an exposure was logged without a preference
- **THEN** that history row indicates unrated rather than showing a default preference emoji

### Requirement: Report delayed reaction from Food Detail

Food Detail SHALL allow the user to report a reaction on an existing exposure (delayed symptoms). Completing the action SHALL set that exposure's `had_reaction` to true and store reaction notes, and SHALL update passport allergen-passed counts accordingly.

#### Scenario: Delayed reaction on past exposure

- **WHEN** the user opens Avocado's detail, chooses an exposure from earlier today, and reports reaction notes "rash 2 hours later"
- **THEN** that exposure is updated with `had_reaction: true` and those notes

### Requirement: Add non-allergy comment from Food Detail

Food Detail SHALL allow the user to add or edit a non-allergy comment on an existing exposure. Comment UI SHALL be visually distinct from reaction UI.

#### Scenario: Adding a comment later

- **WHEN** the user adds comment "try again with yogurt" to an exposure that had no comment
- **THEN** that exposure's comment field stores the text and the history row displays it

### Requirement: Passport refresh after solid activity

After a successful solid log, delayed reaction report, comment update, or exposure edit, the dashboard SHALL refresh passport summary and explore data without a full page reload.

#### Scenario: Refresh after log

- **WHEN** a new solid food is logged
- **THEN** the passport unique-food count and recent-tried preview update to include it

#### Scenario: Refresh after exposure edit

- **WHEN** an exposure’s food name or preference is edited from Food Detail
- **THEN** passport explore lists and Food Detail history reflect the saved values without a full page reload

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

### Requirement: Full-screen passport overlays

Explore Passport and Food Detail SHALL render as full-screen overlays that cover the entire viewport (no visible dashboard chrome above or beside the sheet). Background page scroll SHALL remain locked while either overlay is open.

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

Each exposure row in Food Detail SHALL offer a control to edit that solid-food entry. The edit form SHALL allow changing food name, category, preference, and classic-9 allergen tags. Saving SHALL persist those fields and refresh Food Detail and passport data without a full page reload. Preference on an edited exposure MAY remain unrated.

#### Scenario: Correct preference on a past log

- **WHEN** the user opens Avocado history, edits the Aug 3 exposure, changes preference from neutral to like, and saves
- **THEN** that exposure’s preference is like and the history row shows the updated preference

#### Scenario: Change food name on one exposure

- **WHEN** the user edits an exposure’s food name from “Avacado” to “Avocado” (or another food) and saves
- **THEN** that exposure is linked to the food matching the saved name (existing food reused or new food created), and category/allergens saved on that food are applied

#### Scenario: Update category and allergens

- **WHEN** the user edits an exposure and sets category to Fruits and tags Egg
- **THEN** the linked food’s category is Fruits and its allergens include Egg after save
