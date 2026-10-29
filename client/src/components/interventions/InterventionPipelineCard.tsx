import React, { useState } from 'react';
import { Intervention, InterventionStatus, Profile } from '../../types';
import { 
  User, CheckCircle2, Clock, Calendar, CheckSquare, 
  Square, AlertCircle, ArrowUpRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  intervention: Intervention;
  availableStaff?: Profile[];
  onUpdateStatus: (id: string, status: InterventionStatus) => Promise<void>;
  onToggleMilestone: (id: string, milestoneIndex: number, completed: boolean) => Promise<void>;
}

export const InterventionPipelineCard: React.FC<Props> = ({
  intervention,
  availableStaff = [],
  onUpdateStatus,
  onToggleMilestone
}) => {
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);

  const totalMilestones = intervention.target_milestones.length;
  const completedMilestones = intervention.target_milestones.filter(m => m.completed).length;
  const progressPercent = totalMilestones > 0 
    ? Math.round((completedMilestones / totalMilestones) * 100) 
    : 0;

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(intervention.id, e.target.value as InterventionStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMilestoneClick = async (idx: number, currentCompleted: boolean) => {
    setIsUpdating(true);
    try {
      await onToggleMilestone(intervention.id, idx, !currentCompleted);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: InterventionStatus) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'paused': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:border-slate-300 transition-all flex flex-col justify-between">
      <div>
        {/* Top: Status Selector & Student Name */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusBadge(intervention.status)}`}>
              {intervention.status}
            </span>
            <h3 
              onClick={() => intervention.student && navigate(`/students/${intervention.student.id}`)}
              className="text-sm font-bold text-slate-900 mt-1 hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>{intervention.student ? `${intervention.student.first_name} ${intervention.student.last_name}` : 'Student Profile'}</span>
              <ArrowUpRight className="w-3 h-3 text-slate-400" />
            </h3>
            {intervention.student && (
              <span className="text-[11px] text-slate-500 font-medium">
                Grade {intervention.student.grade_level} • {intervention.student.primary_barrier.replace('_', ' ')}
              </span>
            )}
          </div>

          <select
            value={intervention.status}
            onChange={handleStatusChange}
            disabled={isUpdating}
            className="text-xs bg-slate-50 border border-slate-300 rounded px-2 py-1 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Intervention Title */}
        <div className="mb-3">
          <p className="text-xs font-semibold text-slate-800">
            {intervention.intervention_type}
          </p>
        </div>

        {/* Assigned Tutor / Coach */}
        <div className="flex items-center gap-2 mb-4 p-2 bg-slate-50 rounded-lg text-xs text-slate-600">
          <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <div className="truncate">
            <span className="text-slate-400">Assigned Coach: </span>
            <span className="font-semibold text-slate-800">
              {intervention.assigned_tutor?.full_name || 'Unassigned / Needs Tutor'}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-[11px] text-slate-500 mb-1">
            <span>Milestones Progress</span>
            <span className="font-bold text-slate-800">{completedMilestones} of {totalMilestones} ({progressPercent}%)</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                progressPercent === 100 ? 'bg-emerald-500' : 'bg-blue-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Milestones Checklist */}
        <div className="space-y-2 mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Target Milestones:
          </span>
          {intervention.target_milestones.map((m, idx) => (
            <div
              key={idx}
              onClick={() => handleMilestoneClick(idx, m.completed)}
              className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                m.completed 
                  ? 'bg-emerald-50/60 text-slate-600 line-through decoration-slate-400' 
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-800'
              }`}
            >
              {m.completed ? (
                <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <Square className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <span>{m.milestone}</span>
                {m.dueDate && (
                  <span className="block text-[10px] text-slate-400 not-italic mt-0.5">
                    Target: {m.dueDate}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Dates */}
      <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" /> Started: {intervention.start_date}
        </span>
        {intervention.end_date && (
          <span>Target End: {intervention.end_date}</span>
        )}
      </div>
    </div>
  );
};

