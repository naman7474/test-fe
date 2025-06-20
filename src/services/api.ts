import { UserProfile, AnalysisResult, ProductRecommendation, Product } from '../types';

// Mock delay function to simulate API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock products database
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Clarifying Salicylic Acid Serum',
    brand: 'SkinScience',
    category: 'skincare',
    subcategory: 'serum',
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    price: 45.00,
    size: '30ml',
    ingredients: ['Salicylic Acid', 'Niacinamide', 'Tea Tree Extract', 'Hyaluronic Acid'],
    keyIngredients: ['2% Salicylic Acid', '5% Niacinamide'],
    benefits: ['Reduces acne', 'Minimizes pores', 'Controls oil production', 'Gentle exfoliation'],
    targetConcerns: ['acne', 'oily skin', 'large pores', 'blackheads'],
    applicationArea: ['forehead', 'nose', 'chin'],
    usage: {
      frequency: 'Daily (evening)',
      time: 'evening',
      amount: '2-3 drops',
      instructions: 'Apply to clean skin, avoid eye area. Use sunscreen during the day.',
    },
    rating: 4.6,
    reviews: 1247,
  },
  {
    id: '2',
    name: 'Brightening Vitamin C Serum',
    brand: 'GlowLab',
    category: 'skincare',
    subcategory: 'serum',
    imageUrl: 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400',
    price: 55.00,
    size: '30ml',
    ingredients: ['L-Ascorbic Acid', 'Vitamin E', 'Ferulic Acid', 'Hyaluronic Acid'],
    keyIngredients: ['20% L-Ascorbic Acid', 'Vitamin E', 'Ferulic Acid'],
    benefits: ['Brightens dark spots', 'Evens skin tone', 'Antioxidant protection', 'Collagen boost'],
    targetConcerns: ['dark spots', 'dull skin', 'uneven tone', 'fine lines'],
    applicationArea: ['cheeks', 'forehead', 'full face'],
    usage: {
      frequency: 'Daily (morning)',
      time: 'morning',
      amount: '3-4 drops',
      instructions: 'Apply to clean skin before moisturizer. Always follow with SPF.',
    },
    rating: 4.8,
    reviews: 956,
  },
  {
    id: '3',
    name: 'Lightweight SPF 50+ Gel Sunscreen',
    brand: 'SunSafe',
    category: 'skincare',
    subcategory: 'sunscreen',
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
    price: 28.00,
    size: '50ml',
    ingredients: ['Zinc Oxide', 'Titanium Dioxide', 'Hyaluronic Acid', 'Niacinamide'],
    keyIngredients: ['SPF 50+', '15% Zinc Oxide'],
    benefits: ['Broad spectrum protection', 'Non-greasy formula', 'Hydrating', 'Suitable for oily skin'],
    targetConcerns: ['sun protection', 'oily skin', 'daily protection'],
    applicationArea: ['full face', 'neck'],
    usage: {
      frequency: 'Daily (morning)',
      time: 'morning', 
      amount: 'Two finger lengths for face',
      instructions: 'Apply as last step of morning routine. Reapply every 2 hours.',
    },
    rating: 4.7,
    reviews: 2134,
  },
  {
    id: '4',
    name: 'Eye Brightening Caffeine Cream',
    brand: 'LuxeSkin',
    category: 'skincare',
    subcategory: 'eye cream',
    imageUrl: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400',
    price: 65.00,
    size: '15ml',
    ingredients: ['Caffeine', 'Vitamin K', 'Peptides', 'Hyaluronic Acid', 'Niacinamide'],
    keyIngredients: ['5% Caffeine', 'Tripeptide Complex'],
    benefits: ['Reduces dark circles', 'Diminishes puffiness', 'Firms skin', 'Hydrates delicate eye area'],
    targetConcerns: ['dark circles', 'puffiness', 'fine lines', 'tired eyes'],
    applicationArea: ['under eyes', 'upper eyelids'],
    usage: {
      frequency: 'Daily (morning & evening)',
      time: 'both',
      amount: 'Rice grain size per eye',
      instructions: 'Gently pat around eye area using ring finger. Avoid direct contact with eyes.',
    },
    rating: 4.5,
    reviews: 743,
  },
  {
    id: '5',
    name: 'Hydrating Hyaluronic Acid Moisturizer',
    brand: 'AquaGlow',
    category: 'skincare',
    subcategory: 'moisturizer',
    imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400',
    price: 38.00,
    size: '50ml',
    ingredients: ['Hyaluronic Acid', 'Ceramides', 'Niacinamide', 'Panthenol'],
    keyIngredients: ['3 Types of Hyaluronic Acid', 'Ceramide Complex'],
    benefits: ['Deep hydration', 'Strengthens skin barrier', 'Plumping effect', 'Suitable for all skin types'],
    targetConcerns: ['dehydration', 'dull skin', 'rough texture'],
    applicationArea: ['full face', 'neck'],
    usage: {
      frequency: 'Daily (morning & evening)',
      time: 'both',
      amount: 'Pea-sized amount',
      instructions: 'Apply to damp skin for best absorption. Can be layered under other moisturizers.',
    },
    rating: 4.6,
    reviews: 1823,
  },
  {
    id: '6',
    name: 'Gentle Foaming Cleanser',
    brand: 'PureSkin',
    category: 'skincare',
    subcategory: 'cleanser',
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    price: 22.00,
    size: '150ml',
    ingredients: ['Glycerin', 'Coco-Glucoside', 'Panthenol', 'Allantoin'],
    keyIngredients: ['Gentle Surfactants', 'Pro-Vitamin B5'],
    benefits: ['Removes impurities', 'Maintains skin barrier', 'Non-drying', 'pH balanced'],
    targetConcerns: ['daily cleansing', 'sensitive skin', 'maintaining balance'],
    applicationArea: ['full face'],
    usage: {
      frequency: 'Daily (morning & evening)',
      time: 'both',
      amount: 'Pump 1-2 times',
      instructions: 'Massage into wet skin, rinse thoroughly with lukewarm water.',
    },
    rating: 4.4,
    reviews: 1456,
  }
];

export interface UploadResponse {
  success: boolean;
  session_id: string;
  message: string;
}

export interface AnalysisResponse {
  success: boolean;
  progress: number;
  status: 'processing' | 'complete' | 'error';
  step: string;
  result?: AnalysisResult;
}

class MockBeautyAPI {
  private analysisProgress: { [sessionId: string]: number } = {};
  private analysisResults: { [sessionId: string]: AnalysisResult } = {};

  async uploadPhoto(file: File): Promise<UploadResponse> {
    await delay(1000); // Simulate upload time
    
    const sessionId = Math.random().toString(36).substring(7);
    this.analysisProgress[sessionId] = 0;
    
    return {
      success: true,
      session_id: sessionId,
      message: 'Photo uploaded successfully'
    };
  }

  async getAnalysisStatus(sessionId: string): Promise<AnalysisResponse> {
    await delay(800); // Simulate processing time
    
    let progress = this.analysisProgress[sessionId] || 0;
    
    // Simulate progressive analysis
    if (progress < 100) {
      progress += Math.random() * 15 + 10; // Random progress increment
      this.analysisProgress[sessionId] = Math.min(progress, 100);
    }

    const steps = [
      'Detecting facial features...',
      'Identifying skin characteristics...',
      'Analyzing skin tone and texture...',
      'Detecting skin concerns...',
      'Evaluating facial structure...',
      'Processing skin health indicators...',
      'Generating personalized insights...',
      'Matching products to your profile...',
      'Finalizing recommendations...',
      'Analysis complete!'
    ];

    const stepIndex = Math.floor((progress / 100) * (steps.length - 1));
    const currentStep = steps[stepIndex];

    if (progress >= 100) {
      // Generate mock analysis result
      const analysisResult = this.generateMockAnalysis();
      this.analysisResults[sessionId] = analysisResult;
      
      return {
        success: true,
        progress: 100,
        status: 'complete',
        step: currentStep,
        result: analysisResult
      };
    }

    return {
      success: true,
      progress: Math.floor(progress),
      status: 'processing',
      step: currentStep
    };
  }

  private generateMockAnalysis(): AnalysisResult {
    const detectedIssues = [
      'Mild acne on T-zone',
      'Dark spots on cheeks',
      'Under-eye circles',
      'Slightly enlarged pores on nose'
    ];

    // Select 4-6 products based on detected issues
    const selectedProducts = mockProducts.slice(0, 5);
    
    const recommendations: ProductRecommendation[] = selectedProducts.map((product, index) => ({
      product,
      score: 95 - (index * 3), // Descending scores
      reason: this.generateRecommendationReason(product, detectedIssues),
      applicationPoints: [],
      priority: index + 1
    }));

    return {
      faceAnalysis: {
        detectedIssues,
        skinTone: 'Medium with warm undertones',
        faceShape: 'Oval',
        confidence: 0.92
      },
      recommendations,
      routineSuggestion: {
        morning: recommendations.filter(r => r.product.usage.time === 'morning' || r.product.usage.time === 'both').map(r => r.product),
        evening: recommendations.filter(r => r.product.usage.time === 'evening' || r.product.usage.time === 'both').map(r => r.product)
      },
      personalizedAdvice: [
        'Focus on consistent use of salicylic acid for acne control',
        'Vitamin C in the morning will help fade dark spots over time',
        'Never skip sunscreen to prevent new pigmentation',
        'Use gentle, non-comedogenic products to avoid clogging pores',
        'Consider adding a retinoid product after 4-6 weeks for enhanced results'
      ]
    };
  }

  private generateRecommendationReason(product: Product, issues: string[]): string {
    const reasons: { [key: string]: { [key: string]: string } } = {
      'serum': {
        'Clarifying Salicylic Acid Serum': 'Perfect for your oily T-zone and acne concerns - salicylic acid penetrates pores to clear breakouts',
        'Brightening Vitamin C Serum': 'High-potency vitamin C will fade your dark spots and brighten overall complexion'
      },
      'sunscreen': {
        'Lightweight SPF 50+ Gel Sunscreen': 'Essential for preventing further dark spots, gel formula perfect for oily skin'
      },
      'eye cream': {
        'Eye Brightening Caffeine Cream': 'Caffeine and peptides specifically target your under-eye circles and puffiness'
      },
      'moisturizer': {
        'Hydrating Hyaluronic Acid Moisturizer': 'Lightweight hydration that won\'t clog pores while maintaining skin barrier'
      },
      'cleanser': {
        'Gentle Foaming Cleanser': 'Removes excess oil and impurities without over-drying your skin'
      }
    };

    return reasons[product.subcategory]?.[product.name] || `Specially selected for your skin type and concerns`;
  }

  async submitProfile(profile: UserProfile): Promise<{ success: boolean; message: string }> {
    await delay(500);
    
    return {
      success: true,
      message: 'Profile saved successfully'
    };
  }
}

const mockAPI = new MockBeautyAPI();
export default mockAPI; 