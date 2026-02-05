import { createClient } from '@/lib/supabase/client'
import type { Tables, InsertTables, UpdateTables } from '@/types/supabase'

export type Evidence = Tables<'evidence'>
export type EvidenceInsert = InsertTables<'evidence'>
export type EvidenceUpdate = UpdateTables<'evidence'>

// Extended evidence type for display
export interface EvidenceWithDetails extends Evidence {
  control_name?: string
  uploaded_by_name?: string
  verified?: boolean // Not in DB, computed from verification status
}

export async function getEvidence(): Promise<EvidenceWithDetails[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('evidence')
    .select(`
      *,
      controls (name)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((e: any) => ({
    ...e,
    control_name: e.controls?.name,
    controls: undefined,
    // For now, consider all evidence as unverified - verification could be a separate table
    verified: false
  }))
}

export async function getEvidenceByControl(controlId: string): Promise<EvidenceWithDetails[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('evidence')
    .select(`
      *,
      controls (name)
    `)
    .eq('control_id', controlId)
    .order('created_at', { ascending: false })

  if (error) throw error

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((e: any) => ({
    ...e,
    control_name: e.controls?.name,
    controls: undefined,
    verified: false
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

  // Get the current user's info
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, organization_id')
    .eq('auth_user_id', user.id)
    .single()

  if (userError || !userData) throw userError ?? new Error('User not found')

  const userInfo = userData as { id: string; organization_id: string }

  const insertData: EvidenceInsert = {
    organization_id: userInfo.organization_id,
    control_id: evidence.control_id,
    title: evidence.title,
    description: evidence.description ?? null,
    evidence_type: evidence.evidence_type,
    evidence_url: evidence.evidence_url,
    stage_acceptable: evidence.stage_acceptable ?? 'stage_2',
    uploaded_by: userInfo.id
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
