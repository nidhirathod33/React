/*
  # Add demo data to tables

  1. Demo Data
    - Faculty: Dr. Ramesh, Prof. Anita
    - Students: Amit Kumar, Nidhi Rathod  
    - Parents: Mr. Rajesh Kumar, Mrs. Seema Devi

  2. Tables Updated
    - `faculty` table with demo faculty members
    - `students` table with demo students
    - `parents` table with demo parents
*/

-- Insert demo faculty data
INSERT INTO faculty (id, full_name, email, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Dr. Ramesh', 'ramesh@college.com', now()),
  ('22222222-2222-2222-2222-222222222222', 'Prof. Anita', 'anita@college.com', now())
ON CONFLICT (id) DO NOTHING;

-- Insert demo students data
INSERT INTO students (id, full_name, email, created_at) VALUES
  ('33333333-3333-3333-3333-333333333333', 'Amit Kumar', 'amit@student.com', now()),
  ('44444444-4444-4444-4444-444444444444', 'Nidhi Rathod', 'nidhi@student.com', now())
ON CONFLICT (id) DO NOTHING;

-- Insert demo parents data
INSERT INTO parents (id, full_name, email, created_at) VALUES
  ('55555555-5555-5555-5555-555555555555', 'Mr. Rajesh Kumar', 'rajesh@parent.com', now()),
  ('66666666-6666-6666-6666-666666666666', 'Mrs. Seema Devi', 'seema@parent.com', now())
ON CONFLICT (id) DO NOTHING;