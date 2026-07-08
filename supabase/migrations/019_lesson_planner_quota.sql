-- ============================================================
-- Migration 019: AI Lesson Planner monthly quota tracking
-- Teachers get 3 free lesson plans per month (the trial).
-- Paying ₦5,000 (teacher_premium) unlocks unlimited use.
-- Mirrors the Result Generator quota (migration 014).
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS lesson_plan_count    INT     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lesson_plan_period   TEXT    DEFAULT '',
  ADD COLUMN IF NOT EXISTS lesson_plan_unlocked BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN profiles.lesson_plan_count    IS 'How many times teacher has used the AI lesson planner this month';
COMMENT ON COLUMN profiles.lesson_plan_period   IS 'YYYY-MM string of the current usage period (auto-resets each month)';
COMMENT ON COLUMN profiles.lesson_plan_unlocked IS 'True when teacher has paid ₦5,000 for unlimited access this period';
