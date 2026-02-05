import { createClient } from '@/lib/supabase/client'
import type { Tables, InsertTables, UpdateTables } from '@/types/supabase'

export type Control = Tables<'controls'>
export type OrganizationControl = Tables<'organization_controls'>
export type OrganizationControlInsert = InsertTables<'organization_controls'>
export type OrganizationControlUpdate = UpdateTables<'organization_controls'>

// Combined control type for display
export interface ControlWithStatus extends Control {
  applicable: boolean
  justification: string | null
  implementation_status: 'implemented' | 'partial' | 'gap' | 'not_applicable'
  org_control_id?: string // The organization_controls record ID
}

export async function getControls(): Promise<Control[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('controls')
    .select('*')
    .order('control_id', { ascending: true })

  if (error) throw error
  return (data ?? []) as Control[]
}

export async function getOrganizationControls(): Promise<ControlWithStatus[]> {
  const supabase = createClient()

  // Get all controls
  const { data: controls, error: controlsError } = await supabase
    .from('controls')
    .select('*')
    .order('control_id', { ascending: true })

  if (controlsError) throw controlsError

  // Get organization-specific control settings
  const { data: orgControls, error: orgError } = await supabase
    .from('organization_controls')
    .select('*')

  if (orgError) throw orgError

  // Create a map for quick lookup
  const orgControlList = (orgControls ?? []) as OrganizationControl[]
  const orgControlMap = new Map(
    orgControlList.map(oc => [oc.control_id, oc])
  )

  // Combine controls with organization-specific settings
  const controlList = (controls ?? []) as Control[]
  return controlList.map(control => {
    const orgControl = orgControlMap.get(control.id)
    return {
      ...control,
      applicable: orgControl?.applicable ?? true,
      justification: orgControl?.justification ?? null,
      implementation_status: orgControl?.implementation_status ?? 'gap',
      org_control_id: orgControl?.id
    }
  })
}

export async function updateOrganizationControl(
  controlId: string,
  updates: Partial<Pick<OrganizationControl, 'applicable' | 'justification' | 'implementation_status'>>
): Promise<OrganizationControl> {
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

  const upsertData: OrganizationControlInsert = {
    organization_id: organizationId,
    control_id: controlId,
    applicable: updates.applicable ?? true,
    justification: updates.justification ?? null,
    implementation_status: updates.implementation_status ?? 'gap'
  }

  // Try to update existing record, or create if doesn't exist (upsert)
  const { data, error } = await supabase
    .from('organization_controls')
    .upsert(upsertData as never, {
      onConflict: 'organization_id,control_id'
    })
    .select()
    .single()

  if (error) throw error
  return data as OrganizationControl
}

// Get control stats for dashboard
export interface ControlStats {
  total: number
  applicable: number
  notApplicable: number
  implemented: number
  partial: number
  gap: number
}

export async function getControlStats(): Promise<ControlStats> {
  const controls = await getOrganizationControls()

  const applicable = controls.filter(c => c.applicable)

  return {
    total: controls.length,
    applicable: applicable.length,
    notApplicable: controls.length - applicable.length,
    implemented: applicable.filter(c => c.implementation_status === 'implemented').length,
    partial: applicable.filter(c => c.implementation_status === 'partial').length,
    gap: applicable.filter(c => c.implementation_status === 'gap').length
  }
}
