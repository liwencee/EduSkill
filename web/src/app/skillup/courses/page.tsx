import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import CourseCard from '@/components/CourseCard'
import { Search } from 'lucide-react'
import type { Course } from '@/types'

const CATEGORIES = [
  { value: '',                  label: 'All Courses'       },
  { value: 'digital_marketing', label: 'Digital Marketing' },
  { value: 'coding',            label: 'Coding & Tech'     },
  { value: 'fashion_design',    label: 'Fashion Design'    },
  { value: 'solar_tech',        label: 'Solar Technology'  },
  { value: 'agribusiness',      label: 'Agribusiness'      },
  { value: 'financial_literacy',label: 'Financial Literacy'},
  { value: 'entrepreneurship',  label: 'Entrepreneurship'  },
]

/** Shown whenever the database is empty or unreachable */
const STATIC_COURSES: Course[] = [
  {
    id: 'static-1', slug: 'digital-marketing-mastery',
    title: 'Digital Marketing Mastery',
    description: 'Master social media ads, SEO, email marketing, and content strategy to grow any business online.',
    category: 'digital_marketing', target_role: 'youth', language: 'en',
    available_langs: ['en', 'yo', 'pcm'], duration_weeks: 4, is_free: false,
    is_published: true, is_offline_ready: true, price_ngn: 15000,
    total_lessons: 24, total_enrolled: 2400, avg_rating: 4.8, tags: ['marketing', 'social media'],
  },
  {
    id: 'static-2', slug: 'social-media-management',
    title: 'Social Media Management',
    description: 'Build and manage brand presence on Instagram, TikTok, Facebook and Twitter for clients.',
    category: 'digital_marketing', target_role: 'youth', language: 'en',
    available_langs: ['en', 'pcm'], duration_weeks: 3, is_free: true,
    is_published: true, is_offline_ready: true, price_ngn: 0,
    total_lessons: 18, total_enrolled: 3100, avg_rating: 4.7, tags: ['social media', 'content'],
  },
  {
    id: 'static-3', slug: 'coding-basics',
    title: 'Coding Basics for Beginners',
    description: 'Learn HTML, CSS and JavaScript from scratch. Build real websites and earn as a freelance developer.',
    category: 'coding', target_role: 'youth', language: 'en',
    available_langs: ['en', 'yo', 'ig'], duration_weeks: 6, is_free: false,
    is_published: true, is_offline_ready: true, price_ngn: 20000,
    total_lessons: 36, total_enrolled: 1800, avg_rating: 4.9, tags: ['coding', 'web', 'javascript'],
  },
  {
    id: 'static-4', slug: 'python-data-skills',
    title: 'Python & Data Skills',
    description: 'Learn Python programming and basic data analysis. In-demand skills for tech and finance sectors.',
    category: 'coding', target_role: 'youth', language: 'en',
    available_langs: ['en'], duration_weeks: 8, is_free: false,
    is_published: true, is_offline_ready: false, price_ngn: 25000,
    total_lessons: 40, total_enrolled: 950, avg_rating: 4.8, tags: ['python', 'data', 'tech'],
  },
  {
    id: 'static-5', slug: 'fashion-design-fundamentals',
    title: 'Fashion Design & Tailoring',
    description: 'From pattern drafting to garment construction. Launch your own fashion brand in Nigeria.',
    category: 'fashion_design', target_role: 'youth', language: 'en',
    available_langs: ['en', 'ig', 'yo'], duration_weeks: 6, is_free: false,
    is_published: true, is_offline_ready: true, price_ngn: 12000,
    total_lessons: 30, total_enrolled: 2200, avg_rating: 4.9, tags: ['fashion', 'sewing', 'business'],
  },
  {
    id: 'static-6', slug: 'solar-installation-tech',
    title: 'Solar Panel Installation',
    description: 'Install, wire and maintain solar power systems. High-demand trade across Nigeria.',
    category: 'solar_tech', target_role: 'youth', language: 'en',
    available_langs: ['en', 'ha', 'yo'], duration_weeks: 5, is_free: false,
    is_published: true, is_offline_ready: true, price_ngn: 18000,
    total_lessons: 28, total_enrolled: 1600, avg_rating: 4.7, tags: ['solar', 'electrical', 'trade'],
  },
  {
    id: 'static-7', slug: 'agribusiness-fundamentals',
    title: 'Agribusiness Fundamentals',
    description: 'Turn farming into a profitable business. Covers crop production, poultry, fish farming and marketing.',
    category: 'agribusiness', target_role: 'youth', language: 'en',
    available_langs: ['en', 'ha', 'ig', 'yo'], duration_weeks: 4, is_free: true,
    is_published: true, is_offline_ready: true, price_ngn: 0,
    total_lessons: 20, total_enrolled: 4100, avg_rating: 4.8, tags: ['farming', 'agriculture', 'business'],
  },
  {
    id: 'static-8', slug: 'financial-literacy-nigeria',
    title: 'Financial Literacy & Money Management',
    description: 'Budgeting, saving, investing and avoiding debt. Essential money skills for every Nigerian.',
    category: 'financial_literacy', target_role: 'youth', language: 'en',
    available_langs: ['en', 'pcm', 'yo'], duration_weeks: 3, is_free: true,
    is_published: true, is_offline_ready: true, price_ngn: 0,
    total_lessons: 15, total_enrolled: 5200, avg_rating: 4.9, tags: ['finance', 'savings', 'investing'],
  },
  {
    id: 'static-9', slug: 'entrepreneurship-nigeria',
    title: 'Entrepreneurship & Business Launch',
    description: 'Validate your idea, register your business, get funding and scale in the Nigerian market.',
    category: 'entrepreneurship', target_role: 'youth', language: 'en',
    available_langs: ['en', 'pcm'], duration_weeks: 4, is_free: false,
    is_published: true, is_offline_ready: true, price_ngn: 10000,
    total_lessons: 22, total_enrolled: 3300, avg_rating: 4.7, tags: ['business', 'startup', 'SME'],
  },
  {
    id: 'static-10', slug: 'graphic-design-canva',
    title: 'Graphic Design with Canva & Photoshop',
    description: 'Create logos, flyers, social media posts and brand kits. Earn from freelance design jobs.',
    category: 'digital_marketing', target_role: 'youth', language: 'en',
    available_langs: ['en', 'yo'], duration_weeks: 4, is_free: false,
    is_published: true, is_offline_ready: false, price_ngn: 12000,
    total_lessons: 26, total_enrolled: 1700, avg_rating: 4.8, tags: ['design', 'canva', 'creative'],
  },
  {
    id: 'static-11', slug: 'catering-food-business',
    title: 'Catering & Food Business',
    description: 'Start a profitable catering or food delivery business. Learn recipes, pricing and marketing.',
    category: 'entrepreneurship', target_role: 'youth', language: 'en',
    available_langs: ['en', 'ig', 'yo'], duration_weeks: 3, is_free: false,
    is_published: true, is_offline_ready: true, price_ngn: 8000,
    total_lessons: 16, total_enrolled: 2800, avg_rating: 4.6, tags: ['food', 'catering', 'business'],
  },
  {
    id: 'static-12', slug: 'logistics-supply-chain',
    title: 'Logistics & Supply Chain Basics',
    description: 'Understand how goods move from producer to consumer. Work with top logistics companies in Nigeria.',
    category: 'entrepreneurship', target_role: 'youth', language: 'en',
    available_langs: ['en'], duration_weeks: 3, is_free: false,
    is_published: true, is_offline_ready: false, price_ngn: 10000,
    total_lessons: 18, total_enrolled: 820, avg_rating: 4.5, tags: ['logistics', 'supply chain', 'operations'],
  },
]

interface Props {
  searchParams: { category?: string; q?: string }
}

export default async function CoursesPage({ searchParams }: Props) {
  let courses: Course[] | null = null
  try {
    const supabase = createClient()
    let query = supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .eq('target_role', 'youth')
      .order('total_enrolled', { ascending: false })
    if (searchParams.category) query = query.eq('category', searchParams.category)
    if (searchParams.q) query = query.ilike('title', `%${searchParams.q}%`)
    const { data } = await query
    if (data && data.length > 0) courses = data
  } catch { /* env vars missing or DB unavailable — fall through to static */ }

  // Fall back to static courses when DB has nothing
  if (!courses || courses.length === 0) {
    let filtered = STATIC_COURSES
    if (searchParams.category) {
      filtered = filtered.filter(c => c.category === searchParams.category)
    }
    if (searchParams.q) {
      const q = searchParams.q.toLowerCase()
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
      )
    }
    courses = filtered
  }

  return (
    <>
      <Navbar />
      <div className="bg-brand-bg min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-brand-ink mb-2">SkillUp Courses</h1>
            <p className="text-brand-inkMid">Practical skills for Nigeria&apos;s job market. All courses work offline.</p>
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <form method="GET" className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-inkLight" />
              <input name="q" defaultValue={searchParams.q} type="text"
                className="input pl-9" placeholder="Search courses…" />
            </form>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(c => (
                <a key={c.value}
                  href={c.value ? `/skillup/courses?category=${c.value}` : '/skillup/courses'}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    searchParams.category === c.value || (!searchParams.category && !c.value)
                      ? 'bg-brand-blue text-white border-brand-blue'
                      : 'border-[#D5D2C8] text-brand-inkMid hover:border-brand-blue hover:text-brand-blue'
                  }`}>
                  {c.label}
                </a>
              ))}
            </div>
          </div>

          {/* Grid */}
          {courses && courses.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {courses.map(course => <CourseCard key={course.id} course={course} />)}
            </div>
          ) : (
            <div className="text-center py-20 text-brand-inkLight">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No courses found</p>
              <a href="/skillup/courses" className="text-brand-blue text-sm hover:underline mt-1 inline-block">
                Clear filters
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
