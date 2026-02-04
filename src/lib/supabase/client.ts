import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Note: After setting up Supabase, run `npx supabase gen types typescript`
// to generate proper types and update this file to use Database type:
// import type { Database } from '@/types/database'
// return createBrowserClient<Database>(...)
