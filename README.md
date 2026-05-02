# Stop & Play

A mobile freeze-dance game. Music plays for a random interval, then stops — everyone must freeze. When the music resumes, players can move again. The host controls start, stop, and can trigger a manual freeze at any time.

Built with **React Native / Expo SDK 51**.

---

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | 18 or 20 LTS | `node --version` to check |
| npm | 9+ | bundled with Node |
| Expo CLI | latest | `npm install -g expo-cli` (optional — `npx expo` works without it) |
| Expo Go app | latest | Install on your iOS or Android device from the App Store / Play Store |

> **No Xcode or Android Studio required** for basic development — Expo Go handles the native runtime on your device.

---

## Quick start

```bash
# 1. Clone
git clone https://github.com/xSakix/stop-and-play.git
cd stop-and-play

# 2. Install dependencies
npm install

# 3. Start the dev server
npx expo start
```

Expo will print a QR code in the terminal. Scan it with:
- **iOS** — the Camera app (opens in Expo Go automatically)
- **Android** — the Expo Go app directly

The app will load on your device over your local network.

---

## Running on a simulator / emulator

```bash
# iOS Simulator (macOS only — requires Xcode)
npx expo start --ios

# Android Emulator (requires Android Studio + a running AVD)
npx expo start --android
```

---

## Running tests

The test suite runs without `node_modules` being installed for the native runtime — it targets only the pure TypeScript engine layer.

```bash
npm test
```

Expected output:

```
Tests: 68  |  ✅ 68 passed  |  ❌ 0 failed
All tests passed.
```

> Tests use `ts-node` + Node.js built-in `assert`. No Jest or React Native runtime needed.

---

## Audio tracks

The app ships with **three silent placeholder tracks** for development. Before using the app for real, replace them with actual audio files.

### Option A — Automated download (royalty-free)

```bash
bash scripts/download-audio.sh
```

This downloads three CC0 tracks from Pixabay into `assets/tracks/`. Requires `curl`.

### Option B — Your own files

1. Drop `.mp3` files into `assets/tracks/`
2. Update the `DEFAULT_ASSETS` map in `src/audio/AudioManager.ts` to point to your files
3. Update `assets/tracks/LICENCES.md` with attribution details

### Option C — Use the in-app picker

Tap the track row on the home screen to open the music library. You can pick any audio file from your device.

---

## Project structure

```
stop-and-play/
├── App.tsx                        # Root — mounts GameEngineProvider + ScreenRouter
├── src/
│   ├── engine/
│   │   ├── stateMachine.ts        # Pure transition() function + TRANSITIONS table
│   │   ├── GameEngineProvider.tsx # Instantiates useGameEngine exactly once
│   │   └── __tests__/
│   │       └── stateMachine.test.ts
│   ├── hooks/
│   │   └── useGameEngine.ts       # Timer logic, audio side-effects, dispatch
│   ├── audio/
│   │   └── AudioManager.ts        # expo-av wrapper (load, play, pause, unload)
│   ├── store/
│   │   └── gameStore.ts           # Zustand store — phase, config, tracks (persisted)
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── LoadingScreen.tsx
│   │   ├── PlayingScreen.tsx
│   │   ├── FrozenScreen.tsx
│   │   └── ErrorScreen.tsx
│   ├── components/
│   │   ├── SettingsSheet.tsx      # Play/freeze duration sliders, countdown toggle
│   │   └── MusicPicker.tsx        # Default track list + device file picker
│   └── types/
│       └── index.ts               # GamePhase, Track, GameConfig
├── assets/tracks/                 # Bundled audio files + LICENCES.md
├── scripts/
│   ├── run-tests.ts               # Zero-dependency test runner
│   ├── download-audio.sh          # Fetches royalty-free tracks via curl
│   └── gen_placeholders.py        # Generates silent placeholder MP3s (Python 3)
├── tsconfig.json                  # Main TS config (Expo base)
└── tsconfig.test.json             # Isolated TS config for ts-node test runner
```

---

## State machine

```
idle ──[START]──► loading ──[LOADED]──────► playing ──[PLAY_TIMER]──────► frozen
                      │                        │      ──[MANUAL_FREEZE]──► frozen
                      │                        │      ──[PLAY_FAILED]────► error
                      └──[LOAD_FAILED]──► error│
                                               └──[FREEZE_TIMER]──► playing

any non-idle phase ──[STOP]──► idle
```

The full table lives in `src/engine/stateMachine.ts`. Every transition is covered by unit tests.

---

## Building for production

### Expo EAS Build (recommended)

```bash
npm install -g eas-cli
eas login
eas build --platform ios      # or android, or all
```

> You will need an Apple Developer account (iOS) or Google Play Console account (Android).

### Before submitting to a store

- [ ] Replace placeholder audio with real royalty-free tracks
- [ ] Complete `assets/tracks/LICENCES.md` with track attributions
- [ ] Add an app icon (`assets/icon.png`) and splash screen (`assets/splash.png`)
- [ ] Set your bundle ID in `app.json` (`ios.bundleIdentifier`, `android.package`)
- [ ] Increment `version` in `app.json` and `package.json`

---

## Key dependencies

| Package | Purpose |
|---|---|
| `expo-av` | Audio playback with background mode + silent switch support |
| `expo-document-picker` | Picking audio files from device storage |
| `expo-haptics` | Haptic feedback on phase transitions |
| `zustand` | State management with AsyncStorage persistence |
| `react-native-safe-area-context` | Safe area insets across devices |
