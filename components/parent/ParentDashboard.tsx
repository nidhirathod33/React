import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, AlertTriangle, TrendingUp, Calendar, BookOpen } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DashboardLayout } from '../layout/DashboardLayout';
import { GlassCard } from '../ui/GlassCard';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const COLORS = ['#22c55e', '#ef4444'];

export function ParentDashboard() {
  const [studentData, setStudentData] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [subjectStats, setSubjectStats] = useState<any[]>([]);
  const [overallStats, setOverallStats] = useState({ present: 0, absent: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchChildData();
    }
  }, [user]);

  const fetchChildData = async () => {
    try {
      // Get parent data to find linked student
      const { data: parentData, error: parentError } = await supabase
        .from('parents')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (parentError) throw parentError;

      // Get student data
      const { data: studentRecord, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('roll_no', parentData.linked_student_roll)
        .single();

      if (studentError) throw studentError;

      setStudentData(studentRecord);

      // Fetch attendance records for the student
      const { data: attendanceRecords, error: attendanceError } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', studentRecord.id)
        .order('date', { ascending: false });

      if (attendanceError) throw attendanceError;

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
          theory: theoryPercentage,
          practical: practicalPercentage,
          overall: overallPercentage,
          totalClasses: overallTotal,
          attendedClasses: overallPresent
        };
      });

      setSubjectStats(subjectStatsArray);
    } catch (error) {
      console.error('Error fetching child data:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    // In a real app, generate and download report
    console.log('Downloading report...');
  };

  if (loading) {
    return (
      <DashboardLayout title="Parent Dashboard">
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

  const absentRecords = attendanceData
    .filter(record => record.status === 'Absent')
    .slice(0, 10);

  return (
    <DashboardLayout title="Parent Dashboard">
      <div className="space-y-6">
        {/* Child Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {studentData?.name?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{studentData?.name}</h2>
                  <p className="text-gray-600">Roll No: {studentData?.roll_no}</p>
                  <p className="text-gray-600">Standard: {studentData?.standard} - Class {studentData?.class}</p>
                </div>
              </div>
              
              <motion.button
                onClick={downloadReport}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download size={18} />
                <span>Download Report</span>
              </motion.button>
            </div>
          </GlassCard>
        </motion.div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={20}
                      outerRadius={30}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-900">
                    {overallStats.percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Overall</h3>
              <p className="text-gray-600">Attendance</p>
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
                  <AlertTriangle className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{overallStats.absent}</p>
                  <p className="text-gray-600">Classes Missed</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Calendar className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{overallStats.present + overallStats.absent}</p>
                  <p className="text-gray-600">Total Classes</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Subject-wise Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject-wise Attendance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Attendance']} />
                <Bar dataKey="theory" fill="#3b82f6" name="Theory" />
                <Bar dataKey="practical" fill="#10b981" name="Practical" />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
            <div className="space-y-4">
              {subjectStats.map((stat, index) => (
                <motion.div
                  key={stat.subject}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-white rounded-xl shadow-sm border"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <BookOpen size={16} className="text-blue-500" />
                      <h4 className="font-semibold text-gray-900">{stat.subject}</h4>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      stat.overall >= 75 
                        ? 'bg-green-100 text-green-700'
                        : stat.overall >= 50
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {stat.overall.toFixed(1)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span>Theory: {stat.theory.toFixed(1)}%</span>
                    </div>
                    <div>
                      <span>Practical: {stat.practical.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {stat.attendedClasses} / {stat.totalClasses} classes attended
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Absent Records */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <AlertTriangle className="text-red-500" size={20} />
            <span>Recent Absences</span>
          </h3>
          {absentRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Subject</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {absentRecords.map((record, index) => (
                    <motion.tr
                      key={record.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">{new Date(record.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{record.subject}</td>
                      <td className="py-3 px-4">{record.lecture_type}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                          {record.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No recent absences! Your child has perfect attendance! 🎉</p>
            </div>
          )}
        </GlassCard>

        {/* Alerts Section */}
        {overallStats.percentage < 75 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <GlassCard className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="text-yellow-600" size={24} />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800">Attendance Alert</h3>
                  <p className="text-yellow-700">
                    Your child's attendance is below 75%. Please monitor their regular attendance to ensure academic success.
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}