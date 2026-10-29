import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { StudentTelemetry } from '../../types';

interface Props {
  telemetry: StudentTelemetry[];
  studentName?: string;
}

export const TelemetryTrendChart: React.FC<Props> = ({
  telemetry,
  studentName
}) => {
  // Sort chronologically ascending for the chart
  const formattedData = [...telemetry]
    .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
    .map(t => ({
      date: t.recorded_at,
      attendance: Number(t.attendance_percentage),
      math: Number(t.math_score),
      reading: Number(t.reading_score),
      wellBeingScaled: Number(t.well_being_score) * 20, // scale 1-5 to 0-100 for easy visual comparison
      wellBeingRaw: Number(t.well_being_score),
      notes: t.notes
    }));

  if (formattedData.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400 text-xs">
        <p className="font-semibold">No longitudinal telemetry checkpoints recorded yet.</p>
        <p className="mt-1">Log a checkpoint to visualize trajectory velocity.</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs space-y-1 border border-slate-700">
          <p className="font-bold text-slate-300 border-b border-slate-700 pb-1">
            Checkpoint: {label}
          </p>
          <p className="text-emerald-400">Attendance: <span className="font-bold">{dataPoint.attendance}%</span></p>
          <p className="text-blue-400">Math Score: <span className="font-bold">{dataPoint.math}%</span></p>
          <p className="text-purple-400">Reading Score: <span className="font-bold">{dataPoint.reading}%</span></p>
          <p className="text-amber-400">Well-Being: <span className="font-bold">{dataPoint.wellBeingRaw} / 5</span></p>
          {dataPoint.notes && (
            <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-800">
              "{dataPoint.notes}"
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            {studentName ? `${studentName} — Longitudinal Telemetry Velocity` : 'Telemetry Velocity Trajectory'}
          </h3>
          <p className="text-xs text-slate-500">
            Mapping attendance fluctuations against reading/math milestones and well-being.
          </p>
        </div>
        <div className="text-[11px] text-slate-400 font-medium">
          {formattedData.length} checkpoint{formattedData.length === 1 ? '' : 's'} recorded
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11, fill: '#64748b' }} 
              stroke="#cbd5e1"
            />
            <YAxis 
              domain={[0, 100]} 
              tick={{ fontSize: 11, fill: '#64748b' }} 
              stroke="#cbd5e1"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} 
            />
            <Line
              type="monotone"
              dataKey="attendance"
              name="Attendance %"
              stroke="#059669"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#059669' }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="math"
              name="Math Score %"
              stroke="#2563eb"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#2563eb' }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="reading"
              name="Reading Score %"
              stroke="#9333ea"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#9333ea' }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="wellBeingScaled"
              name="Well-Being (Normalized)"
              stroke="#d97706"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ r: 3, fill: '#d97706' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

