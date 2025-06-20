// src/App.tsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import useStore from './store';

// Import components
import LoginSignup from './pages/LoginSignup';
import Landing from './pages/Landing';
import EditableMobileForm from './components/onboarding/EditableMobileForm';
import PhotoUploadPage from './pages/PhotoUploadPage';
import MinimalResults from './pages/EnhancedMinimalResults';
import EnhancedLoadingScreen from './components/common/EnhancedLoadingScreen';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  const { isLoading, photoPreview } = useStore();
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
      <div className="App">
        {/* Enhanced loading screen when analyzing photo */}
        <AnimatePresence>
          {isLoading && photoPreview && (
            <EnhancedLoadingScreen 
              imageUrl={photoPreview} 
              onComplete={() => {
                // Navigate to results after loading
                window.location.href = '/results';
              }}
            />
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
              <EditableMobileForm />
            </ProtectedRoute>
          } />
          <Route path="/photo-upload" element={
            <ProtectedRoute>
              <PhotoUploadPage />
            </ProtectedRoute>
          } />
          <Route path="/results" element={
            <ProtectedRoute>
              <MinimalResults />
            </ProtectedRoute>
          } />
          
          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;