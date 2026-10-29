import { Request, Response } from 'express';
import { DataStoreService } from '../services/store';
import { StudentIntakeInput, StudentTelemetryInput } from '../../../shared/dist/validators';
import { v4 as uuidv4 } from 'uuid';

export class StudentController {
  /**
   * GET /api/students
   * Scoped to the authenticated user's school
   */
  static async getStudents(req: Request, res: Response): Promise<void> {
    try {
      const schoolId = req.schoolId!;
      const { search, grade, barrier, risk, iep } = req.query;

      let students = await DataStoreService.getStudentsBySchool(schoolId);

      // Filtering
      if (search && typeof search === 'string') {
        const query = search.toLowerCase();
        students = students.filter(s => 
          `${s.first_name} ${s.last_name}`.toLowerCase().includes(query)
        );
      }

      if (grade !== undefined && grade !== '') {
        const gradeNum = parseInt(grade as string, 10);
        if (!isNaN(gradeNum)) {
          students = students.filter(s => s.grade_level === gradeNum);
        }
      }

      if (barrier && typeof barrier === 'string' && barrier !== 'all') {
        students = students.filter(s => s.primary_barrier === barrier);
      }

      if (risk && typeof risk === 'string' && risk !== 'all') {
        students = students.filter(s => s.risk_level === risk);
      }

      if (iep !== undefined && iep !== '') {
        const hasIep = iep === 'true';
        students = students.filter(s => s.has_iep_or_504 === hasIep);
      }

      res.json({
        students,
        total: students.length,
        schoolId
      });
    } catch (err: any) {
      console.error('Error fetching students:', err);
      res.status(500).json({ error: 'Failed to retrieve students' });
    }
  }

  /**
   * GET /api/students/:id
   * Detailed student profile, telemetry timeline, accommodations & interventions
   */
  static async getStudentById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const schoolId = req.schoolId!;

      const student = await DataStoreService.getStudentById(id, schoolId);
      if (!student) {
        res.status(404).json({ error: 'Student not found in your school organization' });
        return;
      }

      const telemetry = await DataStoreService.getTelemetryByStudent(id);
      const accommodations = await DataStoreService.getAccommodationsByStudent(id);
      const interventions = await DataStoreService.getInterventionsByStudent(id);

      res.json({
        student,
        telemetry,
        accommodations,
        interventions
      });
    } catch (err: any) {
      console.error('Error fetching student profile:', err);
      res.status(500).json({ error: 'Failed to retrieve student profile' });
    }
  }

  /**
   * POST /api/students
   * Create new student profile with baseline barrier diagnostics
   */
  static async createStudent(req: Request, res: Response): Promise<void> {
    try {
      const input = req.body as StudentIntakeInput;
      const schoolId = req.schoolId!;
      const createdBy = req.user?.id;

      const student = await DataStoreService.createStudent({
        schoolId,
        firstName: input.firstName,
        lastName: input.lastName,
        gradeLevel: input.gradeLevel,
        primaryBarrier: input.primaryBarrier,
        hasIepOr504: input.hasIepOr504,
        createdBy,
        baselineAttendance: input.baselineAttendance,
        baselineReadingScore: input.baselineReadingScore,
        baselineMathScore: input.baselineMathScore,
        baselineWellBeing: input.baselineWellBeing,
        intakeNotes: input.intakeNotes
      });

      res.status(201).json({
        message: 'Student profile registered successfully with baseline telemetry',
        student
      });
    } catch (err: any) {
      console.error('Error creating student:', err);
      res.status(500).json({ error: 'Failed to create student record' });
    }
  }

  /**
   * POST /api/telemetry
   * Record a new checkpoint (attendance, scores, well-being)
   */
  static async recordTelemetry(req: Request, res: Response): Promise<void> {
    try {
      const input = req.body as StudentTelemetryInput;
      const schoolId = req.schoolId!;

      // Enforce tenant isolation: verify student belongs to user's school
      const student = await DataStoreService.getStudentById(input.studentId, schoolId);
      if (!student) {
        res.status(403).json({ error: 'Unauthorized: Student is not registered in your school organization' });
        return;
      }

      const telemetryRecord = await DataStoreService.recordTelemetry({
        id: uuidv4(),
        student_id: input.studentId,
        recorded_at: input.recordedAt || new Date().toISOString().split('T')[0],
        attendance_percentage: input.attendancePercentage,
        reading_score: input.readingScore,
        math_score: input.mathScore,
        well_being_score: input.wellBeingScore,
        notes: input.notes || null,
        recorded_by: req.user?.id || null,
        created_at: new Date().toISOString()
      });

      res.status(201).json({
        message: 'Telemetry checkpoint logged successfully',
        telemetry: telemetryRecord
      });
    } catch (err: any) {
      console.error('Error recording telemetry:', err);
      res.status(500).json({ error: 'Failed to record telemetry checkpoint' });
    }
  }
}

