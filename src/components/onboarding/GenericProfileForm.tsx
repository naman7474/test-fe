import React, { useState, useEffect, useRef } from 'react';
import { profileSchema, FieldConfig } from '../../config/profileSchema';
import ProfileFormField from '../common/ProfileFormField';
import useStore from '../../store';
import { FormStep, UserProfile } from '../../types';

interface GenericProfileFormProps {
  step: FormStep;
  onValidChange: (isValid: boolean) => void;
  onlyRequired?: boolean;
}

const GenericProfileForm: React.FC<GenericProfileFormProps> = ({ 
  step, 
  onValidChange,
  onlyRequired = false 
}) => {
  const { userProfile, updateUserProfile } = useStore();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const isInternalUpdate = useRef(false);
  const hasInitialized = useRef(false);

  // Get the section from the schema
  const section = profileSchema[step as keyof typeof profileSchema];
  
  // Filter fields based on onlyRequired prop
  const fields = Object.entries(section || {}).filter(([_, config]) => {
    return onlyRequired ? config.required : true;
  });

  // Initialize form data from user profile - only once
  useEffect(() => {
    if (!hasInitialized.current) {
      const initialData: Record<string, any> = {};
      const profileSection = userProfile[step as keyof UserProfile];
      
      fields.forEach(([fieldName]) => {
        if (profileSection && typeof profileSection === 'object' && !Array.isArray(profileSection) && !(profileSection instanceof Date)) {
          initialData[fieldName] = (profileSection as any)[fieldName] || null;
        } else {
          initialData[fieldName] = null;
        }
      });
      setFormData(initialData);
      hasInitialized.current = true;
    }
  }, [step]); // Remove userProfile from dependencies to prevent loops

  // Check if form is valid
  useEffect(() => {
    const isValid = fields.every(([fieldName, config]) => {
      const value = formData[fieldName];
      
      if (config.required) {
        if (!value) return false;
        
        // Check multiselect min items
        if (config.type === 'multiselect' && config.minItems) {
          return value.length >= config.minItems;
        }
        
        // Check number min/max
        if (config.type === 'number') {
          const numValue = parseInt(value);
          if (config.min !== undefined && numValue < config.min) return false;
          if (config.max !== undefined && numValue > config.max) return false;
        }
      }
      
      return true;
    });
    
    onValidChange(isValid);
  }, [formData, fields, onValidChange]);

  // Update user profile when form data changes
  useEffect(() => {
    // Skip the initial render and only update when user actually changes something
    if (hasInitialized.current && Object.keys(formData).length > 0) {
      isInternalUpdate.current = true;
      updateUserProfile({
        [step]: formData
      } as any);
      
      // Reset the flag after a short delay
      setTimeout(() => {
        isInternalUpdate.current = false;
      }, 100);
    }
  }, [formData, step, updateUserProfile]);

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  return (
    <div className="space-y-8">
      {fields.map(([fieldName, config]) => (
        <ProfileFormField
          key={fieldName}
          fieldName={fieldName}
          config={config as FieldConfig}
          value={formData[fieldName]}
          onChange={(value) => handleFieldChange(fieldName, value)}
          showDescription={true}
        />
      ))}
      
      {fields.length === 0 && (
        <div className="text-center py-8">
          <p className="text-beauty-gray-400">No fields available for this section.</p>
        </div>
      )}
    </div>
  );
};

export default GenericProfileForm; 