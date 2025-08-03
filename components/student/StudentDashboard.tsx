import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, BookOpen, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { DashboardLayout } from '../layout/DashboardLayout';
import { GlassCard } from '../ui/GlassCard';
import { AttendanceCalendar } from './AttendanceCalendar';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { SubjectStats } from '../../types';

const COLORS = ['#22c55e', '#ef4444'];

export function StudentDashboard() {
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [subjectStats, setSubjectStats] = useState<SubjectStats[]>([]);
  const [overallStats, setOverallStats] = useState({ present: 0, absent: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchAttendanceData();
    }
  }, [user]);

  const fetchAttendanceData = async () => {
    try {
      // Get student record first
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (studentError) throw studentError;

      // Fetch attendance records
      const { data: attendanceRecords, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', user?.id)
        .order('date', { ascending: false });

      if (error) throw error;

      setAttendanceData(attendanceRecords || []);

      // Calculate overall stats
      const total = attendanceRecords?.length || 0;
      const present = attendanceRecords?.filter(record => record.status === 'Present').length || 0;
      const absent = total - present;
      const percentage = total > 0 ? (present / total) * 100 : 0;

      setOverallStats({ present, absent, percentage });

      // Calculate subject-wise stats
      const subjectMap = new Map();
      attendanceRecords?.forEach(record => {
        if (!subjectMap.has(record.subject)) {
          subjectMap.set(record.subject, {
            theory: { total: 0, present: 0, absent: 0 },
            practical: { total: 0, present: 0, absent: 0 }
          });
        }
        
        const stats = subjectMap.get(record.subject);
        const type = record.lecture_type.toLowerCase();
        
        stats[type].total++;
        if (record.status === 'Present') {
          stats[type].present++;
        } else {
          stats[type].absent++;
        }
      });

      const subjectStatsArray = Array.from(subjectMap.entries()).map(([subject, stats]) => {
        const theoryPercentage = stats.theory.total > 0 ? (stats.theory.present / stats.theory.total) * 100 : 0;
        const practicalPercentage = stats.practical.total > 0 ? (stats.practical.present / stats.practical.total) * 100 : 0;
        const overallTotal = stats.theory.total + stats.practical.total;
        const overallPresent = stats.theory.present + stats.practical.present;
        const overallPercentage = overallTotal > 0 ? (overallPresent / overallTotal) * 100 : 0;

        return {
          subject,
          theory: {
            total: stats.theory.total,
            present: stats.theory.present,
            absent: stats.theory.absent,
            percentage: theoryPercentage
          },
          practical: {
            total: stats.practical.total,
            present: stats.practical.present,
            absent: stats.practical.absent,
            percentage: practicalPercentage
          },
          overall: {
            total: overallTotal,
            present: overallPresent,
            absent: overallTotal - overallPresent,
            percentage: overallPercentage
          }
        };
      });

      setSubjectStats(subjectStatsArray);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Student Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  const pieData = [
    { name: 'Present', value: overallStats.present },
    { name: 'Absent', value: overallStats.absent }
  ];

  const chartData = subjectStats.map(stat => ({
    subject: stat.subject,
    attendance: stat.overall.percentage
  }));

  return (
    <DashboardLayout title="Student Dashboard">
      <div className="space-y-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                <p className="text-gray-600">Roll No: {user?.roll_no}</p>
                <p className="text-gray-600">Standard: {user?.standard} - Class {user?.class}</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard className="p-6 text-center">
              <div className="w-24 h-24 mx-auto mb-4 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={40}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-900">
                    {overallStats.percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Overall Attendance</h3>
              <p className="text-gray-600">{overallStats.present} / {overallStats.present + overallStats.absent} classes</p>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{overallStats.present}</p>
                  <p className="text-gray-600">Classes Attended</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                  <Clock className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{overallStats.absent}</p>
                  <p className="text-gray-600">Classes Missed</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Subject-wise Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject-wise Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Attendance']} />
                <Bar dataKey="attendance" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Details</h3>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {subjectStats.map((stat, index) => (
                <motion.div
                  key={stat.subject}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-white rounded-xl shadow-sm border"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-900">{stat.subject}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      stat.overall.percentage >= 75 
                        ? 'bg-green-100 text-green-700'
                        : stat.overall.percentage >= 50
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {stat.overall.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Theory: {stat.theory.percentage.toFixed(1)}%</p>
                      <p className="text-xs text-gray-500">{stat.theory.present}/{stat.theory.total}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Practical: {stat.practical.percentage.toFixed(1)}%</p>
                      <p className="text-xs text-gray-500">{stat.practical.present}/{stat.practical.total}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Calendar */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Calendar</h3>
          <AttendanceCalendar attendanceData={attendanceData} />
        </GlassCard>

        {/* Recent Notifications */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Notifications</h3>
          <div className="space-y-3">
            {attendanceData
              .filter(record => record.status === 'Absent')
              .slice(0, 5)
              .map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <p className="text-sm text-red-700">
                    You were absent in <strong>{record.subject}</strong> ({record.lecture_type}) on{' '}
                    {new Date(record.date).toLocaleDateString()}
                  </p>
                </motion.div>
              ))}
            {attendanceData.filter(record => record.status === 'Absent').length === 0 && (
              <p className="text-gray-500 text-center py-8">No absences recorded! Great job! 🎉</p>
            )}
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}