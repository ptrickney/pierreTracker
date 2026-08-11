## Why

When Explore Passport (or Food Detail) is open, scroll/wheel gestures scroll the dashboard behind the modal instead of the passport content. That feels broken and makes long category lists hard to browse on mobile.

## What Changes

- Lock background page scroll while the passport explore or food-detail overlay is open
- Confine scroll to the passport modal’s content area when that area overflows
- When passport content does not overflow, gestures must not scroll the page behind

## Capabilities

### New Capabilities

- `food-passport`: Modal scroll containment for Explore Passport and Food Detail overlays (background scroll lock + internal scroll when needed)

### Modified Capabilities

- (none — `food-passport` is not yet promoted under `openspec/specs/`; this change adds the scroll-containment requirements)

## Impact

- `src/components/FoodPassport.tsx` (Explore Passport + Food Detail overlays)
- No API, schema, or dependency changes
