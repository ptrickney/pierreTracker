## 1. Manifest and icons

- [x] 1.1 Add app icons under `public/` (at least 192 and 512 PNGs, include a maskable variant or purpose flags as needed)
- [x] 1.2 Add web app manifest via Next.js Metadata Route or static manifest with name, short_name, start_url, display `standalone`, theme/background colors, and icon references
- [x] 1.3 Wire root layout metadata (title, description, manifest, apple-touch-icon) so browsers discover install assets

## 2. Minimal service worker for installability

- [x] 2.1 Add a Next 15–compatible PWA dependency (prefer Serwist / `@serwist/next`, or lighter equivalent) and wire it in `next.config.ts`
- [x] 2.2 Configure a minimal production service worker that satisfies Chromium installability without app-shell offline caching as a product goal
- [x] 2.3 Register the service worker only in production builds and confirm `npm run build` succeeds

## 3. Docs and verification

- [x] 3.1 Document install steps (iOS Safari Add to Home Screen, Android Chrome Install) and that PWA checks need HTTPS + production/`next start` preview
- [x] 3.2 Manually verify: Add to Home Screen / Install and standalone launch from the home-screen icon
- [x] 3.3 Run `npm run lint` and `npm run build` as final gate
