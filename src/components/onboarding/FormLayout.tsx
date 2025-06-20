import React from 'react';
import { motion } from 'framer-motion';
import { FormStepInfo } from '../../types';
import ProgressIndicator from '../common/ProgressIndicator';
import useStore from '../../store';

interface FormLayoutProps {
  children: React.ReactNode;
  stepInfo: FormStepInfo;
  onNext: () => void;
  onBack?: () => void;
  isValid: boolean;
  isLastStep?: boolean;
}

const FormLayout: React.FC<FormLayoutProps> = ({
  children,
  stepInfo,
  onNext,
  onBack,
  isValid,
  isLastStep = false,
}) => {
  const { currentStep, completedSteps } = useStore();

  const formSteps: FormStepInfo[] = [
    { step: 'skin', title: 'Skin Profile', description: 'Tell us about your skin', icon: '🧴' },
    { step: 'hair', title: 'Hair Profile', description: 'Your hair care needs', icon: '💇‍♀️' },
    { step: 'lifestyle', title: 'Lifestyle', description: 'Your daily habits', icon: '🌿' },
    { step: 'health', title: 'Health', description: 'Medical considerations', icon: '🏥' },
    { step: 'makeup', title: 'Makeup', description: 'Your preferences', icon: '💄' },
  ];

  return (
    <div className="min-h-screen bg-beauty-black">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-beauty-black/80 backdrop-blur-md border-b border-beauty-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-display font-bold text-gradient">BeautyAI</h1>
            <button className="text-beauty-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Progress indicator */}
      <ProgressIndicator
        steps={formSteps}
        currentStep={currentStep}
        completedSteps={completedSteps}
      />

      {/* Form content */}
      <main className="max-w-4xl mx-auto px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="floating-panel p-6 md:p-8"
        >
          {/* Step header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center justify-center w-16 h-16 mb-4 text-3xl"
            >
              {stepInfo.icon}
            </motion.div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
              {stepInfo.title}
            </h2>
            <p className="text-beauty-gray-400">{stepInfo.description}</p>
          </div>

          {/* Form fields */}
          <div className="space-y-6">{children}</div>

          {/* Form actions */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-beauty-gray-800">
            {onBack ? (
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-beauty-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
            ) : (
              <div />
            )}

            <motion.button
              onClick={onNext}
              disabled={!isValid}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                btn-primary flex items-center gap-2
                ${!isValid ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {isLastStep ? (
                <>
                  See My Results
                  <span className="text-lg">🎉</span>
                </>
              ) : (
                <>
                  Next
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Help text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6 text-beauty-gray-500 text-sm"
        >
          🔒 Your information is secure and will only be used for personalized recommendations
        </motion.p>
      </main>
    </div>
  );
};

export default FormLayout; 