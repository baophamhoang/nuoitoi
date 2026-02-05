import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

// Support both old (ANON_KEY) and new (PUBLISHABLE_DEFAULT_KEY) naming conventions
function getSupabaseAnonKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    ''
  );
}

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    getSupabaseAnonKey()
  );
}
