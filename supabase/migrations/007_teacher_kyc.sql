-- ─── 007: Teacher KYC, Unique IDs, Badge System & Job Applications ───────────
-- Run this in Supabase SQL Editor

-- ── 1. Extend teacher_profiles with KYC + badge fields ───────────────────────
ALTER TABLE teacher_profiles
  ADD COLUMN IF NOT EXISTS teacher_uid        text UNIQUE,
  ADD COLUMN IF NOT EXISTS nin                text,          -- 11-digit NIN
  ADD COLUMN IF NOT EXISTS nin_verified       boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS cert_type          text,          -- NCE | PGDE | B.Ed | M.Ed | PhD | Other
  ADD COLUMN IF NOT EXISTS cert_url           text,          -- uploaded certificate file
  ADD COLUMN IF NOT EXISTS cert_verified      boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS years_of_service   int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS has_badge          boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS badge_type         text DEFAULT 'verified', -- verified | gold | master
  ADD COLUMN IF NOT EXISTS kyc_status         text DEFAULT 'incomplete', -- incomplete|pending|approved|rejected
  ADD COLUMN IF NOT EXISTS kyc_submitted_at   timestamptz,
  ADD COLUMN IF NOT EXISTS display_to_employers boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS portfolio_url      text,
  ADD COLUMN IF NOT EXISTS linkedin_url       text,
  ADD COLUMN IF NOT EXISTS subject_specialization text,
  ADD COLUMN IF NOT EXISTS school_type        text;          -- public | private | federal

-- ── 2. Auto-generate unique Teacher ID (EDU-T-YYYY-NNNNN) ────────────────────
CREATE SEQUENCE IF NOT EXISTS teacher_uid_seq START 1000;

CREATE OR REPLACE FUNCTION generate_teacher_uid()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  yr      text := EXTRACT(YEAR FROM NOW())::text;
  seq_val int  := nextval('teacher_uid_seq');
BEGIN
  IF NEW.teacher_uid IS NULL THEN
    NEW.teacher_uid := 'EDU-T-' || yr || '-' || LPAD(seq_val::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_teacher_uid ON teacher_profiles;
CREATE TRIGGER set_teacher_uid
  BEFORE INSERT ON teacher_profiles
  FOR EACH ROW
  EXECUTE FUNCTION generate_teacher_uid();

-- Backfill any existing rows that have no teacher_uid yet
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT id FROM teacher_profiles WHERE teacher_uid IS NULL LOOP
    UPDATE teacher_profiles
    SET teacher_uid = 'EDU-T-' || EXTRACT(YEAR FROM NOW())::text || '-' || LPAD(nextval('teacher_uid_seq')::text, 5, '0')
    WHERE id = r.id;
  END LOOP;
END$$;

-- ── 3. Ensure teacher_profiles row exists for every teacher in profiles ───────
INSERT INTO teacher_profiles (id)
SELECT id FROM profiles
WHERE role = 'teacher'
  AND id NOT IN (SELECT id FROM teacher_profiles)
ON CONFLICT (id) DO NOTHING;

-- ── 4. job_applications: add teacher-profile snapshot columns ─────────────────
ALTER TABLE job_applications
  ADD COLUMN IF NOT EXISTS teacher_uid_snapshot text,
  ADD COLUMN IF NOT EXISTS cert_type_snapshot    text,
  ADD COLUMN IF NOT EXISTS years_service_snapshot int,
  ADD COLUMN IF NOT EXISTS badge_snapshot        boolean DEFAULT false;

-- ── 5. RLS: job_applications — teachers only can apply ───────────────────────
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teachers can apply for jobs"           ON job_applications;
DROP POLICY IF EXISTS "Teachers can view own applications"    ON job_applications;
DROP POLICY IF EXISTS "Employers can view their applicants"   ON job_applications;
DROP POLICY IF EXISTS "Employers can update application status" ON job_applications;

CREATE POLICY "Teachers can apply for jobs" ON job_applications
  FOR INSERT WITH CHECK (
    auth.uid() = applicant_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
  );

CREATE POLICY "Teachers can view own applications" ON job_applications
  FOR SELECT USING (applicant_id = auth.uid());

CREATE POLICY "Employers can view their applicants" ON job_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM job_listings jl
      WHERE jl.id = job_id AND jl.employer_id = auth.uid()
    )
  );

CREATE POLICY "Employers can update application status" ON job_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM job_listings jl
      WHERE jl.id = job_id AND jl.employer_id = auth.uid()
    )
  );

-- ── 6. RLS: teacher_profiles — visible to authenticated users ─────────────────
ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teacher profiles readable by authenticated"  ON teacher_profiles;
DROP POLICY IF EXISTS "Teachers can manage own profile"             ON teacher_profiles;

CREATE POLICY "Teacher profiles readable by authenticated" ON teacher_profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Teachers can manage own profile" ON teacher_profiles
  FOR ALL USING (id = auth.uid());

-- ── 7. Storage: teacher-documents bucket (run once) ──────────────────────────
-- Creates bucket if it doesn't exist (safe to re-run)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'teacher-documents',
  'teacher-documents',
  false,
  5242880,  -- 5 MB max
  ARRAY['image/jpeg','image/png','image/webp','application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: teachers upload to their own folder
DROP POLICY IF EXISTS "Teachers upload own documents" ON storage.objects;
CREATE POLICY "Teachers upload own documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'teacher-documents' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Teachers read own documents" ON storage.objects;
CREATE POLICY "Teachers read own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'teacher-documents' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Avatars bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,  -- 2 MB
  ARRAY['image/jpeg','image/png','image/webp']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Anyone can read avatars" ON storage.objects;
CREATE POLICY "Anyone can read avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users upload own avatar" ON storage.objects;
CREATE POLICY "Users upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users update own avatar" ON storage.objects;
CREATE POLICY "Users update own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
