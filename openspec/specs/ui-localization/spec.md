# ui-localization Specification

## Purpose
TBD - created by archiving change add-french-language. Update Purpose after archive.

## Requirements

### Requirement: Language toggle in the header

The dashboard header SHALL display a language toggle next to the theme toggle. Tapping it SHALL switch the entire UI between English and French immediately, without a page reload. The toggle SHALL indicate the language it switches to (e.g. shows "FR" while English is active).

#### Scenario: Switch to French

- **WHEN** the UI is in English and the user taps the language toggle
- **THEN** all UI text, dates, and times re-render in French in place

#### Scenario: Switch back to English

- **WHEN** the UI is in French and the user taps the language toggle
- **THEN** all UI text, dates, and times re-render in English

### Requirement: Language preference persistence and detection

The selected language SHALL be persisted per device in `localStorage` and restored on the next visit. When no stored preference exists, the app SHALL default to French if the browser language starts with `fr`, otherwise English.

#### Scenario: Preference survives reload

- **WHEN** the user selects French and reloads the page
- **THEN** the UI renders in French without re-selecting

#### Scenario: French browser defaults to French

- **WHEN** a visitor with a `fr-FR` browser opens the app for the first time on a device with no stored preference
- **THEN** the UI renders in French

#### Scenario: Non-French browser defaults to English

- **WHEN** a visitor with an `en-US` browser opens the app for the first time
- **THEN** the UI renders in English

### Requirement: Complete French translation of UI text

When French is active, every app-authored user-facing string SHALL render in French: header and date line, activity logger (log/cancel buttons, date/time labels, bottle/solids tabs, feed amount, food inputs, hints, validation messages, wet/dirty buttons), today's summary labels and units, food passport (card, explore view, category headings, food detail, edit forms, reaction/comment actions), all trend chart titles, navigation buttons, legends and descriptions, recent activity heading, event type labels, empty/loading/error states, theme toggle labels, the dirty-diaper celebration, and aria-labels on interactive controls.

#### Scenario: Logging a bottle feed in French

- **WHEN** French is active and the user opens the activity logger
- **THEN** the expand button, cancel, date/time labels, Bottle/Solids tabs, feed amount label, and the log button all display in French, and logging works as before

#### Scenario: Passport in French

- **WHEN** French is active and the user opens the Food Passport explore view
- **THEN** headings, category names, counts, empty states, and detail/edit actions display in French

#### Scenario: Event timeline labels in French

- **WHEN** French is active and the timeline lists a feed, a diaper, and a solid food event
- **THEN** the type labels render in French (e.g. "Biberon", "Couche", "Aliment solide") while user-entered food names and comments remain as typed

### Requirement: Localized dates and times

When French is active, dates SHALL format with French month/weekday names and times SHALL use the 24-hour clock via `fr-FR` locale formatting. This applies to the header date, last-feed and timeline timestamps, passport "tried" dates, and trend chart axis and window labels. English keeps existing `en-US` formats.

#### Scenario: Header date in French

- **WHEN** French is active on `2026-09-05`
- **THEN** the header shows a French-formatted date (e.g. "samedi 5 septembre")

#### Scenario: Timeline time in French

- **WHEN** French is active and an event occurred at 2:30 PM today
- **THEN** its timestamp renders in 24-hour format (e.g. "14:30")

#### Scenario: Chart labels re-localize

- **WHEN** the user switches language while a trend chart is visible
- **THEN** the chart's title, buttons, legend, and day-axis labels re-render in the new language

### Requirement: Document language attribute

The `<html lang>` attribute SHALL reflect the active language (`fr` or `en`) so assistive technology announces content correctly.

#### Scenario: lang updates on switch

- **WHEN** the user switches the UI to French
- **THEN** `document.documentElement.lang` is `fr`

### Requirement: User data is never translated

Food names, comments, and reaction notes entered by users SHALL display exactly as stored, regardless of active language.

#### Scenario: English food name under French UI

- **WHEN** French is active and a food named "Peanut Butter" exists
- **THEN** the passport and timeline show "Peanut Butter" unchanged

### Requirement: French food names infer passport categories

Category inference SHALL recognize common French baby-food names (fruits, vegetables, proteins, grains, dairy) in addition to English ones, matching accent-insensitively, so French-named foods land in the correct passport category instead of "Other". Multi-word French keywords SHALL take precedence over shorter contained words (e.g. "pomme de terre" is a vegetable even though "pomme" is a fruit).

#### Scenario: French vegetable

- **WHEN** a food named "Carotte" is created
- **THEN** its inferred category is `vegetables`

#### Scenario: Accented French fruit

- **WHEN** a food named "Pêche" is created
- **THEN** its inferred category is `fruits` (with or without the accent)

#### Scenario: Longer phrase wins

- **WHEN** a food named "Pomme de terre" is created
- **THEN** its inferred category is `vegetables`, not `fruits`

#### Scenario: English names keep working

- **WHEN** a food named "Sweet Potato" is created
- **THEN** its inferred category is `vegetables`, exactly as before

### Requirement: French food names infer classic-9 allergens

Allergen inference SHALL recognize French names for the classic-9 allergens (accent-insensitively), including exclusions mirroring the English rules: plant butters ("beurre de cacahuète", "beurre d'amande", "beurre de cajou") are not dairy, and "noix de coco" is not a tree nut.

#### Scenario: French peanut butter

- **WHEN** a food named "Beurre de cacahuète" is created
- **THEN** its inferred allergens include `peanut` and do not include `milk`

#### Scenario: French egg

- **WHEN** a food named "Œuf" is created
- **THEN** its inferred allergens include `egg`

#### Scenario: Coconut is not a tree nut

- **WHEN** a food named "Noix de coco" is created
- **THEN** its inferred allergens do not include `tree_nuts`

### Requirement: Existing mis-categorized French foods are backfilled

Foods already stored with category `other` whose name now infers a real category SHALL be updated to that category, and foods with an empty allergen list whose name now infers allergens SHALL receive them. Manually assigned categories (anything other than `other`) and non-empty allergen lists SHALL never be overwritten.

#### Scenario: Previously logged French food

- **WHEN** the backfill runs and a food "Carotte" is stored with category `other`
- **THEN** its category becomes `vegetables`

#### Scenario: Manual choices preserved

- **WHEN** the backfill runs and a food was manually set to `dairy` or has manually curated allergens
- **THEN** that food's category and allergens are unchanged
