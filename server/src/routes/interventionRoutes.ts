import { Router } from 'express';
import { InterventionController } from '../controllers/interventionController';
import { authenticate, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { InterventionCreateSchema, InterventionUpdateSchema } from '../../../shared/dist/validators';

const router = Router();

router.use(authenticate);

// List pipeline interventions
router.get('/', InterventionController.getInterventions);

// List staff available for assignment
router.get('/staff', InterventionController.getSchoolStaff);

// Create intervention
router.post(
  '/',
  requireRole(['admin', 'educator', 'specialist']),
  validateBody(InterventionCreateSchema),
  InterventionController.createIntervention
);

// Update status / milestones
router.patch(
  '/:id',
  validateBody(InterventionUpdateSchema),
  InterventionController.updateIntervention
);

export default router;

