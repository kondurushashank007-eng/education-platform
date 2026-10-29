-- ==============================================================================
-- Migration: 001_initial_schema.sql
-- Description: Core Schema for EduReach AI - Inclusive Education Platform
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom Enum Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'educator', 'tutor', 'specialist');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE barrier_type AS ENUM ('academic', 'cognitive', 'physical_accessibility', 'socioeconomic_connectivity', 'language');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE intervention_status AS ENUM ('draft', 'active', 'completed', 'paused');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Schools / Educational Institutions Table
CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    district TEXT,
    connectivity_level TEXT DEFAULT 'high' CHECK (connectivity_level IN ('low', 'moderate', 'high')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Profiles Table (Mirrors and extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'educator',
    school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Students Table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    grade_level INT NOT NULL CHECK (grade_level BETWEEN 0 AND 12),
    primary_barrier barrier_type NOT NULL,
    has_iep_or_504 BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Student Telemetry & Longitudinal Tracking Table
CREATE TABLE IF NOT EXISTS student_telemetry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
    attendance_percentage NUMERIC(5,2) CHECK (attendance_percentage BETWEEN 0 AND 100),
    reading_score NUMERIC(5,2) CHECK (reading_score BETWEEN 0 AND 100),
    math_score NUMERIC(5,2) CHECK (math_score BETWEEN 0 AND 100),
    well_being_score INT CHECK (well_being_score BETWEEN 1 AND 5),
    notes TEXT,
    recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI-Generated Educational Accommodations Table
CREATE TABLE IF NOT EXISTS accommodation_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    learning_objective TEXT NOT NULL,
    accommodations_json JSONB NOT NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Structured Intervention & Tutoring Pipeline Table
CREATE TABLE IF NOT EXISTS interventions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES accommodation_plans(id) ON DELETE SET NULL,
    assigned_tutor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    intervention_type TEXT NOT NULL,
    target_milestones JSONB NOT NULL,
    status intervention_status NOT NULL DEFAULT 'draft',
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_school_id ON profiles(school_id);
CREATE INDEX IF NOT EXISTS idx_students_school_id ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_grade_barrier ON students(grade_level, primary_barrier);
CREATE INDEX IF NOT EXISTS idx_student_telemetry_student_date ON student_telemetry(student_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_accommodations_student ON accommodation_plans(student_id);
CREATE INDEX IF NOT EXISTS idx_interventions_student_status ON interventions(student_id, status);
CREATE INDEX IF NOT EXISTS idx_interventions_assigned_tutor ON interventions(assigned_tutor_id);

-- Auto-update updated_at timestamp function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS set_schools_updated_at ON schools;
CREATE TRIGGER set_schools_updated_at
BEFORE UPDATE ON schools
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS set_students_updated_at ON students;
CREATE TRIGGER set_students_updated_at
BEFORE UPDATE ON students
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS set_interventions_updated_at ON interventions;
CREATE TRIGGER set_interventions_updated_at
BEFORE UPDATE ON interventions
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

