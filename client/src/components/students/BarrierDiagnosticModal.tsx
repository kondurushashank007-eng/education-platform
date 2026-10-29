import React, { useState } from 'react';
import { api } from '../../services/api';
import { Student, BarrierType } from '../../types';
import { 
  X, Check, AlertCircle, Sparkles, BookOpen, 
  Heart, Wifi, Accessibility, Brain
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStudentCreated: (newStudent: Student) => void;
}

export const BarrierDiagnosticModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onStudentCreated
}) => {
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gradeLevel, setGradeLevel] = useState<number>(8);
  const [primaryBarrier, setPrimaryBarrier] = useState<BarrierType>('cognitive');
  const [hasIepOr504, setHasIepOr504] = useState<boolean>(false);
  
  // Baseline Telemetry
  const [baselineAttendance, setBaselineAttendance] = useState<number>(88);
  const [baselineReadingScore, setBaselineReadingScore] = useState<number>(65);
  const [baselineMathScore, setBaselineMathScore] = useState<number>(60);
  const [baselineWellBeing, setBaselineWellBeing] = useState<number>(3);
  const [intakeNotes, setIntakeNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await api.students.create({
        firstName,
        lastName,
        gradeLevel: Number(gradeLevel),
        primaryBarrier,
        hasIepOr504,
        baselineAttendance: Number(baselineAttendance),
        baselineReadingScore: Number(baselineReadingScore),
        baselineMathScore: Number(baselineMathScore),
        baselineWellBeing: Number(baselineWellBeing),
        intakeNotes
      });

      onStudentCreated(res.student);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit student intake.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const barrierOptions: Array<{
    type: BarrierType;
    title: string;
    description: string;
    icon: any;
  }> = [
    {
      type: 'cognitive',
      title: 'Cognitive / Learning Difference',
      description: 'Neurodivergence, ADHD, Dyslexia, Dyscalculia, or working memory constraints.',
      icon: Brain
    },
    {
      type: 'socioeconomic_connectivity',
      title: 'Connectivity & Resource Constraints',
      description: 'Low-bandwidth, offline-only home, lack of physical study materials, digital divide.',
      icon: Wifi
    },
    {
      type: 'language',
      title: 'English Language Learner (ELL)',
      description: 'Multilingual household, developing English academic literacy, dual-language scaffold needs.',
      icon: BookOpen
    },
    {
      type: 'physical_accessibility',
      title: 'Physical & Sensory Accessibility',
      description: 'Visual impairment, hearing impairment, fine motor or mobility limitations.',
      icon: Accessibility
    },
    {
      type: 'academic',
      title: 'Academic Benchmark Velocity Gap',
      description: 'Longitudinal learning loss, foundational skill gaps in mathematics or reading comprehension.',
      icon: Sparkles
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="diagnostic-modal-title"
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest font-bold text-blue-400">Intake Diagnostic Engine</span>
              <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-300">Step {step} of 3</span>
            </div>
            <h2 id="diagnostic-modal-title" className="text-lg font-bold mt-1 text-white">
              {step === 1 && 'Student Demographics & Grade Level'}
              {step === 2 && 'Multidimensional Barrier Diagnostics'}
              {step === 3 && 'Baseline Performance Telemetry'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5">
          <div 
            className="bg-blue-600 h-1.5 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: Basic Demographics */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Maya"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Patel"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Grade Level <span className="text-rose-500">*</span>
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value={0}>Kindergarten</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
                    <option key={g} value={g}>Grade {g}</option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 leading-relaxed">
                <strong>Data Protection Guarantee:</strong> In accordance with FERPA and institutional data isolation standards, all diagnostic evaluations redact student names and direct identifiers before querying the generative accommodation engine.
              </div>
            </div>
          )}

          {/* STEP 2: Barrier Diagnostics */}
          {step === 2 && (
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Primary Learning Barrier Category <span className="text-rose-500">*</span>
              </label>
              <div className="space-y-2">
                {barrierOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = primaryBarrier === opt.type;
                  return (
                    <div
                      key={opt.type}
                      onClick={() => setPrimaryBarrier(opt.type)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-1 ring-blue-500' 
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{opt.title}</span>
                          {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{opt.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* IEP / 504 Active Checkbox */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    checked={hasIepOr504}
                    onChange={(e) => setHasIepOr504(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900">Active IEP or Section 504 Plan</span>
                    <p className="text-[11px] text-slate-500">Enable to ensure accommodations strictly reflect formal individualized education goals.</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* STEP 3: Baseline Performance Telemetry */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Attendance Rate (%) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={baselineAttendance}
                    onChange={(e) => setBaselineAttendance(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">&lt; 85% flags chronic absenteeism risk</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student Well-Being Index (1 - 5) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={baselineWellBeing}
                    onChange={(e) => setBaselineWellBeing(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value={1}>1 - Severe Emotional / Behavioral Strain</option>
                    <option value={2}>2 - Struggling with Engagement & Anxiety</option>
                    <option value={3}>3 - Moderate Well-Being / Neutral</option>
                    <option value={4}>4 - Positive Engagement & Resilient</option>
                    <option value={5}>5 - Flourishing / High Motivation</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Math Benchmark Percentile (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={baselineMathScore}
                    onChange={(e) => setBaselineMathScore(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reading Benchmark Percentile (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={baselineReadingScore}
                    onChange={(e) => setBaselineReadingScore(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Intake Context & Educator Observations
                </label>
                <textarea
                  rows={3}
                  value={intakeNotes}
                  onChange={(e) => setIntakeNotes(e.target.value)}
                  placeholder="Notes on home environment, sensory triggers, connectivity at home, strengths and personal interests..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && (!firstName.trim() || !lastName.trim())) {
                    setErrorMessage('Please provide both first and last name.');
                    return;
                  }
                  setErrorMessage('');
                  setStep(s => s + 1);
                }}
                className="px-5 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
              >
                Continue to Diagnostic
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving Intake...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Complete Intake & Register</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

