import React, { useState } from 'react';
import { DashboardLayout } from '../layout/DashboardLayout';
import { AttendanceSetup } from './AttendanceSetup';
import { AttendanceMarking } from './AttendanceMarking';
import { AttendanceSummary } from './AttendanceSummary';

type DashboardView = 'setup' | 'marking' | 'summary';

interface AttendanceConfig {
  subject: string;
  standard: string;
  class: string;
  lecture_type: 'Theory' | 'Practical';
}

export function FacultyDashboard() {
  const [currentView, setCurrentView] = useState<DashboardView>('setup');
  const [attendanceConfig, setAttendanceConfig] = useState<AttendanceConfig | null>(null);

  const handleStartAttendance = (config: AttendanceConfig) => {
    setAttendanceConfig(config);
    setCurrentView('marking');
  };

  const handleBackToSetup = () => {
    setCurrentView('setup');
    setAttendanceConfig(null);
  };

  const handleAttendanceComplete = () => {
    setCurrentView('summary');
  };

  const handleBackToSummary = () => {
    setCurrentView('summary');
  };

  return (
    <DashboardLayout title="Faculty Dashboard">
      {currentView === 'setup' && (
        <AttendanceSetup onStartAttendance={handleStartAttendance} />
      )}
      
      {currentView === 'marking' && attendanceConfig && (
        <AttendanceMarking
          config={attendanceConfig}
          onBack={handleBackToSetup}
          onComplete={handleAttendanceComplete}
        />
      )}
      
      {currentView === 'summary' && (
        <AttendanceSummary onBack={handleBackToSetup} />
      )}
    </DashboardLayout>
  );
}