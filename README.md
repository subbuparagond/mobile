# Phoenix Malls — Android app

Standalone Expo React Native application for discovering Phoenix Malls on an interactive map. Shared mall data, timezone-aware status logic, filtering, and tests are included in `packages/core`; no parent repository is required.

## Requirements

- Node.js 22 or later
- npm
- Expo Go or an Android emulator for development; an Android SDK for local native builds

## Install and run

From this directory:

```sh
npm install
npm start
```

Press `a` in the Expo CLI to open an Android emulator, or scan the QR code with Expo Go. For a local Android build, run `npx expo run:android`.

## Checks

```sh
npm test
npm run typecheck
```

## Structure

- `App.tsx` — mobile discovery UI, mall details, filters, native actions, and WebView bridge.
- `packages/core/src` — mall model and mock repository, geographic bounds, shared filtering, and local-time operating status.
- `packages/core/test` — tests for filters, geographic bounds, and operating hours.

The map uses Leaflet and OpenStreetMap tiles inside a React Native WebView. Tile imagery needs an internet connection; mall information remains available when tiles cannot load. Mock mall contact details, hours, and imagery should be verified before production use.
