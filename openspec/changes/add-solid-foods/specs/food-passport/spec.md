## ADDED Requirements

### Requirement: Food Passport summary card

The dashboard SHALL display a "Pierre's Food Passport" (or equivalent milestone) card summarizing solid-food progress: count of unique foods introduced and count of classic-9 top allergens passed. The card SHALL include a control to open Explore Passport and a short preview of recently tried foods (name + preference; reaction-flagged foods visually distinct).

#### Scenario: Passport with foods logged

- **WHEN** six unique foods have exposures and two classic-9 allergens meet the passed rule
- **THEN** the card shows 6 unique foods and 2 top allergens passed, plus a recent-tried preview

#### Scenario: Empty passport

- **WHEN** no solid food exposures exist
- **THEN** the card shows zero unique foods / zero allergens passed and an empty-state message inviting the user to log a solid

### Requirement: Top allergens passed definition

An allergen among the classic nine SHALL count as "passed" when at least one exposure exists for a food tagged with that allergen AND no exposure for any food tagged with that allergen has `had_reaction = true`.

#### Scenario: Allergen passed after clean try

- **WHEN** Egg is tagged on scrambled egg and that exposure has `had_reaction: false` with no other egg-tagged reaction exposures
- **THEN** Egg counts toward top allergens passed

#### Scenario: Allergen not passed after reaction

- **WHEN** Peanut is tagged on peanut butter and any peanut-tagged exposure has `had_reaction: true`
- **THEN** Peanut does NOT count as passed even if another exposure was clean

### Requirement: Explore Passport by category

Tapping Explore Passport SHALL open a view listing unique foods grouped by category. Each category SHALL show a count of foods. Each food row SHALL show display name, preference indicator (from latest exposure), first-tried or latest-tried date, and a reaction badge when any exposure for that food has `had_reaction: true`.

#### Scenario: Opening explore

- **WHEN** the user taps Explore Passport
- **THEN** a categorized list of unique foods is displayed

#### Scenario: Reaction-flagged food

- **WHEN** peanut butter has at least one reaction exposure
- **THEN** its row shows a reaction badge and distinct visual treatment

### Requirement: Food Detail with full history

Tapping a food in Explore Passport SHALL open a Food Detail view for that food. The view SHALL list all exposures in reverse chronological order, each showing timestamp, preference, reaction flag/notes if any, and comment if any.

#### Scenario: Opening food detail

- **WHEN** the user taps "Avocado" which has three exposures
- **THEN** Food Detail shows Avocado's metadata and all three exposures ordered newest first

#### Scenario: Re-logged food keeps one passport entry

- **WHEN** the same food is logged multiple times
- **THEN** Explore Passport still shows one row for that food and Food Detail shows every exposure

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

After a successful solid log, delayed reaction report, or comment update, the dashboard SHALL refresh passport summary and explore data without a full page reload.

#### Scenario: Refresh after log

- **WHEN** a new solid food is logged
- **THEN** the passport unique-food count and recent-tried preview update to include it
