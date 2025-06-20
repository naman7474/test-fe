import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PhotoUpload from '../components/landing/PhotoUpload';
import useStore from '../store';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { photoPreview } = useStore();

  useEffect(() => {
    // Create animated gradient background without injecting a global script
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let animationFrameId: number;

    const animate = () => {
      if (!ctx) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2
      );

      gradient.addColorStop(0, 'rgba(0, 212, 255, 0.03)');
      gradient.addColorStop(0.5, 'rgba(255, 0, 255, 0.02)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Clean up on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.remove();
    };
  }, []);

  // Navigate to onboarding when photo is uploaded
  useEffect(() => {
    if (photoPreview) {
      navigate('/onboarding');
    }
  }, [photoPreview, navigate]);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-beauty-accent/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-beauty-secondary/10 rounded-full blur-3xl animate-pulse-glow" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 p-6 md:p-8"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-display font-bold text-gradient">
            BeautyAI
          </h1>
          <button className="text-beauty-gray-400 hover:text-white transition-colors">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>
      </motion.header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-6xl mx-auto">
          <div className="text-center mb-12 space-y-6">
            {/* Main headline */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-tight"
            >
              Your Personalized
              <br />
              <span className="text-gradient">Beauty Advisor</span>
            </motion.h2>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-beauty-gray-400 max-w-2xl mx-auto"
            >
              Powered by AI, tailored to you. Get science-backed skincare and makeup recommendations based on your unique profile.
            </motion.p>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-6 text-sm text-beauty-gray-500"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                100% Private
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                AI-Powered Analysis
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                10k+ Happy Users
              </span>
            </motion.div>
          </div>

          {/* Photo Upload Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center mb-12"
          >
            <div className="w-full max-w-md">
              <PhotoUpload />
            </div>
          </motion.div>

          {/* How it works */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <h3 className="text-beauty-gray-400 text-sm font-medium mb-8 uppercase tracking-wider">
              How it works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  step: '01',
                  title: 'Upload Your Photo',
                  description: 'Take or upload a clear selfie for AI-powered skin analysis',
                  icon: '📸',
                },
                {
                  step: '02',
                  title: 'Complete Your Profile',
                  description: 'Answer questions about your skin, lifestyle, and beauty preferences',
                  icon: '✨',
                },
                {
                  step: '03',
                  title: 'Get Recommendations',
                  description: 'Receive personalized product suggestions with detailed explanations',
                  icon: '💎',
                },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-beauty-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                  <div className="text-lg font-display font-bold text-beauty-accent mb-2">
                    {item.step}
                  </div>
                  <h4 className="text-white font-medium mb-2">{item.title}</h4>
                  <p className="text-beauty-gray-400 text-sm leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Alternative CTA for users without photo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-center mt-12"
          >
            <p className="text-beauty-gray-500 text-sm mb-4">
              Don't have a photo ready?
            </p>
            <button
              onClick={() => navigate('/onboarding')}
              className="text-beauty-accent hover:text-beauty-accent/80 transition-colors text-sm font-medium underline"
            >
              Start with profile questions instead
            </button>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="relative z-10 p-6 text-center text-beauty-gray-600 text-xs"
      >
        <div className="flex items-center justify-center gap-4">
          <button className="hover:text-beauty-gray-400 transition-colors">
            Privacy Policy
          </button>
          <span>•</span>
          <button className="hover:text-beauty-gray-400 transition-colors">
            Terms of Service
          </button>
        </div>
      </motion.footer>
    </div>
  );
};

export default Landing; 