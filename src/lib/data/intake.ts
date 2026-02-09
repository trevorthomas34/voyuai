import { createClient } from '@/lib/supabase/client'
import type { Tables, Json } from '@/types/supabase'
import type { DraftISMSScope } from '@/lib/agents/intake-agent'

export type IntakeResponse = Tables<'intake_responses'>
export type ISMSScope = Tables<'isms_scopes'>

/**
 * Fetch all intake_responses rows for the current user's org,
 * returned as a Record keyed by question_key.
 */
export async function getIntakeResponses(): Promise<Record<string, unknown>> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('organization_id')
    .eq('auth_user_id', user.id)
    .single()

  if (userError || !userData) throw userError ?? new Error('User not found')

  const orgId = (userData as { organization_id: string }).organization_id

  const { data, error } = await supabase
    .from('intake_responses')
    .select('question_key, response')
    .eq('organization_id', orgId)

  if (error) throw error

  const result: Record<string, unknown> = {}
  for (const row of (data ?? []) as { question_key: string; response: Json }[]) {
    result[row.question_key] = row.response
  }
  return result
}

/**
 * Upsert each key/value into intake_responses using the
 * UNIQUE(organization_id, question_key) constraint.
 */
export async function saveIntakeResponses(responses: Record<string, unknown>): Promise<void> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('organization_id')
    .eq('auth_user_id', user.id)
    .single()

  if (userError || !userData) throw userError ?? new Error('User not found')

  const orgId = (userData as { organization_id: string }).organization_id

  const rows = Object.entries(responses).map(([key, value]) => ({
    organization_id: orgId,
    question_key: key,
    response: value as Json,
    updated_at: new Date().toISOString(),
  }))

  if (rows.length === 0) return

  const { error } = await supabase
    .from('intake_responses')
    .upsert(rows as never[], {
      onConflict: 'organization_id,question_key',
    })

  if (error) throw error
}

export interface SavedScope {
  scope: ISMSScope
  annexAAssumptions: DraftISMSScope['annexAAssumptions']
  riskAreas: string[]
  recommendations: string[]
}

/**
 * Fetch the isms_scopes row for the current user's org plus the latest
 * approval_logs metadata (annexAAssumptions, riskAreas, recommendations).
 * Returns null if no scope exists.
 */
export async function getScope(): Promise<SavedScope | null> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('organization_id')
    .eq('auth_user_id', user.id)
    .single()

  if (userError || !userData) throw userError ?? new Error('User not found')

  const orgId = (userData as { organization_id: string }).organization_id

  const { data: scopeData, error: scopeError } = await supabase
    .from('isms_scopes')
    .select('*')
    .eq('organization_id', orgId)
    .single<Tables<'isms_scopes'>>()

  if (scopeError) {
    if (scopeError.code === 'PGRST116') return null // no rows
    throw scopeError
  }

  const scope = scopeData as Tables<'isms_scopes'>
  if (!scope) return null

  // Fetch the latest approval_logs entry for this scope
  const { data: logData } = await supabase
    .from('approval_logs')
    .select('metadata')
    .eq('object_type', 'scope')
    .eq('object_id', scope.id)
    .order('approved_at', { ascending: false })
    .limit(1)
    .single<{ metadata: Json | null }>()

  const metadata = (logData?.metadata ?? {}) as Record<string, unknown>

  return {
    scope,
    annexAAssumptions: (metadata.annexAAssumptions ?? []) as DraftISMSScope['annexAAssumptions'],
    riskAreas: (metadata.riskAreas ?? []) as string[],
    recommendations: (metadata.recommendations ?? []) as string[],
  }
}
