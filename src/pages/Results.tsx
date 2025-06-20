import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useStore from '../store';
import ProductDetailModal from '../components/results/ProductDetailModal';
import { ProductRecommendation, AnalysisResult } from '../types';

// Mock data for demonstration
const mockAnalysisResult: AnalysisResult = {
  faceAnalysis: {
    detectedIssues: ['Mild acne on T-zone', 'Dark spots on cheeks', 'Under-eye circles'],
    skinTone: 'Medium with warm undertones',
    faceShape: 'Oval',
    confidence: 0.92,
  },
  recommendations: [
    {
      product: {
        id: '1',
        name: 'Clarifying Serum',
        brand: 'SkinScience',
        category: 'skincare',
        subcategory: 'serum',
        imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
        price: 45.00,
        size: '30ml',
        ingredients: ['Salicylic Acid', 'Niacinamide', 'Tea Tree Extract'],
        keyIngredients: ['2% Salicylic Acid', 'Niacinamide'],
        benefits: ['Reduces acne', 'Minimizes pores', 'Controls oil'],
        targetConcerns: ['acne', 'oily skin', 'large pores'],
        applicationArea: ['forehead', 'nose', 'chin'],
        usage: {
          frequency: 'Daily',
          time: 'evening',
          amount: '2-3 drops',
          instructions: 'Apply to clean skin before moisturizer',
        },
      },
      score: 95,
      reason: 'Targets acne with 2% salicylic acid, perfect for your oily T-zone',
      applicationPoints: [],
      priority: 1,
    },
    {
      product: {
        id: '2',
        name: 'Brightening Vitamin C Serum',
        brand: 'GlowLab',
        category: 'skincare',
        subcategory: 'serum',
        imageUrl: 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400',
        price: 55.00,
        size: '30ml',
        ingredients: ['Vitamin C', 'Vitamin E', 'Ferulic Acid'],
        keyIngredients: ['20% Vitamin C', 'Vitamin E'],
        benefits: ['Brightens dark spots', 'Evens skin tone', 'Antioxidant protection'],
        targetConcerns: ['dark spots', 'dull skin', 'uneven tone'],
        applicationArea: ['cheeks', 'forehead'],
        usage: {
          frequency: 'Daily',
          time: 'morning',
          amount: '3-4 drops',
          instructions: 'Apply before sunscreen',
        },
      },
      score: 92,
      reason: 'High-potency vitamin C to fade your dark spots and brighten overall complexion',
      applicationPoints: [],
      priority: 2,
    },
    {
      product: {
        id: '3',
        name: 'Lightweight SPF 50 Gel',
        brand: 'SunSafe',
        category: 'skincare',
        subcategory: 'sunscreen',
        imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
        price: 28.00,
        size: '50ml',
        ingredients: ['Zinc Oxide', 'Titanium Dioxide', 'Hyaluronic Acid'],
        keyIngredients: ['SPF 50', 'Zinc Oxide'],
        benefits: ['Broad spectrum protection', 'Non-greasy', 'Hydrating'],
        targetConcerns: ['sun protection', 'oily skin'],
        applicationArea: ['full face'],
        usage: {
          frequency: 'Daily',
          time: 'morning',
          amount: 'Two finger lengths',
          instructions: 'Apply as last step of morning routine',
        },
      },
      score: 90,
      reason: 'Essential for preventing further dark spots, gel formula perfect for oily skin',
      applicationPoints: [],
      priority: 3,
    },
    {
      product: {
        id: '4',
        name: 'Eye Brightening Cream',
        brand: 'LuxeSkin',
        category: 'skincare',
        subcategory: 'eye cream',
        imageUrl: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400',
        price: 65.00,
        size: '15ml',
        ingredients: ['Caffeine', 'Vitamin K', 'Peptides'],
        keyIngredients: ['5% Caffeine', 'Peptides'],
        benefits: ['Reduces dark circles', 'Firms skin', 'Hydrates'],
        targetConcerns: ['dark circles', 'puffiness'],
        applicationArea: ['under eyes'],
        usage: {
          frequency: 'Daily',
          time: 'both',
          amount: 'Rice grain size',
          instructions: 'Gently pat around eye area',
        },
      },
      score: 88,
      reason: 'Caffeine and peptides to brighten and firm your under-eye area',
      applicationPoints: [],
      priority: 4,
    },
  ],
  routineSuggestion: {
    morning: [],
    evening: [],
  },
  personalizedAdvice: [
    'Focus on consistent use of salicylic acid for acne control',
    'Vitamin C in the morning will help fade dark spots over time',
    'Never skip sunscreen to prevent new pigmentation',
  ],
};

const Results: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, photoPreview, facialKeypoints, selectedProduct, setSelectedProduct } = useStore();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);

  useEffect(() => {
    if (!photoPreview) {
      navigate('/');
      return;
    }

    // Simulate loading analysis results
    setTimeout(() => {
      setRecommendations(mockAnalysisResult.recommendations);
    }, 1000);
  }, [photoPreview, navigate]);

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  const productPositions = [
    { top: '15%', left: '10%' }, // Forehead area
    { top: '35%', right: '8%' },  // Right cheek
    { top: '35%', left: '8%' },   // Left cheek  
    { top: '65%', left: '50%', transform: 'translateX(-50%)' }, // Under eye/chin area
  ];

  if (!photoPreview) {
    return null;
  }

  return (
    <div className="min-h-screen bg-beauty-black">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-beauty-black/80 backdrop-blur-md border-b border-beauty-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-display font-bold text-gradient">BeautyAI</h1>
            <div className="flex items-center gap-4">
              <button className="text-beauty-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
              <button 
                onClick={() => navigate('/')}
                className="text-beauty-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            ✨ Your Routine is Ready{userProfile.name ? `, ${userProfile.name}` : ''}!
          </h2>
          <p className="text-lg text-beauty-gray-400 max-w-2xl mx-auto mb-2">
            {mockAnalysisResult.faceAnalysis.detectedIssues.join(', ')}. 
            Here's your personalized regimen to tackle them:
          </p>
          <p className="text-sm text-beauty-accent">
            👆 Tap the floating products around your photo to learn more
          </p>
        </motion.div>

        {/* Photo with floating products */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative max-w-2xl mx-auto mb-12"
        >
          {/* Main photo */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={photoPreview}
              alt="Your analyzed photo"
              className="w-full h-auto max-h-[600px] object-cover"
            />
            
            {/* Subtle overlay for better product visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-beauty-black/20 via-transparent to-beauty-black/10 pointer-events-none" />
          </div>

          {/* Floating product markers */}
          <AnimatePresence>
            {recommendations.map((rec, index) => {
              const position = productPositions[index] || { top: '50%', left: '50%' };
              return (
                <motion.div
                  key={rec.product.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.2 }}
                  className="absolute z-10 group cursor-pointer"
                  style={position}
                  onClick={() => handleProductClick(rec.product)}
                >
                  {/* Product marker */}
                  <div className="relative">
                    {/* Pulsing ring */}
                    <div className="absolute inset-0 w-12 h-12 bg-beauty-accent/30 rounded-full animate-ping" />
                    
                    {/* Main marker */}
                    <div className="relative w-12 h-12 bg-beauty-accent rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                      <span className="text-beauty-black font-bold text-sm">
                        {index + 1}
                      </span>
                    </div>

                    {/* Product preview on hover */}
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      whileHover={{ opacity: 1, y: -10, scale: 1 }}
                      className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 pointer-events-none"
                    >
                      <div className="bg-beauty-gray-900/95 backdrop-blur-sm rounded-lg p-3 shadow-xl border border-beauty-gray-700 min-w-[200px]">
                        <div className="flex items-start gap-3">
                          <img
                            src={rec.product.imageUrl}
                            alt={rec.product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h4 className="text-white font-medium text-sm leading-tight">
                              {rec.product.name}
                            </h4>
                            <p className="text-beauty-gray-400 text-xs mt-1">
                              {rec.product.brand}
                            </p>
                            <p className="text-beauty-accent text-sm font-medium mt-1">
                              ${rec.product.price}
                            </p>
                          </div>
                        </div>
                        <p className="text-beauty-gray-300 text-xs mt-2 leading-relaxed">
                          {rec.reason}
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Analysis summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="floating-panel p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Analysis Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-beauty-gray-400">Skin Tone:</span>
                <p className="text-white font-medium">{mockAnalysisResult.faceAnalysis.skinTone}</p>
              </div>
              <div>
                <span className="text-beauty-gray-400">Face Shape:</span>
                <p className="text-white font-medium">{mockAnalysisResult.faceAnalysis.faceShape}</p>
              </div>
              <div>
                <span className="text-beauty-gray-400">Confidence:</span>
                <p className="text-beauty-accent font-medium">
                  {Math.round(mockAnalysisResult.faceAnalysis.confidence * 100)}%
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Personalized advice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mt-8 max-w-3xl mx-auto"
        >
          <div className="floating-panel p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              💡 Personalized Tips
            </h3>
            <ul className="space-y-2">
              {mockAnalysisResult.personalizedAdvice.map((advice, index) => (
                <li key={index} className="flex items-start gap-3 text-beauty-gray-300">
                  <span className="text-beauty-accent mt-1">•</span>
                  {advice}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </main>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedProduct(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Results; 