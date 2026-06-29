'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react'

interface Msg { role: 'user' | 'assistant'; content: string }

const GREETING: Msg = {
  role: 'assistant',
  content: "Hi! 👋 I'm Skillora Assistant. Ask me about courses, certificates, finding jobs, pricing, or how anything works on the platform.",
}

const SUGGESTIONS = [
  'What courses can I take?',
  'How much does a course cost?',
  'How do I find a job?',
  "I'm a teacher — what's in it for me?",
]

export default function ChatWidget() {
  const [open,     setOpen]     = useState(false)
  const [messages, setMessages] = useState<Msg[]>([GREETING])
  const [input,    setInput]    = useState('')
  const [sending,  setSending]  = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  async function send(text?: string) {
    const content = (text ?? input).trim()
    if (!content || sending) return

    const next = [...messages, { role: 'user' as const, content }]
    setMessages(next)
    setInput('')
    setSending(true)

    try {
      const res = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ messages: next }),
      })
      const data = await res.json()
      const reply = data.reply ?? data.error ?? 'Sorry, something went wrong. Please try again.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I couldn't reach the server. Please check your connection and try again.",
      }])
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      {/* Launcher button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open Skillora Assistant"
          className="fixed bottom-5 right-5 z-[60] w-14 h-14 rounded-full bg-[#4F46E5] text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center hover:bg-indigo-700 hover:scale-105 transition-all">
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#F97316] rounded-full border-2 border-white" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed inset-x-0 bottom-0 sm:inset-x-auto sm:bottom-5 sm:right-5 z-[60]
          w-full sm:w-[380px] h-[80vh] sm:h-[560px] sm:max-h-[80vh]
          bg-white sm:rounded-3xl shadow-2xl border border-indigo-100 flex flex-col overflow-hidden">

          {/* Header */}
          <div className="bg-[#4F46E5] px-4 py-3 flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm leading-tight">Skillora Assistant</p>
              <p className="text-white/70 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" /> Online · AI powered
              </p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat"
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#F8F7FF]">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words
                  ${m.role === 'user'
                    ? 'bg-[#4F46E5] text-white rounded-br-sm'
                    : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-indigo-50'}`}>
                  {m.content}
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-500 rounded-2xl rounded-bl-sm shadow-sm border border-indigo-50 px-4 py-3 flex items-center gap-1">
                  <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {/* Suggestion chips — only before the user has sent anything */}
            {messages.length === 1 && !sending && (
              <div className="flex flex-wrap gap-2 pt-2">
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => send(s)}
                    className="text-xs text-[#4F46E5] bg-white border border-indigo-200 rounded-full px-3 py-1.5 hover:bg-indigo-50 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="bg-white border-t border-gray-100 px-3 py-3 flex items-center gap-2 shrink-0">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="Ask me anything…"
              maxLength={2000}
              disabled={sending}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent disabled:opacity-60"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || sending}
              aria-label="Send message"
              className="w-10 h-10 shrink-0 bg-[#4F46E5] text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
