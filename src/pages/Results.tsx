import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useStore from '../store';
import { ProductRecommendation } from '../types';
import beautyAPI from '../services/api';

const Results: React.FC = () => {
  const navigate = useNavigate();
  const { 
    userProfile, 
    photoPreview, 
    analysisResult, 
    selectedProduct, 
    setSelectedProduct,
    productDetailOpen,
    setProductDetailOpen,
    setAnalysisResult 
  } = useStore();
  
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'morning' | 'evening'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // Check if we already have recommendations in the store
        const currentAnalysisResult = useStore.getState().analysisResult;
        
        if (currentAnalysisResult?.recommendations) {
          setRecommendations(currentAnalysisResult.recommendations);
          setIsLoading(false);
          return;
        }

        // Otherwise, fetch from backend
        setIsLoading(true);
        const result = await beautyAPI.getFormattedRecommendations();
        setAnalysisResult(result);
        setRecommendations(result.recommendations);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch recommendations:', err);
        setError('Failed to load recommendations. Please try again.');
        setIsLoading(false);
        
        // If not authenticated, redirect to login
        if ((err as any).response?.status === 401) {
          navigate('/login');
        }
      }
    };

    fetchRecommendations();
  }, [setAnalysisResult, navigate]);

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setProductDetailOpen(true);
  };

  const handleStartOver = () => {
    // Reset store and navigate to landing
    useStore.getState().resetUserProfile();
    navigate('/');
  };

  const filteredRecommendations = recommendations.filter(rec => {
    if (activeTab === 'all') return true;
    return rec.product.usage.time === activeTab || rec.product.usage.time === 'both';
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-beauty-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-beauty-accent border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-beauty-gray-400">Loading your recommendations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-beauty-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!analysisResult || recommendations.length === 0) {
    return (
      <div className="min-h-screen bg-beauty-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-beauty-gray-400 mb-4">No recommendations available yet.</p>
          <button
            onClick={() => navigate('/onboarding')}
            className="btn-primary"
          >
            Complete Your Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beauty-black">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-beauty-black/80 backdrop-blur-md border-b border-beauty-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-display font-bold text-gradient">BeautyAI</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={handleStartOver}
                className="text-beauty-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                Start Over
              </button>
              <button 
                onClick={handleStartOver}
                className="text-beauty-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome & Analysis Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            ✨ Your Routine is Ready!
          </h2>
          <p className="text-xl text-beauty-gray-300 mb-8">
            Based on your {photoPreview ? 'photo and ' : ''}profile, here's what we recommend
          </p>

          {/* Analysis Summary */}
          {analysisResult.faceAnalysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-beauty-gray-900/50 rounded-xl p-6 mb-8 max-w-4xl mx-auto"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Your Analysis Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div>
                  <h4 className="text-beauty-accent font-medium mb-2">Detected Characteristics</h4>
                  <ul className="space-y-1 text-beauty-gray-300 text-sm">
                    <li>• Skin tone: {analysisResult.faceAnalysis.skinTone}</li>
                    <li>• Face shape: {analysisResult.faceAnalysis.faceShape}</li>
                    <li>• Analysis confidence: {Math.round(analysisResult.faceAnalysis.confidence * 100)}%</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-beauty-secondary font-medium mb-2">Areas of Focus</h4>
                  <ul className="space-y-1 text-beauty-gray-300 text-sm">
                    {analysisResult.faceAnalysis.detectedIssues.map((issue, index) => (
                      <li key={index}>• {issue}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Routine Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-beauty-gray-900/50 rounded-lg p-1 flex">
            {[
              { key: 'all', label: 'All Products', count: recommendations.length },
              { key: 'morning', label: 'Morning', count: analysisResult.routineSuggestion.morning.length },
              { key: 'evening', label: 'Evening', count: analysisResult.routineSuggestion.evening.length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-beauty-accent text-white shadow-lg'
                    : 'text-beauty-gray-400 hover:text-white'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </motion.div>

        {/* Product Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          <AnimatePresence mode="popLayout">
            {filteredRecommendations.map((recommendation, index) => (
              <motion.div
                key={recommendation.product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleProductClick(recommendation.product)}
                className="group cursor-pointer"
              >
                <div className="bg-beauty-gray-900/50 rounded-xl overflow-hidden hover:bg-beauty-gray-900/70 transition-all duration-300 hover:scale-105 border border-transparent hover:border-beauty-accent/20">
                  {/* Priority Badge */}
                  {recommendation.priority <= 3 && (
                    <div className="absolute top-4 left-4 z-10">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        recommendation.priority === 1 
                          ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                          : recommendation.priority === 2 
                          ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                          : 'bg-green-500/20 text-green-300 border border-green-500/30'
                      }`}>
                        #{recommendation.priority} Priority
                      </span>
                    </div>
                  )}

                  {/* Product Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={recommendation.product.imageUrl}
                      alt={recommendation.product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white group-hover:text-beauty-accent transition-colors line-clamp-2">
                          {recommendation.product.name}
                        </h3>
                        <p className="text-beauty-gray-400 text-sm">{recommendation.product.brand}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-beauty-accent font-bold">${recommendation.product.price}</p>
                        <p className="text-beauty-gray-500 text-xs">{recommendation.product.size}</p>
                      </div>
                    </div>

                    {/* Recommendation Reason */}
                    <p className="text-beauty-gray-300 text-sm mb-4 line-clamp-2">
                      {recommendation.reason}
                    </p>

                    {/* Key Ingredients */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {recommendation.product.keyIngredients.slice(0, 2).map((ingredient) => (
                        <span
                          key={ingredient}
                          className="inline-block px-2 py-1 bg-beauty-accent/10 text-beauty-accent text-xs rounded-md"
                        >
                          {ingredient}
                        </span>
                      ))}
                    </div>

                    {/* Rating & Usage */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {recommendation.product.rating && (
                          <>
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-400">⭐</span>
                              <span className="text-beauty-gray-300">{recommendation.product.rating}</span>
                            </div>
                            <span className="text-beauty-gray-500">
                              ({recommendation.product.reviews} reviews)
                            </span>
                          </>
                        )}
                      </div>
                      <span className="text-beauty-gray-400 capitalize">
                        {recommendation.product.usage.time === 'both' ? 'AM/PM' : recommendation.product.usage.time}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Personalized Advice */}
        {analysisResult.personalizedAdvice && analysisResult.personalizedAdvice.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-beauty-accent/10 to-beauty-secondary/10 rounded-xl p-8 border border-beauty-accent/20"
          >
            <h3 className="text-2xl font-display font-bold text-white mb-6 text-center">
              💡 Personalized Tips for You
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisResult.personalizedAdvice.map((advice, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-start gap-3 p-4 bg-white/5 rounded-lg"
                >
                  <span className="text-beauty-accent text-lg flex-shrink-0">✓</span>
                  <p className="text-beauty-gray-200 text-sm leading-relaxed">{advice}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12 pt-8 border-t border-beauty-gray-800"
        >
          <h3 className="text-xl font-semibold text-white mb-4">
            Ready to start your routine?
          </h3>
          <p className="text-beauty-gray-400 mb-6">
            Click on any product above to learn more, see usage instructions, and find purchase links.
          </p>
          <button
            onClick={handleStartOver}
            className="btn-secondary mr-4"
          >
            Create New Analysis
          </button>
          <button className="btn-primary">
            Save My Routine
          </button>
        </motion.div>
      </main>

      {/* Product Detail Modal - Coming Soon */}
      {productDetailOpen && selectedProduct && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-beauty-black/80 backdrop-blur-sm"
          onClick={() => setProductDetailOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-beauty-gray-900 rounded-xl p-6 max-w-md w-full text-center"
          >
            <h3 className="text-xl font-semibold text-white mb-4">{selectedProduct.name}</h3>
            <p className="text-beauty-gray-300 mb-6">Product details modal will be implemented soon!</p>
            <button
              onClick={() => setProductDetailOpen(false)}
              className="btn-primary"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Results; 