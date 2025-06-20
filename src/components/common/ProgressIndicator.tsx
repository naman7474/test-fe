import React from 'react';
import { motion } from 'framer-motion';
import { FormStep, FormStepInfo } from '../../types';

interface ProgressIndicatorProps {
  steps: FormStepInfo[];
  currentStep: FormStep;
  completedSteps: FormStep[];
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  completedSteps,
}) => {
  const currentStepIndex = steps.findIndex((s) => s.step === currentStep);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* Mobile view - simple step counter */}
      <div className="md:hidden text-center">
        <p className="text-beauty-gray-400 text-sm">
          Step {currentStepIndex + 1} of {steps.length}
        </p>
        <p className="text-white font-medium mt-1">
          {steps[currentStepIndex]?.title}
        </p>
      </div>

      {/* Desktop view - full progress bar */}
      <div className="hidden md:block">
        <div className="relative">
          {/* Progress line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-beauty-gray-800">
            <motion.div
              className="h-full bg-beauty-accent"
              initial={{ width: 0 }}
              animate={{
                width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
              }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.step);
              const isCurrent = step.step === currentStep;
              const isPast = index < currentStepIndex;

              return (
                <div
                  key={step.step}
                  className="flex flex-col items-center"
                  style={{ width: `${100 / steps.length}%` }}
                >
                  {/* Step circle */}
                  <motion.div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      border-2 transition-all duration-300
                      ${
                        isCompleted || isPast
                          ? 'bg-beauty-accent border-beauty-accent'
                          : isCurrent
                          ? 'bg-transparent border-beauty-accent'
                          : 'bg-beauty-gray-800 border-beauty-gray-700'
                      }
                    `}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isCompleted || isPast ? (
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 text-beauty-black"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </motion.svg>
                    ) : (
                      <span
                        className={`text-sm font-semibold ${
                          isCurrent ? 'text-beauty-accent' : 'text-beauty-gray-500'
                        }`}
                      >
                        {index + 1}
                      </span>
                    )}
                  </motion.div>

                  {/* Step label */}
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`
                      mt-2 text-xs font-medium
                      ${
                        isCurrent
                          ? 'text-white'
                          : isPast || isCompleted
                          ? 'text-beauty-accent'
                          : 'text-beauty-gray-500'
                      }
                    `}
                  >
                    {step.title}
                  </motion.p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator; 