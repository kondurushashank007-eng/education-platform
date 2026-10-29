import React, { useState } from 'react';
import { AccommodationPlan, AccommodationResponsePayload } from '../../types';
import { 
  Sparkles, Layers, Printer, Calendar, ShieldCheck, 
  WifiOff, ArrowRight, BookOpen, HeartHandshake, FileText, CheckCircle2
} from 'lucide-react';

interface Props {
  plan: AccommodationPlan;
  onDeployIntervention?: (plan: AccommodationPlan) => void;
}

export const AccommodationViewer: React.FC<Props> = ({
  plan,
  onDeployIntervention
}) => {
  const [activeTab, setActiveTab] = useState<'udl' | 'classroom' | 'roadmap' | 'printable'>('udl');
  const accommodations = plan.accommodations_json as AccommodationResponsePayload;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden card-print">
      {/* Plan Header */}
      <div className="p-6 bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-200 border border-blue-400/30">
                <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                Gemini 2.5 Flash Advisory Plan
              </span>
              <span className="text-xs text-slate-300">
                Subject: <strong className="text-white">{plan.subject}</strong>
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              UDL Accommodation Blueprint
            </h2>
            <p className="text-xs text-blue-100/90 mt-1 max-w-3xl leading-relaxed">
              Objective: "{plan.learning_objective}"
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 no-print">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/20"
              title="Print low-tech physical study packet"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Packet</span>
            </button>
            {onDeployIntervention && (
              <button
                onClick={() => onDeployIntervention(plan)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-colors shadow-sm"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Deploy Intervention</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 no-print overflow-x-auto">
        <button
          onClick={() => setActiveTab('udl')}
          className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'udl'
              ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Universal Design for Learning (UDL)</span>
        </button>

        <button
          onClick={() => setActiveTab('classroom')}
          className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'classroom'
              ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Classroom & Low-Tech Fallbacks ({accommodations.classroomAccommodations?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('roadmap')}
          className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'roadmap'
              ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Tutoring Roadmap ({accommodations.tutoringRoadmap?.length || 0} Sessions)</span>
        </button>

        <button
          onClick={() => setActiveTab('printable')}
          className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'printable'
              ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Low-Bandwidth Printable View</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Executive Summary Bar */}
        <div className="mb-6 p-4 rounded-xl bg-blue-50/70 border border-blue-200">
          <div className="flex items-center gap-2 mb-1 text-xs font-bold uppercase tracking-wider text-blue-900">
            <HeartHandshake className="w-4 h-4 text-blue-600" />
            <span>Pedagogical Neuropsychology Summary</span>
          </div>
          <p className="text-xs text-slate-800 leading-relaxed">
            {accommodations.executiveSummary}
          </p>
        </div>

        {/* TAB 1: UDL Principles */}
        {(activeTab === 'udl' || activeTab === 'printable') && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Representation */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    1. Multiple Means of Representation
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">Visual, auditory, tactile modalities for content perception.</p>
                <ul className="space-y-2">
                  {accommodations.udlPrinciples.representation.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-snug">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Engagement */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    2. Multiple Means of Engagement
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">Motivating and sustaining learner effort & autonomy.</p>
                <ul className="space-y-2">
                  {accommodations.udlPrinciples.engagement.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-snug">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action and Expression */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    3. Action & Expression
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">Alternative channels for students to demonstrate mastery.</p>
                <ul className="space-y-2">
                  {accommodations.udlPrinciples.actionAndExpression.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-snug">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Classroom Accommodations & Low-Tech Fallbacks */}
        {(activeTab === 'classroom' || activeTab === 'printable') && (
          <div className="space-y-4 mt-6">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Differentiated Classroom Strategies & Low-Tech Resiliency</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4">Category</th>
                    <th className="py-2.5 px-4">Core Adaptation Strategy</th>
                    <th className="py-2.5 px-4">Digital / EdTech Tool</th>
                    <th className="py-2.5 px-4 bg-amber-50 text-amber-900 border-l border-amber-200">
                      <div className="flex items-center gap-1 font-bold">
                        <WifiOff className="w-3.5 h-3.5 text-amber-700" />
                        <span>Zero-Bandwidth / Low-Tech Fallback</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {accommodations.classroomAccommodations.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-900 align-top">
                        {row.category}
                      </td>
                      <td className="py-3 px-4 text-slate-800 align-top leading-relaxed">
                        {row.strategy}
                      </td>
                      <td className="py-3 px-4 text-blue-700 font-medium align-top">
                        {row.toolOrResource}
                      </td>
                      <td className="py-3 px-4 bg-amber-50/50 text-slate-900 align-top border-l border-amber-200 leading-relaxed font-medium">
                        {row.lowTechFallback}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Tutoring Roadmap */}
        {(activeTab === 'roadmap' || activeTab === 'printable') && (
          <div className="space-y-4 mt-6">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Targeted 4-Session Tutoring & Remedial Roadmap</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accommodations.tutoringRoadmap.map((session) => (
                <div 
                  key={session.sessionNumber} 
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-colors shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">
                      Session {session.sessionNumber}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">
                      {session.focusSkill}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                    {session.activityDescription}
                  </p>

                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-[11px] text-emerald-900">
                    <strong className="text-emerald-800">Mastery Checkpoint:</strong> {session.successMetric}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

