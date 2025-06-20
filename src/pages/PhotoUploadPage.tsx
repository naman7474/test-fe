// src/pages/PhotoUploadPage.tsx
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useStore from '../store';

const PhotoUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUploadedPhoto, setLoading } = useStore();
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        setUploadedPhoto(file, result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleAnalyze = () => {
    if (preview) {
      setLoading(true, 'Analyzing your photo...');
      // The loading screen will handle the navigation
    }
  };

  const handleSkip = () => {
    navigate('/results');
  };

  return (
    <div className="min-h-screen bg-beauty-black flex flex-col">
      {/* Header */}
      <header className="px-6 py-4">
        <button
          onClick={() => navigate('/onboarding')}
          className="flex items-center gap-2 text-beauty-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Title */}
          <div className="text-center mb-8">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-5xl mb-4"
            >
              📸
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Let's see that beautiful face!
            </h1>
            <p className="text-beauty-gray-400">
              Upload a selfie for personalized analysis
            </p>
          </div>

          {/* Upload area */}
          <AnimatePresence mode="wait">
            {!preview ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mb-8"
              >
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative aspect-square rounded-3xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${
                    isDragging
                      ? 'border-beauty-accent bg-beauty-accent/10'
                      : 'border-beauty-gray-700 bg-beauty-charcoal/50 hover:border-beauty-gray-600'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                    className="hidden"
                  />

                  {/* Upload UI */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                    <motion.div
                      animate={{
                        y: [0, -10, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                      className="mb-4"
                    >
                      <svg className="w-16 h-16 text-beauty-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </motion.div>
                    <p className="text-white font-medium mb-2">
                      {isDragging ? 'Drop your photo here' : 'Click or drag to upload'}
                    </p>
                    <p className="text-beauty-gray-500 text-sm text-center">
                      For best results, use good lighting and face the camera directly
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mb-8"
              >
                <div className="relative aspect-square rounded-3xl overflow-hidden">
                  <img
                    src={preview}
                    alt="Your selfie"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Retake button */}
                  <button
                    onClick={() => {
                      setPreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="absolute top-4 right-4 p-3 bg-beauty-black/60 backdrop-blur-sm rounded-full hover:bg-beauty-black/80 transition-colors"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>

                  {/* Success overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-gradient-to-t from-beauty-black/60 to-transparent flex items-end p-6"
                  >
                    <div className="text-white">
                      <p className="font-semibold">Perfect shot! ✨</p>
                      <p className="text-sm text-beauty-gray-300">Ready for analysis</p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action buttons */}
          <div className="space-y-4">
            {preview ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAnalyze}
                  className="w-full btn-primary text-lg py-4"
                >
                  Analyze My Skin →
                </motion.button>
                <button
                  onClick={() => {
                    setPreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="w-full text-beauty-gray-400 hover:text-white transition-colors"
                >
                  Take Another Photo
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full btn-primary text-lg py-4"
                >
                  Take a Selfie
                </button>
                <button
                  onClick={handleSkip}
                  className="w-full text-beauty-gray-400 hover:text-white transition-colors"
                >
                  Skip for now
                </button>
              </>
            )}
          </div>

          {/* Privacy note */}
          <p className="text-center text-beauty-gray-500 text-xs mt-8">
            🔒 Your photos are processed securely and never stored
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default PhotoUploadPage;