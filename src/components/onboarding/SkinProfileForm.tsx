import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SkinProfile } from '../../types';
import useStore from '../../store';

const skinTypes = [
  { value: 'dry', label: 'Dry', description: 'Feels tight, may have flakes' },
  { value: 'oily', label: 'Oily', description: 'Shiny, prone to breakouts' },
  { value: 'combination', label: 'Combination', description: 'Oily T-zone, dry cheeks' },
  { value: 'normal', label: 'Normal', description: 'Balanced, few concerns' },
  { value: 'sensitive', label: 'Sensitive', description: 'Easily irritated or red' },
];

const skinConcerns = [
  'Acne',
  'Dark spots',
  'Wrinkles',
  'Redness',
  'Large pores',
  'Blackheads',
  'Dullness',
  'Uneven texture',
  'Dark circles',
  'Dehydration',
];

const undertones = [
  { value: 'warm', label: 'Warm', hint: 'Gold jewelry looks better' },
  { value: 'cool', label: 'Cool', hint: 'Silver jewelry looks better' },
  { value: 'neutral', label: 'Neutral', hint: 'Both look equally good' },
];

interface SkinProfileFormProps {
  onValidChange: (isValid: boolean) => void;
}

const SkinProfileForm: React.FC<SkinProfileFormProps> = ({ onValidChange }) => {
  const { userProfile, updateUserProfile } = useStore();
  const [formData, setFormData] = useState<Partial<SkinProfile>>({
    skinType: userProfile.skinProfile?.skinType,
    skinTone: userProfile.skinProfile?.skinTone || '',
    undertone: userProfile.skinProfile?.undertone,
    fitzpatrickType: userProfile.skinProfile?.fitzpatrickType,
    primaryConcerns: userProfile.skinProfile?.primaryConcerns || [],
    allergies: userProfile.skinProfile?.allergies || [],
    sensitivityLevel: userProfile.skinProfile?.sensitivityLevel || 'medium',
    sunExposure: userProfile.skinProfile?.sunExposure || 2,
    sunscreenUsage: userProfile.skinProfile?.sunscreenUsage || 'sometimes',
    currentRoutine: userProfile.skinProfile?.currentRoutine || { morning: [], evening: [] },
  });

  const [photoConsent, setPhotoConsent] = useState(false);

  useEffect(() => {
    const isValid = 
      !!formData.skinType && 
      !!formData.undertone && 
      formData.primaryConcerns!.length > 0 &&
      photoConsent;
    onValidChange(isValid);
  }, [formData, photoConsent, onValidChange]);

  useEffect(() => {
    updateUserProfile({ skinProfile: formData as SkinProfile });
  }, [formData, updateUserProfile]);

  const handleConcernToggle = (concern: string) => {
    setFormData(prev => ({
      ...prev,
      primaryConcerns: prev.primaryConcerns?.includes(concern)
        ? prev.primaryConcerns.filter(c => c !== concern)
        : [...(prev.primaryConcerns || []), concern],
    }));
  };

  return (
    <div className="space-y-8">
      {/* Skin Type */}
      <div>
        <label className="form-label">What's your skin type?</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {skinTypes.map((type) => (
            <motion.button
              key={type.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFormData({ ...formData, skinType: type.value as any })}
              className={`
                p-4 rounded-lg border-2 text-left transition-all
                ${formData.skinType === type.value
                  ? 'border-beauty-accent bg-beauty-accent/10'
                  : 'border-beauty-gray-800 hover:border-beauty-gray-600'
                }
              `}
            >
              <h4 className="font-medium text-white mb-1">{type.label}</h4>
              <p className="text-sm text-beauty-gray-400">{type.description}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Undertone */}
      <div>
        <label className="form-label">What's your undertone?</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {undertones.map((tone) => (
            <motion.button
              key={tone.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFormData({ ...formData, undertone: tone.value as any })}
              className={`
                p-4 rounded-lg border-2 text-left transition-all
                ${formData.undertone === tone.value
                  ? 'border-beauty-accent bg-beauty-accent/10'
                  : 'border-beauty-gray-800 hover:border-beauty-gray-600'
                }
              `}
            >
              <h4 className="font-medium text-white mb-1">{tone.label}</h4>
              <p className="text-sm text-beauty-gray-400">{tone.hint}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Primary Concerns */}
      <div>
        <label className="form-label">Select your primary skin concerns</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {skinConcerns.map((concern) => (
            <motion.button
              key={concern}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleConcernToggle(concern)}
              className={`
                p-3 rounded-lg border-2 transition-all
                ${formData.primaryConcerns?.includes(concern)
                  ? 'border-beauty-accent bg-beauty-accent/10 text-white'
                  : 'border-beauty-gray-800 hover:border-beauty-gray-600 text-beauty-gray-300'
                }
              `}
            >
              {concern}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Sun Exposure */}
      <div>
        <label className="form-label">
          Daily sun exposure (hours): {formData.sunExposure}
        </label>
        <input
          type="range"
          min="0"
          max="12"
          value={formData.sunExposure}
          onChange={(e) => setFormData({ ...formData, sunExposure: parseInt(e.target.value) })}
          className="w-full h-2 bg-beauty-gray-800 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #00d4ff 0%, #00d4ff ${(formData.sunExposure! / 12) * 100}%, #262626 ${(formData.sunExposure! / 12) * 100}%, #262626 100%)`,
          }}
        />
        <div className="flex justify-between text-xs text-beauty-gray-500 mt-1">
          <span>0 hours</span>
          <span>12 hours</span>
        </div>
      </div>

      {/* Sunscreen Usage */}
      <div>
        <label className="form-label">How often do you use sunscreen?</label>
        <div className="grid grid-cols-3 gap-3">
          {(['never', 'sometimes', 'always'] as const).map((usage) => (
            <motion.button
              key={usage}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFormData({ ...formData, sunscreenUsage: usage })}
              className={`
                p-3 rounded-lg border-2 capitalize transition-all
                ${formData.sunscreenUsage === usage
                  ? 'border-beauty-accent bg-beauty-accent/10'
                  : 'border-beauty-gray-800 hover:border-beauty-gray-600'
                }
              `}
            >
              {usage}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Allergies */}
      <div>
        <label className="form-label">Any known allergies? (optional)</label>
        <input
          type="text"
          placeholder="e.g., Fragrance, Retinol, Niacinamide"
          value={formData.allergies?.join(', ') || ''}
          onChange={(e) => setFormData({
            ...formData,
            allergies: e.target.value.split(',').map(a => a.trim()).filter(Boolean),
          })}
          className="form-input"
        />
      </div>

      {/* Photo Consent */}
      <div className="bg-beauty-gray-900/50 rounded-lg p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={photoConsent}
            onChange={(e) => setPhotoConsent(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-beauty-gray-700 bg-beauty-dark text-beauty-accent focus:ring-beauty-accent focus:ring-offset-0"
          />
          <div>
            <p className="text-sm text-white">
              I consent to the analysis of my uploaded photo for personalized recommendations
            </p>
            <p className="text-xs text-beauty-gray-500 mt-1">
              Your photo is processed securely and never stored permanently
            </p>
          </div>
        </label>
      </div>
    </div>
  );
};

export default SkinProfileForm; 