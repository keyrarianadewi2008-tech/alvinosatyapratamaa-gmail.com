/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

const getSupabase = (): SupabaseClient => {
  if (_supabase) return _supabase;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase credentials missing. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.');
  }

  _supabase = createClient(supabaseUrl, supabaseAnonKey);
  return _supabase;
};

// Export a proxy that initializes the client only when accessed
// This avoids crashing the application at module load time if keys are missing
export const supabase = new Proxy({} as SupabaseClient, {
  get: (target, prop, receiver) => {
    const client = getSupabase();
    return Reflect.get(client, prop, receiver);
  }
});
