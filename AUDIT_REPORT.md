# Mealytics Expert Audit Report

**Date:** 16 Oct 2026  
**Branch audited:** `redesign-v4` (commit around `a94df2c`)  
**Scope:** Full app (app/, components/, store/, storage/, services/, theme/, hooks/, utils/)  
**Constraint:** Read-only audit — **no code was changed** for this report.

---

## 1. Executive summary

Mealytics is a solid offline-first Expo meal tracker with a clear product direction (Today / Logs / Quick meals / Profile / Search). The Midnight Indigo dark theme and motion work improved UX, but several **hidden bugs**, **security risks**, and **theme inconsistencies** remain.

| Area | Status |
|------|--------|
| Crash / boot risks (old native builds) | High — mitigated partially; rebuild still required for audio/haptics/image |
| Secrets / API keys | **Critical** — USDA key lives in local `.env` and is `EXPO_PUBLIC_*` (embedded in client) |
| Data integrity (meals) | High — race on concurrent meal writes |
| Dark theme completeness | Medium–High — several screens still bake light colours |
| Dead / duplicate assets | Medium — safe cleanup candidates listed |
| Core product logic | Mostly sound |

**Bottom line:** The app can ship a preview build after a **native rebuild** and fixing theme freeze + meal race + key handling. Do not treat the current Expo Go / stale APK as the release target.

---

## 2. Critical / High — fix before release

### 2.1 Critical — USDA API key exposure

| | |
|--|--|
| **Where** | `.env` (`EXPO_PUBLIC_USDA_API_KEY=…`), `services/usda/usdaApi.ts` |
| **Issue** | Any `EXPO_PUBLIC_*` value is **bundled into the JS client**. Anyone can extract the key from the APK/IPA. Local `.env` is gitignored (good), but the key will still ship in release builds if set in EAS env. |
| **Risk** | Key theft, quota abuse, unexpected billing / rate limits. |
| **Fix** | Prefer offline + Open Food Facts first (already done). If USDA is needed: proxy through your own backend; never ship the raw USDA key in the mobile app. Rotate the current key immediately if it was ever committed, shared, or baked into a distributed build. |

### 2.2 High — meal save race / lost logs

| | |
|--|--|
| **Where** | `storage/mealStorage.ts` → `saveMeal` / `removeFood` / `deleteMeal` |
| **Issue** | Pattern is read-all → mutate → write-all with **no lock / queue**. Two quick saves (or save + delete) can overwrite each other. |
| **Risk** | Silent loss of logged foods — worst UX bug for a tracker. |
| **Fix** | Serialize writes (async mutex / queue), or store meals per-day keys, or use a transactional store (SQLite / WatermelonDB). |

### 2.3 High — stale native modules crash the app

| | |
|--|--|
| **Where** | `expo-audio`, `expo-image`, `expo-haptics` in `package.json` / `app.json` plugins |
| **Issue** | Running JS that expects modules not linked in the installed APK caused `ExpoAudio` / `ExpoImage` crashes. Mitigations exist (`requireOptionalNativeModule`, RN `Image` for blobs), but **sound/haptics still need a rebuild**. Barrel + `FloatingTabBar` + `expo-router` also caused `ErrorBoundary of undefined`. |
| **Risk** | Boot / route-load crashes for anyone on an old binary. |
| **Fix** | Document: **dev client / EAS rebuild required** after adding native modules. Keep lazy/optional native requires. Avoid re-exporting router-dependent components from `components/ui/index.ts`. |

### 2.4 High — “Delete all my data” incomplete for in-memory stores

| | |
|--|--|
| **Where** | `storage/wipe.ts`, `app/(tabs)/profile.tsx` wipe handler |
| **Issue** | Wipe removes AsyncStorage keys with prefix `mealytics_`, then resets user/onboarding/draft. Theme preference / sounds toggle also use that prefix (OK). But `resetUser` does **not** clear `isHydrated` / loading edge cases cleanly, and any non-prefixed keys would survive. In-memory `foodCache` is not cleared. |
| **Risk** | Partial wipe perception; cached food objects linger until restart. |
| **Fix** | After wipe: clear `foodCache`, reset theme/preferences stores explicitly, navigate to onboarding, force remount. |

### 2.5 High — dark mode text invisible on several screens

| | |
|--|--|
| **Where** | Screens still using `import { colors } from '@/theme/colors'` inside `StyleSheet.create` at module load: `app/onboarding/intro.tsx`, `index.tsx`, `gender.tsx`, `done.tsx`, `results.tsx`, `app/meal/draft.tsx`, `app/food/custom.tsx`, `app/food/[id].tsx`, `components/ui/LogoMark.tsx` |
| **Issue** | Proxy/`StyleSheet.create` **snapshots** colours when the module first evaluates (often light). Dark surfaces + dark text = unreadable (same class of bug as the name step). |
| **What UI should look like** | All text `ink` / `inkSecondary` / `inkMuted` from `useTheme()` at render time; inputs on `surfaceRaised`; no frozen hex in styles. |
| **Fix** | Migrate every screen to `useTheme()` + dynamic styles (or `useThemedStyles` — currently **unused**). Ban `StyleSheet.create({ color: colors.x })` at module scope. |

---

## 3. Medium — bugs & reliability

### 3.1 Profile form: setState during render

| | |
|--|--|
| **Where** | `app/(tabs)/profile.tsx` (~lines 152–164) |
| **Issue** | `if (profile !== hydratedProfile) { setHydratedProfile(...); setName(...); … }` runs in render body. |
| **Risk** | React warnings, extra renders, rare loops under Strict Mode / concurrent features. |
| **Fix** | Sync in `useEffect` when `profile` changes. |

### 3.2 External links not validated

| | |
|--|--|
| **Where** | `utils/linking.ts` |
| **Issue** | `Linking.openURL(url)` with no `canOpenURL` / scheme allowlist. |
| **Risk** | Low today (hardcoded https/mailto), but unsafe if any URL becomes user-controlled. |
| **Fix** | Allow only `https:` and `mailto:`; check `canOpenURL` first. |

### 3.3 Network timeout does not abort fetch

| | |
|--|--|
| **Where** | `services/network/jsonRequest.ts` |
| **Issue** | Timeout rejects the Promise but **does not abort** the underlying `fetch` (comment notes Android AbortSignal issues). |
| **Risk** | Hung connections, wasted battery/data; late responses ignored (OK) but sockets may linger. |
| **Fix** | Document tradeoff; retry with backoff; consider AbortController where Android allows. |

### 3.4 ID generation collision risk

| | |
|--|--|
| **Where** | `utils/id.ts` — `${Date.now()}-${Math.random()…}` |
| **Issue** | Fine for local use; not cryptographically unique; rapid calls same ms can collide (rare). |
| **Fix** | Prefer `expo-crypto` random UUID if available after rebuild. |

### 3.5 `getFoodById` ID routing edge cases

| | |
|--|--|
| **Where** | `services/food/searchFoods.ts` |
| **Issue** | `local-` prefix maps to **commonFoods**, not bundled `foods.json` IDs. Mis-prefixed IDs throw “Food not found.” |
| **Fix** | Unify ID namespaces (`local-`, `off-`, USDA numeric, bundled) and document them. |

### 3.6 Draft meal full-store subscription

| | |
|--|--|
| **Where** | `app/meal/draft.tsx` — `useMealStore()` without selectors |
| **Issue** | Re-renders on every draft change field. |
| **Fix** | `useMealStore(s => s.draftMeal)` etc. |

### 3.7 Add tab is a Redirect-only screen

| | |
|--|--|
| **Where** | `app/(tabs)/add.tsx` |
| **Issue** | Tab exists only to redirect to `/search`; FloatingTabBar already pushes Search for “Add”. |
| **Risk** | Confusing navigation stack / double navigation. |
| **Fix** | Keep one path only (FAB → search); hide or remove the add route if unused by deep links. |

### 3.8 Features flags always off

| | |
|--|--|
| **Where** | `constants/features.ts` — `barcode: false`, `favourites: false` |
| **Issue** | UI stubs remain (search barcode icon slot, food detail star). |
| **Fix** | Hide dead controls entirely until implemented, or implement them. |

---

## 4. Security & privacy checklist

| Item | Finding | Action |
|------|---------|--------|
| `.env` in git | Ignored — **not** in `git ls-files` | Keep ignored; never commit |
| `EXPO_PUBLIC_USDA_API_KEY` | Embedded in client if set | Rotate; proxy; or remove USDA from client |
| AsyncStorage | Unencrypted local profile/meals | Acceptable for offline MVP; warn in Privacy Policy; consider SecureStore for future auth |
| Cleartext HTTP | `usesCleartextTraffic: false` | Good |
| User-Agent | Sent to OFF | Fine |
| Wipe | Prefix-based | Document what is deleted |
| Logs | `utils/log.ts` console in dev | Production strip via babel plugin — good |
| Deep links | Custom scheme `mealytics` | No sensitive params observed |

---

## 5. UI / UX — what is wrong vs what it should look like

### 5.1 Dark theme (Midnight Indigo) — target

| Element | Should be |
|---------|-----------|
| Background | `#12151F` with soft blob PNG atmosphere |
| Cards | `#1C2130` + thin `rgba(255,255,255,0.08)` border; **no white neumorphic glow** |
| Inputs / chips / tracks | `#242A3B`; text `#F1F3F9`; hints `#6F7A90` |
| Accent | `#7C80FF` buttons/links; selected chips filled accent + white text |
| Segmented | Track raised; thumb pressed + dark shadow; selected label accent |
| Tab bar | Dark glass; FAB accent |
| Headings / meal names | Always `ink` — never invisible |

### 5.2 Screens still visually broken / inconsistent in dark

| Screen / component | Problem | Should look like |
|--------------------|---------|------------------|
| Onboarding intro / index / gender / done / results | Frozen light text colours | Same as name/height after theme fix — high contrast |
| Meal draft | Frozen colours on labels/rows | Dark cards, ink titles, accent kcal |
| Custom food / food detail | Same | Themed fields + readable macros |
| LogoMark | Wordmark may stay dark-on-dark | `ink` from `useTheme()` |
| Search barcode affordance | Dead feature when flag false | Hidden |

### 5.3 Profile (recently improved, remaining polish)

| Item | Status / should be |
|------|--------------------|
| White glows | Fixed when theme runtime syncs; verify after rebuild |
| Activity chips | Horizontal scroll — keep all 5 visible |
| Save dock | Must not cover Activity / list — padding already added; re-test small phones |
| Save disabled until dirty | Correct behaviour — keep |

### 5.4 Motion / feel

| Item | Target |
|------|--------|
| Press | `PressableScale` 0.97 spring on cards/buttons/chips |
| Lists | FlashList + first-mount FadeInDown (search/quick meals) |
| Ruler | Snap + tick; needs native audio/haptics build |
| Transitions | Stack `slide_from_right` / modals `fade_from_bottom` |

### 5.5 Product UX gaps (not bugs, but polish)

1. No empty-state illustration consistency across Logs / Search / Quick.  
2. No undo for meal delete beyond toast on quick-add.  
3. Water tracker celebration vs calorie celebration — keep subtle, not spammy.  
4. Onboarding skip paths — ensure “Skip” does not leave partial invalid profile.  
5. Quick meals “Filters” icon resets to All — label vs behaviour mismatch.  
6. No offline banner when remote search fails after empty local results.

---

## 6. Performance

| Finding | Severity | Notes |
|---------|----------|-------|
| `data/foods.json` ~1.3 MB | Medium | Lazy load exists; still heavy on low-end devices — keep deferred |
| `expo-blur` on tab bar | Medium | Costly on Android — OK if only tab bar/modals |
| Blob PNGs | Good | Better than live blur per screen |
| `expo-image` unused after fallback to RN Image | Low | Dead dependency until rebuild + re-adopt |
| FlashList v2 | Note | `estimatedItemSize` removed in v2 API — OK |
| Full-store zustand subscriptions | Medium | Draft meal, some screens |
| SectionList on Logs | Low | Fine for day sections; FlashList not required |

---

## 7. Unnecessary / delete candidates vs keep

### 7.1 Safe to delete or stop shipping (after confirming unused)

| Path | Why |
|------|-----|
| `assets/images/icon.png`, `adaptive-foreground.png`, `monochrome.png` | Superseded by `assets/brand/*` (app.json points at brand). Confirm no imports, then delete. |
| `hooks/useThemedStyles.ts` | **Zero call sites** — either use it everywhere or delete later; prefer **use** over delete. |
| `expo-image` dependency | Unused after BlobBackground switched to RN Image — remove **or** re-integrate after native rebuild. |
| Dead UI for `FEATURES.barcode` / `favourites` | Hide until built |

### 7.2 Keep (important) — do not delete

| Path | Why |
|------|-----|
| `app/**` | All routes |
| `components/ui/**`, onboarding components | Design system |
| `theme/palette.ts`, `runtime.ts`, `ThemeProvider` | Theming |
| `store/*`, `storage/*` | Persistence |
| `services/food/*`, `data/foods.json`, `data/quickRecipes.json` | Core product |
| `assets/brand/*`, `assets/sounds/tick.wav` | Brand + feedback |
| `hooks/useTheme.ts`, `useTickFeedback.ts` | Theme + haptics/sound |
| `babel.config.js` | Reanimated + strip console |
| `tools/usda-build/`, `tools/slim-foods.mjs` | Data pipeline (dev only; raw/ already gitignored) |
| `.env.example`, `README.md`, `AGENTS.md` | Docs |
| `eas.json`, `app.json` | Build config |

### 7.3 Local / generated — never commit

| Path | Notes |
|------|-------|
| `.env` | Secrets — already gitignored |
| `node_modules/`, `.expo/`, `android/`, `ios/` | Generated / local |
| `tools/usda-build/raw/` | Gitignored USDA raw dumps |

### 7.4 Do not delete without replacement

| Path | Reason |
|------|--------|
| `app/(tabs)/add.tsx` | May be required by tab navigator naming even if Redirect |
| `services/usda/*` | Optional fallback when key present |
| `components/ui/index.ts` | Barrel — keep but keep router-heavy pieces out |

---

## 8. Native rebuild checklist (required)

Until a new **dev client / EAS preview** is installed:

| Module | Status without rebuild |
|--------|------------------------|
| `expo-audio` | Tick sound silent (guarded) |
| `expo-haptics` | Haptics may no-op (guarded) |
| `expo-image` | Not used in BlobBackground anymore |
| New Arch / R8 | Configured in `app.json` — only applies to new builds |

**Command reminder (for you later):** `eas build --profile preview` or `npx expo run:android` — not Expo Go for this feature set.

---

## 9. Recommended fix order (priority)

1. **Rotate / remove client USDA key**; document EAS secrets policy.  
2. **Serialize mealStorage writes** (data integrity).  
3. **Theme purge:** migrate remaining `theme/colors` StyleSheet screens to `useTheme` / `useThemedStyles`.  
4. **Native rebuild** for audio/haptics.  
5. Profile setState-during-render → `useEffect`.  
6. Wipe completeness + clear `foodCache`.  
7. Clean duplicate `assets/images` + decide `expo-image`.  
8. Selector hygiene on zustand; hide unfinished FEATURES UI.  
9. Release/preview perf pass (Logs / Search / Ruler scroll at 60fps).

---

## 10. What looks good already

- Offline-first food search with OFF → USDA fallback and cooldown.  
- Onboarding flow structure and goal calculation separation.  
- Wipe + confirm dialogs for destructive actions.  
- Dark palette tokens defined centrally (`theme/palette.ts`).  
- Scheme-aware shadows (`utils/shadow.ts`) when runtime scheme is synced.  
- FlashList on Search / Quick meals; PressableScale; motion constants.  
- Privacy-minded copy (“data stays on this device”).  
- Typecheck / lint discipline in recent work.  
- `.env` gitignored; cleartext traffic disabled.

---

## 11. Files referenced most often in this audit

```
.env                          # secret (local only)
services/usda/usdaApi.ts
storage/mealStorage.ts
storage/wipe.ts
utils/linking.ts
services/network/jsonRequest.ts
theme/colors.ts               # proxy — easy to misuse
app/onboarding/intro.tsx      # frozen styles example
app/meal/draft.tsx
app/food/custom.tsx
app/food/[id].tsx
components/ui/LogoMark.tsx
app/(tabs)/profile.tsx
hooks/useTickFeedback.ts
components/ui/BlobBackground.tsx
components/ui/index.ts
package.json / app.json
assets/images/*               # delete candidates
hooks/useThemedStyles.ts      # unused helper — should be used
```

---

## 12. Sign-off

This report is an **expert static audit** of the Mealytics codebase as of the date above. It does **not** replace a device QA pass on a **fresh preview build**.  

**No application source was modified** while producing this document — only this report file was added.

---

## 13. Addendum — UI / dead-code pass

Supplementary findings from the [UI and dead code audit](75baac0f-af38-4e0b-bf68-d9f4e6ee0eb0) (read-only). Merged here so one file remains the source of truth.

### Extra UI / theme notes
| Item | Detail |
|------|--------|
| `gradients.ring` in `theme/colors.ts` | Hardcoded light mint/violet — should be scheme-aware for dark |
| Modal / dialog scrims | Hardcoded `rgba(30,37,51,0.35)` — add an `overlay` token per theme |
| Icon families | `StateIndicators` / `ServingSizeSelector` use Ionicons; rest of app uses Feather — unify |
| `BlobBackground` `variant` | Prop ignored (B1/B2 unused) — wire variants or drop the API |
| Profile / Today `makeStyles(colors)` | Recreated every render — memoize with `useThemedStyles` / `useMemo` |

### Extra UX gaps
| Gap | Should be |
|-----|-----------|
| No edit serving on logged foods | Tap row → edit amount / soft-delete with undo |
| Quick meals static only | Allow “save as quick meal” from draft/logged meal |
| Search recents = queries only | Also show recently logged foods |
| Water mostly +250 ml | Custom amount / presets |

### Extra cleanup / perf
| Item | Action |
|------|--------|
| Local APK under `builds/` (~263 MB if present) | Already gitignored — delete from disk; never ship |
| `data/foods.json` (~1.3 MB, ~7759 foods) | Linear search O(n) — plan prefix index / SQLite if catalog grows |
| Duplicate `assets/images/*` | Confirmed byte-duplicates of `assets/brand/*` — safe delete after double-check |

### Revised priority (unchanged top, UX after)
1. Theme freeze migration + LogoMark  
2. Meal write serialization + USDA key strategy  
3. Asset / `expo-image` cleanup  
4. Edit servings, hide dead FEATURES UI, single Add→Search path  
5. Memoize themed styles; food search index if needed  

---

## 14. Addendum — security / bugs pass

Supplementary findings from the [Security and bugs audit](6ecc046f-10a0-4449-89c2-5056bb23f2bd) (read-only).

### Elevate / add these (were understated or missing above)

| Sev | Location | Finding | Fix |
|-----|----------|---------|-----|
| **Critical** | `wipe.ts` + `zustandStorage` debounce + `mealStorage` | Wipe can be **undone**: in-flight RMW or 300ms debounced `setItem` can rewrite keys after `multiRemove`. Theme/prefs may also re-persist defaults after wipe. | Mutex/generation token; cancel/flush debounces; pause persist; reset **all** stores; optional re-wipe after settle |
| **Critical** | `mealStorage.getMeals` | `return meals \|\| []` — non-array JSON (`{}`) is truthy → `.filter` **crashes** Today/Logs | `Array.isArray(meals) ? meals : []` (+ repair bad key) |
| **High** | `FloatingTabBar` | Hard `expo-blur` import — missing native blur on old binary can crash tabs | Optional native guard + solid fallback fill |
| **High** | Profile / onboarding draft in AsyncStorage | Health PII unencrypted at rest | Document threat model; SecureStore / encrypt if needed |
| **Medium** | `ThemeProvider` | `setActiveColors(scheme)` mutates globals **during render** (React 19 concurrent risk) | `useLayoutEffect` or derive without singleton mutation |
| **Medium** | Splash `ready` | Gates user + onboarding only — not theme/prefs/draft → brief wrong theme flash | Include theme (and ideally prefs) hydration |
| **Medium** | `userStore.setHasOnboarded` | Ignores write failure → memory/disk diverge | Only update state if write succeeds |
| **Medium** | Corrupt profile → goals | Bad multipliers → `NaN` / Infinity BMI | Schema-validate before `calculateGoals` |
| **Medium** | `waterStorage` | Non-number JSON can corrupt totals | `Number.isFinite` guard |
| **Low** | `foodCache` | Unbounded `Map` growth | Cap / LRU |
| **Low** | `EXPO_PUBLIC_USE_RN_FETCH` | Documented but unused | Remove or implement |

### Confirmed OK (security pass)
- `.env` gitignored and untracked; cleartext HTTP off; HTTPS-only food APIs  
- No WebView; logging `__DEV__` + production console strip  
- ExpoAudio/Haptics optional; ExpoImage avoided for blobs  
- Search request-id race guard; OFF→USDA cooldown  

### Hardened fix order (supersedes §9 / §13 for engineering)
1. **Wipe serialization** + full store reset (Critical)  
2. **`Array.isArray` in `getMeals`** (Critical crash)  
3. **Meal write queue** (High data loss)  
4. **USDA key** proxy / rotate (High)  
5. Theme freeze + optional blur fallback  
6. Schema-validate profile/meals; allowlist `openExternalUrl`  

---

*Generated for Mealytics engineering review. Next step when ready: implement Priority 1–4 fixes in a dedicated PR, then EAS preview QA.*
