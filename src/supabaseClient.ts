import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ukwqvttvgguatatrzgzm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrd3F2dHR2Z2d1YXRhdHJ6Z3ptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMjk5ODUsImV4cCI6MjA4MTcwNTk4NX0.nCcUxMYjM25e36W7h2rDcxlriIQE0ZzlOi879rVCqNI';

// ✅ Singleton instance (બહારની ફાઈલ માટે)
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'gnan-sahayak-auth-token',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});