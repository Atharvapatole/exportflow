import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { infraConfig } from '@/config/infrastructure';

/**
 * Privileged Supabase Admin Client
 * Strictly server-side only. Uses the SUPABASE_SERVICE_ROLE_KEY to bypass Row Level Security
 * for background administrative workflows, bootstrap verification, and server audit logging.
 */
export function createAdminClient() {
  const config = infraConfig.getSupabaseConfig();

  if (!config.url || !config.serviceRoleKey) {
    return null;
  }

  return createSupabaseClient(config.url, config.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
