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

// Product Types - Updated to match API documentation exactly
export interface Product {
  id: string;
  product_id: string;
  product_name: string;
  name: string; // For backward compatibility - make required
  brand: string;
  brand_name?: string;
  product_type: string;
  category?: 'skincare' | 'haircare' | 'makeup';
  category_path?: string;
  subcategory?: string;
  price: number;
  price_mrp?: number;
  price_sale?: number;
  currency?: string;
  size: string;
  size_qty?: string;
  image_url?: string;
  images?: string;
  imageUrl: string; // For backward compatibility - make required
  ingredients: string[]; // Make required
  ingredients_raw?: string;
  ingredients_extracted?: Array<{
    name: string;
    percentage?: string;
  }>;
  key_ingredients: string[];
  keyIngredients: string[]; // For backward compatibility - make required
  benefits: string[]; // Make required
  benefits_extracted?: string[];
  recommendation_reason?: string;
  reason?: string; // For backward compatibility
  usage_instructions?: string;
  instructions?: string; // For backward compatibility
  application_order?: number;
  match_score?: number;
  matchScore?: number; // For backward compatibility
  priority?: number;
  rating?: number;
  rating_avg?: number;
  rating_count?: number;
  review_count?: number;
  reviews?: number; // For backward compatibility
  description_html?: string;
  targetConcerns: string[]; // Make required
  applicationArea?: string[];
  usage: { // Make required
    frequency: string;
    time: 'morning' | 'evening' | 'both';
    amount: string;
    instructions: string;
  };
}

// ProductRecommendation - Updated to match API documentation structure
export interface ProductRecommendation {
  id?: string; // For compatibility with components expecting id
  product_id: string;
  product_name: string;
  brand: string;
  product_type: string;
  price: number;
  size: string;
  image_url: string;
  key_ingredients: string[];
  recommendation_reason: string;
  usage_instructions: string;
  application_order: number;
  match_score: number;
  
  // Legacy compatibility - make product required for components
  product: Product;
  score?: number;
  reason?: string;
  priority?: number;
}

// Form Step Types
export type FormStep = 'skin' | 'hair' | 'lifestyle' | 'health' | 'makeup' | 'preferences' | 'photo';

export interface FormStepInfo {
  step: FormStep;
  title: string;
  description: string;
  icon: string;
}

// Analysis Types - Updated to match API documentation
export interface AnalysisResult {
  skinAnalysis: {
    skinType: string;
    concerns: string[];
    score: number;
    improvements: string;
  };
  recommendations: {
    morning: ProductRecommendation[];
    evening: ProductRecommendation[];
    weekly: ProductRecommendation[];
  };
  insights: {
    focus: string;
    philosophy: string;
    timeline: string;
    tips: string[];
  };
  
  // Legacy compatibility
  faceAnalysis?: {
    detectedIssues: string[];
    skinTone: string;
    faceShape: string;
    confidence: number;
  };
  routineSuggestion?: {
    morning: Product[];
    evening: Product[];
  };
  personalizedAdvice?: string[];
} 