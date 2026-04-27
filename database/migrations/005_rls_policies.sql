-- ============================================================
-- Migration 005: Row Level Security (RLS) Policies
-- Supabase enforces these at the database level.
-- All tables default to DENY — policies grant access explicitly.
-- ============================================================

-- Helper function: get the calling user's ID from the JWT
-- Supabase sets auth.uid() from the JWT automatically.
-- When using the API's service role key, auth.uid() is NULL,
-- so service-role calls bypass RLS entirely (by design).

-- ============================================================
-- USERS
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own row
CREATE POLICY users_select_own ON users
  FOR SELECT USING (auth.uid() = id);

-- Admins can read all users
CREATE POLICY users_select_admin ON users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- Users can update their own row (but NOT role or is_active — handled by API)
CREATE POLICY users_update_own ON users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Inserts handled by the API via service-role key — no client-side insert
-- (no INSERT policy → denied for anon/authenticated)

-- ============================================================
-- REFRESH TOKENS
-- ============================================================
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;

-- Only service role can manage refresh tokens (API handles this)
-- No policies = deny all authenticated/anon clients

-- ============================================================
-- EDUPRO COURSES
-- ============================================================
ALTER TABLE edupro_courses ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read published courses
CREATE POLICY edupro_courses_select_published ON edupro_courses
  FOR SELECT USING (published = TRUE);

-- Admins and instructors can read all (including drafts)
CREATE POLICY edupro_courses_select_admin ON edupro_courses
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'teacher'))
    AND instructor_id = auth.uid()
  );

-- Only admins can insert/update/delete courses
CREATE POLICY edupro_courses_admin_write ON edupro_courses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- ============================================================
-- EDUPRO ENROLLMENTS
-- ============================================================
ALTER TABLE edupro_enrollments ENABLE ROW LEVEL SECURITY;

-- Teachers can see only their own enrollments
CREATE POLICY edupro_enrollments_select_own ON edupro_enrollments
  FOR SELECT USING (user_id = auth.uid());

-- Admins can see all
CREATE POLICY edupro_enrollments_select_admin ON edupro_enrollments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- Teachers can enroll themselves (INSERT)
CREATE POLICY edupro_enrollments_insert_own ON edupro_enrollments
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Only API (service role) updates progress

-- ============================================================
-- TEACHING MATERIALS
-- ============================================================
ALTER TABLE teaching_materials ENABLE ROW LEVEL SECURITY;

-- All authenticated users can browse materials
CREATE POLICY materials_select_all ON teaching_materials
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only admins can write materials
CREATE POLICY materials_admin_write ON teaching_materials
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- ============================================================
-- CPD CERTIFICATES
-- ============================================================
ALTER TABLE cpd_certificates ENABLE ROW LEVEL SECURITY;

-- Teachers can see their own certificates
CREATE POLICY cpd_certs_select_own ON cpd_certificates
  FOR SELECT USING (user_id = auth.uid());

-- Anyone can read certificates for public verification (by certificate_no)
-- This is handled via the API /verify endpoint — no direct DB policy needed

-- ============================================================
-- LESSON PLAN HISTORY
-- ============================================================
ALTER TABLE lesson_plan_history ENABLE ROW LEVEL SECURITY;

-- Teachers can only see their own lesson plans
CREATE POLICY lesson_plan_select_own ON lesson_plan_history
  FOR SELECT USING (user_id = auth.uid());

-- ============================================================
-- COMMUNITY POSTS
-- ============================================================
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read published posts
CREATE POLICY community_posts_select_published ON community_posts
  FOR SELECT USING (status = 'published' AND auth.uid() IS NOT NULL);

-- Authors can see their own posts (including drafts)
CREATE POLICY community_posts_select_own ON community_posts
  FOR SELECT USING (author_id = auth.uid());

-- Teachers can create posts
CREATE POLICY community_posts_insert ON community_posts
  FOR INSERT WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'teacher')
  );

-- Authors can update their own published posts
CREATE POLICY community_posts_update_own ON community_posts
  FOR UPDATE USING (author_id = auth.uid());

-- ============================================================
-- COMMUNITY REPLIES
-- ============================================================
ALTER TABLE community_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY replies_select_all ON community_replies
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY replies_insert_own ON community_replies
  FOR INSERT WITH CHECK (author_id = auth.uid());

-- ============================================================
-- SKILLUP COURSES
-- ============================================================
ALTER TABLE skillup_courses ENABLE ROW LEVEL SECURITY;

-- All authenticated users can browse published courses
CREATE POLICY skillup_courses_select_published ON skillup_courses
  FOR SELECT USING (published = TRUE AND auth.uid() IS NOT NULL);

-- Admins manage all
CREATE POLICY skillup_courses_admin ON skillup_courses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- ============================================================
-- LESSONS
-- ============================================================
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Enrolled users and preview lessons are accessible
CREATE POLICY lessons_select ON lessons
  FOR SELECT USING (
    is_preview = TRUE OR
    EXISTS (
      SELECT 1 FROM skillup_enrollments e
      WHERE e.user_id = auth.uid() AND e.course_id = lessons.course_id
    )
  );

-- ============================================================
-- SKILLUP ENROLLMENTS
-- ============================================================
ALTER TABLE skillup_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY skillup_enrollments_select_own ON skillup_enrollments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY skillup_enrollments_insert_own ON skillup_enrollments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY skillup_enrollments_admin ON skillup_enrollments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- ============================================================
-- LESSON PROGRESS
-- ============================================================
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY lesson_progress_own ON lesson_progress
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- YOUTH CERTIFICATES
-- ============================================================
ALTER TABLE youth_certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY youth_certs_select_own ON youth_certificates
  FOR SELECT USING (user_id = auth.uid());

-- Employers can read certificates of applicants (via application)
CREATE POLICY youth_certs_select_employer ON youth_certificates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM job_applications ja
      JOIN job_listings jl ON ja.job_id = jl.id
      WHERE ja.applicant_id = youth_certificates.user_id
        AND jl.employer_id = auth.uid()
    )
  );

-- ============================================================
-- GRADUATE PROFILES
-- ============================================================
ALTER TABLE graduate_profiles ENABLE ROW LEVEL SECURITY;

-- Employers and admins can browse visible profiles
CREATE POLICY grad_profiles_select_visible ON graduate_profiles
  FOR SELECT USING (
    visible = TRUE AND
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role IN ('employer', 'admin')
    )
  );

-- Youth can see and edit their own profile
CREATE POLICY grad_profiles_own ON graduate_profiles
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- JOB LISTINGS
-- ============================================================
ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;

-- All authenticated users can browse active listings
CREATE POLICY jobs_select_active ON job_listings
  FOR SELECT USING (active = TRUE AND auth.uid() IS NOT NULL);

-- Employers can see their own (including inactive)
CREATE POLICY jobs_select_own ON job_listings
  FOR SELECT USING (employer_id = auth.uid());

-- Employers can create/update their own listings
CREATE POLICY jobs_employer_write ON job_listings
  FOR INSERT WITH CHECK (
    employer_id = auth.uid() AND
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'employer')
  );

CREATE POLICY jobs_employer_update ON job_listings
  FOR UPDATE USING (employer_id = auth.uid());

-- ============================================================
-- JOB APPLICATIONS
-- ============================================================
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Applicants see their own applications
CREATE POLICY applications_select_own ON job_applications
  FOR SELECT USING (applicant_id = auth.uid());

-- Employers see applications to their jobs
CREATE POLICY applications_select_employer ON job_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM job_listings jl
      WHERE jl.id = job_applications.job_id AND jl.employer_id = auth.uid()
    )
  );

-- Youth can submit applications
CREATE POLICY applications_insert ON job_applications
  FOR INSERT WITH CHECK (
    applicant_id = auth.uid() AND
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'youth')
  );

-- Employers can update status
CREATE POLICY applications_update_employer ON job_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM job_listings jl
      WHERE jl.id = job_applications.job_id AND jl.employer_id = auth.uid()
    )
  );

-- ============================================================
-- EMPLOYER PROFILES
-- ============================================================
ALTER TABLE employer_profiles ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read employer profiles
CREATE POLICY employer_profiles_select ON employer_profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Employers can manage their own profile
CREATE POLICY employer_profiles_own ON employer_profiles
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- SAVED JOBS
-- ============================================================
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY saved_jobs_own ON saved_jobs
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
