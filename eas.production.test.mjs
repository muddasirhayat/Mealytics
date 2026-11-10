import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const app = JSON.parse(readFileSync(new URL('./app.json', import.meta.url), 'utf8'));
const eas = JSON.parse(readFileSync(new URL('./eas.json', import.meta.url), 'utf8'));

describe('Play production config', () => {
  it('ships an app bundle without a USDA key', () => {
    expect(eas.build.production.android.buildType).toBe('app-bundle');
    expect(eas.build.production.env).toBeUndefined();
    expect(JSON.stringify(eas)).not.toContain('EXPO_PUBLIC_USDA_API_KEY');
  });

  it('submits a draft to the closed testing track', () => {
    expect(eas.submit.production.android.track).toBe('alpha');
    expect(eas.submit.production.android.releaseStatus).toBe('draft');
  });

  it('lets EAS own the Android version code and keeps backup off', () => {
    expect(eas.cli.appVersionSource).toBe('remote');
    expect(app.expo.android.versionCode).toBeUndefined();
    expect(app.expo.android.allowBackup).toBe(false);
    expect(app.expo.android.package).toBe('com.codixr.mealytics');
    expect(app.expo.ios.bundleIdentifier).toBe('com.codixr.mealytics');
  });
});
