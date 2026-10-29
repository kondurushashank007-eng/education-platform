import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Aggregated longitudinal metrics and equity gap telemetry
router.get('/school-overview', AnalyticsController.getSchoolOverview);

export default router;

