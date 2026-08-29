## 1. Full-screen passport overlays

- [x] 1.1 Update Explore Passport overlay to full viewport (no 92vh bottom sheet); keep scroll lock and internal scrollport
- [x] 1.2 Update Food Detail overlay the same way

## 2. Edit solid exposure

- [x] 2.1 Add foodQueries helper to save exposure edit (food upsert/reassign, category, allergens, preference)
- [x] 2.2 Add edit UI from Food Detail history rows (name, category, preference, allergens) with save/cancel
- [x] 2.3 Refresh Food Detail + passport (and parent dashboard callback) after successful save

## 2b. Passport readability

- [x] 2b.1 Render each Explore Passport category as a shaded, bordered group with header + count
- [x] 2b.2 Replace orphaned shield icon with labeled stat pills on the passport card and explore header
- [x] 2b.3 Give each category its own color tint (light + dark) so groups read apart at a glance
- [x] 2b.4 Include `src/lib` in Tailwind `content` so class names defined outside components are generated

## 3. Solids trend chart

- [x] 3.1 Add query for food exposures in a trend lookback window
- [x] 3.2 Build SolidsTrendChart (7-day bars + average, prev/next/today nav) matching diaper chart patterns
- [x] 3.3 Mount chart on the dashboard near the other trend charts

## 4. Verification

- [x] 4.1 Lint + build
- [x] 4.2 Manual browser check: full-screen overlay, edit save, solids chart renders
