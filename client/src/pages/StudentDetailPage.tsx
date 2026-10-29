import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Student, StudentTelemetry, AccommodationPlan, Intervention } from '../types';
import { 
  ArrowLeft, Sparkles, Activity, AlertTriangle, CheckCircle, 
  Clock, ShieldAlert, Heart, Calendar, Wifi, Brain
} from 'lucide-react';
import { TelemetryTrendChart } from '../components/dashboard/TelemetryTrendChart';
import { AccommodationViewer } from '../components/advisory/AccommodationViewer';
import { TelemetryCheckpointModal } from '../components/students/TelemetryCheckpointModal';

export const StudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [student, setStudent] = useState<Student | null>(null);
  const [telemetry, setTelemetry] = useState<StudentTelemetry[]>([]);
  const [accommodations, setAccommodations] = useState<AccommodationPlan[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isTelemetryModalOpen, setIsTelemetryModalOpen] = useState(false);

  const loadStudentProfile = async () => {
    if (!id) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await api.students.getById(id);
      setStudent(res.student);
      setTelemetry(res.telemetry);
      setAccommodations(res.accommodations);
      setInterventions(res.interventions);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve student profile.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudentProfile();
  }, [id]);

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mb-2"></div>
        <p className="text-xs text-slate-500">Retrieving student profile & telemetry...</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-rose-200 text-center max-w-lg mx-auto mt-12">
        <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-900">Access Restricted / Student Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">{error || 'Unable to access student profile.'}</p>
        <button
          onClick={() => navigate('/students')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Roster
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button & Header */}
      <div className="flex items-center gap-2 text-xs text-slate-500 no-print">
        <button
          onClick={() => navigate('/students')}
          className="hover:text-blue-600 flex items-center gap-1 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Students
        </button>
        <span>/</span>
        <span className="text-slate-800 font-medium">{student.first_name} {student.last_name}</span>
      </div>

      {/* Student Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-bold text-xl flex items-center justify-center shadow-md uppercase">
              {student.first_name[0]}{student.last_name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {student.first_name} {student.last_name}
                </h1>
                {student.has_iep_or_504 && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                    Active IEP / 504
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                <span className="font-semibold text-slate-700">
                  {student.grade_level === 0 ? 'Kindergarten' : `Grade ${student.grade_level}`}
                </span>
                <span>•</span>
                <span className="capitalize font-medium text-slate-800">
                  Barrier: {student.primary_barrier.replace('_', ' ')}
                </span>
                <span>•</span>
                <span className={`capitalize font-bold ${
                  student.risk_level === 'high' ? 'text-rose-600' : student.risk_level === 'moderate' ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {student.risk_level || 'low'} Risk Status
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 no-print">
            <button
              onClick={() => setIsTelemetryModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Log Telemetry Checkpoint</span>
            </button>
            <button
              onClick={() => navigate(`/advisory/accommodations?studentId=${student.id}`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate AI Accommodations</span>
            </button>
          </div>
        </div>
      </div>

      {/* Longitudinal Telemetry Velocity Chart */}
      <TelemetryTrendChart
        telemetry={telemetry}
        studentName={`${student.first_name} ${student.last_name}`}
      />

      {/* Historical Telemetry Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Historical Telemetry Log</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {telemetry.length} checkpoint{telemetry.length === 1 ? '' : 's'} recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Attendance %</th>
                <th className="py-2.5 px-4">Math Score</th>
                <th className="py-2.5 px-4">Reading Score</th>
                <th className="py-2.5 px-4">Well-Being Index</th>
                <th className="py-2.5 px-4">Educator Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {telemetry.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    No telemetry records available for this student.
                  </td>
                </tr>
              ) : (
                telemetry.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-4 font-semibold text-slate-900">{t.recorded_at}</td>
                    <td className="py-2.5 px-4 font-bold text-emerald-700">{t.attendance_percentage}%</td>
                    <td className="py-2.5 px-4 font-medium text-blue-700">{t.math_score}%</td>
                    <td className="py-2.5 px-4 font-medium text-purple-700">{t.reading_score}%</td>
                    <td className="py-2.5 px-4 text-amber-600 font-bold">{t.well_being_score} / 5</td>
                    <td className="py-2.5 px-4 text-slate-600 max-w-xs truncate">{t.notes || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generated Accommodations Plans */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Active Universal Design Accommodation Plans ({accommodations.length})</span>
          </h2>
          <button
            onClick={() => navigate(`/advisory/accommodations?studentId=${student.id}`)}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            + Create New Accommodation
          </button>
        </div>

        {accommodations.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-500">
            <Brain className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-medium">No accommodation plans have been generated for this student yet.</p>
            <button
              onClick={() => navigate(`/advisory/accommodations?studentId=${student.id}`)}
              className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700"
            >
              <Sparkles className="w-3.5 h-3.5" /> Launch AI Studio
            </button>
          </div>
        ) : (
          accommodations.map((plan) => (
            <AccommodationViewer
              key={plan.id}
              plan={plan}
              onDeployIntervention={() => navigate(`/interventions?studentId=${student.id}&planId=${plan.id}`)}
            />
          ))
        )}
      </div>

      {/* Telemetry Modal */}
      <TelemetryCheckpointModal
        student={student}
        isOpen={isTelemetryModalOpen}
        onClose={() => setIsTelemetryModalOpen(false)}
        onTelemetryRecorded={(newT) => {
          setTelemetry(prev => [newT, ...prev]);
          setStudent(prev => prev ? ({ ...prev, latest_telemetry: newT }) : null);
        }}
      />
    </div>
  );
};

