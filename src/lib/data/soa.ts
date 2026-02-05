import { createClient } from '@/lib/supabase/client'
import type { Tables, InsertTables, UpdateTables } from '@/types/supabase'

export type SoARecord = Tables<'soa_records'>
export type SoARecordInsert = InsertTables<'soa_records'>
export type SoARecordUpdate = UpdateTables<'soa_records'>

// Extended SoA record type with control details
export interface SoARecordWithControl extends SoARecord {
  control_code: string
  control_name: string
  control_intent: string
  control_theme: 'organizational' | 'people' | 'physical' | 'technological'
  implementation_status: 'implemented' | 'partial' | 'gap' | 'not_applicable'
}

export async function getSoARecords(): Promise<SoARecordWithControl[]> {
  const supabase = createClient()

  // Get SoA records with control details
  const { data, error } = await supabase
    .from('soa_records')
    .select(`
      *,
      controls (
        control_id,
        name,
        intent,
        theme
      )
    `)
    .order('control_id', { ascending: true })

  if (error) throw error

  // Get organization controls for implementation status
  const { data: orgControls, error: orgError } = await supabase
    .from('organization_controls')
    .select('control_id, implementation_status')

  if (orgError) throw orgError

  const orgControlList = (orgControls ?? []) as { control_id: string; implementation_status: string }[]
  const statusMap = new Map(
    orgControlList.map(oc => [oc.control_id, oc.implementation_status])
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((record: any) => ({
    ...record,
    control_code: record.controls?.control_id ?? '',
    control_name: record.controls?.name ?? '',
    control_intent: record.controls?.intent ?? '',
    control_theme: record.controls?.theme ?? 'organizational',
    implementation_status: statusMap.get(record.control_id) ?? 'gap',
    controls: undefined
  }))
}

export async function updateSoARecord(id: string, updates: SoARecordUpdate): Promise<SoARecord> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('soa_records')
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as SoARecord
}

export async function lockSoAForAudit(): Promise<void> {
  const supabase = createClient()

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, organization_id')
    .eq('auth_user_id', user.id)
    .single()

  if (userError || !userData) throw userError ?? new Error('User not found')

  const userInfo = userData as { id: string; organization_id: string }
  const now = new Date().toISOString()

  const { error } = await supabase
    .from('soa_records')
    .update({
      locked_for_audit: true,
      locked_by: userInfo.id,
      locked_at: now,
      updated_at: now
    } as never)
    .eq('organization_id', userInfo.organization_id)

  if (error) throw error
}

export async function unlockSoARecord(id: string): Promise<SoARecord> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('soa_records')
    .update({
      locked_for_audit: false,
      locked_by: null,
      locked_at: null,
      updated_at: new Date().toISOString()
    } as never)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as SoARecord
}
