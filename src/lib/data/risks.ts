import { createClient } from '@/lib/supabase/client'
import type { Tables, InsertTables, UpdateTables } from '@/types/supabase'

export type Risk = Tables<'risks'>
export type RiskInsert = InsertTables<'risks'>
export type RiskUpdate = UpdateTables<'risks'>

// Extended risk type with asset name for display
export interface RiskWithAsset extends Risk {
  asset_name?: string
}

export async function getRisks(): Promise<RiskWithAsset[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('risks')
    .select(`
      *,
      assets (name)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((risk: any) => ({
    ...risk,
    asset_name: risk.assets?.name,
    assets: undefined
  }))
}

export async function getRisk(id: string): Promise<RiskWithAsset | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('risks')
    .select(`
      *,
      assets (name)
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const riskData = data as any
  return {
    ...riskData,
    asset_name: riskData.assets?.name,
    assets: undefined
  }
}

export async function createRisk(risk: {
  asset_id?: string | null
  threat: string
  vulnerability?: string | null
  impact: 'low' | 'medium' | 'high'
  likelihood: 'low' | 'medium' | 'high'
  risk_level: 'low' | 'medium' | 'high'
  treatment?: 'accept' | 'mitigate' | 'transfer' | 'avoid'
  treatment_plan?: string | null
}): Promise<Risk> {
  const supabase = createClient()

  // Get the current user's organization_id
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('organization_id')
    .eq('auth_user_id', user.id)
    .single()

  if (userError || !userData) throw userError ?? new Error('User not found')

  const organizationId = (userData as { organization_id: string }).organization_id

  const insertData: RiskInsert = {
    organization_id: organizationId,
    asset_id: risk.asset_id ?? null,
    threat: risk.threat,
    vulnerability: risk.vulnerability ?? null,
    impact: risk.impact,
    likelihood: risk.likelihood,
    risk_level: risk.risk_level,
    treatment: risk.treatment ?? 'mitigate',
    treatment_plan: risk.treatment_plan ?? null,
    status: 'draft'
  }

  const { data, error } = await supabase
    .from('risks')
    .insert(insertData as never)
    .select()
    .single()

  if (error) throw error
  return data as Risk
}

export async function updateRisk(id: string, updates: RiskUpdate): Promise<Risk> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('risks')
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Risk
}

export async function deleteRisk(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('risks')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function approveRisk(id: string, comment?: string): Promise<Risk> {
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

  // Update the risk
  const { data, error } = await supabase
    .from('risks')
    .update({
      status: 'approved',
      approved_by: userInfo.id,
      approved_at: now,
      updated_at: now
    } as never)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  // Create approval log entry
  await supabase
    .from('approval_logs')
    .insert({
      organization_id: userInfo.organization_id,
      object_type: 'risk',
      object_id: id,
      action: 'approved',
      approved_by: userInfo.id,
      comment: comment ?? null
    } as never)

  return data as Risk
}
