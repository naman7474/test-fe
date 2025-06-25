// src/components/results/ScheduleModal.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Product } from '../../types';

interface ScheduleStep {
  step: number;
  product: string;
  time: string;
  instructions: string;
}

interface ScheduleModalProps {
  type: 'morning' | 'evening';
  onClose: () => void;
  routineProducts?: Product[]; // Real routine data from API
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ type, onClose, routineProducts = [] }) => {
  // Transform API products into schedule steps
  const createStepsFromProducts = (products: Product[], routineType: 'morning' | 'evening'): ScheduleStep[] => {
    if (products.length === 0) {
      // Fallback to basic routine if no products provided
      const fallbackSteps: ScheduleStep[] = [
        {
          step: 1,
          product: 'Cleanser',
          time: '1 min',
          instructions: 'Gently cleanse face with lukewarm water'
        },
        {
          step: 2,
          product: 'Moisturizer',
          time: '30 sec',
          instructions: 'Apply evenly to face and neck'
        }
      ];
      
      if (routineType === 'morning') {
        fallbackSteps.push({
          step: 3,
          product: 'Sunscreen',
          time: '1 min',
          instructions: 'Apply liberally 15 minutes before sun exposure'
        });
      }
      
      return fallbackSteps;
    }

    return products.map((product, index) => ({
      step: index + 1,
      product: product.product_name || product.name,
      time: getEstimatedTime(product.product_type),
      instructions: product.usage?.instructions || `Apply ${product.product_name || product.name} as directed`
    }));
  };

  const getEstimatedTime = (productType: string): string => {
    switch (productType?.toLowerCase()) {
      case 'cleanser':
        return '1 min';
      case 'toner':
        return '30 sec';
      case 'serum':
        return '1 min';
      case 'moisturizer':
        return '30 sec';
      case 'sunscreen':
        return '1 min';
      case 'mask':
        return '10 min';
      default:
        return '30 sec';
    }
  };

  const steps = createStepsFromProducts(routineProducts, type);
  const totalTime = steps.reduce((acc, step) => {
    const minutes = step.time.includes('min') ? parseInt(step.time) : 0.5;
    return acc + minutes;
  }, 0);

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
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-beauty-gray-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 pb-4 border-b border-beauty-gray-800">
          <h2 className="text-xl font-bold text-white capitalize">{type} Routine</h2>
          <p className="text-beauty-gray-400 text-sm mt-1">
            {steps.length} steps • {totalTime} minutes total
          </p>
        </div>

        {/* Steps */}
        <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
          <div className="space-y-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4"
              >
                {/* Step number */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-beauty-accent/20 flex items-center justify-center">
                  <span className="text-beauty-accent font-medium text-sm">{step.step}</span>
                </div>

                {/* Step details */}
                <div className="flex-1">
                  <h3 className="text-white font-medium mb-1">{step.product}</h3>
                  <p className="text-beauty-gray-400 text-sm mb-2">{step.instructions}</p>
                  <p className="text-beauty-gray-500 text-xs">{step.time}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Tips */}
          <div className="mt-8 p-4 bg-beauty-dark/50 rounded-xl">
            <h4 className="text-white font-medium mb-2 text-sm">Pro Tips</h4>
            <ul className="space-y-1 text-beauty-gray-400 text-sm">
              {type === 'morning' ? (
                <>
                  <li>• Wait 1-2 minutes between serum and moisturizer</li>
                  <li>• Don't forget to apply SPF to your neck and ears</li>
                  <li>• Drink water while doing your routine</li>
                </>
              ) : (
                <>
                  <li>• Remove all makeup before starting</li>
                  <li>• Use upward motions when applying products</li>
                  <li>• Give products time to absorb before bed</li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-beauty-gray-800">
          <button
            onClick={onClose}
            className="w-full btn-primary py-3"
          >
            Got it!
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ScheduleModal;