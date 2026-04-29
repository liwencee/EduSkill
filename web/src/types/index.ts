export type UserRole = 'youth' | 'teacher' | 'employer' | 'admin' | 'institutional'
export type LanguageCode = 'en' | 'yo' | 'ig' | 'ha' | 'pcm'
export type SubscriptionPlan = 'free' | 'youth_premium' | 'teacher_premium' | 'institutional'
export type EnrollmentStatus = 'active' | 'completed' | 'paused' | 'expired'
export type JobType = 'full_time' | 'part_time' | 'apprenticeship' | 'freelance' | 'internship'

export interface Profile {
  id: string
  full_name: string
  email: string
  role: UserRole
  avatar_url?: string
  phone?: string
  state?: string
  lga?: string
  preferred_lang: LanguageCode
  bio?: string
  is_verified: boolean
  subscription: SubscriptionPlan
  subscription_expires_at?: string
  onboarding_done: boolean
  created_at: string
}

export interface Course {
  id: string
  title: string
  slug: string
  description: string
  thumbnail_url?: string
  trailer_url?: string
  category: string
  target_role: UserRole
  language: LanguageCode
  available_langs: LanguageCode[]
  instructor_id?: string
  duration_weeks: number
  is_free: boolean
  is_published: boolean
  is_offline_ready: boolean
  price_ngn: number
  total_lessons: number
  total_enrolled: number
  avg_rating: number
  tags: string[]
  instructor?: Profile
}

export interface Lesson {
  id: string
  module_id: string
  course_id: string
  title: string
  description?: string
  video_url?: string
  video_duration_secs: number
  content_json?: Record<string, unknown>
  subtitles_url?: Record<LanguageCode, string>
  offline_bundle_url?: string
  offline_size_kb?: number
  order_index: number
  is_free_preview: boolean
}

export interface Enrollment {
  id: string
  user_id: string
  course_id: string
  status: EnrollmentStatus
  progress_pct: number
  enrolled_at: string
  completed_at?: string
  course?: Course
}

export interface Certificate {
  id: string
  user_id: string
  course_id: string
  certificate_url?: string
  accredible_id?: string
  issued_at: string
  status: 'issued' | 'revoked'
  course?: Course
}

export interface LessonPlan {
  id: string
  teacher_id: string
  title: string
  subject: string
  grade_level: string
  duration_mins?: number
  objectives: string[]
  content_json: LessonPlanContent
  is_public: boolean
  likes: number
  created_at: string
}

export interface LessonPlanContent {
  overview: string
  learning_objectives: string[]
  materials_needed: string[]
  introduction: { duration: string; activity: string }
  main_activity: { duration: string; steps: string[] }
  assessment: { type: string; description: string }
  closure: { duration: string; activity: string }
  differentiation: { support: string; extension: string }
  homework?: string
}

export interface JobListing {
  id: string
  employer_id: string
  title: string
  description: string
  company_name: string
  job_type: JobType
  location_state?: string
  is_remote: boolean
  required_skills: string[]
  salary_min_ngn?: number
  salary_max_ngn?: number
  is_featured: boolean
  is_active: boolean
  applications: number
  deadline?: string
  created_at: string
  employer?: Profile
}

export interface CommunityPost {
  id: string
  author_id: string
  title: string
  body: string
  category?: string
  tags: string[]
  likes: number
  replies: number
  is_pinned: boolean
  created_at: string
  author?: Profile
}
