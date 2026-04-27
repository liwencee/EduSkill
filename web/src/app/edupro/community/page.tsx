'use client'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import { MessageSquare, ThumbsUp, Pin, Search, PenLine } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { CommunityPost } from '@/types'

const CATEGORIES = ['All', 'Question', 'Resource', 'Discussion']

export default function CommunityPage() {
  const [posts, setPosts]         = useState<CommunityPost[]>([])
  const [loading, setLoading]     = useState(true)
  const [category, setCategory]   = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [newTitle, setNewTitle]   = useState('')
  const [newBody, setNewBody]     = useState('')
  const [newCat, setNewCat]       = useState('Discussion')

  useEffect(() => {
    const supabase = createClient()
    let q = supabase.from('community_posts').select('*, author:profiles(full_name)').order('is_pinned', { ascending: false }).order('created_at', { ascending: false }).limit(20)
    if (category !== 'All') q = q.ilike('category', category) as any
    q.then(({ data }) => { setPosts((data ?? []) as CommunityPost[]); setLoading(false) })
  }, [category])

  async function submitPost() {
    if (!newTitle.trim() || !newBody.trim()) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('community_posts').insert({ author_id: user.id, title: newTitle, body: newBody, category: newCat.toLowerCase(), tags: [] })
    setShowModal(false); setNewTitle(''); setNewBody('')
  }

  return (
    <div className="bg-brand-bg min-h-screen">
      <Navbar />

      {/* 30% blue header */}
      <div className="bg-brand-blue text-white py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">Teacher Community</h1>
            <p className="text-white/80 text-sm">Ask questions, share resources, and connect with educators across Nigeria.</p>
          </div>
          {/* 10% amber CTA */}
          <button onClick={() => setShowModal(true)} className="btn-primary inline-flex items-center gap-2 shrink-0">
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
          <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-2xl border border-[#E0DDD5] animate-pulse" />)}</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare className="w-12 h-12 mx-auto text-brand-inkLight opacity-30 mb-3" />
            <p className="font-medium text-brand-inkMid">No posts yet in this category.</p>
            <button onClick={() => setShowModal(true)} className="btn-primary mt-4 inline-block text-sm py-2 px-4">
              Be the first to post
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <div key={post.id} className={`bg-white rounded-2xl border p-5 hover:shadow-sm transition-shadow ${post.is_pinned ? 'border-brand-amber/50' : 'border-[#E0DDD5]'}`}>
                {post.is_pinned && (
                  <div className="flex items-center gap-1 text-brand-amber text-xs font-semibold mb-2">
                    <Pin className="w-3 h-3" /> Pinned
                  </div>
                )}
                {/* Category badge — 10% amber for resource, 30% blue for others */}
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
                <h3 className="font-bold text-brand-ink mb-1 hover:text-brand-blue cursor-pointer transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-brand-inkMid line-clamp-2 leading-relaxed">{post.body}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-brand-inkLight">
                  <button className="flex items-center gap-1 hover:text-brand-blue transition-colors">
                    <ThumbsUp className="w-3 h-3" /> {post.likes}
                  </button>
                  <button className="flex items-center gap-1 hover:text-brand-blue transition-colors">
                    <MessageSquare className="w-3 h-3" /> {post.replies} replies
                  </button>
                  {post.tags?.map(tag => (
                    <span key={tag} className="bg-brand-bg px-2 py-0.5 rounded text-brand-inkMid">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
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
                <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="input" placeholder="What would you like to ask or share?" />
              </div>
              <div>
                <label className="label">Body</label>
                <textarea value={newBody} onChange={e => setNewBody(e.target.value)} className="input h-28 resize-none" placeholder="Write your question, tip, or resource here…" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="btn-outline flex-1">Cancel</button>
              <button onClick={submitPost} className="btn-primary flex-1">Post</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
