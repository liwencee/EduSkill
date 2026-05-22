import { createClient } from '@/lib/supabase/server'
import { Users, Search, Calendar, MapPin } from 'lucide-react'
import UserRoleAction from './UserRoleAction'

interface Props { searchParams: { q?: string; role?: string } }

const ROLE_COLORS: Record<string, string> = {
  admin:         'bg-purple-100 text-purple-700',
  employer:      'bg-blue-100   text-blue-700',
  teacher:       'bg-green-100  text-green-700',
  youth:         'bg-amber-100  text-amber-700',
  institutional: 'bg-teal-100   text-teal-700',
}

export default async function AdminUsersPage({ searchParams }: Props) {
  let users:  any[]  = []
  const counts = { total: 0, youth: 0, teacher: 0, employer: 0, admin: 0 }

  try {
    const supabase = createClient()

    // Counts
    const { data: allProfiles } = await supabase
      .from('profiles')
      .select('role')
    ;(allProfiles ?? []).forEach((p: any) => {
      counts.total++
      const r = p.role as keyof typeof counts
      if (r in counts) counts[r]++
    })

    // List
    let query = supabase
      .from('profiles')
      .select('id, full_name, email, role, avatar_url, state, phone, created_at, is_verified')
      .order('created_at', { ascending: false })

    if (searchParams.role && searchParams.role !== 'all')
      query = query.eq('role', searchParams.role)

    const { data } = await query.limit(200)
    let rows = data ?? []

    if (searchParams.q) {
      const q = searchParams.q.toLowerCase()
      rows = rows.filter((u: any) =>
        u.full_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.includes(q)
      )
    }

    users = rows
  } catch { /* DB unavailable */ }

  const filterRole = searchParams.role ?? ''

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-ink flex items-center gap-2">
          <Users className="w-6 h-6 text-brand-blue" /> Users
        </h1>
        <p className="text-sm text-brand-inkMid mt-1">
          {counts.total} total users
        </p>
      </div>

      {/* Role filter chips */}
      <div className="flex gap-2 flex-wrap mb-5">
        {[
          { val: '',         label: `All (${counts.total})`       },
          { val: 'youth',    label: `Youth (${counts.youth})`     },
          { val: 'teacher',  label: `Teachers (${counts.teacher})` },
          { val: 'employer', label: `Employers (${counts.employer})` },
          { val: 'admin',    label: `Admins (${counts.admin})`    },
        ].map(({ val, label }) => (
          <a key={val} href={`/admin/users?role=${val}${searchParams.q ? `&q=${searchParams.q}` : ''}`}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors ${
              filterRole === val
                ? 'bg-brand-blue text-white border-brand-blue'
                : 'border-[#D5D2C8] text-brand-inkMid hover:border-brand-blue hover:text-brand-blue'
            }`}>{label}</a>
        ))}
      </div>

      {/* Search */}
      <form method="GET" className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-inkLight" />
        <input name="q" type="text" defaultValue={searchParams.q}
          className="input pl-9 text-sm max-w-md" placeholder="Search name, email, phone…" />
        {searchParams.role && <input type="hidden" name="role" value={searchParams.role} />}
      </form>

      {/* Table */}
      {users.length === 0 ? (
        <div className="card p-16 text-center text-brand-inkLight">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-brand-ink">No users found</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E0DDD5] bg-brand-bg">
                  <th className="text-left px-4 py-3 font-semibold text-brand-inkMid text-xs uppercase tracking-wide">User</th>
                  <th className="text-left px-4 py-3 font-semibold text-brand-inkMid text-xs uppercase tracking-wide hidden md:table-cell">Contact</th>
                  <th className="text-left px-4 py-3 font-semibold text-brand-inkMid text-xs uppercase tracking-wide hidden lg:table-cell">Location</th>
                  <th className="text-left px-4 py-3 font-semibold text-brand-inkMid text-xs uppercase tracking-wide">Role</th>
                  <th className="text-left px-4 py-3 font-semibold text-brand-inkMid text-xs uppercase tracking-wide hidden sm:table-cell">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0DDD5]">
                {users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-brand-bg/50 transition-colors">
                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt={u.full_name}
                            className="w-9 h-9 rounded-full object-cover border border-[#E0DDD5] shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {u.full_name?.charAt(0) ?? 'U'}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-brand-ink">{u.full_name}</p>
                          <p className="text-xs text-brand-inkLight md:hidden">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    {/* Contact */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-brand-inkMid">{u.email}</p>
                      {u.phone && <p className="text-xs text-brand-inkLight">{u.phone}</p>}
                    </td>
                    {/* Location */}
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {u.state ? (
                        <span className="flex items-center gap-1 text-brand-inkMid">
                          <MapPin className="w-3 h-3" />{u.state}
                        </span>
                      ) : <span className="text-brand-inkLight">—</span>}
                    </td>
                    {/* Role (editable) */}
                    <td className="px-4 py-3">
                      <UserRoleAction userId={u.id} currentRole={u.role} />
                    </td>
                    {/* Joined */}
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="flex items-center gap-1 text-xs text-brand-inkLight">
                        <Calendar className="w-3 h-3" />
                        {new Date(u.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-[#E0DDD5] bg-brand-bg">
            <p className="text-xs text-brand-inkLight">
              Showing {users.length} user{users.length !== 1 ? 's' : ''}
              {filterRole ? ` with role "${filterRole}"` : ''}
              {searchParams.q ? ` matching "${searchParams.q}"` : ''}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
