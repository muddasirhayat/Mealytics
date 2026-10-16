# Changelog

## 1.0.0 — v4 redesign

Soft-UI redesign for Play Store: Outfit/Manrope, glass and raised cards, floating tab bar, and first-run onboarding.

### Data and safety
- Schema migration `mealytics_schema_version` v2. Existing profiles get `mealytics_has_onboarded` so returning users skip onboarding.
- Draft meals persist under `mealytics_draft_meal`.
- Decimal inputs reject thousand separators as decimals. Search empty state waits until the current query finishes.
- Delete all my data wipes only `mealytics_*` keys, then returns to onboarding.
- Errors stay on-device; production logs are silent.

### Design
- Light-only UI (`#E6EBF2`). Adaptive icon: indigo ring + mint quarter on that background.
- Today, Logs, Quick, Profile, Search, food details, custom food, and current meal rebuilt against the v4 HTML.
- Onboarding: welcome, 3 intro slides, name, goal, gender, age (13–100), height, weight, activity, macro sliders, done.

### Launch
- Production Android uses R8 minify + shrink, no cleartext HTTP. Manifest needs INTERNET only.
- Bundled USDA catalog is slimmer and lazy-loaded on first search.
- Footer: data stays on this device; online search uses Open Food Facts / USDA.

### Test checklist
- [ ] Cold start: splash waits for fonts + profile, then Today or onboarding.
- [ ] Overlay install: profile, meals, water, and draft from the previous build still load.
- [ ] Search: 1 character hint, then results or “No foods matched” only after the query finishes. Offline catalog + OFF fallback.
- [ ] Add food → draft → save meal → Logs (slot-grouped) → Profile.
- [ ] Quick meals: tag chips, add, undo toast.
- [ ] Water +250; long-press extra amounts.
- [ ] Onboarding end-to-end; age wheel 13–100; sliders stay 10–60% and sum to 100.
- [ ] Looks good → all set → Log my first meal (`/search`) and Go to Today.
- [ ] Delete all my data → onboarding; no leftover `mealytics_*` keys.
- [ ] 360×640 and 412×915; font scale 100% and 130%; two-column fields wrap; content clears the tab bar; keyboard does not cover focused inputs.
- [ ] TalkBack: tab bar, chips `selected`, 44 dp targets, decorative blobs hidden.
- [ ] Release AAB (R8): local + OFF search, add/save/delete, onboarding, delete-all.
