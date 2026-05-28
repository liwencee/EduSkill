-- ── 015: Course purchase tracking on enrollments ────────────────────────────

-- Add payment tracking fields to enrollments table
ALTER TABLE enrollments
  ADD COLUMN IF NOT EXISTS is_paid      boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS payment_ref  text;

-- Grandfather all existing enrollments as paid (users who enrolled before payment was required)
UPDATE enrollments SET is_paid = true WHERE is_paid = false OR is_paid IS NULL;

-- Index for quick payment reference lookups (webhook deduplication)
CREATE INDEX IF NOT EXISTS idx_enrollments_payment_ref
  ON enrollments(payment_ref)
  WHERE payment_ref IS NOT NULL;

-- ── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own enrollments"     ON enrollments;
DROP POLICY IF EXISTS "Users can enrol"                    ON enrollments;
DROP POLICY IF EXISTS "Service role manages enrollments"   ON enrollments;

CREATE POLICY "Users can view own enrollments" ON enrollments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can enrol" ON enrollments
  FOR INSERT WITH CHECK (user_id = auth.uid());
