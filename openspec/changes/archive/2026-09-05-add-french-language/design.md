## Context

The app is a single client-rendered Next.js page (`"use client"` throughout). All strings are hard-coded English literals inside components, and date/time formatting is hard-coded to `en-US` in five places (`page.tsx`, `TodaySummary`, `EventRow`, `FoodPassport`, `trendWindow.ts`). Theme preference already follows a per-device `localStorage` + context pattern (`ThemeProvider`), which language selection mirrors.

## Goals / Non-Goals

**Goals**
- Complete FR/EN coverage of app-authored UI text, dates, and times
- Zero new dependencies; compile-time completeness checking of both dictionaries
- Per-device persistence with browser-language default

**Non-Goals**
- Locale routing, server-side negotiation, translation of user data, additional languages

## Decisions

### 1. Hand-rolled context over an i18n framework

One page, ~120 strings, two locales. `next-intl`/`react-i18next` would add dependency weight and App Router routing conventions for no benefit. Instead:

- `src/lib/i18n.tsx` exports:
  - `type Locale = "en" | "fr"`
  - `Messages` — an interface derived from the English dictionary (`typeof en`), so the French dictionary fails to compile if any key is missing or extra
  - `en: Messages`, `fr: Messages` — flat-ish nested objects; parameterized strings are functions (e.g. `logFoods(count: number): string`), which handles French pluralization ("1 aliment" / "2 aliments") without a plural-rules engine
  - `LanguageProvider` + `useI18n()` returning `{ locale, setLocale, toggle, t }` where `t` is the active `Messages` object
- Dictionaries for `foodConstants` option labels are keyed records: `t.categories[key]`, `t.allergens[key]`, `t.preferences[key]`. The option arrays in `foodConstants.ts` keep their `key`/`emoji` fields; components stop reading `.label` and resolve labels through `t`.

### 2. Persistence and hydration

- `localStorage` key `pierre-tracker-lang`; values `"en" | "fr"`.
- Provider state initializes to `"en"` and resolves the real locale in a mount effect (stored value, else `navigator.language`). This avoids SSR/hydration text mismatches (the server-rendered shell is English); the page shows loading skeletons on first paint anyway, so the brief English flash is not visible in practice.
- The same effect keeps `document.documentElement.lang` in sync on every locale change.
- `LanguageProvider` mounts inside `AppShell` beside `ThemeProvider`.

### 3. Date/time formatting

- `i18n.tsx` exposes locale-aware helpers used by all components: long header date, short date ("Sep 5" / "5 sept."), time (12h `en-US` / 24h `fr-FR`), and combined date+time. The three per-component copies of `isToday`/`formatEventTime` logic collapse into these shared helpers.
- `trendWindow.ts` functions that produce display labels (`formatDayLabel`, `formatWindowDay` via `getTrendWindow`) accept an optional `locale` parameter defaulting to `"en"`, keeping the existing unit test valid.

### 4. Chart aggregation and locale

Chart components use `formatDayLabel` output both as Map keys and axis labels, computed inside a data-fetch `useEffect`. Rather than refactor to ISO keys, the effect adds `locale` to its dependency array: switching language re-runs aggregation (cheap, client-side, data already being fetched per window) so keys and labels stay consistent. Legend/series names come from `t`.

### 5. Language toggle UI

`LanguageToggle` component styled like `ThemeToggle`'s pill button, showing a `Languages` lucide icon plus the target language code ("FR" when English is active, "EN" when French). Placed in the header's action group in `page.tsx`. `aria-label` announces the switch action in the current language.

## Risks / Trade-offs

- **String drift**: future features could hard-code English again → the typed `Messages` interface and a single obvious pattern (`useI18n`) keep the path of least resistance correct; noted in tasks to update AGENTS.md guidance.
- **English flash on first paint for French users**: accepted (see Decision 2); the alternative (boot script à la theme) adds complexity for a page whose content pops in async anyway.
- **Supabase/browser error strings** (e.g. network failure messages) may appear untranslated inside translated error banners: accepted as an edge case; all app-authored fallbacks are translated.

## Open Questions

None blocking. If the family later wants the app to always be French regardless of device, the default in Decision 2 is a one-line change.
