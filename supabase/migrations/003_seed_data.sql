-- ==============================================================================
-- Migration: 003_seed_data.sql
-- Description: Production-Grade Seed Data for Testing & Demonstration
-- ==============================================================================

-- 1. Insert Schools
INSERT INTO schools (id, name, district, connectivity_level)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Oakridge Inclusive Academy', 'Metro Unified School District', 'high'),
    ('22222222-2222-2222-2222-222222222222', 'Crestview Frontier High', 'Rural Valley District 4', 'low')
ON CONFLICT (id) DO NOTHING;

-- 2. Mock profiles (Note: In pure Supabase, user IDs correspond to auth.users)
-- To enable standalone testing without auth triggers failing, we insert into profiles:
INSERT INTO profiles (id, email, full_name, role, school_id)
VALUES
    ('33333333-3333-3333-3333-333333333331', 'admin@oakridge.edu', 'Dr. Eleanor Vance', 'admin', '11111111-1111-1111-1111-111111111111'),
    ('33333333-3333-3333-3333-333333333332', 'marcus.chen@oakridge.edu', 'Marcus Chen, M.Ed.', 'educator', '11111111-1111-1111-1111-111111111111'),
    ('33333333-3333-3333-3333-333333333333', 's.jenkins@oakridge.edu', 'Sarah Jenkins, BCBA', 'specialist', '11111111-1111-1111-1111-111111111111'),
    ('33333333-3333-3333-3333-333333333334', 'alex.tutor@oakridge.edu', 'Alex Rivera', 'tutor', '11111111-1111-1111-1111-111111111111'),
    ('44444444-4444-4444-4444-444444444441', 'robert.m@crestview.org', 'Robert Miller', 'educator', '22222222-2222-2222-2222-222222222222')
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Diverse Student Roster for Oakridge
INSERT INTO students (id, school_id, first_name, last_name, grade_level, primary_barrier, has_iep_or_504, created_by)
VALUES
    ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Maya', 'Patel', 8, 'cognitive', TRUE, '33333333-3333-3333-3333-333333333332'),
    ('aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Leo', 'Alvarez', 6, 'cognitive', TRUE, '33333333-3333-3333-3333-333333333332'),
    ('aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Fatima', 'Al-Hassan', 10, 'language', FALSE, '33333333-3333-3333-3333-333333333332'),
    ('aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Jordan', 'Brooks', 11, 'socioeconomic_connectivity', FALSE, '33333333-3333-3333-3333-333333333332'),
    ('aaaaaaa5-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Tyler', 'Scott', 5, 'physical_accessibility', TRUE, '33333333-3333-3333-3333-333333333333'),
    ('aaaaaaa6-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Elena', 'Ramos', 9, 'academic', FALSE, '33333333-3333-3333-3333-333333333332'),
    ('bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Lucas', 'Bennett', 7, 'socioeconomic_connectivity', FALSE, '44444444-4444-4444-4444-444444444441')
ON CONFLICT (id) DO NOTHING;

-- 4. Longitudinal Telemetry Data
INSERT INTO student_telemetry (id, student_id, recorded_at, attendance_percentage, reading_score, math_score, well_being_score, notes, recorded_by)
VALUES
    -- Maya Patel longitudinal progression (ADHD / Cognitive)
    ('t1111111-1111-1111-1111-111111111111', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', CURRENT_DATE - INTERVAL '60 days', 82.5, 64.0, 58.0, 2, 'Struggles with working memory during timed fraction quizzes.', '33333333-3333-3333-3333-333333333332'),
    ('t1111111-1111-1111-1111-111111111112', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', CURRENT_DATE - INTERVAL '40 days', 86.0, 68.5, 63.0, 3, 'Began using color-coded fraction tiles. High engagement.', '33333333-3333-3333-3333-333333333332'),
    ('t1111111-1111-1111-1111-111111111113', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', CURRENT_DATE - INTERVAL '20 days', 89.0, 72.0, 70.5, 4, 'Math velocity climbing; response to chunked 10-minute work sprints is positive.', '33333333-3333-3333-3333-333333333334'),
    ('t1111111-1111-1111-1111-111111111114', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', CURRENT_DATE - INTERVAL '2 days', 92.0, 75.0, 76.0, 4, 'Consistent improvement across fractions and algebraic concepts.', '33333333-3333-3333-3333-333333333332'),

    -- Leo Alvarez (Dyslexia / Cognitive)
    ('t2222222-2222-2222-2222-222222222221', 'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa', CURRENT_DATE - INTERVAL '45 days', 88.0, 52.0, 84.0, 2, 'Extreme anxiety during oral reading exercises in group settings.', '33333333-3333-3333-3333-333333333332'),
    ('t2222222-2222-2222-2222-222222222222', 'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa', CURRENT_DATE - INTERVAL '25 days', 90.0, 59.0, 86.0, 3, 'Introduced OpenDyslexic font reader tool and speech-to-text.', '33333333-3333-3333-3333-333333333333'),
    ('t2222222-2222-2222-2222-222222222223', 'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa', CURRENT_DATE - INTERVAL '5 days', 94.0, 67.5, 88.0, 4, 'Fluency benchmark up by 15 words per minute on assistive reader.', '33333333-3333-3333-3333-333333333332'),

    -- Fatima Al-Hassan (Language / ELL)
    ('t3333333-3333-3333-3333-333333333331', 'aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaaa', CURRENT_DATE - INTERVAL '30 days', 95.0, 61.0, 91.0, 3, 'Excels in symbolic math; requires bilingual glossaries for word problems.', '33333333-3333-3333-3333-333333333332'),
    ('t3333333-3333-3333-3333-333333333332', 'aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaaa', CURRENT_DATE - INTERVAL '7 days', 97.0, 70.0, 93.0, 4, 'Vocabulary flashcards and dual-language scaffolds showing steady impact.', '33333333-3333-3333-3333-333333333334'),

    -- Jordan Brooks (Low Bandwidth Socioeconomic)
    ('t4444444-4444-4444-4444-444444444441', 'aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaaa', CURRENT_DATE - INTERVAL '30 days', 74.0, 71.0, 65.0, 2, 'Missed online homework submissions due to lack of home broadband.', '33333333-3333-3333-3333-333333333332'),
    ('t4444444-4444-4444-4444-444444444442', 'aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaaa', CURRENT_DATE - INTERVAL '7 days', 83.0, 75.0, 72.0, 3, 'Provided offline packet and USB thumb drive with loaded interactive notes.', '33333333-3333-3333-3333-333333333332')
ON CONFLICT (id) DO NOTHING;

-- 5. Accommodation Plans
INSERT INTO accommodation_plans (id, student_id, subject, learning_objective, accommodations_json, created_by)
VALUES
    (
        'c1111111-1111-1111-1111-111111111111',
        'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'Mathematics',
        'Master addition and subtraction of fractions with unlike denominators using visual and manipulative scaffolding',
        '{
            "executiveSummary": "Maya demonstrates strong conceptual reasoning but experiences cognitive load fatigue during multi-step fraction operations. This plan implements Universal Design for Learning (UDL) principles with explicit visual chunking, manipulative-based representations, and low-distraction sprint intervals.",
            "udlPrinciples": {
                "representation": [
                    "Color-coded fraction fraction strips to visualize least common denominators physically.",
                    "Step-by-step visual cue cards placed on student workspace with highlighted transition steps.",
                    "Audio-narrated screen demonstrations with pause-and-reflect checkpoints."
                ],
                "engagement": [
                    "10-minute focused sprint intervals paired with 2-minute restorative visual resets.",
                    "Gamified self-monitoring progress tracker for tracking completed problems.",
                    "Student autonomy to select between physical tiles or digital drag-and-drop models."
                ],
                "actionAndExpression": [
                    "Option to explain problem solution verbally or record an audio walkthrough instead of writing lengthy step-by-step proofs.",
                    "Formula and visual reference cheat-sheet allowed during all independent work.",
                    "Graphic organizer format for finding LCM/GCD rather than open blank paper."
                ]
            },
            "classroomAccommodations": [
                {
                    "category": "Instructional Delivery",
                    "strategy": "Dual-Modal Problem Presentation",
                    "toolOrResource": "Interactive Whiteboard + Printed Step Card",
                    "lowTechFallback": "Laminated 3x5 index card with color-coded step arrows."
                },
                {
                    "category": "Assessment & Testing",
                    "strategy": "Chunked Testing with Reduced Problem Volume",
                    "toolOrResource": "Online Quiz Form with 2 problems per page",
                    "lowTechFallback": "Paper test folded into quarters, showing only one problem quadrant at a time."
                },
                {
                    "category": "Sensory & Environment",
                    "strategy": "Visual Distraction Reduction",
                    "toolOrResource": "Noise-cancelling headphones and desk study carrel",
                    "lowTechFallback": "Cardboard tabletop divider and preferential seating away from doors."
                }
            ],
            "tutoringRoadmap": [
                {
                    "sessionNumber": 1,
                    "focusSkill": "Visualizing Common Denominators",
                    "activityDescription": "Hands-on fraction strip alignment exercises; student physically verifies equivalencies.",
                    "successMetric": "Correctly matches 4 out of 5 equivalent fraction pairs within 6 minutes."
                },
                {
                    "sessionNumber": 2,
                    "focusSkill": "Least Common Multiple Decomposition",
                    "activityDescription": "Use ladder method diagram on tactile whiteboard to compute lowest common denominator.",
                    "successMetric": "Independently finds LCD for 3 unlike denominator pairs without prompting."
                },
                {
                    "sessionNumber": 3,
                    "focusSkill": "Scaffolded Addition with Unlike Denominators",
                    "activityDescription": "Follow 4-step cue card to convert fractions, execute addition, and simplify if necessary.",
                    "successMetric": "Achieves 80% accuracy on a 6-problem scaffolded worksheet."
                },
                {
                    "sessionNumber": 4,
                    "focusSkill": "Independent Expression and Peer Explanation",
                    "activityDescription": "Student teaches one problem back to tutor using visual fraction tiles.",
                    "successMetric": "Verbalizes conversion step accurately and justifies result."
                }
            ]
        }',
        '33333333-3333-3333-3333-333333333332'
    )
ON CONFLICT (id) DO NOTHING;

-- 6. Interventions
INSERT INTO interventions (id, student_id, plan_id, assigned_tutor_id, intervention_type, target_milestones, status, start_date, end_date)
VALUES
    (
        'i1111111-1111-1111-1111-111111111111',
        'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'c1111111-1111-1111-1111-111111111111',
        '33333333-3333-3333-3333-333333333334',
        '1-on-1 Remedial Tutoring (Math Foundations)',
        '[
            {"milestone": "Mastery of visual fraction equivalence with physical tiles", "completed": true, "dueDate": "2026-11-05"},
            {"milestone": "Least Common Denominator graphic organizer independence", "completed": true, "dueDate": "2026-11-12"},
            {"milestone": "80% accuracy on unassisted 10-problem addition test", "completed": false, "dueDate": "2026-11-20"},
            {"milestone": "Post-intervention telemetry checkpoint evaluation", "completed": false, "dueDate": "2026-11-27"}
        ]',
        'active',
        CURRENT_DATE - INTERVAL '14 days',
        CURRENT_DATE + INTERVAL '28 days'
    ),
    (
        'i2222222-2222-2222-2222-222222222222',
        'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        NULL,
        '33333333-3333-3333-3333-333333333333',
        'Assistive Tech Deployment & Dyslexia Lab',
        '[
            {"milestone": "Audio-reader extension installation and keyboard shortcuts", "completed": true, "dueDate": "2026-10-15"},
            {"milestone": "15 WPM reading speed boost verification checkpoint", "completed": true, "dueDate": "2026-10-30"},
            {"milestone": "Independent comprehension summary using speech-to-text", "completed": false, "dueDate": "2026-11-10"}
        ]',
        'active',
        CURRENT_DATE - INTERVAL '20 days',
        CURRENT_DATE + INTERVAL '15 days'
    ),
    (
        'i3333333-3333-3333-3333-333333333333',
        'aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        NULL,
        '33333333-3333-3333-3333-333333333334',
        'Family Engagement & Low-Bandwidth Study Support',
        '[
            {"milestone": "Distribute offline weekly USB curriculum kit", "completed": true, "dueDate": "2026-10-10"},
            {"milestone": "Bi-weekly SMS progress check-in with guardian", "completed": true, "dueDate": "2026-10-24"},
            {"milestone": "Quarterly attendance stabilization above 85%", "completed": false, "dueDate": "2026-11-30"}
        ]',
        'active',
        CURRENT_DATE - INTERVAL '25 days',
        CURRENT_DATE + INTERVAL '35 days'
    )
ON CONFLICT (id) DO NOTHING;

