import React from 'react';
import { useAccessibility, FontScale } from '../../context/AccessibilityContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Eye, Zap, Type, School as SchoolIcon, UserCheck, 
  WifiOff, Check
} from 'lucide-react';

export const AccessibilityToolbar: React.FC = () => {
  const { 
    fontScale, 
    setFontScale, 
    highContrast, 
    toggleHighContrast, 
    lowBandwidth, 
    toggleLowBandwidth,
    announce 
  } = useAccessibility();

  const { demoUsers, profile, school, switchDemoUser } = useAuth();

  const handleFontChange = (scale: FontScale) => {
    setFontScale(scale);
    announce(`Font size changed to ${scale}`);
  };

  return (
    <aside aria-label="Accessibility & Persona Controls" className="bg-slate-900 text-slate-100 text-xs py-1.5 px-4 border-b border-slate-800 transition-colors no-print">
      {/* Skip to Main Content Link for screen readers and keyboard users */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
      >
        Skip to main content
      </a>

      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Accessibility Controls */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-4">
          <span className="font-semibold text-slate-400 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-blue-400" aria-hidden="true" />
            <span>Accessibility (WCAG 2.1 AA):</span>
          </span>

          {/* Text Size Stepper */}
          <div className="flex items-center bg-slate-800 rounded px-1 py-0.5 border border-slate-700" role="group" aria-label="Font Size Adjuster">
            <span className="text-[10px] text-slate-400 mr-1 flex items-center gap-0.5">
              <Type className="w-3 h-3" /> Size:
            </span>
            {(['normal', 'large', 'xlarge'] as FontScale[]).map((scale) => (
              <button
                key={scale}
                onClick={() => handleFontChange(scale)}
                aria-pressed={fontScale === scale}
                className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  fontScale === scale 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
                title={`Set text size to ${scale}`}
              >
                {scale === 'normal' ? 'A' : scale === 'large' ? 'A+' : 'A++'}
              </button>
            ))}
          </div>

          {/* High Contrast Toggle */}
          <button
            onClick={() => {
              toggleHighContrast();
              announce(`High contrast ${!highContrast ? 'enabled' : 'disabled'}`);
            }}
            aria-pressed={highContrast}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded border transition-colors ${
              highContrast 
                ? 'bg-yellow-400 text-slate-950 border-yellow-300 font-bold' 
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>{highContrast ? 'High Contrast ON' : 'High Contrast'}</span>
          </button>

          {/* Low Bandwidth Mode Toggle */}
          <button
            onClick={() => {
              toggleLowBandwidth();
              announce(`Low bandwidth mode ${!lowBandwidth ? 'activated' : 'deactivated'}`);
            }}
            aria-pressed={lowBandwidth}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded border transition-colors ${
              lowBandwidth 
                ? 'bg-emerald-600 text-white border-emerald-500 font-bold' 
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Optimizes display for low-connectivity environments with zero multimedia payloads"
          >
            <WifiOff className="w-3 h-3" />
            <span>{lowBandwidth ? 'Low-Bandwidth Active' : 'Low-Bandwidth Mode'}</span>
          </button>
        </div>

        {/* Right: Quick Role & Tenant Persona Switcher */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-slate-400">
            <SchoolIcon className="w-3.5 h-3.5 text-blue-400" />
            <span className="truncate max-w-[180px] font-medium text-slate-300">
              {school?.name || 'Oakridge Academy'}
            </span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase ${
              school?.connectivity_level === 'low' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-blue-950 text-blue-300 border border-blue-800'
            }`}>
              {school?.connectivity_level || 'high'} conn
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <label htmlFor="persona-switcher" className="sr-only">Switch Demo Persona</label>
            <select
              id="persona-switcher"
              value={profile?.id || ''}
              onChange={(e) => {
                const target = demoUsers.find(u => u.id === e.target.value);
                if (target) {
                  switchDemoUser(target);
                  announce(`Switched persona to ${target.name}, role ${target.role} at ${target.schoolName}`);
                }
              }}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-2 py-0.5 text-xs focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              {demoUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role.toUpperCase()}) — {u.schoolName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </aside>
  );
};

