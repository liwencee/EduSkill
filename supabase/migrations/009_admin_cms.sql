-- ─────────────────────────────────────────────────────────────────
-- 009_admin_cms.sql  — Admin role + full-access RLS policies
-- ─────────────────────────────────────────────────────────────────

-- 1. Make sure 'admin' is a valid role value (already in type if added in 001)
--    Safe to run even if it already exists.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    WHERE t.typname = 'user_role' AND e.enumlabel = 'admin'
  ) THEN
    ALTER TYPE user_role ADD VALUE 'admin';
  END IF;
END $$;

-- 2. Helper function — returns true when calling user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 3. profiles — admins can read every row
DROP POLICY IF EXISTS "admin_read_all_profiles"   ON profiles;
DROP POLICY IF EXISTS "admin_update_all_profiles" ON profiles;

CREATE POLICY "admin_read_all_profiles"
  ON profiles FOR SELECT
  USING ( is_admin() OR id = auth.uid() );

CREATE POLICY "admin_update_all_profiles"
  ON profiles FOR UPDATE
  USING ( is_admin() OR id = auth.uid() );

-- 4. teacher_profiles — admins can read + update (for KYC approval)
DROP POLICY IF EXISTS "admin_read_all_teacher_profiles"   ON teacher_profiles;
DROP POLICY IF EXISTS "admin_update_all_teacher_profiles" ON teacher_profiles;

CREATE POLICY "admin_read_all_teacher_profiles"
  ON teacher_profiles FOR SELECT
  USING ( is_admin() OR id = auth.uid() );

CREATE POLICY "admin_update_all_teacher_profiles"
  ON teacher_profiles FOR UPDATE
  USING ( is_admin() OR id = auth.uid() );

-- 5. job_listings — admins can read, update, delete any listing
DROP POLICY IF EXISTS "admin_manage_job_listings" ON job_listings;

CREATE POLICY "admin_manage_job_listings"
  ON job_listings FOR ALL
  USING ( is_admin() )
  WITH CHECK ( is_admin() );

-- 6. job_applications — admins can read all
DROP POLICY IF EXISTS "admin_read_all_applications" ON job_applications;

CREATE POLICY "admin_read_all_applications"
  ON job_applications FOR SELECT
  USING ( is_admin() );

-- 7. job_negotiations — admins can read all (for escrow monitoring)
DROP POLICY IF EXISTS "admin_read_all_negotiations" ON job_negotiations;
DROP POLICY IF EXISTS "admin_update_all_negotiations" ON job_negotiations;

CREATE POLICY "admin_read_all_negotiations"
  ON job_negotiations FOR SELECT
  USING ( is_admin() OR employer_id = auth.uid() OR teacher_id = auth.uid() );

CREATE POLICY "admin_update_all_negotiations"
  ON job_negotiations FOR UPDATE
  USING ( is_admin() OR employer_id = auth.uid() OR teacher_id = auth.uid() );

-- 8. Platform stats function — returns aggregate numbers for admin dashboard
CREATE OR REPLACE FUNCTION get_platform_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result json;
BEGIN
  SELECT json_build_object(
    'total_users',          (SELECT COUNT(*)  FROM profiles),
    'total_teachers',       (SELECT COUNT(*)  FROM profiles WHERE role = 'teacher'),
    'total_employers',      (SELECT COUNT(*)  FROM profiles WHERE role = 'employer'),
    'total_jobs',           (SELECT COUNT(*)  FROM job_listings),
    'active_jobs',          (SELECT COUNT(*)  FROM job_listings WHERE is_active = true),
    'total_applications',   (SELECT COUNT(*)  FROM job_applications),
    'pending_kyc',          (SELECT COUNT(*)  FROM teacher_profiles WHERE kyc_status = 'pending'),
    'approved_kyc',         (SELECT COUNT(*)  FROM teacher_profiles WHERE kyc_status = 'approved'),
    'total_negotiations',   (SELECT COUNT(*)  FROM job_negotiations),
    'active_negotiations',  (SELECT COUNT(*)  FROM job_negotiations WHERE status NOT IN ('completed','cancelled')),
    'escrow_held_ngn',      (SELECT COALESCE(SUM(agreed_rate_ngn), 0) FROM job_negotiations WHERE payment_status = 'held')
  ) INTO v_result;
  RETURN v_result;
END;
$$;

-- 9. Admin audit log table (optional, low-cost)
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    uuid        NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  action      text        NOT NULL,   -- e.g. 'approve_kyc', 'delete_job', 'change_role'
  target_type text        NOT NULL,   -- 'teacher_profile', 'job_listing', 'profile'
  target_id   text        NOT NULL,
  meta        jsonb       DEFAULT '{}',
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_audit_log"
  ON admin_audit_log FOR ALL
  USING ( is_admin() );
