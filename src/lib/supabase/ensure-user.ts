import { createAdminClient } from './admin'

interface AppUser {
  id: string
  auth_user_id: string
  organization_id: string
  email: string
  full_name: string | null
  role: string
}

/**
 * Ensures a users + organizations row exists for the given auth user.
 * On first call for a new signup, creates both rows using the admin client
 * (bypasses RLS). Returns the app-level user record.
 */
export async function ensureUserExists(authUser: {
  id: string
  email?: string
  user_metadata?: { full_name?: string }
}): Promise<AppUser> {
  const admin = createAdminClient()

  // Check if user row already exists
  const { data: existing } = await admin
    .from('users')
    .select('id, auth_user_id, organization_id, email, full_name, role')
    .eq('auth_user_id', authUser.id)
    .single()

  if (existing) {
    return existing as AppUser
  }

  // Create organization for the new user
  const { data: org, error: orgError } = await admin
    .from('organizations')
    .insert({
      name: authUser.user_metadata?.full_name
        ? `${authUser.user_metadata.full_name}'s Organization`
        : 'My Organization',
    })
    .select('id')
    .single()

  if (orgError || !org) {
    throw new Error(`Failed to create organization: ${orgError?.message}`)
  }

  // Create user row linked to auth user and new org
  const { data: newUser, error: userError } = await admin
    .from('users')
    .insert({
      auth_user_id: authUser.id,
      organization_id: org.id,
      email: authUser.email ?? '',
      full_name: authUser.user_metadata?.full_name ?? null,
      role: 'admin',
    })
    .select('id, auth_user_id, organization_id, email, full_name, role')
    .single()

  if (userError || !newUser) {
    throw new Error(`Failed to create user: ${userError?.message}`)
  }

  return newUser as AppUser
}
