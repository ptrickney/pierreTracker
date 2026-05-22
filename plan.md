# Plan: Trend Chart History Navigation

## Goal

Let the feeding and diaper 7-day bar charts look backward through prior days, while keeping the current week easy to return to and showing the active window's running 7-day average.

## Design

- Add reusable date-window helpers for local-day start/end bounds, labels, previous/next day movement, and average calculation.
- Update Supabase trend queries to accept a `{ start, end }` timestamp range instead of only fetching the current last 7 days.
- Add compact Previous day / Next day / Today controls to each chart header; disable Next day when the active window ends today.
- Show a small average summary above each chart: feeding volume average, diaper total average, and wet/dirty breakdown for diapers.
- Keep the existing card, typography, color, and Recharts visual style.

## Testing Plan

- Add focused helper coverage first, verifying local date windows, previous/next movement, future-window blocking, and seven-day averages.
- Run lint and production build.
- Browser-test the dashboard and record chart navigation moving to previous days and returning toward today.
