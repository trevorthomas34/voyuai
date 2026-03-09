import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ensureUserExists } from '@/lib/supabase/ensure-user'
import type { InsertTables } from '@/types/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userData = await ensureUserExists(user)

    const body = await request.json()
    const { riskId, comment } = body as { riskId: string; comment?: string }

    if (!riskId) {
      return NextResponse.json({ error: 'riskId is required' }, { status: 400 })
    }

    const admin = createAdminClient()
    const now = new Date().toISOString()

    // Set human action flag so the protect_approval_fields trigger allows the update
    await admin.rpc('set_config' as never, {
      setting: 'app.is_human_action',
      value: 'true',
    } as never).then(() => {}, () => {})

    const { data, error } = await admin
      .from('risks')
      .update({
        status: 'approved',
        approved_by: userData.id,
        approved_at: now,
        updated_at: now,
      } as never)
      .eq('id', riskId)
      .eq('organization_id', userData.organization_id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const logInsert: InsertTables<'approval_logs'> = {
      organization_id: userData.organization_id,
      object_type: 'risk',
      object_id: riskId,
      action: 'approved',
      approved_by: userData.id,
      comment: comment ?? null,
    }

    await admin.from('approval_logs').insert(logInsert as never)

    return NextResponse.json({ success: true, risk: data })
  } catch (error) {
    console.error('Error approving risk:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to approve risk' },
      { status: 500 }
    )
  }
}
