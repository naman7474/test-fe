// src/components/results/ProfileEditModal.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../../store';
import { profileSchema, getProfileCompletionPercentage } from '../../config/profileSchema';
import ProfileFormField from '../common/ProfileFormField';
import { FormStep } from '../../types';

const ProfileEditModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { userProfile, updateUserProfile } = useStore();
  const [expandedSection, setExpandedSection] = useState<string | null>('skin');
  const [hasChanges, setHasChanges] = useState(false);
  const [editedProfile, setEditedProfile] = useState(userProfile);

  const sections = [
    { key: 'skin', title: 'Skin Profile', icon: '🧴' },
    { key: 'hair', title: 'Hair Profile', icon: '💇‍♀️' },
    { key: 'lifestyle', title: 'Lifestyle', icon: '🌿' },
    { key: 'health', title: 'Health', icon: '🏥' },
    { key: 'makeup', title: 'Makeup', icon: '💄' },
    { key: 'preferences', title: 'Preferences', icon: '💰' }
  ];

  const completionPercentage = getProfileCompletionPercentage(userProfile);

  const handleFieldChange = (section: string, fieldName: string, value: any) => {
    setEditedProfile(prev => {
      const prevSection = prev[section as keyof typeof prev];
      const updatedSection = typeof prevSection === 'object' && prevSection !== null && !Array.isArray(prevSection) && !(prevSection instanceof Date)
        ? { ...prevSection, [fieldName]: value }
        : { [fieldName]: value };
      
      return {
        ...prev,
        [section]: updatedSection
      };
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    updateUserProfile(editedProfile);
    updateUserProfile({ profileComplete: getProfileCompletionPercentage(editedProfile) === 100 });
    onClose();
  };

  const formatSectionTitle = (title: string) => {
    return title.charAt(0).toUpperCase() + title.slice(1).replace(/_/g, ' ');
  };

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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Your Beauty Profile</h2>
              <p className="text-beauty-gray-400 text-sm mt-1">Complete all fields for better recommendations</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-beauty-accent">{completionPercentage}%</div>
              <p className="text-xs text-beauty-gray-500">Complete</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 h-2 bg-beauty-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-beauty-accent to-beauty-secondary"
            />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
          {sections.map((section) => {
            const sectionSchema = profileSchema[section.key as keyof typeof profileSchema];
            const sectionData = editedProfile[section.key as keyof typeof editedProfile] || {};
            const fields = Object.entries(sectionSchema || {});
            
            // Count filled fields
            const filledFields = fields.filter(([fieldName, config]) => {
              const value = typeof sectionData === 'object' && !Array.isArray(sectionData) 
                ? (sectionData as any)[fieldName] 
                : null;
              return value !== undefined && value !== null && value !== '' && 
                     (!Array.isArray(value) || value.length > 0);
            }).length;

            return (
              <div key={section.key} className="mb-4">
                <button
                  onClick={() => setExpandedSection(
                    expandedSection === section.key ? null : section.key
                  )}
                  className="w-full flex items-center justify-between py-3 text-left hover:bg-beauty-gray-900/50 rounded-lg px-2 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{section.icon}</span>
                    <div>
                      <h3 className="text-white font-medium">{section.title}</h3>
                      <p className="text-xs text-beauty-gray-500">
                        {filledFields} of {fields.length} fields completed
                      </p>
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-beauty-gray-400 transition-transform ${
                      expandedSection === section.key ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {expandedSection === section.key && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-2 py-4 space-y-6">
                        {fields.map(([fieldName, config]) => {
                          const value = typeof sectionData === 'object' && !Array.isArray(sectionData)
                            ? (sectionData as any)[fieldName]
                            : null;
                          
                          return (
                            <ProfileFormField
                              key={fieldName}
                              fieldName={fieldName}
                              config={config}
                              value={value}
                              onChange={(newValue) => handleFieldChange(section.key, fieldName, newValue)}
                              showDescription={true}
                            />
                          );
                        })}
                        
                        {fields.length === 0 && (
                          <p className="text-beauty-gray-500 text-sm text-center py-4">
                            No fields available for this section
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-beauty-gray-800 bg-beauty-charcoal">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-full border border-beauty-gray-700 text-beauty-gray-300 font-semibold hover:bg-beauty-gray-900/50 transition-colors"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={!hasChanges}
              className={`flex-1 py-3 rounded-full font-semibold transition-all ${
                hasChanges
                  ? 'btn-primary'
                  : 'bg-beauty-gray-800 text-beauty-gray-500 cursor-not-allowed'
              }`}
            >
              {hasChanges ? 'Save Changes' : 'No Changes'}
            </motion.button>
          </div>
          
          {completionPercentage < 100 && (
            <p className="text-xs text-beauty-gray-500 text-center mt-3">
              Complete your profile for more accurate recommendations
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProfileEditModal;