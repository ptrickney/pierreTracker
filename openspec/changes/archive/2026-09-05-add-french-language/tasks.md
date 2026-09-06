## 1. i18n foundation

- [x] 1.1 Create `src/lib/i18n.tsx`: `Locale` type, English dictionary, typed `Messages` interface, complete French dictionary (including category/allergen/preference label records and parameterized plural functions)
- [x] 1.2 Add `LanguageProvider` (localStorage persistence, browser-language default, `document.documentElement.lang` sync) and `useI18n()` hook
- [x] 1.3 Add locale-aware date/time helpers (long date, short date, time, date+time) replacing per-component `en-US` formatters
- [x] 1.4 Mount `LanguageProvider` in `AppShell`

## 2. Language toggle

- [x] 2.1 Build `LanguageToggle` component (pill button, shows target language code, translated aria-label)
- [x] 2.2 Add it to the header action group in `page.tsx`

## 3. String extraction — dashboard

- [x] 3.1 `page.tsx`: header date via locale helper, error fallbacks
- [x] 3.2 `TodaySummary`: section heading, card labels, unit labels, last-feed time formatting
- [x] 3.3 `RecentActivity`: heading, empty state, Loading…/View More
- [x] 3.4 `EventRow`: event type labels from dictionary, "Reaction" chip, delete aria-label, localized timestamps
- [x] 3.5 `ThemeToggle` and `DirtyDiaperCelebration` strings

## 4. String extraction — activity logger

- [x] 4.1 Log/cancel buttons, date/time labels, backdate notice, Bottle/Solids tabs, feed amount, wet/dirty buttons, stepper aria-labels
- [x] 4.2 Solids form: food input labels/placeholders/hints, add-food suggestion, preference prompt, comment field, validation messages, log-N-foods plural button

## 5. String extraction — food passport

- [x] 5.1 Passport card: milestone header, counts (plural-aware), empty state, explore CTA, "Tried:" chips
- [x] 5.2 Explore modal: title, count badges, category headings via `t.categories`, per-category food counts, empty state, tried dates
- [x] 5.3 Food detail: back links, category selector, allergen list via `t.allergens`, exposure rows (Unrated, Reaction, Edit), reaction/comment editors, save/cancel
- [x] 5.4 Edit exposure form: field labels, preference/allergen options via `t`, validation, saving states

## 6. Trend charts

- [x] 6.1 `trendWindow.ts`: locale parameter on `formatDayLabel` / `getTrendWindow` window label (default `en`, existing tests stay green)
- [x] 6.2 All three charts: titles, Previous/Next/Today buttons, descriptions, legend names, average lines; add `locale` to aggregation effect deps

## 7. Validation

- [x] 7.1 `npm run lint` and `npm run build` pass
- [x] 7.2 Manual browser test: toggle to French, verify header/date, log a bottle feed, a solid food, and a diaper in French, open passport, check charts and timeline, reload to confirm persistence
- [x] 7.3 Record demo video of the French flow
