import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ensureUserExists } from '@/lib/supabase/ensure-user'
import { generateDraftScope, validateIntakeResponses, type IntakeResponses } from '@/lib/agents/intake-agent'
import type { Json } from '@/types/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user and provision org if needed
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensures org + user rows exist for first-time users
    await ensureUserExists(user)

    const body = await request.json()
    const responses = body.responses as Partial<IntakeResponses>

    // Validate that all required fields are present
    const validation = validateIntakeResponses(responses)
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Missing required fields', missing: validation.missing },
        { status: 400 }
      )
    }

    // Save responses server-side (org now exists)
    try {
      const admin = createAdminClient()
      const { data: userData } = await admin
        .from('users')
        .select('organization_id')
        .eq('auth_user_id', user.id)
        .single()

      if (userData?.organization_id) {
        const rows = Object.entries(responses).map(([key, value]) => ({
          organization_id: userData.organization_id,
          question_key: key,
          response: value as Json,
          updated_at: new Date().toISOString(),
        }))
        await admin.from('intake_responses').upsert(rows as never[], {
          onConflict: 'organization_id,question_key',
        })
      }
    } catch (saveErr) {
      console.error('Failed to save intake responses server-side:', saveErr)
    }

    // Generate draft scope using the Intake Agent
    const draftScope = await generateDraftScope(responses as IntakeResponses)

    return NextResponse.json({ success: true, draftScope })
  } catch (error) {
    console.error('Error generating scope:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate draft scope',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
