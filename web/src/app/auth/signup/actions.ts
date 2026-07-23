'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { UserRole } from '@/types'

export async function signupAction(formData: FormData) {
  const email    = (formData.get('email')    as string)?.trim().toLowerCase()
  const password = formData.get('password')  as string
  const fullName = (formData.get('fullName') as string)?.trim()
  const role     = ((formData.get('role')    as string) || 'youth') as UserRole

  if (!email) {
    redirect(`/auth/signup?error=${encodeURIComponent('Email is required.')}&role=${role}`)
  }
  if (!password || password.length < 8) {
    redirect(`/auth/signup?error=${encodeURIComponent('Password must be at least 8 characters.')}&role=${role}`)
  }

  let supabase: ReturnType<typeof createClient>
  try {
    supabase = createClient()
  } catch {
    redirect(`/auth/signup?error=${encodeURIComponent('Server configuration error. Please try again.')}&role=${role}`)
  }

  // ── 1. Create the auth user ─────────────────────────────────────────────
  const { data, error } = await supabase!.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName || email.split('@')[0], role },
    },
  })

  if (error) {
    const msg = error.message.toLowerCase()
    let friendly = 'Something went wrong. Please try again in a moment.'

    if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('user already')) {
      friendly = 'An account with this email already exists. Try logging in instead.'
    } else if (msg.includes('database error') || msg.includes('unexpected error')) {
      friendly = 'A server error occurred. Please wait a moment and try again.'
    } else if (msg.includes('invalid email')) {
      friendly = 'Please enter a valid email address.'
    } else if (msg.includes('weak password') || msg.includes('password')) {
      friendly = 'Password is too weak. Use at least 8 characters.'
    } else {
      console.error('[Skillora] Signup failed:', error)
    }

    redirect(`/auth/signup?error=${encodeURIComponent(friendly)}&role=${role}`)
  }

  // ── 2. Fallback: ensure profiles row exists ─────────────────────────────
  //    The handle_new_user trigger should have already done this, but if it
  //    was delayed or failed silently, this upsert guarantees the row exists.
  if (data?.user) {
    try {
      await supabase!.from('profiles').upsert({
        id:        data.user.id,
        full_name: fullName || email.split('@')[0] || 'User',
        email:     email,
        role:      role,
      }, { onConflict: 'id', ignoreDuplicates: true })
    } catch {
      // Non-fatal: profile will be created lazily on first login
    }
  }

  // ── 3. Redirect ─────────────────────────────────────────────────────────
  if (data?.session) {
    // Email confirmation disabled — session issued immediately
    redirect(`/dashboard/${role}`)
  }

  // Email confirmation required
  redirect('/auth/verify-email')
}
