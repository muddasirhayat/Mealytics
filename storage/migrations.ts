import { storage } from './storage';

const SCHEMA_VERSION_KEY = 'mealytics_schema_version';
const PROFILE_KEY = 'mealytics_user_profile';
const ONBOARDED_KEY = 'mealytics_has_onboarded';

/** Current schema. v1 = original keys with no version stamp. */
export const CURRENT_SCHEMA_VERSION = 2;

const migrateToV2 = async (): Promise<void> => {
  const profile = await storage.getItem<unknown>(PROFILE_KEY);
  const onboarded = await storage.getItem<boolean>(ONBOARDED_KEY);
  if (profile && onboarded == null) {
    await storage.setItem(ONBOARDED_KEY, true);
  }
};

export const runMigrations = async (): Promise<void> => {
  const stored = await storage.getItem<number>(SCHEMA_VERSION_KEY);
  const version =
    typeof stored === 'number' && Number.isFinite(stored) ? stored : 1;

  if (version < 2) {
    await migrateToV2();
  }

  if (version < CURRENT_SCHEMA_VERSION) {
    await storage.setItem(SCHEMA_VERSION_KEY, CURRENT_SCHEMA_VERSION);
  }
};
