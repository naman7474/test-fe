import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useStore from '../../store';

const PhotoUpload: React.FC = () => {
  const navigate = useNavigate();
  const { setUploadedPhoto, setLoading } = useStore();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size should be less than 10MB');
        return;
      }

      try {
        setError(null);
        setLoading(true, 'Processing your photo...');

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setPreview(result);
          setUploadedPhoto(file, result);

          // Don't navigate automatically - let the parent component handle it
          setLoading(false);
        };
        reader.readAsDataURL(file);
      } catch (err) {
        setError('Failed to process image');
        setLoading(false);
      }
    },
    [setUploadedPhoto, setLoading]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative group cursor-pointer
          floating-panel p-8 md:p-12
          transition-all duration-300
          ${isDragging ? 'border-beauty-accent scale-105' : ''}
          ${preview ? 'p-4' : ''}
        `}
      >
        <input
          type="file"
          accept="image/*"
          capture="user"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative"
            >
              <img
                src={preview}
                alt="Uploaded preview"
                className="w-full h-64 object-cover rounded-lg"
              />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-gradient-to-t from-beauty-black/80 to-transparent rounded-lg flex items-end justify-center pb-4"
              >
                <p className="text-white font-medium">Processing...</p>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-4"
            >
              {/* Upload icon */}
              <div className="mx-auto w-24 h-24 relative">
                <motion.div
                  animate={{
                    scale: isDragging ? 1.1 : 1,
                    rotate: isDragging ? 5 : 0,
                  }}
                  className="w-full h-full"
                >
                  <svg
                    className="w-full h-full text-beauty-gray-600 group-hover:text-beauty-accent transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </motion.div>

                {/* Camera icon overlay */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-beauty-accent rounded-full flex items-center justify-center"
                >
                  <svg
                    className="w-6 h-6 text-beauty-black"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </motion.div>
              </div>

              {/* Upload text */}
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">
                  Upload a selfie to get started
                </h3>
                <p className="text-beauty-gray-400 text-sm">
                  Drag & drop or click to browse
                </p>
                <p className="text-beauty-gray-500 text-xs">
                  For best results, use a clear, makeup-free photo in good lighting
                </p>
              </div>

              {/* Mobile camera hint */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="md:hidden text-beauty-accent text-sm font-medium"
              >
                📸 Tap to open camera
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute -bottom-12 left-0 right-0 text-center"
            >
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Privacy notice */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-6 text-beauty-gray-500 text-xs"
      >
        🔒 Your photo is 100% private and secure. We'll never share it.
      </motion.p>
    </motion.div>
  );
};

export default PhotoUpload; 