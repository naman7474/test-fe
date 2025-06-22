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
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Password validation states
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumbers: false,
    hasSpecialChar: false,
    hasMinLength: false,
  });

  const validatePassword = (pass: string) => {
    const validation = {
      hasUpperCase: /[A-Z]/.test(pass),
      hasLowerCase: /[a-z]/.test(pass),
      hasNumbers: /\d/.test(pass),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pass),
      hasMinLength: pass.length >= 8,
    };
    setPasswordValidation(validation);
  };

  const isPasswordValid = () => {
    return Object.values(passwordValidation).every(Boolean);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (!isLogin) {
      validatePassword(newPassword);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login
        console.log('Attempting login...');
        const { token, user } = await beautyAPI.login(email, password);
        localStorage.setItem('authToken', token);
        // Handle both name and first_name/last_name from backend
        const userName = (user as any).name || 
          `${(user as any).first_name || ''} ${(user as any).last_name || ''}`.trim() || 
          user.email || email;
        localStorage.setItem('userName', userName);
        updateUserProfile(user);
        navigate('/');
      } else {
        // Signup validation
        if (!firstName || !lastName || !email || !password) {
          setError('Please fill all fields');
          setIsLoading(false);
          return;
        }

        if (!isPasswordValid()) {
          setError('Password does not meet requirements');
          setIsLoading(false);
          return;
        }
        
        console.log('Attempting signup...');
        const fullName = `${firstName} ${lastName}`;
        const { token, user } = await beautyAPI.signup(email, password, firstName, lastName);
        localStorage.setItem('authToken', token);
        localStorage.setItem('userName', fullName);
        updateUserProfile(user);
        navigate('/onboarding');
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.message || (isLogin ? 'Login failed' : 'Registration failed'));
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
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 bg-beauty-charcoal border border-beauty-gray-800 rounded-lg text-white placeholder-beauty-gray-500 focus:outline-none focus:border-beauty-accent transition-colors"
                      required={!isLogin}
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 bg-beauty-charcoal border border-beauty-gray-800 rounded-lg text-white placeholder-beauty-gray-500 focus:outline-none focus:border-beauty-accent transition-colors"
                      required={!isLogin}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-beauty-charcoal border border-beauty-gray-800 rounded-lg text-white placeholder-beauty-gray-500 focus:outline-none focus:border-beauty-accent transition-colors"
              required
            />

            <div className="relative">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                className="w-full px-4 py-3 bg-beauty-charcoal border border-beauty-gray-800 rounded-lg text-white placeholder-beauty-gray-500 focus:outline-none focus:border-beauty-accent transition-colors"
                required
              />

              {/* Password requirements for signup */}
              <AnimatePresence>
                {!isLogin && passwordFocused && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 p-3 bg-beauty-charcoal border border-beauty-gray-800 rounded-lg text-xs"
                  >
                    <p className="text-beauty-gray-400 mb-2">Password must contain:</p>
                    <div className="space-y-1">
                      <div className={`flex items-center gap-2 ${passwordValidation.hasMinLength ? 'text-green-400' : 'text-beauty-gray-400'}`}>
                        <span>{passwordValidation.hasMinLength ? '✓' : '○'}</span>
                        <span>At least 8 characters</span>
                      </div>
                      <div className={`flex items-center gap-2 ${passwordValidation.hasUpperCase ? 'text-green-400' : 'text-beauty-gray-400'}`}>
                        <span>{passwordValidation.hasUpperCase ? '✓' : '○'}</span>
                        <span>One uppercase letter</span>
                      </div>
                      <div className={`flex items-center gap-2 ${passwordValidation.hasLowerCase ? 'text-green-400' : 'text-beauty-gray-400'}`}>
                        <span>{passwordValidation.hasLowerCase ? '✓' : '○'}</span>
                        <span>One lowercase letter</span>
                      </div>
                      <div className={`flex items-center gap-2 ${passwordValidation.hasNumbers ? 'text-green-400' : 'text-beauty-gray-400'}`}>
                        <span>{passwordValidation.hasNumbers ? '✓' : '○'}</span>
                        <span>One number</span>
                      </div>
                      <div className={`flex items-center gap-2 ${passwordValidation.hasSpecialChar ? 'text-green-400' : 'text-beauty-gray-400'}`}>
                        <span>{passwordValidation.hasSpecialChar ? '✓' : '○'}</span>
                        <span>One special character</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                >
                  <p className="text-red-400 text-sm">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Demo credentials hint */}
            <AnimatePresence>
              {isLogin && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-beauty-accent/10 border border-beauty-accent/20 rounded-lg"
                >
                  <p className="text-beauty-accent text-xs">
                    <strong>Demo Account:</strong><br />
                    Email: testuser123@example.com<br />
                    Password: Password123!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || (!isLogin && !isPasswordValid())}
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