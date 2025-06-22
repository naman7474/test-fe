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
    return option.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const renderField = () => {
    switch (config.type) {
      case 'select':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {config.options?.map((option) => {
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionLabel = typeof option === 'string' ? formatOption(option) : option.label;
              
              return (
                <motion.button
                  key={optionValue}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onChange(optionValue)}
                  className={`
                    p-4 rounded-lg border-2 text-left transition-all
                    ${value === optionValue
                      ? 'border-beauty-accent bg-beauty-accent/10'
                      : 'border-beauty-gray-800 hover:border-beauty-gray-600'
                    }
                  `}
                >
                  <p className="font-medium text-white">{optionLabel}</p>
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
              const isSelected = value?.includes(optionValue);
              
              return (
                <motion.button
                  key={optionValue}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (isSelected) {
                      onChange(value.filter((v: string) => v !== optionValue));
                    } else {
                      const newValue = [...(value || []), optionValue];
                      if (config.maxItems && newValue.length > config.maxItems) {
                        // Remove the first item if we exceed max
                        newValue.shift();
                      }
                      onChange(newValue);
                    }
                  }}
                  className={`
                    p-3 rounded-lg border-2 transition-all text-sm
                    ${isSelected
                      ? 'border-beauty-accent bg-beauty-accent/10 text-white'
                      : 'border-beauty-gray-800 hover:border-beauty-gray-600 text-beauty-gray-300'
                    }
                  `}
                >
                  {optionLabel}
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
              onChange={(e) => onChange(parseInt(e.target.value) || 0)}
              min={config.min}
              max={config.max}
              className="w-full p-3 bg-beauty-dark border border-beauty-gray-800 rounded-lg text-white placeholder-beauty-gray-500 focus:outline-none focus:border-beauty-accent"
            />
            {config.min !== undefined && config.max !== undefined && (
              <div className="flex justify-between text-xs text-beauty-gray-500 mt-1">
                <span>{config.min}</span>
                <span>{config.max}</span>
              </div>
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