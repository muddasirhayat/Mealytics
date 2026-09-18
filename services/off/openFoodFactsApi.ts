import { Food } from '@/types/food';
import { jsonRequest, withQuery } from '@/services/network/jsonRequest';

type OffProduct = {
  code?: unknown;
  product_name?: unknown;
  product_name_en?: unknown;
  brands?: unknown;
  nutriments?: Record<string, unknown> | null;
};

const FIELDS = 'code,product_name,product_name_en,brands,nutriments';

const toNumber = (value: unknown): number => {
  const amount = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

const asText = (value: unknown): string => {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map(asText).filter(Boolean).join(', ');
  }
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return asText(record.en ?? record.fr ?? Object.values(record)[0]);
  }
  return '';
};

const mapProduct = (product: unknown): Food | null => {
  if (!product || typeof product !== 'object') {
    return null;
  }

  const item = product as OffProduct;
  const name = asText(item.product_name) || asText(item.product_name_en);
  const code = asText(item.code);
  if (!name || !code) {
    return null;
  }

  const nutriments =
    item.nutriments && typeof item.nutriments === 'object' && !Array.isArray(item.nutriments)
      ? item.nutriments
      : {};
  const calories = toNumber(nutriments['energy-kcal_100g'] ?? nutriments.energy_kcal_100g);
  const protein = toNumber(nutriments.proteins_100g);
  const carbohydrates = toNumber(nutriments.carbohydrates_100g);
  const fat = toNumber(nutriments.fat_100g);
  if (calories <= 0 && protein <= 0 && carbohydrates <= 0 && fat <= 0) {
    return null;
  }

  return {
    id: `off-${code}`,
    name,
    brand: asText(item.brands) || 'Open Food Facts',
    dataSource: 'custom',
    calories,
    protein,
    carbohydrates,
    fat,
    fiber: toNumber(nutriments.fiber_100g),
    sugar: toNumber(nutriments.sugars_100g),
    sodium: toNumber(nutriments.sodium_100g) * 1000,
    servingSize: 100,
    servingUnit: 'g',
    nutrients: [],
    rawSourceId: code,
  };
};

const extractProducts = (response: unknown): unknown[] => {
  if (!response || typeof response !== 'object') {
    return [];
  }
  const record = response as Record<string, unknown>;
  if (Array.isArray(record.hits)) {
    return record.hits;
  }
  if (Array.isArray(record.products)) {
    return record.products;
  }
  if (record.hits && typeof record.hits === 'object') {
    const nested = record.hits as Record<string, unknown>;
    if (Array.isArray(nested.hits)) {
      return nested.hits;
    }
  }
  return [];
};

const mapProducts = (response: unknown): Food[] => {
  const foods: Food[] = [];
  for (const product of extractProducts(response)) {
    try {
      const food = mapProduct(product);
      if (food) {
        foods.push(food);
      }
    } catch {
      // Skip malformed products instead of failing the whole search.
    }
  }
  return foods;
};

const searchAlicious = async (query: string): Promise<Food[]> => {
  const response = await jsonRequest(
    withQuery('https://search.openfoodfacts.org/search', {
      q: query.trim(),
      page_size: '8',
      langs: 'en',
      fields: FIELDS,
    }),
    8000
  );
  return mapProducts(response);
};

const searchCgi = async (query: string): Promise<Food[]> => {
  const response = await jsonRequest(
    withQuery('https://world.openfoodfacts.org/cgi/search.pl', {
      search_terms: query.trim(),
      search_simple: '1',
      action: 'process',
      json: '1',
      page_size: '8',
      fields: FIELDS,
    }),
    8000
  );
  return mapProducts(response);
};

export const openFoodFactsApi = {
  async searchFoods(query: string): Promise<Food[]> {
    try {
      const hits = await searchAlicious(query);
      if (hits.length > 0) {
        return hits;
      }
    } catch (error) {
      if (__DEV__) {
        console.warn('[food-search] Open Food Facts search-a-licious failed', error);
      }
    }

    try {
      return await searchCgi(query);
    } catch (error) {
      if (__DEV__) {
        console.warn('[food-search] Open Food Facts CGI search failed', error);
      }
      return [];
    }
  },

  async getProduct(code: string): Promise<Food> {
    const response = await jsonRequest(
      withQuery(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json`, {
        fields: FIELDS,
      }),
      8000
    );
    const record = response && typeof response === 'object' ? (response as { product?: unknown }) : {};
    const food = mapProduct(record.product);
    if (!food) {
      throw new Error('Food not found.');
    }
    return food;
  },
};
