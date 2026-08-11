## Purpose

Defines how Pierre Tracker becomes installable as a Progressive Web App on phones, including manifest metadata, icons, and standalone home-screen launch.

## ADDED Requirements

### Requirement: Web app manifest is present
The system SHALL expose a web app manifest that identifies the app as "Pierre Tracker", specifies standalone (or equivalent fullscreen) display mode, and provides at least one icon suitable for home-screen installation on common mobile platforms.

#### Scenario: Manifest discoverable from the app
- **WHEN** a user loads the app over HTTPS in a supporting browser
- **THEN** the document references a valid web app manifest with name, icons, start URL, and display mode suitable for install

#### Scenario: Home-screen icon available
- **WHEN** a user chooses Add to Home Screen / Install on a supported mobile browser
- **THEN** the OS can use a manifest-provided icon and name for the installed shortcut

### Requirement: Install eligibility on Chromium
On Chromium-based mobile browsers that require a controlling service worker for Install, the system SHALL register a minimal production service worker so the app can meet installability checks. Offline caching of the application shell is NOT required.

#### Scenario: Android Chrome can offer install
- **WHEN** a user visits the production HTTPS app in a Chromium mobile browser that enforces installability criteria
- **THEN** the app presents the assets and service worker control needed for that browser’s Install / Add to Home Screen flow

### Requirement: Standalone launch
When launched from an installed home-screen icon on a supporting platform, the system SHALL open with standalone presentation (no full browser chrome required by the product).

#### Scenario: Launch from home screen
- **WHEN** a user opens Pierre Tracker from the installed home-screen icon
- **THEN** the app loads at its start URL in standalone display mode as configured by the manifest
