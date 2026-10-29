// Direct client types aligned with shared contracts
export type UserRole = 'admin' | 'educator' | 'tutor' | 'specialist';
export type BarrierType = 'academic' | 'cognitive' | 'physical_accessibility' | 'socioeconomic_connectivity' | 'language';
export type InterventionStatus = 'draft' | 'active' | 'completed' | 'paused';
export type ConnectivityLevel = 'low' | 'moderate' | 'high';

export interface School {
  id: string;
  name: string;
  district?: string | null;
  connectivity_level: ConnectivityLevel;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  school_id: string | null;
  created_at: string;
}

export interface StudentTelemetry {
  id: string;
  student_id: string;
  recorded_at: string;
  attendance_percentage: number;
  reading_score: number;
  math_score: number;
  well_being_score: number;
  notes?: string | null;
  recorded_by?: string | null;
  created_at?: string;
}

export interface Student {
  id: string;
  school_id: string;
  first_name: string;
  last_name: string;
  grade_level: number;
  primary_barrier: BarrierType;
  has_iep_or_504: boolean;
  created_by?: string | null;
  created_at: string;
  latest_telemetry?: StudentTelemetry;
  active_interventions_count?: number;
  risk_level?: 'low' | 'moderate' | 'high';
}

export interface UDLPrinciples {
  representation: string[];
  engagement: string[];
  actionAndExpression: string[];
}

export interface ClassroomAccommodation {
  category: string;
  strategy: string;
  toolOrResource: string;
  lowTechFallback: string;
}

export interface TutoringRoadmapItem {
  sessionNumber: number;
  focusSkill: string;
  activityDescription: string;
  successMetric: string;
}

export interface AccommodationResponsePayload {
  executiveSummary: string;
  udlPrinciples: UDLPrinciples;
  classroomAccommodations: ClassroomAccommodation[];
  tutoringRoadmap: TutoringRoadmapItem[];
}

export interface AccommodationPlan {
  id: string;
  student_id: string;
  subject: string;
  learning_objective: string;
  accommodations_json: AccommodationResponsePayload;
  created_by?: string | null;
  created_at: string;
  student?: Student;
}

export interface InterventionMilestone {
  milestone: string;
  completed: boolean;
  dueDate?: string;
}

export interface Intervention {
  id: string;
  student_id: string;
  plan_id?: string | null;
  assigned_tutor_id?: string | null;
  intervention_type: string;
  target_milestones: InterventionMilestone[];
  status: InterventionStatus;
  start_date: string;
  end_date?: string | null;
  created_at: string;
  student?: Student;
  assigned_tutor?: Profile;
  plan?: AccommodationPlan;
}

export interface SchoolOverviewAnalytics {
  totalStudents: number;
  activeInterventions: number;
  accommodationsGenerated: number;
  averageAttendance: number;
  averageReadingScore: number;
  averageMathScore: number;
  averageWellBeing: number;
  studentsByBarrier: Record<BarrierType, number>;
  studentsByGrade: Record<number, number>;
  riskDistribution: {
    high: number;
    moderate: number;
    low: number;
  };
  interventionSuccessRate: number;
  longitudinalTrends: {
    month: string;
    avgAttendance: number;
    avgMath: number;
    avgReading: number;
    avgWellBeing: number;
  }[];
}

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  schoolId: string;
  schoolName: string;
}

