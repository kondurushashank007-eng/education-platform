import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Student, BarrierType } from '../../types';
import { 
  Search, Filter, AlertTriangle, CheckCircle, Clock, 
  Sparkles, Activity, ArrowRight, UserPlus, FileText
} from 'lucide-react';

interface Props {
  students: Student[];
  isLoading: boolean;
  onOpenIntakeModal: () => void;
  onQuickLogTelemetry: (student: Student) => void;
  filters: {
    search: string;
    grade: string;
    barrier: string;
    risk: string;
    iep: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    search: string;
    grade: string;
    barrier: string;
    risk: string;
    iep: string;
  }>>;
}

export const StudentRosterTable: React.FC<Props> = ({
  students,
  isLoading,
  onOpenIntakeModal,
  onQuickLogTelemetry,
  filters,
  setFilters
}) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  const totalPages = Math.ceil(students.length / itemsPerPage) || 1;
  const paginatedStudents = students.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatBarrierLabel = (barrier: BarrierType) => {
    switch (barrier) {
      case 'cognitive': return { label: 'Cognitive / ADHD / Dyslexia', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'language': return { label: 'Language / ELL Scaffolding', color: 'bg-teal-100 text-teal-800 border-teal-200' };
      case 'physical_accessibility': return { label: 'Physical / Motor Accessibility', color: 'bg-orange-100 text-orange-800 border-orange-200' };
      case 'socioeconomic_connectivity': return { label: 'Connectivity / Offline Needs', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'academic': return { label: 'Academic Benchmark Gap', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      default: return { label: barrier, color: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  const getRiskBadge = (risk?: 'low' | 'moderate' | 'high') => {
    switch (risk) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" /> High Risk
          </span>
        );
      case 'moderate':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" /> Moderate
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" /> On Track
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header and Filter Controls */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Student Intake & Telemetry Roster</h2>
            <p className="text-xs text-slate-500">
              Longitudinal tracking of academic velocity, attendance reliability, and active accommodations.
            </p>
          </div>
          <button
            onClick={onOpenIntakeModal}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Intake New Student</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search student name..."
              value={filters.search}
              onChange={(e) => {
                setFilters(prev => ({ ...prev, search: e.target.value }));
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* Grade Level */}
          <div>
            <select
              value={filters.grade}
              onChange={(e) => {
                setFilters(prev => ({ ...prev, grade: e.target.value }));
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Grade Levels</option>
              <option value="0">Kindergarten</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
                <option key={g} value={g}>Grade {g}</option>
              ))}
            </select>
          </div>

          {/* Barrier Category */}
          <div>
            <select
              value={filters.barrier}
              onChange={(e) => {
                setFilters(prev => ({ ...prev, barrier: e.target.value }));
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Barrier Types</option>
              <option value="cognitive">Cognitive / ADHD / Dyslexia</option>
              <option value="academic">Academic Benchmark Gap</option>
              <option value="physical_accessibility">Physical / Motor</option>
              <option value="socioeconomic_connectivity">Low Bandwidth / Rural</option>
              <option value="language">Language / ELL</option>
            </select>
          </div>

          {/* Risk Level */}
          <div>
            <select
              value={filters.risk}
              onChange={(e) => {
                setFilters(prev => ({ ...prev, risk: e.target.value }));
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Risk Levels</option>
              <option value="high">High Risk</option>
              <option value="moderate">Moderate Risk</option>
              <option value="low">On Track (Low)</option>
            </select>
          </div>

          {/* IEP / 504 */}
          <div>
            <select
              value={filters.iep}
              onChange={(e) => {
                setFilters(prev => ({ ...prev, iep: e.target.value }));
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">IEP/504 Status: All</option>
              <option value="true">IEP or 504 Active</option>
              <option value="false">Standard Curriculum</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/75 text-slate-700 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200">
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4">Grade</th>
              <th className="py-3 px-4">Primary Barrier</th>
              <th className="py-3 px-4">IEP/504</th>
              <th className="py-3 px-4">Attendance</th>
              <th className="py-3 px-4">Academic Velocity</th>
              <th className="py-3 px-4">Well-Being</th>
              <th className="py-3 px-4">Risk Profile</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                  <p className="mt-2 text-xs">Loading student records...</p>
                </td>
              </tr>
            ) : paginatedStudents.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-500">
                  <p className="font-medium">No students match the current filters.</p>
                  <p className="text-xs text-slate-400 mt-1">Try clearing some filter criteria or add a new student.</p>
                </td>
              </tr>
            ) : (
              paginatedStudents.map((student) => {
                const barrierMeta = formatBarrierLabel(student.primary_barrier);
                const telemetry = student.latest_telemetry;

                return (
                  <tr 
                    key={student.id} 
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => navigate(`/students/${student.id}`)}
                  >
                    {/* Student Name */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase shadow-inner">
                          {student.first_name[0]}{student.last_name[0]}
                        </div>
                        <div>
                          <div className="hover:text-blue-600 transition-colors">
                            {student.first_name} {student.last_name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            {student.active_interventions_count || 0} active intervention{(student.active_interventions_count || 0) === 1 ? '' : 's'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Grade */}
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {student.grade_level === 0 ? 'K' : `Grade ${student.grade_level}`}
                    </td>

                    {/* Primary Barrier */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${barrierMeta.color}`}>
                        {barrierMeta.label}
                      </span>
                    </td>

                    {/* IEP / 504 */}
                    <td className="py-3.5 px-4">
                      {student.has_iep_or_504 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                          Active IEP
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">None</span>
                      )}
                    </td>

                    {/* Attendance */}
                    <td className="py-3.5 px-4">
                      {telemetry ? (
                        <div className="flex items-center gap-1.5">
                          <span className={`font-semibold ${
                            Number(telemetry.attendance_percentage) < 85 
                              ? 'text-rose-600 font-bold' 
                              : Number(telemetry.attendance_percentage) < 90 
                              ? 'text-amber-600' 
                              : 'text-emerald-700'
                          }`}>
                            {Number(telemetry.attendance_percentage)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Academic Velocity (Reading & Math) */}
                    <td className="py-3.5 px-4">
                      {telemetry ? (
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-[11px]">
                            <span className="text-slate-400 w-8">Math:</span>
                            <span className="font-medium text-slate-800">{telemetry.math_score}%</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px]">
                            <span className="text-slate-400 w-8">Read:</span>
                            <span className="font-medium text-slate-800">{telemetry.reading_score}%</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Well-Being */}
                    <td className="py-3.5 px-4">
                      {telemetry ? (
                        <div className="flex items-center gap-0.5" title={`Well-being index: ${telemetry.well_being_score} out of 5`}>
                          {Array.from({ length: 5 }, (_, i) => (
                            <span 
                              key={i} 
                              className={`text-xs ${i < telemetry.well_being_score ? 'text-amber-500' : 'text-slate-200'}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Risk Profile */}
                    <td className="py-3.5 px-4">
                      {getRiskBadge(student.risk_level)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/advisory/accommodations?studentId=${student.id}`)}
                        title="Generate AI Accommodation Plan"
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors inline-flex items-center"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onQuickLogTelemetry(student)}
                        title="Log Telemetry Checkpoint"
                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors inline-flex items-center"
                      >
                        <Activity className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => navigate(`/students/${student.id}`)}
                        title="View Full Profile"
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors inline-flex items-center"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
        <div>
          Showing {paginatedStudents.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
          {Math.min(currentPage * itemsPerPage, students.length)} of {students.length} students
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-2.5 py-1 rounded border border-slate-300 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            Previous
          </button>
          <span className="px-2 font-medium">Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-2.5 py-1 rounded border border-slate-300 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

