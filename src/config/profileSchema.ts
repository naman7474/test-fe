export interface FieldConfig {
  label: string;
  type: 'select' | 'multiselect' | 'text' | 'number';
  required: boolean;
  options?: string[] | { value: string; label: string }[];
  placeholder?: string;
  description?: string;
  minItems?: number;
  maxItems?: number;
  min?: number;
  max?: number;
  currency?: string;
  customAllowed?: boolean;
  isArray?: boolean;
  step?: number;
  unit?: string;
}

export interface ProfileSection {
  [key: string]: FieldConfig;
}

export interface ProfileSchema {
  skin: ProfileSection;
  hair: ProfileSection;
  lifestyle: ProfileSection;
  health: ProfileSection;
  makeup: ProfileSection;
  preferences: ProfileSection;
}

export const profileSchema: ProfileSchema = {
  skin: {
    skin_type: {
      label: 'Skin Type',
      type: 'select',
      required: true,
      options: ['dry', 'oily', 'combination', 'normal'],
      description: 'Your primary skin type'
    },
    skin_tone: {
      label: 'Skin Tone',
      type: 'select',
      required: true,
      options: ['fair', 'light', 'medium', 'tan', 'deep'],
      description: 'Your skin tone/complexion'
    },
    undertone: {
      label: 'Undertone',
      type: 'select',
      required: true,
      options: ['warm', 'cool', 'neutral'],
      description: 'Your skin undertone'
    },
    primary_skin_concerns: {
      label: 'Primary Skin Concerns',
      type: 'multiselect',
      required: true,
      options: ['acne', 'dark_spots', 'wrinkles', 'dryness', 'oiliness', 'sensitivity', 'uneven_tone', 'large_pores', 'blackheads', 'whiteheads'],
      description: 'Your main skin concerns'
    },
    secondary_skin_concerns: {
      label: 'Secondary Skin Concerns',
      type: 'multiselect',
      required: false,
      options: ['acne', 'dark_spots', 'wrinkles', 'dryness', 'oiliness', 'sensitivity', 'uneven_tone', 'large_pores', 'blackheads', 'whiteheads'],
      description: 'Additional skin concerns (optional)'
    },
    skin_sensitivity_level: {
      label: 'Skin Sensitivity Level',
      type: 'select',
      required: true,
      options: ['low', 'medium', 'high'],
      description: 'How sensitive is your skin?'
    },
    known_allergies: {
      label: 'Known Allergies',
      type: 'multiselect',
      required: false,
      options: ['fragrance', 'alcohol', 'sulfates', 'parabens', 'retinoids', 'aha_bha', 'vitamin_c', 'niacinamide'],
      customAllowed: true,
      description: 'Any known ingredient allergies'
    }
  },

  hair: {
    hair_type: {
      label: 'Hair Type',
      type: 'select',
      required: true,
      options: ['straight', 'wavy', 'curly', 'coily'],
      description: 'Your natural hair pattern'
    },
    hair_texture: {
      label: 'Hair Texture',
      type: 'select',
      required: true,
      options: ['fine', 'medium', 'thick'],
      description: 'The thickness of individual hair strands'
    },
    hair_porosity: {
      label: 'Hair Porosity',
      type: 'select',
      required: false,
      options: ['low', 'medium', 'high'],
      description: 'How well your hair absorbs moisture (optional)'
    },
    scalp_condition: {
      label: 'Scalp Condition',
      type: 'select',
      required: true,
      options: ['dry', 'oily', 'normal', 'sensitive'],
      description: 'Your scalp type and condition'
    },
    hair_concerns: {
      label: 'Hair Concerns',
      type: 'multiselect',
      required: true,
      options: ['hair_fall', 'dandruff', 'dryness', 'oiliness', 'frizz', 'breakage', 'thinning', 'scalp_irritation'],
      description: 'Your main hair and scalp concerns'
    },
    chemical_treatments: {
      label: 'Chemical Treatments',
      type: 'multiselect',
      required: false,
      options: ['color', 'bleach', 'keratin', 'perm', 'relaxer', 'highlights'],
      description: 'Recent chemical treatments on your hair'
    }
  },

  lifestyle: {
    location_city: {
      label: 'City',
      type: 'text',
      required: true,
      description: 'Your current city'
    },
    location_country: {
      label: 'Country',
      type: 'text',
      required: true,
      description: 'Your current country'
    },
    climate_type: {
      label: 'Climate Type',
      type: 'select',
      required: true,
      options: ['tropical', 'dry', 'temperate', 'continental', 'polar'],
      description: 'The climate where you live'
    },
    pollution_level: {
      label: 'Pollution Level',
      type: 'select',
      required: true,
      options: ['low', 'moderate', 'high', 'severe'],
      description: 'Air pollution level in your area'
    },
    sun_exposure_daily: {
      label: 'Daily Sun Exposure',
      type: 'select',
      required: true,
      options: ['minimal', 'low', 'moderate', 'high'],
      description: 'How much sun exposure do you get daily?'
    },
    sleep_hours_avg: {
      label: 'Average Sleep Hours',
      type: 'number',
      required: true,
      min: 4,
      max: 12,
      step: 0.5,
      description: 'Average hours of sleep per night'
    },
    stress_level: {
      label: 'Stress Level',
      type: 'select',
      required: true,
      options: ['low', 'moderate', 'high', 'severe'],
      description: 'Your typical stress level'
    },
    exercise_frequency: {
      label: 'Exercise Frequency',
      type: 'select',
      required: true,
      options: ['never', 'rarely', 'weekly', '3_times_week', 'daily'],
      description: 'How often do you exercise?'
    },
    water_intake_daily: {
      label: 'Daily Water Intake',
      type: 'number',
      required: false,
      min: 1,
      max: 20,
      unit: 'glasses',
      description: 'Number of glasses of water per day'
    }
  },

  health: {
    age: {
      label: 'Age',
      type: 'number',
      required: true,
      min: 13,
      max: 100,
      description: 'Your current age'
    },
    hormonal_status: {
      label: 'Hormonal Status',
      type: 'select',
      required: false,
      options: ['normal', 'pregnancy', 'breastfeeding', 'menopause', 'pcos', 'thyroid'],
      description: 'Any hormonal conditions affecting your skin'
    },
    medications: {
      label: 'Current Medications',
      type: 'multiselect',
      required: false,
      options: ['birth_control', 'blood_pressure', 'acne_medication', 'hormone_therapy', 'antibiotics', 'antidepressants', 'other'],
      customAllowed: true,
      description: 'Medications that might affect your skin'
    },
    skin_medical_conditions: {
      label: 'Skin Medical Conditions',
      type: 'multiselect',
      required: false,
      options: ['eczema', 'psoriasis', 'rosacea', 'dermatitis', 'melasma', 'vitiligo', 'keratosis_pilaris', 'seborrheic_dermatitis'],
      customAllowed: true,
      description: 'Any diagnosed skin conditions'
    },
    dietary_type: {
      label: 'Dietary Type',
      type: 'select',
      required: false,
      options: ['omnivore', 'vegetarian', 'vegan', 'pescatarian'],
      description: 'Your dietary preferences'
    },
    supplements: {
      label: 'Supplements',
      type: 'multiselect',
      required: false,
      options: ['vitamin_c', 'vitamin_d', 'vitamin_e', 'biotin', 'collagen', 'omega_3', 'zinc', 'iron'],
      customAllowed: true,
      description: 'Supplements you take regularly'
    }
  },

  makeup: {
    makeup_frequency: {
      label: 'Makeup Frequency',
      type: 'select',
      required: true,
      options: ['never', 'special_occasions', 'weekly', 'daily', 'multiple_daily'],
      description: 'How often do you wear makeup?'
    },
    preferred_look: {
      label: 'Preferred Look',
      type: 'select',
      required: false,
      options: ['natural', 'professional', 'glam', 'dramatic', 'artistic'],
      description: 'Your preferred makeup style'
    },
    coverage_preference: {
      label: 'Coverage Preference',
      type: 'select',
      required: false,
      options: ['none', 'light', 'medium', 'full'],
      description: 'Preferred foundation coverage level'
    },
    budget_range: {
      label: 'Budget Range',
      type: 'select',
      required: false,
      options: ['budget', 'mid_range', 'luxury', 'mixed'],
      description: 'Your typical budget for beauty products'
    },
    favorite_brands: {
      label: 'Favorite Brands',
      type: 'multiselect',
      required: false,
      options: ['l_oreal', 'maybelline', 'revlon', 'covergirl', 'neutrogena', 'cetaphil', 'cerave', 'la_roche_posay', 'clinique', 'estee_lauder'],
      customAllowed: true,
      description: 'Brands you prefer or trust'
    }
  },

  preferences: {
    budget_range: {
      label: 'Monthly Beauty Budget',
      type: 'select',
      required: true,
      options: ['budget', 'mid_range', 'luxury', 'mixed'],
      description: 'Your overall beauty budget preference'
    },
    favorite_brands: {
      label: 'Favorite Beauty Brands',
      type: 'multiselect',
      required: false,
      options: [
        'The Ordinary',
        'CeraVe',
        'Neutrogena',
        'Olay',
        'Clinique',
        'Estee Lauder',
        'SK-II',
        'Drunk Elephant',
        'Paula\'s Choice',
        'Minimalist',
        'Plum',
        'Mamaearth',
        'Biotique',
        'Forest Essentials'
      ],
      customAllowed: true,
      description: 'Select your preferred beauty brands'
    },
    ingredient_preference: {
      label: 'Ingredient Preference',
      type: 'multiselect',
      required: false,
      options: [
        'natural',
        'organic',
        'vegan',
        'cruelty_free',
        'clean_beauty',
        'k_beauty',
        'ayurvedic',
        'clinical',
        'no_preference'
      ],
      description: 'Product ingredient preferences'
    }
  }
};

// Helper function to get all required fields
export const getRequiredFields = (): { section: string; field: string; config: FieldConfig }[] => {
  const requiredFields: { section: string; field: string; config: FieldConfig }[] = [];
  
  Object.entries(profileSchema).forEach(([sectionName, section]) => {
    Object.entries(section as ProfileSection).forEach(([fieldName, fieldConfig]) => {
      if (fieldConfig.required) {
        requiredFields.push({
          section: sectionName,
          field: fieldName,
          config: fieldConfig
        });
      }
    });
  });
  
  return requiredFields;
};

// Helper function to get all fields (required + optional)
export const getAllFields = (): { section: string; field: string; config: FieldConfig }[] => {
  const allFields: { section: string; field: string; config: FieldConfig }[] = [];
  
  Object.entries(profileSchema).forEach(([sectionName, section]) => {
    Object.entries(section as ProfileSection).forEach(([fieldName, fieldConfig]) => {
      allFields.push({
        section: sectionName,
        field: fieldName,
        config: fieldConfig
      });
    });
  });
  
  return allFields;
};

// Helper function to check if profile is complete
export const isProfileComplete = (userProfile: any): boolean => {
  return getAllFields().every(({ section, field, config }) => {
    const value = userProfile[section]?.[field];
    
    if (config.required && !value) return false;
    
    // For optional fields, we also check if they're filled
    if (!config.required && !value) return false;
    
    // Check multiselect min/max items
    if (config.type === 'multiselect' && value) {
      if (config.minItems && value.length < config.minItems) return false;
      if (config.maxItems && value.length > config.maxItems) return false;
    }
    
    return true;
  });
};

// Helper function to get profile completion percentage
export const getProfileCompletionPercentage = (userProfile: any): number => {
  const allFields = getAllFields();
  const filledFields = allFields.filter(({ section, field }) => {
    const value = userProfile[section]?.[field];
    return value !== undefined && value !== null && value !== '' && 
           (!Array.isArray(value) || value.length > 0);
  });
  
  return Math.round((filledFields.length / allFields.length) * 100);
}; 