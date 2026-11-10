# Mealytics on Google Play

Package: `com.muddasirhayat.mealytics`  
Version name: `1.0.0`  
Version code: `2` in `app.json` (`android.versionCode`). EAS `autoIncrement` will raise it on later builds.  
If Play Console already has a version code of 2 or higher from the October build, set `android.versionCode` above that number before uploading.

The production profile builds an Android App Bundle and submits a **draft** to the closed testing track. In the Play Developer API that track is named `alpha`. Internal testing does not count toward the 12-tester requirement.

## USDA key

Leave `EXPO_PUBLIC_USDA_API_KEY` unset in the EAS production environment. `eas.json` sets it to an empty string for the production profile so it is not compiled into the AAB. Confirm in the EAS dashboard that no production secret overrides that empty value. A key inside the app can be extracted from the bundle.

## Closed testing

Personal Play Console accounts created after 13 November 2023 must run a closed test with at least 12 testers opted in for 14 continuous days before applying for production. Start that test as soon as the first release AAB is uploaded. Open testing is unavailable until production access is approved.

## Data safety

Answer the form from what this build actually does.

| Data | What happens | Suggested answer |
|---|---|---|
| Food search text | Sent to Open Food Facts only when the on-device USDA catalog has no match. Not tied to an account. | Collected and shared with Open Food Facts. Not used for ads or tracking. |
| USDA live API | Not called in the Play build, because no API key is shipped. | Do not declare USDA as a recipient for this build. |
| Name, age, gender, height, weight, activity, goal, macro split, meals, water, theme, draft | Stored in app storage on the device. Android backup is off (`android.allowBackup: false`). | Not collected. Describe it in the privacy policy as on-device health and profile data. |
| Account, email login, advertising ID, location, contacts, photos, microphone | Not used. Microphone and media-playback foreground service are not in the release config. | No. |
| Crash or analytics SDK | None. | No. |
| Data sold | No. | No. |
| Encrypted in transit | Open Food Facts requests use HTTPS. | Yes, for the search text that leaves the device. |
| Users can delete | Profile → Delete all my data removes `mealytics_*` keys and returns to onboarding. There is no account, so Play's account-deletion web URL is not required. | Say deletion is in the app. |

Target audience: 13 and older. Do not opt into Designed for Families. Age cannot be set below 13. Calorie targets are floored (1,600 kcal under 18, 1,200 kcal from 18). The plan screen says the number is an estimate, not medical advice.

Content rating: no ads, no violence, no public social feed, no location. Custom food names stay on the device. Complete the IARC questionnaire as a health and fitness app.

Declare: no ads, not a news app, Health & Fitness category, internet used for food search.

## Listing assets to make

These files are not in the repo. Export them before filling the store listing.

| Asset | Spec |
|---|---|
| App icon | 512×512 PNG, 32-bit, full square. Start from `assets/brand/icon.png` (1024). |
| Feature graphic | 1024×500 PNG or JPEG. |
| Phone screenshots | At least 2, up to 8. 9:16, shortest side at least 1080 if possible. Capture Today, Search, Logs, Quick meals, and Profile in light and dark. Check that Save and Add sit above the navigation bar. |
| Short description | 80 characters max. Draft: `Log meals, macros, and water. Your food diary stays on this phone.` |
| Full description | Say what the app does, that the diary stays on the device, that online search uses Open Food Facts, that targets are estimates, and that it is for ages 13 and up. Mention USDA FoodData Central for the bundled catalog and Open Food Facts (ODbL). |
| Privacy policy URL | `https://codixr.com/mealytics/privacy` |
| Terms URL | `https://codixr.com/mealytics/terms` (linked in the app; not a Play field) |

The adaptive icon foreground is the full logo. Check a circle mask on a device before treating the launcher icon as final. The monochrome icon is a ring, not the face.

## Release build checks

After `eas build --platform android --profile production`:

- The AAB targets API 36.
- Play's bundle explorer shows 16 KB page-size support.
- The manifest has no `RECORD_AUDIO` and no media-playback foreground service.
- There is no dev-client menu.
- Search for a nonsense string shows “No foods matched”, not a connection error, when the phone is online.
- Double-tapping Save meal does not create two copies or drop the log.
