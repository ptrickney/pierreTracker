## Context

Pierre Tracker is a Next.js 15 App Router client dashboard (`"use client"` page) talking to Supabase from the browser. There is no existing service worker, web manifest, or `public/` icon set. Deploy target is assumed HTTPS (Vercel). See `proposal.md` for motivation; requirements live in `specs/pwa-install` only. Offline use and mobile chrome polish (safe areas, touch targets) are out of scope.

## Goals / Non-Goals

**Goals:**
- Make the app installable via standard browser “Add to Home Screen” / Install flows.
- Launch in standalone mode from the home-screen icon.

**Non-Goals:**
- Offline / app-shell caching as a product feature.
- Mobile layout polish (safe areas, theme-color sync, touch-target audits).
- Native wrappers (Capacitor, React Native, store submission).
- Push notifications, background sync, or Share Target APIs.
- Changing Supabase auth model or RLS.

## Decisions

### 1. PWA stack: manifest + icons + minimal SW
- **Choice**: Next.js Metadata / `manifest.ts` (or static `manifest.webmanifest`) for install metadata; icons under `public/`; a minimal production service worker (prefer Serwist / `@serwist/next` or the lightest Next 15–compatible option) only to satisfy Chromium installability when required.
- **Rationale**: iOS can Add to Home Screen from Safari with a manifest + icons; Android Chrome often still expects a controlling SW with a fetch handler. Offline caching is not a goal, so configure the SW as thinly as the chosen library allows (network-only / passthrough is fine).
- **Alternatives considered**:
  - Manifest-only with no SW → may block Android Install prompt.
  - Full app-shell precache → rejected; offline not required.
  - Capacitor → out of scope (“PWA is fine”).

### 2. No mobile-shell work in this change
- **Choice**: Do not change `AppShell` layout, safe-area CSS, or touch targets as part of this change.
- **Rationale**: User scoped to install-only packaging.
- **Alternatives considered**: Keep `mobile-shell` polish → deferred.

### 3. Icons and branding assets
- **Choice**: Add maskable + standard PNGs under `public/` (e.g. 192 and 512); name “Pierre Tracker”. Use a simple generated mark for v1 if no brand asset exists.
- **Rationale**: Installability checks fail without icons; maskable icons matter on Android.
- **Alternatives considered**: SVG-only → weaker install support.

### 4. Dev vs production SW
- **Choice**: Register the service worker in production builds only; verify install via `npm run build && npm run start` or a preview deploy.
- **Rationale**: SW lifecycle in `next dev` is noisy and usually disabled by PWA plugins.

## Risks / Trade-offs

- **[SW still present without offline value]** → Needed for some Install checks; keep registration/update behavior boring (network-first / no aggressive precache) so deploys stay simple.
- **[iOS PWA quirks]** → Install is manual (Share → Add to Home Screen). Mitigation: document iOS steps; test Safari separately from Chrome Android.
- **[Extra build dependency]** → Plugin can break on Next upgrades. Mitigation: pin a known-good pair and cover with `npm run build`.

## Migration Plan

1. Land manifest, icons, and layout metadata.
2. Add minimal production SW; verify build and install flows.
3. Rollback: remove SW registration/plugin and manifest/icons; site remains a normal website.

## Open Questions

- Final icon artwork: use a generated simple mark for v1 unless a brand asset is provided later (does not change requirements).
