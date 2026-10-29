-- ==============================================================================
-- Migration: 002_rls_policies.sql
-- Description: Row Level Security (RLS) & Multi-Tenant Data Isolation Rules
-- ==============================================================================

-- 1. Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE accommodation_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;

-- 2. Helper functions with SECURITY DEFINER
CREATE OR REPLACE FUNCTION get_user_school_id()
RETURNS UUID AS $$
  SELECT school_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 3. Schools RLS Policies
-- Users can only view their own school
DROP POLICY IF EXISTS "Users can view their assigned school" ON schools;
CREATE POLICY "Users can view their assigned school" ON schools
    FOR SELECT USING (id = get_user_school_id());

-- Admins can update their school details
DROP POLICY IF EXISTS "Admins can update their assigned school" ON schools;
CREATE POLICY "Admins can update their assigned school" ON schools
    FOR UPDATE USING (
        id = get_user_school_id() AND get_user_role() = 'admin'
    );

-- 4. Profiles RLS Policies
-- Users can view profiles belonging to their own school
DROP POLICY IF EXISTS "View school profiles" ON profiles;
CREATE POLICY "View school profiles" ON profiles
    FOR SELECT USING (school_id = get_user_school_id());

-- Users can insert their own profile during initial signup
DROP POLICY IF EXISTS "Insert own profile" ON profiles;
CREATE POLICY "Insert own profile" ON profiles
    FOR INSERT WITH CHECK (id = auth.uid());

-- Users can update their own profile; Admins can update any profile in their school
DROP POLICY IF EXISTS "Update own profile or admin manages school profiles" ON profiles;
CREATE POLICY "Update own profile or admin manages school profiles" ON profiles
    FOR UPDATE USING (
        id = auth.uid() OR 
        (school_id = get_user_school_id() AND get_user_role() = 'admin')
    );

-- 5. Students RLS Policies
-- School staff can view students in their school
DROP POLICY IF EXISTS "School staff can view students" ON students;
CREATE POLICY "School staff can view students" ON students
    FOR SELECT USING (school_id = get_user_school_id());

-- Educators, Specialists, and Admins can insert students into their school
DROP POLICY IF EXISTS "Staff can insert students" ON students;
CREATE POLICY "Staff can insert students" ON students
    FOR INSERT WITH CHECK (
        school_id = get_user_school_id() AND
        get_user_role() IN ('educator', 'specialist', 'admin')
    );

-- Educators, Specialists, and Admins can update students in their school
DROP POLICY IF EXISTS "Educators and Admins can update students" ON students;
CREATE POLICY "Educators and Admins can update students" ON students
    FOR UPDATE USING (
        school_id = get_user_school_id() AND
        get_user_role() IN ('educator', 'specialist', 'admin')
    );

-- Admins can delete student records
DROP POLICY IF EXISTS "Admins can delete students" ON students;
CREATE POLICY "Admins can delete students" ON students
    FOR DELETE USING (
        school_id = get_user_school_id() AND
        get_user_role() = 'admin'
    );

-- 6. Student Telemetry RLS Policies
-- School staff can view telemetry of students in their school
DROP POLICY IF EXISTS "View student telemetry" ON student_telemetry;
CREATE POLICY "View student telemetry" ON student_telemetry
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM students s
            WHERE s.id = student_telemetry.student_id
            AND s.school_id = get_user_school_id()
        )
    );

-- School staff (educators, specialists, tutors, admins) can record telemetry
DROP POLICY IF EXISTS "Record student telemetry" ON student_telemetry;
CREATE POLICY "Record student telemetry" ON student_telemetry
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM students s
            WHERE s.id = student_telemetry.student_id
            AND s.school_id = get_user_school_id()
        )
    );

-- 7. Accommodation Plans RLS Policies
-- Accessible by school staff
DROP POLICY IF EXISTS "View accommodations" ON accommodation_plans;
CREATE POLICY "View accommodations" ON accommodation_plans
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM students s 
            WHERE s.id = accommodation_plans.student_id 
            AND s.school_id = get_user_school_id()
        )
    );

-- Educators, Specialists, and Admins can manage accommodations
DROP POLICY IF EXISTS "Manage accommodations" ON accommodation_plans;
CREATE POLICY "Manage accommodations" ON accommodation_plans
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM students s 
            WHERE s.id = accommodation_plans.student_id 
            AND s.school_id = get_user_school_id()
        ) AND
        get_user_role() IN ('educator', 'specialist', 'admin')
    );

-- 8. Interventions Pipeline RLS Policies
-- School staff can view interventions in their school
DROP POLICY IF EXISTS "View school interventions" ON interventions;
CREATE POLICY "View school interventions" ON interventions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM students s
            WHERE s.id = interventions.student_id
            AND s.school_id = get_user_school_id()
        )
    );

-- School staff can manage interventions in their school
DROP POLICY IF EXISTS "Manage school interventions" ON interventions;
CREATE POLICY "Manage school interventions" ON interventions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM students s
            WHERE s.id = interventions.student_id
            AND s.school_id = get_user_school_id()
        )
    );

