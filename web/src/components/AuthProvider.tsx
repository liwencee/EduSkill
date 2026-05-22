'use client'
/**
 * AuthProvider — single source of truth for auth state across the whole app.
 *
 * Wraps the root layout so every page can call useAuth() and get the
 * current user + their DB role instantly, without making a fresh DB
 * round-trip on every page navigation.
 */
import {
  createContext, useContext, useEffect, useState, useCallback,
} from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export interface AuthUser {
  id:        string
  email:     string
  role:      string          // from profiles table — always up to date
  fullName:  string
  avatarUrl: string | null
}

interface AuthContextType {
  user:       AuthUser | null
  loading:    boolean
  isEmployer: boolean
  isTeacher:  boolean
  isAdmin:    boolean
  isYouth:    boolean
  refresh:    () => Promise<void>  // call after a role switch
}

const AuthContext = createContext<AuthContextType>({
  user:       null,
  loading:    true,
  isEmployer: false,
  isTeacher:  false,
  isAdmin:    false,
  isYouth:    false,
  refresh:    async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) {
      setUser(null)
      setLoading(false)
      return
    }

    // Read role from profiles table — this is the canonical source
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name, avatar_url')
      .eq('id', authUser.id)
      .single()

    setUser({
      id:        authUser.id,
      email:     authUser.email ?? '',
      role:      profile?.role
                   ?? (authUser.user_metadata?.role as string)
                   ?? 'youth',
      fullName:  profile?.full_name
                   ?? (authUser.user_metadata?.full_name as string)
                   ?? '',
      avatarUrl: profile?.avatar_url ?? null,
    })
    setLoading(false)
  }, [])

  useEffect(() => {
    loadUser()

    // Re-load whenever the session changes (sign-in / sign-out / token refresh)
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) { setUser(null); setLoading(false) }
        else           loadUser()
      }
    )
    return () => subscription.unsubscribe()
  }, [loadUser])

  const role = user?.role ?? ''

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isEmployer: role === 'employer',
      isTeacher:  role === 'teacher',
      isAdmin:    role === 'admin',
      isYouth:    role === 'youth',
      refresh:    loadUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
