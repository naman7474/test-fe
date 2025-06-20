// src/components/common/EnhancedLoadingScreen.tsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EnhancedLoadingScreenProps {
  imageUrl: string;
  onComplete?: () => void;
}

const EnhancedLoadingScreen: React.FC<EnhancedLoadingScreenProps> = ({ 
  imageUrl, 
  onComplete 
}) => {
  const [loadingPhase, setLoadingPhase] = useState(0);

  useEffect(() => {
    const phases = [
      { duration: 1500, phase: 1 }, // Scan effect
      { duration: 1500, phase: 2 }, // Point detection
      { duration: 1500, phase: 3 }, // Analysis waves
      { duration: 1000, phase: 4 }, // Complete
    ];

    let totalDelay = 0;
    phases.forEach(({ duration, phase }) => {
      setTimeout(() => setLoadingPhase(phase), totalDelay);
      totalDelay += duration;
    });

    setTimeout(() => {
      if (onComplete) onComplete();
    }, totalDelay);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-beauty-black z-50 flex items-center justify-center overflow-hidden">
      <div className="relative w-full max-w-md aspect-square">
        {/* Base image with effects */}
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="relative w-full h-full rounded-3xl overflow-hidden">
            {/* Image */}
            <img 
              src={imageUrl} 
              alt="Analysis" 
              className="w-full h-full object-cover"
            />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/30" />

            {/* Phase 1: Scan lines */}
            <AnimatePresence>
              {loadingPhase >= 1 && loadingPhase < 4 && (
                <>
                  <motion.div
                    initial={{ y: '-100%' }}
                    animate={{ y: '100%' }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="absolute inset-x-0 h-1 bg-gradient-to-b from-transparent via-beauty-accent to-transparent"
                    style={{ filter: 'blur(1px)' }}
                  />
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="absolute inset-y-0 w-1 bg-gradient-to-r from-transparent via-beauty-secondary to-transparent"
                    style={{ filter: 'blur(1px)' }}
                  />
                </>
              )}
            </AnimatePresence>

            {/* Phase 2: Detection points */}
            <AnimatePresence>
              {loadingPhase >= 2 && loadingPhase < 4 && (
                <svg className="absolute inset-0 w-full h-full">
                  {/* Face landmark points */}
                  {[
                    { x: '30%', y: '35%', delay: 0 },    // Left eye
                    { x: '70%', y: '35%', delay: 0.1 },  // Right eye
                    { x: '50%', y: '45%', delay: 0.2 },  // Nose
                    { x: '50%', y: '65%', delay: 0.3 },  // Mouth
                    { x: '25%', y: '50%', delay: 0.4 },  // Left cheek
                    { x: '75%', y: '50%', delay: 0.5 },  // Right cheek
                    { x: '50%', y: '25%', delay: 0.6 },  // Forehead
                  ].map((point, i) => (
                    <motion.g key={i}>
                      <motion.circle
                        cx={point.x}
                        cy={point.y}
                        r="3"
                        fill="#FF1B6B"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ 
                          scale: [0, 1.5, 1],
                          opacity: [0, 1, 0.6],
                        }}
                        transition={{
                          delay: point.delay,
                          duration: 0.6,
                        }}
                      />
                      <motion.circle
                        cx={point.x}
                        cy={point.y}
                        r="8"
                        fill="none"
                        stroke="#FF1B6B"
                        strokeWidth="1"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ 
                          scale: [0, 2, 3],
                          opacity: [0, 0.5, 0],
                        }}
                        transition={{
                          delay: point.delay,
                          duration: 1.5,
                          repeat: Infinity,
                        }}
                      />
                    </motion.g>
                  ))}

                  {/* Connecting lines */}
                  {loadingPhase >= 3 && (
                    <motion.path
                      d="M 30% 35% Q 50% 30% 70% 35% Q 75% 50% 50% 65% Q 25% 50% 30% 35%"
                      fill="none"
                      stroke="#45CAFF"
                      strokeWidth="1"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ 
                        pathLength: 1,
                        opacity: [0, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        ease: 'easeInOut',
                      }}
                      style={{ filter: 'blur(1px)' }}
                    />
                  )}
                </svg>
              )}
            </AnimatePresence>

            {/* Phase 3: Analysis waves */}
            <AnimatePresence>
              {loadingPhase >= 3 && loadingPhase < 4 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute w-full h-full rounded-full border border-beauty-accent/30"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{
                        scale: [0.5, 2, 3],
                        opacity: [0, 0.5, 0],
                      }}
                      transition={{
                        delay: i * 0.5,
                        duration: 2,
                        repeat: Infinity,
                      }}
                    />
                  ))}
                </div>
              )}
            </AnimatePresence>

            {/* Phase 4: Complete checkmark */}
            <AnimatePresence>
              {loadingPhase === 4 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/60"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ duration: 0.5 }}
                    className="w-24 h-24 rounded-full bg-beauty-accent flex items-center justify-center"
                  >
                    <svg className="w-12 h-12 text-beauty-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <motion.path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      />
                    </svg>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-beauty-accent rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                x: [0, Math.random() * 50 - 25, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnhancedLoadingScreen;