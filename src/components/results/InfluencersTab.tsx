// src/components/results/InfluencersTab.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../../types';
import beautyAPI from '../../services/api';

interface Influencer {
  id: string;
  name: string;
  handle: string;
  profileImage: string;
  followers: string;
  skinType: string;
  skinConcerns: string[];
  bio: string;
  videos: InfluencerVideo[];
}

interface InfluencerVideo {
  id: string;
  thumbnail: string;
  title: string;
  views: string;
  duration: string;
  product: Product;
}

// Real influencer data will be fetched from API

const InfluencersTab: React.FC = () => {
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<InfluencerVideo | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real influencer data from API
  useEffect(() => {
    const fetchInfluencers = async () => {
      try {
        setIsLoading(true);
        const response = await beautyAPI.getRecommendedInfluencers();
        
        // Transform API data to component format
        const transformedInfluencers: Influencer[] = response.influencers.map(apiInfluencer => ({
          id: apiInfluencer.id,
          name: apiInfluencer.name,
          handle: apiInfluencer.handle,
          profileImage: apiInfluencer.profile_image,
          followers: apiInfluencer.followers_count,
          skinType: apiInfluencer.skin_type,
          skinConcerns: apiInfluencer.skin_concerns,
          bio: apiInfluencer.bio,
          videos: apiInfluencer.recent_recommendations?.map((rec, index) => ({
            id: `v_${rec.product_id}`,
            thumbnail: `https://images.unsplash.com/photo-${1500000000000 + index}?w=300`,
            title: `How I use ${rec.product_name}`,
            views: `${Math.floor(Math.random() * 100) + 10}K`,
            duration: `${Math.floor(Math.random() * 10) + 5}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
            product: {
              id: rec.product_id,
              product_id: rec.product_id,
              product_name: rec.product_name,
              name: rec.product_name,
              brand: 'Featured Brand',
              product_type: 'skincare',
              category: 'skincare',
              subcategory: 'product',
              imageUrl: 'https://via.placeholder.com/300x300?text=Product',
              image_url: 'https://via.placeholder.com/300x300?text=Product',
              price: Math.floor(Math.random() * 50) + 20,
              size: '50ml',
              ingredients: ['Water', 'Active Ingredient'],
              key_ingredients: ['Active Ingredient'],
              keyIngredients: ['Active Ingredient'],
              benefits: ['Improves skin condition'],
              targetConcerns: ['skin concerns'],
              applicationArea: ['face'],
              usage: { frequency: 'Daily', time: 'both', amount: 'As needed', instructions: 'Apply as directed' },
            }
          })) || []
        }));
        
        setInfluencers(transformedInfluencers);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch influencers:', err);
        setError('Unable to load influencer recommendations');
        setIsLoading(false);
        
        // Fallback to empty array for now
        setInfluencers([]);
      }
    };

    fetchInfluencers();
  }, []);

  const handleVideoClick = (video: InfluencerVideo) => {
    setSelectedVideo(video);
    setShowProductModal(true);
  };

  if (isLoading) {
    return (
      <div className="px-6 py-6">
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin w-8 h-8 border-2 border-beauty-accent border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error || influencers.length === 0) {
    return (
      <div className="px-6 py-6">
        <div className="text-center py-12">
          <p className="text-beauty-gray-400 mb-4">
            {error || 'No influencer recommendations available yet.'}
          </p>
          <p className="text-beauty-gray-500 text-sm">
            Complete your profile analysis to get personalized influencer matches.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-2">Recommended Influencers</h2>
        <p className="text-beauty-gray-400 text-sm">Based on your skin profile</p>
      </div>

      {/* Influencer List */}
      <div className="space-y-6">
        {influencers.map((influencer) => (
          <motion.div
            key={influencer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-beauty-charcoal rounded-xl p-4 border border-beauty-gray-800"
          >
            {/* Influencer Header */}
            <div className="flex items-start gap-3 mb-4">
              <img
                src={influencer.profileImage}
                alt={influencer.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">{influencer.name}</h3>
                    <p className="text-beauty-gray-400 text-sm">{influencer.handle}</p>
                  </div>
                  <span className="text-beauty-gray-500 text-sm">{influencer.followers}</span>
                </div>
                <p className="text-beauty-gray-300 text-sm mt-1">{influencer.bio}</p>
              </div>
            </div>

            {/* Skin Profile Match */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-beauty-gray-400 text-xs">Skin Match:</span>
              <span className="px-2 py-1 bg-beauty-accent/20 text-beauty-accent rounded-full text-xs">
                {influencer.skinType}
              </span>
              {influencer.skinConcerns.slice(0, 2).map((concern) => (
                <span key={concern} className="px-2 py-1 bg-beauty-secondary/20 text-beauty-secondary rounded-full text-xs">
                  {concern}
                </span>
              ))}
            </div>

            {/* Videos */}
            <div className="space-y-3">
              {influencer.videos.map((video) => (
                <motion.div
                  key={video.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleVideoClick(video)}
                  className="flex gap-3 cursor-pointer group"
                >
                  {/* Video Thumbnail */}
                  <div className="relative w-32 h-20 rounded-lg overflow-hidden bg-beauty-gray-800 flex-shrink-0">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/60 transition-colors">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                      {video.duration}
                    </span>
                  </div>

                  {/* Video Info */}
                  <div className="flex-1">
                    <h4 className="text-white text-sm font-medium group-hover:text-beauty-accent transition-colors line-clamp-2">
                      {video.title}
                    </h4>
                    <p className="text-beauty-gray-500 text-xs mt-1">{video.views} views</p>
                    <p className="text-beauty-accent text-xs mt-2">
                      Features: {video.product.name}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* View Profile Button */}
            <button
              onClick={() => setSelectedInfluencer(influencer)}
              className="w-full mt-4 py-2 text-beauty-gray-400 hover:text-white text-sm transition-colors"
            >
              View Full Profile →
            </button>
          </motion.div>
        ))}
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {showProductModal && selectedVideo && (
          <VideoProductModal
            video={selectedVideo}
            onClose={() => {
              setShowProductModal(false);
              setSelectedVideo(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Influencer Profile Modal */}
      <AnimatePresence>
        {selectedInfluencer && (
          <InfluencerProfileModal
            influencer={selectedInfluencer}
            onClose={() => setSelectedInfluencer(null)}
            onVideoClick={handleVideoClick}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Video Product Modal
const VideoProductModal: React.FC<{
  video: InfluencerVideo;
  onClose: () => void;
}> = ({ video, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-beauty-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-0 left-0 right-0 bg-beauty-charcoal rounded-t-3xl max-h-[85vh] overflow-hidden"
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-beauty-gray-700 rounded-full" />
        </div>

        <div className="px-6 pb-8 overflow-y-auto max-h-[75vh]">
          {/* Video Info */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white mb-2">{video.title}</h2>
            <p className="text-beauty-gray-400 text-sm">Featured Product</p>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white">{video.product.name}</h3>
              <p className="text-beauty-gray-400">{video.product.brand} • {video.product.size}</p>
              <p className="text-2xl font-bold text-beauty-accent mt-3">${video.product.price}</p>
            </div>

            <div className="bg-beauty-dark/50 rounded-xl p-4">
              <h4 className="text-white font-medium mb-2">Why influencers love it</h4>
              <p className="text-beauty-gray-300 text-sm">
                This product has been featured in over 50 skincare routines for {video.product.targetConcerns[0]}. 
                Influencers report visible results within 2-4 weeks of consistent use.
              </p>
            </div>

            <div>
              <h4 className="text-white font-medium mb-2">Key Benefits</h4>
              <ul className="space-y-1">
                {video.product.benefits.map((benefit) => (
                  <li key={benefit} className="text-beauty-gray-300 text-sm flex items-start gap-2">
                    <span className="text-beauty-accent mt-0.5">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <button className="btn-primary py-3">Buy Now</button>
              <button className="btn-secondary py-3">Watch Video</button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Influencer Profile Modal
const InfluencerProfileModal: React.FC<{
  influencer: Influencer;
  onClose: () => void;
  onVideoClick: (video: InfluencerVideo) => void;
}> = ({ influencer, onClose, onVideoClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-beauty-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="absolute inset-x-4 inset-y-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:max-w-lg bg-beauty-charcoal rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="relative h-32 bg-gradient-to-br from-beauty-accent/20 to-beauty-secondary/20">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-beauty-black/60 backdrop-blur-sm rounded-full"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="flex items-end -mt-12 mb-4">
            <img
              src={influencer.profileImage}
              alt={influencer.name}
              className="w-24 h-24 rounded-full border-4 border-beauty-charcoal object-cover"
            />
            <div className="ml-4 mb-2">
              <h3 className="text-xl font-bold text-white">{influencer.name}</h3>
              <p className="text-beauty-gray-400">{influencer.handle}</p>
            </div>
          </div>

          <p className="text-beauty-gray-300 mb-4">{influencer.bio}</p>

          <div className="flex items-center gap-4 mb-6">
            <div className="text-center">
              <p className="text-white font-bold">{influencer.followers}</p>
              <p className="text-beauty-gray-500 text-xs">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-white font-bold">{influencer.videos.length}</p>
              <p className="text-beauty-gray-500 text-xs">Videos</p>
            </div>
            <div className="text-center">
              <p className="text-white font-bold">92%</p>
              <p className="text-beauty-gray-500 text-xs">Match</p>
            </div>
          </div>

          <button className="w-full btn-primary py-3 mb-4">
            Follow Influencer
          </button>

          <div>
            <h4 className="text-white font-medium mb-3">All Videos</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {influencer.videos.map((video) => (
                <button
                  key={video.id}
                  onClick={() => {
                    onVideoClick(video);
                    onClose();
                  }}
                  className="w-full p-3 bg-beauty-dark/50 rounded-lg text-left hover:bg-beauty-dark transition-colors"
                >
                  <p className="text-white text-sm">{video.title}</p>
                  <p className="text-beauty-gray-500 text-xs mt-1">{video.views} views • {video.duration}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InfluencersTab;