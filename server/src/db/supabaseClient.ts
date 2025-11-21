import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false },
    })
  : null as any;

export async function testSupabaseConnection() {
  if (!supabase) throw new Error('Supabase client not configured');
  // Try a simple read on users table (exists in our schema). If it doesn't exist, this still tests connectivity.
  const { error } = await supabase.from('users').select('id').limit(1);
  if (error) {
    // Connectivity is OK if we reached Supabase; error may be "table not found" which is fine for connectivity.
    if (error.message?.toLowerCase().includes('not found')) {
      console.warn('Supabase reachable, but users table not found yet.');
      return;
    }
    // Other errors are still useful to surface
    throw error;
  }
}

