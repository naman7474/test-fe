import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import useStore from '../store';
import ScrollBasedForm from '../components/onboarding/ScrollBasedForm';
import PhotoUpload from '../components/landing/PhotoUpload';
import { FormStep, FormStepInfo } from '../types';
import beautyAPI from '../services/api';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentStep, setCurrentStep, markStepComplete, setLoading, photoPreview, userProfile, setUserStatus } = useStore();
  const [isValid, setIsValid] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if we should jump to photo step (from login redirect)
  React.useEffect(() => {
    if (location.state?.step === 'photo') {
      setCurrentStep('photo');
    }
  }, [location.state, setCurrentStep]);

  const formSteps: FormStepInfo[] = [
    { step: 'skin', title: 'Skin Profile', description: 'Help us understand your skin', icon: '🧴' },
    { step: 'lifestyle', title: 'Lifestyle', description: 'Your daily habits matter', icon: '🌿' },
    { step: 'preferences', title: 'Preferences', description: 'Your budget and preferences', icon: '💰' },
    { step: 'photo', title: 'Upload Photo', description: 'Take a selfie for analysis', icon: '📸' },
  ];

  const currentStepIndex = formSteps.findIndex(s => s.step === currentStep);
  const currentStepInfo = formSteps[currentStepIndex];
  const isLastStep = currentStepIndex === formSteps.length - 1;

  const handleNext = async () => {
    markStepComplete(currentStep);
    setError(null);

    if (currentStep === 'photo' && photoPreview) {
      // Submit profile data before proceeding to analysis
      setLoading(true, 'Saving your profile...');
      
      try {
        await beautyAPI.submitProfile(userProfile);
        
        // Mark onboarding as complete
        setUserStatus(true, false);
        
        setLoading(true, 'Preparing your photo for analysis...');
        navigate('/analysis');
      } catch (error) {
        console.error('Failed to save profile:', error);
        setError('Failed to save profile. Please try again.');
        setLoading(false);
        return;
      }
    } else if (isLastStep) {
      // If no photo was uploaded, still submit profile and navigate to results
      setLoading(true, 'Saving your profile...');
      
      try {
        await beautyAPI.submitProfile(userProfile);
        setLoading(true, 'Generating recommendations based on your profile...');
        
        // Mark onboarding as complete (without photo)
        setUserStatus(true, false);
        
        // Check onboarding status after profile submission
        const onboardingStatus = await beautyAPI.getOnboardingProgress();
        
        if (onboardingStatus.steps.recommendations.generated) {
          setUserStatus(true, true);
          navigate('/results');
        } else {
          // If recommendations aren't generated yet, wait a bit
          setTimeout(async () => {
            try {
              const status = await beautyAPI.getOnboardingProgress();
              if (status.steps.recommendations.generated) {
                setUserStatus(true, true);
              }
              navigate('/results');
            } catch (error) {
              console.error('Failed to check recommendation status:', error);
              navigate('/results');
            }
          }, 2000);
        }
      } catch (error) {
        console.error('Failed to save profile:', error);
        setError('Failed to save profile. Please try again.');
        setLoading(false);
        return;
      }
    } else {
      // Animate transition to next step
      setIsTransitioning(true);
      setTimeout(() => {
        const nextStep = formSteps[currentStepIndex + 1];
        setCurrentStep(nextStep.step);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        const prevStep = formSteps[currentStepIndex - 1];
        setCurrentStep(prevStep.step);
        setIsTransitioning(false);
      }, 300);
    } else {
      navigate('/');
    }
  };

  const renderFormStep = () => {
    switch (currentStep) {
      case 'skin':
      case 'lifestyle':
      case 'preferences':
        return (
          <ScrollBasedForm 
            step={currentStep} 
            onValidChange={setIsValid} 
            onlyRequired={true}
          />
        );
      case 'photo':
        return <PhotoUploadStep onValidChange={setIsValid} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-beauty-black relative">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-beauty-black/80 backdrop-blur-sm border-b border-beauty-gray-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="text-beauty-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="text-center">
              <h1 className="text-lg font-semibold text-white">{currentStepInfo.title}</h1>
              <p className="text-xs text-beauty-gray-400">{currentStepInfo.description}</p>
            </div>
            
            <button
              onClick={() => navigate('/')}
              className="text-beauty-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Step indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {formSteps.map((step, index) => (
              <div
                key={step.step}
                className={`h-1 rounded-full transition-all ${
                  index <= currentStepIndex 
                    ? 'w-8 bg-beauty-accent' 
                    : 'w-8 bg-beauty-gray-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-24 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: isTransitioning ? 100 : 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isTransitioning ? -100 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderFormStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-beauty-black/80 backdrop-blur-sm border-t border-beauty-gray-800">
        <div className="px-6 py-4">
          <button
            onClick={handleNext}
            disabled={!isValid && currentStep !== 'photo'}
            className={`w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              isValid || currentStep === 'photo'
                ? 'bg-gradient-to-r from-beauty-accent to-beauty-secondary text-white hover:shadow-lg hover:shadow-beauty-accent/25'
                : 'bg-beauty-gray-800 text-beauty-gray-500 cursor-not-allowed'
            }`}
          >
            <span>{isLastStep ? 'Complete' : 'Continue'}</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Photo upload step component
const PhotoUploadStep: React.FC<{ onValidChange: (valid: boolean) => void }> = ({ onValidChange }) => {
  const { photoPreview } = useStore();
  
  React.useEffect(() => {
    // Photo step is always valid (optional step)
    onValidChange(true);
  }, [onValidChange]);

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl mb-4"
          >
            📸
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">Let's see that beautiful face!</h2>
          <p className="text-beauty-gray-400">
            Upload a clear selfie for personalized skin analysis
          </p>
          {photoPreview && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm mt-4"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Photo uploaded successfully!
            </motion.div>
          )}
        </div>
        
        <PhotoUpload />
        
        {!photoPreview && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-beauty-gray-500 text-sm mt-6"
          >
            No photo? No problem! We'll use your profile answers to make great recommendations.
          </motion.p>
        )}
      </div>
    </div>
  );
};

export default Onboarding; 