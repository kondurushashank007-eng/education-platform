import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseServiceKey &&
  !supabaseUrl.includes('xyzcompany') &&
  !supabaseUrl.includes('YOUR_') &&
  supabaseUrl.startsWith('http')
);

export const supabaseAdmin: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

/**
 * Creates a client scoped to a user JWT for strict RLS validation
 */
export function createScopedSupabaseClient(jwtToken: string): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  return createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY || supabaseServiceKey, {
    global: {
      headers: {
        Authorization: `Bearer ${jwtToken}`
      }
    }
  });
}

