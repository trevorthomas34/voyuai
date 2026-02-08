import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Check if user has completed intake (has a scope record)
      const { data: scope } = await supabase
        .from('isms_scopes')
        .select('id')
        .limit(1)
        .single()

      // First-time users go to /intake, unless next is /auth/confirmed (email verification)
      const destination = next === '/auth/confirmed'
        ? next
        : scope ? next : '/intake'

      return NextResponse.redirect(`${origin}${destination}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
