import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../../types';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-beauty-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto floating-panel p-6 md:p-8"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-beauty-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Product image */}
          <div className="w-full h-64 bg-beauty-gray-800 rounded-lg mb-6 flex items-center justify-center">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <span className="text-6xl">🧴</span>
            )}
          </div>

          {/* Product info */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-white">{product.name}</h2>
              <p className="text-beauty-gray-400">{product.brand}</p>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-beauty-accent">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-beauty-gray-500">{product.size}</span>
            </div>

            {/* Benefits */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Benefits</h3>
              <ul className="space-y-1">
                {product.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-beauty-accent mt-1">✓</span>
                    <span className="text-beauty-gray-300">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key ingredients */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Key Ingredients</h3>
              <div className="flex flex-wrap gap-2">
                {product.keyIngredients.map((ingredient, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-beauty-accent/20 text-beauty-accent rounded-full text-sm"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>

            {/* Usage instructions */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">How to Use</h3>
              <div className="bg-beauty-gray-900/50 rounded-lg p-4 space-y-2">
                <p className="text-beauty-gray-300">
                  <span className="text-beauty-gray-400">When:</span> {product.usage.time} • {product.usage.frequency}
                </p>
                <p className="text-beauty-gray-300">
                  <span className="text-beauty-gray-400">Amount:</span> {product.usage.amount}
                </p>
                <p className="text-beauty-gray-300">
                  <span className="text-beauty-gray-400">Instructions:</span> {product.usage.instructions}
                </p>
              </div>
            </div>

            {/* Full ingredients */}
            <details className="cursor-pointer">
              <summary className="text-beauty-gray-400 hover:text-white transition-colors">
                View all ingredients
              </summary>
              <p className="mt-2 text-sm text-beauty-gray-300">
                {product.ingredients.join(', ')}
              </p>
            </details>

            {/* Action buttons */}
            <div className="flex gap-4 pt-4">
              <button className="flex-1 btn-primary">
                Buy Now
              </button>
              <button className="flex-1 btn-secondary">
                Add to Cart
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProductDetailModal; 