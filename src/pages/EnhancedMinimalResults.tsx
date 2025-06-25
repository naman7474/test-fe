// src/pages/EnhancedMinimalResults.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Product, AnalysisResult } from '../types';
import ScheduleModal from '../components/results/ScheduleModal';
import ProfileEditModal from '../components/results/ProfileEditModal';
import InfluencersTab from '../components/results/InfluencersTab';
import { getProfileCompletionPercentage } from '../config/profileSchema';
import useStore from '../store';
import beautyAPI from '../services/api';

interface CategoryProducts {
  category: string;
  color: string;
  bestProduct: Product;
  otherProducts: Product[];
  theory: string;
}

// Helper function to get category color based on product type
const getCategoryColor = (productType: string): string => {
  const colorMap: { [key: string]: string } = {
    'cleanser': 'from-blue-500/20 to-blue-600/20',
    'moisturizer': 'from-purple-500/20 to-purple-600/20', 
    'serum': 'from-pink-500/20 to-pink-600/20',
    'sunscreen': 'from-yellow-500/20 to-orange-500/20',
    'toner': 'from-green-500/20 to-green-600/20',
    'mask': 'from-indigo-500/20 to-indigo-600/20',
    'oil': 'from-orange-500/20 to-orange-600/20',
  };
  return colorMap[productType.toLowerCase()] || 'from-gray-500/20 to-gray-600/20';
};

// Helper function to get theory/explanation for each category
const getCategoryTheory = (productType: string): string => {
  const theoryMap: { [key: string]: string } = {
    'cleanser': 'Proper cleansing removes dirt, oil, and impurities while maintaining your skin\'s natural balance. This formula is designed to work with your skin type.',
    'moisturizer': 'Hydration is essential for all skin types. This moisturizer provides the right balance of hydration without clogging pores.',
    'serum': 'Serums deliver concentrated active ingredients deep into your skin for targeted treatment of specific concerns.',
    'sunscreen': 'Daily SPF protection is crucial for preventing premature aging and protecting against harmful UV rays.',
    'toner': 'Toners help balance your skin\'s pH and prepare it for the next steps in your routine.',
    'mask': 'Weekly treatments provide deep cleansing and intensive care for your skin.',
    'oil': 'Face oils help seal in moisture and provide additional nourishment for your skin.',
  };
  return theoryMap[productType.toLowerCase()] || 'This product is specially selected to address your specific skin needs and concerns.';
};

const EnhancedMinimalResults: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, analysisResult, setAnalysisResult } = useStore();
  
  // Modal states
  const [selectedCategory, setSelectedCategory] = useState<CategoryProducts | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleType, setScheduleType] = useState<'morning' | 'evening'>('morning');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  
  // Data states
  const [categories, setCategories] = useState<CategoryProducts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skinAnalysisSummary, setSkinAnalysisSummary] = useState<any>(null);
  const [routineData, setRoutineData] = useState<{morning: Product[], evening: Product[]}>({morning: [], evening: []});

  const userName = localStorage.getItem('userName') || 'Beautiful';
  const profileCompletionPercentage = getProfileCompletionPercentage(userProfile);
  const isProfileComplete = profileCompletionPercentage === 100;

  // Transform API recommendations into category format
  const transformToCategories = (apiResult: AnalysisResult): CategoryProducts[] => {
    const allProducts = [
      ...apiResult.recommendations.morning,
      ...apiResult.recommendations.evening,
      ...apiResult.recommendations.weekly
    ];

    // Group products by type
    const productsByType: { [key: string]: Product[] } = {};
    allProducts.forEach(rec => {
      const productType = rec.product?.product_type || 'other';
      if (!productsByType[productType]) {
        productsByType[productType] = [];
      }
      productsByType[productType].push(rec.product);
    });

    // Convert to CategoryProducts format
    return Object.keys(productsByType).map(productType => ({
      category: productType.charAt(0).toUpperCase() + productType.slice(1),
      color: getCategoryColor(productType),
      bestProduct: productsByType[productType][0], // Take first/highest priority product
      otherProducts: productsByType[productType].slice(1),
      theory: getCategoryTheory(productType)
    }));
  };

  // Fetch real API data
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if we have cached data
        if (analysisResult?.recommendations) {
          const transformedCategories = transformToCategories(analysisResult);
          setCategories(transformedCategories);
          
          // Extract routine data
          setRoutineData({
            morning: analysisResult.recommendations.morning.map(rec => rec.product),
            evening: analysisResult.recommendations.evening.map(rec => rec.product)
          });
          
          setSkinAnalysisSummary({
            summary: `Based on your profile and analysis, we've identified your skin type as ${analysisResult.skinAnalysis.skinType} with focus areas including ${analysisResult.skinAnalysis.concerns.join(', ')}.`,
            skinScore: analysisResult.skinAnalysis.score,
            concerns: analysisResult.skinAnalysis.concerns.map(concern => ({
              issue: concern,
              severity: 'Moderate',
              improvement: '+15%'
            }))
          });
          setIsLoading(false);
          return;
        }

        // Fetch from API
        const result = await beautyAPI.getFormattedRecommendations();
        setAnalysisResult(result);
        
        const transformedCategories = transformToCategories(result);
        setCategories(transformedCategories);
        
        // Extract routine data
        setRoutineData({
          morning: result.recommendations.morning.map(rec => rec.product),
          evening: result.recommendations.evening.map(rec => rec.product)
        });
        
        setSkinAnalysisSummary({
          summary: `Based on your profile and analysis, we've identified your skin type as ${result.skinAnalysis.skinType} with focus areas including ${result.skinAnalysis.concerns.join(', ')}.`,
          skinScore: result.skinAnalysis.score,
          concerns: result.skinAnalysis.concerns.map(concern => ({
            issue: concern,
            severity: 'Moderate', 
            improvement: '+15%'
          }))
        });
        
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch recommendations:', err);
        setError('Unable to load your recommendations. Please try again.');
        setIsLoading(false);
        
        // If 401, redirect to login
        if ((err as any).response?.status === 401) {
          navigate('/login');
        }
      }
    };

    fetchRecommendations();
  }, [analysisResult, setAnalysisResult, navigate]);

  const handleCategoryClick = (category: CategoryProducts) => {
    setSelectedCategory(category);
    setShowProductModal(true);
    setSelectedProduct(category.bestProduct);
  };

  const openSchedule = (type: 'morning' | 'evening') => {
    setScheduleType(type);
    setShowScheduleModal(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-beauty-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin w-12 h-12 border-3 border-beauty-accent border-t-transparent rounded-full mx-auto mb-6"></div>
          <p className="text-beauty-gray-300 text-lg mb-2">Loading your personalized routine...</p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-beauty-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-3">Oops! Something went wrong</h2>
          <p className="text-red-300 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/onboarding')}
              className="px-6 py-3 bg-beauty-gray-800 hover:bg-beauty-gray-700 text-white rounded-lg transition-colors"
            >
              Back to Profile
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-beauty-accent hover:bg-beauty-accent/90 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beauty-black flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-beauty-black/80 backdrop-blur-md border-b border-beauty-gray-800">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Hi, {userName}!</h1>
            <p className="text-beauty-gray-400 text-sm">
              {activeTab === 'home' ? 'Your personalized routine' : 
               activeTab === 'progress' ? 'Track your journey' :
               activeTab === 'influencers' ? 'Get inspired' : 'Coming soon'}
            </p>
          </div>
          <button 
            onClick={() => setShowProfileModal(true)}
            className="relative p-2 rounded-full bg-beauty-charcoal text-beauty-gray-300 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {!isProfileComplete && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-beauty-accent rounded-full flex items-center justify-center">
                <span className="text-[8px] text-white font-bold">!</span>
              </div>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {activeTab === 'home' && (
          <HomeTab 
            openSchedule={openSchedule}
            handleCategoryClick={handleCategoryClick}
            categories={categories}
            analysisResult={skinAnalysisSummary}
            routineData={routineData}
          />
        )}
        {activeTab === 'progress' && <ProgressTracker />}
        {activeTab === 'influencers' && <InfluencersTab />}
        {activeTab === 'shop' && <ComingSoonTab type="shop" />}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-beauty-black/80 backdrop-blur-md border-t border-beauty-gray-800 z-40">
        <div className="grid grid-cols-4 py-2">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 py-2 transition-colors ${
              activeTab === 'home' ? 'text-beauty-accent' : 'text-beauty-gray-500'
            }`}
          >
            <svg className="w-5 h-5" fill={activeTab === 'home' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs">Home</span>
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`flex flex-col items-center gap-1 py-2 transition-colors ${
              activeTab === 'progress' ? 'text-beauty-accent' : 'text-beauty-gray-500'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs">Progress</span>
          </button>
          <button
            onClick={() => setActiveTab('shop')}
            className="flex flex-col items-center gap-1 py-2 text-beauty-gray-500 relative"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="text-xs">Shop</span>
            <span className="absolute -top-1 right-2 text-[8px] bg-beauty-accent text-beauty-black px-1 rounded">Soon</span>
          </button>
          <button
            onClick={() => setActiveTab('influencers')}
            className={`flex flex-col items-center gap-1 py-2 transition-colors ${
              activeTab === 'influencers' ? 'text-beauty-accent' : 'text-beauty-gray-500'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-xs">Influencers</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showProductModal && selectedProduct && selectedCategory && (
          <EnhancedProductModal
            product={selectedProduct}
            category={selectedCategory}
            onClose={() => {
              setShowProductModal(false);
              setSelectedProduct(null);
              setSelectedCategory(null);
            }}
          />
        )}
        {showScheduleModal && (
          <ScheduleModal
            type={scheduleType}
            onClose={() => setShowScheduleModal(false)}
            routineProducts={scheduleType === 'morning' ? routineData.morning : routineData.evening}
          />
        )}
        {showProfileModal && (
          <ProfileEditModal
            onClose={() => setShowProfileModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Home Tab Component
const HomeTab: React.FC<{
  openSchedule: (type: 'morning' | 'evening') => void;
  handleCategoryClick: (category: CategoryProducts) => void;
  categories: CategoryProducts[];
  analysisResult: any;
  routineData: { morning: Product[], evening: Product[] };
}> = ({ openSchedule, handleCategoryClick, categories, analysisResult, routineData }) => {
  return (
    <div className="px-6 py-6">
      {/* Routine Overview with colors */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Daily Routine</h2>
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openSchedule('morning')}
            className="relative p-4 bg-beauty-charcoal rounded-xl border border-beauty-gray-800 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10" />
            <div className="relative">
              <h3 className="font-medium text-white mb-1">Morning</h3>
              <p className="text-beauty-gray-400 text-sm">{routineData.morning.length} steps • {Math.max(3, routineData.morning.length * 2)} min</p>
            </div>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openSchedule('evening')}
            className="relative p-4 bg-beauty-charcoal rounded-xl border border-beauty-gray-800 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10" />
            <div className="relative">
              <h3 className="font-medium text-white mb-1">Evening</h3>
              <p className="text-beauty-gray-400 text-sm">{routineData.evening.length} steps • {Math.max(3, routineData.evening.length * 2)} min</p>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Product Recommendations with colors */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Your Products</h2>
        <div className="space-y-3">
          {categories.map((category: CategoryProducts, index: number) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleCategoryClick(category)}
              className="relative bg-beauty-charcoal border border-beauty-gray-800 p-4 rounded-xl cursor-pointer overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${category.color}`} />
              <div className="relative flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-beauty-gray-400 text-sm mb-1">{category.category}</p>
                  <h3 className="text-white font-medium">{category.bestProduct.name}</h3>
                  <p className="text-beauty-gray-500 text-sm mt-1">{category.bestProduct.brand}</p>
                </div>
                <div className="text-right">
                  <p className="text-beauty-accent font-semibold">${category.bestProduct.price}</p>
                  <p className="text-xs text-beauty-gray-500 mt-1">95% match</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Analysis Results */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Your Skin Analysis</h2>
        <div className="bg-beauty-charcoal rounded-xl p-4 border border-beauty-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium">Overall Skin Score</h3>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-beauty-accent">{analysisResult.skinScore}</span>
              <span className="text-beauty-gray-400">/100</span>
            </div>
          </div>
          
          <p className="text-beauty-gray-300 text-sm mb-4">{analysisResult.summary}</p>
          
          <div className="space-y-3">
            {analysisResult.concerns.map((concern: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm">{concern.issue}</p>
                  <p className="text-beauty-gray-500 text-xs">{concern.severity}</p>
                </div>
                <span className="text-beauty-secondary text-sm font-medium">{concern.improvement}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Product Modal with Theory
const EnhancedProductModal: React.FC<{
  product: Product;
  category: CategoryProducts;
  onClose: () => void;
}> = ({ product, category, onClose }) => {
  const [detailedProduct, setDetailedProduct] = useState<Product | null>(product);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      if (product && product.id) {
        try {
          setIsLoading(true);
          const details = await beautyAPI.getProductDetails(product.id);
          setDetailedProduct(details);
        } catch (error) {
          console.error("Failed to fetch product details", error);
          // Keep initial product data as fallback
          setDetailedProduct(product);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [product]);

  const displayProduct = detailedProduct || product;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-beauty-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-0 left-0 right-0 bg-beauty-charcoal rounded-t-3xl max-h-[85vh] overflow-hidden"
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-beauty-gray-700 rounded-full" />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-beauty-accent"></div>
          </div>
        ) : (
          <div className="px-6 pb-8 overflow-y-auto max-h-[75vh]">
            <h2 className="text-xl font-bold text-white mb-2">{displayProduct.product_name || displayProduct.name}</h2>
            <p className="text-beauty-gray-400 mb-4">{displayProduct.brand} • {displayProduct.size}</p>
            
            <p className="text-2xl font-bold text-beauty-accent mb-6">${displayProduct.price}</p>

            {/* Theory Section */}
            <div className="bg-beauty-dark/50 rounded-xl p-4 mb-6">
              <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                <span className="text-beauty-secondary">💡</span>
                Why this product?
              </h3>
              <p className="text-beauty-gray-300 text-sm leading-relaxed">
                {category.theory}
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-white font-medium mb-2">Key Ingredients</h3>
                <div className="flex flex-wrap gap-2">
                  {(displayProduct.key_ingredients || displayProduct.keyIngredients || []).map((ing: string) => (
                    <span key={ing} className="px-3 py-1 bg-beauty-accent/20 text-beauty-accent rounded-full text-sm">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-white font-medium mb-2">Benefits</h3>
                <ul className="space-y-1">
                  {(displayProduct.benefits || []).map((benefit: string) => (
                    <li key={benefit} className="text-beauty-gray-300 text-sm flex items-start gap-2">
                      <span className="text-beauty-accent mt-0.5">•</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Usage Instructions */}
              {displayProduct.usage && (
                <div>
                  <h3 className="text-white font-medium mb-2">How to Use</h3>
                  <div className="bg-beauty-dark/50 rounded-xl p-4 space-y-2">
                    <p className="text-beauty-gray-300 text-sm">
                      <span className="text-beauty-gray-400">When:</span> {displayProduct.usage.time} • {displayProduct.usage.frequency}
                    </p>
                    <p className="text-beauty-gray-300 text-sm">
                      <span className="text-beauty-gray-400">Amount:</span> {displayProduct.usage.amount}
                    </p>
                    <p className="text-beauty-gray-300 text-sm">
                      <span className="text-beauty-gray-400">Instructions:</span> {displayProduct.usage.instructions}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4">
                <button className="btn-primary py-3">Buy Now</button>
                <button className="btn-secondary py-3">Explore More</button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// Progress Tracker with Feedback
const ProgressTracker: React.FC = () => {
  const [routineData, setRoutineData] = useState<Record<string, boolean>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [progressStats, setProgressStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const today = new Date().toDateString();
  
  // Fetch real progress data from API
  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        setIsLoading(true);
        
        // Get progress timeline from API
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const progressResponse = await beautyAPI.getProgressTimeline(startDate, endDate);
        
        // Transform API data to component format
        const transformedData: Record<string, boolean> = {};
        
        progressResponse.daily_records.forEach((record: any) => {
          if (record.morning) transformedData[`${record.date}-morning`] = true;
          if (record.evening) transformedData[`${record.date}-evening`] = true;
        });
        
        setRoutineData(transformedData);
        setProgressStats(progressResponse.completion_stats);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch progress data:', err);
        // Use fallback data on error
        setProgressStats({
          overall_percentage: 85,
          current_streak: 3,
          longest_streak: 7,
          total_days: 30
        });
        setIsLoading(false);
      }
    };

    fetchProgressData();
  }, []);
  
  const daysUsed = progressStats?.total_days || 7;

  const toggleRoutine = async (type: 'morning' | 'evening') => {
    const key = `${today}-${type}`;
    const newValue = !routineData[key];
    
    // Update local state immediately for better UX
    setRoutineData(prev => ({
      ...prev,
      [key]: newValue
    }));
    
    // Save to API
    try {
      await beautyAPI.saveRoutineCompletion({
        date: new Date().toISOString().split('T')[0],
        routine_type: type,
        completed: newValue,
        products_used: [], // Could be enhanced to track specific products
        notes: ''
      });
    } catch (err) {
      console.error('Failed to save routine completion:', err);
      // Revert local state if API call fails
      setRoutineData(prev => ({
        ...prev,
        [key]: !newValue
    }));
    }
  };

  const submitFeedback = async (improvement: string) => {
    setFeedbackGiven(true);
    setShowFeedback(false);
    
    // Save feedback to API
    try {
      await beautyAPI.submitProgressFeedback({
        days_used: daysUsed,
        overall_satisfaction: improvement,
        skin_improvements: [], // Could be enhanced based on improvement
        routine_adjustments_needed: improvement === 'Needs Adjustment',
        comments: `User reported feeling ${improvement.toLowerCase()} after ${daysUsed} days`
      });
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  };

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toDateString(),
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: date.getDate(),
        isToday: i === 0
      });
    }
    return days;
  };

  const days = getLast7Days();

  return (
    <div className="px-6 py-6">
      {/* Today's Check-in */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Today's Routine</h2>
        <div className="space-y-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => toggleRoutine('morning')}
            className={`w-full p-4 rounded-xl border transition-all ${
              routineData[`${today}-morning`]
                ? 'bg-beauty-accent/20 border-beauty-accent'
                : 'bg-beauty-charcoal border-beauty-gray-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h3 className="font-medium text-white">Morning Routine</h3>
                <p className="text-beauty-gray-400 text-sm">Morning routine</p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                routineData[`${today}-morning`]
                  ? 'bg-beauty-accent border-beauty-accent'
                  : 'border-beauty-gray-600'
              }`}>
                {routineData[`${today}-morning`] && (
                  <svg className="w-4 h-4 text-beauty-black" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => toggleRoutine('evening')}
            className={`w-full p-4 rounded-xl border transition-all ${
              routineData[`${today}-evening`]
                ? 'bg-beauty-accent/20 border-beauty-accent'
                : 'bg-beauty-charcoal border-beauty-gray-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h3 className="font-medium text-white">Evening Routine</h3>
                <p className="text-beauty-gray-400 text-sm">Evening routine</p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                routineData[`${today}-evening`]
                  ? 'bg-beauty-accent border-beauty-accent'
                  : 'border-beauty-gray-600'
              }`}>
                {routineData[`${today}-evening`] && (
                  <svg className="w-4 h-4 text-beauty-black" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">This Week</h2>
        <div className="grid grid-cols-7 gap-2">
          {days.map(day => (
            <div
              key={day.date}
              className={`text-center ${day.isToday ? 'opacity-100' : 'opacity-60'}`}
            >
              <p className="text-beauty-gray-400 text-xs mb-2">{day.dayName}</p>
              <div className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium ${
                day.isToday
                  ? 'bg-beauty-accent text-beauty-black'
                  : 'bg-beauty-charcoal text-beauty-gray-300'
              }`}>
                {day.dayNum}
              </div>
              <div className="mt-2 space-y-1">
                <div className={`h-1 rounded-full ${
                  routineData[`${day.date}-morning`] ? 'bg-beauty-accent' : 'bg-beauty-gray-800'
                }`} />
                <div className={`h-1 rounded-full ${
                  routineData[`${day.date}-evening`] ? 'bg-beauty-secondary' : 'bg-beauty-gray-800'
                }`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback Section - Shows after 7 days */}
      {daysUsed >= 7 && !feedbackGiven && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-gradient-to-r from-beauty-accent/20 to-beauty-secondary/20 rounded-xl border border-beauty-accent/30"
        >
          <h3 className="text-white font-medium mb-2">🎉 7 Days Complete!</h3>
          <p className="text-beauty-gray-300 text-sm mb-3">How's your skin feeling?</p>
          {!showFeedback ? (
            <button
              onClick={() => setShowFeedback(true)}
              className="text-beauty-accent text-sm font-medium"
            >
              Give Feedback →
            </button>
          ) : (
            <div className="space-y-2">
              {['Much Better', 'Slightly Better', 'Same', 'Needs Adjustment'].map((option) => (
                <button
                  key={option}
                  onClick={() => submitFeedback(option)}
                  className="w-full p-2 bg-beauty-charcoal/50 rounded-lg text-left text-beauty-gray-300 hover:bg-beauty-charcoal hover:text-white transition-all"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Stats */}
      <div className="p-4 bg-beauty-charcoal rounded-xl">
        <h3 className="text-white font-medium mb-3">Your Stats</h3>
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin w-6 h-6 border-2 border-beauty-accent border-t-transparent rounded-full"></div>
          </div>
        ) : (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-beauty-gray-400">Current Streak</span>
              <span className="text-beauty-accent font-medium">{progressStats?.current_streak || 0} days</span>
          </div>
          <div className="flex justify-between">
              <span className="text-beauty-gray-400">Overall Progress</span>
              <span className="text-white font-medium">{progressStats?.overall_percentage || 0}% completed</span>
          </div>
          <div className="flex justify-between">
            <span className="text-beauty-gray-400">Best Streak</span>
              <span className="text-beauty-secondary font-medium">{progressStats?.longest_streak || 0} days</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Coming Soon Tab
const ComingSoonTab: React.FC<{ type: string }> = ({ type }) => {
  return (
    <div className="flex-1 flex items-center justify-center px-6">
      <div className="text-center">
        <div className="text-6xl mb-4">🚀</div>
        <h2 className="text-2xl font-bold text-white mb-2">Coming Soon</h2>
        <p className="text-beauty-gray-400">
          {type === 'shop' 
            ? 'Shop your personalized products directly from the app'
            : 'Something amazing is in the works'}
        </p>
      </div>
    </div>
  );
};

export default EnhancedMinimalResults;