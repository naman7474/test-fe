import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useStore from '../store';
import beautyAPI from '../services/api';

const FaceAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const { 
    photoPreview, 
    uploadedPhoto, 
    setLoading, 
    setAnalysisResult, 
    setCurrentSessionId 
  } = useStore();
  
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Initializing analysis...');
  const [error, setError] = useState<string | null>(null);
  const [facePoints, setFacePoints] = useState<Array<{x: number, y: number, delay: number}>>([]);

  useEffect(() => {
    if (!photoPreview || !uploadedPhoto) {
      navigate('/onboarding');
      return;
    }

    const performAnalysis = async () => {
      try {
        setLoading(true, 'Starting face analysis...');
        
        // Step 1: Upload photo
        const uploadResponse = await beautyAPI.uploadPhoto(uploadedPhoto);
        
        if (!uploadResponse.success) {
          throw new Error('Upload failed');
        }

        const sessionId = uploadResponse.data.session_id;
        setCurrentSessionId(sessionId);

        // Generate face detection points for animation
        generateFacePoints();
        
        // Step 2: Poll for analysis completion
        const pollForResults = async () => {
          try {
            const statusResponse = await beautyAPI.getAnalysisStatus(sessionId);
            
            // Calculate progress based on status
            let progress = 0;
            let currentStep = 'Initializing...';
            
            if (statusResponse.data.status === 'pending') {
              progress = 10;
              currentStep = 'Preparing analysis...';
            } else if (statusResponse.data.status === 'processing') {
              progress = 50;
              currentStep = 'Analyzing facial features...';
            } else if (statusResponse.data.status === 'completed') {
              progress = 100;
              currentStep = 'Analysis complete!';
            }
            
            setProgress(progress);
            setCurrentStep(currentStep);
            
            if (statusResponse.data.status === 'completed') {
              // Get recommendations after analysis is complete
              try {
                const analysisResult = await beautyAPI.getFormattedRecommendations();
                setAnalysisResult(analysisResult);
                setLoading(false);
                
                // Show completion message briefly before navigating
                setTimeout(() => {
                  navigate('/results');
                }, 1500);
              } catch (err) {
                console.error('Failed to get recommendations:', err);
                throw new Error('Failed to generate recommendations');
              }
            } else if (statusResponse.data.status === 'failed') {
              throw new Error('Analysis failed');
            } else {
              // Continue polling
              setTimeout(pollForResults, 1500);
            }
          } catch (err) {
            throw err;
          }
        };

        // Start polling
        setTimeout(pollForResults, 1000);

      } catch (err) {
        console.error('Analysis failed:', err);
        setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
        setLoading(false);
      }
    };

    const generateFacePoints = () => {
      // Generate realistic face detection points
      const points = [];
      
      // Face outline points
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const x = 50 + Math.cos(angle) * 35;
        const y = 50 + Math.sin(angle) * 40;
        points.push({ x, y, delay: i * 0.1 });
      }
      
      // Eyes
      points.push({ x: 35, y: 40, delay: 1.5 });
      points.push({ x: 65, y: 40, delay: 1.6 });
      
      // Nose
      points.push({ x: 50, y: 55, delay: 1.8 });
      
      // Mouth
      points.push({ x: 45, y: 70, delay: 2.0 });
      points.push({ x: 55, y: 70, delay: 2.1 });
      
      setFacePoints(points);
    };

    performAnalysis();
  }, [photoPreview, uploadedPhoto, navigate, setLoading, setAnalysisResult, setCurrentSessionId]);

  if (!photoPreview) {
    return null;
  }

  return (
    <div className="min-h-screen bg-beauty-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <div className="floating-panel p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-display font-bold text-white mb-2"
            >
              Analyzing Your Face
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-beauty-gray-400"
            >
              Our AI is detecting your unique features and skin characteristics
            </motion.p>
          </div>

          {/* Photo with advanced overlay */}
          <div className="relative mb-8 rounded-xl overflow-hidden">
            <img
              src={photoPreview}
              alt="Face analysis in progress"
              className="w-full h-96 object-cover"
            />
            
            {/* Multi-layered scanning overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Grid overlay */}
              <svg
                className="absolute inset-0 w-full h-full opacity-30"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <defs>
                  <pattern
                    id="analysis-grid"
                    width="5"
                    height="5"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 5 0 L 0 0 0 5"
                      fill="none"
                      stroke="rgba(0, 212, 255, 0.4)"
                      strokeWidth="0.3"
                    />
                  </pattern>
                  <linearGradient id="scanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(0, 212, 255, 0)" />
                    <stop offset="50%" stopColor="rgba(0, 212, 255, 0.8)" />
                    <stop offset="100%" stopColor="rgba(0, 212, 255, 0)" />
                  </linearGradient>
                </defs>
                <rect width="100" height="100" fill="url(#analysis-grid)" />
              </svg>

              {/* Primary scanning line */}
              <motion.div
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-beauty-accent to-transparent"
                initial={{ top: '-5%' }}
                animate={{ top: '105%' }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />

              {/* Secondary scanning line */}
              <motion.div
                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-beauty-secondary to-transparent opacity-60"
                initial={{ top: '-3%' }}
                animate={{ top: '103%' }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: 0.5,
                }}
              />

              {/* Face detection points */}
              {progress > 15 && (
                <AnimatePresence>
                  {facePoints.map((point, index) => (
                    <motion.div
                      key={index}
                      className="absolute"
                      style={{
                        left: `${point.x}%`,
                        top: `${point.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ delay: point.delay, duration: 0.3 }}
                    >
                      <div className="relative">
                        <div className="w-3 h-3 bg-beauty-accent rounded-full shadow-lg shadow-beauty-accent/50" />
                        <motion.div
                          className="absolute inset-0 bg-beauty-accent rounded-full"
                          animate={{ scale: [1, 2, 1], opacity: [0.7, 0, 0.7] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              {/* Face region highlights */}
              {progress > 50 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0"
                >
                  {/* T-zone highlight */}
                  <motion.div
                    className="absolute bg-yellow-400/20 rounded-full"
                    style={{
                      left: '45%',
                      top: '35%',
                      width: '10%',
                      height: '15%',
                      transform: 'translate(-50%, -50%)',
                    }}
                    animate={{ opacity: [0, 0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  
                  {/* Cheek areas */}
                  <motion.div
                    className="absolute bg-pink-400/20 rounded-full"
                    style={{
                      left: '25%',
                      top: '55%',
                      width: '12%',
                      height: '12%',
                      transform: 'translate(-50%, -50%)',
                    }}
                    animate={{ opacity: [0, 0.4, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                  />
                  
                  <motion.div
                    className="absolute bg-pink-400/20 rounded-full"
                    style={{
                      left: '75%',
                      top: '55%',
                      width: '12%',
                      height: '12%',
                      transform: 'translate(-50%, -50%)',
                    }}
                    animate={{ opacity: [0, 0.4, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: 0.7 }}
                  />
                </motion.div>
              )}

              {/* Analysis complete overlay */}
              {progress >= 100 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-beauty-black/30"
                >
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', duration: 0.6 }}
                      className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-white font-medium"
                    >
                      Analysis Complete!
                    </motion.p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Progress section */}
          <div className="space-y-6">
            {/* Progress bar */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-medium text-beauty-gray-300">Analysis Progress</p>
                <p className="text-sm font-bold text-beauty-accent">{progress}%</p>
              </div>
              <div className="relative h-3 bg-beauty-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-beauty-accent to-beauty-secondary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
                
                {/* Progress shine effect */}
                <motion.div
                  className="absolute top-0 h-full w-8 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: [-32, 400] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            </div>

            {/* Current step */}
            <div className="text-center">
              {error ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
                >
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-400 font-medium">Analysis Failed</p>
                  </div>
                  <p className="text-red-300 text-sm mb-4">{error}</p>
                  <button
                    onClick={() => navigate('/onboarding')}
                    className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-3"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-beauty-accent border-t-transparent rounded-full"
                  />
                  <p className="text-beauty-gray-300 font-medium">{currentStep}</p>
                </motion.div>
              )}
            </div>

            {/* Analysis features */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              {[
                { label: 'Skin Type Analysis', complete: progress > 20 },
                { label: 'Tone Detection', complete: progress > 40 },
                { label: 'Concern Mapping', complete: progress > 60 },
                { label: 'Product Matching', complete: progress > 80 },
              ].map((feature, index) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    feature.complete 
                      ? 'bg-green-500/10 border border-green-500/20' 
                      : 'bg-beauty-gray-800/50'
                  }`}
                >
                  {feature.complete ? (
                    <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <div className="w-5 h-5 border-2 border-beauty-gray-600 rounded-full" />
                  )}
                  <span className={`text-sm font-medium ${
                    feature.complete ? 'text-green-300' : 'text-beauty-gray-400'
                  }`}>
                    {feature.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FaceAnalysis; 