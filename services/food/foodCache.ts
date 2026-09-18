import { Food } from '@/types/food';

const cache = new Map<string, Food>();

export const foodCache = {
  put(food: Food) {
    cache.set(food.id, food);
  },
  putMany(foods: Food[]) {
    foods.forEach((food) => cache.set(food.id, food));
  },
  get(id: string) {
    return cache.get(id);
  },
};
