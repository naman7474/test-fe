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
      options: ['dry', 'oily', 'combination', 'normal', 'sensitive'],
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
    primary_concerns: {
      label: 'Primary Skin Concerns',
      type: 'multiselect',
      required: true,
      minItems: 1,
      maxItems: 5,
      options: [
        'acne',
        'dark_spots',
        'wrinkles',
        'fine_lines',
        'hyperpigmentation',
        'redness',
        'large_pores',
        'blackheads',
        'whiteheads',
        'dullness',
        'uneven_texture',
        'dark_circles',
        'puffiness',
        'sensitivity',
        'dryness',
        'oiliness',
        'sun_damage',
        'melasma'
      ],
      description: 'Select your main skin concerns (1-5)'
    },
    sensitivity_level: {
      label: 'Skin Sensitivity Level',
      type: 'select',
      required: true,
      options: ['low', 'medium', 'high'],
      description: 'How sensitive is your skin?'
    },
    allergies: {
      label: 'Known Allergies/Ingredients to Avoid',
      type: 'multiselect',
      required: false,
      options: [
        'fragrance',
        'alcohol',
        'sulfates',
        'parabens',
        'mineral_oil',
        'retinol',
        'salicylic_acid',
        'glycolic_acid',
        'vitamin_c',
        'niacinamide',
        'essential_oils',
        'lanolin',
        'formaldehyde',
        'phthalates'
      ],
      customAllowed: true,
      description: 'Select or add ingredients you\'re allergic to'
    }
  },

  hair: {
    hair_type: {
      label: 'Hair Type',
      type: 'select',
      required: false,
      options: ['straight', 'wavy', 'curly', 'coily'],
      description: 'Your hair pattern type'
    },
    hair_texture: {
      label: 'Hair Texture',
      type: 'select',
      required: false,
      options: ['fine', 'medium', 'thick'],
      description: 'The thickness of individual hair strands'
    },
    scalp_condition: {
      label: 'Scalp Condition',
      type: 'select',
      required: false,
      options: ['dry', 'oily', 'normal', 'flaky', 'sensitive'],
      description: 'Your scalp condition'
    },
    primary_concerns: {
      label: 'Hair Concerns',
      type: 'multiselect',
      required: false,
      maxItems: 5,
      options: [
        'hair_fall',
        'dandruff',
        'frizz',
        'dryness',
        'oiliness',
        'damage',
        'split_ends',
        'thinning',
        'slow_growth',
        'color_fading',
        'lack_of_volume',
        'tangles'
      ],
      description: 'Select your main hair concerns'
    },
    chemical_treatments: {
      label: 'Chemical Treatments',
      type: 'multiselect',
      required: false,
      options: ['color', 'bleach', 'keratin', 'relaxer', 'perm', 'none'],
      description: 'Any chemical treatments on your hair'
    },
    styling_frequency: {
      label: 'Heat Styling Frequency',
      type: 'select',
      required: false,
      options: ['daily', 'weekly', '2-3_times_week', 'rarely', 'never'],
      description: 'How often do you use heat styling tools?'
    }
  },

  lifestyle: {
    location: {
      label: 'Location',
      type: 'text',
      required: true,
      placeholder: 'City, Country',
      description: 'Your current location (e.g., Mumbai, India)'
    },
    climate_type: {
      label: 'Climate Type',
      type: 'select',
      required: true,
      options: ['humid', 'dry', 'tropical', 'temperate', 'cold', 'variable'],
      description: 'Your local climate'
    },
    pollution_level: {
      label: 'Pollution Level',
      type: 'select',
      required: true,
      options: ['low', 'moderate', 'high', 'very_high'],
      description: 'Air pollution level in your area'
    },
    sun_exposure: {
      label: 'Daily Sun Exposure',
      type: 'select',
      required: true,
      options: ['minimal', 'low', 'moderate', 'high', 'very_high'],
      description: 'Average daily sun exposure'
    },
    sleep_hours: {
      label: 'Average Sleep Hours',
      type: 'number',
      required: true,
      min: 3,
      max: 12,
      description: 'Hours of sleep per night'
    },
    stress_level: {
      label: 'Stress Level',
      type: 'select',
      required: true,
      options: ['low', 'moderate', 'high', 'very_high'],
      description: 'Your general stress level'
    },
    exercise_frequency: {
      label: 'Exercise Frequency',
      type: 'select',
      required: true,
      options: ['daily', '3_times_week', 'weekly', 'rarely', 'never'],
      description: 'How often do you exercise?'
    },
    water_intake: {
      label: 'Daily Water Intake',
      type: 'select',
      required: false,
      options: ['less_than_4', '4-6_glasses', '6-8_glasses', 'more_than_8'],
      description: 'Glasses of water per day'
    }
  },

  health: {
    age: {
      label: 'Age',
      type: 'number',
      required: false,
      min: 13,
      max: 100,
      description: 'Your age'
    },
    hormonal_status: {
      label: 'Hormonal Status',
      type: 'select',
      required: false,
      options: [
        'normal',
        'pregnancy',
        'postpartum',
        'menopause',
        'pcos',
        'thyroid_issues',
        'hormonal_acne'
      ],
      description: 'Any hormonal conditions'
    },
    medications: {
      label: 'Current Medications',
      type: 'text',
      required: false,
      isArray: true,
      description: 'List any medications affecting skin/hair'
    },
    skin_conditions: {
      label: 'Skin Medical Conditions',
      type: 'multiselect',
      required: false,
      options: [
        'eczema',
        'psoriasis',
        'rosacea',
        'dermatitis',
        'vitiligo',
        'none'
      ],
      description: 'Any diagnosed skin conditions'
    },
    dietary_restrictions: {
      label: 'Dietary Type',
      type: 'multiselect',
      required: false,
      options: [
        'vegetarian',
        'vegan',
        'gluten_free',
        'dairy_free',
        'keto',
        'omnivore'
      ],
      description: 'Your dietary preferences/restrictions'
    }
  },

  makeup: {
    makeup_frequency: {
      label: 'Makeup Usage Frequency',
      type: 'select',
      required: false,
      options: ['daily', 'often', 'occasionally', 'rarely', 'never'],
      description: 'How often do you wear makeup?'
    },
    preferred_look: {
      label: 'Preferred Makeup Look',
      type: 'select',
      required: false,
      options: ['natural', 'minimal', 'glam', 'bold', 'professional'],
      description: 'Your go-to makeup style'
    },
    coverage_preference: {
      label: 'Coverage Preference',
      type: 'select',
      required: false,
      options: ['sheer', 'light', 'medium', 'full'],
      description: 'Preferred foundation coverage'
    }
  },

  preferences: {
    budget_range: {
      label: 'Monthly Beauty Budget',
      type: 'select',
      required: true,
      options: [
        'under_1000',
        '1000_3000',
        '3000_5000',
        '5000_10000',
        'above_10000'
      ],
      currency: 'INR',
      description: 'Monthly budget for beauty products'
    },
    brand_preference: {
      label: 'Brand Preference',
      type: 'select',
      required: false,
      options: ['luxury', 'premium', 'drugstore', 'indie', 'no_preference'],
      description: 'Preferred brand category'
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