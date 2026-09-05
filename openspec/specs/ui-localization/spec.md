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
