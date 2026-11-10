import { describe, expect, it } from 'vitest';
import { matchQuality } from '@/services/food/localFoods';
import { searchOfflineFoods } from '@/services/food/searchFoods';

describe('offline search ranking', () => {
  it('ranks whole words ahead of long prefixes', () => {
    expect(matchQuality('Roti / chapati', 'roti')).toBe(0);
    expect(matchQuality('Chicken, rotisserie, cooked', 'roti')).toBe(2);
  });

  it('puts curated roti first and hides rotisserie hits', () => {
    const names = searchOfflineFoods('roti').map((food) => food.name);
    expect(names[0]).toBe('Roti / chapati');
    expect(names.some((name) => /rotisserie/i.test(name))).toBe(false);
  });

  it('ranks curated desi foods above generic rows for exact names', () => {
    expect(searchOfflineFoods('naan')[0]?.name).toBe('Naan');
    expect(searchOfflineFoods('dal tadka')[0]?.name).toBe('Dal tadka');
    expect(searchOfflineFoods('biryani')[0]?.name).toBe('Chicken biryani');
  });
});
