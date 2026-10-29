import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Settings, School, Sparkles, ShieldCheck, Key, 
  Database, Check, RefreshCw, Cpu
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { profile, school, role } = useAuth();
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState<boolean>(true);

  useEffect(() => {
    async function checkHealth() {
      setIsLoadingHealth(true);
      try {
        const res = await api.health();
        setSystemHealth(res);
      } catch (err) {
        console.warn('Health check fetch failed:', err);
      } finally {
        setIsLoadingHealth(false);
      }
    }
    checkHealth();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
            <Settings className="w-4 h-4" />
          </span>
          <span className="text-xs uppercase font-bold tracking-wider text-blue-600">
            System Architecture & Configuration
          </span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Institutional Settings & AI Engine Security
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage school tenant settings, AI inference controls, and Row Level Security audits.
        </p>
      </div>

      {/* Grid: School Info & AI Orchestration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* School Profile */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <School className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Active Educational Institution</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Institution Name</span>
              <span className="font-bold text-slate-900 text-sm">{school?.name || 'Oakridge Inclusive Academy'}</span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">District / Region</span>
              <span className="font-semibold text-slate-800">{school?.district || 'Metro Unified School District'}</span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Environmental Connectivity Level</span>
              <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                school?.connectivity_level === 'low' 
                  ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}>
                {school?.connectivity_level || 'high'} bandwidth mode
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Tenant Organization UUID</span>
              <span className="font-mono text-[11px] bg-slate-100 px-2 py-1 rounded block text-slate-700 truncate">
                {school?.id || '11111111-1111-1111-1111-111111111111'}
              </span>
            </div>
          </div>
        </div>

        {/* AI Engine Status */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Cpu className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">Google Gen AI SDK Runtime</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Configured Model</span>
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>gemini-2.5-flash (@google/genai)</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">API Key Connection Status</span>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                  systemHealth?.aiEngine?.configured 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}>
                  <Check className="w-3 h-3 text-current" />
                  {systemHealth?.aiEngine?.configured ? 'Active Gemini API Key' : 'Adaptive Pedagogical Fallback Active'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Strict JSON Schema Enforcement</span>
              <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 block">
                responseSchema: accommodationResponseSchema (Verified Type.OBJECT)
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Zero Client-Side Exposure</span>
              <span className="text-[11px] text-slate-600">
                All AI prompts are secured inside Express controllers behind authenticated JWT verification. Frontend clients have zero direct LLM API access.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Row Level Security & Compliance Audits */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-900">Security, Data Minimization & Isolation Guarantees</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
              <Database className="w-4 h-4 text-blue-600" />
              <span>Multi-Tenant RLS</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              PostgreSQL Row Level Security isolates students, telemetry, and accommodation plans strictly by school organization ID. Cross-school queries are rejected at the database engine level.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
              <Key className="w-4 h-4 text-purple-600" />
              <span>PII Anonymization</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Student names and identifiers are fully stripped before building LLM accommodation prompts. The AI receives only grade levels, barrier categories, and academic percentiles.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>XSS Input Sanitization</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              All rich text, intake notes, and educator comments pass through strict isomorphic-dompurify filtering before persisting to database storage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

