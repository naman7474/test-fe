import { UserProfile, AnalysisResult, ProductRecommendation, Product } from '../types';
import axios from 'axios';

// API Configuration
const API_BASE_URL = 'http://localhost:3001/api';

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

// Type Definitions
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    created_at?: string;
  };
}

export interface UploadResponse {
  session_id: string;
  photo_id: string;
  processing_status: string;
  estimated_time: number;
}

export interface PhotoAnalysisStatus {
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  current_step: string;
  face_model_url?: string;
  face_landmarks?: any;
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
      last_updated?: string;
    };
  };
  overallProgress: number;
  nextStep: string;
}

export interface AIAnalysisStatus {
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  current_step: string;
  steps_completed: string[];
  steps_pending: string[];
}

export interface RecommendationsResponse {
  analysis_id: string;
  generated_at: string;
  expiry_date: string;
  skin_analysis_summary: {
    skin_type: string;
    main_concerns: string[];
    skin_score: number;
    improvement_potential: string;
  };
  routine: {
    morning: ProductRecommendation[];
    evening: ProductRecommendation[];
    weekly: ProductRecommendation[];
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
  alternative_products: {
    budget_friendly: ProductRecommendation[];
    premium: ProductRecommendation[];
  };
}

export interface ProgressStats {
  completion_stats: {
    overall_percentage: number;
    current_streak: number;
    longest_streak: number;
    total_days: number;
  };
  daily_records: Array<{
    date: string;
    morning: boolean;
    evening: boolean;
    notes?: string;
  }>;
  improvements: {
    [concern: string]: {
      initial_severity: string;
      current_severity: string;
      improvement_percentage: number;
    };
  };
}

export interface ProductSearchResponse {
  products: Product[];
  total_count: number;
  filters_applied: any;
}

export interface InfluencerResponse {
  influencers: Array<{
    id: string;
    name: string;
    handle: string;
    profile_image: string;
    followers_count: string;
    skin_type: string;
    skin_concerns: string[];
    bio: string;
    recent_recommendations?: Array<{
      product_id: string;
      product_name: string;
      recommendation_reason: string;
    }>;
  }>;
  total_count: number;
}

class BeautyAPI {
  // Authentication APIs
  async register(email: string, password: string, firstName: string, lastName: string): Promise<AuthResponse> {
    try {
      console.log('Attempting registration for:', email);
      const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', {
        email,
        password,
        first_name: firstName,
        last_name: lastName
      });

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error?.message || 'Registration failed');
      }

      const { token, user } = response.data.data;
      localStorage.setItem('authToken', token);
      return { token, user };
    } catch (error: any) {
      console.error('Registration error:', error);
      this.handleApiError(error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('Attempting login for:', email);
      const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', {
        email,
        password
      });

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error?.message || 'Login failed');
      }

      const { token, user } = response.data.data;
      localStorage.setItem('authToken', token);
      return { token, user };
    } catch (error: any) {
      console.error('Login error:', error);
      this.handleApiError(error);
      throw error;
    }
  }

  async refreshToken(): Promise<string> {
    try {
      const response = await apiClient.post<ApiResponse<{ token: string }>>('/auth/refresh');
      
      if (!response.data.success || !response.data.data) {
        throw new Error('Token refresh failed');
      }

      const { token } = response.data.data;
      localStorage.setItem('authToken', token);
      return token;
    } catch (error: any) {
      console.error('Token refresh error:', error);
      this.handleApiError(error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem('authToken');
  }

  // Profile Management APIs
  async getOnboardingProgress(): Promise<OnboardingProgress> {
    try {
      const response = await apiClient.get<ApiResponse<OnboardingProgress>>('/profile/beauty/onboarding');
      
      if (!response.data.success || !response.data.data) {
        throw new Error('Failed to fetch onboarding progress');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Onboarding progress error:', error);
      this.handleApiError(error);
      throw error;
    }
  }

  async updateSkinProfile(skinData: any): Promise<any> {
    try {
      const response = await apiClient.put<ApiResponse>('/profile/beauty/skin', skinData);
      
      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Failed to update skin profile');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Skin profile update error:', error);
      this.handleApiError(error);
      throw error;
    }
  }

  async updateLifestyleProfile(lifestyleData: any): Promise<any> {
    try {
      const response = await apiClient.put<ApiResponse>('/profile/beauty/lifestyle', lifestyleData);
      
      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Failed to update lifestyle profile');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Lifestyle profile update error:', error);
      this.handleApiError(error);
      throw error;
    }
  }

  async updateHairProfile(hairData: any): Promise<any> {
    try {
      const response = await apiClient.put<ApiResponse>('/profile/beauty/hair', hairData);
      
      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Failed to update hair profile');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Hair profile update error:', error);
      this.handleApiError(error);
      throw error;
    }
  }

  async updateHealthProfile(healthData: any): Promise<any> {
    try {
      const response = await apiClient.put<ApiResponse>('/profile/beauty/health', healthData);
      
      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Failed to update health profile');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Health profile update error:', error);
      this.handleApiError(error);
      throw error;
    }
  }

  async updateMakeupProfile(makeupData: any): Promise<any> {
    try {
      const response = await apiClient.put<ApiResponse>('/profile/beauty/makeup', makeupData);
      
      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Failed to update makeup profile');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Makeup profile update error:', error);
      this.handleApiError(error);
      throw error;
    }
  }

  async updatePreferencesProfile(preferencesData: any): Promise<any> {
    try {
      const response = await apiClient.put<ApiResponse>('/profile/beauty/preferences', preferencesData);
      
      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Failed to update preferences profile');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Preferences profile update error:', error);
      this.handleApiError(error);
      throw error;
    }
  }

  // Photo Upload & Analysis APIs
  async uploadPhoto(file: File): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('photo_type', 'onboarding');

      const response = await apiClient.post<ApiResponse<UploadResponse>>('/photo/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error?.message || 'Photo upload failed');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Photo upload error:', error);
      this.handleApiError(error);
      throw error;
    }
  }

  async getPhotoProcessingStatus(sessionId: string): Promise<PhotoAnalysisStatus> {
    try {
      const response = await apiClient.get<ApiResponse<PhotoAnalysisStatus>>(`/photo/status/${sessionId}`);
      
      if (!response.data.success || !response.data.data) {
        throw new Error('Failed to fetch photo processing status');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Photo status error:', error);
      this.handleApiError(error);
      throw error;
    }
  }

  // AI Analysis APIs
  async triggerAIAnalysis(sessionId: string, options: {
    include_photo_analysis?: boolean;
    analysis_depth?: 'basic' | 'comprehensive';
  } = {}): Promise<{ analysis_id: string; status: string; estimated_time: number; queue_position: number }> {
    try {
      const response = await apiClient.post<ApiResponse>('/analysis/trigger', {
        session_id: sessionId,
        include_photo_analysis: options.include_photo_analysis ?? true,
        analysis_depth: options.analysis_depth ?? 'comprehensive'
      });

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error?.message || 'Failed to trigger AI analysis');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('AI analysis trigger error:', error);
      this.handleApiError(error);
      throw error;
    }
  }

  async getAIAnalysisStatus(analysisId: string): Promise<AIAnalysisStatus> {
    try {
      const response = await apiClient.get<ApiResponse<AIAnalysisStatus>>(`/analysis/status/${analysisId}`);
      
      if (!response.data.success || !response.data.data) {
        throw new Error('Failed to fetch AI analysis status');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('AI analysis status error:', error);
      this.handleApiError(error);
      throw error;
    }
  }

  // Recommendations API
  async getRecommendations(): Promise<RecommendationsResponse> {
    try {
      const response = await apiClient.get<ApiResponse<RecommendationsResponse>>('/recommendations/beauty');
      
      if (!response.data.success || !response.data.data) {
        throw new Error('Failed to fetch recommendations');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Recommendations error:', error);
      this.handleApiError(error);
      throw error;
    }
  }

  async submitRecommendationFeedback(recommendationId: string, feedback: {
    feedback: string;
    effective: boolean;
  }): Promise<any> {
    try {
      const response = await apiClient.post<ApiResponse>(`/recommendations/feedback/${recommendationId}`, feedback);
      
      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Failed to submit feedback');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Recommendation feedback error:', error);
      this.handleApiError(error);
      throw error;
    }
  }

  async updateRecommendationRating(recommendationId: string, rating: number): Promise<any> {
    try {
      const response = await apiClient.put<ApiResponse>(`/recommendations/rating/${recommendationId}`, { rating });
      
      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Failed to update rating');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Recommendation rating error:', error);
      this.handleApiError(error);
      throw error;
    }
  }

  // Progress Tracking APIs
  async saveRoutineCompletion(routineData: {
    date: string;
    routine_type: 'morning' | 'evening';
    completed: boolean;
    products_used: string[];
    notes?: string;
  }): Promise<any> {
    try {
      const response = await apiClient.post<ApiResponse>('/progress/routine', routineData);
      
      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Failed to save routine completion');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Routine completion error:', error);
      this.handleApiError(error);
      throw error;
    }
  }

  async getProgressTimeline(startDate?: string, endDate?: string): Promise<ProgressStats> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const response = await apiClient.get<ApiResponse<ProgressStats>>(`/progress/timeline?${params.toString()}`);
      
      if (!response.data.success || !response.data.data) {
        throw new Error('Failed to fetch progress timeline');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Progress timeline error:', error);
      this.handleApiError(error);
      throw error;
    }
  }

  async submitProgressFeedback(feedbackData: {
    days_used: number;
    overall_satisfaction: string;
    skin_improvements: string[];
    routine_adjustments_needed: boolean;
    comments?: string;
  }): Promise<any> {
    try {
      const response = await apiClient.post<ApiResponse>('/progress/feedback', feedbackData);
      
      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Failed to submit progress feedback');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Progress feedback error:', error);
      this.handleApiError(error);
      throw error;
    }
  }

  // Product Search API
  async searchProducts(searchParams: {
    query: string;
    filters?: {
      price_range?: [number, number];
      concerns?: string[];
      ingredients_include?: string[];
      ingredients_exclude?: string[];
    };
  }): Promise<ProductSearchResponse> {
    try {
      const response = await apiClient.post<ApiResponse<ProductSearchResponse>>('/products/search', searchParams);
      
      if (!response.data.success || !response.data.data) {
        throw new Error('Failed to search products');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Product search error:', error);
      this.handleApiError(error);
      throw error;
    }
  }

  async getProductDetails(productId: string): Promise<Product> {
    try {
      const response = await apiClient.get<ApiResponse<{ product: Product }>>(`/products/${productId}`);
      
      if (!response.data.success || !response.data.data) {
        throw new Error('Failed to fetch product details');
      }

      return response.data.data.product;
    } catch (error: any) {
      console.error('Product details error:', error);
      this.handleApiError(error);
      throw error;
    }
  }

  async getCompleteProfile(): Promise<UserProfile> {
    try {
      const response = await apiClient.get<ApiResponse<UserProfile>>('/profile/beauty');
      
      if (!response.data.success || !response.data.data) {
        throw new Error('Failed to fetch complete profile');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Complete profile fetch error:', error);
      this.handleApiError(error);
      throw error;
    }
  }

  // Influencer APIs
  async getRecommendedInfluencers(): Promise<InfluencerResponse> {
    try {
      const response = await apiClient.get<ApiResponse<InfluencerResponse>>('/influencers/recommended');
      
      if (!response.data.success || !response.data.data) {
        throw new Error('Failed to fetch recommended influencers');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Influencers error:', error);
      this.handleApiError(error);
      throw error;
    }
  }

  async getInfluencerDetails(influencerId: string): Promise<any> {
    try {
      const response = await apiClient.get<ApiResponse>(`/influencers/${influencerId}`);
      
      if (!response.data.success || !response.data.data) {
        throw new Error('Failed to fetch influencer details');
      }

      return response.data.data.influencer;
    } catch (error: any) {
      console.error('Influencer details error:', error);
      this.handleApiError(error);
      throw error;
    }
  }

  // Helper Methods
  private handleApiError(error: any): void {
    if (error.response?.data) {
      const errorData = error.response.data;
      if (errorData.error?.details) {
        // Handle validation errors
        const details = errorData.error.details;
        const errorMessages = Object.values(details).join(', ');
        throw new Error(errorMessages);
      } else if (errorData.error?.message) {
        throw new Error(errorData.error.message);
      }
    }
    
    // Handle network errors
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Unable to connect to server. Please check if the backend is running.');
    }
    
    if (error.message) {
      throw new Error(error.message);
    }
    
    throw new Error('An unexpected error occurred');
  }

  // Utility method for polling status
  async pollStatus<T>(
    statusEndpoint: () => Promise<T>,
    isComplete: (status: T) => boolean,
    interval: number = 2000,
    maxAttempts: number = 150
  ): Promise<T> {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const status = await statusEndpoint();
        
        if (isComplete(status)) {
          return status;
        }
        
        await new Promise(resolve => setTimeout(resolve, interval));
        attempts++;
      } catch (error) {
        if (attempts >= maxAttempts - 1) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, interval));
        attempts++;
      }
    }
    
    throw new Error('Polling timeout exceeded');
  }

  // Legacy method compatibility for backward compatibility
  async getAnalysisStatus(sessionId: string): Promise<PhotoAnalysisStatus> {
    return this.getPhotoProcessingStatus(sessionId);
  }

  async submitFeedback(feedbackData: {
    recommendation_id: string;
    product_id: string;
    feedback_type: 'positive' | 'negative' | 'neutral';
    rating: number;
    comments?: string;
  }): Promise<any> {
    return this.submitRecommendationFeedback(feedbackData.recommendation_id, {
      feedback: feedbackData.comments || '',
      effective: feedbackData.feedback_type === 'positive'
    });
  }

  async signup(email: string, password: string, firstName: string, lastName: string): Promise<AuthResponse> {
    return this.register(email, password, firstName, lastName);
  }

  async uploadProgressPhoto(file: File, weekNumber: number): Promise<any> {
    // Implementation for progress photo upload if needed
    // This would follow the same pattern as uploadPhoto but with different endpoint
    console.warn('Progress photo upload not implemented in current API');
    return { success: false, message: 'Feature not available' };
  }

  async searchProductsSimple(query: string, includeIngredients: boolean = true): Promise<any> {
    return this.searchProducts({ query });
  }

  async submitProfile(profile: UserProfile): Promise<{ success: boolean; message: string }> {
    try {
      // Update multiple profile sections based on the profile data
      const promises = [];
      
      if (profile.skin) {
        promises.push(this.updateSkinProfile(profile.skin));
      }
      
      if (profile.lifestyle) {
        promises.push(this.updateLifestyleProfile(profile.lifestyle));
      }
      
      if (profile.hair) {
        promises.push(this.updateHairProfile(profile.hair));
      }
      
      if (profile.health) {
        promises.push(this.updateHealthProfile(profile.health));
      }
      
      if (profile.makeup) {
        promises.push(this.updateMakeupProfile(profile.makeup));
      }
      
      if (profile.preferences) {
        promises.push(this.updatePreferencesProfile(profile.preferences));
      }
      
      await Promise.all(promises);
      
      return { success: true, message: 'Profile updated successfully' };
    } catch (error: any) {
      console.error('Profile submission error:', error);
      return { success: false, message: error.message || 'Profile update failed' };
    }
  }

  async getFormattedRecommendations(): Promise<AnalysisResult> {
    try {
      const recommendations = await this.getRecommendations();
      
      // Convert backend ProductRecommendation to frontend format
      const convertRecommendation = (backendProduct: any): ProductRecommendation => {
        // Create the product object with all required fields
        const product: Product = {
          id: backendProduct.product_id || backendProduct.id,
          product_id: backendProduct.product_id,
          product_name: backendProduct.product_name,
          brand: backendProduct.brand,
          product_type: backendProduct.product_type,
          price: backendProduct.price,
          size: backendProduct.size,
          image_url: backendProduct.image_url || '',
          key_ingredients: backendProduct.key_ingredients || [],
          recommendation_reason: backendProduct.recommendation_reason,
          usage_instructions: backendProduct.usage_instructions,
          application_order: backendProduct.application_order,
          match_score: backendProduct.match_score,
          
          // Legacy compatibility fields - all required
          name: backendProduct.product_name,
          imageUrl: backendProduct.image_url || 'https://via.placeholder.com/300x300?text=Product',
          keyIngredients: backendProduct.key_ingredients || [],
          benefits: backendProduct.benefits || ['Improves skin condition', 'Enhances appearance'],
          ingredients: backendProduct.ingredients || backendProduct.key_ingredients || [],
          targetConcerns: backendProduct.target_concerns || backendProduct.benefits || ['General skincare'],
          reason: backendProduct.recommendation_reason,
          instructions: backendProduct.usage_instructions,
          matchScore: backendProduct.match_score,
          category: backendProduct.product_type as any,
          usage: {
            frequency: 'daily',
            time: this.determineUsageTime(backendProduct.product_type),
            amount: 'as directed',
            instructions: backendProduct.usage_instructions || 'Follow product instructions'
          },
          rating: 4.5,
          reviews: 150
        };

        // Return ProductRecommendation with both API format and legacy format
        return {
          // API documentation format (direct fields)
          id: backendProduct.product_id, // For component compatibility
          product_id: backendProduct.product_id,
          product_name: backendProduct.product_name,
          brand: backendProduct.brand,
          product_type: backendProduct.product_type,
          price: backendProduct.price,
          size: backendProduct.size,
          image_url: backendProduct.image_url,
          key_ingredients: backendProduct.key_ingredients || [],
          recommendation_reason: backendProduct.recommendation_reason,
          usage_instructions: backendProduct.usage_instructions,
          application_order: backendProduct.application_order,
          match_score: backendProduct.match_score,
          
          // Legacy compatibility (nested product)
          product: product,
          score: backendProduct.match_score,
          reason: backendProduct.recommendation_reason,
          priority: backendProduct.application_order
        };
      };
      
      return {
        skinAnalysis: {
          skinType: recommendations.skin_analysis_summary.skin_type,
          concerns: recommendations.skin_analysis_summary.main_concerns,
          score: recommendations.skin_analysis_summary.skin_score,
          improvements: recommendations.skin_analysis_summary.improvement_potential
        },
        recommendations: {
          morning: recommendations.routine.morning.map(convertRecommendation),
          evening: recommendations.routine.evening.map(convertRecommendation),
          weekly: recommendations.routine.weekly.map(convertRecommendation)
        },
        insights: {
          focus: recommendations.ai_insights.primary_focus,
          philosophy: recommendations.ai_insights.routine_philosophy,
          timeline: recommendations.ai_insights.expected_timeline,
          tips: recommendations.ai_insights.lifestyle_tips
        }
      };
    } catch (error: any) {
      console.error('Formatted recommendations error:', error);
      throw error;
    }
  }

  private determineUsageTime(productType: string): 'morning' | 'evening' | 'both' {
    const morningProducts = ['cleanser', 'toner', 'serum', 'moisturizer', 'sunscreen'];
    const eveningProducts = ['cleanser', 'toner', 'serum', 'moisturizer', 'night cream', 'retinol'];
    const bothProducts = ['cleanser', 'toner', 'moisturizer'];
    
    if (bothProducts.some(type => productType.toLowerCase().includes(type))) {
      return 'both';
    } else if (productType.toLowerCase().includes('night') || productType.toLowerCase().includes('retinol')) {
      return 'evening';
    } else if (productType.toLowerCase().includes('sunscreen')) {
      return 'morning';
    }
    
    return 'both';
  }
}

// Export singleton instance
export const beautyAPI = new BeautyAPI();
export default beautyAPI; 