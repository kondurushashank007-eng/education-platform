import { 
  Student, StudentTelemetry, AccommodationPlan, Intervention, 
  SchoolOverviewAnalytics, School, Profile, DemoUser,
  AccommodationResponsePayload
} from '../types';

const API_BASE = '/api';

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  const token = localStorage.getItem('edureach_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const demoUserId = localStorage.getItem('edureach_user_id');
  if (demoUserId) {
    headers['x-user-id'] = demoUserId;
  }

  const demoSchoolId = localStorage.getItem('edureach_school_id');
  if (demoSchoolId) {
    headers['x-school-id'] = demoSchoolId;
  }

  return headers;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers as Record<string, string> || {})
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network request failed' }));
    throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  auth: {
    getSchools: () => request<{ schools: School[] }>('/auth/schools'),
    getDemoUsers: () => request<{ demoUsers: DemoUser[] }>('/auth/demo-users'),
    login: (data: { email: string; password?: string }) => 
      request<{ token: string; user: any; profile: Profile; school: School | null }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    register: (data: any) =>
      request<{ token: string; user: any; profile: Profile; school: School | null }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    me: () => request<{ profile: Profile; school: School | null }>('/auth/me')
  },

  // Students
  students: {
    list: (params: { search?: string; grade?: string; barrier?: string; risk?: string; iep?: string } = {}) => {
      const query = new URLSearchParams();
      if (params.search) query.append('search', params.search);
      if (params.grade !== undefined && params.grade !== '') query.append('grade', params.grade);
      if (params.barrier && params.barrier !== 'all') query.append('barrier', params.barrier);
      if (params.risk && params.risk !== 'all') query.append('risk', params.risk);
      if (params.iep !== undefined && params.iep !== '') query.append('iep', params.iep);

      const qs = query.toString() ? `?${query.toString()}` : '';
      return request<{ students: Student[]; total: number; schoolId: string }>(`/students${qs}`);
    },
    getById: (id: string) => 
      request<{
        student: Student;
        telemetry: StudentTelemetry[];
        accommodations: AccommodationPlan[];
        interventions: Intervention[];
      }>(`/students/${id}`),
    create: (data: any) =>
      request<{ message: string; student: Student }>('/students', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    recordTelemetry: (data: {
      studentId: string;
      attendancePercentage: number;
      readingScore: number;
      mathScore: number;
      wellBeingScore: number;
      notes?: string;
      recordedAt?: string;
    }) =>
      request<{ message: string; telemetry: StudentTelemetry }>('/students/telemetry', {
        method: 'POST',
        body: JSON.stringify(data)
      })
  },

  // AI Advisory & Accommodations
  advisory: {
    generate: (data: {
      studentId: string;
      subject: string;
      learningObjective: string;
      classSize: number;
      connectivityLevel: 'low' | 'moderate' | 'high';
      availableTechnology?: string;
    }) =>
      request<{
        message: string;
        plan: AccommodationPlan;
        source: 'gemini-2.5-flash' | 'curated-adaptive-engine';
      }>('/advisory/generate-accommodation', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    getByStudent: (studentId: string) =>
      request<{ accommodations: AccommodationPlan[] }>(`/advisory/accommodations/${studentId}`)
  },

  // Interventions
  interventions: {
    list: () => request<{ interventions: Intervention[] }>('/interventions'),
    getStaff: () => request<{ staff: Profile[] }>('/interventions/staff'),
    create: (data: {
      studentId: string;
      planId?: string | null;
      assignedTutorId?: string | null;
      interventionType: string;
      targetMilestones: Array<{ milestone: string; completed: boolean; dueDate?: string }>;
      startDate: string;
      endDate?: string | null;
      status: 'draft' | 'active' | 'completed' | 'paused';
    }) =>
      request<{ message: string; intervention: Intervention }>('/interventions', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    update: (id: string, data: {
      status?: 'draft' | 'active' | 'completed' | 'paused';
      assignedTutorId?: string | null;
      targetMilestones?: Array<{ milestone: string; completed: boolean; dueDate?: string }>;
      endDate?: string | null;
    }) =>
      request<{ message: string; intervention: Intervention }>(`/interventions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      })
  },

  // Analytics
  analytics: {
    getOverview: () => request<{ school: School; analytics: SchoolOverviewAnalytics }>('/analytics/school-overview')
  },

  // Health
  health: () => request<any>('/health')
};
