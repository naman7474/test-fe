// src/pages/MinimalResults.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../types';
import ScheduleModal from '../components/results/ScheduleModal';
import ProfileEditModal from '../components/results/ProfileEditModal';
import { getProfileCompletionPercentage } from '../config/profileSchema';
import useStore from '../store';

interface CategoryProducts {
  category: string;
  bestProduct: Product;
  otherProducts: Product[];
}

// Mock data
const mockCategories: CategoryProducts[] = [
  {
    category: 'Cleanser',
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
  },
  {
    category: 'Moisturizer',
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
  },
  {
    category: 'Serum',
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
  },
  {
    category: 'Sunscreen',
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
  },
];

const MinimalResults: React.FC = () => {
  const { userProfile } = useStore();
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
    setShowProductModal(true);
    setSelectedProduct(category.bestProduct);
  };

  const openSchedule = (type: 'morning' | 'evening') => {
    setScheduleType(type);
    setShowScheduleModal(true);
  };

  if (activeTab === 'progress') {
    return <ProgressTracker onBack={() => setActiveTab('home')} />;
  }

  return (
    <div className="min-h-screen bg-beauty-black">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-beauty-black/80 backdrop-blur-md border-b border-beauty-gray-800">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Hi, {userName}!</h1>
            <p className="text-beauty-gray-400 text-sm">Your personalized routine</p>
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
      <main className="px-6 py-6 pb-20">
        {/* Routine Overview */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Daily Routine</h2>
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openSchedule('morning')}
              className="p-4 bg-beauty-charcoal rounded-xl border border-beauty-gray-800"
            >
              <h3 className="font-medium text-white mb-1">Morning</h3>
              <p className="text-beauty-gray-400 text-sm">4 steps</p>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openSchedule('evening')}
              className="p-4 bg-beauty-charcoal rounded-xl border border-beauty-gray-800"
            >
              <h3 className="font-medium text-white mb-1">Evening</h3>
              <p className="text-beauty-gray-400 text-sm">5 steps</p>
            </motion.button>
          </div>
        </div>

        {/* Product Recommendations */}
        <div>
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
                className="bg-beauty-charcoal border border-beauty-gray-800 p-4 rounded-xl cursor-pointer"
              >
                <div className="flex items-center justify-between">
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
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-beauty-black/80 backdrop-blur-md border-t border-beauty-gray-800">
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
            className="flex flex-col items-center gap-1 py-2 text-beauty-gray-500 relative"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="text-xs">Shop</span>
            <span className="absolute -top-1 right-2 text-[8px] bg-beauty-accent text-beauty-black px-1 rounded">Soon</span>
          </button>
          <button
            className="flex flex-col items-center gap-1 py-2 text-beauty-gray-500 relative"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-xs">Influencers</span>
            <span className="absolute -top-1 right-0 text-[8px] bg-beauty-accent text-beauty-black px-1 rounded">Soon</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showProductModal && selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => {
              setShowProductModal(false);
              setSelectedProduct(null);
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

// Progress Tracker Component
const ProgressTracker: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [routineData, setRoutineData] = useState<Record<string, boolean>>({});
  const today = new Date().toDateString();

  const toggleRoutine = (type: 'morning' | 'evening') => {
    const key = `${today}-${type}`;
    setRoutineData(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Get last 7 days
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
    <div className="min-h-screen bg-beauty-black">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-beauty-black/80 backdrop-blur-md border-b border-beauty-gray-800">
        <div className="px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="text-beauty-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-white">Your Progress</h1>
        </div>
      </header>

      <main className="px-6 py-6">
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
        <div>
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

        {/* Stats */}
        <div className="mt-8 p-4 bg-beauty-charcoal rounded-xl">
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
      </main>
    </div>
  );
};

// Simplified Product Modal
const ProductModal: React.FC<{
  product: Product;
  onClose: () => void;
}> = ({ product, onClose }) => {
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

export default MinimalResults;