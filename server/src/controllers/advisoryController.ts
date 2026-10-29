import { Request, Response } from 'express';
import { DataStoreService } from '../services/store';
import { AccommodationRequestInput } from '../../../shared/dist/validators';
import { AccommodationResponsePayload } from '../../../shared/dist/types';
import { 
  ai, 
  DEFAULT_AI_MODEL, 
  AI_SYSTEM_PROMPT, 
  accommodationResponseSchema, 
  buildAnonymizedPrompt, 
  generateCuratedFallbackAccommodation,
  isGeminiConfigured 
} from '../lib/gemini';

export class AdvisoryController {
  /**
   * POST /api/advisory/generate-accommodation
   * Accepts student context & learning objectives; queries Gemini 2.5 Flash; saves & returns plan.
   */
  static async generateAccommodation(req: Request, res: Response): Promise<void> {
    try {
      const input = req.body as AccommodationRequestInput;
      const schoolId = req.schoolId!;
      const createdBy = req.user?.id;

      // 1. Verify student exists and belongs to requesting user's school (Tenant Isolation)
      const student = await DataStoreService.getStudentById(input.studentId, schoolId);
      if (!student) {
        res.status(403).json({ error: 'Unauthorized: Student is not registered in your school organization' });
        return;
      }

      // 2. Retrieve student's baseline telemetry context
      const telemetryList = await DataStoreService.getTelemetryByStudent(input.studentId);
      const latestTelemetry = telemetryList[0] || {
        attendance_percentage: 90,
        reading_score: 70,
        math_score: 70,
        well_being_score: 3
      };

      // 3. Assemble anonymized prompt context (PII Minimization)
      const promptContext = {
        gradeLevel: student.grade_level,
        primaryBarrier: student.primary_barrier,
        hasIEP: student.has_iep_or_504,
        mathScore: Number(latestTelemetry.math_score),
        readingScore: Number(latestTelemetry.reading_score),
        attendanceRate: Number(latestTelemetry.attendance_percentage),
        subject: input.subject,
        learningObjective: input.learningObjective,
        classSize: input.classSize,
        connectivityLevel: input.connectivityLevel,
        availableTechnology: input.availableTechnology
      };

      const prompt = buildAnonymizedPrompt(promptContext);
      let accommodationData: AccommodationResponsePayload;
      let generationSource: 'gemini-2.5-flash' | 'curated-adaptive-engine' = 'curated-adaptive-engine';

      // 4. Delegate to Gemini SDK if configured
      if (isGeminiConfigured && ai) {
        try {
          console.log(`[AI Orchestrator] Generating accommodation plan via ${DEFAULT_AI_MODEL}...`);
          
          const response = await ai.models.generateContent({
            model: DEFAULT_AI_MODEL,
            contents: prompt,
            config: {
              systemInstruction: AI_SYSTEM_PROMPT,
              responseMimeType: 'application/json',
              responseSchema: accommodationResponseSchema,
              temperature: 0.2
            }
          });

          const rawText = typeof response.text === 'string' 
            ? response.text 
            : (typeof (response as any).text === 'function' ? (response as any).text() : '');
          if (rawText) {
            accommodationData = JSON.parse(rawText) as AccommodationResponsePayload;
            generationSource = 'gemini-2.5-flash';
          } else {
            throw new Error('Empty response from Gemini SDK');
          }
        } catch (aiErr: any) {
          console.warn('[AI Orchestrator] Gemini invocation failed, falling back to curated adaptive engine:', aiErr.message);
          accommodationData = generateCuratedFallbackAccommodation(promptContext);
        }
      } else {
        console.log('[AI Orchestrator] GEMINI_API_KEY not configured or using demo mode. Generating high-fidelity pedagogical plan via adaptive engine.');
        accommodationData = generateCuratedFallbackAccommodation(promptContext);
      }

      // 5. Persist the generated accommodation plan in database
      const savedPlan = await DataStoreService.saveAccommodationPlan({
        studentId: student.id,
        subject: input.subject,
        learningObjective: input.learningObjective,
        accommodationsJson: accommodationData,
        createdBy
      });

      res.status(201).json({
        message: 'Educational accommodation plan generated and saved successfully',
        plan: savedPlan,
        source: generationSource
      });
    } catch (err: any) {
      console.error('Error generating accommodation plan:', err);
      res.status(500).json({ error: 'Failed to generate accommodation plan' });
    }
  }

  /**
   * GET /api/advisory/accommodations/:studentId
   * Retrieve historical accommodations for a student
   */
  static async getAccommodationsForStudent(req: Request, res: Response): Promise<void> {
    try {
      const { studentId } = req.params;
      const schoolId = req.schoolId!;

      const student = await DataStoreService.getStudentById(studentId, schoolId);
      if (!student) {
        res.status(403).json({ error: 'Unauthorized: Student is not registered in your school organization' });
        return;
      }

      const accommodations = await DataStoreService.getAccommodationsByStudent(studentId);
      res.json({ accommodations });
    } catch (err: any) {
      console.error('Error retrieving accommodations:', err);
      res.status(500).json({ error: 'Failed to retrieve accommodations' });
    }
  }
}
