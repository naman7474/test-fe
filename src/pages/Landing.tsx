import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useStore from '../store';
import beautyAPI from '../services/api';

const Landing = () => {
  const navigate = useNavigate();
  const { hasRecommendations, setUserStatus, setLoading } = useStore();

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        setLoading(true, 'Checking your profile...');
        
        // Check if user has completed onboarding
        const onboardingStatus = await beautyAPI.getOnboardingProgress();
        
        // Update store with user status
        setUserStatus(
          onboardingStatus.steps.profile.complete && onboardingStatus.steps.photo.uploaded,
          onboardingStatus.steps.recommendations.generated
        );
        
        // If user has recommendations, redirect to results
        if (onboardingStatus.steps.recommendations.generated) {
          navigate('/results', { replace: true });
        }
      } catch (error) {
        console.error('Failed to check user status:', error);
      } finally {
        setLoading(false);
      }
    };

    // Check status when component mounts
    checkUserStatus();
  }, [navigate, setUserStatus, setLoading]);

  const handleGetStarted = () => {
    // If user has recommendations, go to results, otherwise start onboarding
    if (hasRecommendations) {
      navigate('/results');
    } else {
      navigate('/onboarding');
    }
  };

  return (
    <div className="min-h-screen bg-beauty-black flex flex-col">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden">
        <motion.div
          animate={{
            background: [
              'radial-gradient(circle at 20% 80%, #FF1B6B33 0%, transparent 50%)',
              'radial-gradient(circle at 80% 20%, #45CAFF33 0%, transparent 50%)',
              'radial-gradient(circle at 40% 40%, #FF1B6B33 0%, transparent 50%)',
            ],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="absolute inset-0"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col px-6 py-12">
        {/* Logo/Brand */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gradient">BeautyAI</h1>
          <p className="text-beauty-gray-400 mt-2">Your Personal Beauty Expert</p>
        </motion.div>

        {/* Main content */}
        <div className="flex-1 flex flex-col justify-center items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Discover Your
              <br />
              <span className="text-gradient">Perfect Routine</span>
            </h2>
            <p className="text-xl text-beauty-gray-300 mb-8 max-w-md mx-auto">
              AI-powered skincare recommendations tailored just for you
            </p>
          </motion.div>

          {/* Visual element */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-12 relative"
          >
            <div className="w-48 h-48 md:w-64 md:h-64 relative">
              {/* Animated circles */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
                className="absolute inset-0 rounded-full bg-gradient-to-br from-beauty-accent to-beauty-secondary"
              />
              <motion.div
                animate={{
                  scale: [1.2, 1, 1.2],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: 0.5,
                }}
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-beauty-secondary to-beauty-accent"
              />
              
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  className="text-6xl"
                >
                  ✨
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGetStarted}
            className="btn-primary text-lg px-12 py-4 rounded-full font-semibold shadow-2xl shadow-beauty-accent/25"
          >
            Get Started
          </motion.button>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 flex flex-col items-center gap-4"
          >
            <div className="flex items-center gap-6 text-beauty-gray-400 text-sm">
              <span className="flex items-center gap-2">
                <span className="text-beauty-accent">✓</span> AI-Powered
              </span>
              <span className="flex items-center gap-2">
                <span className="text-beauty-accent">✓</span> Personalized
              </span>
              <span className="flex items-center gap-2">
                <span className="text-beauty-accent">✓</span> Science-Based
              </span>
            </div>
            <p className="text-beauty-gray-500 text-xs">
              Join 10,000+ users discovering their perfect beauty routine
            </p>
          </motion.div>
        </div>

        {/* How it works (minimal) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-auto pt-12"
        >
          <div className="flex justify-around max-w-sm mx-auto">
            {[
              { icon: '📝', label: 'Profile' },
              { icon: '📸', label: 'Photo' },
              { icon: '✨', label: 'Results' },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl mb-1">{step.icon}</div>
                <p className="text-xs text-beauty-gray-400">{step.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;