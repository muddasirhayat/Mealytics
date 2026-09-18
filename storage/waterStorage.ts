import { storage } from './storage';

const getWaterKey = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `mealytics_water_${yyyy}-${mm}-${dd}`;
};

export const waterStorage = {
  async getWater(date: Date = new Date()): Promise<number> {
    const key = getWaterKey(date);
    const amount = await storage.getItem<number>(key);
    return amount ?? 0;
  },

  async addWater(amountMl: number, date: Date = new Date()): Promise<number> {
    const key = getWaterKey(date);
    const current = await this.getWater(date);
    const updated = Math.max(0, current + amountMl);
    await storage.setItem(key, updated);
    return updated;
  },

  async setWater(amountMl: number, date: Date = new Date()): Promise<number> {
    const key = getWaterKey(date);
    const updated = Math.max(0, amountMl);
    await storage.setItem(key, updated);
    return updated;
  },

  async resetWater(date: Date = new Date()): Promise<void> {
    const key = getWaterKey(date);
    await storage.removeItem(key);
  }
};
