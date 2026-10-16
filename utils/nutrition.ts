import { Food } from '@/types/food';
import { parseDecimal } from '@/utils/number';

export const getBaseServing = (food: Food): number =>
  food.servingSize && food.servingSize > 0 ? food.servingSize : 100;

export const getServingMultiplier = (food: Food, amount: number): number => {
  const base = getBaseServing(food);
  if (base <= 0 || !Number.isFinite(amount) || amount <= 0) {
    return 0;
  }
  return amount / base;
};

export const scaleAmount = (value: number | undefined, multiplier: number): number | undefined => {
  if (value === undefined) {
    return undefined;
  }
  return value * multiplier;
};

export const scaleFoodNutrition = (food: Food, amount: number): Omit<Food, 'id'> => {
  const multiplier = getServingMultiplier(food, amount);
  const unit = food.servingUnit?.trim() || 'g';

  return {
    ...food,
    calories: food.calories * multiplier,
    protein: food.protein * multiplier,
    carbohydrates: food.carbohydrates * multiplier,
    fat: food.fat * multiplier,
    fiber: scaleAmount(food.fiber, multiplier),
    sugar: scaleAmount(food.sugar, multiplier),
    sodium: scaleAmount(food.sodium, multiplier),
    servingSize: amount,
    servingUnit: unit,
    servingLabel: food.servingLabel,
    nutrients: (food.nutrients ?? []).map((nutrient) => ({
      ...nutrient,
      amount: nutrient.amount * multiplier,
    })),
  };
};

export const parsePositiveNumber = (text: string): number | null => {
  const amount = parseDecimal(text);
  if (amount === null || amount <= 0) {
    return null;
  }
  return amount;
};

export const parseOptionalNumber = (text: string): number | undefined => {
  const trimmed = text.trim();
  if (!trimmed) {
    return undefined;
  }
  const amount = parseDecimal(trimmed);
  if (amount === null || amount < 0) {
    return undefined;
  }
  return amount;
};

export const formatFoodServing = (food: Food): string => {
  const label = food.servingLabel?.trim();
  if (label) {
    return label;
  }
  const size = Math.round((food.servingSize ?? 100) * 10) / 10;
  const unit = food.servingUnit || 'g';
  return `${size}${unit}`;
};
