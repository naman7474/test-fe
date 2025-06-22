// User Profile Types
export interface SkinProfile {
  skin_type?: 'dry' | 'oily' | 'combination' | 'normal' | 'sensitive';
  skin_tone?: 'fair' | 'light' | 'medium' | 'tan' | 'deep';
  undertone?: 'warm' | 'cool' | 'neutral';
  primary_concerns?: string[];
  sensitivity_level?: 'low' | 'medium' | 'high';
  allergies?: string[];
}

export interface HairProfile {
  hair_type?: 'straight' | 'wavy' | 'curly' | 'coily';
  hair_texture?: 'fine' | 'medium' | 'thick';
  scalp_condition?: 'dry' | 'oily' | 'normal' | 'flaky' | 'sensitive';
  primary_concerns?: string[];
  chemical_treatments?: string[];
  styling_frequency?: 'daily' | 'weekly' | '2-3_times_week' | 'rarely' | 'never';
}

export interface LifestyleProfile {
  location?: string;
  climate_type?: 'humid' | 'dry' | 'tropical' | 'temperate' | 'cold' | 'variable';
  pollution_level?: 'low' | 'moderate' | 'high' | 'very_high';
  sun_exposure?: 'minimal' | 'low' | 'moderate' | 'high' | 'very_high';
  sleep_hours?: number;
  stress_level?: 'low' | 'moderate' | 'high' | 'very_high';
  exercise_frequency?: 'daily' | '3_times_week' | 'weekly' | 'rarely' | 'never';
  water_intake?: 'less_than_4' | '4-6_glasses' | '6-8_glasses' | 'more_than_8';
}

export interface HealthProfile {
  age?: number;
  hormonal_status?: 'normal' | 'pregnancy' | 'postpartum' | 'menopause' | 'pcos' | 'thyroid_issues' | 'hormonal_acne';
  medications?: string[];
  skin_conditions?: string[];
  dietary_restrictions?: string[];
}

export interface MakeupProfile {
  makeup_frequency?: 'daily' | 'often' | 'occasionally' | 'rarely' | 'never';
  preferred_look?: 'natural' | 'minimal' | 'glam' | 'bold' | 'professional';
  coverage_preference?: 'sheer' | 'light' | 'medium' | 'full';
}

export interface PreferencesProfile {
  budget_range?: 'under_1000' | '1000_3000' | '3000_5000' | '5000_10000' | 'above_10000';
  brand_preference?: 'luxury' | 'premium' | 'drugstore' | 'indie' | 'no_preference';
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