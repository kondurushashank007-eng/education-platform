import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  GraduationCap, LayoutDashboard, Users, Sparkles, 
  Layers, BarChart3, Settings, LogOut, ShieldAlert
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { profile, school, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Students', path: '/students', icon: Users },
    { name: 'Accommodation Studio', path: '/advisory/accommodations', icon: Sparkles },
    { name: 'Interventions', path: '/interventions', icon: Layers },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const getRoleBadgeColor = (r?: string | null) => {
    switch (r) {
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'educator': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'specialist': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'tutor': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center">
            <NavLink to="/dashboard" className="flex items-center gap-2 group">
              <div className="bg-blue-600 text-white p-2 rounded-lg group-hover:bg-blue-700 transition-colors shadow-sm">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                  EduReach <span className="text-blue-600">AI</span>
                </span>
                <span className="hidden sm:block text-[10px] text-slate-500 font-medium tracking-wide uppercase">
                  Inclusive Education & Student Success
                </span>
              </div>
            </NavLink>

            {/* Navigation Links */}
            <div className="hidden lg:flex lg:ml-8 lg:space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-semibold border-b-2 border-blue-600'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Right: Active Role, School, Profile & Logout */}
          <div className="flex items-center gap-3">
            {profile ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-semibold text-slate-900 leading-tight">
                    {profile.full_name}
                  </div>
                  <div className="flex items-center justify-end gap-1.5 mt-0.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getRoleBadgeColor(role)}`}>
                      {role}
                    </span>
                    <span className="text-xs text-slate-500 truncate max-w-[120px]">
                      {school?.name}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <NavLink
                  to="/auth/login"
                  className="text-sm font-medium text-slate-700 hover:text-blue-600 px-3 py-1.5"
                >
                  Sign In
                </NavLink>
                <NavLink
                  to="/auth/register"
                  className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 rounded-md shadow-sm"
                >
                  Register School
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="lg:hidden flex overflow-x-auto border-t border-slate-100 px-2 py-1 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-1 px-2.5 py-1.5 rounded text-xs whitespace-nowrap font-medium ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

