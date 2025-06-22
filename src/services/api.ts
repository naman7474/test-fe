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

  async signup(email: string, password: string, name: string): Promise<{ token: string; user: UserProfile }> {
    const response = await apiClient.post('/auth/signup', { email, password, name });
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
        // Map any legacy field names to correct ones
        if (profileData.skin_type) cleaned.skin_type = profileData.skin_type;
        if (profileData.skin_tone) cleaned.skin_tone = profileData.skin_tone;
        if (profileData.undertone) cleaned.undertone = profileData.undertone;
        if (profileData.sensitivity_level) cleaned.sensitivity_level = profileData.sensitivity_level;
        if (profileData.allergies) cleaned.allergies = profileData.allergies;
        
        // Handle primary_concerns - check for both current and legacy field names
        if (profileData.primary_concerns) {
          cleaned.primary_concerns = profileData.primary_concerns;
        } else if (profileData.primary_skin_concerns) {
          cleaned.primary_concerns = profileData.primary_skin_concerns;
        } else if (profileData.skinConcerns) {
          cleaned.primary_concerns = profileData.skinConcerns;
        }
        break;
        
      case 'lifestyle':
        // Copy all lifestyle fields as they should be correct
        Object.keys(profileData).forEach(key => {
          if (['location', 'climate_type', 'pollution_level', 'sun_exposure', 'sleep_hours', 'stress_level', 'exercise_frequency', 'water_intake'].includes(key)) {
            cleaned[key] = profileData[key];
          }
        });
        break;
        
      case 'hair':
        // Copy hair fields
        Object.keys(profileData).forEach(key => {
          if (['hair_type', 'hair_texture', 'scalp_condition', 'primary_concerns', 'chemical_treatments', 'styling_frequency'].includes(key)) {
            cleaned[key] = profileData[key];
          }
        });
        break;
        
      case 'health':
        // Copy health fields
        Object.keys(profileData).forEach(key => {
          if (['age', 'hormonal_status', 'medications', 'skin_conditions', 'dietary_restrictions'].includes(key)) {
            cleaned[key] = profileData[key];
          }
        });
        break;
        
      case 'makeup':
        // Copy makeup fields
        Object.keys(profileData).forEach(key => {
          if (['makeup_frequency', 'preferred_look', 'coverage_preference'].includes(key)) {
            cleaned[key] = profileData[key];
          }
        });
        break;
        
      default:
        // For other sections, copy all fields
        Object.assign(cleaned, profileData);
    }
    
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