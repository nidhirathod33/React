import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { GlassCard } from '../ui/GlassCard';
import { SegmentedControl } from '../ui/SegmentedControl';
import { FloatingLabelInput } from '../ui/FloatingLabelInput';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { SignUpData } from '../../types';

const roleOptions = [
  { value: 'faculty', label: 'Faculty' },
  { value: 'student', label: 'Student' },
  { value: 'parent', label: 'Parent' },
];

const loginSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
});

const signupSchema = yup.object({
  full_name: yup.string().required('Full name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/(?=.*[0-9])(?=.*[!@#$%^&*])/, 'Password must contain at least 1 number and 1 special character')
    .required('Password is required'),
});

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState('faculty');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const { signUp, signIn, loading, error } = useAuth();

  console.debug('🔄 AuthForm: Rendering form', { isLogin, selectedRole, loading });

  const getSchema = () => {
    return isLogin ? loginSchema : signupSchema;
  };

  const { handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
    resolver: yupResolver(getSchema()),
    mode: 'onChange'
  });

  const formValues = watch();

  const onSubmit = async (data: any) => {
    console.debug('🔄 AuthForm: Form submitted', { isLogin, data: { ...data, password: '[HIDDEN]' } });
    setMessage('');
    
    try {
      if (isLogin) {
        console.debug('🔄 AuthForm: Attempting sign in');
        await signIn(data.email, data.password);
        console.debug('✅ AuthForm: Sign in successful');
        setMessage('Login successful!');
        setMessageType('success');
      } else {
        console.debug('🔄 AuthForm: Attempting sign up');
        const signUpData: SignUpData = {
          full_name: data.full_name,
          email: data.email,
          password: data.password,
          role: selectedRole as 'faculty' | 'student' | 'parent'
        };
        await signUp(data.email, data.password, signUpData);
        console.debug('✅ AuthForm: Sign up successful');
        setMessage('Account created successfully!');
        setMessageType('success');
      }
    } catch (err: any) {
      console.debug('❌ AuthForm: Auth failed', err);
      setMessage(err.message || (isLogin ? 'Login failed' : 'Signup failed'));
      setMessageType('error');
    }
  };

  const toggleMode = () => {
    console.debug('🔄 AuthForm: Toggling mode from', isLogin ? 'login' : 'signup', 'to', !isLogin ? 'login' : 'signup');
    setIsLogin(!isLogin);
    setMessage('');
    reset();
  };

  // Show global auth error if present
  const displayError = error || message;
  const displayMessageType = error ? 'error' : messageType;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-3xl font-bold text-white text-center mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-white/70 text-center mb-8">
            {isLogin ? 'Sign in to your account' : 'Join our attendance system'}
          </p>

          {!isLogin && (
            <div className="mb-6">
              <label className="block text-white/80 text-sm font-medium mb-3">
                Select Role
              </label>
              <SegmentedControl
                options={roleOptions}
                value={selectedRole}
                onChange={setSelectedRole}
              />
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <FloatingLabelInput
                    label="Email"
                    type="email"
                    value={formValues.email || ''}
                    onChange={(value) => setValue('email', value)}
                    error={errors.email?.message}
                    required
                  />
                  <FloatingLabelInput
                    label="Password"
                    type="password"
                    value={formValues.password || ''}
                    onChange={(value) => setValue('password', value)}
                    error={errors.password?.message}
                    required
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <FloatingLabelInput
                    label="Full Name"
                    value={formValues.full_name || ''}
                    onChange={(value) => setValue('full_name', value)}
                    error={errors.full_name?.message}
                    required
                  />
                  <FloatingLabelInput
                    label="Email"
                    type="email"
                    value={formValues.email || ''}
                    onChange={(value) => setValue('email', value)}
                    error={errors.email?.message}
                    required
                  />
                  <FloatingLabelInput
                    label="Password"
                    type="password"
                    value={formValues.password || ''}
                    onChange={(value) => setValue('password', value)}
                    error={errors.password?.message}
                    required
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {displayError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-center text-sm p-3 rounded-lg ${
                  displayMessageType === 'success' 
                    ? 'bg-green-500/20 text-green-100 border border-green-500/30' 
                    : 'bg-red-500/20 text-red-100 border border-red-500/30'
                }`}
              >
                {displayError}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={toggleMode}
              className="text-white/70 hover:text-white transition-colors duration-200"
            >
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span className="font-semibold text-white">
                {isLogin ? 'Sign Up' : 'Sign In'}
              </span>
            </button>
          </div>
        </motion.div>
      </GlassCard>
    </div>
  );
}