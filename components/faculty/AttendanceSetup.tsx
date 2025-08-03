import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, BookOpen, Settings } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { SUBJECTS, STANDARDS, CLASSES, LECTURE_TYPES } from '../../lib/supabase';

interface AttendanceSetupProps {
  onStartAttendance: (config: AttendanceConfig) => void;
}

interface AttendanceConfig {
  subject: string;
  standard: string;
  class: string;
  lecture_type: 'Theory' | 'Practical';
}

export function AttendanceSetup({ onStartAttendance }: AttendanceSetupProps) {
  const [config, setConfig] = useState<AttendanceConfig>({
    subject: '',
    standard: '',
    class: '',
    lecture_type: 'Theory'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (config.subject && config.standard && config.class) {
      onStartAttendance(config);
    }
  };

  const isValid = config.subject && config.standard && config.class;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Welcome Card */}
      <GlassCard className="bg-gradient-to-r from-blue-500/10 to-teal-500/10 p-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl flex items-center justify-center">
            <Calendar className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome, Faculty!</h2>
            <p className="text-gray-600">Today is {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
        </div>
      </GlassCard>

      {/* Attendance Setup */}
      <GlassCard className="p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Settings className="text-blue-600" size={24} />
          <h3 className="text-xl font-semibold text-gray-900">Setup Attendance</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Subject Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Subject
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SUBJECTS.map((subject) => (
                <motion.button
                  key={subject.value}
                  type="button"
                  onClick={() => setConfig({ ...config, subject: subject.value })}
                  className={`
                    p-4 rounded-xl border-2 transition-all duration-200 text-left
                    ${config.subject === subject.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{subject.icon}</span>
                    <span className="font-medium">{subject.label}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Standard and Class */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Standard
              </label>
              <select
                value={config.standard}
                onChange={(e) => setConfig({ ...config, standard: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Standard</option>
                {STANDARDS.map(std => (
                  <option key={std.value} value={std.value}>{std.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Class
              </label>
              <div className="flex gap-2">
                {CLASSES.map(cls => (
                  <button
                    key={cls.value}
                    type="button"
                    onClick={() => setConfig({ ...config, class: cls.value })}
                    className={`
                      flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200
                      ${config.class === cls.value
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    {cls.value}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Lecture Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Lecture Type
            </label>
            <div className="flex gap-4">
              {LECTURE_TYPES.map((type) => (
                <motion.button
                  key={type.value}
                  type="button"
                  onClick={() => setConfig({ ...config, lecture_type: type.value as 'Theory' | 'Practical' })}
                  className={`
                    flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all duration-200
                    ${config.lecture_type === type.value
                      ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-lg">{type.icon}</span>
                  <span>{type.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <motion.button
            type="submit"
            disabled={!isValid}
            className={`
              w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300
              ${isValid
                ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
            whileHover={isValid ? { scale: 1.02, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" } : {}}
            whileTap={isValid ? { scale: 0.98 } : {}}
          >
            <div className="flex items-center justify-center space-x-2">
              <Users size={20} />
              <span>Start Attendance</span>
            </div>
          </motion.button>
        </form>
      </GlassCard>
    </motion.div>
  );
}