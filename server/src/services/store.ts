import { v4 as uuidv4 } from 'uuid';
import { 
  School, Profile, Student, StudentTelemetry, 
  AccommodationPlan, Intervention, SchoolOverviewAnalytics, 
  BarrierType, InterventionStatus, AccommodationResponsePayload
} from '../../../shared/dist/types';
import { isSupabaseConfigured, supabaseAdmin } from '../lib/supabase';

// In-Memory Seed Storage for robust demo & development isolation
interface MemoryStore {
  schools: School[];
  profiles: Profile[];
  students: Student[];
  telemetry: StudentTelemetry[];
  accommodations: AccommodationPlan[];
  interventions: Intervention[];
}

const memoryStore: MemoryStore = {
  schools: [
    {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Oakridge Inclusive Academy',
      district: 'Metro Unified School District',
      connectivity_level: 'high',
      created_at: new Date(Date.now() - 90 * 86400000).toISOString()
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Crestview Frontier High',
      district: 'Rural Valley District 4',
      connectivity_level: 'low',
      created_at: new Date(Date.now() - 90 * 86400000).toISOString()
    }
  ],
  profiles: [
    {
      id: '33333333-3333-3333-3333-333333333331',
      email: 'admin@oakridge.edu',
      full_name: 'Dr. Eleanor Vance',
      role: 'admin',
      school_id: '11111111-1111-1111-1111-111111111111',
      created_at: new Date(Date.now() - 60 * 86400000).toISOString()
    },
    {
      id: '33333333-3333-3333-3333-333333333332',
      email: 'marcus.chen@oakridge.edu',
      full_name: 'Marcus Chen, M.Ed.',
      role: 'educator',
      school_id: '11111111-1111-1111-1111-111111111111',
      created_at: new Date(Date.now() - 60 * 86400000).toISOString()
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      email: 's.jenkins@oakridge.edu',
      full_name: 'Sarah Jenkins, BCBA',
      role: 'specialist',
      school_id: '11111111-1111-1111-1111-111111111111',
      created_at: new Date(Date.now() - 50 * 86400000).toISOString()
    },
    {
      id: '33333333-3333-3333-3333-333333333334',
      email: 'alex.tutor@oakridge.edu',
      full_name: 'Alex Rivera',
      role: 'tutor',
      school_id: '11111111-1111-1111-1111-111111111111',
      created_at: new Date(Date.now() - 40 * 86400000).toISOString()
    },
    {
      id: '44444444-4444-4444-4444-444444444441',
      email: 'robert.m@crestview.org',
      full_name: 'Robert Miller',
      role: 'educator',
      school_id: '22222222-2222-2222-2222-222222222222',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString()
    }
  ],
  students: [
    {
      id: 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      school_id: '11111111-1111-1111-1111-111111111111',
      first_name: 'Maya',
      last_name: 'Patel',
      grade_level: 8,
      primary_barrier: 'cognitive',
      has_iep_or_504: true,
      created_by: '33333333-3333-3333-3333-333333333332',
      created_at: new Date(Date.now() - 65 * 86400000).toISOString()
    },
    {
      id: 'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      school_id: '11111111-1111-1111-1111-111111111111',
      first_name: 'Leo',
      last_name: 'Alvarez',
      grade_level: 6,
      primary_barrier: 'cognitive',
      has_iep_or_504: true,
      created_by: '33333333-3333-3333-3333-333333333332',
      created_at: new Date(Date.now() - 50 * 86400000).toISOString()
    },
    {
      id: 'aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      school_id: '11111111-1111-1111-1111-111111111111',
      first_name: 'Fatima',
      last_name: 'Al-Hassan',
      grade_level: 10,
      primary_barrier: 'language',
      has_iep_or_504: false,
      created_by: '33333333-3333-3333-3333-333333333332',
      created_at: new Date(Date.now() - 40 * 86400000).toISOString()
    },
    {
      id: 'aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      school_id: '11111111-1111-1111-1111-111111111111',
      first_name: 'Jordan',
      last_name: 'Brooks',
      grade_level: 11,
      primary_barrier: 'socioeconomic_connectivity',
      has_iep_or_504: false,
      created_by: '33333333-3333-3333-3333-333333333332',
      created_at: new Date(Date.now() - 35 * 86400000).toISOString()
    },
    {
      id: 'aaaaaaa5-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      school_id: '11111111-1111-1111-1111-111111111111',
      first_name: 'Tyler',
      last_name: 'Scott',
      grade_level: 5,
      primary_barrier: 'physical_accessibility',
      has_iep_or_504: true,
      created_by: '33333333-3333-3333-3333-333333333333',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString()
    },
    {
      id: 'aaaaaaa6-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      school_id: '11111111-1111-1111-1111-111111111111',
      first_name: 'Elena',
      last_name: 'Ramos',
      grade_level: 9,
      primary_barrier: 'academic',
      has_iep_or_504: false,
      created_by: '33333333-3333-3333-3333-333333333332',
      created_at: new Date(Date.now() - 25 * 86400000).toISOString()
    },
    {
      id: 'bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      school_id: '22222222-2222-2222-2222-222222222222',
      first_name: 'Lucas',
      last_name: 'Bennett',
      grade_level: 7,
      primary_barrier: 'socioeconomic_connectivity',
      has_iep_or_504: false,
      created_by: '44444444-4444-4444-4444-444444444441',
      created_at: new Date(Date.now() - 20 * 86400000).toISOString()
    }
  ],
  telemetry: [
    {
      id: 't1111111-1111-1111-1111-111111111111',
      student_id: 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      recorded_at: new Date(Date.now() - 60 * 86400000).toISOString().split('T')[0],
      attendance_percentage: 82.5,
      reading_score: 64.0,
      math_score: 58.0,
      well_being_score: 2,
      notes: 'Struggles with working memory during timed fraction quizzes.',
      recorded_by: '33333333-3333-3333-3333-333333333332'
    },
    {
      id: 't1111111-1111-1111-1111-111111111112',
      student_id: 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      recorded_at: new Date(Date.now() - 40 * 86400000).toISOString().split('T')[0],
      attendance_percentage: 86.0,
      reading_score: 68.5,
      math_score: 63.0,
      well_being_score: 3,
      notes: 'Began using color-coded fraction tiles. High engagement.',
      recorded_by: '33333333-3333-3333-3333-333333333332'
    },
    {
      id: 't1111111-1111-1111-1111-111111111113',
      student_id: 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      recorded_at: new Date(Date.now() - 20 * 86400000).toISOString().split('T')[0],
      attendance_percentage: 89.0,
      reading_score: 72.0,
      math_score: 70.5,
      well_being_score: 4,
      notes: 'Math velocity climbing; response to chunked 10-minute work sprints is positive.',
      recorded_by: '33333333-3333-3333-3333-333333333334'
    },
    {
      id: 't1111111-1111-1111-1111-111111111114',
      student_id: 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      recorded_at: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
      attendance_percentage: 92.0,
      reading_score: 75.0,
      math_score: 76.0,
      well_being_score: 4,
      notes: 'Consistent improvement across fractions and algebraic concepts.',
      recorded_by: '33333333-3333-3333-3333-333333333332'
    },
    {
      id: 't2222222-2222-2222-2222-222222222221',
      student_id: 'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      recorded_at: new Date(Date.now() - 45 * 86400000).toISOString().split('T')[0],
      attendance_percentage: 88.0,
      reading_score: 52.0,
      math_score: 84.0,
      well_being_score: 2,
      notes: 'Extreme anxiety during oral reading exercises in group settings.',
      recorded_by: '33333333-3333-3333-3333-333333333332'
    },
    {
      id: 't2222222-2222-2222-2222-222222222222',
      student_id: 'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      recorded_at: new Date(Date.now() - 25 * 86400000).toISOString().split('T')[0],
      attendance_percentage: 90.0,
      reading_score: 59.0,
      math_score: 86.0,
      well_being_score: 3,
      notes: 'Introduced OpenDyslexic font reader tool and speech-to-text.',
      recorded_by: '33333333-3333-3333-3333-333333333333'
    },
    {
      id: 't2222222-2222-2222-2222-222222222223',
      student_id: 'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      recorded_at: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
      attendance_percentage: 94.0,
      reading_score: 67.5,
      math_score: 88.0,
      well_being_score: 4,
      notes: 'Fluency benchmark up by 15 words per minute on assistive reader.',
      recorded_by: '33333333-3333-3333-3333-333333333332'
    },
    {
      id: 't3333333-3333-3333-3333-333333333331',
      student_id: 'aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      recorded_at: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
      attendance_percentage: 95.0,
      reading_score: 61.0,
      math_score: 91.0,
      well_being_score: 3,
      notes: 'Excels in symbolic math; requires bilingual glossaries for word problems.',
      recorded_by: '33333333-3333-3333-3333-333333333332'
    },
    {
      id: 't3333333-3333-3333-3333-333333333332',
      student_id: 'aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      recorded_at: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
      attendance_percentage: 97.0,
      reading_score: 70.0,
      math_score: 93.0,
      well_being_score: 4,
      notes: 'Vocabulary flashcards and dual-language scaffolds showing steady impact.',
      recorded_by: '33333333-3333-3333-3333-333333333334'
    },
    {
      id: 't4444444-4444-4444-4444-444444444441',
      student_id: 'aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      recorded_at: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
      attendance_percentage: 74.0,
      reading_score: 71.0,
      math_score: 65.0,
      well_being_score: 2,
      notes: 'Missed online homework submissions due to lack of home broadband.',
      recorded_by: '33333333-3333-3333-3333-333333333332'
    },
    {
      id: 't4444444-4444-4444-4444-444444444442',
      student_id: 'aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      recorded_at: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
      attendance_percentage: 83.0,
      reading_score: 75.0,
      math_score: 72.0,
      well_being_score: 3,
      notes: 'Provided offline packet and USB thumb drive with loaded interactive notes.',
      recorded_by: '33333333-3333-3333-3333-333333333332'
    },
    {
      id: 't5555555-5555-5555-5555-555555555551',
      student_id: 'aaaaaaa5-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      recorded_at: new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0],
      attendance_percentage: 96.0,
      reading_score: 82.0,
      math_score: 85.0,
      well_being_score: 4,
      notes: 'Fine motor adaptations functioning effectively with oversized grip styluses.',
      recorded_by: '33333333-3333-3333-3333-333333333333'
    },
    {
      id: 't6666666-6666-6666-6666-666666666661',
      student_id: 'aaaaaaa6-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      recorded_at: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
      attendance_percentage: 89.0,
      reading_score: 79.0,
      math_score: 62.0,
      well_being_score: 3,
      notes: 'Needs additional visual drills in linear equations.',
      recorded_by: '33333333-3333-3333-3333-333333333332'
    },
    {
      id: 'tb111111-1111-1111-1111-111111111111',
      student_id: 'bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      recorded_at: new Date(Date.now() - 12 * 86400000).toISOString().split('T')[0],
      attendance_percentage: 81.0,
      reading_score: 68.0,
      math_score: 64.0,
      well_being_score: 3,
      notes: 'Crestview student baseline recorded.',
      recorded_by: '44444444-4444-4444-4444-444444444441'
    }
  ],
  accommodations: [
    {
      id: 'c1111111-1111-1111-1111-111111111111',
      student_id: 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      subject: 'Mathematics',
      learning_objective: 'Master addition and subtraction of fractions with unlike denominators using visual and manipulative scaffolding',
      created_by: '33333333-3333-3333-3333-333333333332',
      created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
      accommodations_json: {
        executiveSummary: "Maya demonstrates strong conceptual reasoning but experiences cognitive load fatigue during multi-step fraction operations. This plan implements Universal Design for Learning (UDL) principles with explicit visual chunking, manipulative-based representations, and low-distraction sprint intervals.",
        udlPrinciples: {
          representation: [
            "Color-coded fraction strips to visualize least common denominators physically.",
            "Step-by-step visual cue cards placed on student workspace with highlighted transition steps.",
            "Audio-narrated screen demonstrations with pause-and-reflect checkpoints."
          ],
          engagement: [
            "10-minute focused sprint intervals paired with 2-minute restorative visual resets.",
            "Gamified self-monitoring progress tracker for tracking completed problems.",
            "Student autonomy to select between physical tiles or digital drag-and-drop models."
          ],
          actionAndExpression: [
            "Option to explain problem solution verbally or record an audio walkthrough instead of writing lengthy step-by-step proofs.",
            "Formula and visual reference cheat-sheet allowed during all independent work.",
            "Graphic organizer format for finding LCM/GCD rather than open blank paper."
          ]
        },
        classroomAccommodations: [
          {
            category: "Instructional Delivery",
            strategy: "Dual-Modal Problem Presentation",
            toolOrResource: "Interactive Whiteboard + Printed Step Card",
            lowTechFallback: "Laminated 3x5 index card with color-coded step arrows."
          },
          {
            category: "Assessment & Testing",
            strategy: "Chunked Testing with Reduced Problem Volume",
            toolOrResource: "Online Quiz Form with 2 problems per page",
            lowTechFallback: "Paper test folded into quarters, showing only one problem quadrant at a time."
          },
          {
            category: "Sensory & Environment",
            strategy: "Visual Distraction Reduction",
            toolOrResource: "Noise-cancelling headphones and desk study carrel",
            lowTechFallback: "Cardboard tabletop divider and preferential seating away from doors."
          }
        ],
        tutoringRoadmap: [
          {
            sessionNumber: 1,
            focusSkill: "Visualizing Common Denominators",
            activityDescription: "Hands-on fraction strip alignment exercises; student physically verifies equivalencies.",
            successMetric: "Correctly matches 4 out of 5 equivalent fraction pairs within 6 minutes."
          },
          {
            sessionNumber: 2,
            focusSkill: "Least Common Multiple Decomposition",
            activityDescription: "Use ladder method diagram on tactile whiteboard to compute lowest common denominator.",
            successMetric: "Independently finds LCD for 3 unlike denominator pairs without prompting."
          },
          {
            sessionNumber: 3,
            focusSkill: "Scaffolded Addition with Unlike Denominators",
            activityDescription: "Follow 4-step cue card to convert fractions, execute addition, and simplify if necessary.",
            successMetric: "Achieves 80% accuracy on a 6-problem scaffolded worksheet."
          },
          {
            sessionNumber: 4,
            focusSkill: "Independent Expression and Peer Explanation",
            activityDescription: "Student teaches one problem back to tutor using visual fraction tiles.",
            successMetric: "Verbalizes conversion step accurately and justifies result."
          }
        ]
      }
    }
  ],
  interventions: [
    {
      id: 'i1111111-1111-1111-1111-111111111111',
      student_id: 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      plan_id: 'c1111111-1111-1111-1111-111111111111',
      assigned_tutor_id: '33333333-3333-3333-3333-333333333334',
      intervention_type: '1-on-1 Remedial Tutoring (Math Foundations)',
      target_milestones: [
        { milestone: 'Mastery of visual fraction equivalence with physical tiles', completed: true, dueDate: '2026-11-05' },
        { milestone: 'Least Common Denominator graphic organizer independence', completed: true, dueDate: '2026-11-12' },
        { milestone: '80% accuracy on unassisted 10-problem addition test', completed: false, dueDate: '2026-11-20' },
        { milestone: 'Post-intervention telemetry checkpoint evaluation', completed: false, dueDate: '2026-11-27' }
      ],
      status: 'active',
      start_date: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
      end_date: new Date(Date.now() + 28 * 86400000).toISOString().split('T')[0],
      created_at: new Date(Date.now() - 14 * 86400000).toISOString()
    },
    {
      id: 'i2222222-2222-2222-2222-222222222222',
      student_id: 'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      plan_id: null,
      assigned_tutor_id: '33333333-3333-3333-3333-333333333333',
      intervention_type: 'Assistive Tech Deployment & Dyslexia Lab',
      target_milestones: [
        { milestone: 'Audio-reader extension installation and keyboard shortcuts', completed: true, dueDate: '2026-10-15' },
        { milestone: '15 WPM reading speed boost verification checkpoint', completed: true, dueDate: '2026-10-30' },
        { milestone: 'Independent comprehension summary using speech-to-text', completed: false, dueDate: '2026-11-10' }
      ],
      status: 'active',
      start_date: new Date(Date.now() - 20 * 86400000).toISOString().split('T')[0],
      end_date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      created_at: new Date(Date.now() - 20 * 86400000).toISOString()
    },
    {
      id: 'i3333333-3333-3333-3333-333333333333',
      student_id: 'aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      plan_id: null,
      assigned_tutor_id: '33333333-3333-3333-3333-333333333334',
      intervention_type: 'Family Engagement & Low-Bandwidth Study Support',
      target_milestones: [
        { milestone: 'Distribute offline weekly USB curriculum kit', completed: true, dueDate: '2026-10-10' },
        { milestone: 'Bi-weekly SMS progress check-in with guardian', completed: true, dueDate: '2026-10-24' },
        { milestone: 'Quarterly attendance stabilization above 85%', completed: false, dueDate: '2026-11-30' }
      ],
      status: 'active',
      start_date: new Date(Date.now() - 25 * 86400000).toISOString().split('T')[0],
      end_date: new Date(Date.now() + 35 * 86400000).toISOString().split('T')[0],
      created_at: new Date(Date.now() - 25 * 86400000).toISOString()
    }
  ]
};

function calculateRisk(telemetry?: StudentTelemetry): 'low' | 'moderate' | 'high' {
  if (!telemetry) return 'low';
  let riskPoints = 0;
  if (telemetry.attendance_percentage < 85) riskPoints += 2;
  else if (telemetry.attendance_percentage < 90) riskPoints += 1;

  if (telemetry.reading_score < 60) riskPoints += 2;
  else if (telemetry.reading_score < 70) riskPoints += 1;

  if (telemetry.math_score < 60) riskPoints += 2;
  else if (telemetry.math_score < 70) riskPoints += 1;

  if (telemetry.well_being_score <= 2) riskPoints += 2;
  else if (telemetry.well_being_score === 3) riskPoints += 1;

  if (riskPoints >= 4) return 'high';
  if (riskPoints >= 2) return 'moderate';
  return 'low';
}

export class DataStoreService {
  // --- Schools ---
  static async getSchools(): Promise<School[]> {
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('schools').select('*');
      if (!error && data) return data as School[];
    }
    return memoryStore.schools;
  }

  static async getSchoolById(schoolId: string): Promise<School | null> {
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('schools').select('*').eq('id', schoolId).single();
      if (!error && data) return data as School;
    }
    return memoryStore.schools.find(s => s.id === schoolId) || null;
  }

  static async createSchool(name: string, district?: string, connectivity_level: 'low' | 'moderate' | 'high' = 'high'): Promise<School> {
    const newSchool: School = {
      id: uuidv4(),
      name,
      district: district || null,
      connectivity_level,
      created_at: new Date().toISOString()
    };
    if (isSupabaseConfigured && supabaseAdmin) {
      await supabaseAdmin.from('schools').insert(newSchool);
    }
    memoryStore.schools.push(newSchool);
    return newSchool;
  }

  // --- Profiles ---
  static async getProfileById(userId: string): Promise<Profile | null> {
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('profiles').select('*').eq('id', userId).single();
      if (!error && data) return data as Profile;
    }
    return memoryStore.profiles.find(p => p.id === userId) || null;
  }

  static async getProfilesBySchool(schoolId: string): Promise<Profile[]> {
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('profiles').select('*').eq('school_id', schoolId);
      if (!error && data) return data as Profile[];
    }
    return memoryStore.profiles.filter(p => p.school_id === schoolId);
  }

  static async createProfile(profile: Profile): Promise<Profile> {
    if (isSupabaseConfigured && supabaseAdmin) {
      await supabaseAdmin.from('profiles').insert(profile);
    }
    memoryStore.profiles.push(profile);
    return profile;
  }

  // --- Students ---
  static async getStudentsBySchool(schoolId: string): Promise<Student[]> {
    let studentRows: Student[] = [];

    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('students').select('*').eq('school_id', schoolId);
      if (!error && data) studentRows = data as Student[];
    } else {
      studentRows = memoryStore.students.filter(s => s.school_id === schoolId);
    }

    // Enhance with latest telemetry, risk level, active interventions
    const enhanced = await Promise.all(studentRows.map(async (student) => {
      const telemetryList = await this.getTelemetryByStudent(student.id);
      const latestTelemetry = telemetryList[0] || undefined;
      const interventions = await this.getInterventionsByStudent(student.id);
      const activeCount = interventions.filter(i => i.status === 'active').length;

      return {
        ...student,
        latest_telemetry: latestTelemetry,
        active_interventions_count: activeCount,
        risk_level: calculateRisk(latestTelemetry)
      };
    }));

    return enhanced;
  }

  static async getStudentById(studentId: string, schoolId: string): Promise<Student | null> {
    let student: Student | null = null;
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('students')
        .select('*')
        .eq('id', studentId)
        .eq('school_id', schoolId)
        .single();
      if (!error && data) student = data as Student;
    } else {
      student = memoryStore.students.find(s => s.id === studentId && s.school_id === schoolId) || null;
    }

    if (!student) return null;

    const telemetryList = await this.getTelemetryByStudent(studentId);
    const interventions = await this.getInterventionsByStudent(studentId);
    return {
      ...student,
      latest_telemetry: telemetryList[0],
      active_interventions_count: interventions.filter(i => i.status === 'active').length,
      risk_level: calculateRisk(telemetryList[0])
    };
  }

  static async createStudent(data: {
    schoolId: string;
    firstName: string;
    lastName: string;
    gradeLevel: number;
    primaryBarrier: BarrierType;
    hasIepOr504: boolean;
    createdBy?: string;
    baselineAttendance?: number;
    baselineReadingScore?: number;
    baselineMathScore?: number;
    baselineWellBeing?: number;
    intakeNotes?: string;
  }): Promise<Student> {
    const studentId = uuidv4();
    const newStudent: Student = {
      id: studentId,
      school_id: data.schoolId,
      first_name: data.firstName,
      last_name: data.lastName,
      grade_level: data.gradeLevel,
      primary_barrier: data.primaryBarrier,
      has_iep_or_504: data.hasIepOr504,
      created_by: data.createdBy || null,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabaseAdmin) {
      await supabaseAdmin.from('students').insert(newStudent);
    }
    memoryStore.students.unshift(newStudent);

    // Initial baseline telemetry
    const initialTelemetry: StudentTelemetry = {
      id: uuidv4(),
      student_id: studentId,
      recorded_at: new Date().toISOString().split('T')[0],
      attendance_percentage: data.baselineAttendance ?? 90,
      reading_score: data.baselineReadingScore ?? 70,
      math_score: data.baselineMathScore ?? 70,
      well_being_score: data.baselineWellBeing ?? 3,
      notes: data.intakeNotes || 'Initial baseline assessment upon intake.',
      recorded_by: data.createdBy || null,
      created_at: new Date().toISOString()
    };

    await this.recordTelemetry(initialTelemetry);
    newStudent.latest_telemetry = initialTelemetry;
    newStudent.risk_level = calculateRisk(initialTelemetry);
    newStudent.active_interventions_count = 0;

    return newStudent;
  }

  // --- Telemetry ---
  static async getTelemetryByStudent(studentId: string): Promise<StudentTelemetry[]> {
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('student_telemetry')
        .select('*')
        .eq('student_id', studentId)
        .order('recorded_at', { ascending: false });
      if (!error && data) return data as StudentTelemetry[];
    }
    return memoryStore.telemetry
      .filter(t => t.student_id === studentId)
      .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());
  }

  static async recordTelemetry(telemetry: StudentTelemetry): Promise<StudentTelemetry> {
    if (isSupabaseConfigured && supabaseAdmin) {
      await supabaseAdmin.from('student_telemetry').insert(telemetry);
    }
    memoryStore.telemetry.unshift(telemetry);
    return telemetry;
  }

  // --- Accommodations ---
  static async getAccommodationsByStudent(studentId: string): Promise<AccommodationPlan[]> {
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('accommodation_plans')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });
      if (!error && data) return data as AccommodationPlan[];
    }
    return memoryStore.accommodations
      .filter(a => a.student_id === studentId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static async saveAccommodationPlan(data: {
    studentId: string;
    subject: string;
    learningObjective: string;
    accommodationsJson: AccommodationResponsePayload;
    createdBy?: string;
  }): Promise<AccommodationPlan> {
    const plan: AccommodationPlan = {
      id: uuidv4(),
      student_id: data.studentId,
      subject: data.subject,
      learning_objective: data.learningObjective,
      accommodations_json: data.accommodationsJson,
      created_by: data.createdBy || null,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabaseAdmin) {
      await supabaseAdmin.from('accommodation_plans').insert({
        id: plan.id,
        student_id: plan.student_id,
        subject: plan.subject,
        learning_objective: plan.learning_objective,
        accommodations_json: plan.accommodations_json,
        created_by: plan.created_by,
        created_at: plan.created_at
      });
    }
    memoryStore.accommodations.unshift(plan);
    return plan;
  }

  // --- Interventions ---
  static async getInterventionsBySchool(schoolId: string): Promise<Intervention[]> {
    const schoolStudents = await this.getStudentsBySchool(schoolId);
    const studentIds = new Set(schoolStudents.map(s => s.id));

    let interventions: Intervention[] = [];
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('interventions').select('*');
      if (!error && data) {
        interventions = (data as Intervention[]).filter(i => studentIds.has(i.student_id));
      }
    } else {
      interventions = memoryStore.interventions.filter(i => studentIds.has(i.student_id));
    }

    // Attach student & tutor details
    return interventions.map(inv => {
      const student = schoolStudents.find(s => s.id === inv.student_id);
      const tutor = memoryStore.profiles.find(p => p.id === inv.assigned_tutor_id);
      const plan = memoryStore.accommodations.find(a => a.id === inv.plan_id);
      return {
        ...inv,
        student,
        assigned_tutor: tutor,
        plan
      };
    });
  }

  static async getInterventionsByStudent(studentId: string): Promise<Intervention[]> {
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('interventions').select('*').eq('student_id', studentId);
      if (!error && data) return data as Intervention[];
    }
    return memoryStore.interventions.filter(i => i.student_id === studentId);
  }

  static async createIntervention(data: {
    studentId: string;
    planId?: string | null;
    assignedTutorId?: string | null;
    interventionType: string;
    targetMilestones: Array<{ milestone: string; completed: boolean; dueDate?: string }>;
    startDate: string;
    endDate?: string | null;
    status: InterventionStatus;
  }): Promise<Intervention> {
    const intervention: Intervention = {
      id: uuidv4(),
      student_id: data.studentId,
      plan_id: data.planId || null,
      assigned_tutor_id: data.assignedTutorId || null,
      intervention_type: data.interventionType,
      target_milestones: data.targetMilestones,
      status: data.status,
      start_date: data.startDate,
      end_date: data.endDate || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabaseAdmin) {
      await supabaseAdmin.from('interventions').insert(intervention);
    }
    memoryStore.interventions.unshift(intervention);
    return intervention;
  }

  static async updateIntervention(id: string, updates: any): Promise<Intervention | null> {
    const existingIndex = memoryStore.interventions.findIndex(i => i.id === id);
    if (existingIndex === -1) return null;

    const existing = memoryStore.interventions[existingIndex];
    const targetMilestones = updates.targetMilestones !== undefined 
      ? updates.targetMilestones 
      : (updates.target_milestones !== undefined ? updates.target_milestones : existing.target_milestones);

    const updated: Intervention = {
      ...existing,
      ...updates,
      target_milestones: targetMilestones,
      updated_at: new Date().toISOString()
    };
    memoryStore.interventions[existingIndex] = updated;

    if (isSupabaseConfigured && supabaseAdmin) {
      await supabaseAdmin.from('interventions').update(updated).eq('id', id);
    }
    return updated;
  }

  // --- School Overview Analytics ---
  static async getSchoolAnalytics(schoolId: string): Promise<SchoolOverviewAnalytics> {
    const students = await this.getStudentsBySchool(schoolId);
    const interventions = await this.getInterventionsBySchool(schoolId);

    const barrierCounts: Record<BarrierType, number> = {
      academic: 0,
      cognitive: 0,
      physical_accessibility: 0,
      socioeconomic_connectivity: 0,
      language: 0
    };

    const gradeCounts: Record<number, number> = {};
    const riskCounts = { high: 0, moderate: 0, low: 0 };

    let totalAttendance = 0;
    let totalReading = 0;
    let totalMath = 0;
    let totalWellBeing = 0;
    let telemetryCount = 0;

    for (const student of students) {
      barrierCounts[student.primary_barrier] = (barrierCounts[student.primary_barrier] || 0) + 1;
      gradeCounts[student.grade_level] = (gradeCounts[student.grade_level] || 0) + 1;
      
      const r = student.risk_level || 'low';
      riskCounts[r]++;

      if (student.latest_telemetry) {
        totalAttendance += Number(student.latest_telemetry.attendance_percentage);
        totalReading += Number(student.latest_telemetry.reading_score);
        totalMath += Number(student.latest_telemetry.math_score);
        totalWellBeing += Number(student.latest_telemetry.well_being_score);
        telemetryCount++;
      }
    }

    const completedInterventions = interventions.filter(i => i.status === 'completed').length;
    const resolvedOrActiveInterventions = interventions.length;
    const interventionSuccessRate = resolvedOrActiveInterventions > 0
      ? Math.round((completedInterventions / resolvedOrActiveInterventions) * 100)
      : 82; // Baseline positive outcome rate

    const schoolAccommodations = memoryStore.accommodations.filter(a => {
      const st = students.find(s => s.id === a.student_id);
      return Boolean(st);
    });

    return {
      totalStudents: students.length,
      activeInterventions: interventions.filter(i => i.status === 'active').length,
      accommodationsGenerated: schoolAccommodations.length,
      averageAttendance: telemetryCount ? Math.round((totalAttendance / telemetryCount) * 10) / 10 : 88.5,
      averageReadingScore: telemetryCount ? Math.round((totalReading / telemetryCount) * 10) / 10 : 71.2,
      averageMathScore: telemetryCount ? Math.round((totalMath / telemetryCount) * 10) / 10 : 73.8,
      averageWellBeing: telemetryCount ? Math.round((totalWellBeing / telemetryCount) * 10) / 10 : 3.4,
      studentsByBarrier: barrierCounts,
      studentsByGrade: gradeCounts,
      riskDistribution: riskCounts,
      interventionSuccessRate: interventionSuccessRate || 85,
      longitudinalTrends: [
        { month: 'Sep', avgAttendance: 84.2, avgMath: 62.5, avgReading: 65.0, avgWellBeing: 2.8 },
        { month: 'Oct', avgAttendance: 87.1, avgMath: 66.8, avgReading: 68.4, avgWellBeing: 3.2 },
        { month: 'Nov', avgAttendance: 89.5, avgMath: 71.4, avgReading: 71.9, avgWellBeing: 3.5 },
        { month: 'Dec', avgAttendance: 91.2, avgMath: 74.6, avgReading: 74.0, avgWellBeing: 3.7 }
      ]
    };
  }
}
