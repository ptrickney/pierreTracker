## Why

Pierre Tracker is used for time-sensitive baby care (feeding, sleep, diapers), which happens on phones more than on desktops. Today it is a browser-only Next.js site with no install affordance or app icons/metadata for home-screen install—so it feels like a website rather than a quick-to-open mobile app.

## What Changes

- Add Progressive Web App (PWA) support so parents can install Pierre Tracker on iOS and Android home screens and open it in standalone mode.
- Ship a web app manifest (name, icons, theme/background colors, display mode) and app icons.
- Register a minimal production service worker only as needed for installability criteria (e.g. Chromium); no offline/app-shell caching product goal.
- Document how to install (Add to Home Screen / Install) and that HTTPS + a production build are required for PWA checks.

## Capabilities

### New Capabilities
- `pwa-install`: Installable PWA surface—manifest, icons, minimal service worker for install eligibility where required, and standalone display behavior.

### Modified Capabilities
- (none) — existing logging, overview, charts, and timeline requirements stay the same; this change only adds install packaging.

## Impact

- **App entry**: `src/app/layout.tsx` (metadata, manifest, apple-touch-icon).
- **Build/config**: `next.config.ts` if a PWA plugin is used; static assets under `public/` (icons, optional SW artifacts).
- **Deploy**: Production must be served over HTTPS (already true on Vercel); install checks may not apply in `next dev`.
- **No schema/API changes**: Supabase usage and activity data model unchanged. Network remains required for the app to be usable.
