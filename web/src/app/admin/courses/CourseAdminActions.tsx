'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Pencil, Loader2, Check, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  courseId:    string
  isPublished: boolean
  isFree:      boolean
  priceNgn:    number
}

export default function CourseAdminActions({ courseId, isPublished, isFree, priceNgn }: Props) {
  const [busy,      setBusy]      = useState(false)
  const [published, setPublished] = useState(isPublished)
  const [editing,   setEditing]   = useState(false)
  const [priceDraft, setPriceDraft] = useState(String(priceNgn))
  const [freeDraft,  setFreeDraft]  = useState(isFree)
  const router = useRouter()

  async function togglePublished() {
    setBusy(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('courses')
      .update({ is_published: !published })
      .eq('id', courseId)
    if (error) {
      toast.error(error.message)
    } else {
      setPublished(!published)
      toast.success(!published ? 'Course published' : 'Course unpublished')
      router.refresh()
    }
    setBusy(false)
  }

  async function savePricing() {
    const price = freeDraft ? 0 : Number(priceDraft)
    if (!freeDraft && (Number.isNaN(price) || price < 0)) {
      toast.error('Enter a valid price')
      return
    }
    setBusy(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('courses')
      .update({ is_free: freeDraft, price_ngn: price })
      .eq('id', courseId)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Pricing updated')
      setEditing(false)
      router.refresh()
    }
    setBusy(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 bg-brand-bg rounded-xl px-2 py-1.5">
        <label className="flex items-center gap-1 text-xs text-brand-inkMid">
          <input type="checkbox" checked={freeDraft} onChange={e => setFreeDraft(e.target.checked)} />
          Free
        </label>
        {!freeDraft && (
          <input
            type="number" min={0} step={100}
            value={priceDraft} onChange={e => setPriceDraft(e.target.value)}
            className="w-20 text-xs border border-[#D5D2C8] rounded-lg px-2 py-1"
          />
        )}
        <button onClick={savePricing} disabled={busy} className="p-1 rounded-lg hover:bg-green-100 text-green-600">
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
        </button>
        <button onClick={() => setEditing(false)} disabled={busy} className="p-1 rounded-lg hover:bg-red-50 text-red-500">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      {busy ? (
        <Loader2 className="w-4 h-4 animate-spin text-brand-inkLight" />
      ) : (
        <>
          <button onClick={() => setEditing(true)} title="Edit pricing"
            className="p-1.5 rounded-lg hover:bg-brand-bg text-brand-inkLight hover:text-brand-blue transition-colors">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={togglePublished} title={published ? 'Unpublish' : 'Publish'}
            className={`p-1.5 rounded-lg transition-colors ${published ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'hover:bg-brand-bg text-brand-inkLight hover:text-green-600'}`}>
            {published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </>
      )}
    </div>
  )
}
