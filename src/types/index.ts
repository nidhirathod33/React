export interface User {
  id: string;
  role: 'faculty' | 'student' | 'parent';
  name: string;
  email?: string;
  roll_no?: string;
  class?: string;
  standard?: string;
  linked_student_roll?: string;
  is_active: boolean;
  created_at: string;
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface Student {
  id: string;
  roll_no: string;
  name: string;
  standard: string;
  class: string;
  is_active: boolean;
  created_at: string;
}

export interface Parent {
  id: string;
  name: string;
  linked_student_roll: string;
  is_active: boolean;
  created_at: string;
}

export interface Attendance {
  id: string;
  student_id: string;
  subject: string;
  class: string;
  standard: string;
  lecture_type: 'Theory' | 'Practical';
  date: string;
  status: 'Present' | 'Absent';
  faculty_id?: string;
  is_active: boolean;
  created_at: string;
  student?: Student;
}

export interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  percentage: number;
}

export interface SubjectStats {
  subject: string;
  theory: AttendanceStats;
  practical: AttendanceStats;
  overall: AttendanceStats;
}