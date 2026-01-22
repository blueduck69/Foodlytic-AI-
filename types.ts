
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

export type LanguageCode = 'en' | 'hi' | 'or' | 'bn' | 'ta' | 'te' | 'mr';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
];

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
