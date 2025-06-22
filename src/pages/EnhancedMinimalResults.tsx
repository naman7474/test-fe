// src/pages/EnhancedMinimalResults.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../types';
import ScheduleModal from '../components/results/ScheduleModal';
import ProfileEditModal from '../components/results/ProfileEditModal';
import InfluencersTab from '../components/results/InfluencersTab';
import { getProfileCompletionPercentage } from '../config/profileSchema';
import useStore from '../store';

interface CategoryProducts {
  category: string;
  color: string;
  bestProduct: Product;
  otherProducts: Product[];
  theory: string;
}

// Enhanced mock data with colors and theory
const mockCategories: CategoryProducts[] = [
  {
    category: 'Cleanser',
    color: 'from-blue-500/20 to-blue-600/20',
    bestProduct: {
      id: '1',
      name: 'Gentle Foam Cleanser',
      brand: 'PureGlow',
      category: 'skincare',
      subcategory: 'cleanser',
      imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',
      price: 24.99,
      size: '150ml',
      ingredients: ['Salicylic Acid', 'Green Tea Extract', 'Aloe Vera'],
      keyIngredients: ['2% Salicylic Acid'],
      benefits: ['Deep cleansing', 'Gentle on skin', 'Removes makeup'],
      targetConcerns: ['oily skin', 'acne'],
      applicationArea: ['face'],
      usage: {
        frequency: 'Daily',
        time: 'both',
        amount: 'Pea-sized',
        instructions: 'Massage onto wet face, rinse thoroughly',
      },
    },
    otherProducts: [],
    theory: 'Your oily, acne-prone skin produces excess sebum that can clog pores. Salicylic acid is a beta-hydroxy acid that penetrates deep into pores to dissolve oil and dead skin cells, preventing acne formation.',
  },
  {
    category: 'Moisturizer',
    color: 'from-purple-500/20 to-purple-600/20',
    bestProduct: {
      id: '2',
      name: 'Hydra-Balance Gel',
      brand: 'AquaDerm',
      category: 'skincare',
      subcategory: 'moisturizer',
      imageUrl: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=400',
      price: 42.00,
      size: '50ml',
      ingredients: ['Hyaluronic Acid', 'Niacinamide', 'Ceramides'],
      keyIngredients: ['Hyaluronic Acid', '5% Niacinamide'],
      benefits: ['Hydration', 'Oil control', 'Barrier repair'],
      targetConcerns: ['dehydration', 'oily skin'],
      applicationArea: ['face', 'neck'],
      usage: {
        frequency: 'Daily',
        time: 'both',
        amount: '2 pumps',
        instructions: 'Apply to clean face and neck',
      },
    },
    otherProducts: [],
    theory: 'Even oily skin needs hydration. This gel formula provides lightweight moisture without clogging pores. Niacinamide helps regulate sebum production while strengthening your skin barrier.',
  },
  {
    category: 'Serum',
    color: 'from-pink-500/20 to-pink-600/20',
    bestProduct: {
      id: '3',
      name: 'Brightening C+ Serum',
      brand: 'GlowLab',
      category: 'skincare',
      subcategory: 'serum',
      imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
      price: 58.00,
      size: '30ml',
      ingredients: ['Vitamin C', 'Vitamin E', 'Ferulic Acid'],
      keyIngredients: ['20% Vitamin C'],
      benefits: ['Brightening', 'Anti-aging', 'Even skin tone'],
      targetConcerns: ['dark spots', 'dullness'],
      applicationArea: ['face'],
      usage: {
        frequency: 'Daily',
        time: 'morning',
        amount: '3-4 drops',
        instructions: 'Apply before moisturizer and SPF',
      },
    },
    otherProducts: [],
    theory: 'Vitamin C is a powerful antioxidant that inhibits melanin production, helping fade dark spots. Combined with your moderate stress levels, this serum will help combat oxidative stress on your skin.',
  },
  {
    category: 'Sunscreen',
    color: 'from-yellow-500/20 to-orange-500/20',
    bestProduct: {
      id: '4',
      name: 'Invisible Shield SPF 50',
      brand: 'SunGuard',
      category: 'skincare',
      subcategory: 'sunscreen',
      imageUrl: 'https://images.unsplash.com/photo-1521223344201-d169129f7b7d?w=400',
      price: 32.00,
      size: '50ml',
      ingredients: ['Zinc Oxide', 'Titanium Dioxide'],
      keyIngredients: ['SPF 50+', 'PA++++'],
      benefits: ['Broad spectrum', 'No white cast', 'Water resistant'],
      targetConcerns: ['sun protection'],
      applicationArea: ['face', 'exposed areas'],
      usage: {
        frequency: 'Daily',
        time: 'morning',
        amount: '2 finger lengths',
        instructions: 'Apply 15 min before sun exposure',
      },
    },
    otherProducts: [],
    theory: 'UV exposure is the primary cause of dark spots and premature aging. With your existing hyperpigmentation concerns, daily SPF is crucial to prevent further damage and allow treatments to work effectively.',
  },
];

// Mock analysis result
const mockAnalysisResult = {
  summary: 'Based on your profile and photo analysis, we detected oily skin with mild acne in the T-zone and some dark spots on your cheeks. Your lifestyle factors (moderate stress, good hydration) are positive for skin health.',
  skinScore: 78,
  concerns: [
    { issue: 'Excess Oil', severity: 'Moderate', improvement: '+15%' },
    { issue: 'Dark Spots', severity: 'Mild', improvement: '+10%' },
    { issue: 'Acne', severity: 'Mild', improvement: '+20%' },
  ],
};

const EnhancedMinimalResults: React.FC = () => {
  const { userProfile } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<CategoryProducts | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleType, setScheduleType] = useState<'morning' | 'evening'>('morning');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  const userName = localStorage.getItem('userName') || 'Beautiful';
  const profileCompletionPercentage = getProfileCompletionPercentage(userProfile);
  const isProfileComplete = profileCompletionPercentage === 100;

  const handleCategoryClick = (category: CategoryProducts) => {
    setSelectedCategory(category);
    setShowProductModal(true);
    setSelectedProduct(category.bestProduct);
  };

  const openSchedule = (type: 'morning' | 'evening') => {
    setScheduleType(type);
    setShowScheduleModal(true);
  };

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
            mockCategories={mockCategories}
            analysisResult={mockAnalysisResult}
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
  mockCategories: CategoryProducts[];
  analysisResult: any;
}> = ({ openSchedule, handleCategoryClick, mockCategories, analysisResult }) => {
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
              <p className="text-beauty-gray-400 text-sm">4 steps • 5 min</p>
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
              <p className="text-beauty-gray-400 text-sm">5 steps • 7 min</p>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Product Recommendations with colors */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Your Products</h2>
        <div className="space-y-3">
          {mockCategories.map((category, index) => (
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

        <div className="px-6 pb-8 overflow-y-auto max-h-[75vh]">
          <h2 className="text-xl font-bold text-white mb-2">{product.name}</h2>
          <p className="text-beauty-gray-400 mb-4">{product.brand} • {product.size}</p>
          
          <p className="text-2xl font-bold text-beauty-accent mb-6">${product.price}</p>

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
                {product.keyIngredients.map((ing) => (
                  <span key={ing} className="px-3 py-1 bg-beauty-accent/20 text-beauty-accent rounded-full text-sm">
                    {ing}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white font-medium mb-2">Benefits</h3>
              <ul className="space-y-1">
                {product.benefits.map((benefit) => (
                  <li key={benefit} className="text-beauty-gray-300 text-sm flex items-start gap-2">
                    <span className="text-beauty-accent mt-0.5">•</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <button className="btn-primary py-3">Buy Now</button>
              <button className="btn-secondary py-3">Explore More</button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Progress Tracker with Feedback
const ProgressTracker: React.FC = () => {
  const [routineData, setRoutineData] = useState<Record<string, boolean>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const today = new Date().toDateString();
  
  // Check if 7 days have passed (for demo, always show)
  const daysUsed = 7; // In real app, calculate from first use date

  const toggleRoutine = (type: 'morning' | 'evening') => {
    const key = `${today}-${type}`;
    setRoutineData(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const submitFeedback = (improvement: string) => {
    setFeedbackGiven(true);
    setShowFeedback(false);
    // Save feedback to backend
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
                <p className="text-beauty-gray-400 text-sm">4 steps</p>
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
                <p className="text-beauty-gray-400 text-sm">5 steps</p>
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
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-beauty-gray-400">Current Streak</span>
            <span className="text-beauty-accent font-medium">3 days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-beauty-gray-400">This Week</span>
            <span className="text-white font-medium">85% completed</span>
          </div>
          <div className="flex justify-between">
            <span className="text-beauty-gray-400">Best Streak</span>
            <span className="text-beauty-secondary font-medium">7 days</span>
          </div>
        </div>
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