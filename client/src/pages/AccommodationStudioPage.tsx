import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Student, AccommodationPlan } from '../types';
import { 
  Sparkles, Brain, Wifi, Users, BookOpen, AlertCircle, 
  Check, ArrowRight, Printer, Layers, HelpCircle
} from 'lucide-react';
import { AccommodationViewer } from '../components/advisory/AccommodationViewer';
import { useAuth } from '../context/AuthContext';

export const AccommodationStudioPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { school } = useAuth();

  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    searchParams.get('studentId') || ''
  );

  // Form Inputs
  const [subject, setSubject] = useState<string>('Mathematics');
  const [learningObjective, setLearningObjective] = useState<string>(
    'Master addition and subtraction of fractions with unlike denominators using visual and manipulative scaffolding'
  );
  const [classSize, setClassSize] = useState<number>(24);
  const [connectivityLevel, setConnectivityLevel] = useState<'low' | 'moderate' | 'high'>(
    school?.connectivity_level || 'moderate'
  );
  const [availableTechnology, setAvailableTechnology] = useState<string>(
    'Interactive projector and 5 shared student tablets'
  );

  // State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [generatedPlan, setGeneratedPlan] = useState<AccommodationPlan | null>(null);
  const [generationSource, setGenerationSource] = useState<string>('');

  useEffect(() => {
    async function loadStudents() {
      try {
        const res = await api.students.list();
        setStudents(res.students);
        if (!selectedStudentId && res.students.length > 0) {
          setSelectedStudentId(res.students[0].id);
        }
      } catch (err) {
        console.error('Failed to load students for accommodation studio:', err);
      }
    }
    loadStudents();
  }, [school?.id]);

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  // Pre-configured Quick Objective Starter Templates
  const sampleObjectives = [
    {
      label: 'Fractions with Manipulatives & Low Bandwidth',
      subject: 'Mathematics',
      objective: 'Master addition and subtraction of fractions with unlike denominators using tactile fraction strips and low-bandwidth printable homework alternatives.'
    },
    {
      label: 'Dyslexia Reading Fluency & High-Contrast Scaffolding',
      subject: 'English Language Arts',
      objective: 'Analyze thematic arguments in grade-level informational texts with text-to-speech audio narration, high-contrast serif font chunking, and oral response options.'
    },
    {
      label: 'Science Inquiry with Tactile Lab Fallbacks',
      subject: 'Physical Science',
      objective: 'Demonstrate chemical versus physical state changes through guided multi-sensory experiments with step-by-step visual cards and zero-connectivity lab logs.'
    },
    {
      label: 'ELL Dual-Language History Scaffolding',
      subject: 'Social Studies',
      objective: 'Identify causes of the Industrial Revolution utilizing dual-language vocabulary glossaries, annotated pictorial timelines, and graphic concept organizers.'
    }
  ];

  const handleApplyTemplate = (tmpl: typeof sampleObjectives[0]) => {
    setSubject(tmpl.subject);
    setLearningObjective(tmpl.objective);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      setError('Please select a student from the roster.');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedPlan(null);

    try {
      const res = await api.advisory.generate({
        studentId: selectedStudentId,
        subject,
        learningObjective,
        classSize: Number(classSize),
        connectivityLevel,
        availableTechnology
      });

      setGeneratedPlan(res.plan);
      setGenerationSource(res.source);
    } catch (err: any) {
      setError(err.message || 'Failed to generate accommodation blueprint.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase font-bold tracking-wider text-blue-600">
              AI Accommodation Studio
            </span>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold border border-slate-200">
              Powered by Gemini 2.5 Flash
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Universal Design for Learning (UDL) Accommodation Generator
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Synthesize student barrier diagnostics, baseline academic velocity, and environmental constraints into actionable, multi-modal instructional accommodations.
          </p>
        </div>

        {selectedStudent && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 min-w-[240px]">
            <div className="font-bold flex items-center justify-between">
              <span>{selectedStudent.first_name} {selectedStudent.last_name}</span>
              <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-semibold">
                Grade {selectedStudent.grade_level}
              </span>
            </div>
            <div className="text-[11px] text-blue-700 mt-0.5">
              Barrier: <strong className="capitalize">{selectedStudent.primary_barrier.replace('_', ' ')}</strong>
            </div>
            <div className="text-[10px] text-slate-600 mt-1">
              Baseline: Math {selectedStudent.latest_telemetry?.math_score || 70}%, Read {selectedStudent.latest_telemetry?.reading_score || 70}%, Attn {selectedStudent.latest_telemetry?.attendance_percentage || 90}%
            </div>
          </div>
        )}
      </div>

      {/* Generator Configuration Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <form onSubmit={handleGenerate} className="space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Student Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Student from Roster <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">-- Choose Student --</option>
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.first_name} {st.last_name} (Grade {st.grade_level} • {st.primary_barrier.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Objective Starters */}
          <div>
            <span className="block text-xs font-semibold text-slate-700 mb-1.5">
              Quick Objective Presets (One-Click Scaffolding):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              {sampleObjectives.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyTemplate(t)}
                  className="p-2 text-left rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-colors text-xs text-slate-800"
                >
                  <span className="font-bold block text-blue-700 text-[11px] mb-0.5">{t.label}</span>
                  <span className="text-[10px] text-slate-500 line-clamp-2">{t.objective}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Subject & Objective Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subject Focus <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Mathematics, Biology, English..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Learning Objective <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={learningObjective}
                onChange={(e) => setLearningObjective(e.target.value)}
                placeholder="e.g. Master fractions with screen-reader friendly materials and low-bandwidth homework alternatives"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Environmental Context: Class size, Connectivity, Technology */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Classroom Size (Students)
              </label>
              <input
                type="number"
                min="1"
                max="80"
                value={classSize}
                onChange={(e) => setClassSize(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Classroom / Home Connectivity Mode
              </label>
              <select
                value={connectivityLevel}
                onChange={(e) => setConnectivityLevel(e.target.value as any)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="low">Low Bandwidth (Offline packets prioritized)</option>
                <option value="moderate">Moderate Bandwidth (Hybrid)</option>
                <option value="high">High Bandwidth (Full digital interactivity)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Available Technology in Room
              </label>
              <input
                type="text"
                value={availableTechnology}
                onChange={(e) => setAvailableTechnology(e.target.value)}
                placeholder="e.g. Interactive display, paper manipulators"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              disabled={isGenerating || !selectedStudentId}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all shadow-md"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing UDL Accommodation Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Differentiated Plan (Gemini 2.5 Flash)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Generated Accommodation Plan Output */}
      {generatedPlan && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>
                Plan Successfully Generated via{' '}
                <strong className="text-blue-600">{generationSource}</strong>
              </span>
            </div>
            <button
              onClick={() => navigate(`/interventions?studentId=${selectedStudentId}&planId=${generatedPlan.id}`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Deploy to Tutoring Pipeline</span>
            </button>
          </div>

          <AccommodationViewer
            plan={generatedPlan}
            onDeployIntervention={() => navigate(`/interventions?studentId=${selectedStudentId}&planId=${generatedPlan.id}`)}
          />
        </div>
      )}
    </div>
  );
};

