import { storage } from './storage';

const KEY = 'mealytics_recent_searches';
const LIMIT = 6;

export const recentSearchStorage = {
  async get(): Promise<string[]> {
    const items = await storage.getItem<string[]>(KEY);
    return Array.isArray(items) ? items.slice(0, LIMIT) : [];
  },

  async add(query: string): Promise<string[]> {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return this.get();
    }
    const current = await this.get();
    const next = [trimmed, ...current.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(
      0,
      LIMIT
    );
    await storage.setItem(KEY, next);
    return next;
  },

  async clear(): Promise<void> {
    await storage.removeItem(KEY);
  },
};
