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
    const response = await apiClient.post('/auth/login', { email, password });
    const { token, user } = response.data.data;
    localStorage.setItem('authToken', token);
    return { token, user };
  }

  async signup(email: string, password: string, firstName: string, lastName: string): Promise<{ token: string; user: UserProfile }> {
    const response = await apiClient.post('/auth/register', { 
      email, 
      password, 
      first_name: firstName,  // Backend expects first_name
      last_name: lastName     // Backend expects last_name
    });
    const { token, user } = response.data.data;
    localStorage.setItem('authToken', token);
    return { token, user };
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
    
    // Handle each section differently based on expected backend fields
    switch (section) {
      case 'skin':
        // Map legacy field names to correct backend field names
        
        // skin_type mapping
        if (profileData.skin_type) {
          cleaned.skin_type = profileData.skin_type;
        } else if (profileData.skinType) {
          cleaned.skin_type = profileData.skinType;
        }
        
        // skin_tone mapping
        if (profileData.skin_tone) {
          cleaned.skin_tone = profileData.skin_tone;
        } else if (profileData.skinTone) {
          cleaned.skin_tone = profileData.skinTone;
        }
        
        // undertone mapping
        if (profileData.undertone) {
          cleaned.undertone = profileData.undertone;
        }
        
        // sensitivity_level mapping
        if (profileData.sensitivity_level) {
          cleaned.sensitivity_level = profileData.sensitivity_level;
        } else if (profileData.skinSensitivity) {
          cleaned.sensitivity_level = profileData.skinSensitivity;
        }
        
        // allergies mapping
        if (profileData.allergies) {
          cleaned.allergies = Array.isArray(profileData.allergies) ? profileData.allergies : [profileData.allergies];
        }
        
        // primary_concerns mapping - handle multiple legacy field names
        if (profileData.primary_concerns) {
          cleaned.primary_concerns = Array.isArray(profileData.primary_concerns) ? profileData.primary_concerns : [profileData.primary_concerns];
        } else if (profileData.primary_skin_concerns) {
          cleaned.primary_concerns = Array.isArray(profileData.primary_skin_concerns) ? profileData.primary_skin_concerns : [profileData.primary_skin_concerns];
        } else if (profileData.skinConcerns) {
          cleaned.primary_concerns = Array.isArray(profileData.skinConcerns) ? profileData.skinConcerns : [profileData.skinConcerns];
        } else if (profileData.skin_concerns) {
          cleaned.primary_concerns = Array.isArray(profileData.skin_concerns) ? profileData.skin_concerns : [profileData.skin_concerns];
        }
        break;
        
      case 'lifestyle':
        // Map lifestyle fields with legacy support
        
        // location mapping
        if (profileData.location) {
          cleaned.location = profileData.location;
        }
        
        // climate_type mapping
        if (profileData.climate_type) {
          cleaned.climate_type = profileData.climate_type;
        } else if (profileData.climateType) {
          cleaned.climate_type = profileData.climateType;
        }
        
        // pollution_level mapping
        if (profileData.pollution_level) {
          cleaned.pollution_level = profileData.pollution_level;
        } else if (profileData.pollutionLevel) {
          cleaned.pollution_level = profileData.pollutionLevel;
        }
        
        // sun_exposure mapping
        if (profileData.sun_exposure) {
          cleaned.sun_exposure = profileData.sun_exposure;
        } else if (profileData.sunExposure) {
          cleaned.sun_exposure = profileData.sunExposure;
        }
        
        // sleep_hours mapping
        if (profileData.sleep_hours !== undefined) {
          cleaned.sleep_hours = parseInt(profileData.sleep_hours);
        } else if (profileData.sleepHours !== undefined) {
          cleaned.sleep_hours = parseInt(profileData.sleepHours);
        }
        
        // stress_level mapping
        if (profileData.stress_level) {
          cleaned.stress_level = profileData.stress_level;
        } else if (profileData.stressLevel) {
          cleaned.stress_level = profileData.stressLevel;
        }
        
        // exercise_frequency mapping
        if (profileData.exercise_frequency) {
          cleaned.exercise_frequency = profileData.exercise_frequency;
        } else if (profileData.exerciseFrequency) {
          cleaned.exercise_frequency = profileData.exerciseFrequency;
        }
        
        // water_intake mapping
        if (profileData.water_intake) {
          cleaned.water_intake = profileData.water_intake;
        } else if (profileData.waterIntake) {
          cleaned.water_intake = profileData.waterIntake;
        }
        break;
        
      case 'hair':
        // Map hair fields with legacy support
        
        // hair_type mapping
        if (profileData.hair_type) {
          cleaned.hair_type = profileData.hair_type;
        } else if (profileData.hairType) {
          cleaned.hair_type = profileData.hairType;
        }
        
        // hair_texture mapping
        if (profileData.hair_texture) {
          cleaned.hair_texture = profileData.hair_texture;
        } else if (profileData.hairTexture) {
          cleaned.hair_texture = profileData.hairTexture;
        }
        
        // scalp_condition mapping
        if (profileData.scalp_condition) {
          cleaned.scalp_condition = profileData.scalp_condition;
        } else if (profileData.scalpCondition) {
          cleaned.scalp_condition = profileData.scalpCondition;
        }
        
        // primary_concerns mapping for hair
        if (profileData.primary_concerns) {
          cleaned.primary_concerns = Array.isArray(profileData.primary_concerns) ? profileData.primary_concerns : [profileData.primary_concerns];
        } else if (profileData.hairConcerns) {
          cleaned.primary_concerns = Array.isArray(profileData.hairConcerns) ? profileData.hairConcerns : [profileData.hairConcerns];
        } else if (profileData.hair_concerns) {
          cleaned.primary_concerns = Array.isArray(profileData.hair_concerns) ? profileData.hair_concerns : [profileData.hair_concerns];
        }
        
        // chemical_treatments mapping
        if (profileData.chemical_treatments) {
          cleaned.chemical_treatments = Array.isArray(profileData.chemical_treatments) ? profileData.chemical_treatments : [profileData.chemical_treatments];
        } else if (profileData.chemicalTreatments) {
          cleaned.chemical_treatments = Array.isArray(profileData.chemicalTreatments) ? profileData.chemicalTreatments : [profileData.chemicalTreatments];
        }
        
        // styling_frequency mapping
        if (profileData.styling_frequency) {
          cleaned.styling_frequency = profileData.styling_frequency;
        } else if (profileData.stylingFrequency) {
          cleaned.styling_frequency = profileData.stylingFrequency;
        }
        break;
        
      case 'health':
        // Map health fields with legacy support
        
        // age mapping
        if (profileData.age !== undefined) {
          cleaned.age = parseInt(profileData.age);
        }
        
        // hormonal_status mapping
        if (profileData.hormonal_status) {
          cleaned.hormonal_status = profileData.hormonal_status;
        } else if (profileData.hormonalStatus) {
          cleaned.hormonal_status = profileData.hormonalStatus;
        }
        
        // medications mapping
        if (profileData.medications) {
          cleaned.medications = Array.isArray(profileData.medications) ? profileData.medications : [profileData.medications];
        }
        
        // skin_conditions mapping
        if (profileData.skin_conditions) {
          cleaned.skin_conditions = Array.isArray(profileData.skin_conditions) ? profileData.skin_conditions : [profileData.skin_conditions];
        } else if (profileData.skinConditions) {
          cleaned.skin_conditions = Array.isArray(profileData.skinConditions) ? profileData.skinConditions : [profileData.skinConditions];
        }
        
        // dietary_restrictions mapping
        if (profileData.dietary_restrictions) {
          cleaned.dietary_restrictions = Array.isArray(profileData.dietary_restrictions) ? profileData.dietary_restrictions : [profileData.dietary_restrictions];
        } else if (profileData.dietaryRestrictions) {
          cleaned.dietary_restrictions = Array.isArray(profileData.dietaryRestrictions) ? profileData.dietaryRestrictions : [profileData.dietaryRestrictions];
        }
        break;
        
      case 'makeup':
        // Map makeup fields with legacy support
        
        // makeup_frequency mapping
        if (profileData.makeup_frequency) {
          cleaned.makeup_frequency = profileData.makeup_frequency;
        } else if (profileData.makeupFrequency) {
          cleaned.makeup_frequency = profileData.makeupFrequency;
        }
        
        // preferred_look mapping
        if (profileData.preferred_look) {
          cleaned.preferred_look = profileData.preferred_look;
        } else if (profileData.preferredLook) {
          cleaned.preferred_look = profileData.preferredLook;
        }
        
        // coverage_preference mapping
        if (profileData.coverage_preference) {
          cleaned.coverage_preference = profileData.coverage_preference;
        } else if (profileData.coveragePreference) {
          cleaned.coverage_preference = profileData.coveragePreference;
        }
        break;
        
      case 'preferences':
        // Map preferences fields with legacy support
        
        // budget_range mapping
        if (profileData.budget_range) {
          cleaned.budget_range = profileData.budget_range;
        } else if (profileData.budgetRange) {
          cleaned.budget_range = profileData.budgetRange;
        }
        
        // brand_preference mapping
        if (profileData.brand_preference) {
          cleaned.brand_preference = profileData.brand_preference;
        } else if (profileData.brandPreference) {
          cleaned.brand_preference = profileData.brandPreference;
        }
        
        // ingredient_preference mapping
        if (profileData.ingredient_preference) {
          cleaned.ingredient_preference = Array.isArray(profileData.ingredient_preference) ? profileData.ingredient_preference : [profileData.ingredient_preference];
        } else if (profileData.ingredientPreference) {
          cleaned.ingredient_preference = Array.isArray(profileData.ingredientPreference) ? profileData.ingredientPreference : [profileData.ingredientPreference];
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

  // Profile Management
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