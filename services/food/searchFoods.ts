import { Food } from '@/types/food';
import { foodCache } from '@/services/food/foodCache';
import { getCommonFoodById, searchCommonFoods } from '@/services/food/commonFoods';
import { openFoodFactsApi } from '@/services/off/openFoodFactsApi';
import { usdaApi } from '@/services/usda/usdaApi';
import { mapUsdaFoodToInternal } from '@/services/usda/usdaMapper';

const USDA_COOLDOWN_MS = 15 * 60 * 1000;
let usdaDisabledUntil = 0;

const isUsdaEnabled = () => Date.now() >= usdaDisabledUntil;

const disableUsda = () => {
  usdaDisabledUntil = Date.now() + USDA_COOLDOWN_MS;
};

const mergeFoods = (primary: Food[], secondary: Food[]): Food[] => {
  const seenNames = new Set(primary.map((food) => food.name.toLowerCase()));
  const extras = secondary.filter((food) => !seenNames.has(food.name.toLowerCase()));
  return [...primary, ...extras];
};

const searchUsdaFoods = async (query: string): Promise<Food[]> => {
  const usdaResponse = await usdaApi.searchFoods(query, 1);
  return (usdaResponse.foods ?? [])
    .filter((item) => Boolean(item?.fdcId) && Boolean(item?.description))
    .map(mapUsdaFoodToInternal);
};

export const searchRemoteFoods = async (query: string, localMatches: Food[]): Promise<Food[]> => {
  try {
    const offFoods = await openFoodFactsApi.searchFoods(query);
    foodCache.putMany(offFoods);
    if (offFoods.length > 0) {
      return mergeFoods(offFoods, localMatches);
    }
  } catch (offError) {
    if (__DEV__) {
      console.warn('[food-search] Open Food Facts search failed', offError);
    }
  }

  if (isUsdaEnabled()) {
    try {
      const usdaFoods = await searchUsdaFoods(query);
      foodCache.putMany(usdaFoods);
      if (usdaFoods.length > 0) {
        return mergeFoods(usdaFoods, localMatches);
      }
    } catch (usdaError) {
      disableUsda();
      if (__DEV__) {
        console.warn('[food-search] USDA search failed; skipping USDA for 15 minutes', usdaError);
      }
    }
  }

  if (localMatches.length > 0) {
    return localMatches;
  }

  throw new Error('Could not search foods. Check your connection and try again.');
};

export const searchFoods = async (query: string): Promise<Food[]> => {
  const localMatches = searchCommonFoods(query);
  foodCache.putMany(localMatches);
  return searchRemoteFoods(query, localMatches);
};

export const getFoodById = async (id: string): Promise<Food> => {
  const cached = foodCache.get(id);
  if (cached) {
    return cached;
  }

  if (id.startsWith('local-')) {
    const localFood = getCommonFoodById(id);
    if (!localFood) {
      throw new Error('Food not found.');
    }
    foodCache.put(localFood);
    return localFood;
  }

  if (id.startsWith('off-')) {
    const offFood = await openFoodFactsApi.getProduct(id.slice(4));
    foodCache.put(offFood);
    return offFood;
  }

  const usdaFood = await usdaApi.getFoodDetails(id);
  const mapped = mapUsdaFoodToInternal(usdaFood);
  foodCache.put(mapped);
  return mapped;
};
