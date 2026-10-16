import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(root, 'data', 'foods.json');
const catalog = JSON.parse(fs.readFileSync(file, 'utf8'));

catalog.foods = catalog.foods.map((food) => {
  return {
    id: food.id,
    name: food.name,
    calories: food.calories,
    protein: food.protein,
    carbohydrates: food.carbohydrates,
    fat: food.fat,
    fiber: food.fiber,
    sugar: food.sugar,
    sodium: food.sodium,
  };
});

const encoded = JSON.stringify(catalog);
fs.writeFileSync(file, `${encoded}\n`);
const bytes = Buffer.byteLength(encoded, 'utf8');
console.log(`Wrote ${file} (${bytes} bytes, ${catalog.foods.length} foods)`);
