import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Save, ArrowLeft } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Student, Attendance } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface AttendanceMarkingProps {
  config: {
    subject: string;
    standard: string;
    class: string;
    lecture_type: 'Theory' | 'Practical';
  };
  onBack: () => void;
  onComplete: () => void;
}

interface StudentAttendance {
  student: Student;
  status: 'Present' | 'Absent';
}

export function AttendanceMarking({ config, onBack, onComplete }: AttendanceMarkingProps) {
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchStudents();
  }, [config]);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('standard', config.standard)
        .eq('class', config.class)
        .eq('is_active', true)
        .order('roll_no');

      if (error) throw error;

      setStudents(data.map(student => ({
        student,
        status: 'Present' as const
      })));
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = (studentId: string) => {
    setStudents(prev => prev.map(item => 
      item.student.id === studentId 
        ? { ...item, status: item.status === 'Present' ? 'Absent' : 'Present' }
        : item
    ));
  };

  const submitAttendance = async () => {
    setSaving(true);
    try {
      const attendanceRecords = students.map(item => ({
        student_id: item.student.id,
        subject: config.subject,
        class: config.class,
        standard: config.standard,
        lecture_type: config.lecture_type,
        date: new Date().toISOString().split('T')[0],
        status: item.status,
        faculty_id: user?.id,
      }));

      const { error } = await supabase
        .from('attendance')
        .insert(attendanceRecords);

      if (error) throw error;

      toast.success('Attendance saved successfully!');
      onComplete();
    } catch (error: any) {
      console.error('Error saving attendance:', error);
      toast.error(error.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = students.filter(s => s.status === 'Present').length;
  const absentCount = students.filter(s => s.status === 'Absent').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Header Card */}
      <GlassCard className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-6">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900">{config.subject}</h2>
            <p className="text-gray-600">
              Standard {config.standard} - Class {config.class} • {config.lecture_type}
            </p>
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString()}
            </p>
          </div>
          
          <div className="w-20"></div>
        </div>
      </GlassCard>

      {/* Students List */}
      <GlassCard className="p-6">
        <div className="space-y-4">
          <AnimatePresence>
            {students.map((item, index) => (
              <motion.div
                key={item.student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {item.student.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.student.name}</h3>
                    <p className="text-sm text-gray-500">{item.student.roll_no}</p>
                  </div>
                </div>

                <button
                  onClick={() => toggleStatus(item.student.id)}
                  className={`
                    relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${item.status === 'Present' 
                      ? 'bg-green-500 focus:ring-green-500' 
                      : 'bg-red-500 focus:ring-red-500'
                    }
                  `}
                >
                  <motion.span
                    layout
                    className={`
                      inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform
                      ${item.status === 'Present' ? 'translate-x-9' : 'translate-x-1'}
                    `}
                  >
                    <div className="flex items-center justify-center h-full">
                      {item.status === 'Present' ? (
                        <Check size={12} className="text-green-500" />
                      ) : (
                        <X size={12} className="text-red-500" />
                      )}
                    </div>
                  </motion.span>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </GlassCard>

      {/* Stats and Submit */}
      <div className="sticky bottom-0 bg-white/80 backdrop-blur-lg border-t border-gray-200 p-6 rounded-t-2xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-6">
            <motion.div
              className="text-center"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            >
              <div className="text-2xl font-bold text-green-600">{presentCount}</div>
              <div className="text-sm text-gray-600">Present</div>
            </motion.div>
            <motion.div
              className="text-center"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2, delay: 0.2 }}
            >
              <div className="text-2xl font-bold text-red-600">{absentCount}</div>
              <div className="text-sm text-gray-600">Absent</div>
            </motion.div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{students.length}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>

          <motion.button
            onClick={submitAttendance}
            disabled={saving}
            className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center space-x-2">
              <Save size={18} />
              <span>{saving ? 'Saving...' : 'Submit Attendance'}</span>
            </div>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}