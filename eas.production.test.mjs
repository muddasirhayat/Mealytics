import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const app = JSON.parse(readFileSync(new URL('./app.json', import.meta.url), 'utf8'));
const eas = JSON.parse(readFileSync(new URL('./eas.json', import.meta.url), 'utf8'));

describe('Play production config', () => {
  it('ships an app bundle without a USDA key', () => {
    expect(eas.build.production.android.buildType).toBe('app-bundle');
    expect(eas.build.production.env.EXPO_PUBLIC_USDA_API_KEY).toBe('');
  });

  it('submits a draft to the closed testing track', () => {
    expect(eas.submit.production.android.track).toBe('alpha');
    expect(eas.submit.production.android.releaseStatus).toBe('draft');
  });

  it('bumps the Android version code and keeps backup off', () => {
    expect(app.expo.android.versionCode).toBeGreaterThan(1);
    expect(app.expo.android.allowBackup).toBe(false);
    expect(app.expo.android.package).toBe('com.codixr.mealytics');
    expect(app.expo.ios.bundleIdentifier).toBe('com.codixr.mealytics');
  });
});
