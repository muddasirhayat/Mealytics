export interface UsdaNutrient {
  nutrientId?: number;
  nutrientName?: string;
  nutrientNumber?: string;
  unitName?: string;
  value?: number;
  amount?: number;
  nutrient?: {
    id?: number;
    name?: string;
    unitName?: string;
  };
}

export interface UsdaFoodItem {
  fdcId: number;
  description: string;
  brandOwner?: string;
  brandName?: string;
  ingredients?: string;
  foodNutrients: UsdaNutrient[];
  servingSize?: number;
  servingSizeUnit?: string;
  score?: number;
}

export interface UsdaFoodSearchResponse {
  totalHits: number;
  currentPage: number;
  totalPages: number;
  foods: UsdaFoodItem[];
}
