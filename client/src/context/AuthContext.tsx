import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, School, DemoUser, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  profile: Profile | null;
  school: School | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  demoUsers: DemoUser[];
  login: (email: string, password?: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  switchDemoUser: (demoUser: DemoUser) => Promise<void>;
  switchSchoolTenant: (schoolId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [demoUsers, setDemoUsers] = useState<DemoUser[]>([]);

  // Load demo users and active session on mount
  useEffect(() => {
    async function initAuth() {
      try {
        const { demoUsers: fetchedDemoUsers } = await api.auth.getDemoUsers();
        setDemoUsers(fetchedDemoUsers);

        const savedUserId = localStorage.getItem('edureach_user_id');
        if (savedUserId && fetchedDemoUsers.length > 0) {
          const matched = fetchedDemoUsers.find(u => u.id === savedUserId);
          if (matched) {
            await switchDemoUser(matched);
            setIsLoading(false);
            return;
          }
        }

        // Default to Marcus Chen (Educator at Oakridge)
        const defaultUser = fetchedDemoUsers.find(u => u.role === 'educator') || fetchedDemoUsers[0];
        if (defaultUser) {
          await switchDemoUser(defaultUser);
        }
      } catch (err) {
        console.warn('Auth initialization fallback:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const switchDemoUser = async (demoUser: DemoUser) => {
    localStorage.setItem('edureach_user_id', demoUser.id);
    localStorage.setItem('edureach_school_id', demoUser.schoolId);
    
    // Fetch profile and school
    try {
      const res = await api.auth.me();
      setProfile(res.profile);
      setSchool(res.school);
    } catch {
      // Create local fallback representation
      const localProfile: Profile = {
        id: demoUser.id,
        email: demoUser.email,
        full_name: demoUser.name,
        role: demoUser.role,
        school_id: demoUser.schoolId,
        created_at: new Date().toISOString()
      };
      setProfile(localProfile);
      setSchool({
        id: demoUser.schoolId,
        name: demoUser.schoolName,
        connectivity_level: demoUser.schoolName.includes('Crestview') ? 'low' : 'high',
        created_at: new Date().toISOString()
      });
    }
  };

  const switchSchoolTenant = async (schoolId: string) => {
    localStorage.setItem('edureach_school_id', schoolId);
    const res = await api.auth.me();
    setProfile(res.profile);
    setSchool(res.school);
  };

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login({ email, password });
      if (res.token) localStorage.setItem('edureach_token', res.token);
      if (res.profile?.id) localStorage.setItem('edureach_user_id', res.profile.id);
      if (res.school?.id) localStorage.setItem('edureach_school_id', res.school.id);
      setProfile(res.profile);
      setSchool(res.school);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.auth.register(data);
      if (res.token) localStorage.setItem('edureach_token', res.token);
      if (res.profile?.id) localStorage.setItem('edureach_user_id', res.profile.id);
      if (res.school?.id) localStorage.setItem('edureach_school_id', res.school.id);
      setProfile(res.profile);
      setSchool(res.school);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('edureach_token');
    localStorage.removeItem('edureach_user_id');
    localStorage.removeItem('edureach_school_id');
    setProfile(null);
    setSchool(null);
  };

  return (
    <AuthContext.Provider
      value={{
        profile,
        school,
        role: profile?.role || null,
        isAuthenticated: Boolean(profile),
        isLoading,
        demoUsers,
        login,
        register,
        logout,
        switchDemoUser,
        switchSchoolTenant
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

