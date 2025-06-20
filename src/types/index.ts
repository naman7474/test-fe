// User Profile Types
export interface SkinProfile {
  skinType: 'dry' | 'oily' | 'combination' | 'normal' | 'sensitive';
  skinTone: string;
  undertone: 'warm' | 'cool' | 'neutral';
  fitzpatrickType: 1 | 2 | 3 | 4 | 5 | 6;
  primaryConcerns: string[];
  allergies: string[];
  sensitivityLevel: 'low' | 'medium' | 'high';
  sunExposure: number; // hours per day
  sunscreenUsage: 'never' | 'sometimes' | 'always';
  currentRoutine: {
    morning: string[];
    evening: string[];
  };
}

export interface HairProfile {
  hairType: 'straight' | 'wavy' | 'curly' | 'coily';
  texture: 'fine' | 'medium' | 'thick';
  scalpCondition: 'dry' | 'oily' | 'normal' | 'dandruff-prone';
  primaryConcerns: string[];
  chemicalTreatments: string[];
  currentRoutine: string[];
  stylingFrequency: 'daily' | 'weekly' | 'occasionally' | 'never';
}

export interface LifestyleProfile {
  location: string;
  climate: 'dry' | 'humid' | 'temperate' | 'tropical' | 'cold';
  uvIndex: number;
  dietType: string;
  waterIntake: number; // liters per day
  sleepDuration: number; // hours
  sleepQuality: 'poor' | 'fair' | 'good' | 'excellent';
  stressLevel: 'low' | 'moderate' | 'high';
  exerciseFrequency: 'never' | 'rarely' | 'weekly' | 'daily';
  smokingStatus: boolean;
  alcoholConsumption: 'never' | 'occasionally' | 'regularly';
  workEnvironment: 'outdoor' | 'office' | 'mixed';
  screenTime: number; // hours per day
}

export interface HealthProfile {
  skinConditions: string[];
  hairConditions: string[];
  medicalConditions: string[];
  medications: string[];
  recentTreatments: string[];
}

export interface MakeupProfile {
  usageFrequency: 'daily' | 'occasional' | 'special-events' | 'never';
  preferredStyle: 'natural' | 'professional' | 'glamorous' | 'creative';
  coverageLevel: 'light' | 'medium' | 'full';
  colorPreferences: {
    lips: string[];
    eyes: string[];
    cheeks: string[];
  };
  budgetRange: 'budget' | 'mid-range' | 'high-end' | 'luxury';
}

export interface UserProfile {
  id?: string;
  name?: string;
  email?: string;
  photoUrl?: string;
  skinProfile?: SkinProfile;
  hairProfile?: HairProfile;
  lifestyleProfile?: LifestyleProfile;
  healthProfile?: HealthProfile;
  makeupProfile?: MakeupProfile;
  analysisComplete: boolean;
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
export type FormStep = 'skin' | 'hair' | 'lifestyle' | 'health' | 'makeup' | 'photo';

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