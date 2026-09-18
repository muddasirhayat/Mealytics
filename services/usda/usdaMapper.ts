import { Food, Nutrient } from '@/types/food';
import { UsdaFoodItem, UsdaNutrient } from './usdaTypes';

const USDA_NUTRIENT_IDS = {
  CALORIES: 1008,
  PROTEIN: 1003,
  FAT: 1004,
  CARBS: 1005,
  FIBER: 1079,
  SUGAR: 2000,
  SODIUM: 1093,
};

const getNutrientId = (nutrient: UsdaNutrient): number =>
  nutrient.nutrientId ?? nutrient.nutrient?.id ?? 0;

const getNutrientAmount = (nutrient: UsdaNutrient): number =>
  nutrient.value ?? nutrient.amount ?? 0;

const getNutrientValue = (nutrients: UsdaNutrient[], id: number): number => {
  const nutrient = nutrients.find((item) => getNutrientId(item) === id);
  return nutrient ? getNutrientAmount(nutrient) : 0;
};

export const mapUsdaFoodToInternal = (usdaFood: UsdaFoodItem): Food => {
  const sourceNutrients = usdaFood.foodNutrients ?? [];
  const nutrients: Nutrient[] = sourceNutrients.map((n) => ({
    id: getNutrientId(n),
    name: n.nutrientName ?? n.nutrient?.name ?? '',
    amount: getNutrientAmount(n),
    unit: n.unitName ?? n.nutrient?.unitName ?? '',
  }));

  const brand = usdaFood.brandName || usdaFood.brandOwner;
  const name = usdaFood.description?.trim() || 'USDA food';

  return {
    id: usdaFood.fdcId.toString(),
    name,
    brand,
    dataSource: 'usda',
    calories: getNutrientValue(sourceNutrients, USDA_NUTRIENT_IDS.CALORIES),
    protein: getNutrientValue(sourceNutrients, USDA_NUTRIENT_IDS.PROTEIN),
    carbohydrates: getNutrientValue(sourceNutrients, USDA_NUTRIENT_IDS.CARBS),
    fat: getNutrientValue(sourceNutrients, USDA_NUTRIENT_IDS.FAT),
    fiber: getNutrientValue(sourceNutrients, USDA_NUTRIENT_IDS.FIBER),
    sugar: getNutrientValue(sourceNutrients, USDA_NUTRIENT_IDS.SUGAR),
    sodium: getNutrientValue(sourceNutrients, USDA_NUTRIENT_IDS.SODIUM),
    servingSize: usdaFood.servingSize ?? 100,
    servingUnit: usdaFood.servingSizeUnit ?? 'g',
    nutrients,
    rawSourceId: usdaFood.fdcId.toString(),
  };
};
