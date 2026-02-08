import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
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

    if (!draftScope) {
      return NextResponse.json(
        { error: 'Draft scope is required' },
        { status: 400 }
      )
    }

    // Note: In production, use supabase.rpc('set_config', ...) to set app.is_human_action = 'true'
    // This enables the database trigger protection for approval fields

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

    const { data: scopeData, error: scopeError } = await supabase
      .from('isms_scopes')
      .upsert(scopeInsert as never, {
        onConflict: 'organization_id'
      })
      .select()
      .single<Tables<'isms_scopes'>>()

    if (scopeError) {
      console.error('Error saving scope:', scopeError)
      return NextResponse.json(
        { error: 'Failed to save scope' },
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

    const { error: logError } = await supabase
      .from('approval_logs')
      .insert(logInsert as never)

    if (logError) {
      console.error('Error creating approval log:', logError)
      // Don't fail the request, scope was saved
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
        error: 'Failed to approve scope',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
