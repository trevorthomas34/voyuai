import { createClient } from '@supabase/supabase-js'

// Admin client with service role - use only in server-side code
// This bypasses RLS - use with caution
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// Note: After setting up Supabase, run `npx supabase gen types typescript`
// to generate proper types and update this file to use Database type:
// import type { Database } from '@/types/database'
// return createClient<Database>(...)
