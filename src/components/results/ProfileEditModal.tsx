// src/components/results/ProfileEditModal.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../../store';

interface ProfileSection {
  title: string;
  fields: {
    id: string;
    label: string;
    value: string | string[];
    type: 'single' | 'multiple' | 'text';
    options?: string[];
  }[];
}

const ProfileEditModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { userProfile, updateUserProfile } = useStore();
  const [editedProfile, setEditedProfile] = useState(userProfile);
  const [hasChanges, setHasChanges] = useState(false);

  const sections: ProfileSection[] = [
    {
      title: 'Skin Profile',
      fields: [
        {
          id: 'skinType',
          label: 'Skin Type',
          value: editedProfile.skinType || 'Oily & Shiny',
          type: 'single',
          options: ['Dry & Tight', 'Oily & Shiny', 'Combination', 'Normal & Balanced']
        },
        {
          id: 'skinConcerns',
          label: 'Concerns',
          value: editedProfile.skinConcerns || ['Acne', 'Dark Spots'],
          type: 'multiple',
          options: ['Acne', 'Dark Spots', 'Wrinkles', 'Large Pores', 'Redness', 'Dullness']
        },
        {
          id: 'skinSensitivity',
          label: 'Sensitivity',
          value: editedProfile.skinSensitivity || 'Slightly Sensitive',
          type: 'single',
          options: ['Not Sensitive', 'Slightly Sensitive', 'Moderately Sensitive', 'Very Sensitive']
        }
      ]
    },
    {
      title: 'Hair Profile',
      fields: [
        {
          id: 'hairType',
          label: 'Hair Type',
          value: editedProfile.hairType || 'Wavy',
          type: 'single',
          options: ['Straight', 'Wavy', 'Curly', 'Coily']
        },
        {
          id: 'hairConcerns',
          label: 'Hair Concerns',
          value: editedProfile.hairConcerns || ['Frizz', 'Dryness'],
          type: 'multiple',
          options: ['Frizz', 'Dryness', 'Oiliness', 'Hair Fall', 'Damage', 'Dandruff']
        }
      ]
    },
    {
      title: 'Lifestyle',
      fields: [
        {
          id: 'sleepHours',
          label: 'Sleep',
          value: editedProfile.sleepHours || '7-9 hours',
          type: 'single',
          options: ['< 5 hours', '5-7 hours', '7-9 hours', '> 9 hours']
        },
        {
          id: 'waterIntake',
          label: 'Water Intake',
          value: editedProfile.waterIntake || '6-8 glasses',
          type: 'single',
          options: ['< 4 glasses', '4-6 glasses', '6-8 glasses', '> 8 glasses']
        },
        {
          id: 'stressLevel',
          label: 'Stress Level',
          value: editedProfile.stressLevel || 'Moderate',
          type: 'single',
          options: ['Low', 'Moderate', 'High', 'Very High']
        }
      ]
    },
    {
      title: 'Health',
      fields: [
        {
          id: 'allergies',
          label: 'Allergies',
          value: editedProfile.allergies || 'None',
          type: 'text'
        },
        {
          id: 'medications',
          label: 'Medications',
          value: editedProfile.medications || 'None',
          type: 'text'
        }
      ]
    }
  ];

  const handleFieldChange = (fieldId: string, value: any) => {
    setEditedProfile(prev => ({ ...prev, [fieldId]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateUserProfile(editedProfile);
    onClose();
  };

  const [expandedSection, setExpandedSection] = useState<string | null>('Skin Profile');

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
          <h2 className="text-xl font-bold text-white">Your Profile</h2>
          <p className="text-beauty-gray-400 text-sm mt-1">Edit your beauty profile</p>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
          {sections.map((section) => (
            <div key={section.title} className="mb-4">
              <button
                onClick={() => setExpandedSection(
                  expandedSection === section.title ? null : section.title
                )}
                className="w-full flex items-center justify-between py-3 text-left"
              >
                <h3 className="text-white font-medium">{section.title}</h3>
                <svg
                  className={`w-5 h-5 text-beauty-gray-400 transition-transform ${
                    expandedSection === section.title ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {expandedSection === section.title && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-4 pb-4">
                      {section.fields.map((field) => (
                        <div key={field.id}>
                          <label className="text-beauty-gray-400 text-sm mb-2 block">
                            {field.label}
                          </label>

                          {field.type === 'single' && field.options && (
                            <select
                              value={field.value as string}
                              onChange={(e) => handleFieldChange(field.id, e.target.value)}
                              className="w-full p-3 bg-beauty-dark border border-beauty-gray-800 rounded-lg text-white focus:outline-none focus:border-beauty-accent"
                            >
                              {field.options.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          )}

                          {field.type === 'multiple' && field.options && (
                            <div className="space-y-2">
                              {field.options.map((option) => {
                                const isSelected = (field.value as string[]).includes(option);
                                return (
                                  <button
                                    key={option}
                                    onClick={() => {
                                      const current = field.value as string[];
                                      const updated = isSelected
                                        ? current.filter(v => v !== option)
                                        : [...current, option];
                                      handleFieldChange(field.id, updated);
                                    }}
                                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                                      isSelected
                                        ? 'bg-beauty-accent/20 border-beauty-accent text-white'
                                        : 'bg-beauty-dark border-beauty-gray-800 text-beauty-gray-300'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span>{option}</span>
                                      {isSelected && <span>✓</span>}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {field.type === 'text' && (
                            <input
                              type="text"
                              value={field.value as string}
                              onChange={(e) => handleFieldChange(field.id, e.target.value)}
                              className="w-full p-3 bg-beauty-dark border border-beauty-gray-800 rounded-lg text-white placeholder-beauty-gray-500 focus:outline-none focus:border-beauty-accent"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-beauty-gray-800">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={!hasChanges}
            className={`w-full py-3 rounded-full font-semibold transition-all ${
              hasChanges
                ? 'btn-primary'
                : 'bg-beauty-gray-800 text-beauty-gray-500 cursor-not-allowed'
            }`}
          >
            {hasChanges ? 'Save Changes' : 'No Changes'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProfileEditModal;