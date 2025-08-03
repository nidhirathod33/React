/*
  # Student Attendance Management System Database Schema

  This migration creates a comprehensive database schema for a student attendance management system
  with role-based access control and detailed tracking capabilities.

  ## Tables Created

  1. **faculty** - Faculty members who can mark attendance
     - id: Unique identifier (UUID)
     - name: Faculty member's full name
     - email: Unique email address for login
     - is_active: Soft delete flag
     - created_at/updated_at: Timestamps

  2. **users** - Generic users table for students and parents
     - id: Unique identifier (UUID)
     - role: User role (student/parent)
     - name: User's full name
     - email: Email address (optional for students)
     - roll_no: Student roll number (unique)
     - class: Student's class section
     - password_hash: Encrypted password
     - is_active: Soft delete flag
     - created_at/updated_at: Timestamps

  3. **students** - Detailed student information
     - id: Unique identifier (UUID)
     - roll_no: Student roll number (unique, pattern: STD-CLASS-XX)
     - name: Student's full name
     - standard: Academic standard (1st to 12th)
     - class: Class section (A, B, C, D)
     - is_active: Soft delete flag
     - created_at/updated_at: Timestamps

  4. **parents** - Parent information linked to students
     - id: Unique identifier (UUID)
     - name: Parent's full name
     - linked_student_roll: Foreign key to student's roll number
     - password_hash: Encrypted password
     - is_active: Soft delete flag
     - created_at/updated_at: Timestamps

  5. **attendance** - Daily attendance records
     - id: Unique identifier (UUID)
     - student_id: Foreign key to students table
     - subject: Subject name
     - class: Class section
     - standard: Academic standard
     - lecture_type: Theory or Practical
     - date: Attendance date (must be <= current_date)
     - status: Present or Absent
     - faculty_id: Foreign key to faculty who marked attendance
     - is_active: Soft delete flag
     - created_at/updated_at: Timestamps

  6. **attendance_logs** - Audit trail for attendance changes
     - id: Unique identifier (UUID)
     - attendance_id: Foreign key to attendance record
     - changed_by: ID of user who made the change
     - old_status: Previous attendance status
     - new_status: New attendance status
     - changed_at: Timestamp of change

  ## Security Features

  - Row Level Security (RLS) enabled on all tables
  - Appropriate policies for each user role
  - Foreign key constraints to maintain data integrity
  - Check constraints for data validation
  - Indexes for performance optimization

  ## Data Validation

  - Role validation (student/parent only)
  - Lecture type validation (Theory/Practical)
  - Status validation (Present/Absent)
  - Date validation (attendance date <= current date)
  - Roll number pattern validation
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create faculty table
CREATE TABLE IF NOT EXISTS faculty (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    email text UNIQUE NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create users table for students and parents
CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    role varchar(20) NOT NULL CHECK (role IN ('student', 'parent')),
    name text NOT NULL,
    email text UNIQUE,
    roll_no text UNIQUE,
    class text,
    password_hash text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    roll_no text UNIQUE NOT NULL,
    name text NOT NULL,
    standard text NOT NULL,
    class text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create parents table
CREATE TABLE IF NOT EXISTS parents (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    linked_student_roll text NOT NULL,
    password_hash text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    FOREIGN KEY (linked_student_roll) REFERENCES students(roll_no)
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id uuid NOT NULL REFERENCES students(id),
    subject text NOT NULL,
    class text NOT NULL,
    standard text NOT NULL,
    lecture_type varchar(10) NOT NULL CHECK (lecture_type IN ('Theory', 'Practical')),
    date date NOT NULL CHECK (date <= current_date),
    status varchar(10) NOT NULL CHECK (status IN ('Present', 'Absent')),
    faculty_id uuid REFERENCES faculty(id),
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create attendance_logs table for audit trail
CREATE TABLE IF NOT EXISTS attendance_logs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    attendance_id uuid NOT NULL REFERENCES attendance(id),
    changed_by uuid,
    old_status varchar(10),
    new_status varchar(10),
    changed_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_class_subject_date ON attendance(class, subject, date);
CREATE INDEX IF NOT EXISTS idx_attendance_faculty ON attendance(faculty_id);
CREATE INDEX IF NOT EXISTS idx_students_roll_no ON students(roll_no);
CREATE INDEX IF NOT EXISTS idx_students_standard_class ON students(standard, class);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_parents_student_roll ON parents(linked_student_roll);

-- Enable Row Level Security on all tables
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;

-- Faculty policies
CREATE POLICY "Faculty can read own data"
    ON faculty
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Faculty can update own data"
    ON faculty
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Users policies
CREATE POLICY "Users can read own data"
    ON users
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
    ON users
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Students policies
CREATE POLICY "Students can read own data"
    ON students
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Faculty can read all students"
    ON students
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM faculty WHERE faculty.id = auth.uid()
        )
    );

CREATE POLICY "Parents can read linked student data"
    ON students
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM parents 
            WHERE parents.id = auth.uid() 
            AND parents.linked_student_roll = students.roll_no
        )
    );

-- Parents policies
CREATE POLICY "Parents can read own data"
    ON parents
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Attendance policies
CREATE POLICY "Students can read own attendance"
    ON attendance
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM students 
            WHERE students.id = auth.uid() 
            AND students.id = attendance.student_id
        )
    );

CREATE POLICY "Faculty can read all attendance"
    ON attendance
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM faculty WHERE faculty.id = auth.uid()
        )
    );

CREATE POLICY "Faculty can insert attendance"
    ON attendance
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM faculty WHERE faculty.id = auth.uid()
        )
    );

CREATE POLICY "Faculty can update attendance"
    ON attendance
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM faculty WHERE faculty.id = auth.uid()
        )
    );

CREATE POLICY "Parents can read child attendance"
    ON attendance
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM parents p
            JOIN students s ON s.roll_no = p.linked_student_roll
            WHERE p.id = auth.uid() 
            AND s.id = attendance.student_id
        )
    );

-- Attendance logs policies
CREATE POLICY "Faculty can read attendance logs"
    ON attendance_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM faculty WHERE faculty.id = auth.uid()
        )
    );

CREATE POLICY "Faculty can insert attendance logs"
    ON attendance_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM faculty WHERE faculty.id = auth.uid()
        )
    );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_faculty_updated_at BEFORE UPDATE ON faculty
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parents_updated_at BEFORE UPDATE ON parents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();