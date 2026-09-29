# Phoenix Malls for Android

An Expo and React Native app for exploring Phoenix Malls in India. Start with the map, choose a mall marker, and see its current local opening status, hours, address, and contact options. The app also includes mall search, open/closed filters, a nearby-mall action, and a destination list that stays in sync with the map.

## Project links

- **Web application:** [Open the live web app](https://web-five-gamma-21.vercel.app/)
- **Android app:** [Download the APK](https://drive.google.com/file/d/1eaGxZntxvla7QhpMufvYdRn57mf53rpm/view?usp=sharing)
- **GitHub:** [Web repository](https://github.com/subbuparagond/web) · [Android repository](https://github.com/subbuparagond/mobile)

## Requirements

- Node.js 22 or later
- Yarn Classic 1.22 or later
- Expo Go, an Android emulator, or an Android device for development

## Install and run

Run these commands from the `mobile` directory:

```powershell
yarn install
yarn start
```

Expo starts Metro and prints a QR code. Scan it with Expo Go, or press `a` to open an Android emulator. If Expo is not on your shell PATH, `yarn start` still invokes the project-local Expo CLI.

For a local native Android build, install and configure the Android SDK, then run:

```powershell
yarn expo run:android
```

## Create an installable APK

The EAS `production` profile is configured for an internally distributed APK. It does not publish the app to Google Play. Install EAS CLI once, sign in, then start the cloud build from this directory:

```powershell
yarn global add eas-cli
eas login
eas build --platform android --profile production
```

If PowerShell cannot find `eas`, add Yarn's global binary directory to the current session:

```powershell
$env:Path += ";$env:LOCALAPPDATA\Yarn\bin"
```

When the build finishes, use the EAS build URL to download the APK. The Android application ID is `com.phoenixmalls.explore`.

## Checks

```powershell
yarn typecheck
yarn test
```

The shared-core tests cover mall search and status filtering, map bounds, local time zones, opening/closing boundaries, overnight hours, holidays, and invalid schedule data.

## Project structure

```text
mobile/
├── App.tsx                 Main screen, app state, details, and native actions
├── assets/                 App and launcher icon assets
├── packages/core/
│   ├── src/                Mall data, repository, status, filtering, map bounds
│   └── test/               Shared business-logic tests
├── app.json                Expo and Android application configuration
├── eas.json                APK build profiles
├── metro.config.js         Metro and NativeWind configuration
└── package.json            Scripts and dependencies
```

## How it works

- **Map:** Leaflet renders OpenStreetMap tiles in a React Native WebView. A lightweight fallback map and mall markers are drawn immediately so the map remains usable while map libraries or tiles are unavailable. The WebView sends marker and action events to the React Native screen.
- **Selection and details:** Tapping a marker or a destination card selects the same mall. The map popup stays anchored to the marker; the full details and action panel is displayed below the map and can be reached by scrolling.
- **Live status:** `packages/core/src/status.ts` calculates status from the current time in each mall's IANA time zone. Opening time is included and closing time is excluded. Overnight hours and configured `closedDates` are supported. Invalid hours or time zones are shown as unavailable.
- **Search and filters:** `packages/core/src/filter.ts` contains the shared country, mall/city query, and open/closed filtering used by the mobile app and the web app.
- **Data boundary:** `packages/core/src/repository.ts` exposes `MallRepository` and a mock implementation. A network-backed repository can replace the mock without moving API calls into screen components.

## Data and limitations

The included mock data covers Phoenix Marketcity Pune, Phoenix Marketcity Mumbai, and Phoenix Palladium Mumbai. Contact details, opening hours, coordinates, and image URLs are example data and should be confirmed with the malls before public use. Mall edits and deletions are local preview changes and are not saved to a server. OpenStreetMap tiles and remote mall images require an internet connection; the offline fallback preserves the basic map and mall details but does not cache map tiles.
