export interface Nutrient {
  id: number;
  name: string;
  amount: number;
  unit: string;
}

export interface Food {
  id: string; // Internal ID or USDA FDC ID
  name: string;
  brand?: string;
  dataSource: 'usda' | 'custom';
  
  // Normalized macronutrients per serving (or 100g if no serving available)
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  
  // Optional micronutrients
  fiber?: number;
  sugar?: number;
  sodium?: number;
  
  // Serving information
  servingSize?: number;
  servingUnit?: string;
  
  // All raw nutrients mapped nicely
  nutrients: Nutrient[];
  
  // For later reference to the raw JSON if absolutely necessary
  rawSourceId?: string;
}
