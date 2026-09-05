## Why

Pierre's grandmother is now his primary daytime caregiver and only speaks French. Today every label, button, form, chart, and date in the tracker is hard-coded English, so she cannot read the dashboard or log feeds, solids, and diapers on her own. The app needs full French support so she can do everything — read and log — in French, while the parents keep using English on their own devices.

## What Changes

- Add a lightweight client-side i18n layer (no new dependencies): typed English and French message dictionaries, a `LanguageProvider` React context, and a `useI18n()` hook exposing the active locale and translated strings
- Add a **FR / EN language toggle** in the dashboard header next to the theme toggle; the choice is persisted per device in `localStorage`
- Default language is detected from the browser (`navigator.language` starting with `fr` → French, otherwise English), so a French-configured phone shows French on first visit with no setup
- Translate every user-facing string: header, activity logger (bottle / solids / diapers forms), today's summary, food passport (card, explore view, food detail, edit forms), all three trend charts (titles, nav buttons, legends, descriptions), recent activity timeline, theme toggle, dirty-diaper celebration, loading/empty/error states, and aria-labels
- Localize dates and times: French renders with `fr-FR` formatting (French weekday/month names, 24-hour clock); English keeps current `en-US` formats
- Update `<html lang>` dynamically to match the active language

## Non-goals

- User-entered data (food names, comments, reaction notes) is stored and displayed as typed — no translation of content
- No URL-based locale routing (`/fr/...`) and no i18n framework (next-intl, react-i18next); the app is a single client-rendered page and a context + dictionaries is sufficient
- No server-side locale negotiation; detection happens in the browser
- No additional languages beyond English and French (the dictionary structure makes adding more straightforward later)

## Assumptions recorded (in lieu of follow-up questions)

- A per-device toggle persisted in `localStorage` (like the existing theme preference) is the right model: grandmother's phone stays French, parents' phones stay English
- Data-layer units stored in Supabase (`ml`, `wet`, `dirty`) are unchanged; only their display labels are translated
- Low-level Supabase error messages (e.g. network failures) may surface in English; all app-authored messages are translated

## Capabilities

### New Capabilities
- `ui-localization`: Language selection (toggle + browser detection + persistence) and complete French/English translation of all UI text, dates, and times

### Modified Capabilities

None — existing capability behavior is unchanged; their surfaces render translated strings via the new localization layer.

## Impact

- **New code**: `src/lib/i18n.tsx` (or `src/lib/i18n/`) with dictionaries, provider, hook, and locale-aware date/time helpers; `LanguageToggle` component
- **UI**: String extraction across `page.tsx`, `ActivityLogger`, `TodaySummary`, `RecentActivity`, `EventRow`, `FoodPassport`, `FeedingTrendChart`, `DiaperTrendChart`, `SolidsTrendChart`, `ThemeToggle`, `DirtyDiaperCelebration`; provider mounted in `AppShell`
- **Shared constants**: `foodConstants.ts` option arrays (categories, allergens, preferences) keep their keys; labels resolve through the dictionaries
- **`trendWindow.ts`**: day/window label formatting accepts a locale; chart aggregation re-runs when the locale changes
- **Schema / backend**: No Supabase changes
- **Dependencies**: None added
