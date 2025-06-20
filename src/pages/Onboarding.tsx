import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import useStore from '../store';
import FormLayout from '../components/onboarding/FormLayout';
import SkinProfileForm from '../components/onboarding/SkinProfileForm';
import PhotoUpload from '../components/landing/PhotoUpload';
import { FormStep, FormStepInfo } from '../types';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { currentStep, setCurrentStep, markStepComplete, setLoading, photoPreview } = useStore();
  const [isValid, setIsValid] = useState(false);

  const formSteps: FormStepInfo[] = [
    { step: 'skin', title: 'Skin Profile', description: 'Help us understand your skin', icon: '🧴' },
    { step: 'hair', title: 'Hair Profile', description: 'Tell us about your hair', icon: '💇‍♀️' },
    { step: 'lifestyle', title: 'Lifestyle', description: 'Your daily habits matter', icon: '🌿' },
    { step: 'health', title: 'Health', description: 'Any medical considerations?', icon: '🏥' },
    { step: 'makeup', title: 'Makeup', description: 'Your beauty preferences', icon: '💄' },
    { step: 'photo', title: 'Upload Photo', description: 'Take a selfie for analysis', icon: '📸' },
  ];

  const currentStepIndex = formSteps.findIndex(s => s.step === currentStep);
  const currentStepInfo = formSteps[currentStepIndex];
  const isLastStep = currentStepIndex === formSteps.length - 1;

  const handleNext = async () => {
    markStepComplete(currentStep);

    if (currentStep === 'photo' && photoPreview) {
      // Navigate to face analysis when photo step is completed
      setLoading(true, 'Preparing your photo for analysis...');
      navigate('/analysis');
    } else if (isLastStep) {
      // If no photo was uploaded, navigate directly to results with profile-only recommendations
      setLoading(true, 'Generating recommendations based on your profile...');
      
      // Simulate some processing time
      setTimeout(() => {
        setLoading(false);
        navigate('/results');
      }, 2000);
    } else {
      // Go to next step
      const nextStep = formSteps[currentStepIndex + 1];
      setCurrentStep(nextStep.step);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      const prevStep = formSteps[currentStepIndex - 1];
      setCurrentStep(prevStep.step);
    } else {
      // If on first step, go back to landing
      navigate('/');
    }
  };

  const renderFormStep = () => {
    switch (currentStep) {
      case 'skin':
        return <SkinProfileForm onValidChange={setIsValid} />;
      case 'hair':
        return <SimplifiedForm step="hair" onValidChange={setIsValid} />;
      case 'lifestyle':
        return <SimplifiedForm step="lifestyle" onValidChange={setIsValid} />;
      case 'health':
        return <SimplifiedForm step="health" onValidChange={setIsValid} />;
      case 'makeup':
        return <SimplifiedForm step="makeup" onValidChange={setIsValid} />;
      case 'photo':
        return <PhotoUploadStep onValidChange={setIsValid} />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <FormLayout
        key={currentStep}
        stepInfo={currentStepInfo}
        onNext={handleNext}
        onBack={currentStepIndex > 0 ? handleBack : undefined}
        isValid={isValid}
        isLastStep={isLastStep}
      >
        {renderFormStep()}
      </FormLayout>
    </AnimatePresence>
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
    <div className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-beauty-gray-300 mb-4">
          Upload a clear selfie for personalized skin analysis. This step is optional - you can skip it and get recommendations based on your profile.
        </p>
        {photoPreview && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Photo uploaded successfully!
          </div>
        )}
      </div>
      <PhotoUpload />
      {!photoPreview && (
        <div className="text-center">
          <p className="text-beauty-gray-500 text-sm">
            No photo? No problem! We'll use your profile answers to make great recommendations.
          </p>
        </div>
      )}
    </div>
  );
};

// Simplified form component for other steps
const SimplifiedForm: React.FC<{ step: FormStep; onValidChange: (valid: boolean) => void }> = ({ 
  step, 
  onValidChange 
}) => {

  const [hasInteracted, setHasInteracted] = useState(false);

  React.useEffect(() => {
    onValidChange(hasInteracted);
  }, [hasInteracted, onValidChange]);

  const getStepContent = () => {
    switch (step) {
      case 'hair':
        return {
          title: 'Hair Information',
          fields: [
            { label: 'Hair Type', placeholder: 'Straight, wavy, curly, or coily' },
            { label: 'Scalp Condition', placeholder: 'Dry, oily, normal, or dandruff-prone' },
            { label: 'Primary Concerns', placeholder: 'Hair loss, frizz, split ends, etc.' },
            { label: 'Styling Frequency', placeholder: 'Daily, weekly, occasionally, never' }
          ],
          description: 'Understanding your hair helps us recommend the right products.',
        };
      case 'lifestyle':
        return {
          title: 'Lifestyle Factors',
          fields: [
            { label: 'Location', placeholder: 'City, State/Country' },
            { label: 'Climate', placeholder: 'Humid, dry, temperate, tropical' },
            { label: 'Diet Type', placeholder: 'Vegetarian, balanced, high protein, etc.' },
            { label: 'Sleep Quality', placeholder: 'Poor, fair, good, excellent' },
            { label: 'Exercise Frequency', placeholder: 'Daily, weekly, rarely, never' }
          ],
          description: 'Your environment and habits affect your skin and hair health.',
        };
      case 'health':
        return {
          title: 'Health Considerations',
          fields: [
            { label: 'Skin Conditions', placeholder: 'Eczema, rosacea, acne, etc.' },
            { label: 'Medications', placeholder: 'Any that might affect skin/hair' },
            { label: 'Recent Treatments', placeholder: 'Facials, chemical peels, etc.' }
          ],
          description: 'This helps us ensure safe and effective recommendations.',
        };
      case 'makeup':
        return {
          title: 'Makeup Preferences',
          fields: [
            { label: 'Usage Frequency', placeholder: 'Daily, occasional, special events, never' },
            { label: 'Preferred Style', placeholder: 'Natural, professional, glamorous, creative' },
            { label: 'Coverage Level', placeholder: 'Light, medium, full' },
            { label: 'Budget Range', placeholder: 'Budget, mid-range, high-end, luxury' }
          ],
          description: 'Let us know your makeup routine and preferences.',
        };
      default:
        return { title: '', fields: [], description: '' };
    }
  };

  const content = getStepContent();

  return (
    <div className="space-y-6">
      <div className="bg-beauty-gray-900/50 rounded-lg p-6">
        <p className="text-beauty-gray-300 mb-6 text-center">{content.description}</p>
        <div className="space-y-4">
          {content.fields.map((field, index) => (
            <div key={field.label} className="text-left">
              <label className="form-label">{field.label}</label>
              <input
                type="text"
                placeholder={field.placeholder}
                onChange={() => !hasInteracted && setHasInteracted(true)}
                className="form-input"
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Additional helpful content */}
      {step === 'health' && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-blue-300 text-sm font-medium mb-1">Privacy Notice</p>
              <p className="text-blue-200 text-xs">
                Your health information is encrypted and only used to personalize recommendations. 
                We never share this data with third parties.
              </p>
            </div>
          </div>
        </div>
      )}

      <p className="text-sm text-beauty-gray-500 text-center italic">
        Note: This is a simplified form for demonstration. The full version would include all specific fields and validation.
      </p>
    </div>
  );
};

export default Onboarding; 