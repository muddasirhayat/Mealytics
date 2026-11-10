import { Food } from '@/types/food';
import { foodCache } from '@/services/food/foodCache';
import { getCommonFoodById, searchCommonFoods } from '@/services/food/commonFoods';
import { getLocalFoodById, matchQuality, searchLocalFoods } from '@/services/food/localFoods';
import { openFoodFactsApi } from '@/services/off/openFoodFactsApi';
import { usdaApi } from '@/services/usda/usdaApi';
import { mapUsdaFoodToInternal } from '@/services/usda/usdaMapper';
import { logWarn } from '@/utils/log';

const USDA_COOLDOWN_MS = 15 * 60 * 1000;
let usdaDisabledUntil = 0;

const isUsdaEnabled = () => Date.now() >= usdaDisabledUntil;

const disableUsda = () => {
  usdaDisabledUntil = Date.now() + USDA_COOLDOWN_MS;
};

const searchUsdaFoods = async (query: string): Promise<Food[]> => {
  const usdaResponse = await usdaApi.searchFoods(query, 1);
  return (usdaResponse.foods ?? [])
    .filter((item) => Boolean(item?.fdcId) && Boolean(item?.description))
    .map(mapUsdaFoodToInternal);
};

const isCurated = (food: Food): boolean => food.id.startsWith('local-');

export const searchOfflineFoods = (query: string): Food[] => {
  const bundled = searchLocalFoods(query);
  const common = searchCommonFoods(query);
  const byName = new Map<string, Food>();
  for (const food of [...common, ...bundled]) {
    const key = food.name.toLowerCase();
    const existing = byName.get(key);
    if (!existing || (isCurated(food) && !isCurated(existing))) {
      byName.set(key, food);
    }
  }

  let ranked = [...byName.values()].map((food) => ({
    food,
    quality: matchQuality(food.name, query),
  }));
  const hasStrongMatch = ranked.some((item) => item.quality <= 1);
  if (hasStrongMatch) {
    ranked = ranked.filter((item) => item.quality <= 1);
  }
  ranked.sort(
    (a, b) =>
      a.quality - b.quality ||
      Number(!isCurated(a.food)) - Number(!isCurated(b.food)) ||
      a.food.name.length - b.food.name.length ||
      a.food.name.localeCompare(b.food.name)
  );

  const merged = ranked.map((item) => item.food);
  foodCache.putMany(merged);
  return merged;
};

export const searchRemoteFoods = async (query: string): Promise<Food[]> => {
  let offFailed = false;
  try {
    const offFoods = await openFoodFactsApi.searchFoods(query);
    foodCache.putMany(offFoods);
    if (offFoods.length > 0) {
      return offFoods;
    }
  } catch (offError) {
    offFailed = true;
    logWarn('[food-search] Open Food Facts search failed', offError);
  }

  if (isUsdaEnabled() && usdaApi.hasApiKey()) {
    try {
      const usdaFoods = await searchUsdaFoods(query);
      foodCache.putMany(usdaFoods);
      return usdaFoods;
    } catch (usdaError) {
      disableUsda();
      logWarn('[food-search] USDA search failed; skipping USDA for 15 minutes', usdaError);
      if (!offFailed) return [];
    }
  } else if (!offFailed) {
    return [];
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
