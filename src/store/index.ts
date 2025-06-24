import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserProfile, FormStep, AnalysisResult, Product } from '../types';

interface AppState {
  // User Profile State
  userProfile: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  resetUserProfile: () => void;

  // Form State
  currentStep: FormStep;
  completedSteps: FormStep[];
  setCurrentStep: (step: FormStep) => void;
  markStepComplete: (step: FormStep) => void;
  isStepComplete: (step: FormStep) => boolean;

  // Photo Upload State
  uploadedPhoto: File | null;
  photoPreview: string | null;
  setUploadedPhoto: (file: File, preview: string) => void;
  clearPhoto: () => void;

  // Analysis State
  isAnalyzing: boolean;
  analysisResult: AnalysisResult | null;
  setAnalyzing: (analyzing: boolean) => void;
  setAnalysisResult: (result: AnalysisResult) => void;
  clearAnalysisResult: () => void;

  // UI State
  selectedProduct: Product | null;
  productDetailOpen: boolean;
  setSelectedProduct: (product: Product | null) => void;
  setProductDetailOpen: (open: boolean) => void;

  // Loading States
  isLoading: boolean;
  loadingMessage: string;
  setLoading: (loading: boolean, message?: string) => void;

  // Session State
  currentSessionId: string | null;
  setCurrentSessionId: (sessionId: string | null) => void;
  
  // User Status
  hasCompletedOnboarding: boolean;
  hasRecommendations: boolean;
  setUserStatus: (onboarding: boolean, recommendations: boolean) => void;
  lastAnalysisDate: string | null;
  setLastAnalysisDate: (date: string | null) => void;
}

const initialUserProfile: UserProfile = {
  analysisComplete: false,
  profileComplete: false,
  skin: {},
  hair: {},
  lifestyle: {},
  health: {},
  makeup: {},
  preferences: {}
};

const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User Profile State
      userProfile: initialUserProfile,
      updateUserProfile: (updates) =>
        set((state) => ({
          userProfile: { ...state.userProfile, ...updates },
        })),
      resetUserProfile: () =>
        set({
          userProfile: initialUserProfile,
          completedSteps: [],
          currentStep: 'skin',
          analysisResult: null,
          uploadedPhoto: null,
          photoPreview: null,
          hasCompletedOnboarding: false,
          hasRecommendations: false,
          lastAnalysisDate: null,
        }),

      // Form State
      currentStep: 'skin',
      completedSteps: [],
      setCurrentStep: (step) => set({ currentStep: step }),
      markStepComplete: (step) =>
        set((state) => ({
          completedSteps: Array.from(new Set([...state.completedSteps, step])),
        })),
      isStepComplete: (step) => get().completedSteps.includes(step),

      // Photo Upload State
      uploadedPhoto: null,
      photoPreview: null,
      setUploadedPhoto: (file, preview) =>
        set({ uploadedPhoto: file, photoPreview: preview }),
      clearPhoto: () =>
        set({ uploadedPhoto: null, photoPreview: null }),

      // Analysis State
      isAnalyzing: false,
      analysisResult: null,
      setAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
      setAnalysisResult: (result) =>
        set({
          analysisResult: result,
          userProfile: { ...get().userProfile, analysisComplete: true },
          hasRecommendations: true,
          lastAnalysisDate: new Date().toISOString(),
        }),
      clearAnalysisResult: () =>
        set({ analysisResult: null }),

      // UI State
      selectedProduct: null,
      productDetailOpen: false,
      setSelectedProduct: (product) => set({ selectedProduct: product }),
      setProductDetailOpen: (open) => set({ productDetailOpen: open }),

      // Loading States
      isLoading: false,
      loadingMessage: '',
      setLoading: (loading, message = '') =>
        set({ isLoading: loading, loadingMessage: message }),

      // Session State
      currentSessionId: null,
      setCurrentSessionId: (sessionId) => set({ currentSessionId: sessionId }),
      
      // User Status
      hasCompletedOnboarding: false,
      hasRecommendations: false,
      setUserStatus: (onboarding, recommendations) =>
        set({ hasCompletedOnboarding: onboarding, hasRecommendations: recommendations }),
      lastAnalysisDate: null,
      setLastAnalysisDate: (date) => set({ lastAnalysisDate: date }),
    }),
    {
      name: 'beauty-ai-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userProfile: state.userProfile,
        completedSteps: state.completedSteps,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        hasRecommendations: state.hasRecommendations,
        lastAnalysisDate: state.lastAnalysisDate,
        // Don't persist UI state, file objects, or analysis results
      }),
    }
  )
);

export default useStore; 