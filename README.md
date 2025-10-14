# Tap That Clock

A React Native (Expo) wake-up alarm clock focused on iOS. The experience blends a clean dark UI with weekly scheduling, smart permission handling, and local notifications so you can build a reliable morning routine.

## Features

- 📆 Create one-time or repeating alarms with weekday selection.
- ✏️ Edit, enable/disable, and delete alarms from the main list.
- 🔔 Schedules local notifications (via `expo-notifications`) to ring at the right moment.
- 💤 Intelligent permission handling that guides users if notification access is denied.
- 🎨 Modern dark theme tuned for nighttime use.

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Run on iOS** (requires Xcode and an iOS simulator or device):

   ```bash
   npm run ios
   ```

   You can also launch the Expo dev server only:

   ```bash
   npm start
   ```

3. **Quality checks**

   ```bash
   npm run lint       # ESLint with TypeScript/React Native rules
   npm run typecheck  # TypeScript project validation
   npm test           # Jest unit tests
   npm run build:web  # Bundle the managed app for web to ensure it builds
   ```

4. **Testing alarms**

   - When the app launches, it requests notification permissions. If the dialog is dismissed or denied, head to iOS Settings → Tap That Clock → Notifications to enable alerts.
   - Create a one-time alarm a couple minutes in the future to verify the notification fires.
   - Repeating alarms trigger every week on the selected days at the chosen time.

## Project structure

```
.
├── App.tsx                  # Root screen with alarm list & scheduling logic
├── src
│   ├── components
│   │   ├── AlarmForm.tsx    # Modal form for creating/editing alarms
│   │   └── AlarmListItem.tsx
│   ├── hooks
│   │   └── useNotificationSetup.ts # Permission handling & channel setup
│   ├── types
│   │   └── alarm.ts
│   └── utils
│       └── datetime.ts      # Date formatting helpers
├── app.json                 # Expo configuration (bundle id, permissions text)
└── package.json
```

## Notes

- Local notifications rely on the app running in an Expo-managed workflow. If you eject or build a bare React Native project, ensure you configure the native notification channels accordingly.
- Custom alarm sounds can be added by bundling audio files and updating the notification `sound` field; currently all presets map to the system default tone for broad compatibility.
- Provide your own branded icon/splash assets by updating the paths in `app.json`; the project ships without binary image files to keep the repository text-only.
- Automated checks run via GitHub Actions (`.github/workflows/ci.yml`) on every push and pull request to guarantee linting, tests, and the build remain healthy.
