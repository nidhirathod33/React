import React from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navigation } from './components/layout/Navigation';
import { FacultyDashboard } from './components/faculty/FacultyDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';
import { ParentDashboard } from './components/parent/ParentDashboard';
import { AnimatedBackground } from './components/ui/AnimatedBackground';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

function DashboardRouter() {
  const { profile, isAuthenticated } = useAuth();

  console.debug('🔄 DashboardRouter: Routing decision', {
    isAuthenticated,
    role: profile?.role,
    hasProfile: !!profile
  });

  if (!isAuthenticated || !profile) {
    console.debug('❌ DashboardRouter: Not authenticated or no profile');
    return null;
  }

  const renderDashboard = () => {
    switch (profile.role) {
      case 'faculty':
        console.debug('✅ DashboardRouter: Rendering FacultyDashboard');
        return <FacultyDashboard />;
      case 'student':
        console.debug('✅ DashboardRouter: Rendering StudentDashboard');
        return <StudentDashboard />;
      case 'parent':
        console.debug('✅ DashboardRouter: Rendering ParentDashboard');
        return <ParentDashboard />;
      default:
        console.debug('❌ DashboardRouter: Unknown role:', profile.role);
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Unknown Role</h2>
              <p className="text-gray-600">Role "{profile.role}" is not recognized.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderDashboard()}
      </main>
    </div>
  );
}

function AppContent() {
  const { loading, error } = useAuth();

  console.debug('🔄 AppContent: Render state', { loading, error });

  if (loading) {
    console.debug('⏳ AppContent: Still loading auth state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AnimatedBackground />
        <div className="relative z-10">
          <LoadingSpinner size="lg" />
          <p className="text-white mt-4 text-center">Loading...</p>
        </div>
      </div>
    );
  }

  console.debug('✅ AppContent: Auth loaded, rendering ProtectedRoute');
  return (
    <ProtectedRoute>
      <DashboardRouter />
    </ProtectedRoute>
  );
}

function App() {
  console.debug('🔄 App: Rendering main app component');

  return (
    <AuthProvider>
      <div className="App">
        <AppContent />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
            },
          }}
        />
      </div>
    </AuthProvider>
  );
}

export default App;