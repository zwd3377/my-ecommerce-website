import { createClient } from '@supabase/supabase-js';

// This client is used exclusively for admin-level operations on the server-side.
// It uses the SERVICE_ROLE_KEY to bypass RLS.
// IMPORTANT: Never expose this client or the service role key to the client-side.

// Ensure the environment variables are not undefined. 
// If they are, it's a critical configuration error.
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Supabase URL or Service Role Key is not defined in environment variables.');
}

export const createAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};