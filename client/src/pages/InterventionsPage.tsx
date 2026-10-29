import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Intervention, InterventionStatus, Profile, Student } from '../types';
import { InterventionPipelineCard } from '../components/interventions/InterventionPipelineCard';
import { 
  Layers, Plus, Filter, CheckCircle2, Clock, 
  AlertCircle, X, Check, Calendar, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const InterventionsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { school } = useAuth();

  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [staff, setStaff] = useState<Profile[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Intervention Form State
  const [newStudentId, setNewStudentId] = useState<string>(searchParams.get('studentId') || '');
  const [newPlanId, setNewPlanId] = useState<string>(searchParams.get('planId') || '');
  const [newTutorId, setNewTutorId] = useState<string>('');
  const [newType, setNewType] = useState<string>('1-on-1 Remedial Tutoring (Math Foundations)');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>('');
  const [milestonesInput, setMilestonesInput] = useState<string>(
    'Master visual fraction equivalence with physical tiles\nLeast Common Denominator graphic organizer independence\n80% accuracy on unassisted evaluation test'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadPipeline = async () => {
    setIsLoading(true);
    try {
      const [invRes, staffRes, stRes] = await Promise.all([
        api.interventions.list(),
        api.interventions.getStaff(),
        api.students.list()
      ]);

      setInterventions(invRes.interventions);
      setStaff(staffRes.staff);
      setStudents(stRes.students);

      if (!newStudentId && stRes.students.length > 0) {
        setNewStudentId(stRes.students[0].id);
      }
      if (staffRes.staff.length > 0) {
        const tutor = staffRes.staff.find(s => s.role === 'tutor') || staffRes.staff[0];
        setNewTutorId(tutor.id);
      }
    } catch (err) {
      console.error('Failed to load intervention pipeline:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPipeline();
    if (searchParams.get('studentId')) {
      setIsModalOpen(true);
    }
  }, [school?.id]);

  const handleUpdateStatus = async (id: string, status: InterventionStatus) => {
    try {
      const res = await api.interventions.update(id, { status });
      setInterventions(prev => prev.map(inv => inv.id === id ? { ...inv, status: res.intervention.status } : inv));
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleToggleMilestone = async (id: string, milestoneIndex: number, completed: boolean) => {
    const target = interventions.find(i => i.id === id);
    if (!target) return;

    const updatedMilestones = [...target.target_milestones];
    updatedMilestones[milestoneIndex] = {
      ...updatedMilestones[milestoneIndex],
      completed
    };

    try {
      const res = await api.interventions.update(id, { targetMilestones: updatedMilestones });
      setInterventions(prev => prev.map(inv => inv.id === id ? { ...inv, target_milestones: res.intervention.target_milestones } : inv));
    } catch (err) {
      console.error('Failed to update milestone:', err);
    }
  };

  const handleCreateIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const parsedMilestones = milestonesInput
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean)
        .map(text => ({
          milestone: text,
          completed: false
        }));

      if (parsedMilestones.length === 0) {
        setError('Please provide at least one milestone goal.');
        setIsSubmitting(false);
        return;
      }

      const res = await api.interventions.create({
        studentId: newStudentId,
        planId: newPlanId || null,
        assignedTutorId: newTutorId || null,
        interventionType: newType,
        targetMilestones: parsedMilestones,
        startDate,
        endDate: endDate || null,
        status: 'active'
      });

      // Reload pipeline
      await loadPipeline();
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize intervention.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredInterventions = interventions.filter(i => {
    if (statusFilter === 'all') return true;
    return i.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-purple-100 text-purple-700 rounded-lg">
              <Layers className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase font-bold tracking-wider text-purple-700">
              Pipeline Management
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Targeted Intervention & Tutoring Pipeline
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track multi-week specialist coaching, assistive technology adoptions, and 1-on-1 peer mentor sessions.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Intervention</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'active', 'draft', 'paused', 'completed'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
              statusFilter === st 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {st} ({st === 'all' ? interventions.length : interventions.filter(i => i.status === st).length})
          </button>
        ))}
      </div>

      {/* Intervention Cards Grid */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent mb-2"></div>
          <p className="text-xs text-slate-500">Loading intervention pipeline...</p>
        </div>
      ) : filteredInterventions.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-500">
          <Layers className="w-8 h-8 mx-auto text-slate-300 mb-2" />
          <p className="font-semibold text-xs">No interventions currently under "{statusFilter}" status.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700"
          >
            <Plus className="w-3.5 h-3.5" /> Initialize Intervention
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredInterventions.map((inv) => (
            <InterventionPipelineCard
              key={inv.id}
              intervention={inv}
              availableStaff={staff}
              onUpdateStatus={handleUpdateStatus}
              onToggleMilestone={handleToggleMilestone}
            />
          ))}
        </div>
      )}

      {/* Schedule Intervention Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold text-white">Schedule Targeted Intervention</h2>
                <p className="text-xs text-slate-400">Assemble peer tutoring or coaching track</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIntervention} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Student <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newStudentId}
                  onChange={(e) => setNewStudentId(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.first_name} {st.last_name} (Grade {st.grade_level})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assigned Coach / Specialist
                </label>
                <select
                  value={newTutorId}
                  onChange={(e) => setNewTutorId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">-- Assign Later --</option>
                  {staff.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.role.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Intervention Category / Track <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  placeholder="e.g. 1-on-1 Remedial Reading Lab"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Milestones (One per line) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={milestonesInput}
                  onChange={(e) => setMilestonesInput(e.target.value)}
                  placeholder="Enter specific progress checkpoints..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmitting ? 'Scheduling...' : 'Deploy Intervention'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

