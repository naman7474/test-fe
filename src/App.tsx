import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import useStore from './store';
import LoadingScreen from './components/common/LoadingScreen';
import Landing from './pages/Landing';
import FaceAnalysis from './pages/FaceAnalysis';
import Onboarding from './pages/Onboarding';
import Results from './pages/Results';

function App() {
  const { isLoading, loadingMessage } = useStore();

  return (
    <Router>
      <div className="App">
        <AnimatePresence>
          {isLoading && (
            <LoadingScreen message={loadingMessage} />
          )}
        </AnimatePresence>

        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/analysis" element={<FaceAnalysis />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
