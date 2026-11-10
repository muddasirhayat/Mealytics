import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/services/off/openFoodFactsApi', () => ({
  openFoodFactsApi: {
    searchFoods: vi.fn(),
  },
}));

vi.mock('@/services/usda/usdaApi', () => ({
  usdaApi: {
    hasApiKey: () => false,
    searchFoods: vi.fn(),
    getFoodDetails: vi.fn(),
  },
}));

import { openFoodFactsApi } from '@/services/off/openFoodFactsApi';
import { searchRemoteFoods } from '@/services/food/searchFoods';

describe('searchRemoteFoods', () => {
  beforeEach(() => {
    vi.mocked(openFoodFactsApi.searchFoods).mockReset();
  });

  it('returns an empty list when nothing matches', async () => {
    vi.mocked(openFoodFactsApi.searchFoods).mockResolvedValue([]);
    await expect(searchRemoteFoods('zzzzqqqq')).resolves.toEqual([]);
  });

  it('throws when the remote search fails and USDA is unavailable', async () => {
    vi.mocked(openFoodFactsApi.searchFoods).mockRejectedValue(new Error('offline'));
    await expect(searchRemoteFoods('zzzzqqqq')).rejects.toThrow(/connection/i);
  });
});
