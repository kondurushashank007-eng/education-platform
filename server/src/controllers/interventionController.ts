import { Request, Response } from 'express';
import { DataStoreService } from '../services/store';
import { InterventionCreateInput, InterventionUpdateInput } from '../../../shared/dist/validators';

export class InterventionController {
  /**
   * GET /api/interventions
   * Retrieve all interventions in the user's school organization
   */
  static async getInterventions(req: Request, res: Response): Promise<void> {
    try {
      const schoolId = req.schoolId!;
      const interventions = await DataStoreService.getInterventionsBySchool(schoolId);
      res.json({ interventions });
    } catch (err: any) {
      console.error('Error fetching interventions:', err);
      res.status(500).json({ error: 'Failed to retrieve intervention pipeline' });
    }
  }

  /**
   * GET /api/interventions/staff
   * Retrieve tutors and specialists available for assignment in this school
   */
  static async getSchoolStaff(req: Request, res: Response): Promise<void> {
    try {
      const schoolId = req.schoolId!;
      const profiles = await DataStoreService.getProfilesBySchool(schoolId);
      res.json({ staff: profiles });
    } catch (err: any) {
      console.error('Error fetching school staff:', err);
      res.status(500).json({ error: 'Failed to retrieve school staff' });
    }
  }

  /**
   * POST /api/interventions
   * Create and assign a targeted tutoring/coaching sequence
   */
  static async createIntervention(req: Request, res: Response): Promise<void> {
    try {
      const input = req.body as InterventionCreateInput;
      const schoolId = req.schoolId!;

      // Enforce student ownership within school
      const student = await DataStoreService.getStudentById(input.studentId, schoolId);
      if (!student) {
        res.status(403).json({ error: 'Unauthorized: Student is not registered in your school organization' });
        return;
      }

      const intervention = await DataStoreService.createIntervention({
        studentId: input.studentId,
        planId: input.planId,
        assignedTutorId: input.assignedTutorId,
        interventionType: input.interventionType,
        targetMilestones: input.targetMilestones,
        startDate: input.startDate,
        endDate: input.endDate,
        status: input.status
      });

      res.status(201).json({
        message: 'Intervention sequence initiated successfully',
        intervention
      });
    } catch (err: any) {
      console.error('Error creating intervention:', err);
      res.status(500).json({ error: 'Failed to initialize intervention' });
    }
  }

  /**
   * PATCH /api/interventions/:id
   * Update intervention status or milestone checkpoints
   */
  static async updateIntervention(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body as InterventionUpdateInput;

      const updated = await DataStoreService.updateIntervention(id, updates);
      if (!updated) {
        res.status(404).json({ error: 'Intervention not found' });
        return;
      }

      res.json({
        message: 'Intervention updated successfully',
        intervention: updated
      });
    } catch (err: any) {
      console.error('Error updating intervention:', err);
      res.status(500).json({ error: 'Failed to update intervention' });
    }
  }
}

