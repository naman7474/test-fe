import React from 'react';
import { motion } from 'framer-motion';
import { FieldConfig } from '../../config/profileSchema';

interface ProfileFormFieldProps {
  fieldName: string;
  config: FieldConfig;
  value: any;
  onChange: (value: any) => void;
  showDescription?: boolean;
}

const ProfileFormField: React.FC<ProfileFormFieldProps> = ({
  fieldName,
  config,
  value,
  onChange,
  showDescription = true
}) => {
  const formatLabel = (label: string) => {
    return label.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatOption = (option: string) => {
    // Special formatting for specific beauty terms
    const specialCases: Record<string, string> = {
      'aha_bha': 'AHA/BHA',
      'pcos': 'PCOS',
      'uv': 'UV',
      'spf': 'SPF',
      'k_beauty': 'K-Beauty',
      '3_times_week': '3 times per week',
      'multiple_daily': 'Multiple times daily',
      'special_occasions': 'Special occasions',
      'mid_range': 'Mid-range',
      'hair_fall': 'Hair fall',
      'acne_medication': 'Acne medication',
      'birth_control': 'Birth control',
      'blood_pressure': 'Blood pressure medication',
      'hormone_therapy': 'Hormone therapy',
      'keratosis_pilaris': 'Keratosis pilaris',
      'seborrheic_dermatitis': 'Seborrheic dermatitis',
      'la_roche_posay': 'La Roche-Posay',
      'estee_lauder': 'Estée Lauder',
      'sk_ii': 'SK-II',
      'drunk_elephant': 'Drunk Elephant',
      'paulas_choice': "Paula's Choice",
      'forest_essentials': 'Forest Essentials',
      'the_ordinary': 'The Ordinary',
      'cruelty_free': 'Cruelty-free',
      'clean_beauty': 'Clean beauty',
      'no_preference': 'No preference',
      'vitamin_c': 'Vitamin C',
      'vitamin_d': 'Vitamin D',
      'vitamin_e': 'Vitamin E',
      'omega_3': 'Omega-3'
    };

    if (specialCases[option.toLowerCase()]) {
      return specialCases[option.toLowerCase()];
    }

    // Default formatting: replace underscores with spaces and capitalize each word
    return option
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const renderField = () => {
    switch (config.type) {
      case 'select':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {config.options?.map((option) => {
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionLabel = typeof option === 'string' ? formatOption(option) : option.label;
              
              const isSelected = value === optionValue || String(value) === String(optionValue);
              
              return (
                <motion.button
                  key={optionValue}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onChange(optionValue)}
                  className={`
                    p-4 rounded-lg border-2 text-left transition-all
                    ${isSelected
                      ? 'border-beauty-accent bg-beauty-accent/10 text-white'
                      : 'border-beauty-gray-800 hover:border-beauty-gray-600 text-beauty-gray-300'
                    }
                  `}
                >
                  <p className={`font-medium ${isSelected ? 'text-white' : 'text-beauty-gray-300'}`}>
                    {optionLabel}
                  </p>
                  {isSelected && (
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-beauty-accent">Selected</span>
                      <svg className="w-4 h-4 text-beauty-accent" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        );

      case 'multiselect':
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {config.options?.map((option) => {
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionLabel = typeof option === 'string' ? formatOption(option) : option.label;
              
              const currentValue = Array.isArray(value) ? value : (value ? [value] : []);
              const isSelected = currentValue.includes(optionValue) || 
                                currentValue.some((v: any) => String(v) === String(optionValue));
              
              return (
                <motion.button
                  key={optionValue}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const currentArray = Array.isArray(value) ? value : (value ? [value] : []);
                    
                    if (isSelected) {
                      const newValue = currentArray.filter((v: any) => 
                        v !== optionValue && String(v) !== String(optionValue)
                      );
                      onChange(newValue);
                    } else {
                      const newValue = [...currentArray, optionValue];
                      if (config.maxItems && newValue.length > config.maxItems) {
                        newValue.shift();
                      }
                      onChange(newValue);
                    }
                  }}
                  className={`
                    p-3 rounded-lg border-2 transition-all text-sm relative
                    ${isSelected
                      ? 'border-beauty-accent bg-beauty-accent/10 text-white'
                      : 'border-beauty-gray-800 hover:border-beauty-gray-600 text-beauty-gray-300'
                    }
                  `}
                >
                  <span className={`${isSelected ? 'text-white' : 'text-beauty-gray-300'}`}>
                    {optionLabel}
                  </span>
                  {isSelected && (
                    <div className="absolute top-1 right-1">
                      <svg className="w-3 h-3 text-beauty-accent" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        );

      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={config.placeholder}
            className="w-full p-3 bg-beauty-dark border border-beauty-gray-800 rounded-lg text-white placeholder-beauty-gray-500 focus:outline-none focus:border-beauty-accent"
          />
        );

      case 'number':
        return (
          <div>
            <input
              type="number"
              value={value || ''}
              onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
              min={config.min}
              max={config.max}
              step={config.step}
              className="w-full p-3 bg-beauty-dark border border-beauty-gray-800 rounded-lg text-white placeholder-beauty-gray-500 focus:outline-none focus:border-beauty-accent"
            />
            {config.min !== undefined && config.max !== undefined && (
              <div className="flex justify-between text-xs text-beauty-gray-500 mt-1">
                <span>Min: {config.min}</span>
                <span>Max: {config.max}</span>
              </div>
            )}
            {config.unit && (
              <p className="text-xs text-beauty-gray-500 mt-1">
                Unit: {config.unit}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <label className="form-label">
        {config.label}
        {config.required && <span className="text-beauty-accent ml-1">*</span>}
      </label>
      
      {showDescription && config.description && (
        <p className="text-sm text-beauty-gray-400 mb-3">{config.description}</p>
      )}
      
      {renderField()}
      
      {config.minItems && config.type === 'multiselect' && (
        <p className="text-xs text-beauty-gray-500 mt-2">
          Select at least {config.minItems} option{config.minItems > 1 ? 's' : ''}
          {config.maxItems && ` (max ${config.maxItems})`}
        </p>
      )}
      
      {config.currency && (
        <p className="text-xs text-beauty-gray-500 mt-1">
          Currency: {config.currency}
        </p>
      )}
    </div>
  );
};

export default ProfileFormField; 