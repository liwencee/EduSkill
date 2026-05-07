'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { UserRole } from '@/types'

export type SignupState = { error: string | null }

export async function signupAction(
  _prevState: SignupState | null,
  formData: FormData,
): Promise<SignupState> {
  const fullName = (formData.get('fullName') as string)?.trim()
  const email    = (formData.get('email')    as string)?.trim()
  const password = formData.get('password')  as string
  const role     = (formData.get('role')     as UserRole) ?? 'youth'

  if (!password || password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }

  let supabase: ReturnType<typeof createClient>
  try {
    supabase = createClient()
  } catch (err: any) {
    return { error: err.message ?? 'Server configuration error. Please contact support.' }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, role } },
  })

  if (error) {
    const msg = error.message.toLowerCase()
    if (msg.includes('already registered') || msg.includes('already exists')) {
      return { error: 'An account with this email already exists. Try logging in instead.' }
    }
    return { error: error.message }
  }

  if (data.session) {
    // Email confirmation is disabled — session set server-side, redirect immediately
    redirect(`/dashboard/${role}`)
  }

  // Email confirmation required — send to verify-email page
  redirect('/auth/verify-email')
}
