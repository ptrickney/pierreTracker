## MODIFIED Requirements

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
