import { createClient } from '@/lib/supabase/client'
import type { Tables, InsertTables, UpdateTables } from '@/types/supabase'

export type Evidence = Tables<'evidence'>
export type EvidenceInsert = InsertTables<'evidence'>
export type EvidenceUpdate = UpdateTables<'evidence'>

// Extended evidence type for display
export interface EvidenceWithDetails extends Evidence {
  control_name?: string
  uploaded_by_name?: string
  verified: boolean
  verified_by?: string | null
  verified_at?: string | null
  verified_by_name?: string | null
}

export async function getEvidence(): Promise<EvidenceWithDetails[]> {
  const supabase = createClient()

  // Try with verified_by join first; fall back if column doesn't exist yet
  let data: unknown[] | null = null
  let hasVerifiedBy = true

  const { data: fullData, error: fullError } = await supabase
    .from('evidence')
    .select(`
      *,
      controls (name),
      verifier:verified_by (full_name)
    `)
    .order('created_at', { ascending: false })

  if (fullError) {
    // If error mentions verified_by, fall back to query without it
    if (fullError.message?.includes('verified_by') || fullError.code === '42703') {
      hasVerifiedBy = false
      const { data: simpleData, error: simpleError } = await supabase
        .from('evidence')
        .select(`*, controls (name)`)
        .order('created_at', { ascending: false })
      if (simpleError) throw simpleError
      data = simpleData ?? []
    } else {
      throw fullError
    }
  } else {
    data = fullData ?? []
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((e: any) => ({
    ...e,
    control_name: e.controls?.name,
    controls: undefined,
    verified: hasVerifiedBy ? !!e.verified_at : false,
    verified_by_name: hasVerifiedBy ? (e.verifier?.full_name ?? null) : null,
    verifier: undefined,
  }))
}

export async function getEvidenceByControl(controlId: string): Promise<EvidenceWithDetails[]> {
  const supabase = createClient()

  let data: unknown[] | null = null
  let hasVerifiedBy = true

  const { data: fullData, error: fullError } = await supabase
    .from('evidence')
    .select(`
      *,
      controls (name),
      verifier:verified_by (full_name)
    `)
    .eq('control_id', controlId)
    .order('created_at', { ascending: false })

  if (fullError) {
    if (fullError.message?.includes('verified_by') || fullError.code === '42703') {
      hasVerifiedBy = false
      const { data: simpleData, error: simpleError } = await supabase
        .from('evidence')
        .select(`*, controls (name)`)
        .eq('control_id', controlId)
        .order('created_at', { ascending: false })
      if (simpleError) throw simpleError
      data = simpleData ?? []
    } else {
      throw fullError
    }
  } else {
    data = fullData ?? []
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((e: any) => ({
    ...e,
    control_name: e.controls?.name,
    controls: undefined,
    verified: hasVerifiedBy ? !!e.verified_at : false,
    verified_by_name: hasVerifiedBy ? (e.verifier?.full_name ?? null) : null,
    verifier: undefined,
  }))
}

export async function createEvidence(evidence: {
  control_id: string
  title: string
  description?: string | null
  evidence_type: string
  evidence_url: string
  stage_acceptable?: 'stage_1' | 'stage_2' | 'both'
}): Promise<Evidence> {
  const supabase = createClient()

  const [{ data: organizationId, error: orgError }, { data: userId, error: userError }] = await Promise.all([
    supabase.rpc('get_user_organization_id'),
    supabase.rpc('get_current_user_id')
  ])
  if (orgError || !organizationId) throw orgError ?? new Error('Could not resolve organization')
  if (userError || !userId) throw userError ?? new Error('Could not resolve user')

  const insertData: EvidenceInsert = {
    organization_id: organizationId as string,
    control_id: evidence.control_id,
    title: evidence.title,
    description: evidence.description ?? null,
    evidence_type: evidence.evidence_type,
    evidence_url: evidence.evidence_url,
    stage_acceptable: evidence.stage_acceptable ?? 'stage_2',
    uploaded_by: userId as string
  }

  const { data, error } = await supabase
    .from('evidence')
    .insert(insertData as never)
    .select()
    .single()

  if (error) throw error
  return data as Evidence
}

export async function updateEvidence(id: string, updates: EvidenceUpdate): Promise<Evidence> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('evidence')
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Evidence
}

export async function deleteEvidence(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('evidence')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function verifyEvidence(id: string): Promise<Evidence> {
  const supabase = createClient()

  const [{ data: userId, error: userError }, { data: orgId, error: orgError }] = await Promise.all([
    supabase.rpc('get_current_user_id'),
    supabase.rpc('get_user_organization_id')
  ])
  if (userError || !userId) throw userError ?? new Error('Could not resolve user')
  if (orgError || !orgId) throw orgError ?? new Error('Could not resolve organization')

  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('evidence')
    .update({ verified_by: userId as string, verified_at: now } as never)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  // Log to approval_logs
  await supabase.from('approval_logs').insert({
    organization_id: orgId as string,
    object_type: 'evidence',
    object_id: id,
    action: 'verified',
    approved_by: userId as string,
  } as never)

  return data as Evidence
}

// Get unique control IDs that have evidence
export async function getControlsWithEvidence(): Promise<string[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('evidence')
    .select('control_id')

  if (error) throw error

  const evidenceList = (data ?? []) as { control_id: string }[]
  return [...new Set(evidenceList.map(e => e.control_id))]
}
