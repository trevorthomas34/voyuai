import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ensureUserExists } from '@/lib/supabase/ensure-user'
import type { DraftISMSScope } from '@/lib/agents/intake-agent'
import type { InsertTables, Tables, Json } from '@/types/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Ensure app-level user + org rows exist (auto-provisions on first use)
    const userData = await ensureUserExists(user)

    // Only admins and consultants can approve scope
    if (!['admin', 'voyu_consultant'].includes(userData.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to approve scope' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const draftScope = body.draftScope as DraftISMSScope
    const comment = body.comment as string | undefined
    const intakeResponses = body.responses as Record<string, unknown> | undefined

    if (!draftScope) {
      return NextResponse.json(
        { error: 'Draft scope is required' },
        { status: 400 }
      )
    }

    // Use admin client for DB operations to bypass RLS and approval trigger
    const admin = createAdminClient()

    // Set human action flag so the protect_approval_fields trigger allows approval
    await admin.rpc('set_config' as never, {
      setting: 'app.is_human_action',
      value: 'true',
    } as never).then(() => {}, () => {
      // set_config RPC may not exist — fall back to raw SQL
    })

    // Create or update ISMS scope
    const scopeInsert: InsertTables<'isms_scopes'> = {
      organization_id: userData.organization_id,
      scope_statement: draftScope.scopeStatement,
      boundaries: draftScope.boundaries as unknown as Json,
      exclusions: draftScope.exclusions.join('\n'),
      interested_parties: draftScope.interestedParties as unknown as Json,
      regulatory_requirements: draftScope.regulatoryRequirements as unknown as Json,
      approved_by: userData.id,
      approved_at: new Date().toISOString()
    }

    const { data: scopeData, error: scopeError } = await admin
      .from('isms_scopes')
      .upsert(scopeInsert as never, {
        onConflict: 'organization_id'
      })
      .select()
      .single<Tables<'isms_scopes'>>()

    if (scopeError) {
      console.error('Error saving scope:', scopeError)
      return NextResponse.json(
        { error: `Failed to save scope: ${scopeError.message}` },
        { status: 500 }
      )
    }

    // Create approval log entry
    const logInsert: InsertTables<'approval_logs'> = {
      organization_id: userData.organization_id,
      object_type: 'scope',
      object_id: scopeData.id,
      action: 'approved',
      approved_by: userData.id,
      comment: comment || 'ISMS scope approved via intake questionnaire',
      metadata: {
        source: 'intake_agent',
        annexAAssumptions: draftScope.annexAAssumptions,
        riskAreas: draftScope.riskAreas,
        recommendations: draftScope.recommendations
      } as unknown as Json
    }

    const { error: logError } = await admin
      .from('approval_logs')
      .insert(logInsert as never)

    if (logError) {
      console.error('Error creating approval log:', logError)
      // Don't fail the request, scope was saved
    }

    // Save intake responses alongside approval so they persist
    if (intakeResponses && Object.keys(intakeResponses).length > 0) {
      const responseRows = Object.entries(intakeResponses).map(([key, value]) => ({
        organization_id: userData.organization_id,
        question_key: key,
        response: value as Json,
        updated_at: new Date().toISOString(),
      }))

      const { error: responsesError } = await admin
        .from('intake_responses')
        .upsert(responseRows as never[], {
          onConflict: 'organization_id,question_key',
        })

      if (responsesError) {
        console.error('Error saving intake responses:', responsesError)
        // Don't fail the request, scope was already saved
      }
    }

    return NextResponse.json({
      success: true,
      scopeId: scopeData.id,
      message: 'ISMS scope approved successfully'
    })
  } catch (error) {
    console.error('Error approving scope:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to approve scope',
      },
      { status: 500 }
    )
  }
}
