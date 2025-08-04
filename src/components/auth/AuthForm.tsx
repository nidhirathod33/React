import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { GlassCard } from '../ui/GlassCard';
import { SegmentedControl } from '../ui/SegmentedControl';
import { FloatingLabelInput } from '../ui/FloatingLabelInput';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { STANDARDS, CLASSES } from '../../lib/supabase';

const roleOptions = [
  { value: 'faculty', label: 'Faculty' },
  { value: 'student', label: 'Student' },
  { value: 'parent', label: 'Parent' },
];

const loginSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
});

const facultySignupSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/(?=.*[0-9])(?=.*[!@#$%^&*])/, 'Password must contain at least 1 number and 1 special character')
    .required('Password is required'),
});

const studentSignupSchema = yup.object({
  roll_no: yup.string()
    .matches(/^STD-[A-D]-\d{2}$/, 'Roll No must follow pattern STD-CLASS-XX (e.g., STD-A-01)')
    .required('Roll No is required'),
  name: yup.string().required('Name is required'),
  standard: yup.string().required('Standard is required'),
  class: yup.string().required('Class is required'),
  password: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/(?=.*[0-9])(?=.*[!@#$%^&*])/, 'Password must contain at least 1 number and 1 special character')
    .required('Password is required'),
});

const parentSignupSchema = yup.object({
  name: yup.string().required('Name is required'),
  linked_student_roll: yup.string()
    .matches(/^STD-[A-D]-\d{2}$/, 'Student Roll No must follow pattern STD-CLASS-XX')
    .required('Student Roll No is required'),
  password: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/(?=.*[0-9])(?=.*[!@#$%^&*])/, 'Password must contain at least 1 number and 1 special character')
    .required('Password is required'),
});

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState('faculty');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  const getSchema = () => {
    if (isLogin) return loginSchema;
    switch (selectedRole) {
      case 'faculty': return facultySignupSchema;
      case 'student': return studentSignupSchema;
      case 'parent': return parentSignupSchema;
      default: return facultySignupSchema;
    }
  };

  const { handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
    resolver: yupResolver(getSchema()),
    mode: 'onChange'
  });

  const formValues = watch();

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      if (isLogin) {
        await login(data.email, data.password, selectedRole as any);
      } else {
        await signup({ ...data, role: selectedRole as any });
      }
    } catch (error) {
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    reset();
  };

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
                  key={`signup-${selectedRole}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {selectedRole === 'faculty' && (
                    <>
                      <FloatingLabelInput
                        label="Full Name"
                        value={formValues.name || ''}
                        onChange={(value) => setValue('name', value)}
                        error={errors.name?.message}
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
                    </>
                  )}

                  {selectedRole === 'student' && (
                    <>
                      <FloatingLabelInput
                        label="Roll Number (STD-A-01)"
                        value={formValues.roll_no || ''}
                        onChange={(value) => setValue('roll_no', value)}
                        error={errors.roll_no?.message}
                        required
                      />
                      <FloatingLabelInput
                        label="Full Name"
                        value={formValues.name || ''}
                        onChange={(value) => setValue('name', value)}
                        error={errors.name?.message}
                        required
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white/80 text-sm font-medium mb-2">
                            Standard *
                          </label>
                          <select
                            value={formValues.standard || ''}
                            onChange={(e) => setValue('standard', e.target.value)}
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                          >
                            <option value="">Select</option>
                            {STANDARDS.map(std => (
                              <option key={std.value} value={std.value} className="bg-gray-800">
                                {std.label}
                              </option>
                            ))}
                          </select>
                          {errors.standard && (
                            <p className="mt-1 text-xs text-red-400">{errors.standard.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-white/80 text-sm font-medium mb-2">
                            Class *
                          </label>
                          <div className="flex gap-2">
                            {CLASSES.map(cls => (
                              <button
                                key={cls.value}
                                type="button"
                                onClick={() => setValue('class', cls.value)}
                                className={`
                                  flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all
                                  ${formValues.class === cls.value
                                    ? 'bg-white/20 text-white border border-white/40'
                                    : 'bg-white/5 text-white/70 border border-white/20 hover:bg-white/10'
                                  }
                                `}
                              >
                                {cls.value}
                              </button>
                            ))}
                          </div>
                          {errors.class && (
                            <p className="mt-1 text-xs text-red-400">{errors.class.message}</p>
                          )}
                        </div>
                      </div>
                      <FloatingLabelInput
                        label="Password"
                        type="password"
                        value={formValues.password || ''}
                        onChange={(value) => setValue('password', value)}
                        error={errors.password?.message}
                        required
                      />
                    </>
                  )}

                  {selectedRole === 'parent' && (
                    <>
                      <FloatingLabelInput
                        label="Full Name"
                        value={formValues.name || ''}
                        onChange={(value) => setValue('name', value)}
                        error={errors.name?.message}
                        required
                      />
                      <FloatingLabelInput
                        label="Student Roll Number"
                        value={formValues.linked_student_roll || ''}
                        onChange={(value) => setValue('linked_student_roll', value)}
                        error={errors.linked_student_roll?.message}
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
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

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