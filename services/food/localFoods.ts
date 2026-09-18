import { Food } from '@/types/food';
import catalog from '@/data/foods.json';

type FoodsCatalog = {
  version: number;
  generatedAt: string;
  source: string;
  per: string;
  foods: Food[];
};

const RESULT_LIMIT = 25;
const DATA = catalog as FoodsCatalog;
const FOODS: Food[] = DATA.foods;
const FOODS_BY_ID = new Map(FOODS.map((food) => [food.id, food]));

const splitWords = (name: string): string[] =>
  name.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

const tokenWordRank = (words: string[], token: string): number => {
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

const rankMatch = (name: string, query: string, tokens: string[]): number => {
  const words = splitWords(name);
  const first = words[0] ?? '';
  const worstTokenRank = Math.max(...tokens.map((token) => tokenWordRank(words, token)));
  const firstIsQuery =
    first === query ||
    first === `${query}s` ||
    (first.startsWith(query) && first.length - query.length <= 2);
  if (firstIsQuery && worstTokenRank <= 1) {
    return 0;
  }
  return worstTokenRank + 1;
};

export const getLocalFoodById = (id: string): Food | undefined => FOODS_BY_ID.get(id);

export const searchLocalFoods = (query: string): Food[] => {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return [];
  }

  const tokens = trimmed.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) {
    return [];
  }

  const matches: { food: Food; rank: number; index: number; length: number }[] = [];
  for (const food of FOODS) {
    const name = food.name.toLowerCase();
    if (!tokens.every((token) => name.includes(token))) {
      continue;
    }
    matches.push({
      food,
      rank: rankMatch(name, trimmed, tokens),
      index: name.indexOf(tokens[0]),
      length: name.length,
    });
  }

  matches.sort(
    (a, b) =>
      a.rank - b.rank ||
      a.index - b.index ||
      a.length - b.length ||
      a.food.name.localeCompare(b.food.name)
  );

  return matches.slice(0, RESULT_LIMIT).map((item) => item.food);
};
