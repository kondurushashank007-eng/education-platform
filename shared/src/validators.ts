import { z } from 'zod';

// Accommodation Request Validator
export const AccommodationRequestSchema = z.object({
  studentId: z.string().uuid('Invalid student ID format'),
  subject: z.string().min(2, 'Subject must be at least 2 characters').max(100),
  learningObjective: z.string().min(10, 'Learning objective must be at least 10 characters').max(500),
  classSize: z.number().int().positive().default(25),
  connectivityLevel: z.enum(['low', 'moderate', 'high']).default('moderate'),
  availableTechnology: z.string().max(300).optional().default('Standard interactive whiteboard and shared tablets')
});

export type AccommodationRequestInput = z.infer<typeof AccommodationRequestSchema>;

// Telemetry Checkpoint Validator
export const StudentTelemetrySchema = z.object({
  studentId: z.string().uuid('Invalid student ID format'),
  attendancePercentage: z.number().min(0, 'Attendance cannot be negative').max(100, 'Attendance cannot exceed 100%'),
  readingScore: z.number().min(0).max(100),
  mathScore: z.number().min(0).max(100),
  wellBeingScore: z.number().int().min(1, 'Well-being must be between 1 and 5').max(5, 'Well-being must be between 1 and 5'),
  notes: z.string().max(1000).optional(),
  recordedAt: z.string().optional() // defaults to current date on backend
});

export type StudentTelemetryInput = z.infer<typeof StudentTelemetrySchema>;

// Student Intake Validator
export const StudentIntakeSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  gradeLevel: z.number().int().min(0, 'Grade must be 0 (Kindergarten) through 12').max(12),
  primaryBarrier: z.enum(['academic', 'cognitive', 'physical_accessibility', 'socioeconomic_connectivity', 'language']),
  hasIepOr504: z.boolean().default(false),
  // Baseline telemetry optional upon intake
  baselineAttendance: z.number().min(0).max(100).default(90),
  baselineReadingScore: z.number().min(0).max(100).default(70),
  baselineMathScore: z.number().min(0).max(100).default(70),
  baselineWellBeing: z.number().int().min(1).max(5).default(3),
  intakeNotes: z.string().max(1000).optional()
});

export type StudentIntakeInput = z.infer<typeof StudentIntakeSchema>;

// Intervention Milestone Validator
export const InterventionMilestoneSchema = z.object({
  milestone: z.string().min(2, 'Milestone description is required'),
  completed: z.boolean().default(false),
  dueDate: z.string().optional()
});

// Intervention Create Validator
export const InterventionCreateSchema = z.object({
  studentId: z.string().uuid('Invalid student ID'),
  planId: z.string().uuid().optional().nullable(),
  assignedTutorId: z.string().uuid().optional().nullable(),
  interventionType: z.string().min(3, 'Intervention type must be at least 3 characters').max(150),
  targetMilestones: z.array(InterventionMilestoneSchema).min(1, 'At least one target milestone is required'),
  status: z.enum(['draft', 'active', 'completed', 'paused']).default('draft'),
  startDate: z.string().min(4, 'Start date is required'),
  endDate: z.string().optional().nullable()
});

export type InterventionCreateInput = z.infer<typeof InterventionCreateSchema>;

// Intervention Update Validator
export const InterventionUpdateSchema = z.object({
  status: z.enum(['draft', 'active', 'completed', 'paused']).optional(),
  assignedTutorId: z.string().uuid().optional().nullable(),
  targetMilestones: z.array(InterventionMilestoneSchema).optional(),
  endDate: z.string().optional().nullable()
});

export type InterventionUpdateInput = z.infer<typeof InterventionUpdateSchema>;

// Auth Login & Register Validators
export const UserLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export type UserLoginInput = z.infer<typeof UserLoginSchema>;

export const UserRegisterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name is required').max(100),
  role: z.enum(['admin', 'educator', 'tutor', 'specialist']).default('educator'),
  schoolId: z.string().uuid().optional().nullable(),
  newSchoolName: z.string().min(3).optional()
});

export type UserRegisterInput = z.infer<typeof UserRegisterSchema>;

