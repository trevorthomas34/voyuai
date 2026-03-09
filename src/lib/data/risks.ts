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

  const { data: organizationId, error: orgError } = await supabase.rpc('get_user_organization_id')
  if (orgError || !organizationId) throw orgError ?? new Error('Could not resolve organization')

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
  const response = await fetch('/api/risks/approve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ riskId: id, comment }),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to approve risk')
  }

  const { risk } = await response.json()
  return risk as Risk
}
