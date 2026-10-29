import { GoogleGenAI, Type, Schema } from '@google/genai';
import { AccommodationResponsePayload } from '../../../shared/dist/types';

const apiKey = process.env.GEMINI_API_KEY || '';

export const isGeminiConfigured = Boolean(apiKey && !apiKey.includes('YOUR_') && !apiKey.includes('xyz') && apiKey.length > 10);

export const ai = isGeminiConfigured
  ? new GoogleGenAI({ apiKey })
  : null;

export const DEFAULT_AI_MODEL = 'gemini-2.5-flash';

export const AI_SYSTEM_PROMPT = `You are an expert Educational Neuropsychologist, Accessibility Architect, and Universal Design for Learning (UDL) Specialist.
Your mission is to analyze student barriers (learning differences, language gaps, sensory/mobility impairments, and resource/connectivity limitations) and produce actionable, highly practical, and compassionate instructional accommodations.

Guidelines:
1. Ground all recommendations in evidence-based pedagogical frameworks (Universal Design for Learning, Orton-Gillingham, Multi-Tiered System of Supports).
2. Avoid generic platitudes ("encourage the student"). Provide exact adaptations (e.g., "Chunk reading into 2-paragraph segments with 14pt high-contrast sans-serif font and provide audio-scaffolded summaries").
3. Always provide low-tech and zero-bandwidth fallbacks for institutions facing connectivity limitations.
4. Output strictly structured JSON conforming to the defined output schema.`;

export const accommodationResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    executiveSummary: { 
      type: Type.STRING,
      description: "Comprehensive pedagogical assessment of barrier impacts and targeted accommodation strategy"
    },
    udlPrinciples: {
      type: Type.OBJECT,
      properties: {
        representation: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "Ways to present information visually, auditorily, and tactually"
        },
        engagement: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "Strategies to motivate and sustain interest"
        },
        actionAndExpression: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "Alternative modalities for the student to demonstrate mastery"
        }
      },
      required: ["representation", "engagement", "actionAndExpression"]
    },
    classroomAccommodations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          strategy: { type: Type.STRING },
          toolOrResource: { type: Type.STRING },
          lowTechFallback: { type: Type.STRING }
        },
        required: ["category", "strategy", "toolOrResource", "lowTechFallback"]
      }
    },
    tutoringRoadmap: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          sessionNumber: { type: Type.INTEGER },
          focusSkill: { type: Type.STRING },
          activityDescription: { type: Type.STRING },
          successMetric: { type: Type.STRING }
        },
        required: ["sessionNumber", "focusSkill", "activityDescription", "successMetric"]
      }
    }
  },
  required: ["executiveSummary", "udlPrinciples", "classroomAccommodations", "tutoringRoadmap"]
};

export interface PromptContext {
  gradeLevel: number;
  primaryBarrier: string;
  hasIEP: boolean;
  mathScore: number;
  readingScore: number;
  attendanceRate: number;
  subject: string;
  learningObjective: string;
  classSize: number;
  connectivityLevel: string;
  availableTechnology?: string;
}

export function buildAnonymizedPrompt(ctx: PromptContext): string {
  // PII Minimization: Student names and IDs are explicitly omitted from the prompt
  return `Analyze the following student intake context and generate a complete Universal Design for Learning accommodation plan:

Student Details:
- Grade Level: Grade ${ctx.gradeLevel === 0 ? 'K' : ctx.gradeLevel}
- Primary Barrier: ${ctx.primaryBarrier}
- IEP/504 Active: ${ctx.hasIEP ? 'Yes' : 'No'}
- Academic Baseline: Math ${ctx.mathScore}%, Reading ${ctx.readingScore}%, Attendance ${ctx.attendanceRate}%
- Current Subject & Objective: ${ctx.subject} - "${ctx.learningObjective}"
- Environmental Context: Class size of ${ctx.classSize}, Connectivity: ${ctx.connectivityLevel}
- Available Classroom Technology: ${ctx.availableTechnology || 'Standard classroom tools'}

Produce a fully differentiated, practical UDL plan with explicit classroom accommodations, low-tech zero-bandwidth fallbacks, and a multi-session tutoring roadmap.`;
}

/**
 * High-fidelity fallback generator if Gemini API key is missing or offline
 */
export function generateCuratedFallbackAccommodation(ctx: PromptContext): AccommodationResponsePayload {
  const barrierName = ctx.primaryBarrier.replace('_', ' ');
  return {
    executiveSummary: `Targeted accommodation plan for Grade ${ctx.gradeLevel} student addressing ${barrierName} barriers in ${ctx.subject}. The intervention is calibrated for a class size of ${ctx.classSize} with ${ctx.connectivityLevel} connectivity. Core focus is on decreasing cognitive friction while reinforcing "${ctx.learningObjective}".`,
    udlPrinciples: {
      representation: [
        `Dual-coding presentation: Pair all written instructions for ${ctx.subject} with annotated diagrams and color-coded step sequences.`,
        `Multi-sensory scaffolding: Provide physical manipulatives and tactile reference cards for ${ctx.learningObjective}.`,
        `Pre-taught vocabulary bank: Supply a 1-page visual glossary of essential terms prior to direct instruction.`
      ],
      engagement: [
        `Chunked working intervals: Structure instructional blocks into 12-minute active focus sprints followed by brief reflective check-ins.`,
        `Contextual relevance: Connect ${ctx.subject} concepts to real-world vocational and daily scenarios to enhance personal buy-in.`,
        `Low-stakes error framing: Utilize dry-erase progress tracking boards to normalize drafting and iterative problem-solving.`
      ],
      actionAndExpression: [
        `Multi-modal demonstration: Permit oral presentations, diagrammatic sketches, or audio recordings in place of standard long-form text.`,
        `Executive functioning guides: Provide structured checklists with pre-broken sub-milestones for assignments.`,
        `Extended response window: Grant 1.5x time allocation for complex evaluations without penalty.`
      ]
    },
    classroomAccommodations: [
      {
        category: "Instructional Delivery",
        strategy: "Step-by-Step Visual Task Analysis",
        toolOrResource: ctx.connectivityLevel === 'high' ? "Interactive digital task board with embedded audio prompts" : "Printed multi-step laminated reference card",
        lowTechFallback: "Hand-drawn sequence flowchart on index cards clipped to desk."
      },
      {
        category: "Environment & Focus",
        strategy: "Sensory & Cognitive Load Reduction",
        toolOrResource: "Noise-dampening workspace headphones and focus carrel",
        lowTechFallback: "Cardboard desk study shield and preferential front-row seating away from high-traffic doorways."
      },
      {
        category: "Evaluation & Assessment",
        strategy: "Segmented Mastery Assessment",
        toolOrResource: "Formative quiz portal showing 1 question at a time with instant hints",
        lowTechFallback: "Folded paper quiz revealing only one problem section at a time."
      },
      {
        category: "Resource Constraints",
        strategy: "Offline Reinforcement Package",
        toolOrResource: "Preloaded offline learning modules on portable device",
        lowTechFallback: "Physical take-home study packet with self-checking answer envelopes."
      }
    ],
    tutoringRoadmap: [
      {
        sessionNumber: 1,
        focusSkill: "Diagnostic Benchmark & Vocabulary Pre-teaching",
        activityDescription: `Guided exploration of core terminology for ${ctx.subject}; introduce manipulative tools and build comfort with visual reference guides.`,
        successMetric: "Identifies and explains 4 out of 5 key concepts with visual cue support."
      },
      {
        sessionNumber: 2,
        focusSkill: `Scaffolded Application: ${ctx.learningObjective}`,
        activityDescription: "Co-solve 3 target problems with tutor using the step-by-step cue card, verbalizing each transition.",
        successMetric: "Completes 2 problems with decreasing tutor prompts (less than 2 verbal cues)."
      },
      {
        sessionNumber: 3,
        focusSkill: "Independent Practice & Low-Tech Fallback Execution",
        activityDescription: "Student applies learned strategies using paper-based manipulatives and self-checks against rubric.",
        successMetric: "Achieves 80% accuracy on a 5-item evaluation within targeted time limit."
      },
      {
        sessionNumber: 4,
        focusSkill: "Mastery Demonstration & Metacognitive Review",
        activityDescription: "Student teaches back the strategy to tutor or peer using chosen expression modality.",
        successMetric: "Accurately rationalizes solution path and articulates personal learning strategy."
      }
    ]
  };
}

