import { Food } from '@/types/food';

type CatalogFood = Partial<Food> & {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
};

type FoodsCatalog = {
  version: number;
  generatedAt: string;
  source: string;
  per: string;
  foods: CatalogFood[];
};

const RESULT_LIMIT = 25;

let FOODS: Food[] | null = null;
let FOODS_BY_ID: Map<string, Food> | null = null;

const hydrateCatalogFood = (raw: CatalogFood): Food => ({
  id: raw.id,
  name: raw.name,
  brand: raw.brand,
  dataSource: raw.dataSource ?? 'usda',
  calories: raw.calories,
  protein: raw.protein,
  carbohydrates: raw.carbohydrates,
  fat: raw.fat,
  fiber: raw.fiber,
  sugar: raw.sugar,
  sodium: raw.sodium,
  servingSize: raw.servingSize ?? 100,
  servingUnit: raw.servingUnit ?? 'g',
  servingLabel: raw.servingLabel,
  nutrients: raw.nutrients ?? [],
  rawSourceId: raw.rawSourceId,
});

const loadFoods = (): Food[] => {
  if (FOODS) return FOODS;
  // Metro bundles the JSON; require delays parse until first search / prefetch.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const catalog = require('../../data/foods.json') as FoodsCatalog;
  FOODS = catalog.foods.map(hydrateCatalogFood);
  FOODS_BY_ID = new Map(FOODS.map((food) => [food.id, food]));
  return FOODS;
};

export const prefetchLocalFoods = (): void => {
  // Defer off the first frame so splash / route mount stay smooth.
  const run = () => {
    const schedule =
      typeof requestIdleCallback === 'function'
        ? (task: () => void) => requestIdleCallback(() => task())
        : (task: () => void) => setTimeout(task, 1);
    schedule(() => {
      loadFoods();
    });
  };
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { InteractionManager } = require('react-native') as typeof import('react-native');
    InteractionManager.runAfterInteractions(run);
  } catch {
    run();
  }
};

const splitWords = (name: string): string[] =>
  name.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

/**
 * 0 whole word, 1 short prefix (≤2 extra letters), 2 long prefix (rotisserie),
 * 3 substring only.
 */
export const tokenWordRank = (words: string[], token: string): number => {
  if (words.some((word) => word === token || word === `${token}s`)) {
    return 0;
  }
  if (words.some((word) => word.startsWith(token) && word.length - token.length <= 2)) {
    return 1;
  }
  if (words.some((word) => word.startsWith(token))) {
    return 2;
  }
  return 3;
};

/** Lower is a better match. Whole words beat prefixes; long prefixes and substrings are last. */
export const matchQuality = (label: string, query: string): number => {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return 3;
  const words = splitWords(label);
  return Math.max(...tokens.map((token) => tokenWordRank(words, token)));
};

export const getLocalFoodById = (id: string): Food | undefined => {
  loadFoods();
  return FOODS_BY_ID?.get(id);
};

export const searchLocalFoods = (query: string): Food[] => {
  const catalog = loadFoods();
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return [];
  }

  const tokens = trimmed.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) {
    return [];
  }

  const matches: { food: Food; quality: number; length: number }[] = [];
  for (const food of catalog) {
    const name = food.name.toLowerCase();
    if (!tokens.every((token) => name.includes(token))) {
      continue;
    }
    matches.push({
      food,
      quality: matchQuality(name, trimmed),
      length: name.length,
    });
  }

  matches.sort(
    (a, b) =>
      a.quality - b.quality ||
      a.length - b.length ||
      a.food.name.localeCompare(b.food.name)
  );

  return matches.slice(0, RESULT_LIMIT).map((item) => item.food);
};
