'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  const email    = (formData.get('email')    as string)?.trim()
  const password = formData.get('password')  as string
  const next     = (formData.get('next')     as string) || '/dashboard'

  let supabase: ReturnType<typeof createClient>
  try {
    supabase = createClient()
  } catch {
    redirect(
      `/auth/login?error=${encodeURIComponent('Server configuration error.')}&next=${encodeURIComponent(next)}`
    )
  }

  const { data, error } = await supabase!.auth.signInWithPassword({ email, password })

  if (error) {
    const msg = error.message.toLowerCase()
    let friendly = error.message
    if (msg.includes('email not confirmed')) {
      friendly = 'Please verify your email first — check your inbox.'
    } else if (
      msg.includes('invalid login') ||
      msg.includes('invalid credentials') ||
      msg.includes('invalid email or password')
    ) {
      friendly = 'Wrong email or password. Please try again.'
    }
    redirect(
      `/auth/login?error=${encodeURIComponent(friendly)}&next=${encodeURIComponent(next)}`
    )
  }

  // Session cookies are written by createClient's setAll → cookies().set()
  // which works correctly inside a Server Action.
  const role        = data!.user?.user_metadata?.role ?? 'youth'
  const destination = next !== '/dashboard' ? next : `/dashboard/${role}`
  redirect(destination)
}
