import { UserProfile, AnalysisResult, ProductRecommendation, Product } from '../types';
import axios from 'axios';

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Add auth token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface UploadResponse {
  success: boolean;
  data: {
  session_id: string;
    photo_id: string;
    processing_status: string;
    estimated_time: number;
  };
}

export interface AnalysisResponse {
  success: boolean;
  data: {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    face_model_url?: string;
    face_landmarks?: any[];
    processing_time?: number;
    analysis?: {
      skin_concerns: Array<{
        type: string;
        severity: string;
        locations: string[];
        confidence: number;
      }>;
      skin_attributes: {
        tone: string;
        undertone: string;
        texture: string;
        age_appearance: number;
      };
      overall_skin_score: number;
      ai_observations: string[];
      positive_attributes: string[];
    };
  };
}

export interface OnboardingProgress {
  steps: {
    profile: {
      complete: boolean;
      percentage: number;
      sections: {
        [key: string]: {
          total: number;
          completed: number;
          percentage: number;
        };
      };
    };
    photo: {
      uploaded: boolean;
      processed: boolean;
      status: string;
    };
    recommendations: {
      generated: boolean;
    };
  };
  overallProgress: number;
  nextStep: string;
}

export interface RecommendationsResponse {
  success: boolean;
  data: {
    routine: {
      morning: Product[];
      evening: Product[];
      weekly: Product[];
    };
    targeted_treatments: Array<{
      concern: string;
      product_type: string;
      key_ingredients: string[];
      application_zones: any;
      frequency: string;
    }>;
    ai_insights: {
      primary_focus: string;
      routine_philosophy: string;
      expected_timeline: string;
      lifestyle_tips: string[];
    };
  };
}

class BeautyAPI {
  // Authentication
  async login(email: string, password: string): Promise<{ token: string; user: UserProfile }> {
    try {
      console.log('Attempting login for:', email);
      const response = await apiClient.post('/auth/login', { email, password });
      console.log('Login response:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Login failed');
      }
      
      const { token, user } = response.data.data;
      localStorage.setItem('authToken', token);
      return { token, user };
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle backend error responses
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.errors && Array.isArray(errorData.errors)) {
          // Handle validation errors
          const errorMessages = errorData.errors.map((err: any) => err.msg).join(', ');
          throw new Error(errorMessages);
        } else if (errorData.message) {
          throw new Error(errorData.message);
        }
      }
      
      // Handle network errors
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Unable to connect to server. Please check if the backend is running.');
      }
      
      throw new Error(error.message || 'Login failed');
    }
  }

  async signup(email: string, password: string, firstName: string, lastName: string): Promise<{ token: string; user: UserProfile }> {
    try {
      console.log('Attempting signup for:', email);
      
      // Client-side password validation
      if (!this.validatePassword(password)) {
        throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
      }
      
      const response = await apiClient.post('/auth/register', { 
        email, 
        password, 
        first_name: firstName,  // Backend expects first_name
        last_name: lastName     // Backend expects last_name
      });
      
      console.log('Signup response:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Registration failed');
      }
      
      const { token, user } = response.data.data;
      localStorage.setItem('authToken', token);
      return { token, user };
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Handle backend error responses
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.errors && Array.isArray(errorData.errors)) {
          // Handle validation errors
          const errorMessages = errorData.errors.map((err: any) => err.msg).join(', ');
          throw new Error(errorMessages);
        } else if (errorData.message) {
          throw new Error(errorData.message);
        }
      }
      
      // Handle network errors
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Unable to connect to server. Please check if the backend is running.');
      }
      
      throw new Error(error.message || 'Registration failed');
    }
  }

  // Password validation helper
  private validatePassword(password: string): boolean {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && password.length >= 8;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('authToken');
  }

  // Onboarding Progress
  async getOnboardingProgress(): Promise<OnboardingProgress> {
    const response = await apiClient.get('/profile/beauty/onboarding');
    return response.data.data;
  }

  // Helper function to clean and map profile data to backend format
  private cleanProfileData(profileData: any, section: string): any {
    if (!profileData || typeof profileData !== 'object') return {};
    
    const cleaned: any = {};
    
    // Handle each section differently based on actual backend fields from beauty_profiles table
    switch (section) {
      case 'skin':
        // Map skin_type to actual database values
        if (profileData.skin_type) {
          const skinTypeMap = {
            'dry': 'Dry & Tight',
            'oily': 'Oily & Shiny', 
            'combination': 'Combination',
            'normal': 'Normal & Balanced'
          };
          cleaned.skin_type = skinTypeMap[profileData.skin_type as keyof typeof skinTypeMap] || profileData.skin_type;
        } else if (profileData.skinType) {
          const skinTypeMap = {
            'dry': 'Dry & Tight',
            'oily': 'Oily & Shiny',
            'combination': 'Combination', 
            'normal': 'Normal & Balanced'
          };
          cleaned.skin_type = skinTypeMap[profileData.skinType as keyof typeof skinTypeMap] || profileData.skinType;
        }
        
        if (profileData.skin_tone) {
          cleaned.skin_tone = profileData.skin_tone;
        } else if (profileData.skinTone) {
          cleaned.skin_tone = profileData.skinTone;
        }
        
        if (profileData.undertone) {
          cleaned.undertone = profileData.undertone;
        }
        
        // Map to primary_skin_concerns (ARRAY field name)
        if (profileData.primary_skin_concerns) {
          cleaned.primary_skin_concerns = Array.isArray(profileData.primary_skin_concerns) ? profileData.primary_skin_concerns : [profileData.primary_skin_concerns];
        } else if (profileData.primary_concerns) {
          cleaned.primary_skin_concerns = Array.isArray(profileData.primary_concerns) ? profileData.primary_concerns : [profileData.primary_concerns];
        } else if (profileData.skinConcerns) {
          cleaned.primary_skin_concerns = Array.isArray(profileData.skinConcerns) ? profileData.skinConcerns : [profileData.skinConcerns];
        }
        
        // Map to secondary_skin_concerns (ARRAY field name)
        if (profileData.secondary_skin_concerns) {
          cleaned.secondary_skin_concerns = Array.isArray(profileData.secondary_skin_concerns) ? profileData.secondary_skin_concerns : [profileData.secondary_skin_concerns];
        } else if (profileData.secondary_concerns) {
          cleaned.secondary_skin_concerns = Array.isArray(profileData.secondary_concerns) ? profileData.secondary_concerns : [profileData.secondary_concerns];
        }
        
        // Map to skin_sensitivity (actual field name) with actual database values
        if (profileData.skin_sensitivity_level) {
          const sensitivityMap = {
            'low': 'Not Sensitive',
            'medium': 'Slightly Sensitive',
            'high': 'Moderately Sensitive',
            'very_high': 'Very Sensitive'
          };
          cleaned.skin_sensitivity = sensitivityMap[profileData.skin_sensitivity_level as keyof typeof sensitivityMap] || profileData.skin_sensitivity_level;
        } else if (profileData.skin_sensitivity) {
          cleaned.skin_sensitivity = profileData.skin_sensitivity;
        } else if (profileData.sensitivity_level) {
          const sensitivityMap = {
            'low': 'Not Sensitive',
            'medium': 'Slightly Sensitive', 
            'high': 'Moderately Sensitive',
            'very_high': 'Very Sensitive'
          };
          cleaned.skin_sensitivity = sensitivityMap[profileData.sensitivity_level as keyof typeof sensitivityMap] || profileData.sensitivity_level;
        }
        
        // Map to known_allergies (ARRAY field name)
        if (profileData.known_allergies) {
          cleaned.known_allergies = Array.isArray(profileData.known_allergies) ? profileData.known_allergies : [profileData.known_allergies];
        } else if (profileData.allergies) {
          cleaned.known_allergies = Array.isArray(profileData.allergies) ? profileData.allergies : [profileData.allergies];
        }
        break;
        
      case 'hair':
        // Map hair_type to actual database values (capitalized)
        if (profileData.hair_type) {
          const hairTypeMap = {
            'straight': 'Straight',
            'wavy': 'Wavy',
            'curly': 'Curly',
            'coily': 'Coily'
          };
          cleaned.hair_type = hairTypeMap[profileData.hair_type as keyof typeof hairTypeMap] || profileData.hair_type;
        } else if (profileData.hairType) {
          const hairTypeMap = {
            'straight': 'Straight',
            'wavy': 'Wavy', 
            'curly': 'Curly',
            'coily': 'Coily'
          };
          cleaned.hair_type = hairTypeMap[profileData.hairType as keyof typeof hairTypeMap] || profileData.hairType;
        }
        
        if (profileData.hair_texture) {
          cleaned.hair_texture = profileData.hair_texture;
        } else if (profileData.hairTexture) {
          cleaned.hair_texture = profileData.hairTexture;
        }
        
        if (profileData.hair_porosity) {
          cleaned.hair_porosity = profileData.hair_porosity;
        }
        
        if (profileData.scalp_condition) {
          cleaned.scalp_condition = profileData.scalp_condition;
        } else if (profileData.scalpCondition) {
          cleaned.scalp_condition = profileData.scalpCondition;
        }
        
        // Map to hair_concerns (ARRAY field name)
        if (profileData.hair_concerns) {
          cleaned.hair_concerns = Array.isArray(profileData.hair_concerns) ? profileData.hair_concerns : [profileData.hair_concerns];
        } else if (profileData.primary_concerns) {
          cleaned.hair_concerns = Array.isArray(profileData.primary_concerns) ? profileData.primary_concerns : [profileData.primary_concerns];
        } else if (profileData.hairConcerns) {
          cleaned.hair_concerns = Array.isArray(profileData.hairConcerns) ? profileData.hairConcerns : [profileData.hairConcerns];
        }
        
        if (profileData.chemical_treatments) {
          cleaned.chemical_treatments = profileData.chemical_treatments;
        } else if (profileData.chemicalTreatments) {
          cleaned.chemical_treatments = profileData.chemicalTreatments;
        }
        break;
        
      case 'lifestyle':
        // Handle location split into city/country
        if (profileData.location) {
          // Split location string into city and country
          const locationParts = profileData.location.split(',').map((part: string) => part.trim());
          if (locationParts.length >= 2) {
            cleaned.location_city = locationParts[0];
            cleaned.location_country = locationParts[1];
          } else {
            cleaned.location_city = locationParts[0];
          }
        }
        if (profileData.location_city) {
          cleaned.location_city = profileData.location_city;
        }
        if (profileData.location_country) {
          cleaned.location_country = profileData.location_country;
        }
        
        if (profileData.climate_type) {
          cleaned.climate_type = profileData.climate_type;
        } else if (profileData.climate) {
          cleaned.climate_type = profileData.climate;
        }
        
        if (profileData.pollution_level) {
          cleaned.pollution_level = profileData.pollution_level;
        } else if (profileData.pollutionLevel) {
          cleaned.pollution_level = profileData.pollutionLevel;
        }
        
        if (profileData.sun_exposure_daily) {
          cleaned.sun_exposure_daily = profileData.sun_exposure_daily;
        } else if (profileData.sun_exposure) {
          cleaned.sun_exposure_daily = profileData.sun_exposure;
        } else if (profileData.sunExposure) {
          cleaned.sun_exposure_daily = profileData.sunExposure;
        }
        
        // Map to sleep_hours (actual field name) with actual database values
        if (profileData.sleep_hours_avg !== undefined) {
          const sleepValue = typeof profileData.sleep_hours_avg === 'number' ? profileData.sleep_hours_avg : parseFloat(profileData.sleep_hours_avg);
          if (sleepValue < 5) {
            cleaned.sleep_hours = '< 5 hours';
          } else if (sleepValue >= 5 && sleepValue < 7) {
            cleaned.sleep_hours = '5-7 hours';
          } else if (sleepValue >= 7 && sleepValue <= 9) {
            cleaned.sleep_hours = '7-9 hours';
          } else {
            cleaned.sleep_hours = '> 9 hours';
          }
        } else if (profileData.sleep_hours !== undefined) {
          const sleepValue = typeof profileData.sleep_hours === 'number' ? profileData.sleep_hours : parseFloat(profileData.sleep_hours);
          if (sleepValue < 5) {
            cleaned.sleep_hours = '< 5 hours';
          } else if (sleepValue >= 5 && sleepValue < 7) {
            cleaned.sleep_hours = '5-7 hours';
          } else if (sleepValue >= 7 && sleepValue <= 9) {
            cleaned.sleep_hours = '7-9 hours';
          } else {
            cleaned.sleep_hours = '> 9 hours';
          }
        } else if (profileData.sleepHours !== undefined) {
          const sleepValue = typeof profileData.sleepHours === 'number' ? profileData.sleepHours : parseFloat(profileData.sleepHours);
          if (sleepValue < 5) {
            cleaned.sleep_hours = '< 5 hours';
          } else if (sleepValue >= 5 && sleepValue < 7) {
            cleaned.sleep_hours = '5-7 hours';
          } else if (sleepValue >= 7 && sleepValue <= 9) {
            cleaned.sleep_hours = '7-9 hours';
          } else {
            cleaned.sleep_hours = '> 9 hours';
          }
        }
        
        // Map stress_level to actual database values (capitalized)
        if (profileData.stress_level) {
          const stressMap = {
            'low': 'Low',
            'moderate': 'Moderate',
            'high': 'High',
            'severe': 'Very High'
          };
          cleaned.stress_level = stressMap[profileData.stress_level as keyof typeof stressMap] || profileData.stress_level;
        } else if (profileData.stressLevel) {
          const stressMap = {
            'low': 'Low',
            'moderate': 'Moderate',
            'high': 'High', 
            'severe': 'Very High'
          };
          cleaned.stress_level = stressMap[profileData.stressLevel as keyof typeof stressMap] || profileData.stressLevel;
        }
        
        if (profileData.exercise_frequency) {
          // Map to actual database values for exercise_frequency
          const exerciseMap = {
            'never': 'sedentary',
            'rarely': 'light',
            'weekly': 'moderate',
            '3_times_week': 'active',
            'daily': 'very_active'
          };
          cleaned.exercise_frequency = exerciseMap[profileData.exercise_frequency as keyof typeof exerciseMap] || profileData.exercise_frequency;
        } else if (profileData.exerciseFrequency) {
          const exerciseMap = {
            'never': 'sedentary',
            'rarely': 'light',
            'weekly': 'moderate',
            '3_times_week': 'active',
            'daily': 'very_active'
          };
          cleaned.exercise_frequency = exerciseMap[profileData.exerciseFrequency as keyof typeof exerciseMap] || profileData.exerciseFrequency;
        }
        
        // Map to water_intake (actual field name) with actual database values
        if (profileData.water_intake_daily !== undefined) {
          const waterValue = typeof profileData.water_intake_daily === 'number' ? profileData.water_intake_daily : parseInt(profileData.water_intake_daily);
          if (waterValue < 4) {
            cleaned.water_intake = '< 4 glasses';
          } else if (waterValue >= 4 && waterValue < 6) {
            cleaned.water_intake = '4-6 glasses';
          } else if (waterValue >= 6 && waterValue <= 8) {
            cleaned.water_intake = '6-8 glasses';
          } else {
            cleaned.water_intake = '> 8 glasses';
          }
        } else if (profileData.water_intake !== undefined) {
          const waterValue = typeof profileData.water_intake === 'number' ? profileData.water_intake : parseInt(profileData.water_intake);
          if (waterValue < 4) {
            cleaned.water_intake = '< 4 glasses';
          } else if (waterValue >= 4 && waterValue < 6) {
            cleaned.water_intake = '4-6 glasses';
          } else if (waterValue >= 6 && waterValue <= 8) {
            cleaned.water_intake = '6-8 glasses';
          } else {
            cleaned.water_intake = '> 8 glasses';
          }
        } else if (profileData.waterIntake !== undefined) {
          const waterValue = typeof profileData.waterIntake === 'number' ? profileData.waterIntake : parseInt(profileData.waterIntake);
          if (waterValue < 4) {
            cleaned.water_intake = '< 4 glasses';
          } else if (waterValue >= 4 && waterValue < 6) {
            cleaned.water_intake = '4-6 glasses';
          } else if (waterValue >= 6 && waterValue <= 8) {
            cleaned.water_intake = '6-8 glasses';
          } else {
            cleaned.water_intake = '> 8 glasses';
          }
        }
        break;
        
      case 'health':
        if (profileData.age !== undefined) {
          cleaned.age = typeof profileData.age === 'string' ? parseInt(profileData.age) : profileData.age;
        }
        
        if (profileData.hormonal_status) {
          cleaned.hormonal_status = profileData.hormonal_status;
        } else if (profileData.hormonalStatus) {
          cleaned.hormonal_status = profileData.hormonalStatus;
        }
        
        // Map to medications (TEXT field in database, not array)
        if (profileData.medications) {
          if (Array.isArray(profileData.medications)) {
            cleaned.medications = profileData.medications.join(', ');
          } else {
            cleaned.medications = profileData.medications;
          }
        }
        
        // Map to skin_medical_conditions (ARRAY field name)
        if (profileData.skin_medical_conditions) {
          cleaned.skin_medical_conditions = Array.isArray(profileData.skin_medical_conditions) ? profileData.skin_medical_conditions : [profileData.skin_medical_conditions];
        } else if (profileData.skin_conditions) {
          cleaned.skin_medical_conditions = Array.isArray(profileData.skin_conditions) ? profileData.skin_conditions : [profileData.skin_conditions];
        } else if (profileData.skinConditions) {
          cleaned.skin_medical_conditions = Array.isArray(profileData.skinConditions) ? profileData.skinConditions : [profileData.skinConditions];
        }
        
        if (profileData.dietary_type) {
          cleaned.dietary_type = profileData.dietary_type;
        } else if (profileData.dietary_restrictions) {
          // Convert array to single value if needed
          if (Array.isArray(profileData.dietary_restrictions)) {
            cleaned.dietary_type = profileData.dietary_restrictions[0];
          } else {
            cleaned.dietary_type = profileData.dietary_restrictions;
          }
        } else if (profileData.dietaryRestrictions) {
          if (Array.isArray(profileData.dietaryRestrictions)) {
            cleaned.dietary_type = profileData.dietaryRestrictions[0];
          } else {
            cleaned.dietary_type = profileData.dietaryRestrictions;
          }
        }
        
        // Map to supplements (ARRAY field in database)
        if (profileData.supplements) {
          cleaned.supplements = Array.isArray(profileData.supplements) ? profileData.supplements : [profileData.supplements];
        }
        break;
        
      case 'makeup':
        // Map makeup_frequency to actual database values
        if (profileData.makeup_frequency) {
          const makeupFreqMap = {
            'never': 'Never',
            'special_occasions': 'Occasionally',
            'weekly': '3-4x/week',
            'daily': 'Daily',
            'multiple_daily': 'Daily'
          };
          cleaned.makeup_frequency = makeupFreqMap[profileData.makeup_frequency as keyof typeof makeupFreqMap] || profileData.makeup_frequency;
        } else if (profileData.makeupFrequency) {
          const makeupFreqMap = {
            'never': 'Never',
            'special_occasions': 'Occasionally',
            'weekly': '3-4x/week',
            'daily': 'Daily',
            'multiple_daily': 'Daily'
          };
          cleaned.makeup_frequency = makeupFreqMap[profileData.makeupFrequency as keyof typeof makeupFreqMap] || profileData.makeupFrequency;
        }
        
        // Map to makeup_style (actual field name) with actual database values
        if (profileData.preferred_look) {
          const lookMap = {
            'natural': 'Natural',
            'professional': 'Minimal',
            'glam': 'Glam',
            'dramatic': 'Bold',
            'artistic': 'Bold'
          };
          cleaned.makeup_style = lookMap[profileData.preferred_look as keyof typeof lookMap] || profileData.preferred_look;
        } else if (profileData.preferredLook) {
          const lookMap = {
            'natural': 'Natural',
            'professional': 'Minimal',
            'glam': 'Glam',
            'dramatic': 'Bold',
            'artistic': 'Bold'
          };
          cleaned.makeup_style = lookMap[profileData.preferredLook as keyof typeof lookMap] || profileData.preferredLook;
        }
        
        if (profileData.coverage_preference) {
          cleaned.coverage_preference = profileData.coverage_preference;
        } else if (profileData.coveragePreference) {
          cleaned.coverage_preference = profileData.coveragePreference;
        }
        
        if (profileData.budget_range) {
          cleaned.budget_range = profileData.budget_range;
        } else if (profileData.budgetRange) {
          cleaned.budget_range = profileData.budgetRange;
        }
        
        // Map to favorite_brands (ARRAY field in database)
        if (profileData.favorite_brands) {
          cleaned.favorite_brands = Array.isArray(profileData.favorite_brands) ? profileData.favorite_brands : [profileData.favorite_brands];
        } else if (profileData.favoriteBrands) {
          cleaned.favorite_brands = Array.isArray(profileData.favoriteBrands) ? profileData.favoriteBrands : [profileData.favoriteBrands];
        }
        break;
        
      case 'preferences':
        // For backward compatibility, map preferences to makeup section fields
        if (profileData.budget_range) {
          cleaned.budget_range = profileData.budget_range;
        } else if (profileData.budgetRange) {
          cleaned.budget_range = profileData.budgetRange;
        }
        
        if (profileData.favorite_brands) {
          cleaned.favorite_brands = Array.isArray(profileData.favorite_brands) ? profileData.favorite_brands : [profileData.favorite_brands];
        } else if (profileData.brand_preference) {
          cleaned.favorite_brands = Array.isArray(profileData.brand_preference) ? profileData.brand_preference : [profileData.brand_preference];
        } else if (profileData.brandPreference) {
          cleaned.favorite_brands = Array.isArray(profileData.brandPreference) ? profileData.brandPreference : [profileData.brandPreference];
        }
        break;
        
      default:
        // For unknown sections, copy all fields as-is
        Object.assign(cleaned, profileData);
    }
    
    // Remove any null, undefined, or empty values
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === null || cleaned[key] === undefined || cleaned[key] === '' || 
          (Array.isArray(cleaned[key]) && cleaned[key].length === 0)) {
        delete cleaned[key];
      }
    });
    
    return cleaned;
  }

  // Profile Management - using section-specific endpoints as required by backend
  async updateSkinProfile(skinData: any): Promise<any> {
    const cleanedData = this.cleanProfileData(skinData, 'skin');
    console.log('Original skin data:', skinData);
    console.log('Cleaned skin data being sent:', cleanedData);
    const response = await apiClient.put('/profile/beauty/skin', cleanedData);
    return response.data;
  }

  async updateLifestyleProfile(lifestyleData: any): Promise<any> {
    const cleanedData = this.cleanProfileData(lifestyleData, 'lifestyle');
    console.log('Original lifestyle data:', lifestyleData);
    console.log('Cleaned lifestyle data being sent:', cleanedData);
    const response = await apiClient.put('/profile/beauty/lifestyle', cleanedData);
    return response.data;
  }

  async updateHairProfile(hairData: any): Promise<any> {
    const cleanedData = this.cleanProfileData(hairData, 'hair');
    console.log('Cleaned hair data being sent:', cleanedData);
    const response = await apiClient.put('/profile/beauty/hair', cleanedData);
    return response.data;
  }

  async updateHealthProfile(healthData: any): Promise<any> {
    const cleanedData = this.cleanProfileData(healthData, 'health');
    console.log('Cleaned health data being sent:', cleanedData);
    const response = await apiClient.put('/profile/beauty/health', cleanedData);
    return response.data;
  }

  async updateMakeupProfile(makeupData: any): Promise<any> {
    const cleanedData = this.cleanProfileData(makeupData, 'makeup');
    console.log('Cleaned makeup data being sent:', cleanedData);
    const response = await apiClient.put('/profile/beauty/makeup', cleanedData);
    return response.data;
  }

  // Photo Upload & Analysis
  async uploadPhoto(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('photo_type', 'onboarding');

    const response = await apiClient.post('/photo/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }

  async getAnalysisStatus(sessionId: string): Promise<AnalysisResponse> {
    const response = await apiClient.get(`/photo/status/${sessionId}`);
    return response.data;
  }

  // Recommendations
  async getRecommendations(): Promise<RecommendationsResponse> {
    const response = await apiClient.get('/recommendations/beauty');
    return response.data;
  }

  async submitFeedback(feedbackData: {
    recommendation_id: string;
    product_id: string;
    feedback_type: 'positive' | 'negative' | 'neutral';
    rating: number;
    comments?: string;
  }): Promise<any> {
    const response = await apiClient.post('/recommendations/feedback', feedbackData);
    return response.data;
  }

  // Progress Tracking
  async uploadProgressPhoto(file: File, weekNumber: number): Promise<any> {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('week_number', weekNumber.toString());

    const response = await apiClient.post('/progress/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  async getProgressTimeline(): Promise<any> {
    const response = await apiClient.get('/progress/timeline');
    return response.data;
  }

  // Product Search
  async searchProducts(query: string, includeIngredients: boolean = true): Promise<any> {
    const response = await apiClient.post('/search', {
      query,
      includeIngredients,
    });
    return response.data;
  }

  // Complete Profile Submission
  async submitProfile(profile: UserProfile): Promise<{ success: boolean; message: string }> {
    try {
      console.log('Full profile object being submitted:', profile);
      
      // Update all profile sections
      const promises = [];

      if (profile.skin && Object.keys(profile.skin).length > 0) {
        console.log('Submitting skin profile:', profile.skin);
        promises.push(this.updateSkinProfile(profile.skin));
      }

      if (profile.lifestyle && Object.keys(profile.lifestyle).length > 0) {
        console.log('Submitting lifestyle profile:', profile.lifestyle);
        promises.push(this.updateLifestyleProfile(profile.lifestyle));
      }

      if (profile.hair && Object.keys(profile.hair).length > 0) {
        console.log('Submitting hair profile:', profile.hair);
        promises.push(this.updateHairProfile(profile.hair));
      }

      if (profile.health && Object.keys(profile.health).length > 0) {
        console.log('Submitting health profile:', profile.health);
        promises.push(this.updateHealthProfile(profile.health));
      }

      if (profile.makeup && Object.keys(profile.makeup).length > 0) {
        console.log('Submitting makeup profile:', profile.makeup);
        promises.push(this.updateMakeupProfile(profile.makeup));
      }

      await Promise.all(promises);
      
      return {
        success: true,
        message: 'Profile saved successfully',
      };
    } catch (error) {
      console.error('Error submitting profile:', error);
      throw error;
    }
  }

  // Convert backend recommendations to frontend format
  async getFormattedRecommendations(): Promise<AnalysisResult> {
    try {
      const recommendations = await this.getRecommendations();
      
      // Convert backend products to frontend Product format
      const convertProduct = (backendProduct: any): Product => ({
        id: backendProduct.product_id,
        name: backendProduct.product_name,
        brand: backendProduct.brand,
        category: 'skincare', // Default to skincare
        subcategory: backendProduct.product_type,
        imageUrl: backendProduct.image_url || 'https://via.placeholder.com/400',
        price: backendProduct.price,
        size: backendProduct.size || '30ml',
        ingredients: backendProduct.key_ingredients || [],
        keyIngredients: backendProduct.key_ingredients || [],
        benefits: [backendProduct.recommendation_reason],
        targetConcerns: [],
        applicationArea: backendProduct.face_coordinates?.highlight_regions || [],
        usage: {
          frequency: backendProduct.usage_instructions || 'Daily',
          time: backendProduct.step === 1 ? 'morning' : 'evening',
          amount: 'As directed',
          instructions: backendProduct.usage_instructions || '',
        },
        rating: 4.5,
        reviews: Math.floor(Math.random() * 1000) + 100,
      });

      // Convert routine products
      const allProducts: ProductRecommendation[] = [];
      let priority = 1;

      // Process morning routine
      recommendations.data.routine.morning.forEach((product: any) => {
        allProducts.push({
          product: convertProduct(product),
          score: 95 - (priority * 2),
          reason: product.recommendation_reason,
          priority: priority++,
        });
      });

      // Process evening routine
      recommendations.data.routine.evening.forEach((product: any) => {
        allProducts.push({
          product: convertProduct(product),
          score: 95 - (priority * 2),
          reason: product.recommendation_reason,
          priority: priority++,
        });
      });

      // Create analysis result
      const analysisResult: AnalysisResult = {
      faceAnalysis: {
          detectedIssues: recommendations.data.ai_insights.lifestyle_tips || [],
        skinTone: 'Medium with warm undertones',
        faceShape: 'Oval',
          confidence: 0.92,
      },
        recommendations: allProducts,
      routineSuggestion: {
          morning: recommendations.data.routine.morning.map(convertProduct),
          evening: recommendations.data.routine.evening.map(convertProduct),
      },
        personalizedAdvice: recommendations.data.ai_insights.lifestyle_tips || [],
      };

      return analysisResult;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  }
}

const beautyAPI = new BeautyAPI();
export default beautyAPI; 