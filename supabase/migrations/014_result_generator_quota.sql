-- ============================================================
-- Migration 014: Result Generator monthly quota tracking
-- Teachers get 3 free uses per month.
-- Paying ₦5,000 unlocks unlimited use for the rest of that month.
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS result_gen_count    INT     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS result_gen_period   TEXT    DEFAULT '',
  ADD COLUMN IF NOT EXISTS result_gen_unlocked BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN profiles.result_gen_count    IS 'How many times teacher has used the result generator this month';
COMMENT ON COLUMN profiles.result_gen_period   IS 'YYYY-MM string of the current usage period (auto-resets each month)';
COMMENT ON COLUMN profiles.result_gen_unlocked IS 'True when teacher has paid ₦5,000 for unlimited access this period';
