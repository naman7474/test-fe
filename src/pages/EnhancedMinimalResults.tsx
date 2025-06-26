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
  const [profileCompletionPercentage, setProfileCompletionPercentage] = useState(0);

  const userName = localStorage.getItem('userName') || 'Beautiful';
  const isProfileComplete = profileCompletionPercentage === 100;

  // Fetch profile completion from API
  useEffect(() => {
    const fetchProfileCompletion = async () => {
      try {
        const onboardingData = await beautyAPI.getOnboardingProgress();
        setProfileCompletionPercentage(onboardingData.steps.profile.percentage);
      } catch (err) {
        console.error('Failed to fetch profile completion:', err);
        // Fallback to local calculation if API fails
        setProfileCompletionPercentage(0);
      }
    };

    fetchProfileCompletion();
  }, []);

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
  }, [navigate]); // Remove analysisResult and setAnalysisResult to prevent infinite loops

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
        {showProductModal && selectedProduct && (
          <EnhancedProductModal
            product={selectedProduct}
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
                  <h3 className="text-white font-medium">{category.bestProduct.product_name || category.bestProduct.name}</h3>
                  <p className="text-beauty-gray-500 text-sm mt-1">{category.bestProduct.brand}</p>
                  {/* Show key ingredients if available */}
                  {(category.bestProduct.key_ingredients || category.bestProduct.keyIngredients)?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(category.bestProduct.key_ingredients || category.bestProduct.keyIngredients).slice(0, 2).map((ingredient: string, idx: number) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-beauty-accent/20 text-beauty-accent rounded-full">
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-beauty-accent font-semibold">${category.bestProduct.price?.toFixed(2) || 'N/A'}</p>
                  <p className="text-xs text-beauty-gray-500 mt-1">{Math.round(category.bestProduct.match_score || category.bestProduct.matchScore || 95)}% match</p>
                  {category.bestProduct.rating && category.bestProduct.rating > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-beauty-gray-500">★ {category.bestProduct.rating.toFixed(1)}</span>
                      {category.bestProduct.reviews && category.bestProduct.reviews > 0 && (
                        <span className="text-xs text-beauty-gray-600">({category.bestProduct.reviews})</span>
                      )}
                    </div>
                  )}
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

// Enhanced Product Modal with real product data and expected results
const EnhancedProductModal = ({ product, onClose }: { product: any; onClose: () => void }) => {
  const [productDetails, setProductDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!product?.product_id) {
        setError('Product ID not available');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('Fetching product details for ID:', product.product_id);
        const details = await beautyAPI.getProductDetails(product.product_id);
        console.log('Product details fetched:', details);
        setProductDetails(details);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [product?.product_id]);

  const displayProduct = productDetails || product;

  // Generate expected results based on product type and ingredients
  const getExpectedResults = () => {
    const productType = displayProduct.product_type?.toLowerCase();
    const ingredients = displayProduct.key_ingredients || displayProduct.keyIngredients || [];
    const concerns = displayProduct.recommendation_reason?.toLowerCase() || '';
    
    const results = [];
    
    // Results based on product type
    switch (productType) {
      case 'cleanser':
        results.push('Cleaner, clearer skin');
        results.push('Reduced excess oil');
        if (concerns.includes('acne')) results.push('Fewer breakouts');
        break;
      case 'serum':
        if (ingredients.some((ing: string) => ing.toLowerCase().includes('niacinamide'))) {
          results.push('Smaller-looking pore appearance');
          results.push('Balanced oil production');
        }
        if (ingredients.some((ing: string) => ing.toLowerCase().includes('vitamin c'))) {
          results.push('Brighter, more radiant skin');
          results.push('Reduced dark spots');
        }
        if (ingredients.some((ing: string) => ing.toLowerCase().includes('hyaluronic'))) {
          results.push('Improved skin hydration');
          results.push('Plumper, smoother skin');
        }
        break;
      case 'moisturizer':
        results.push('Softer, smoother skin');
        results.push('Improved skin barrier');
        if (ingredients.some((ing: string) => ing.toLowerCase().includes('retinol'))) {
          results.push('Reduced fine lines');
          results.push('Improved skin texture');
        }
        break;
      case 'sunscreen':
        results.push('Protection from UV damage');
        results.push('Prevention of premature aging');
        results.push('Reduced risk of dark spots');
        break;
      case 'mask':
        results.push('Deep cleansing');
        results.push('Smoother skin texture');
        if (concerns.includes('oil')) results.push('Reduced oiliness');
        break;
      default:
        results.push('Improved skin health');
        results.push('Enhanced skincare routine');
    }
    
    // Add timeline
    return {
      immediate: results.slice(0, 2),
      short_term: results.slice(2, 4).length > 0 ? results.slice(2, 4) : ['Improved skin texture', 'Enhanced skin appearance'],
      long_term: ['Healthier, more balanced skin', 'Sustained skin improvement']
    };
  };

  const expectedResults = getExpectedResults();
  
  // Parse images if they're in string format
  const getProductImages = () => {
    if (productDetails?.images) {
      try {
        const images = typeof productDetails.images === 'string' 
          ? JSON.parse(productDetails.images) 
          : productDetails.images;
        return Array.isArray(images) ? images : [images];
      } catch {
        return [];
      }
    }
    return displayProduct?.image_url ? [displayProduct.image_url] : [];
  };

  const productImages = getProductImages();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-beauty-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-beauty-gray-700">
          <h3 className="text-lg font-semibold text-white">Product Details</h3>
          <button
            onClick={onClose}
            className="text-beauty-gray-400 hover:text-white transition-colors"
          >
                         ✕
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-beauty-accent"></div>
            <span className="ml-3 text-white">Loading product details...</span>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="text-red-400 mb-4">{error}</div>
            <div className="text-white">
              <h2 className="text-xl font-bold mb-2">{product.product_name}</h2>
              <p className="text-beauty-gray-400 mb-4">{product.brand} • {product.product_type}</p>
              <p className="text-2xl font-bold text-beauty-accent mb-6">₹{product.price?.toFixed(2) || 'Price not available'}</p>
              
              {product.key_ingredients?.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-white font-medium mb-3">Key Ingredients</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.key_ingredients.map((ingredient: string, idx: number) => (
                      <span key={idx} className="bg-beauty-gray-800 text-beauty-gray-300 px-3 py-1 rounded-full text-sm">
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {product.recommendation_reason && (
                <div className="mb-4">
                  <h4 className="text-white font-medium mb-2">Why This Product?</h4>
                  <p className="text-beauty-gray-300">{product.recommendation_reason}</p>
                </div>
              )}
              
              {product.usage_instructions && (
                <div className="mb-4">
                  <h4 className="text-white font-medium mb-2">How to Use</h4>
                  <p className="text-beauty-gray-300">{product.usage_instructions}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[85vh]">
            {/* Product Images - Top Section with Horizontal Scroll */}
            {productImages.length > 0 && (
              <div className="relative bg-beauty-gray-800">
                                  <div className="overflow-x-auto no-scrollbar">
                  <div className="flex gap-2 p-4" style={{ width: `${productImages.length * 280}px` }}>
                    {productImages.map((imageUrl: string, idx: number) => (
                      <div key={idx} className="flex-shrink-0 w-64 h-64 bg-beauty-gray-700 rounded-lg overflow-hidden">
                        <img 
                          src={imageUrl} 
                          alt={`${displayProduct.product_name} ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Scroll indicator */}
                {productImages.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {productImages.length} photos
                  </div>
                )}
              </div>
            )}

            {/* Product Info Section */}
            <div className="px-6 py-6">
              <h2 className="text-xl font-bold text-white mb-2">{displayProduct.product_name}</h2>
              <p className="text-beauty-gray-400 mb-4">
                {displayProduct.brand_name || displayProduct.brand} 
                {displayProduct.size_qty && ` • ${displayProduct.size_qty}`}
              </p>
              
              {/* Price display */}
              <div className="mb-6">
                {productDetails?.price_sale ? (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-beauty-accent">₹{productDetails.price_sale.toFixed(2)}</span>
                    {productDetails.price_mrp && productDetails.price_mrp !== productDetails.price_sale && (
                      <span className="text-lg text-beauty-gray-500 line-through">₹{productDetails.price_mrp.toFixed(2)}</span>
                    )}
                  </div>
                ) : (
                  <span className="text-2xl font-bold text-beauty-accent">₹{displayProduct.price?.toFixed(2) || 'Price not available'}</span>
                )}
              </div>

              {/* Buy Now Button */}
              {(productDetails?.source_url || displayProduct.source_url) && (
                <div className="mb-6">
                  <button
                    onClick={() => {
                      const url = productDetails?.source_url || displayProduct.source_url;
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                    className="w-full bg-beauty-accent hover:bg-beauty-accent/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <span>Buy Now</span>
                    <span className="text-sm">→</span>
                  </button>
                </div>
              )}

              {/* Why This Product is Recommended - Highlighted Section */}
              {displayProduct.recommendation_reason && (
                <div className="mb-6">
                  <div className="bg-gradient-to-r from-beauty-accent/10 to-beauty-secondary/10 border border-beauty-accent/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-8 h-8 bg-beauty-accent/20 rounded-full flex items-center justify-center">
                          <span className="text-beauty-accent text-lg">💡</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-beauty-accent font-semibold mb-2 text-lg">Why This Product is Perfect for You</h4>
                        <p className="text-white leading-relaxed">{displayProduct.recommendation_reason}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Expected Results Section */}
              <div className="mb-6">
                <div className="bg-gradient-to-r from-beauty-secondary/10 to-purple-500/10 border border-beauty-secondary/20 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-8 h-8 bg-beauty-secondary/20 rounded-full flex items-center justify-center">
                        <span className="text-beauty-secondary text-lg">✨</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-beauty-secondary font-semibold mb-3 text-lg">Expected Results</h4>
                      
                      <div className="space-y-4">
                        {/* Immediate Results */}
                        <div>
                          <h5 className="text-white font-medium mb-2 text-sm">Immediate (1-3 days)</h5>
                          <div className="space-y-1">
                            {expectedResults.immediate.map((result: string, idx: number) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span className="text-beauty-secondary text-xs">●</span>
                                <span className="text-beauty-gray-300 text-sm">{result}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Short-term Results */}
                        <div>
                          <h5 className="text-white font-medium mb-2 text-sm">Short-term (1-2 weeks)</h5>
                          <div className="space-y-1">
                            {expectedResults.short_term.map((result: string, idx: number) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span className="text-beauty-secondary text-xs">●</span>
                                <span className="text-beauty-gray-300 text-sm">{result}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Long-term Results */}
                        <div>
                          <h5 className="text-white font-medium mb-2 text-sm">Long-term (4-8 weeks)</h5>
                          <div className="space-y-1">
                            {expectedResults.long_term.map((result: string, idx: number) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span className="text-beauty-secondary text-xs">●</span>
                                <span className="text-beauty-gray-300 text-sm">{result}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-beauty-gray-500 text-xs mt-4 italic">
                        Results may vary based on individual skin type and consistency of use
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Description */}
              {productDetails?.description_html && (
                <div className="mb-6">
                  <h4 className="text-white font-medium mb-3">About This Product</h4>
                  <div 
                    className="text-beauty-gray-300 leading-relaxed bg-beauty-gray-900/30 rounded-lg p-4"
                    dangerouslySetInnerHTML={{ __html: productDetails.description_html }}
                  />
                </div>
              )}

              {/* Benefits */}
              {productDetails?.benefits_extracted?.benefits_list?.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-white font-medium mb-3">Benefits</h4>
                  <div className="space-y-2">
                    {productDetails.benefits_extracted.benefits_list.map((benefit: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                        <span className="text-beauty-gray-300">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Ingredients */}
              {(productDetails?.ingredients_extracted?.ingredients_list || displayProduct.key_ingredients)?.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-white font-medium mb-3">Key Ingredients</h4>
                  <div className="flex flex-wrap gap-2">
                    {(productDetails?.ingredients_extracted?.ingredients_list || displayProduct.key_ingredients || []).map((ingredient: string, idx: number) => (
                      <span key={idx} className="bg-beauty-gray-800 text-beauty-gray-300 px-3 py-1 rounded-full text-sm">
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Ingredients */}
              {productDetails?.ingredients_raw && (
                <div className="mb-6">
                  <h4 className="text-white font-medium mb-3">Full Ingredients</h4>
                  <p className="text-beauty-gray-300 text-sm leading-relaxed">
                    {productDetails.ingredients_raw}
                  </p>
                </div>
              )}

              {/* Usage Instructions */}
              {(productDetails?.usage_instructions || displayProduct.usage_instructions) && (
                <div className="mb-6">
                  <h4 className="text-white font-medium mb-3">How to Use</h4>
                  <p className="text-beauty-gray-300">
                    {productDetails?.usage_instructions || displayProduct.usage_instructions}
                  </p>
                </div>
              )}

              

              {/* Ratings */}
              {(productDetails?.average_rating > 0 || productDetails?.review_count > 0) && (
                <div className="mb-6">
                  <h4 className="text-white font-medium mb-3">Ratings & Reviews</h4>
                  <div className="flex items-center gap-4">
                    {productDetails.average_rating > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400">★</span>
                        <span className="text-white">{productDetails.average_rating.toFixed(1)}</span>
                      </div>
                    )}
                    {productDetails.review_count > 0 && (
                      <span className="text-beauty-gray-400">({productDetails.review_count} reviews)</span>
                    )}
                  </div>
                </div>
              )}

              {/* Match Score */}
              {displayProduct.match_score && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">Match Score</span>
                    <span className="text-beauty-accent font-bold">{displayProduct.match_score}%</span>
                  </div>
                  <div className="w-full bg-beauty-gray-700 rounded-full h-2">
                    <div 
                      className="bg-beauty-accent h-2 rounded-full transition-all duration-300"
                      style={{ width: `${displayProduct.match_score}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
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