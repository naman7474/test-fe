// User Profile Types
export interface SkinProfile {
  skin_type?: 'dry' | 'oily' | 'combination' | 'normal';
  skin_tone?: 'fair' | 'light' | 'medium' | 'tan' | 'deep';
  undertone?: 'warm' | 'cool' | 'neutral';
  primary_skin_concerns?: string[];
  secondary_skin_concerns?: string[];
  skin_sensitivity_level?: 'low' | 'medium' | 'high';
  known_allergies?: string[];
}

export interface HairProfile {
  hair_type?: 'straight' | 'wavy' | 'curly' | 'coily';
  hair_texture?: 'fine' | 'medium' | 'thick';
  hair_porosity?: 'low' | 'medium' | 'high';
  scalp_condition?: 'dry' | 'oily' | 'normal' | 'sensitive';
  hair_concerns?: string[];
  chemical_treatments?: string[];
}

export interface LifestyleProfile {
  location_city?: string;
  location_country?: string;
  climate_type?: 'tropical' | 'dry' | 'temperate' | 'continental' | 'polar';
  pollution_level?: 'low' | 'moderate' | 'high' | 'severe';
  sun_exposure_daily?: 'minimal' | 'low' | 'moderate' | 'high';
  sleep_hours_avg?: number;
  stress_level?: 'low' | 'moderate' | 'high' | 'severe';
  exercise_frequency?: 'never' | 'rarely' | 'weekly' | '3_times_week' | 'daily';
  water_intake_daily?: number;
}

export interface HealthProfile {
  age?: number;
  hormonal_status?: 'normal' | 'pregnancy' | 'breastfeeding' | 'menopause' | 'pcos' | 'thyroid';
  medications?: string[];
  skin_medical_conditions?: string[];
  dietary_type?: 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian';
  supplements?: string[];
}

export interface MakeupProfile {
  makeup_frequency?: 'never' | 'special_occasions' | 'weekly' | 'daily' | 'multiple_daily';
  preferred_look?: 'natural' | 'professional' | 'glam' | 'dramatic' | 'artistic';
  coverage_preference?: 'none' | 'light' | 'medium' | 'full';
  budget_range?: 'budget' | 'mid_range' | 'luxury' | 'mixed';
  favorite_brands?: string[];
}

export interface PreferencesProfile {
  budget_range?: 'budget' | 'mid_range' | 'luxury' | 'mixed';
  favorite_brands?: string[];
  ingredient_preference?: string[];
}

export interface UserProfile {
  id?: string;
  name?: string;
  email?: string;
  photoUrl?: string;
  skin?: SkinProfile;
  hair?: HairProfile;
  lifestyle?: LifestyleProfile;
  health?: HealthProfile;
  makeup?: MakeupProfile;
  preferences?: PreferencesProfile;
  analysisComplete?: boolean;
  profileComplete?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  
  // Direct properties for form compatibility
  skinType?: string;
  skinConcerns?: string[];
  skinSensitivity?: string;
  hairType?: string;
  hairConcerns?: string[];
  sleepHours?: string;
  waterIntake?: string;
  stressLevel?: string;
  allergies?: string;
  medications?: string;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  brand: string;
  category: 'skincare' | 'haircare' | 'makeup';
  subcategory: string;
  imageUrl: string;
  price: number;
  size: string;
  ingredients: string[];
  keyIngredients: string[];
  benefits: string[];
  targetConcerns: string[];
  applicationArea: string[];
  usage: {
    frequency: string;
    time: 'morning' | 'evening' | 'both';
    amount: string;
    instructions: string;
  };
  rating?: number;
  reviews?: number;
}

export interface ProductRecommendation {
  product: Product;
  score: number;
  reason: string;
  priority: number;
}

// Form Step Types
export type FormStep = 'skin' | 'hair' | 'lifestyle' | 'health' | 'makeup' | 'preferences' | 'photo';

export interface FormStepInfo {
  step: FormStep;
  title: string;
  description: string;
  icon: string;
}

// Analysis Types
export interface AnalysisResult {
  faceAnalysis: {
    detectedIssues: string[];
    skinTone: string;
    faceShape: string;
    confidence: number;
  };
  recommendations: ProductRecommendation[];
  routineSuggestion: {
    morning: Product[];
    evening: Product[];
  };
  personalizedAdvice: string[];
} 