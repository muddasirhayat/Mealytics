import { UsdaFoodSearchResponse, UsdaFoodItem } from './usdaTypes';
import { NetworkError, jsonRequest, withQuery } from '@/services/network/jsonRequest';

const BASE_URL = 'https://api.nal.usda.gov/fdc/v1';
const API_KEY = process.env.EXPO_PUBLIC_USDA_API_KEY;

export class UsdaApiError extends NetworkError {
  constructor(message: string, status?: number) {
    super(message, status);
    this.name = 'UsdaApiError';
  }
}

const getApiKey = () => {
  if (!API_KEY) {
    throw new UsdaApiError('USDA API key is missing. Add EXPO_PUBLIC_USDA_API_KEY to your .env file.');
  }
  return API_KEY;
};

export const usdaApi = {
  async searchFoods(query: string, pageNumber: number = 1): Promise<UsdaFoodSearchResponse> {
    const apiKey = getApiKey();

    if (!query.trim()) {
      return { totalHits: 0, currentPage: 1, totalPages: 1, foods: [] };
    }

    return jsonRequest<UsdaFoodSearchResponse>(
      withQuery(`${BASE_URL}/foods/search`, {
        api_key: apiKey,
        query: query.trim(),
        pageNumber: String(pageNumber),
        pageSize: '8',
        dataType: 'Foundation,SR Legacy',
      }),
      8000
    );
  },

  async getFoodDetails(fdcId: string): Promise<UsdaFoodItem> {
    const apiKey = getApiKey();
    return jsonRequest<UsdaFoodItem>(
      withQuery(`${BASE_URL}/food/${encodeURIComponent(fdcId)}`, {
        api_key: apiKey,
      }),
      10000
    );
  },
};
