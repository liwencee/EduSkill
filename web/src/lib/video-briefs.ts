import { COURSE_CURRICULUM, type CurriculumLesson } from '@/lib/course-content'
import { STATIC_COURSES } from '@/lib/static-courses'

/**
 * Video requirements and per-lesson filming briefs for creators.
 *
 * Every course has about COURSE_VIDEO_MINUTES of video, split across its
 * lessons in proportion to each lesson's planned length, with every lesson
 * video between MIN and MAX minutes.
 */
export const COURSE_VIDEO_MINUTES = 240   // about 4 hours per course
export const LESSON_VIDEO_MIN     = 5
export const LESSON_VIDEO_MAX     = 15

export interface FilmingStyle {
  key:   'screen' | 'demo' | 'presenter' | 'classroom' | 'performance'
  label: string
  how:   string[]
}

const STYLES: Record<FilmingStyle['key'], FilmingStyle> = {
  screen: {
    key: 'screen', label: 'Screen recording with voice-over',
    how: [
      'Record your screen at 1080p and zoom in on every click, menu and line of code.',
      'Use large fonts and close unrelated tabs and notifications.',
      'Show your face in a small corner box if you like, but keep the screen the focus.',
    ],
  },
  demo: {
    key: 'demo', label: 'Hands-on demonstration',
    how: [
      'Film close-ups of your hands, tools and materials, and show every step being done.',
      'Show the finished result at the start, then build it step by step.',
      'Use good light and a steady camera (a tripod or phone stand).',
    ],
  },
  presenter: {
    key: 'presenter', label: 'Presenter to camera with simple slides',
    how: [
      'Talk to the camera at eye level, framed from the chest up, in a quiet room.',
      'Put key words, figures and steps on screen as simple text or slides.',
      'Use Nigerian prices, places and businesses in your examples.',
    ],
  },
  classroom: {
    key: 'classroom', label: 'Speaking and listening practice',
    how: [
      'Say each word or phrase clearly, then pause so learners can repeat it.',
      'Show the written form on screen as you say it.',
      'Include a short real-life dialogue using the lesson’s words.',
    ],
  },
  performance: {
    key: 'performance', label: 'Instrument demonstration',
    how: [
      'Use two angles if you can: one wide, one close on the hands or keys/frets/sticks.',
      'Play each exercise slowly first, then at full speed.',
      'Record clean audio directly from the instrument or a close mic.',
    ],
  },
}

const CATEGORY_STYLE: Record<string, FilmingStyle['key']> = {
  coding: 'screen', digital_marketing: 'screen',
  fashion_design: 'demo', solar_tech: 'demo', agribusiness: 'demo',
  financial_literacy: 'presenter', entrepreneurship: 'presenter', soft_skills: 'presenter',
  languages: 'classroom', music: 'performance',
}

// Lessons that are about ideas rather than doing are better as a presenter video,
// whatever the course.
const CONCEPT_WORDS = /\b(why|what is|understanding|introduction|overview|business|pricing|price|market|marketing|money|profit|funding|career|planning|plan|strategy|legal|register|customer|negotiat|ethic|mindset)\b/i

function styleFor(courseSlug: string, lessonTitle: string): FilmingStyle {
  const course = STATIC_COURSES.find(c => c.slug === courseSlug)
  const base   = CATEGORY_STYLE[course?.category ?? ''] ?? 'presenter'
  if ((base === 'demo' || base === 'screen' || base === 'performance') && CONCEPT_WORDS.test(lessonTitle)) {
    return STYLES.presenter
  }
  return STYLES[base]
}

/** Split the course's ~4 hours across its lessons, keeping each within 5–15 minutes. */
function targetMinutes(lessons: CurriculumLesson[]): number[] {
  const weights = lessons.map(l => Math.max(1, l.duration_mins))
  const fixed: (number | null)[] = lessons.map(() => null)
  for (let round = 0; round < lessons.length; round++) {
    const free  = weights.map((w, i) => (fixed[i] === null ? w : 0))
    const used  = fixed.reduce<number>((a, m) => a + (m ?? 0), 0)
    const total = free.reduce((a, b) => a + b, 0)
    if (!total) break
    let changed = false
    free.forEach((w, i) => {
      if (fixed[i] !== null) return
      const share = ((COURSE_VIDEO_MINUTES - used) * w) / total
      if (share < LESSON_VIDEO_MIN) { fixed[i] = LESSON_VIDEO_MIN; changed = true }
      else if (share > LESSON_VIDEO_MAX) { fixed[i] = LESSON_VIDEO_MAX; changed = true }
    })
    if (!changed) {
      free.forEach((w, i) => { if (fixed[i] === null) fixed[i] = ((COURSE_VIDEO_MINUTES - used) * w) / total })
      break
    }
  }
  return fixed.map(m => Math.min(LESSON_VIDEO_MAX, Math.max(LESSON_VIDEO_MIN, Math.round(m ?? LESSON_VIDEO_MIN))))
}

export interface LessonBrief {
  courseSlug:   string
  lessonId:     string
  lessonTitle:  string
  moduleTitle:  string
  moduleNumber: number
  lessonNumber: number     // within the module
  lessonsInModule: number
  targetMins:   number
  isFreePreview: boolean
  style:        FilmingStyle
  previous:     string | null
  next:         string | null
  outline:      { at: string; what: string }[]
}

function mmss(mins: number) {
  const s = Math.round(mins * 60)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/** Filming briefs for every lesson in a course, in order. */
export function courseBriefs(courseSlug: string): LessonBrief[] {
  const modules = COURSE_CURRICULUM[courseSlug] ?? []
  const flat    = modules.flatMap((m, mi) => m.lessons.map((l, li) => ({ m, mi, l, li })))
  const targets = targetMinutes(flat.map(x => x.l))

  return flat.map(({ m, mi, l, li }, i) => {
    const t = targets[i]
    return {
      courseSlug,
      lessonId:        l.id,
      lessonTitle:     l.title,
      moduleTitle:     m.title,
      moduleNumber:    mi + 1,
      lessonNumber:    li + 1,
      lessonsInModule: m.lessons.length,
      targetMins:      t,
      isFreePreview:   l.is_free_preview,
      style:           styleFor(courseSlug, l.title),
      previous:        flat[i - 1]?.l.title ?? null,
      next:            flat[i + 1]?.l.title ?? null,
      outline: [
        { at: '0:00',          what: `Say what learners will be able to do after this lesson: “${l.title}”.` },
        { at: mmss(0.5),       what: 'Teach or demonstrate the main idea step by step. This is most of the video.' },
        { at: mmss(t * 0.65),  what: 'Show one real Nigerian example: a business, price, place or situation learners know.' },
        { at: mmss(t - 1),     what: 'Recap the key points and give learners one small task to try today.' },
      ],
    }
  })
}

export function lessonBrief(courseSlug: string, lessonId: string): LessonBrief | null {
  return courseBriefs(courseSlug).find(b => b.lessonId === lessonId) ?? null
}

export function courseVideoTotal(courseSlug: string) {
  return courseBriefs(courseSlug).reduce((a, b) => a + b.targetMins, 0)
}
