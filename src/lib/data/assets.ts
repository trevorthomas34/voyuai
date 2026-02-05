import { createClient } from '@/lib/supabase/client'
import type { Tables, InsertTables, UpdateTables } from '@/types/supabase'

export type Asset = Tables<'assets'>
export type AssetInsert = InsertTables<'assets'>
export type AssetUpdate = UpdateTables<'assets'>

export async function getAssets(): Promise<Asset[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as Asset[]
}

export async function getAsset(id: string): Promise<Asset | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data as Asset
}

export async function createAsset(asset: {
  name: string
  asset_type: 'hardware' | 'software' | 'data' | 'service' | 'people'
  description?: string | null
  criticality?: 'low' | 'medium' | 'high' | 'critical'
  in_scope?: boolean
}): Promise<Asset> {
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

  const insertData: AssetInsert = {
    organization_id: organizationId,
    name: asset.name,
    asset_type: asset.asset_type,
    description: asset.description ?? null,
    criticality: asset.criticality ?? 'medium',
    in_scope: asset.in_scope ?? true
  }

  const { data, error } = await supabase
    .from('assets')
    .insert(insertData as never)
    .select()
    .single()

  if (error) throw error
  return data as Asset
}

export async function updateAsset(id: string, updates: AssetUpdate): Promise<Asset> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('assets')
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Asset
}

export async function deleteAsset(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('assets')
    .delete()
    .eq('id', id)

  if (error) throw error
}
