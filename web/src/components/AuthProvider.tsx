'use client'
/**
 * AuthProvider — single source of truth for auth state across the whole app.
 *
 * Key design decision: loadUser() uses getSession() NOT getUser().
 *
 * getUser()    → live network call to Supabase Auth server to verify JWT.
 *               Unreliable immediately after a server-action login because the
 *               session cookie may not yet be visible to the Auth server edge
 *               cache. Returns null → RoleGuard fires redirect back to login.
 *
 * getSession() → reads the JWT from the in-memory/cookie store locally.
 *               No network call. Always sees the cookie the server just set.
 *               Perfect for "is someone logged in?" checks in the client.
 *
 * Security-sensitive server components (admin routes, DB writes) call
 * createClient().auth.getUser() independently to verify the JWT server-side.
 */
import {
  createContext, useContext, useEffect, useState, useCallback,
} from 'react'
import { createClient } from '@/lib/supabase/client'

export interface AuthUser {
  id:        string
  email:     string
  role:      string
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
  refresh:    () => Promise<void>
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
    try {
      const supabase = createClient()

      // ── Step 1: read session from cookie (no network call) ─────────────────
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setUser(null)
        setLoading(false)
        return
      }

      const authUser = session.user

      // ── Step 2: fetch the DB role (profiles is the canonical source) ───────
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
    } catch {
      // Any error → treat as logged out so the app never hangs on loading
      setUser(null)
    } finally {
      setLoading(false)   // always flip loading off
    }
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
