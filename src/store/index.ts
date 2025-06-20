import { create } from 'zustand';
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
}

const initialUserProfile: UserProfile = {
  analysisComplete: false,
};

const useStore = create<AppState>((set, get) => ({
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
}));

export default useStore; 