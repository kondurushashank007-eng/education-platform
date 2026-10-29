import { Router } from 'express';
import { StudentController } from '../controllers/studentController';
import { authenticate, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { StudentIntakeSchema, StudentTelemetrySchema } from '../../../shared/dist/validators';

const router = Router();

// All student routes require authentication
router.use(authenticate);

// Roster retrieval (all authenticated staff)
router.get('/', StudentController.getStudents);

// Student detail view
router.get('/:id', StudentController.getStudentById);

// Create new student (Admin, Educator, Specialist)
router.post(
  '/',
  requireRole(['admin', 'educator', 'specialist']),
  validateBody(StudentIntakeSchema),
  StudentController.createStudent
);

// Record telemetry checkpoint (Admin, Educator, Specialist, Tutor)
router.post(
  '/telemetry',
  requireRole(['admin', 'educator', 'specialist', 'tutor']),
  validateBody(StudentTelemetrySchema),
  StudentController.recordTelemetry
);

export default router;

