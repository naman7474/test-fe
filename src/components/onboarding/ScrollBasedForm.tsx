import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { profileSchema } from '../../config/profileSchema';
import useStore from '../../store';
import { FormStep } from '../../types';

interface FormQuestion {
  id: string;
  fieldName: string;
  section: FormStep;
  question: string;
  type: 'single' | 'multiple' | 'slider' | 'text' | 'number';
  options?: string[] | { value: string; label: string }[];
  emoji?: string;
  category: string;
  required: boolean;
  minItems?: number;
  maxItems?: number;
  min?: number;
  max?: number;
  placeholder?: string;
  description?: string;
}

interface ScrollBasedFormProps {
  step: FormStep;
  onValidChange: (isValid: boolean) => void;
  onlyRequired?: boolean;
}

const EMOJIS: Record<string, string> = {
  skin: '🧴',
  lifestyle: '🌿',
  preferences: '💰',
  hair: '💁‍♀️',
  health: '🏥',
  makeup: '💄',
  // Field-specific emojis
  skin_type: '💧',
  skin_tone: '🎨',
  undertone: '🌈',
  primary_concerns: '🎯',
  sensitivity_level: '🌡️',
  allergies: '🤧',
  location: '📍',
  climate_type: '🌤️',
  pollution_level: '💨',
  sun_exposure: '☀️',
  sleep_hours: '😴',
  stress_level: '😰',
  exercise_frequency: '🏃‍♀️',
  water_intake: '💧',
  budget_range: '💰',
  age: '🎂',
  medications: '💊',
  makeup_frequency: '💄',
  preferred_look: '✨',
};

const QUESTION_TEMPLATES: Record<string, string> = {
  skin_type: 'How does your skin feel?',
  skin_tone: 'What\'s your skin tone?',
  undertone: 'What\'s your undertone?',
  primary_concerns: 'What bothers you most?',
  sensitivity_level: 'How sensitive is your skin?',
  allergies: 'Any allergies or ingredients to avoid?',
  location: 'Where are you located?',
  climate_type: 'What\'s your climate like?',
  pollution_level: 'Air quality in your area?',
  sun_exposure: 'Daily sun exposure?',
  sleep_hours: 'How many hours do you sleep?',
  stress_level: 'Stress level lately?',
  exercise_frequency: 'How often do you exercise?',
  water_intake: 'Water intake per day?',
  budget_range: 'Monthly beauty budget?',
  hair_type: 'What\'s your hair type?',
  hair_texture: 'Hair texture?',
  scalp_condition: 'How\'s your scalp?',
  age: 'How old are you?',
  hormonal_status: 'Any hormonal considerations?',
  medications: 'Taking any medications?',
  skin_conditions: 'Any skin conditions?',
  makeup_frequency: 'How often do you wear makeup?',
  preferred_look: 'Your go-to look?',
  coverage_preference: 'Coverage preference?',
};

const ScrollBasedForm: React.FC<ScrollBasedFormProps> = ({ 
  step, 
  onValidChange,
  onlyRequired = false 
}) => {
  const { userProfile, updateUserProfile } = useStore();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hasInitialized = useRef(false);
  const lastUpdateRef = useRef<string>('');

  // Memoize questions to prevent recalculation on every render
  const questions: FormQuestion[] = useMemo(() => {
    const questionsList: FormQuestion[] = [];
    const section = profileSchema[step as keyof typeof profileSchema];
    
    if (section) {
      Object.entries(section).forEach(([fieldName, config]) => {
        if (onlyRequired && !config.required) return;
        
        let type: FormQuestion['type'] = 'single';
        if (config.type === 'multiselect') type = 'multiple';
        else if (config.type === 'number' && fieldName.includes('level')) type = 'slider';
        else if (config.type === 'text') type = 'text';
        else if (config.type === 'number') type = 'number';
        
        questionsList.push({
          id: `${step}_${fieldName}`,
          fieldName,
          section: step,
          question: QUESTION_TEMPLATES[fieldName] || config.label,
          type,
          options: config.options,
          emoji: EMOJIS[fieldName] || EMOJIS[step] || '✨',
          category: step,
          required: config.required || false,
          minItems: config.minItems,
          maxItems: config.maxItems,
          min: config.min,
          max: config.max,
          placeholder: config.placeholder,
          description: config.description,
        });
      });
    }
    
    return questionsList;
  }, [step, onlyRequired]);

  // Initialize answers from user profile - only once per step
  useEffect(() => {
    if (!hasInitialized.current || lastUpdateRef.current !== step) {
      const initialAnswers: Record<string, any> = {};
      const profileSection = userProfile[step as keyof typeof userProfile];
      
      questions.forEach((question) => {
        if (profileSection && typeof profileSection === 'object') {
          initialAnswers[question.id] = (profileSection as any)[question.fieldName] || null;
        }
      });
      
      setAnswers(initialAnswers);
      hasInitialized.current = true;
      lastUpdateRef.current = step;
    }
  }, [step, questions]); // Only depend on step and questions (memoized)

  // Auto-scroll to current question
  useEffect(() => {
    const currentRef = questionRefs.current[currentQuestionIndex];
    if (currentRef) {
      currentRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentQuestionIndex]);

  // Update validation status
  useEffect(() => {
    const isValid = questions.every((question) => {
      const answer = answers[question.id];
      
      if (question.required) {
        if (!answer) return false;
        
        if (question.type === 'multiple' && question.minItems) {
          return answer.length >= question.minItems;
        }
        
        if (question.type === 'number' || question.type === 'slider') {
          const numValue = parseInt(answer);
          if (question.min !== undefined && numValue < question.min) return false;
          if (question.max !== undefined && numValue > question.max) return false;
        }
      }
      
      return true;
    });
    
    onValidChange(isValid);
  }, [answers, questions, onValidChange]);

  // Update user profile when answers change - with throttling
  useEffect(() => {
    if (hasInitialized.current && Object.keys(answers).length > 0) {
      const profileUpdate: Record<string, any> = {};
      
      questions.forEach((question) => {
        if (answers[question.id] !== undefined && answers[question.id] !== null) {
          profileUpdate[question.fieldName] = answers[question.id];
        }
      });
      
      if (Object.keys(profileUpdate).length > 0) {
        // Debounce the profile update to prevent rapid fire updates
        const timeoutId = setTimeout(() => {
          updateUserProfile({
            [step]: profileUpdate
          } as any);
        }, 100);
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [answers]); // Only depend on answers, not questions or other values

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    // Auto-advance for single choice questions
    const question = questions.find(q => q.id === questionId);
    if (question?.type === 'single' && currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 300);
    }
  };

  const renderQuestion = (question: FormQuestion, index: number) => {
    const isActive = index === currentQuestionIndex;
    const isPast = index < currentQuestionIndex;

    return (
      <motion.div
        key={question.id}
        ref={(el) => {
          questionRefs.current[index] = el;
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: isActive ? 1 : isPast ? 0.3 : 0.1,
          scale: isActive ? 1 : 0.8,
          filter: isActive ? 'blur(0px)' : 'blur(2px)',
        }}
        transition={{ duration: 0.5 }}
        className={`min-h-[60vh] flex items-center justify-center px-6 ${
          isActive ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        <div className="w-full max-w-sm">
          {/* Question Number & Category */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <span className="text-beauty-gray-500 text-sm uppercase tracking-wider">
              {question.category} • {index + 1}/{questions.length}
            </span>
          </motion.div>

          {/* Emoji */}
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl text-center mb-4"
          >
            {question.emoji}
          </motion.div>

          {/* Question */}
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-bold text-white text-center mb-2"
          >
            {question.question}
          </motion.h2>

          {/* Description */}
          {question.description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-beauty-gray-400 text-sm text-center mb-6"
            >
              {question.description}
            </motion.p>
          )}

          {/* Answer Options */}
          {question.type === 'single' && question.options && (
            <div className="grid grid-cols-2 gap-3">
              {question.options.map((option, i) => {
                const value = typeof option === 'string' ? option : option.value;
                const label = typeof option === 'string' ? option : option.label;
                
                return (
                  <motion.button
                    key={value}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAnswer(question.id, value)}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      answers[question.id] === value
                        ? 'border-beauty-accent bg-beauty-accent/20 text-white'
                        : 'border-beauty-gray-700 bg-beauty-charcoal/50 text-beauty-gray-300 hover:border-beauty-gray-600'
                    }`}
                  >
                    {label}
                  </motion.button>
                );
              })}
            </div>
          )}

          {question.type === 'multiple' && question.options && (
            <div className="space-y-3">
              {question.options.map((option, i) => {
                const value = typeof option === 'string' ? option : option.value;
                const label = typeof option === 'string' ? option : option.label;
                const selected = answers[question.id]?.includes(value);
                
                return (
                  <motion.button
                    key={value}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const current = answers[question.id] || [];
                      let updated;
                      
                      if (selected) {
                        updated = current.filter((a: string) => a !== value);
                      } else {
                        // Check max items limit
                        if (question.maxItems && current.length >= question.maxItems) {
                          return;
                        }
                        updated = [...current, value];
                      }
                      
                      handleAnswer(question.id, updated);
                    }}
                    className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                      selected
                        ? 'border-beauty-accent bg-beauty-accent/20 text-white'
                        : 'border-beauty-gray-700 bg-beauty-charcoal/50 text-beauty-gray-300'
                    }`}
                  >
                    <span>{label}</span>
                    <span className={`text-xl ${selected ? 'opacity-100' : 'opacity-0'}`}>
                      ✓
                    </span>
                  </motion.button>
                );
              })}
              {question.minItems && (
                <p className="text-beauty-gray-500 text-xs text-center mt-2">
                  Select at least {question.minItems} {question.maxItems && `and up to ${question.maxItems}`}
                </p>
              )}
            </div>
          )}

          {question.type === 'slider' && (
            <div className="space-y-6">
              <input
                type="range"
                min={question.min || 0}
                max={question.max || 100}
                value={answers[question.id] || 50}
                onChange={(e) => handleAnswer(question.id, e.target.value)}
                className="w-full h-3 bg-beauty-gray-700 rounded-full appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #FF1B6B 0%, #FF1B6B ${
                    ((answers[question.id] || 50) - (question.min || 0)) / ((question.max || 100) - (question.min || 0)) * 100
                  }%, #1a1a1a ${
                    ((answers[question.id] || 50) - (question.min || 0)) / ((question.max || 100) - (question.min || 0)) * 100
                  }%, #1a1a1a 100%)`,
                }}
              />
              <div className="flex justify-between text-beauty-gray-400 text-sm">
                <span>Low</span>
                <span className="text-beauty-accent font-semibold">
                  {answers[question.id] || 50}
                </span>
                <span>High</span>
              </div>
            </div>
          )}

          {question.type === 'text' && (
            <textarea
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              placeholder={question.placeholder || 'Type your answer...'}
              className="w-full p-4 bg-beauty-charcoal/50 border-2 border-beauty-gray-700 rounded-2xl text-white placeholder-beauty-gray-500 focus:border-beauty-accent focus:outline-none resize-none h-32"
            />
          )}

          {question.type === 'number' && (
            <input
              type="number"
              min={question.min}
              max={question.max}
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              placeholder={question.placeholder || 'Enter a number...'}
              className="w-full p-4 bg-beauty-charcoal/50 border-2 border-beauty-gray-700 rounded-2xl text-white placeholder-beauty-gray-500 focus:border-beauty-accent focus:outline-none text-center text-2xl"
            />
          )}

          {/* Continue button for multiple choice, text, and number */}
          {(question.type === 'multiple' || question.type === 'text' || question.type === 'number') && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (currentQuestionIndex < questions.length - 1) {
                  setCurrentQuestionIndex(prev => prev + 1);
                }
              }}
              className="mt-6 w-full btn-primary"
              disabled={question.required && !answers[question.id]}
            >
              Continue
            </motion.button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-beauty-black">
      {/* Progress indicator */}
      <div className="fixed top-0 left-0 right-0 z-20 bg-beauty-black/80 backdrop-blur-sm">
        <div className="h-1 bg-beauty-gray-800">
          <motion.div
            className="h-full bg-gradient-to-r from-beauty-accent to-beauty-secondary"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Questions container */}
      <div ref={containerRef} className="pt-8 no-scrollbar">
        {questions.map((question, index) => renderQuestion(question, index))}
      </div>

      {/* Navigation dots */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center gap-2 px-6">
        {questions.map((_, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.2 }}
            onClick={() => setCurrentQuestionIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentQuestionIndex
                ? 'w-8 bg-beauty-accent'
                : index < currentQuestionIndex
                ? 'bg-beauty-gray-600'
                : 'bg-beauty-gray-800'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ScrollBasedForm; 