# Mealytics

Personal nutrition and meal tracking for iOS, Android, and web. Built with Expo SDK 57.

## Setup

1. Copy `.env.example` to `.env` and add a [USDA FoodData Central](https://fdc.nal.usda.gov/api-key-signup.html) API key:

```
EXPO_PUBLIC_USDA_API_KEY=your_usda_api_key_here
```

2. Install dependencies and start the app:

```bash
npm install
npx expo start
```

Meal logs, profile, and water intake stay on-device. Food search uses the USDA API and needs internet.

## Production builds

Set `EXPO_PUBLIC_USDA_API_KEY` as an EAS environment variable (do not commit the key), then:

```bash
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
```

## Checks

```bash
npm run lint
npm run typecheck
npx expo-doctor
```
