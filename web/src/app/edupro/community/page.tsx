'use client'
import { useEffect, useState, useCallback } from 'react'
import Navbar from '@/components/Navbar'
import { MessageSquare, ThumbsUp, Pin, PenLine, Loader2, Send, ChevronDown, ChevronUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { CommunityPost } from '@/types'

const CATEGORIES = ['All', 'Question', 'Resource', 'Discussion']

interface Reply {
  id: string
  body: string
  likes: number
  created_at: string
  author: { full_name: string } | null
}

export default function CommunityPage() {
  const [posts,        setPosts]        = useState<CommunityPost[]>([])
  const [loading,      setLoading]      = useState(true)
  const [posting,      setPosting]      = useState(false)
  const [category,     setCategory]     = useState('All')
  const [showModal,    setShowModal]    = useState(false)
  const [newTitle,     setNewTitle]     = useState('')
  const [newBody,      setNewBody]      = useState('')
  const [newCat,       setNewCat]       = useState('Discussion')

  // Per-post reply state
  const [openReplies,  setOpenReplies]  = useState<Record<string, Reply[]>>({})
  const [loadingReply, setLoadingReply] = useState<Record<string, boolean>>({})
  const [replyText,    setReplyText]    = useState<Record<string, string>>({})
  const [submittingReply, setSubmittingReply] = useState<Record<string, boolean>>({})

  // Liked post IDs (local optimistic state)
  const [likedPosts,   setLikedPosts]   = useState<Set<string>>(new Set())

  // ── Fetch posts ────────────────────────────────────────────────────────────
  const fetchPosts = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    let q = supabase
      .from('community_posts')
      .select('*, author:profiles(full_name)')
      .order('is_pinned', { ascending: false })
      .order('created_at',  { ascending: false })
      .limit(30)
    if (category !== 'All') q = q.ilike('category', category) as any
    const { data } = await q
    setPosts((data ?? []) as CommunityPost[])
    setLoading(false)
  }, [category])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  // ── Ensure profile exists helper ───────────────────────────────────────────
  async function ensureProfile(supabase: ReturnType<typeof createClient>, user: { id: string; email?: string; user_metadata?: Record<string, string> }) {
    await supabase.from('profiles').upsert({
      id:        user.id,
      full_name: user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'User',
      email:     user.email ?? '',
      role:      (user.user_metadata?.role ?? 'youth') as any,
    }, { onConflict: 'id', ignoreDuplicates: true })
  }

  // ── Like a post ────────────────────────────────────────────────────────────
  async function likePost(postId: string) {
    if (likedPosts.has(postId)) return          // already liked — prevent double tap
    setLikedPosts(prev => new Set([...prev, postId]))
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, likes: (p.likes ?? 0) + 1 } : p
    ))
    const supabase = createClient()
    const { error } = await supabase.rpc('increment_post_likes', { post_id: postId })
    if (error) {
      // fallback: direct update
      await supabase
        .from('community_posts')
        .update({ likes: posts.find(p => p.id === postId)!.likes + 1 })
        .eq('id', postId)
    }
  }

  // ── Load replies for a post ────────────────────────────────────────────────
  async function toggleReplies(postId: string) {
    if (openReplies[postId]) {
      // collapse
      setOpenReplies(prev => { const n = { ...prev }; delete n[postId]; return n })
      return
    }
    setLoadingReply(prev => ({ ...prev, [postId]: true }))
    const supabase = createClient()
    const { data } = await supabase
      .from('community_replies')
      .select('*, author:profiles(full_name)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
    setOpenReplies(prev => ({ ...prev, [postId]: (data ?? []) as Reply[] }))
    setLoadingReply(prev => ({ ...prev, [postId]: false }))
  }

  // ── Submit a reply ─────────────────────────────────────────────────────────
  async function submitReply(postId: string) {
    const body = (replyText[postId] ?? '').trim()
    if (!body) return
    setSubmittingReply(prev => ({ ...prev, [postId]: true }))
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('You must be logged in to reply.')
      setSubmittingReply(prev => ({ ...prev, [postId]: false }))
      return
    }
    await ensureProfile(supabase, user)

    const { error } = await supabase.from('community_replies').insert({
      post_id:   postId,
      author_id: user.id,
      body,
    })
    if (error) {
      toast.error(error.message || 'Failed to post reply.')
      setSubmittingReply(prev => ({ ...prev, [postId]: false }))
      return
    }

    // Increment reply count on the post
    const { error: rpcErr } = await supabase.rpc('increment_post_replies', { post_id: postId })
    if (rpcErr) {
      await supabase.from('community_posts')
        .update({ replies: (posts.find(p => p.id === postId)?.replies ?? 0) + 1 })
        .eq('id', postId)
    }

    setReplyText(prev => ({ ...prev, [postId]: '' }))
    setSubmittingReply(prev => ({ ...prev, [postId]: false }))
    toast.success('Reply posted!')
    // Reload replies for this post
    const { data: fresh } = await supabase
      .from('community_replies')
      .select('*, author:profiles(full_name)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
    setOpenReplies(prev => ({ ...prev, [postId]: (fresh ?? []) as Reply[] }))
    // Update reply count in local posts list
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, replies: (p.replies ?? 0) + 1 } : p
    ))
  }

  // ── Submit new post ────────────────────────────────────────────────────────
  async function submitPost() {
    if (!newTitle.trim() || !newBody.trim()) {
      toast.error('Please fill in both the title and body.')
      return
    }
    setPosting(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('You must be logged in to post.')
      setPosting(false)
      return
    }
    await ensureProfile(supabase, user)
    const { error } = await supabase.from('community_posts').insert({
      author_id: user.id,
      title:     newTitle.trim(),
      body:      newBody.trim(),
      category:  newCat.toLowerCase(),
      tags:      [],
    })
    setPosting(false)
    if (error) {
      toast.error(error.message || 'Failed to post. Please try again.')
      return
    }
    toast.success('Post published!')
    setShowModal(false)
    setNewTitle('')
    setNewBody('')
    fetchPosts()
  }

  return (
    <div className="bg-brand-bg min-h-screen">
      <Navbar />

      {/* Header */}
      <div className="bg-brand-blue text-white py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">Teacher Community</h1>
            <p className="text-white/80 text-sm">Ask questions, share resources, and connect with educators across Nigeria.</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="btn-primary inline-flex items-center gap-2 shrink-0">
            <PenLine className="w-4 h-4" /> New Post
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Category tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                category === cat
                  ? 'bg-brand-blue text-white border-brand-blue'
                  : 'border-[#D5D2C8] text-brand-inkMid hover:border-brand-blue hover:text-brand-blue bg-white'
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Posts */}
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-2xl border border-[#E0DDD5] animate-pulse" />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare className="w-12 h-12 mx-auto text-brand-inkLight opacity-30 mb-3" />
            <p className="font-medium text-brand-inkMid">No posts yet in this category.</p>
            <button onClick={() => setShowModal(true)}
              className="btn-primary mt-4 inline-flex items-center gap-2 text-sm py-2 px-4">
              <PenLine className="w-4 h-4" /> Be the first to post
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => {
              const repliesOpen    = !!openReplies[post.id]
              const replies        = openReplies[post.id] ?? []
              const loadingReplies = !!loadingReply[post.id]
              const isLiked        = likedPosts.has(post.id)

              return (
                <div key={post.id}
                  className={`bg-white rounded-2xl border overflow-hidden transition-shadow hover:shadow-sm ${
                    post.is_pinned ? 'border-brand-amber/50' : 'border-[#E0DDD5]'
                  }`}>

                  {/* Post body */}
                  <div className="p-5">
                    {post.is_pinned && (
                      <div className="flex items-center gap-1 text-brand-amber text-xs font-semibold mb-2">
                        <Pin className="w-3 h-3" /> Pinned
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`badge text-xs ${post.category === 'resource' ? 'badge-amber' : 'badge-blue'}`}>
                        {post.category ?? 'discussion'}
                      </span>
                      <span className="text-xs text-brand-inkLight">
                        by <span className="font-medium text-brand-inkMid">{(post as any).author?.full_name}</span>
                        {' · '}
                        {new Date(post.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="font-bold text-brand-ink mb-1">{post.title}</h3>
                    <p className="text-sm text-brand-inkMid leading-relaxed">{post.body}</p>

                    {/* Action row */}
                    <div className="flex items-center gap-4 mt-4 text-xs">
                      {/* Like */}
                      <button
                        onClick={() => likePost(post.id)}
                        className={`flex items-center gap-1.5 font-medium transition-colors ${
                          isLiked
                            ? 'text-brand-blue cursor-default'
                            : 'text-brand-inkLight hover:text-brand-blue'
                        }`}>
                        <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-brand-blue' : ''}`} />
                        {post.likes ?? 0} {post.likes === 1 ? 'like' : 'likes'}
                      </button>

                      {/* Toggle replies */}
                      <button
                        onClick={() => toggleReplies(post.id)}
                        className="flex items-center gap-1.5 text-brand-inkLight hover:text-brand-blue font-medium transition-colors">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {post.replies ?? 0} {post.replies === 1 ? 'reply' : 'replies'}
                        {repliesOpen
                          ? <ChevronUp className="w-3 h-3" />
                          : <ChevronDown className="w-3 h-3" />}
                      </button>

                      {post.tags?.map(tag => (
                        <span key={tag} className="bg-brand-bg px-2 py-0.5 rounded text-brand-inkMid">{tag}</span>
                      ))}
                    </div>
                  </div>

                  {/* Replies section */}
                  {repliesOpen && (
                    <div className="border-t border-[#F1EFE8] bg-[#FAFAF8]">
                      {loadingReplies ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="w-4 h-4 animate-spin text-brand-inkLight" />
                        </div>
                      ) : (
                        <>
                          {replies.length > 0 && (
                            <div className="divide-y divide-[#F1EFE8]">
                              {replies.map(r => (
                                <div key={r.id} className="px-5 py-3 flex gap-3">
                                  <div className="w-7 h-7 rounded-full bg-brand-blueLight flex items-center justify-center shrink-0 text-xs font-bold text-brand-blue">
                                    {r.author?.full_name?.charAt(0).toUpperCase() ?? '?'}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <span className="text-xs font-semibold text-brand-ink">{r.author?.full_name ?? 'Anonymous'}</span>
                                      <span className="text-xs text-brand-inkLight">
                                        {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                      </span>
                                    </div>
                                    <p className="text-sm text-brand-inkMid leading-relaxed">{r.body}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Reply input */}
                          <div className="px-5 py-3 flex gap-3 items-start">
                            <div className="w-7 h-7 rounded-full bg-brand-blue flex items-center justify-center shrink-0">
                              <PenLine className="w-3.5 h-3.5 text-white" />
                            </div>
                            <div className="flex-1 flex gap-2">
                              <textarea
                                rows={2}
                                value={replyText[post.id] ?? ''}
                                onChange={e => setReplyText(prev => ({ ...prev, [post.id]: e.target.value }))}
                                onKeyDown={e => {
                                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submitReply(post.id)
                                }}
                                placeholder="Write a reply… (Ctrl+Enter to send)"
                                className="flex-1 text-sm px-3 py-2 rounded-xl border border-[#D5D2C8] focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none bg-white"
                              />
                              <button
                                onClick={() => submitReply(post.id)}
                                disabled={!replyText[post.id]?.trim() || submittingReply[post.id]}
                                className="self-end px-3 py-2 bg-brand-blue text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 shrink-0">
                                {submittingReply[post.id]
                                  ? <Loader2 className="w-4 h-4 animate-spin" />
                                  : <Send className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* New Post modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
            <h2 className="font-bold text-xl text-brand-ink mb-4">New Community Post</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Category</label>
                <select value={newCat} onChange={e => setNewCat(e.target.value)} className="input">
                  {['Question','Resource','Discussion'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Title</label>
                <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)}
                  className="input" placeholder="What would you like to ask or share?" />
              </div>
              <div>
                <label className="label">Body</label>
                <textarea value={newBody} onChange={e => setNewBody(e.target.value)}
                  className="input h-32 resize-none"
                  placeholder="Write your question, tip, or resource here…" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} disabled={posting} className="btn-outline flex-1">Cancel</button>
              <button onClick={submitPost} disabled={posting}
                className="btn-primary flex-1 inline-flex items-center justify-center gap-2">
                {posting ? <><Loader2 className="w-4 h-4 animate-spin" /> Posting…</> : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
