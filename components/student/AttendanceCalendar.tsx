import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

interface AttendanceCalendarProps {
  attendanceData: any[];
}

export function AttendanceCalendar({ attendanceData }: AttendanceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getAttendanceForDate = (date: Date) => {
    return attendanceData.filter(record => 
      isSameDay(new Date(record.date), date)
    );
  };

  const getDateStatus = (date: Date) => {
    const records = getAttendanceForDate(date);
    if (records.length === 0) return 'no-class';
    
    const hasAbsent = records.some(record => record.status === 'Absent');
    return hasAbsent ? 'absent' : 'present';
  };

  const previousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        
        <h3 className="text-lg font-semibold text-gray-900">
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((date, index) => {
          const status = getDateStatus(date);
          const records = getAttendanceForDate(date);
          const isCurrentMonth = isSameMonth(date, currentDate);
          
          return (
            <motion.div
              key={date.toISOString()}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.01 }}
              className={`
                relative h-12 flex items-center justify-center text-sm font-medium rounded-lg cursor-pointer transition-colors
                ${!isCurrentMonth ? 'text-gray-300' : ''}
                ${status === 'present' ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}
                ${status === 'absent' ? 'bg-red-100 text-red-700 hover:bg-red-200' : ''}
                ${status === 'no-class' ? 'text-gray-600 hover:bg-gray-100' : ''}
              `}
              title={
                records.length > 0 
                  ? `${records.length} class${records.length > 1 ? 'es' : ''} - ${records.map(r => r.subject).join(', ')}`
                  : 'No classes'
              }
            >
              {format(date, 'd')}
              
              {records.length > 0 && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                  <div className={`w-1 h-1 rounded-full ${
                    status === 'present' ? 'bg-green-600' : 'bg-red-600'
                  }`} />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 mt-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
          <span className="text-gray-600">Present</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
          <span className="text-gray-600">Absent</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
          <span className="text-gray-600">No Class</span>
        </div>
      </div>
    </div>
  );
}