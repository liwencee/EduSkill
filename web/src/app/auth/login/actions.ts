'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type LoginState = { error: string | null }

export async function loginAction(
  _prevState: LoginState | null,
  formData: FormData,
): Promise<LoginState> {
  const email    = (formData.get('email')    as string)?.trim()
  const password = formData.get('password')  as string
  const next     = (formData.get('next')     as string) || '/dashboard'

  let supabase: ReturnType<typeof createClient>
  try {
    supabase = createClient()
  } catch (err: any) {
    return { error: err.message ?? 'Server configuration error. Please contact support.' }
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    const msg = error.message.toLowerCase()
    if (msg.includes('email not confirmed')) {
      return { error: 'Please verify your email first — check your inbox for the confirmation link.' }
    }
    if (
      msg.includes('invalid login') ||
      msg.includes('invalid credentials') ||
      msg.includes('invalid email or password') ||
      msg.includes('wrong password')
    ) {
      return { error: 'Wrong email or password. Please try again.' }
    }
    return { error: error.message }
  }

  // Session is now set server-side via cookies — redirect to dashboard
  const role = data.user?.user_metadata?.role ?? 'youth'
  const destination = next !== '/dashboard' ? next : `/dashboard/${role}`
  redirect(destination)
}
