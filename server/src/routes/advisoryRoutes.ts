import { Router } from 'express';
import { AdvisoryController } from '../controllers/advisoryController';
import { authenticate, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { AccommodationRequestSchema } from '../../../shared/dist/validators';

const router = Router();

router.use(authenticate);

// Generate AI accommodation plan via Gemini 2.5 Flash
router.post(
  '/generate-accommodation',
  requireRole(['admin', 'educator', 'specialist']),
  validateBody(AccommodationRequestSchema),
  AdvisoryController.generateAccommodation
);

// Get student's accommodations
router.get(
  '/accommodations/:studentId',
  AdvisoryController.getAccommodationsForStudent
);

export default router;

