import { Request, Response } from 'express';
import { DataStoreService } from '../services/store';

export class AnalyticsController {
  /**
   * GET /api/analytics/school-overview
   * Aggregate attendance rates, risk metrics, and intervention success percentages
   */
  static async getSchoolOverview(req: Request, res: Response): Promise<void> {
    try {
      const schoolId = req.schoolId!;
      const school = await DataStoreService.getSchoolById(schoolId);
      const analytics = await DataStoreService.getSchoolAnalytics(schoolId);

      res.json({
        school,
        analytics
      });
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      res.status(500).json({ error: 'Failed to compute school analytics' });
    }
  }
}

