'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import TeacherBadge from '@/components/TeacherBadge'
import {
  Send, Video, DollarSign, CheckCircle, Clock, Star,
  MessageSquare, ArrowLeft, Loader2, AlertCircle, BadgeCheck,
  Award, Users, Shield, CreditCard, HandshakeIcon,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────

type NegStatus =
  | 'open' | 'teacher_offered' | 'employer_offered'
  | 'agreed' | 'payment_pending' | 'in_progress'
  | 'completed' | 'cancelled' | 'disputed'

interface Message {
  id: string
  sender_id: string
  message_type: 'message' | 'offer' | 'counter_offer' | 'accept' | 'reject' | 'system'
  body?: string
  offered_rate_ngn?: number
  offered_rate_type?: string
  offered_duration?: string
  offered_start_date?: string
  created_at: string
  sender?: { id: string; full_name: string; avatar_url?: string }
}

interface Props {
  negotiation: any
  initialMessages: Message[]
  currentUserId: string
  currentUserRole: string
}

const RATE_TYPES = [
  { value: 'hourly',   label: 'Per Hour',         suffix: '/hr'   },
  { value: 'daily',    label: 'Per Day',           suffix: '/day'  },
  { value: 'weekly',   label: 'Per Week',          suffix: '/wk'   },
  { value: 'monthly',  label: 'Per Month',         suffix: '/mo'   },
  { value: 'per_term', label: 'Per School Term',   suffix: '/term' },
  { value: 'fixed',    label: 'Fixed / One-off',   suffix: ' fixed'},
]

const DURATIONS = [
  '1 Week', '2 Weeks', '1 Month', '3 Months', '6 Months',
  '1 School Term', '2 School Terms', 'Full Academic Year', 'Ongoing',
]

const STATUS_STEPS: { key: NegStatus; label: string; icon: React.ElementType }[] = [
  { key: 'open',            label: 'Negotiating',   icon: MessageSquare },
  { key: 'agreed',          label: 'Terms Agreed',  icon: HandshakeIcon },
  { key: 'payment_pending', label: 'Payment',       icon: CreditCard    },
  { key: 'in_progress',     label: 'In Progress',   icon: Clock         },
  { key: 'completed',       label: 'Completed',     icon: CheckCircle   },
]

const stepIndex = (s: NegStatus) => {
  const order: NegStatus[] = ['open','teacher_offered','employer_offered','agreed','payment_pending','in_progress','completed']
  return order.indexOf(s)
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function NegotiateClient({
  negotiation: initialNeg, initialMessages, currentUserId, currentUserRole,
}: Props) {
  const supabase = createClient()
  const isEmployer = currentUserRole === 'employer'
  const isTeacher  = currentUserRole === 'teacher'

  const [neg,        setNeg]        = useState(initialNeg)
  const [messages,   setMessages]   = useState<Message[]>(initialMessages)
  const [text,       setText]       = useState('')
  const [sending,    setSending]    = useState(false)
  const [showOffer,  setShowOffer]  = useState(false)
  const [offerRate,  setOfferRate]  = useState<string>('')
  const [offerType,  setOfferType]  = useState('hourly')
  const [offerDur,   setOfferDur]   = useState('')
  const [offerDate,  setOfferDate]  = useState('')
  const [confLoading,setConfLoading]= useState(false)
  const [rating,     setRating]     = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [submittingRating, setSubmittingRating] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)

  const job            = neg.job
  const teacherProfile = Array.isArray(neg.teacher_profile) ? neg.teacher_profile[0] : neg.teacher_profile
  const teacher        = Array.isArray(neg.teacher) ? neg.teacher[0] : neg.teacher
  const employer       = Array.isArray(neg.employer) ? neg.employer[0] : neg.employer

  const otherParty     = isEmployer ? teacher : employer
  const status: NegStatus = neg.status ?? 'open'

  // ── Scroll to bottom on new messages ────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Supabase Realtime subscription ──────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel(`neg-${neg.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'negotiation_messages',
        filter: `negotiation_id=eq.${neg.id}`,
      }, async (payload) => {
        // Fetch full message with sender
        const { data } = await supabase
          .from('negotiation_messages')
          .select('*, sender:profiles(id, full_name, avatar_url)')
          .eq('id', payload.new.id)
          .single()
        if (data) setMessages(prev => [...prev, data as Message])
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'job_negotiations',
        filter: `id=eq.${neg.id}`,
      }, (payload) => {
        setNeg((prev: any) => ({ ...prev, ...payload.new }))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [neg.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Send plain message ───────────────────────────────────────────────────────
  async function sendMessage() {
    if (!text.trim()) return
    setSending(true)
    const { error } = await supabase.from('negotiation_messages').insert({
      negotiation_id: neg.id,
      sender_id:      currentUserId,
      message_type:   'message',
      body:           text.trim(),
    })
    if (error) toast.error(error.message)
    else setText('')
    setSending(false)
  }

  // ── Send offer / counter-offer ───────────────────────────────────────────────
  async function sendOffer() {
    const rate = parseFloat(offerRate)
    if (!rate || rate <= 0) { toast.error('Enter a valid rate amount'); return }
    if (!offerType) { toast.error('Select rate type'); return }

    setSending(true)

    const messageType = isTeacher
      ? (neg.status === 'open' ? 'offer' : 'counter_offer')
      : 'counter_offer'

    const newStatus: NegStatus = isTeacher ? 'teacher_offered' : 'employer_offered'

    const [msgRes, negRes] = await Promise.all([
      supabase.from('negotiation_messages').insert({
        negotiation_id:    neg.id,
        sender_id:         currentUserId,
        message_type:      messageType,
        body:              text.trim() || null,
        offered_rate_ngn:  rate,
        offered_rate_type: offerType,
        offered_duration:  offerDur || null,
        offered_start_date: offerDate || null,
      }),
      supabase.from('job_negotiations').update({
        status:            newStatus,
        last_offer_by:     currentUserId,
        agreed_rate_ngn:   rate,
        agreed_rate_type:  offerType,
        agreed_duration:   offerDur || null,
        agreed_start_date: offerDate || null,
      }).eq('id', neg.id),
    ])

    if (msgRes.error) toast.error(msgRes.error.message)
    else {
      toast.success('Offer sent!')
      setShowOffer(false)
      setOfferRate('')
      setOfferDur('')
      setOfferDate('')
      setText('')
    }
    setSending(false)
  }

  // ── Accept current offer ─────────────────────────────────────────────────────
  async function acceptOffer() {
    setSending(true)

    const [msgRes, negRes] = await Promise.all([
      supabase.from('negotiation_messages').insert({
        negotiation_id: neg.id,
        sender_id:      currentUserId,
        message_type:   'accept',
        body:           `${isEmployer ? 'Employer' : 'Teacher'} accepted the offer. ✓`,
      }),
      supabase.from('job_negotiations').update({
        status:   'agreed',
        agreed_at: new Date().toISOString(),
        ...(isTeacher  ? { teacher_accepted_at:  new Date().toISOString() } : {}),
        ...(isEmployer ? { employer_accepted_at: new Date().toISOString() } : {}),
      }).eq('id', neg.id),
    ])

    if (msgRes.error || negRes.error) {
      toast.error('Failed to accept offer')
    } else {
      toast.success('Terms agreed! Proceed to payment to confirm the session.')
    }
    setSending(false)
  }

  // ── Generate video conference room ───────────────────────────────────────────
  async function generateConference() {
    setConfLoading(true)
    try {
      const res = await fetch('/api/conference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ negotiation_id: neg.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      setNeg((prev: any) => ({ ...prev, meeting_room_url: data.url }))
      toast.success('Meeting room created!')
    } catch (err: any) {
      toast.error(err.message)
    }
    setConfLoading(false)
  }

  // ── Mark job done (teacher) ──────────────────────────────────────────────────
  async function markJobDone() {
    const { error } = await supabase
      .from('job_negotiations')
      .update({ teacher_marked_done_at: new Date().toISOString() })
      .eq('id', neg.id)
    if (error) toast.error(error.message)
    else toast.success('Marked as done — waiting for employer confirmation.')
  }

  // ── Confirm done + trigger payout (employer) ─────────────────────────────────
  async function confirmDone() {
    const { error } = await supabase
      .from('job_negotiations')
      .update({
        employer_confirmed_done_at: new Date().toISOString(),
        status: 'completed',
        payment_status: 'released',
        payment_released_at: new Date().toISOString(),
      })
      .eq('id', neg.id)
    if (error) toast.error(error.message)
    else toast.success('Payment released to teacher! Thank you.')

    // Update teacher stats
    await supabase.rpc('refresh_teacher_rating', { t_id: neg.teacher_id })
  }

  // ── Submit rating ────────────────────────────────────────────────────────────
  async function submitRating() {
    if (rating < 1) { toast.error('Select a star rating'); return }
    setSubmittingRating(true)
    const field = isEmployer ? 'employer_rating' : 'teacher_rating'
    const reviewField = isEmployer ? 'employer_review' : 'teacher_review'

    const { error } = await supabase
      .from('job_negotiations')
      .update({ [field]: rating, [reviewField]: reviewText.trim() || null })
      .eq('id', neg.id)

    if (error) toast.error(error.message)
    else {
      toast.success('Rating submitted!')
      if (isEmployer) await supabase.rpc('refresh_teacher_rating', { t_id: neg.teacher_id })
    }
    setSubmittingRating(false)
  }

  const canMakeOffer = ['open','teacher_offered','employer_offered'].includes(status)
  const canAccept    = (
    (status === 'teacher_offered' && isEmployer) ||
    (status === 'employer_offered' && isTeacher)
  ) && neg.last_offer_by !== currentUserId

  const rateSuffix = RATE_TYPES.find(r => r.value === neg.agreed_rate_type)?.suffix ?? ''

  return (
    <div className="min-h-screen bg-[#EBF4FF]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        <Link href={isEmployer ? '/employer/applicants' : '/dashboard/teacher'}
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        {/* ── Progress bar ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 mb-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            {STATUS_STEPS.map((step, i) => {
              const current = stepIndex(status)
              const stepI   = stepIndex(step.key)
              const done    = current >= stepI
              const Icon    = step.icon
              return (
                <div key={step.key} className="flex items-center gap-2 shrink-0">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                    done ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                    {step.label}
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`w-6 h-0.5 rounded ${done ? 'bg-blue-400' : 'bg-gray-200'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">

          {/* ── Chat column ─────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 flex flex-col">

            {/* Header */}
            <div className="bg-gradient-to-r from-[#1E4F8A] to-[#378ADD] rounded-t-2xl px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                  {otherParty?.full_name?.charAt(0) ?? '?'}
                </div>
                <div>
                  <p className="font-bold">{otherParty?.full_name ?? 'Other Party'}</p>
                  <p className="text-xs text-white/70">{isEmployer ? 'Teacher' : 'Employer'} · {job?.company_name ?? ''}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xs text-white/60">Job</p>
                  <p className="text-sm font-semibold line-clamp-1">{job?.title}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 bg-white border-x border-blue-100 p-4 overflow-y-auto min-h-[360px] max-h-[480px] space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-10 text-gray-400">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No messages yet. Start the negotiation!</p>
                </div>
              )}

              {messages.map(msg => {
                const isMine = msg.sender_id === currentUserId
                const senderName = (Array.isArray(msg.sender) ? msg.sender[0] : msg.sender)?.full_name ?? 'User'
                const isOffer = ['offer','counter_offer'].includes(msg.message_type)
                const isAccept = msg.message_type === 'accept'
                const isSystem = msg.message_type === 'system'

                if (isSystem) {
                  return (
                    <div key={msg.id} className="text-center">
                      <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full">{msg.body}</span>
                    </div>
                  )
                }

                if (isAccept) {
                  return (
                    <div key={msg.id} className="text-center">
                      <span className="inline-flex items-center gap-1.5 text-xs bg-green-50 text-green-700 font-bold px-3 py-1.5 rounded-full border border-green-200">
                        <CheckCircle className="w-3.5 h-3.5" /> {msg.body}
                      </span>
                    </div>
                  )
                }

                return (
                  <div key={msg.id} className={`flex gap-2 ${isMine ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${isMine ? 'bg-blue-600' : 'bg-orange-500'}`}>
                      {senderName.charAt(0)}
                    </div>
                    <div className={`max-w-[75%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      {isOffer && (
                        <div className={`rounded-2xl p-3 border-2 ${isMine ? 'bg-blue-600 border-blue-700 text-white rounded-tr-sm' : 'bg-amber-50 border-amber-200 text-amber-900 rounded-tl-sm'}`}>
                          <p className={`text-xs font-bold mb-1 ${isMine ? 'text-blue-200' : 'text-amber-600'}`}>
                            {msg.message_type === 'offer' ? '💰 Offer' : '🔄 Counter-Offer'}
                          </p>
                          <p className="text-xl font-bold">
                            ₦{Number(msg.offered_rate_ngn).toLocaleString()}
                            <span className="text-sm font-normal opacity-75 ml-1">
                              {RATE_TYPES.find(r => r.value === msg.offered_rate_type)?.suffix ?? ''}
                            </span>
                          </p>
                          {msg.offered_duration && (
                            <p className={`text-xs mt-0.5 ${isMine ? 'text-blue-200' : 'text-amber-700'}`}>
                              Duration: {msg.offered_duration}
                            </p>
                          )}
                          {msg.offered_start_date && (
                            <p className={`text-xs ${isMine ? 'text-blue-200' : 'text-amber-700'}`}>
                              Start: {new Date(msg.offered_start_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          )}
                          {msg.body && (
                            <p className={`text-xs mt-2 pt-2 border-t ${isMine ? 'border-blue-500 text-blue-100' : 'border-amber-300 text-amber-800'}`}>
                              {msg.body}
                            </p>
                          )}
                        </div>
                      )}
                      {!isOffer && msg.body && (
                        <div className={`rounded-2xl px-4 py-2.5 text-sm ${isMine ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-blue-100 text-gray-800 rounded-tl-sm'}`}>
                          {msg.body}
                        </div>
                      )}
                      <p className="text-xs text-gray-400 px-1">
                        {new Date(msg.created_at).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* Accept offer banner */}
            {canAccept && (
              <div className="bg-amber-50 border-x border-amber-200 px-4 py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-amber-800">
                    {neg.last_offer_by !== currentUserId ? 'Incoming offer:' : ''}
                    {' '}₦{Number(neg.agreed_rate_ngn).toLocaleString()}{rateSuffix}
                    {neg.agreed_duration ? ` · ${neg.agreed_duration}` : ''}
                  </p>
                  <p className="text-xs text-amber-600">Accept this offer to proceed to payment</p>
                </div>
                <button onClick={acceptOffer} disabled={sending}
                  className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors disabled:opacity-60">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Accept
                </button>
              </div>
            )}

            {/* Offer form */}
            {showOffer && canMakeOffer && (
              <div className="bg-blue-50 border-x border-blue-200 px-4 py-4 space-y-3">
                <p className="text-sm font-bold text-blue-800">
                  {isTeacher ? 'Your Offer' : 'Counter-Offer'}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-blue-700 font-medium mb-1 block">Rate (₦) *</label>
                    <input type="number" min="0" placeholder="e.g. 5000"
                      className="input text-sm" value={offerRate}
                      onChange={e => setOfferRate(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-blue-700 font-medium mb-1 block">Rate Type *</label>
                    <select className="input text-sm" value={offerType}
                      onChange={e => setOfferType(e.target.value)}>
                      {RATE_TYPES.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-blue-700 font-medium mb-1 block">Duration</label>
                    <select className="input text-sm" value={offerDur}
                      onChange={e => setOfferDur(e.target.value)}>
                      <option value="">Select duration</option>
                      {DURATIONS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-blue-700 font-medium mb-1 block">Start Date</label>
                    <input type="date" className="input text-sm" value={offerDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => setOfferDate(e.target.value)} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowOffer(false)}
                    className="px-4 py-2 text-sm text-blue-600 border border-blue-200 rounded-xl hover:bg-white transition-colors">
                    Cancel
                  </button>
                  <button onClick={sendOffer} disabled={sending}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60">
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Send Offer
                  </button>
                </div>
              </div>
            )}

            {/* Message input */}
            {!['completed','cancelled'].includes(status) && (
              <div className="bg-white rounded-b-2xl border border-blue-100 px-4 py-3 flex gap-2 items-end">
                <textarea rows={2}
                  className="flex-1 resize-none text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={canMakeOffer ? 'Type a message or click Make Offer…' : 'Type a message…'}
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                />
                {canMakeOffer && (
                  <button onClick={() => setShowOffer(v => !v)}
                    className="px-3 py-2 text-xs font-bold text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors whitespace-nowrap">
                    <DollarSign className="w-4 h-4 inline -mt-0.5" /> Offer
                  </button>
                )}
                <button onClick={sendMessage} disabled={sending || !text.trim()}
                  className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>

          {/* ── Right Panel ───────────────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Agreed Terms card */}
            {neg.agreed_rate_ngn && (
              <div className={`rounded-2xl border p-4 shadow-sm ${
                status === 'agreed' || stepIndex(status) > stepIndex('agreed')
                  ? 'bg-green-50 border-green-200'
                  : 'bg-white border-blue-100'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <HandshakeIcon className="w-5 h-5 text-green-600" />
                  <p className="font-bold text-[#1E4F8A] text-sm">
                    {stepIndex(status) >= stepIndex('agreed') ? 'Agreed Terms' : 'Latest Offer'}
                  </p>
                  {stepIndex(status) >= stepIndex('agreed') && (
                    <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Rate</span>
                    <span className="font-bold text-[#1E4F8A]">
                      ₦{Number(neg.agreed_rate_ngn).toLocaleString()}{rateSuffix}
                    </span>
                  </div>
                  {neg.agreed_duration && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duration</span>
                      <span className="font-medium">{neg.agreed_duration}</span>
                    </div>
                  )}
                  {neg.agreed_start_date && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Start</span>
                      <span className="font-medium">
                        {new Date(neg.agreed_start_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                  {neg.escrow_amount_ngn && (
                    <>
                      <hr className="border-green-200" />
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Platform fee (10%)</span>
                        <span>₦{Number(neg.platform_fee_ngn).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-xs">Teacher payout</span>
                        <span className="font-bold text-green-700">
                          ₦{Number(neg.teacher_payout_ngn).toLocaleString()}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Payment / Escrow section — shown after agreement */}
            {status === 'agreed' && isEmployer && (
              <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <p className="font-bold text-[#1E4F8A] text-sm">Escrow Payment</p>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  Pay securely. Funds are held by Skillora and released to the teacher only after you confirm the job is done.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">
                      A <strong>10% platform fee</strong> is added to your payment. The teacher receives 90% upon completion.
                    </p>
                  </div>
                </div>
                {neg.agreed_rate_ngn && (
                  <div className="text-sm text-gray-700 mb-4 space-y-1">
                    <div className="flex justify-between">
                      <span>Agreed amount</span>
                      <span>₦{Number(neg.agreed_rate_ngn).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-400 text-xs">
                      <span>Platform fee (10%)</span>
                      <span>₦{Math.round(neg.agreed_rate_ngn * 0.1).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-1">
                      <span>You pay</span>
                      <span>₦{Math.round(neg.agreed_rate_ngn * 1.1).toLocaleString()}</span>
                    </div>
                  </div>
                )}
                <a
                  href={`https://paystack.com/pay/eduskill?amount=${Math.round((neg.agreed_rate_ngn ?? 0) * 1.1 * 100)}&ref=${neg.id}&email=${employer?.email ?? ''}&metadata=${encodeURIComponent(JSON.stringify({ negotiation_id: neg.id, type: 'escrow' }))}`}
                  target="_blank" rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-3 rounded-xl transition-colors text-sm">
                  <CreditCard className="w-4 h-4" />
                  Pay via Paystack (Escrow)
                </a>
              </div>
            )}

            {/* Video Conference section */}
            {['agreed','payment_pending','in_progress','completed'].includes(status) && (
              <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Video className="w-5 h-5 text-blue-600" />
                  <p className="font-bold text-[#1E4F8A] text-sm">Video Session</p>
                  <span className="ml-auto text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                    Powered by Daily.co / Jitsi
                  </span>
                </div>

                {neg.meeting_room_url ? (
                  <div className="space-y-3">
                    <div className="bg-blue-50 rounded-xl p-3">
                      <p className="text-xs text-blue-600 font-medium mb-1">Meeting Link</p>
                      <p className="text-xs text-gray-600 break-all font-mono">{neg.meeting_room_url}</p>
                    </div>
                    <a href={neg.meeting_room_url} target="_blank" rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-3 rounded-xl transition-colors text-sm">
                      <Video className="w-4 h-4" />
                      Join Video Session
                    </a>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500">
                      Generate a private video room for this session. Both parties can join with one click.
                    </p>
                    <button onClick={generateConference} disabled={confLoading}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl transition-colors text-sm disabled:opacity-60">
                      {confLoading
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating room…</>
                        : <><Video className="w-4 h-4" /> Generate Meeting Link</>}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mark done / Confirm buttons */}
            {status === 'in_progress' && isTeacher && !neg.teacher_marked_done_at && (
              <button onClick={markJobDone}
                className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-3 rounded-xl transition-colors text-sm">
                <CheckCircle className="w-4 h-4" /> Mark Job as Done
              </button>
            )}

            {status === 'in_progress' && isTeacher && neg.teacher_marked_done_at && (
              <div className="bg-amber-50 rounded-2xl border border-amber-200 p-3 text-xs text-amber-700 text-center font-medium">
                ✓ You marked this done — waiting for employer confirmation
              </div>
            )}

            {status === 'in_progress' && isEmployer && neg.teacher_marked_done_at && !neg.employer_confirmed_done_at && (
              <button onClick={confirmDone}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-3 rounded-xl transition-colors text-sm">
                <CheckCircle className="w-4 h-4" /> Confirm & Release Payment
              </button>
            )}

            {/* Teacher profile card */}
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Teacher Profile</p>
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  {teacher?.avatar_url ? (
                    <img src={teacher.avatar_url} alt={teacher.full_name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-blue-100" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      {teacher?.full_name?.charAt(0) ?? 'T'}
                    </div>
                  )}
                  {(teacherProfile?.has_badge || teacherProfile?.kyc_status === 'approved') && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center">
                      <BadgeCheck className="w-3 h-3 text-white" />
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-bold text-[#1E4F8A] text-sm">{teacher?.full_name}</p>
                  {teacherProfile?.teacher_uid && (
                    <p className="text-xs font-mono text-blue-500">{teacherProfile.teacher_uid}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-gray-600">
                {teacherProfile?.cert_type && (
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-blue-400" />
                    <span>{teacherProfile.cert_type}</span>
                    {teacherProfile.cert_verified && <span className="text-green-500 font-bold">✓</span>}
                  </div>
                )}
                {teacherProfile?.years_of_service > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-orange-400" />
                    <span>{teacherProfile.years_of_service} yrs experience</span>
                  </div>
                )}
                {teacherProfile?.avg_rating > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="font-bold">{teacherProfile.avg_rating.toFixed(1)}</span>
                    <span className="text-gray-400">({teacherProfile.total_ratings} rating{teacherProfile.total_ratings !== 1 ? 's' : ''})</span>
                  </div>
                )}
                {teacherProfile?.total_jobs_completed > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-green-400" />
                    <span>{teacherProfile.total_jobs_completed} jobs completed</span>
                  </div>
                )}
              </div>

              <div className="mt-3">
                <TeacherBadge
                  hasBadge={teacherProfile?.has_badge}
                  kycStatus={teacherProfile?.kyc_status}
                  badgeType={teacherProfile?.badge_type}
                  certVerified={teacherProfile?.cert_verified}
                  size="sm"
                />
              </div>
            </div>

            {/* Rating section */}
            {status === 'completed' && (
              <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4">
                <p className="text-sm font-bold text-[#1E4F8A] mb-3">
                  {isEmployer ? 'Rate this Teacher' : 'Rate this Employer'}
                </p>
                {(isEmployer ? neg.employer_rating : neg.teacher_rating) ? (
                  <p className="text-xs text-green-600 font-medium">✓ You have already submitted a rating.</p>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(s => (
                        <button key={s} onClick={() => setRating(s)}
                          className={`w-8 h-8 rounded-lg text-lg transition-colors ${s <= rating ? 'text-amber-400' : 'text-gray-300 hover:text-amber-300'}`}>
                          ★
                        </button>
                      ))}
                    </div>
                    <textarea rows={3} className="input resize-none text-sm"
                      placeholder="Write a review (optional)…"
                      value={reviewText}
                      onChange={e => setReviewText(e.target.value)} />
                    <button onClick={submitRating} disabled={submittingRating || rating === 0}
                      className="w-full bg-blue-600 text-white text-sm font-bold py-2 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60">
                      {submittingRating ? 'Submitting…' : 'Submit Rating'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
