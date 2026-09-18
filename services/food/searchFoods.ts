import { Food } from '@/types/food';
import { foodCache } from '@/services/food/foodCache';
import { getCommonFoodById, searchCommonFoods } from '@/services/food/commonFoods';
import { getLocalFoodById, searchLocalFoods } from '@/services/food/localFoods';
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
  const seenIds = new Set(primary.map((food) => food.id));
  const seenNames = new Set(primary.map((food) => food.name.toLowerCase()));
  const extras = secondary.filter(
    (food) => !seenIds.has(food.id) && !seenNames.has(food.name.toLowerCase())
  );
  return [...primary, ...extras];
};

const searchUsdaFoods = async (query: string): Promise<Food[]> => {
  const usdaResponse = await usdaApi.searchFoods(query, 1);
  return (usdaResponse.foods ?? [])
    .filter((item) => Boolean(item?.fdcId) && Boolean(item?.description))
    .map(mapUsdaFoodToInternal);
};

export const searchOfflineFoods = (query: string): Food[] => {
  const bundled = searchLocalFoods(query);
  const common = searchCommonFoods(query);
  const merged = mergeFoods(bundled, common);
  foodCache.putMany(merged);
  return merged;
};

export const searchRemoteFoods = async (query: string): Promise<Food[]> => {
  try {
    const offFoods = await openFoodFactsApi.searchFoods(query);
    foodCache.putMany(offFoods);
    if (offFoods.length > 0) {
      return offFoods;
    }
  } catch (offError) {
    if (__DEV__) {
      console.warn('[food-search] Open Food Facts search failed', offError);
    }
  }

  if (isUsdaEnabled() && usdaApi.hasApiKey()) {
    try {
      const usdaFoods = await searchUsdaFoods(query);
      foodCache.putMany(usdaFoods);
      if (usdaFoods.length > 0) {
        return usdaFoods;
      }
    } catch (usdaError) {
      disableUsda();
      if (__DEV__) {
        console.warn('[food-search] USDA search failed; skipping USDA for 15 minutes', usdaError);
      }
    }
  }

  throw new Error('Could not search foods. Check your connection and try again.');
};

export const searchFoods = async (query: string): Promise<Food[]> => {
  const localMatches = searchOfflineFoods(query);
  if (localMatches.length > 0) {
    return localMatches;
  }
  return searchRemoteFoods(query);
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

  const bundled = getLocalFoodById(id);
  if (bundled) {
    foodCache.put(bundled);
    return bundled;
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
