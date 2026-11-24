import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { infraConfig } from '@/config/infrastructure';

export async function createClient() {
  const config = infraConfig.getSupabaseConfig();

  if (!config.isConfigured) {
    return null;
  }

  let cookieStore: any;
  try {
    cookieStore = await cookies();
  } catch {
    return null;
  }

  return createServerClient(config.url, config.anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Can happen in Server Components where cookies cannot be mutated
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch {
          // Can happen in Server Components
        }
      },
    },
  });
}
