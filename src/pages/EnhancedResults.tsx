// src/pages/EnhancedResults.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store';
import { Product } from '../types';

interface CategoryProducts {
  category: string;
  icon: string;
  color: string;
  bestProduct: Product;
  otherProducts: Product[];
}

// Mock data for demonstration
const mockCategories: CategoryProducts[] = [
  {
    category: 'Cleansers',
    icon: '🧼',
    color: 'from-blue-400 to-blue-600',
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
    otherProducts: [
      // Additional cleansers...
    ],
  },
  {
    category: 'Moisturizers',
    icon: '💧',
    color: 'from-purple-400 to-purple-600',
    bestProduct: {
      id: '2',
      name: 'Hydra-Balance Gel Cream',
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
    category: 'Serums',
    icon: '✨',
    color: 'from-pink-400 to-pink-600',
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
    icon: '☀️',
    color: 'from-yellow-400 to-orange-500',
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

const EnhancedResults: React.FC = () => {
  const { userProfile } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<CategoryProducts | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleCategoryClick = (category: CategoryProducts) => {
    setSelectedCategory(category);
    setShowProductModal(true);
    setSelectedProduct(category.bestProduct);
  };

  return (
    <div className="min-h-screen bg-beauty-black">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-beauty-black/80 backdrop-blur-md border-b border-beauty-gray-800">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Hi, {userProfile.name || 'Beautiful'}!</h1>
            <p className="text-beauty-gray-400 text-sm">Your personalized routine</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full bg-beauty-charcoal">
              <span className="text-xl">🔔</span>
            </button>
            <button className="p-2 rounded-full bg-beauty-charcoal">
              <span className="text-xl">⚙️</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6 pb-20">
        {/* Daily Tip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-gradient-to-r from-beauty-accent/20 to-beauty-secondary/20 rounded-2xl border border-beauty-accent/30"
        >
          <h3 className="text-lg font-semibold text-white mb-2">💡 Today's Tip</h3>
          <p className="text-beauty-gray-300 text-sm">
            Based on your oily skin type, try double cleansing in the evening to remove excess sebum and maintain clear pores.
          </p>
        </motion.div>

        {/* Routine Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Your Routine</h2>
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 bg-beauty-charcoal rounded-2xl border border-beauty-gray-800"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🌅</span>
                <h3 className="font-semibold text-white">Morning</h3>
              </div>
              <p className="text-beauty-gray-400 text-sm">4 steps • 10 min</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 bg-beauty-charcoal rounded-2xl border border-beauty-gray-800"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🌙</span>
                <h3 className="font-semibold text-white">Evening</h3>
              </div>
              <p className="text-beauty-gray-400 text-sm">5 steps • 15 min</p>
            </motion.div>
          </div>
        </div>

        {/* Product Categories */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Recommended Products</h2>
          <div className="space-y-4">
            {mockCategories.map((category, index) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCategoryClick(category)}
                className="relative overflow-hidden rounded-2xl bg-beauty-charcoal border border-beauty-gray-800 p-4 cursor-pointer"
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-10`} />
                
                <div className="relative flex items-center gap-4">
                  {/* Category icon */}
                  <div className="text-4xl">{category.icon}</div>
                  
                  {/* Category info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">{category.category}</h3>
                    <p className="text-sm text-beauty-gray-400 mb-2">{category.bestProduct.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-beauty-accent font-semibold">${category.bestProduct.price}</span>
                      <span className="text-beauty-gray-500 text-sm">• {category.bestProduct.brand}</span>
                    </div>
                  </div>

                  {/* Match score */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-beauty-accent">95%</div>
                    <p className="text-xs text-beauty-gray-400">match</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Skin Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-4 bg-beauty-charcoal rounded-2xl"
        >
          <h3 className="text-lg font-semibold text-white mb-3">Skin Progress</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-beauty-gray-400">Hydration</span>
                <span className="text-beauty-accent">75%</span>
              </div>
              <div className="h-2 bg-beauty-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '75%' }}
                  transition={{ duration: 1, delay: 0.7 }}
                  className="h-full bg-gradient-to-r from-beauty-accent to-beauty-secondary"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-beauty-gray-400">Oil Control</span>
                <span className="text-beauty-accent">60%</span>
              </div>
              <div className="h-2 bg-beauty-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '60%' }}
                  transition={{ duration: 1, delay: 0.9 }}
                  className="h-full bg-gradient-to-r from-beauty-accent to-beauty-secondary"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-beauty-black/80 backdrop-blur-md border-t border-beauty-gray-800">
        <div className="grid grid-cols-4 py-2">
          {[
            { icon: '🏠', label: 'Home', active: true },
            { icon: '📊', label: 'Progress' },
            { icon: '🛍️', label: 'Shop' },
            { icon: '👤', label: 'Profile' },
          ].map((item) => (
            <button
              key={item.label}
              className={`flex flex-col items-center gap-1 py-2 ${
                item.active ? 'text-beauty-accent' : 'text-beauty-gray-500'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {showProductModal && selectedProduct && (
          <ProductModal
            product={selectedProduct}
            category={selectedCategory}
            onClose={() => {
              setShowProductModal(false);
              setSelectedProduct(null);
            }}
            onExploreMore={() => {
              // Handle explore more
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Product Modal Component
const ProductModal: React.FC<{
  product: Product;
  category: CategoryProducts | null;
  onClose: () => void;
  onExploreMore: () => void;
}> = ({ product, category, onClose, onExploreMore }) => {
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
        className="absolute bottom-0 left-0 right-0 bg-beauty-charcoal rounded-t-3xl max-h-[90vh] overflow-hidden"
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-beauty-gray-700 rounded-full" />
        </div>

        {/* Modal content */}
        <div className="px-6 pb-8 overflow-y-auto max-h-[80vh]">
          {/* Product image */}
          <div className="relative h-64 bg-beauty-gray-800 rounded-2xl mb-6 overflow-hidden">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-6xl">{category?.icon || '🧴'}</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-beauty-black/60 backdrop-blur-sm rounded-full"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Product info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{product.name}</h2>
              <p className="text-beauty-gray-400">{product.brand} • {product.size}</p>
              <p className="text-3xl font-bold text-beauty-accent mt-3">${product.price}</p>
            </div>

            {/* Key ingredients */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Key Ingredients</h3>
              <div className="flex flex-wrap gap-2">
                {product.keyIngredients.map((ingredient) => (
                  <span
                    key={ingredient}
                    className="px-3 py-1 bg-beauty-accent/20 text-beauty-accent rounded-full text-sm"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Benefits</h3>
              <ul className="space-y-2">
                {product.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2 text-beauty-gray-300">
                    <span className="text-beauty-accent mt-0.5">✓</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Full ingredients */}
            <details className="cursor-pointer">
              <summary className="text-beauty-gray-400 hover:text-white transition-colors font-medium">
                View all ingredients
              </summary>
              <p className="mt-2 text-sm text-beauty-gray-300">
                {product.ingredients.join(', ')}
              </p>
            </details>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary py-3"
              >
                Buy Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onExploreMore}
                className="btn-secondary py-3"
              >
                Explore More
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EnhancedResults;