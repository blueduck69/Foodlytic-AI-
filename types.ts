
export enum SafetyLevel {
  SAFE = 'Safe',
  CAUTION = 'Caution',
  AVOID = 'Avoid'
}

export enum HealthLabel {
  HEALTHY = 'Healthy',
  MODERATE = 'Moderate',
  UNHEALTHY = 'Unhealthy'
}

export interface Ingredient {
  name: string;
  code?: string;
  category: string;
}

export interface AdditiveAnalysis {
  name: string;
  purpose: string;
  safetyLevel: SafetyLevel;
  sideEffects: string;
  regulatoryStatus: string;
}

export interface HealthInsights {
  childrenFriendly: string;
  pregnancySafe: string;
  allergies: string;
  dietary: string;
}

export interface FoodAnalysis {
  productName: string;
  ingredients: Ingredient[];
  additives: AdditiveAnalysis[];
  healthInsights: HealthInsights;
  score: number;
  label: HealthLabel;
  alternatives: string[];
  verdict: string;
}
