'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Send, MessageSquare, AlertTriangle, Shield, Loader2 } from 'lucide-react'
import { sanitizeMessage, containsPhoneNumber } from '@/lib/sanitize-message'

interface ChatMessage {
  id: string
  sender_id: string
  body: string
  created_at: string
  sender?: { full_name: string; avatar_url?: string | null }
}

interface Props {
  applicationId: string
  applicantName: string
  jobTitle:      string
  currentUserId: string
  onClose:       () => void
}

export default function ChatDrawer({
  applicationId,
  applicantName,
  jobTitle,
  currentUserId,
  onClose,
}: Props) {
  const supabase = createClient()
  const bottomRef = useRef<HTMLDivElement>(null)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading,  setLoading]  = useState(true)
  const [text,     setText]     = useState('')
  const [sending,  setSending]  = useState(false)
  const [hasPhone, setHasPhone] = useState(false)

  // ── Load existing messages ─────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('application_chats')
        .select('*, sender:profiles(full_name, avatar_url)')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: true })
      setMessages((data ?? []) as ChatMessage[])
      setLoading(false)
    }
    load()
  }, [applicationId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Real-time subscription ─────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel(`appchat-${applicationId}`)
      .on('postgres_changes', {
        event:  'INSERT',
        schema: 'public',
        table:  'application_chats',
        filter: `application_id=eq.${applicationId}`,
      }, async (payload) => {
        const { data } = await supabase
          .from('application_chats')
          .select('*, sender:profiles(full_name, avatar_url)')
          .eq('id', payload.new.id)
          .single()
        if (data) setMessages(prev => [...prev, data as ChatMessage])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [applicationId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-scroll on new messages ────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Input handler ──────────────────────────────────────────────────────────
  function handleInput(val: string) {
    setText(val)
    setHasPhone(containsPhoneNumber(val))
  }

  // ── Send ───────────────────────────────────────────────────────────────────
  async function sendMessage() {
    const raw = text.trim()
    if (!raw) return
    setSending(true)
    setText('')
    setHasPhone(false)

    const body = sanitizeMessage(raw) // strip phone numbers before saving

    await supabase.from('application_chats').insert({
      application_id: applicationId,
      sender_id:      currentUserId,
      body,
    })
    setSending(false)
  }

  const initials = (name: string) => name.trim().charAt(0).toUpperCase()

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-x-0 bottom-0 sm:inset-auto sm:right-6 sm:bottom-6 sm:w-[420px] z-50 flex flex-col bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-blue-100"
        style={{ height: '82vh', maxHeight: '620px' }}>

        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-5 py-4 bg-[#378ADD] rounded-t-3xl sm:rounded-t-2xl shrink-0">
          <div className="w-10 h-10 bg-white/25 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
            {initials(applicantName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm leading-tight">{applicantName}</p>
            <p className="text-white/65 text-xs truncate">{jobTitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1 text-white/60 text-xs">
              <Shield className="w-3.5 h-3.5" /> Secured
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Privacy notice ── */}
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-100 shrink-0">
          <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <p className="text-xs text-amber-700">
            Phone numbers are <strong>automatically blocked</strong> to protect privacy. Use this chat for professional communication only.
          </p>
        </div>

        {/* ── Messages area ── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center pb-6">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-3">
                <MessageSquare className="w-7 h-7 text-blue-300" />
              </div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Start the conversation</p>
              <p className="text-xs text-gray-400 max-w-xs">
                Send a message to <strong>{applicantName}</strong> about this application.
              </p>
            </div>
          ) : (
            messages.map(m => {
              const isMe = m.sender_id === currentUserId
              const name = m.sender?.full_name ?? '?'
              return (
                <div key={m.id} className={`flex gap-2 items-end ${isMe ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar bubble */}
                  <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold
                    ${isMe ? 'bg-[#378ADD]' : 'bg-gray-400'}`}>
                    {initials(name)}
                  </div>
                  {/* Bubble */}
                  <div className={`max-w-[72%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words
                    ${isMe
                      ? 'bg-[#378ADD] text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                    {/* Sanitize on display as safety net */}
                    {sanitizeMessage(m.body)}
                    <span className={`block text-[10px] mt-1 ${isMe ? 'text-white/55' : 'text-gray-400'}`}>
                      {new Date(m.created_at).toLocaleTimeString('en-NG', {
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              )
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* ── Phone number detected warning ── */}
        {hasPhone && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border-t border-red-100 shrink-0">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <p className="text-xs text-red-600">
              Phone number detected — digits will be replaced with <strong>★</strong> before sending.
            </p>
          </div>
        )}

        {/* ── Input bar ── */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 shrink-0">
          <input
            value={text}
            onChange={e => handleInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
            }}
            placeholder="Type a message…"
            maxLength={2000}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
          <button
            onClick={sendMessage}
            disabled={!text.trim() || sending}
            className="w-10 h-10 shrink-0 bg-[#378ADD] text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {sending
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </>
  )
}
