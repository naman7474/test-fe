// src/App.tsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import useStore from './store';
import beautyAPI from './services/api';

// Import components
import LoginSignup from './pages/LoginSignup';
import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import FaceAnalysis from './pages/FaceAnalysis';
import Results from './pages/Results';
import EnhancedLoadingScreen from './components/common/EnhancedLoadingScreen';

// Initialization Component
const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { hasRecommendations, setUserStatus, setLoading } = useStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      const authToken = localStorage.getItem('authToken');
      
      if (authToken) {
        try {
          setLoading(true, 'Checking your profile...');
          
          // Check onboarding status from backend
          const onboardingStatus = await beautyAPI.getOnboardingProgress();
          
          // Update store with user status
          setUserStatus(
            onboardingStatus.steps.profile.complete && onboardingStatus.steps.photo.uploaded,
            onboardingStatus.steps.recommendations.generated
          );
          
          // Redirect returning users to results if they have recommendations
          if (onboardingStatus.steps.recommendations.generated) {
            navigate('/results', { replace: true });
          }
        } catch (error) {
          console.error('Failed to check user status:', error);
          // If error, let normal flow continue
        } finally {
          setLoading(false);
        }
      }
      
      setInitialized(true);
    };

    initializeApp();
  }, [navigate, setUserStatus, setLoading]);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-beauty-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-beauty-accent border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-beauty-gray-400">Initializing...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authToken = localStorage.getItem('authToken');
  return authToken ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  const { isLoading, loadingMessage } = useStore();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Check authentication on mount
    setAuthChecked(true);
  }, []);

  if (!authChecked) {
    return <div className="min-h-screen bg-beauty-black" />;
  }

  return (
    <Router>
      <AppInitializer>
        <div className="App">
          {/* Loading overlay */}
          <AnimatePresence>
            {isLoading && (
              <div className="fixed inset-0 z-50 bg-beauty-black/90 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-beauty-accent border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-beauty-gray-400">{loadingMessage || 'Loading...'}</p>
                </div>
              </div>
            )}
          </AnimatePresence>

          <Routes>
            {/* Public route */}
            <Route path="/login" element={<LoginSignup />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Landing />
              </ProtectedRoute>
            } />
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            } />
            <Route path="/analysis" element={
              <ProtectedRoute>
                <FaceAnalysis />
              </ProtectedRoute>
            } />
            <Route path="/results" element={
              <ProtectedRoute>
                <Results />
              </ProtectedRoute>
            } />
            
            {/* Redirect any unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AppInitializer>
    </Router>
  );
}

export default App;