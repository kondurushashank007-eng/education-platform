import { Request, Response, NextFunction } from 'express';
import { UserRole, Profile } from '../../../shared/dist/types';
import { DataStoreService } from '../services/store';
import { supabaseAdmin, isSupabaseConfigured } from '../lib/supabase';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: Profile;
      schoolId?: string;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const demoUserId = req.headers['x-user-id'] as string;
    const demoSchoolId = req.headers['x-school-id'] as string;

    // 1. Supabase JWT Authentication if available
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      if (isSupabaseConfigured && supabaseAdmin) {
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
        if (error || !user) {
          res.status(401).json({ error: 'Unauthorized: Invalid authentication token' });
          return;
        }

        const profile = await DataStoreService.getProfileById(user.id);
        if (!profile || !profile.school_id) {
          res.status(403).json({ error: 'Forbidden: User has not been linked to a school organization' });
          return;
        }

        req.user = profile;
        req.schoolId = profile.school_id;
        return next();
      }
    }

    // 2. Demo User Switching for immediate testing & role isolation audits
    if (demoUserId) {
      const profile = await DataStoreService.getProfileById(demoUserId);
      if (profile && profile.school_id) {
        req.user = profile;
        req.schoolId = profile.school_id;
        return next();
      }
    }

    // 3. Fallback default active session (Marcus Chen, Educator @ Oakridge)
    const defaultProfile = await DataStoreService.getProfileById('33333333-3333-3333-3333-333333333332');
    if (defaultProfile) {
      // If demo school override requested (e.g. testing Crestview isolation)
      if (demoSchoolId) {
        req.schoolId = demoSchoolId;
        req.user = {
          ...defaultProfile,
          school_id: demoSchoolId
        };
      } else {
        req.user = defaultProfile;
        req.schoolId = defaultProfile.school_id!;
      }
      return next();
    }

    res.status(401).json({ error: 'Unauthorized: Missing credentials' });
  } catch (err: any) {
    console.error('Authentication Middleware Error:', err);
    res.status(500).json({ error: 'Internal authentication failure' });
  }
}

/**
 * Role-Based Access Control Guard
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ 
        error: `Access denied. Role '${req.user.role}' is not authorized. Required: ${allowedRoles.join(', ')}` 
      });
      return;
    }

    next();
  };
}

