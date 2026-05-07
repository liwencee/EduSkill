'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { UserRole } from '@/types'

export async function signupAction(formData: FormData) {
  const email    = (formData.get('email')    as string)?.trim()
  const password = formData.get('password')  as string
  const fullName = (formData.get('fullName') as string)?.trim()
  const role     = ((formData.get('role')    as string) || 'youth') as UserRole

  if (!password || password.length < 8) {
    redirect(
      `/auth/signup?error=${encodeURIComponent('Password must be at least 8 characters.')}&role=${role}`
    )
  }

  let supabase: ReturnType<typeof createClient>
  try {
    supabase = createClient()
  } catch {
    redirect(
      `/auth/signup?error=${encodeURIComponent('Server configuration error.')}&role=${role}`
    )
  }

  const { data, error } = await supabase!.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, role } },
  })

  if (error) {
    const msg = error.message.toLowerCase()
    let friendly = error.message
    if (msg.includes('already registered') || msg.includes('already exists')) {
      friendly = 'An account with this email already exists. Try logging in instead.'
    }
    redirect(
      `/auth/signup?error=${encodeURIComponent(friendly)}&role=${role}`
    )
  }

  if (data!.session) {
    // Email confirmation disabled — session set, go straight to dashboard
    redirect(`/dashboard/${role}`)
  }

  // Email confirmation required
  redirect('/auth/verify-email')
}
