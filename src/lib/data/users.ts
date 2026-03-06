import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/types/supabase'

export type OrgUser = Pick<Tables<'users'>, 'id' | 'email' | 'full_name' | 'role'>

export async function getOrganizationUsers(): Promise<OrgUser[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('users')
    .select('id, email, full_name, role')
    .order('full_name', { ascending: true })

  if (error) throw error
  return (data ?? []) as OrgUser[]
}

export async function getCurrentUser(): Promise<(OrgUser & { organization_id: string }) | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('users')
    .select('id, email, full_name, role, organization_id')
    .eq('auth_user_id', user.id)
    .single()

  if (error || !data) return null
  return data as OrgUser & { organization_id: string }
}

export async function getCurrentUserRole(): Promise<string | null> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_current_user_role')
  if (error) return null
  return data as string | null
}
