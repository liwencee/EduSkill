'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Star, StarOff, Eye, EyeOff, Trash2, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  jobId:      string
  isActive:   boolean
  isFeatured: boolean
}

export default function JobAdminActions({ jobId, isActive, isFeatured }: Props) {
  const [busy,     setBusy]     = useState(false)
  const [active,   setActive]   = useState(isActive)
  const [featured, setFeatured] = useState(isFeatured)
  const router = useRouter()

  async function toggle(field: 'is_active' | 'is_featured', current: boolean) {
    setBusy(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('job_listings')
      .update({ [field]: !current })
      .eq('id', jobId)
    if (error) {
      toast.error(error.message)
    } else {
      if (field === 'is_active') setActive(!current)
      else setFeatured(!current)
      toast.success(field === 'is_active'
        ? (!current ? 'Job activated' : 'Job deactivated')
        : (!current ? 'Marked as featured' : 'Removed from featured'))
      router.refresh()
    }
    setBusy(false)
  }

  async function deleteJob() {
    if (!confirm('Delete this job permanently? This cannot be undone.')) return
    setBusy(true)
    const supabase = createClient()
    const { error } = await supabase.from('job_listings').delete().eq('id', jobId)
    if (error) {
      toast.error(error.message)
      setBusy(false)
    } else {
      toast.success('Job deleted')
      router.refresh()
    }
  }

  return (
    <div className="flex items-center gap-1">
      {busy ? (
        <Loader2 className="w-4 h-4 animate-spin text-brand-inkLight" />
      ) : (
        <>
          <button onClick={() => toggle('is_featured', featured)} title={featured ? 'Remove featured' : 'Mark as featured'}
            className={`p-1.5 rounded-lg transition-colors ${featured ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'hover:bg-brand-bg text-brand-inkLight hover:text-amber-500'}`}>
            {featured ? <Star className="w-4 h-4 fill-amber-500 text-amber-500" /> : <StarOff className="w-4 h-4" />}
          </button>
          <button onClick={() => toggle('is_active', active)} title={active ? 'Deactivate job' : 'Activate job'}
            className={`p-1.5 rounded-lg transition-colors ${active ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'hover:bg-brand-bg text-brand-inkLight hover:text-green-600'}`}>
            {active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button onClick={deleteJob} title="Delete job"
            className="p-1.5 rounded-lg hover:bg-red-50 text-brand-inkLight hover:text-red-500 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  )
}
