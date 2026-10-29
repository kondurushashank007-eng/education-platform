import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { SchoolOverviewAnalytics, Student, Intervention } from '../types';
import { 
  Users, Activity, Sparkles, Layers, AlertTriangle, 
  ArrowRight, ShieldCheck, Heart, UserPlus, TrendingUp, CheckCircle, Wifi
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { BarrierDiagnosticModal } from '../components/students/BarrierDiagnosticModal';

export const DashboardPage: React.FC = () => {
  const { profile, school, role } = useAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState<SchoolOverviewAnalytics | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      try {
        const [overviewRes, studentsRes, interventionsRes] = await Promise.all([
          api.analytics.getOverview(),
          api.students.list(),
          api.interventions.list()
        ]);

        setAnalytics(overviewRes.analytics);
        setStudents(studentsRes.students);
        setInterventions(interventionsRes.interventions);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, [school?.id]);

  const atRiskStudents = students.filter(s => s.risk_level === 'high' || (s.latest_telemetry && Number(s.latest_telemetry.attendance_percentage) < 85));

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-bold tracking-wider text-blue-300">
              Executive Institutional Telemetry
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-white/10 text-white border border-white/20">
              Role: {role}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Welcome back, {profile?.full_name}
          </h1>
          <p className="text-xs text-blue-200 mt-1 flex items-center gap-2">
            <span>{school?.name || 'Oakridge Inclusive Academy'}</span>
            <span>•</span>
            <span className="capitalize">{school?.district || 'Metro Unified'}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
              <Wifi className="w-3 h-3" /> {school?.connectivity_level || 'high'} Connectivity Mode
            </span>
          </p>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex flex-wrap gap-2 no-print">
          <button
            onClick={() => setIsIntakeModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white text-slate-900 hover:bg-blue-50 transition-colors shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5 text-blue-600" />
            <span>Intake Student</span>
          </button>
          <button
            onClick={() => navigate('/advisory/accommodations')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Accommodation Studio</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Students & Coverage */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 block">Total Enrolled Students</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{analytics?.totalStudents || students.length}</span>
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> 100% Monitored
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2: Average Attendance Reliability */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 block">Attendance Reliability</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{analytics?.averageAttendance || 88.5}%</span>
              <span className="text-xs text-slate-500 font-medium">Goal: &gt;90%</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Active Interventions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 block">Active Interventions</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{analytics?.activeInterventions || 3}</span>
              <span className="text-xs text-purple-700 font-semibold">
                {analytics?.interventionSuccessRate || 85}% Resolution
              </span>
            </div>
          </div>
        </div>

        {/* Metric 4: Well-Being Index */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 block">Student Well-Being Index</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{analytics?.averageWellBeing || 3.4} <span className="text-xs text-slate-400 font-normal">/ 5</span></span>
              <span className="text-xs text-amber-600 font-medium">Resilient</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Longitudinal Trends & At-Risk Spotlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Longitudinal Trajectory Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Longitudinal Academic & Attendance Trajectory</h2>
              <p className="text-xs text-slate-500">Tracking aggregate attendance reliability against math & reading score gains.</p>
            </div>
            <button
              onClick={() => navigate('/analytics')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={analytics?.longitudinalTrends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="avgAttendance" name="Attendance %" fill="#dbeafe" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="avgMath" name="Math Velocity %" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="avgReading" name="Reading Velocity %" stroke="#9333ea" strokeWidth={2.5} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: At-Risk & Intervention Alert Spotlights (1 col) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-rose-100 text-rose-700 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">At-Risk Student Spotlights</h2>
                <p className="text-[11px] text-slate-500">Students with chronic attendance or velocity flags</p>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              {atRiskStudents.length === 0 ? (
                <div className="p-4 bg-emerald-50 rounded-xl text-center text-xs text-emerald-800 border border-emerald-100">
                  <CheckCircle className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
                  All students are currently maintaining on-track attendance and academic benchmarks.
                </div>
              ) : (
                atRiskStudents.slice(0, 3).map((st) => (
                  <div
                    key={st.id}
                    onClick={() => navigate(`/students/${st.id}`)}
                    className="p-3 rounded-xl border border-rose-100 bg-rose-50/40 hover:bg-rose-50 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900">{st.first_name} {st.last_name}</div>
                      <div className="text-[10px] text-slate-500">
                        Grade {st.grade_level} • {st.primary_barrier.replace('_', ' ')}
                      </div>
                      <div className="text-[10px] font-semibold text-rose-600 mt-1">
                        Attendance: {st.latest_telemetry?.attendance_percentage || '74'}% • Well-Being: {st.latest_telemetry?.well_being_score || '2'}/5
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <button
              onClick={() => navigate('/students?risk=high')}
              className="w-full py-2 text-center text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              View Full At-Risk Roster ({atRiskStudents.length})
            </button>
          </div>
        </div>
      </div>

      {/* Active Interventions Pipeline Preview */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Active Tutoring & Remedial Pipelines</h2>
            <p className="text-xs text-slate-500">Scheduled 1-on-1 tutoring, assistive tech deployments, and coaching tracks.</p>
          </div>
          <button
            onClick={() => navigate('/interventions')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>Manage All Interventions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {interventions.slice(0, 3).map((inv) => (
            <div key={inv.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-300 transition-all">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                  {inv.status}
                </span>
                <span className="text-[11px] text-slate-400">
                  {inv.target_milestones.filter(m => m.completed).length} / {inv.target_milestones.length} Done
                </span>
              </div>
              <h3 className="font-bold text-xs text-slate-900 mb-1">
                {inv.student ? `${inv.student.first_name} ${inv.student.last_name}` : 'Student'}
              </h3>
              <p className="text-[11px] text-slate-600 line-clamp-1 mb-2">
                {inv.intervention_type}
              </p>
              <div className="text-[10px] text-slate-400 flex items-center justify-between">
                <span>Coach: {inv.assigned_tutor?.full_name || 'Assigned'}</span>
                <span>Ends: {inv.end_date || 'Ongoing'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Intake Modal */}
      <BarrierDiagnosticModal
        isOpen={isIntakeModalOpen}
        onClose={() => setIsIntakeModalOpen(false)}
        onStudentCreated={(newSt) => {
          setStudents(prev => [newSt, ...prev]);
        }}
      />
    </div>
  );
};

