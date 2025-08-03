/*
  # Sample Data for Student Attendance Management System

  This migration inserts sample data for testing and demonstration purposes.
  It includes faculty members, students, parents, and some attendance records.

  ## Sample Data Includes:
  - 3 Faculty members
  - 20 Students across different standards and classes
  - 20 Parents linked to students
  - Sample attendance records for the past 30 days
*/

-- Insert sample faculty members
INSERT INTO faculty (id, name, email) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Dr. Sarah Johnson', 'sarah.johnson@school.edu'),
    ('22222222-2222-2222-2222-222222222222', 'Prof. Michael Chen', 'michael.chen@school.edu'),
    ('33333333-3333-3333-3333-333333333333', 'Ms. Emily Davis', 'emily.davis@school.edu')
ON CONFLICT (id) DO NOTHING;

-- Insert sample students
INSERT INTO students (id, roll_no, name, standard, class) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'STD-A-01', 'John Smith', '10', 'A'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'STD-A-02', 'Emma Wilson', '10', 'A'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'STD-A-03', 'Liam Brown', '10', 'A'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'STD-A-04', 'Olivia Jones', '10', 'A'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'STD-A-05', 'Noah Davis', '10', 'A'),
    ('aaaaaaaa-bbbb-aaaa-aaaa-aaaaaaaaaaaa', 'STD-B-01', 'Sophia Miller', '10', 'B'),
    ('bbbbbbbb-cccc-bbbb-bbbb-bbbbbbbbbbbb', 'STD-B-02', 'Jackson Wilson', '10', 'B'),
    ('cccccccc-dddd-cccc-cccc-cccccccccccc', 'STD-B-03', 'Ava Martinez', '10', 'B'),
    ('dddddddd-eeee-dddd-dddd-dddddddddddd', 'STD-B-04', 'Lucas Anderson', '10', 'B'),
    ('eeeeeeee-ffff-eeee-eeee-eeeeeeeeeeee', 'STD-B-05', 'Isabella Taylor', '10', 'B'),
    ('aaaaaaaa-aaaa-bbbb-aaaa-aaaaaaaaaaaa', 'STD-C-01', 'Mason Thomas', '11', 'C'),
    ('bbbbbbbb-bbbb-cccc-bbbb-bbbbbbbbbbbb', 'STD-C-02', 'Charlotte Garcia', '11', 'C'),
    ('cccccccc-cccc-dddd-cccc-cccccccccccc', 'STD-C-03', 'Ethan Rodriguez', '11', 'C'),
    ('dddddddd-dddd-eeee-dddd-dddddddddddd', 'STD-C-04', 'Amelia Lopez', '11', 'C'),
    ('eeeeeeee-eeee-ffff-eeee-eeeeeeeeeeee', 'STD-C-05', 'Alexander Lee', '11', 'C'),
    ('aaaaaaaa-aaaa-aaaa-bbbb-aaaaaaaaaaaa', 'STD-D-01', 'Mia Gonzalez', '12', 'D'),
    ('bbbbbbbb-bbbb-bbbb-cccc-bbbbbbbbbbbb', 'STD-D-02', 'William Clark', '12', 'D'),
    ('cccccccc-cccc-cccc-dddd-cccccccccccc', 'STD-D-03', 'Harper Lewis', '12', 'D'),
    ('dddddddd-dddd-dddd-eeee-dddddddddddd', 'STD-D-04', 'James Walker', '12', 'D'),
    ('eeeeeeee-eeee-eeee-ffff-eeeeeeeeeeee', 'STD-D-05', 'Evelyn Hall', '12', 'D')
ON CONFLICT (id) DO NOTHING;

-- Insert corresponding users for students
INSERT INTO users (id, role, name, roll_no, class, password_hash) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'student', 'John Smith', 'STD-A-01', 'A', 'hashed_password'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'student', 'Emma Wilson', 'STD-A-02', 'A', 'hashed_password'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'student', 'Liam Brown', 'STD-A-03', 'A', 'hashed_password'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'student', 'Olivia Jones', 'STD-A-04', 'A', 'hashed_password'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'student', 'Noah Davis', 'STD-A-05', 'A', 'hashed_password'),
    ('aaaaaaaa-bbbb-aaaa-aaaa-aaaaaaaaaaaa', 'student', 'Sophia Miller', 'STD-B-01', 'B', 'hashed_password'),
    ('bbbbbbbb-cccc-bbbb-bbbb-bbbbbbbbbbbb', 'student', 'Jackson Wilson', 'STD-B-02', 'B', 'hashed_password'),
    ('cccccccc-dddd-cccc-cccc-cccccccccccc', 'student', 'Ava Martinez', 'STD-B-03', 'B', 'hashed_password'),
    ('dddddddd-eeee-dddd-dddd-dddddddddddd', 'student', 'Lucas Anderson', 'STD-B-04', 'B', 'hashed_password'),
    ('eeeeeeee-ffff-eeee-eeee-eeeeeeeeeeee', 'student', 'Isabella Taylor', 'STD-B-05', 'B', 'hashed_password')
ON CONFLICT (id) DO NOTHING;

-- Insert sample parents
INSERT INTO parents (id, name, linked_student_roll, password_hash) VALUES
    ('f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', 'Robert Smith', 'STD-A-01', 'hashed_password'),
    ('f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2', 'Linda Wilson', 'STD-A-02', 'hashed_password'),
    ('f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3', 'David Brown', 'STD-A-03', 'hashed_password'),
    ('f4f4f4f4-f4f4-f4f4-f4f4-f4f4f4f4f4f4', 'Maria Jones', 'STD-A-04', 'hashed_password'),
    ('f5f5f5f5-f5f5-f5f5-f5f5-f5f5f5f5f5f5', 'Christopher Davis', 'STD-A-05', 'hashed_password'),
    ('f6f6f6f6-f6f6-f6f6-f6f6-f6f6f6f6f6f6', 'Jennifer Miller', 'STD-B-01', 'hashed_password'),
    ('f7f7f7f7-f7f7-f7f7-f7f7-f7f7f7f7f7f7', 'Matthew Wilson', 'STD-B-02', 'hashed_password'),
    ('f8f8f8f8-f8f8-f8f8-f8f8-f8f8f8f8f8f8', 'Michelle Martinez', 'STD-B-03', 'hashed_password'),
    ('f9f9f9f9-f9f9-f9f9-f9f9-f9f9f9f9f9f9', 'Anthony Anderson', 'STD-B-04', 'hashed_password'),
    ('fafafafa-fafa-fafa-fafa-fafafafafafa', 'Lisa Taylor', 'STD-B-05', 'hashed_password')
ON CONFLICT (id) DO NOTHING;

-- Insert corresponding parent users
INSERT INTO users (id, role, name, password_hash) VALUES
    ('f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', 'parent', 'Robert Smith', 'hashed_password'),
    ('f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2', 'parent', 'Linda Wilson', 'hashed_password'),
    ('f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3', 'parent', 'David Brown', 'hashed_password'),
    ('f4f4f4f4-f4f4-f4f4-f4f4-f4f4f4f4f4f4', 'parent', 'Maria Jones', 'hashed_password'),
    ('f5f5f5f5-f5f5-f5f5-f5f5-f5f5f5f5f5f5', 'parent', 'Christopher Davis', 'hashed_password')
ON CONFLICT (id) DO NOTHING;

-- Generate sample attendance data for the past 30 days
DO $$
DECLARE
    student_record RECORD;
    date_record DATE;
    subjects TEXT[] := ARRAY['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies'];
    lecture_types TEXT[] := ARRAY['Theory', 'Practical'];
    faculty_ids UUID[] := ARRAY[
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333'
    ];
    subject TEXT;
    lecture_type TEXT;
    faculty_id UUID;
    attendance_status TEXT;
BEGIN
    -- Loop through each student
    FOR student_record IN 
        SELECT id, standard, class 
        FROM students 
        WHERE id IN (
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
            'cccccccc-cccc-cccc-cccc-cccccccccccc',
            'dddddddd-dddd-dddd-dddd-dddddddddddd',
            'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'
        )
    LOOP
        -- Loop through the past 30 days (excluding weekends)
        FOR date_record IN 
            SELECT generate_series(
                CURRENT_DATE - INTERVAL '30 days',
                CURRENT_DATE - INTERVAL '1 day',
                '1 day'::interval
            )::date
            WHERE EXTRACT(DOW FROM generate_series(
                CURRENT_DATE - INTERVAL '30 days',
                CURRENT_DATE - INTERVAL '1 day',
                '1 day'::interval
            )::date) NOT IN (0, 6) -- Exclude Sunday (0) and Saturday (6)
        LOOP
            -- Randomly select 2-3 subjects per day
            FOR i IN 1..2 + (RANDOM() * 2)::INTEGER LOOP
                subject := subjects[1 + (RANDOM() * array_length(subjects, 1))::INTEGER];
                lecture_type := lecture_types[1 + (RANDOM() * array_length(lecture_types, 1))::INTEGER];
                faculty_id := faculty_ids[1 + (RANDOM() * array_length(faculty_ids, 1))::INTEGER];
                
                -- 85% chance of being present
                attendance_status := CASE WHEN RANDOM() < 0.85 THEN 'Present' ELSE 'Absent' END;
                
                -- Insert attendance record if it doesn't exist
                INSERT INTO attendance (
                    student_id,
                    subject,
                    class,
                    standard,
                    lecture_type,
                    date,
                    status,
                    faculty_id
                ) VALUES (
                    student_record.id,
                    subject,
                    student_record.class,
                    student_record.standard,
                    lecture_type,
                    date_record,
                    attendance_status,
                    faculty_id
                )
                ON CONFLICT DO NOTHING;
            END LOOP;
        END LOOP;
    END LOOP;
END $$;