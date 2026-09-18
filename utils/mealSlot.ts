import { Meal, MealSlot } from '@/types/meal';

export const MEAL_SLOTS: { id: MealSlot; title: string; emoji: string; timeRange: string }[] = [
  { id: 'breakfast', title: 'Breakfast', emoji: '🌅', timeRange: 'Morning' },
  { id: 'lunch', title: 'Lunch', emoji: '☀️', timeRange: 'Midday' },
  { id: 'dinner', title: 'Dinner', emoji: '🌙', timeRange: 'Evening' },
  { id: 'snacks', title: 'Snacks & Drinks', emoji: '🍎', timeRange: 'Anytime' },
];

export const isMealSlot = (value: unknown): value is MealSlot =>
  value === 'breakfast' || value === 'lunch' || value === 'dinner' || value === 'snacks';

export const getDefaultSlotForHour = (date: Date = new Date()): MealSlot => {
  const hour = date.getHours();
  if (hour >= 4 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 16) return 'lunch';
  if (hour >= 16 && hour < 21) return 'dinner';
  return 'snacks';
};

export const getMealSlot = (meal: Meal): MealSlot =>
  meal.slot ?? getDefaultSlotForHour(new Date(meal.timestamp));

export const getMealSlotLabel = (slot?: string): string =>
  MEAL_SLOTS.find((item) => item.id === slot)?.title ?? 'Meal';
