# Mealytics

Personal nutrition and meal tracking for iOS, Android, and web. Built with Expo SDK 57.

Nutrition values are from USDA FoodData Central (SR Legacy).

## Setup

1. Copy `.env.example` to `.env`. A [USDA FoodData Central](https://fdc.nal.usda.gov/api-key-signup.html) API key is optional last-resort only:

```
EXPO_PUBLIC_USDA_API_KEY=your_usda_api_key_here
```

2. Install dependencies and start the app:

```bash
npm install
npx expo start
```

Meal logs, profile, and water intake stay on-device. Food search uses the bundled `data/foods.json` catalog (no network). If that catalog and the tiny common-foods list have no match, Open Food Facts is tried for branded products, then the live USDA API as a last resort.

Rebuild the local catalog from USDA SR Legacy CSVs with:

```bash
python tools/usda-build/build_foods.py
```

## Production builds

Set `EXPO_PUBLIC_USDA_API_KEY` as an EAS environment variable only if you want live USDA fallback (do not commit the key), then:

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
