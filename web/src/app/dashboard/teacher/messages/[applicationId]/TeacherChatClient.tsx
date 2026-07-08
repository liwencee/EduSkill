'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  ArrowLeft, Send, MessageSquare, AlertTriangle, Shield, Loader2, Briefcase,
} from 'lucide-react'
import { sanitizeMessage, containsPhoneNumber } from '@/lib/sanitize-message'

interface ChatMessage {
  id: string
  sender_id: string
  body: string
  created_at: string
  sender?: { full_name: string; avatar_url?: string | null }
}

interface Props {
  applicationId:   string
  jobTitle:        string
  companyName:     string
  currentUserId:   string
  initialMessages: ChatMessage[]
}

export default function TeacherChatClient({
  applicationId,
  jobTitle,
  companyName,
  currentUserId,
  initialMessages,
}: Props) {
  const supabase  = createClient()
  const bottomRef = useRef<HTMLDivElement>(null)

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [text,     setText]     = useState('')
  const [sending,  setSending]  = useState(false)
  const [hasPhone, setHasPhone] = useState(false)

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleInput(val: string) {
    setText(val)
    setHasPhone(containsPhoneNumber(val))
  }

  async function sendMessage() {
    const raw = text.trim()
    if (!raw) return
    setSending(true)
    setText('')
    setHasPhone(false)
    const body = sanitizeMessage(raw)
    await supabase.from('application_chats').insert({
      application_id: applicationId,
      sender_id:      currentUserId,
      body,
    })
    setSending(false)
  }

  const initials = (name: string) => name.trim().charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-[#EBF4FF] flex flex-col">

      {/* ── Top bar ── */}
      <div className="bg-[#378ADD] px-4 py-3 flex items-center gap-3 shrink-0">
        <Link href="/dashboard/teacher/messages"
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center shrink-0">
          <Briefcase className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm leading-tight truncate">{jobTitle}</p>
          <p className="text-white/65 text-xs truncate">{companyName}</p>
        </div>
        <span className="hidden sm:flex items-center gap-1 text-white/60 text-xs">
          <Shield className="w-3.5 h-3.5" /> Secured
        </span>
      </div>

      {/* ── Privacy banner ── */}
      <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-100 shrink-0">
        <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <p className="text-xs text-amber-700">
          Phone numbers are <strong>automatically blocked</strong> to protect privacy.
        </p>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 max-w-2xl w-full mx-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-3 shadow-sm">
              <MessageSquare className="w-7 h-7 text-blue-300" />
            </div>
            <p className="text-sm font-semibold text-gray-600 mb-1">No messages yet</p>
            <p className="text-xs text-gray-400">The employer will start the conversation.</p>
          </div>
        ) : (
          messages.map(m => {
            const isMe = m.sender_id === currentUserId
            const name = m.sender?.full_name ?? '?'
            return (
              <div key={m.id} className={`flex gap-2 items-end ${isMe ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold
                  ${isMe ? 'bg-[#378ADD]' : 'bg-gray-400'}`}>
                  {initials(name)}
                </div>
                <div className={`max-w-[72%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words
                  ${isMe
                    ? 'bg-[#378ADD] text-white rounded-br-sm'
                    : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-blue-50'}`}>
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

      {/* ── Phone warning ── */}
      {hasPhone && (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border-t border-red-100 shrink-0 max-w-2xl w-full mx-auto">
          <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <p className="text-xs text-red-600">
            Phone number detected — digits will be replaced with <strong>★</strong> before sending.
          </p>
        </div>
      )}

      {/* ── Input ── */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-2 shrink-0 max-w-2xl w-full mx-auto">
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
  )
}
