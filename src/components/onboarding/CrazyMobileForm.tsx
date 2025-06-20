// src/components/onboarding/CrazyMobileForm.tsx
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import useStore from '../../store';

interface FormQuestion {
  id: string;
  question: string;
  type: 'single' | 'multiple' | 'slider' | 'text';
  options?: string[];
  emoji?: string;
  category: string;
}

const CrazyMobileForm: React.FC = () => {
  const { updateUserProfile } = useStore();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // All questions in one flow
  const questions: FormQuestion[] = [
    // Skin Questions
    {
      id: 'skinType',
      question: 'How does your skin feel?',
      type: 'single',
      options: ['Dry & Tight', 'Oily & Shiny', 'Combination', 'Normal & Balanced'],
      emoji: '💧',
      category: 'skin'
    },
    {
      id: 'skinConcerns',
      question: 'What bothers you most?',
      type: 'multiple',
      options: ['Acne', 'Dark Spots', 'Wrinkles', 'Large Pores', 'Redness', 'Dullness'],
      emoji: '🎯',
      category: 'skin'
    },
    {
      id: 'skinSensitivity',
      question: 'How sensitive is your skin?',
      type: 'slider',
      emoji: '🌡️',
      category: 'skin'
    },
    // Hair Questions
    {
      id: 'hairType',
      question: 'What\'s your hair type?',
      type: 'single',
      options: ['Straight', 'Wavy', 'Curly', 'Coily'],
      emoji: '💁‍♀️',
      category: 'hair'
    },
    {
      id: 'hairConcerns',
      question: 'Hair struggles?',
      type: 'multiple',
      options: ['Frizz', 'Dryness', 'Oiliness', 'Hair Fall', 'Damage', 'Dandruff'],
      emoji: '✨',
      category: 'hair'
    },
    // Lifestyle Questions
    {
      id: 'sleepHours',
      question: 'How many hours do you sleep?',
      type: 'single',
      options: ['< 5 hours', '5-7 hours', '7-9 hours', '> 9 hours'],
      emoji: '😴',
      category: 'lifestyle'
    },
    {
      id: 'waterIntake',
      question: 'Water intake per day?',
      type: 'single',
      options: ['< 4 glasses', '4-6 glasses', '6-8 glasses', '> 8 glasses'],
      emoji: '💧',
      category: 'lifestyle'
    },
    {
      id: 'stressLevel',
      question: 'Stress level lately?',
      type: 'slider',
      emoji: '😰',
      category: 'lifestyle'
    },
    // Health Questions
    {
      id: 'allergies',
      question: 'Any allergies?',
      type: 'text',
      emoji: '🤧',
      category: 'health'
    },
    {
      id: 'medications',
      question: 'Taking any medications?',
      type: 'text',
      emoji: '💊',
      category: 'health'
    },
    // Makeup Questions
    {
      id: 'makeupFrequency',
      question: 'How often do you wear makeup?',
      type: 'single',
      options: ['Daily', '3-4x/week', 'Occasionally', 'Never'],
      emoji: '💄',
      category: 'makeup'
    },
    {
      id: 'makeupStyle',
      question: 'Your go-to look?',
      type: 'single',
      options: ['Natural', 'Glam', 'Bold', 'Minimal'],
      emoji: '✨',
      category: 'makeup'
    }
  ];

  // Auto-scroll to current question
  useEffect(() => {
    const currentRef = questionRefs.current[currentQuestionIndex];
    if (currentRef) {
      currentRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentQuestionIndex]);

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    // Auto-advance after a short delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    }, 300);
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
            className="text-2xl font-bold text-white text-center mb-8"
          >
            {question.question}
          </motion.h2>

          {/* Answer Options */}
          {question.type === 'single' && question.options && (
            <div className="grid grid-cols-2 gap-3">
              {question.options.map((option, i) => (
                <motion.button
                  key={option}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAnswer(question.id, option)}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    answers[question.id] === option
                      ? 'border-beauty-accent bg-beauty-accent/20 text-white'
                      : 'border-beauty-gray-700 bg-beauty-charcoal/50 text-beauty-gray-300 hover:border-beauty-gray-600'
                  }`}
                >
                  {option}
                </motion.button>
              ))}
            </div>
          )}

          {question.type === 'multiple' && question.options && (
            <div className="space-y-3">
              {question.options.map((option, i) => {
                const selected = answers[question.id]?.includes(option);
                return (
                  <motion.button
                    key={option}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const current = answers[question.id] || [];
                      const updated = selected
                        ? current.filter((a: string) => a !== option)
                        : [...current, option];
                      handleAnswer(question.id, updated);
                    }}
                    className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                      selected
                        ? 'border-beauty-accent bg-beauty-accent/20 text-white'
                        : 'border-beauty-gray-700 bg-beauty-charcoal/50 text-beauty-gray-300'
                    }`}
                  >
                    <span>{option}</span>
                    <span className={`text-xl ${selected ? 'opacity-100' : 'opacity-0'}`}>
                      ✓
                    </span>
                  </motion.button>
                );
              })}
            </div>
          )}

          {question.type === 'slider' && (
            <div className="space-y-6">
              <input
                type="range"
                min="0"
                max="100"
                value={answers[question.id] || 50}
                onChange={(e) => handleAnswer(question.id, e.target.value)}
                className="w-full h-3 bg-beauty-gray-700 rounded-full appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #FF1B6B 0%, #FF1B6B ${
                    answers[question.id] || 50
                  }%, #1a1a1a ${answers[question.id] || 50}%, #1a1a1a 100%)`,
                }}
              />
              <div className="flex justify-between text-beauty-gray-400 text-sm">
                <span>Low</span>
                <span className="text-beauty-accent font-semibold">
                  {answers[question.id] || 50}%
                </span>
                <span>High</span>
              </div>
            </div>
          )}

          {question.type === 'text' && (
            <textarea
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              placeholder="Type your answer..."
              className="w-full p-4 bg-beauty-charcoal/50 border-2 border-beauty-gray-700 rounded-2xl text-white placeholder-beauty-gray-500 focus:border-beauty-accent focus:outline-none resize-none h-32"
            />
          )}

          {/* Continue button for multiple choice and text */}
          {(question.type === 'multiple' || question.type === 'text') && (
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
      <div ref={containerRef} className="pt-8">
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

      {/* Complete button */}
      {currentQuestionIndex === questions.length - 1 && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-20 left-6 right-6"
        >
          <button
            onClick={() => {
              // Save profile and navigate
              window.location.href = '/photo-upload';
            }}
            className="w-full btn-primary text-lg font-semibold py-4"
          >
            Complete Profile ✨
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default CrazyMobileForm;

