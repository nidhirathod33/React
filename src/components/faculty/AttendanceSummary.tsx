import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Download, TrendingUp, Users, Calendar, ArrowLeft } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface AttendanceSummaryProps {
  onBack: () => void;
}

interface SummaryData {
  totalClasses: number;
  totalStudents: number;
  averageAttendance: number;
  subjectStats: {
    subject: string;
    present: number;
    absent: number;
    total: number;
  }[];
  recentClasses: {
    date: string;
    subject: string;
    class: string;
    standard: string;
    present: number;
    absent: number;
  }[];
}

const COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b'];

export function AttendanceSummary({ onBack }: AttendanceSummaryProps) {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchSummaryData();
  }, []);

  const fetchSummaryData = async () => {
    try {
      // Fetch attendance data for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: attendanceData, error } = await supabase
        .from('attendance')
        .select(`
          *,
          students (
            name,
            roll_no
          )
        `)
        .eq('faculty_id', user?.id)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) throw error;

      // Process the data
      const totalClasses = new Set(
        attendanceData.map(record => `${record.date}-${record.subject}-${record.class}-${record.standard}`)
      ).size;

      const totalStudents = new Set(attendanceData.map(record => record.student_id)).size;

      const presentRecords = attendanceData.filter(record => record.status === 'Present').length;
      const averageAttendance = attendanceData.length > 0 ? (presentRecords / attendanceData.length) * 100 : 0;

      // Subject stats
      const subjectMap = new Map();
      attendanceData.forEach(record => {
        if (!subjectMap.has(record.subject)) {
          subjectMap.set(record.subject, { present: 0, absent: 0 });
        }
        const stats = subjectMap.get(record.subject);
        if (record.status === 'Present') {
          stats.present++;
        } else {
          stats.absent++;
        }
      });

      const subjectStats = Array.from(subjectMap.entries()).map(([subject, stats]) => ({
        subject,
        present: stats.present,
        absent: stats.absent,
        total: stats.present + stats.absent
      }));

      // Recent classes
      const classMap = new Map();
      attendanceData.forEach(record => {
        const key = `${record.date}-${record.subject}-${record.class}-${record.standard}`;
        if (!classMap.has(key)) {
          classMap.set(key, {
            date: record.date,
            subject: record.subject,
            class: record.class,
            standard: record.standard,
            present: 0,
            absent: 0
          });
        }
        const classStats = classMap.get(key);
        if (record.status === 'Present') {
          classStats.present++;
        } else {
          classStats.absent++;
        }
      });

      const recentClasses = Array.from(classMap.values())
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);

      setData({
        totalClasses,
        totalStudents,
        averageAttendance,
        subjectStats,
        recentClasses
      });
    } catch (error) {
      console.error('Error fetching summary data:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    // In a real app, generate and download Excel/PDF report
    console.log('Downloading report...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!data) {
    return <div>No data available</div>;
  }

  const pieData = [
    { name: 'Present', value: data.subjectStats.reduce((sum, s) => sum + s.present, 0) },
    { name: 'Absent', value: data.subjectStats.reduce((sum, s) => sum + s.absent, 0) }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Setup</span>
        </button>

        <motion.button
          onClick={downloadReport}
          className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Download size={18} />
          <span>Download Report</span>
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="p-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <Calendar className="text-white" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{data.totalClasses}</p>
                <p className="text-gray-600">Total Classes</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <Users className="text-white" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{data.totalStudents}</p>
                <p className="text-gray-600">Total Students</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-white" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{data.averageAttendance.toFixed(1)}%</p>
                <p className="text-gray-600">Avg Attendance</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="p-6 bg-gradient-to-r from-orange-500/10 to-red-500/10">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">30d</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">Last Month</p>
                <p className="text-gray-600">Period</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject-wise Attendance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.subjectStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="present" fill="#22c55e" name="Present" />
              <Bar dataKey="absent" fill="#ef4444" name="Absent" />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Recent Classes */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Classes</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Subject</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Class</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Present</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Absent</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Attendance %</th>
              </tr>
            </thead>
            <tbody>
              {data.recentClasses.map((classData, index) => {
                const total = classData.present + classData.absent;
                const percentage = total > 0 ? (classData.present / total) * 100 : 0;
                
                return (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">{new Date(classData.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4">{classData.subject}</td>
                    <td className="py-3 px-4">{classData.standard} - {classData.class}</td>
                    <td className="py-3 px-4 text-right text-green-600 font-semibold">{classData.present}</td>
                    <td className="py-3 px-4 text-right text-red-600 font-semibold">{classData.absent}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-semibold ${percentage >= 75 ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {percentage.toFixed(1)}%
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </motion.div>
  );
}