-- ─────────────────────────────────────────────────────────────────
-- 011_fix_auth_role.sql
-- Fixes:
--   1. current_user_role() — add SECURITY DEFINER so it bypasses RLS
--      when reading profiles (prevents circular policy checks)
--   2. handle_new_user() — safe role cast + ON CONFLICT DO NOTHING
--      so "Database error saving new user" never happens again
--   3. Explicit INSERT policy on profiles for authenticated users
--   4. Enforce employer-only job posting at DB level
-- ─────────────────────────────────────────────────────────────────

-- 1. Fix current_user_role() — make it SECURITY DEFINER
--    This runs as the function owner (postgres, BYPASSRLS) so it can
--    always read profiles without hitting circular RLS checks.
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- 2. Fix handle_new_user() — safe cast + conflict guard
--    Prevents "Database error saving new user" when:
--      - role metadata is missing or invalid
--      - trigger fires twice (e.g. email confirmation flow)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_role user_role := 'youth';
BEGIN
  -- Safely parse the role from metadata; default to 'youth' if missing/invalid
  BEGIN
    IF new.raw_user_meta_data->>'role' IS NOT NULL THEN
      v_role := (new.raw_user_meta_data->>'role')::user_role;
    END IF;
  EXCEPTION WHEN invalid_text_representation THEN
    v_role := 'youth';
  END;

  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id,
    COALESCE(
      NULLIF(TRIM(new.raw_user_meta_data->>'full_name'), ''),
      split_part(new.email, '@', 1)
    ),
    new.email,
    v_role
  )
  ON CONFLICT (id) DO NOTHING;  -- idempotent — never errors on duplicate

  RETURN new;
END;
$$;

-- 3. Ensure INSERT policy exists on profiles
--    (trigger is SECURITY DEFINER so it bypasses this, but having it
--     allows the profile page's upsert calls to work too)
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- 4. Tighten job_listings INSERT — only employers (or admins) can post
DROP POLICY IF EXISTS "Employers can post jobs"         ON job_listings;
DROP POLICY IF EXISTS "admin_manage_job_listings"       ON job_listings;

-- Employers insert only their own listings
CREATE POLICY "employers_insert_jobs"
  ON job_listings FOR INSERT
  TO authenticated
  WITH CHECK (
    employer_id = auth.uid()
    AND current_user_role() = 'employer'
  );

-- Employers update/delete their own listings
DROP POLICY IF EXISTS "Employers can update own jobs" ON job_listings;
CREATE POLICY "employers_manage_own_jobs"
  ON job_listings FOR UPDATE USING (employer_id = auth.uid());

CREATE POLICY "employers_delete_own_jobs"
  ON job_listings FOR DELETE USING (employer_id = auth.uid());

-- Admins manage everything
CREATE POLICY "admin_manage_job_listings"
  ON job_listings FOR ALL
  USING ( is_admin() )
  WITH CHECK ( is_admin() );
