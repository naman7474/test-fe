// src/pages/LoginSignup.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import beautyAPI from '../services/api';
import useStore from '../store';

const LoginSignup: React.FC = () => {
  const navigate = useNavigate();
  const { updateUserProfile } = useStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login
        const { token, user } = await beautyAPI.login(email, password);
        localStorage.setItem('authToken', token);
        localStorage.setItem('userName', user.name || email);
        updateUserProfile(user);
        navigate('/');
      } else {
        // Signup
        if (!name || !email || !password) {
          setError('Please fill all fields');
          setIsLoading(false);
          return;
        }
        
        const { token, user } = await beautyAPI.signup(email, password, name);
        localStorage.setItem('authToken', token);
        localStorage.setItem('userName', name);
        updateUserProfile(user);
        navigate('/onboarding');
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError(isLogin ? 'Invalid email or password' : 'Failed to create account');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-beauty-black flex flex-col">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden">
        <motion.div
          animate={{
            background: [
              'radial-gradient(circle at 20% 80%, #FF1B6B22 0%, transparent 50%)',
              'radial-gradient(circle at 80% 20%, #45CAFF22 0%, transparent 50%)',
              'radial-gradient(circle at 40% 40%, #FF1B6B22 0%, transparent 50%)',
            ],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="absolute inset-0"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm mx-auto"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gradient mb-2">BeautyAI</h1>
            <p className="text-beauty-gray-400">Your Personal Beauty Expert</p>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-beauty-charcoal rounded-full p-1 mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-full font-medium transition-all ${
                isLogin
                  ? 'bg-beauty-accent text-beauty-black'
                  : 'text-beauty-gray-400 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-full font-medium transition-all ${
                !isLogin
                  ? 'bg-beauty-accent text-beauty-black'
                  : 'text-beauty-gray-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-beauty-charcoal border border-beauty-gray-800 rounded-lg text-white placeholder-beauty-gray-500 focus:outline-none focus:border-beauty-accent transition-colors"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-beauty-charcoal border border-beauty-gray-800 rounded-lg text-white placeholder-beauty-gray-500 focus:outline-none focus:border-beauty-accent transition-colors"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-beauty-charcoal border border-beauty-gray-800 rounded-lg text-white placeholder-beauty-gray-500 focus:outline-none focus:border-beauty-accent transition-colors"
            />

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-red-400 text-sm text-center"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  <span>{isLogin ? 'Logging in...' : 'Creating account...'}</span>
                </>
              ) : (
                <span>{isLogin ? 'Login' : 'Create Account'}</span>
              )}
            </motion.button>
          </form>

          {/* Terms */}
          <p className="text-center text-beauty-gray-500 text-xs mt-8">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginSignup;