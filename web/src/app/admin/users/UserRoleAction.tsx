'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Loader2, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'

const ROLES = ['youth', 'teacher', 'employer', 'admin', 'institutional']

interface Props {
  userId:      string
  currentRole: string
}

export default function UserRoleAction({ userId, currentRole }: Props) {
  const [role, setRole] = useState(currentRole)
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  async function changeRole(newRole: string) {
    if (newRole === role) return
    if (!confirm(`Change role to "${newRole}"?`)) return
    setBusy(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)
    if (error) toast.error(error.message)
    else {
      setRole(newRole)
      toast.success(`Role updated to ${newRole}`)
      router.refresh()
    }
    setBusy(false)
  }

  const ROLE_COLORS: Record<string, string> = {
    admin:         'bg-purple-100 text-purple-700 border-purple-200',
    employer:      'bg-blue-100   text-blue-700   border-blue-200',
    teacher:       'bg-green-100  text-green-700  border-green-200',
    youth:         'bg-amber-100  text-amber-700  border-amber-200',
    institutional: 'bg-teal-100   text-teal-700   border-teal-200',
  }

  if (busy) return <Loader2 className="w-4 h-4 animate-spin text-brand-inkLight" />

  return (
    <div className="relative inline-flex items-center gap-1">
      <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${ROLE_COLORS[role] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
        {role}
      </span>
      <div className="relative">
        <select
          value={role}
          onChange={e => changeRole(e.target.value)}
          className="opacity-0 absolute inset-0 w-6 h-full cursor-pointer text-xs">
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-brand-inkLight" />
      </div>
    </div>
  )
}
