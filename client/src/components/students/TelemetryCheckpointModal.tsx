import React, { useState } from 'react';
import { api } from '../../services/api';
import { Student, StudentTelemetry } from '../../types';
import { X, Activity, Check, AlertCircle } from 'lucide-react';

interface Props {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onTelemetryRecorded: (newTelemetry: StudentTelemetry) => void;
}

export const TelemetryCheckpointModal: React.FC<Props> = ({
  student,
  isOpen,
  onClose,
  onTelemetryRecorded
}) => {
  if (!isOpen || !student) return null;

  const latest = student.latest_telemetry;
  const [attendancePercentage, setAttendancePercentage] = useState<number>(
    latest ? Number(latest.attendance_percentage) : 90
  );
  const [readingScore, setReadingScore] = useState<number>(
    latest ? Number(latest.reading_score) : 70
  );
  const [mathScore, setMathScore] = useState<number>(
    latest ? Number(latest.math_score) : 70
  );
  const [wellBeingScore, setWellBeingScore] = useState<number>(
    latest ? Number(latest.well_being_score) : 3
  );
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await api.students.recordTelemetry({
        studentId: student.id,
        attendancePercentage: Number(attendancePercentage),
        readingScore: Number(readingScore),
        mathScore: Number(mathScore),
        wellBeingScore: Number(wellBeingScore),
        notes
      });

      onTelemetryRecorded(res.telemetry);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save telemetry checkpoint.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-600 rounded-lg">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Record Telemetry Checkpoint</h2>
              <p className="text-xs text-slate-400">
                {student.first_name} {student.last_name} • Grade {student.grade_level}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Attendance Percentage (%) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={attendancePercentage}
                onChange={(e) => setAttendancePercentage(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Well-Being Rating (1 - 5) <span className="text-rose-500">*</span>
              </label>
              <select
                value={wellBeingScore}
                onChange={(e) => setWellBeingScore(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value={1}>1 - Severe Strain / In Crisis</option>
                <option value={2}>2 - Struggling / Low Resilience</option>
                <option value={3}>3 - Neutral / Stable</option>
                <option value={4}>4 - Engaged & Receptive</option>
                <option value={5}>5 - High Autonomy & Thriving</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Math Velocity Score (%) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={mathScore}
                onChange={(e) => setMathScore(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reading Velocity Score (%) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={readingScore}
                onChange={(e) => setReadingScore(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observational Telemetry Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Session engagement, response to visual scaffolds, cognitive fatigue timing..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Logging...' : 'Save Checkpoint'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

