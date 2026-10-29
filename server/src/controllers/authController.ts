import { Request, Response } from 'express';
import { DataStoreService } from '../services/store';
import { UserLoginInput, UserRegisterInput } from '../../../shared/dist/validators';
import { Profile } from '../../../shared/dist/types';
import { v4 as uuidv4 } from 'uuid';
import { isSupabaseConfigured, supabaseAdmin } from '../lib/supabase';

export class AuthController {
  /**
   * GET /api/auth/schools
   */
  static async getSchools(req: Request, res: Response): Promise<void> {
    try {
      const schools = await DataStoreService.getSchools();
      res.json({ schools });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve schools' });
    }
  }

  /**
   * GET /api/auth/demo-users
   * Returns preconfigured personas across roles and schools for quick testing
   */
  static async getDemoUsers(req: Request, res: Response): Promise<void> {
    try {
      const schools = await DataStoreService.getSchools();
      const allProfiles: Profile[] = [];
      for (const school of schools) {
        const profiles = await DataStoreService.getProfilesBySchool(school.id);
        allProfiles.push(...profiles);
      }

      res.json({
        demoUsers: allProfiles.map(p => ({
          id: p.id,
          name: p.full_name,
          email: p.email,
          role: p.role,
          schoolId: p.school_id,
          schoolName: schools.find(s => s.id === p.school_id)?.name || 'Unknown School'
        }))
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch demo personas' });
    }
  }

  /**
   * POST /api/auth/login
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body as UserLoginInput;

      // 1. Supabase Auth if configured
      if (isSupabaseConfigured && supabaseAdmin) {
        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
          email,
          password
        });
        if (!error && data.session) {
          const profile = await DataStoreService.getProfileById(data.user.id);
          const school = profile?.school_id ? await DataStoreService.getSchoolById(profile.school_id) : null;
          res.json({
            token: data.session.access_token,
            user: { id: data.user.id, email: data.user.email },
            profile,
            school
          });
          return;
        }
      }

      // 2. Local matching for demo accounts
      const schools = await DataStoreService.getSchools();
      let matchedProfile: Profile | null = null;
      for (const school of schools) {
        const profiles = await DataStoreService.getProfilesBySchool(school.id);
        const found = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
        if (found) {
          matchedProfile = found;
          break;
        }
      }

      if (!matchedProfile) {
        // Fallback to default educator
        matchedProfile = await DataStoreService.getProfileById('33333333-3333-3333-3333-333333333332');
      }

      const school = matchedProfile?.school_id ? await DataStoreService.getSchoolById(matchedProfile.school_id) : null;

      res.json({
        token: `demo-jwt-token-${matchedProfile?.id}`,
        user: { id: matchedProfile?.id, email: matchedProfile?.email },
        profile: matchedProfile,
        school
      });
    } catch (err: any) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Authentication failed' });
    }
  }

  /**
   * POST /api/auth/register
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const input = req.body as UserRegisterInput;

      let schoolId = input.schoolId;
      if (!schoolId && input.newSchoolName) {
        const newSchool = await DataStoreService.createSchool(input.newSchoolName);
        schoolId = newSchool.id;
      }

      if (!schoolId) {
        const schools = await DataStoreService.getSchools();
        schoolId = schools[0].id;
      }

      const newUserId = uuidv4();
      const profile: Profile = {
        id: newUserId,
        email: input.email,
        full_name: input.fullName,
        role: input.role,
        school_id: schoolId,
        created_at: new Date().toISOString()
      };

      await DataStoreService.createProfile(profile);
      const school = await DataStoreService.getSchoolById(schoolId);

      res.status(201).json({
        message: 'Account registered successfully',
        token: `demo-jwt-token-${newUserId}`,
        user: { id: newUserId, email: input.email },
        profile,
        school
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  /**
   * GET /api/auth/me
   */
  static async me(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      const school = req.schoolId ? await DataStoreService.getSchoolById(req.schoolId) : null;

      res.json({
        profile: user,
        school
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve profile' });
    }
  }
}

