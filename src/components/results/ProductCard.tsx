import React from 'react';
import { motion } from 'framer-motion';
import { ProductRecommendation } from '../../types';

interface ProductCardProps {
  recommendation: ProductRecommendation;
  isSelected: boolean;
  onSelect: () => void;
  onViewDetails: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  recommendation,
  isSelected,
  onSelect,
  onViewDetails,
}) => {
  const { product, reason, priority } = recommendation;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`
        product-card cursor-pointer relative
        ${isSelected ? 'border-beauty-accent shadow-lg shadow-beauty-accent/20' : ''}
      `}
    >
      {/* Priority badge */}
      {priority <= 3 && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="w-8 h-8 bg-beauty-accent rounded-full flex items-center justify-center">
            <span className="text-beauty-black font-bold text-sm">#{priority}</span>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        {/* Product image */}
        <div className="w-24 h-24 flex-shrink-0">
          <div className="w-full h-full bg-beauty-gray-800 rounded-lg overflow-hidden">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-4xl">🧴</span>
              </div>
            )}
          </div>
        </div>

        {/* Product info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white truncate">{product.name}</h3>
          <p className="text-sm text-beauty-gray-400">{product.brand}</p>
          
          {/* Price and size */}
          <div className="flex items-center gap-3 mt-1">
            <span className="text-beauty-accent font-semibold">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-xs text-beauty-gray-500">{product.size}</span>
          </div>

          {/* Reason */}
          <p className="text-sm text-beauty-gray-300 mt-2 line-clamp-2">
            {reason}
          </p>

          {/* Key ingredients */}
          {product.keyIngredients.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {product.keyIngredients.slice(0, 3).map((ingredient, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 bg-beauty-gray-800 rounded-full text-beauty-gray-300"
                >
                  {ingredient}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails();
          }}
          className="flex-1 btn-secondary py-2 text-sm"
        >
          View Details
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 btn-primary py-2 text-sm"
        >
          Buy Now
        </motion.button>
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -inset-px rounded-2xl border-2 border-beauty-accent pointer-events-none"
        />
      )}
    </motion.div>
  );
};

export default ProductCard; 