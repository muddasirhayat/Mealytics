import { Food } from '@/types/food';

type CommonFoodSeed = {
  id: string;
  name: string;
  aliases?: string[];
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
};

const COMMON_FOODS: CommonFoodSeed[] = [
  { id: 'apple-raw', name: 'Apple, raw', aliases: ['apples'], calories: 52, protein: 0.3, carbohydrates: 14, fat: 0.2, fiber: 2.4, sugar: 10.4, sodium: 1 },
  { id: 'banana-raw', name: 'Banana, raw', aliases: ['bananas'], calories: 89, protein: 1.1, carbohydrates: 23, fat: 0.3, fiber: 2.6, sugar: 12.2, sodium: 1 },
  { id: 'orange-raw', name: 'Orange, raw', aliases: ['oranges'], calories: 47, protein: 0.9, carbohydrates: 12, fat: 0.1, fiber: 2.4, sugar: 9.4, sodium: 0 },
  { id: 'mango-raw', name: 'Mango, raw', aliases: ['mangoes'], calories: 60, protein: 0.8, carbohydrates: 15, fat: 0.4, fiber: 1.6, sugar: 13.7, sodium: 1 },
  { id: 'grapes-raw', name: 'Grapes, raw', calories: 69, protein: 0.7, carbohydrates: 18, fat: 0.2, fiber: 0.9, sugar: 15.5, sodium: 2 },
  { id: 'strawberry-raw', name: 'Strawberries, raw', aliases: ['strawberry'], calories: 32, protein: 0.7, carbohydrates: 8, fat: 0.3, fiber: 2, sugar: 4.9, sodium: 1 },
  { id: 'watermelon-raw', name: 'Watermelon, raw', calories: 30, protein: 0.6, carbohydrates: 8, fat: 0.2, fiber: 0.4, sugar: 6.2, sodium: 1 },
  { id: 'pear-raw', name: 'Pear, raw', aliases: ['pears'], calories: 57, protein: 0.4, carbohydrates: 15, fat: 0.1, fiber: 3.1, sugar: 9.8, sodium: 1 },
  { id: 'pineapple-raw', name: 'Pineapple, raw', calories: 50, protein: 0.5, carbohydrates: 13, fat: 0.1, fiber: 1.4, sugar: 9.9, sodium: 1 },
  { id: 'avocado-raw', name: 'Avocado, raw', calories: 160, protein: 2, carbohydrates: 9, fat: 15, fiber: 6.7, sugar: 0.7, sodium: 7 },
  { id: 'chicken-breast-cooked', name: 'Chicken breast, cooked', aliases: ['chicken'], calories: 165, protein: 31, carbohydrates: 0, fat: 3.6, fiber: 0, sodium: 74 },
  { id: 'chicken-thigh-cooked', name: 'Chicken thigh, cooked', calories: 209, protein: 26, carbohydrates: 0, fat: 11, sodium: 88 },
  { id: 'egg-whole-cooked', name: 'Egg, whole, cooked', aliases: ['eggs', 'boiled egg'], calories: 155, protein: 13, carbohydrates: 1.1, fat: 11, sodium: 124 },
  { id: 'egg-white-cooked', name: 'Egg white, cooked', calories: 52, protein: 11, carbohydrates: 0.7, fat: 0.2, sodium: 166 },
  { id: 'beef-cooked', name: 'Beef, cooked', aliases: ['steak'], calories: 250, protein: 26, carbohydrates: 0, fat: 15, sodium: 72 },
  { id: 'mutton-cooked', name: 'Mutton, cooked', aliases: ['lamb', 'goat'], calories: 294, protein: 25, carbohydrates: 0, fat: 21, sodium: 72 },
  { id: 'salmon-cooked', name: 'Salmon, cooked', aliases: ['fish'], calories: 206, protein: 22, carbohydrates: 0, fat: 12, sodium: 61 },
  { id: 'tuna-canned', name: 'Tuna, canned in water', aliases: ['tuna'], calories: 86, protein: 19, carbohydrates: 0, fat: 0.6, sodium: 247 },
  { id: 'shrimp-cooked', name: 'Shrimp, cooked', aliases: ['prawn', 'prawns'], calories: 99, protein: 24, carbohydrates: 0.2, fat: 0.3, sodium: 111 },
  { id: 'milk-whole', name: 'Milk, whole', aliases: ['dairy milk'], calories: 61, protein: 3.2, carbohydrates: 4.8, fat: 3.3, sugar: 5.1, sodium: 43 },
  { id: 'milk-lowfat', name: 'Milk, low fat (1%)', calories: 42, protein: 3.4, carbohydrates: 5, fat: 1, sugar: 5.2, sodium: 44 },
  { id: 'yogurt-plain', name: 'Yogurt, plain', aliases: ['dahi', 'curd'], calories: 61, protein: 3.5, carbohydrates: 4.7, fat: 3.3, sugar: 4.7, sodium: 46 },
  { id: 'greek-yogurt', name: 'Greek yogurt, plain', calories: 97, protein: 9, carbohydrates: 3.6, fat: 5, sodium: 36 },
  { id: 'cheddar-cheese', name: 'Cheddar cheese', aliases: ['cheese'], calories: 403, protein: 25, carbohydrates: 1.3, fat: 33, sodium: 621 },
  { id: 'paneer', name: 'Paneer', aliases: ['cottage cheese'], calories: 265, protein: 18, carbohydrates: 1.2, fat: 21, sodium: 18 },
  { id: 'white-rice-cooked', name: 'White rice, cooked', aliases: ['rice'], calories: 130, protein: 2.7, carbohydrates: 28, fat: 0.3, fiber: 0.4, sodium: 1 },
  { id: 'brown-rice-cooked', name: 'Brown rice, cooked', calories: 123, protein: 2.7, carbohydrates: 26, fat: 1, fiber: 1.6, sodium: 4 },
  { id: 'roti', name: 'Roti / chapati', aliases: ['chapati', 'chapatti', 'wheat roti'], calories: 297, protein: 11, carbohydrates: 46, fat: 7.5, fiber: 7, sodium: 409 },
  { id: 'naan', name: 'Naan', calories: 262, protein: 9, carbohydrates: 45, fat: 5.4, fiber: 2, sodium: 465 },
  { id: 'paratha', name: 'Paratha', calories: 326, protein: 6.4, carbohydrates: 41, fat: 15, fiber: 4, sodium: 368 },
  { id: 'white-bread', name: 'White bread', aliases: ['bread'], calories: 265, protein: 9, carbohydrates: 49, fat: 3.2, fiber: 2.7, sugar: 5, sodium: 491 },
  { id: 'oats-dry', name: 'Oats, dry', aliases: ['oatmeal'], calories: 389, protein: 17, carbohydrates: 66, fat: 7, fiber: 11, sodium: 2 },
  { id: 'pasta-cooked', name: 'Pasta, cooked', aliases: ['spaghetti', 'noodles'], calories: 131, protein: 5, carbohydrates: 25, fat: 1.1, fiber: 1.8, sodium: 1 },
  { id: 'potato-boiled', name: 'Potato, boiled', aliases: ['potatoes', 'aloo'], calories: 87, protein: 1.9, carbohydrates: 20, fat: 0.1, fiber: 1.8, sugar: 0.8, sodium: 5 },
  { id: 'sweet-potato', name: 'Sweet potato, cooked', calories: 90, protein: 2, carbohydrates: 21, fat: 0.2, fiber: 3.3, sugar: 6.5, sodium: 36 },
  { id: 'tomato-raw', name: 'Tomato, raw', aliases: ['tomatoes'], calories: 18, protein: 0.9, carbohydrates: 3.9, fat: 0.2, fiber: 1.2, sugar: 2.6, sodium: 5 },
  { id: 'onion-raw', name: 'Onion, raw', aliases: ['onions'], calories: 40, protein: 1.1, carbohydrates: 9.3, fat: 0.1, fiber: 1.7, sugar: 4.2, sodium: 4 },
  { id: 'spinach-raw', name: 'Spinach, raw', aliases: ['palak'], calories: 23, protein: 2.9, carbohydrates: 3.6, fat: 0.4, fiber: 2.2, sodium: 79 },
  { id: 'broccoli-raw', name: 'Broccoli, raw', calories: 34, protein: 2.8, carbohydrates: 7, fat: 0.4, fiber: 2.6, sodium: 33 },
  { id: 'carrot-raw', name: 'Carrot, raw', aliases: ['carrots', 'gajar'], calories: 41, protein: 0.9, carbohydrates: 10, fat: 0.2, fiber: 2.8, sugar: 4.7, sodium: 69 },
  { id: 'cucumber-raw', name: 'Cucumber, raw', calories: 15, protein: 0.7, carbohydrates: 3.6, fat: 0.1, fiber: 0.5, sugar: 1.7, sodium: 2 },
  { id: 'lentils-cooked', name: 'Lentils, cooked', aliases: ['dal', 'daal', 'masoor'], calories: 116, protein: 9, carbohydrates: 20, fat: 0.4, fiber: 8, sodium: 2 },
  { id: 'chickpeas-cooked', name: 'Chickpeas, cooked', aliases: ['chana', 'garbanzo'], calories: 164, protein: 8.9, carbohydrates: 27, fat: 2.6, fiber: 7.6, sodium: 7 },
  { id: 'kidney-beans-cooked', name: 'Kidney beans, cooked', aliases: ['rajma'], calories: 127, protein: 8.7, carbohydrates: 23, fat: 0.5, fiber: 6.4, sodium: 2 },
  { id: 'tofu', name: 'Tofu, firm', calories: 144, protein: 17, carbohydrates: 3, fat: 9, fiber: 2.3, sodium: 14 },
  { id: 'peanut-butter', name: 'Peanut butter', calories: 588, protein: 25, carbohydrates: 20, fat: 50, fiber: 6, sugar: 9, sodium: 429 },
  { id: 'almonds', name: 'Almonds', calories: 579, protein: 21, carbohydrates: 22, fat: 50, fiber: 13, sugar: 4.4, sodium: 1 },
  { id: 'walnuts', name: 'Walnuts', calories: 654, protein: 15, carbohydrates: 14, fat: 65, fiber: 6.7, sodium: 2 },
  { id: 'olive-oil', name: 'Olive oil', aliases: ['oil'], calories: 884, protein: 0, carbohydrates: 0, fat: 100, sodium: 2 },
  { id: 'ghee', name: 'Ghee', aliases: ['clarified butter'], calories: 876, protein: 0, carbohydrates: 0, fat: 99, sodium: 0 },
  { id: 'butter', name: 'Butter', calories: 717, protein: 0.9, carbohydrates: 0.1, fat: 81, sodium: 643 },
  { id: 'sugar', name: 'Sugar, white', aliases: ['table sugar'], calories: 387, protein: 0, carbohydrates: 100, fat: 0, sugar: 100, sodium: 1 },
  { id: 'honey', name: 'Honey', calories: 304, protein: 0.3, carbohydrates: 82, fat: 0, sugar: 82, sodium: 4 },
  { id: 'dark-chocolate', name: 'Dark chocolate', aliases: ['chocolate'], calories: 546, protein: 4.9, carbohydrates: 61, fat: 31, fiber: 7, sugar: 48, sodium: 6 },
  { id: 'cola', name: 'Cola / soda', aliases: ['coke', 'soft drink', 'pepsi'], calories: 42, protein: 0, carbohydrates: 10.6, fat: 0, sugar: 10.6, sodium: 4 },
  { id: 'biryani-chicken', name: 'Chicken biryani', aliases: ['biryani'], calories: 163, protein: 8.4, carbohydrates: 20, fat: 5.5, sodium: 390 },
  { id: 'chicken-karahi', name: 'Chicken karahi', aliases: ['karahi', 'karahi chicken'], calories: 168, protein: 16, carbohydrates: 4.2, fat: 9.5, sodium: 420 },
  { id: 'dal-tadka', name: 'Dal tadka', aliases: ['daal tadka'], calories: 116, protein: 7, carbohydrates: 16, fat: 3.2, fiber: 5, sodium: 310 },
  { id: 'samosa', name: 'Samosa', calories: 262, protein: 5, carbohydrates: 24, fat: 17, sodium: 420 },
];

const toFood = (seed: CommonFoodSeed): Food => ({
  id: `local-${seed.id}`,
  name: seed.name,
  brand: 'Common food',
  dataSource: 'custom',
  calories: seed.calories,
  protein: seed.protein,
  carbohydrates: seed.carbohydrates,
  fat: seed.fat,
  fiber: seed.fiber,
  sugar: seed.sugar,
  sodium: seed.sodium,
  servingSize: 100,
  servingUnit: 'g',
  nutrients: [],
  rawSourceId: seed.id,
});

const COMMON_FOOD_ITEMS = COMMON_FOODS.map(toFood);

const editDistance = (a: string, b: string): number => {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > 2) return 99;

  const prev = new Array<number>(b.length + 1);
  const curr = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j += 1) prev[j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j += 1) prev[j] = curr[j];
  }

  return prev[b.length];
};

const tokenMatches = (haystack: string, token: string): boolean => {
  if (haystack.includes(token)) return true;
  if (token.length < 4) return false;
  return haystack.split(/[^a-z0-9]+/).some((word) => word.length >= 4 && editDistance(word, token) <= 1);
};

export const searchCommonFoods = (query: string): Food[] => {
  const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];

  return COMMON_FOOD_ITEMS.filter((food) => {
    const seed = COMMON_FOODS.find((item) => `local-${item.id}` === food.id);
    const haystack = `${food.name} ${seed?.aliases?.join(' ') ?? ''}`.toLowerCase();
    return tokens.every((token) => tokenMatches(haystack, token));
  });
};

export const getCommonFoodById = (id: string): Food | undefined =>
  COMMON_FOOD_ITEMS.find((food) => food.id === id);
