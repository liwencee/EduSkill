-- ── 024: Soft Skills for Work & Business course ────────────────────────────
--
-- The catalogue lists courses from the database, so the new static course
-- (web/src/lib/static-courses.ts, slug 'soft-skills-for-work') needs a row
-- here to appear on the live site. Lessons come from the static curriculum.
--
-- NOTE: run step 1 on its own (outside a transaction) before step 2 —
-- Postgres can't use a new enum value in the transaction that added it.

-- 1. New catalogue category
ALTER TYPE course_category ADD VALUE IF NOT EXISTS 'soft_skills';

-- 2. The course itself (free; 36 lessons over 6 weeks)
INSERT INTO courses (
  slug, title, description, category, target_role, language,
  available_langs, duration_weeks, is_free, is_published, is_offline_ready,
  price_ngn, total_lessons, total_enrolled, avg_rating, tags
) VALUES (
  'soft-skills-for-work',
  'Soft Skills for Work & Business',
  'The people skills that get you hired, paid and recommended — clear communication, teamwork, punctuality and time management, customer service, problem solving, handling pressure, and acing job interviews. Built for Nigerian workplaces, markets and freelancers.',
  'soft_skills', 'youth', 'en',
  ARRAY['en','pcm']::language_code[],
  6, true, true, true,
  0, 36, 0, 0,
  ARRAY['soft skills','communication','teamwork','customer service','employability','interviews']
)
ON CONFLICT (slug) DO NOTHING;
