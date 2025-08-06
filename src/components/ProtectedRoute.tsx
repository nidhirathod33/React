import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { AnimatedBackground } from './ui/AnimatedBackground';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { AuthForm } from './auth/AuthForm';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, profile, loading, error, isAuthenticated } = useAuth();

  console.debug('🔄 ProtectedRoute: Checking auth state', {
    hasUser: !!user,
    hasProfile: !!profile,
    loading,
    isAuthenticated,
    error
  });

  if (loading) {
    console.debug('⏳ ProtectedRoute: Still loading auth state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AnimatedBackground />
        <div className="relative z-10">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error && !user) {
    console.debug('❌ ProtectedRoute: Auth error without user, showing login form');
    return (
      <>
        <AnimatedBackground />
        <AuthForm />
      </>
    );
  }

  if (!isAuthenticated) {
    console.debug('🔒 ProtectedRoute: User not authenticated, showing login form');
    return (
      <>
        <AnimatedBackground />
        <AuthForm />
      </>
    );
  }

  if (error === 'No profile found. Please contact admin.') {
    console.debug('❌ ProtectedRoute: Profile not found, showing error message');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AnimatedBackground />
        <div className="relative z-10 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
          <p className="text-lg">No profile found. Please contact admin.</p>
        </div>
      </div>
    );
  }

  console.debug('✅ ProtectedRoute: User authenticated, rendering protected content');
  return <>{children}</>;
}