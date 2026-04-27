-- ============================================================
-- Migration 006: Performance Indexes
-- Targets: all frequent query patterns across modules
-- ============================================================

-- ------------------------------------------------------------
-- users
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_email       ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role        ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_state       ON users (state);
CREATE INDEX IF NOT EXISTS idx_users_is_active   ON users (is_active) WHERE is_active = TRUE;

-- ------------------------------------------------------------
-- refresh_tokens
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_refresh_token_hash    ON refresh_tokens (token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_token_user    ON refresh_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_token_expiry  ON refresh_tokens (expires_at) WHERE revoked = FALSE;

-- ------------------------------------------------------------
-- EduPro
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_edupro_courses_published  ON edupro_courses (published) WHERE published = TRUE;
CREATE INDEX IF NOT EXISTS idx_edupro_courses_subject    ON edupro_courses (subject);
CREATE INDEX IF NOT EXISTS idx_edupro_courses_level      ON edupro_courses (level);
CREATE INDEX IF NOT EXISTS idx_edupro_enrollments_user   ON edupro_enrollments (user_id);
CREATE INDEX IF NOT EXISTS idx_edupro_enrollments_course ON edupro_enrollments (course_id);
CREATE INDEX IF NOT EXISTS idx_teaching_materials_subject ON teaching_materials (subject);
CREATE INDEX IF NOT EXISTS idx_teaching_materials_grade   ON teaching_materials (grade_level);
CREATE INDEX IF NOT EXISTS idx_cpd_certs_user            ON cpd_certificates (user_id);
CREATE INDEX IF NOT EXISTS idx_cpd_certs_no              ON cpd_certificates (certificate_no);
CREATE INDEX IF NOT EXISTS idx_lesson_plan_user          ON lesson_plan_history (user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_subject   ON community_posts (subject);
CREATE INDEX IF NOT EXISTS idx_community_posts_author    ON community_posts (author_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_status    ON community_posts (status) WHERE status = 'published';

-- ------------------------------------------------------------
-- SkillUp
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_skillup_courses_published ON skillup_courses (published) WHERE published = TRUE;
CREATE INDEX IF NOT EXISTS idx_skillup_courses_category  ON skillup_courses (category);
-- GIN index for array overlap queries on languages
CREATE INDEX IF NOT EXISTS idx_skillup_courses_languages ON skillup_courses USING GIN (languages);
CREATE INDEX IF NOT EXISTS idx_skillup_courses_tags      ON skillup_courses USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_lessons_course            ON lessons (course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_skillup_enroll_user       ON skillup_enrollments (user_id);
CREATE INDEX IF NOT EXISTS idx_skillup_enroll_course     ON skillup_enrollments (course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user      ON lesson_progress (user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_youth_certs_user          ON youth_certificates (user_id);
CREATE INDEX IF NOT EXISTS idx_youth_certs_no            ON youth_certificates (certificate_no);
CREATE INDEX IF NOT EXISTS idx_study_groups_course       ON study_groups (course_id);

-- ------------------------------------------------------------
-- OpportunityHub
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_job_listings_active       ON job_listings (active) WHERE active = TRUE;
CREATE INDEX IF NOT EXISTS idx_job_listings_employer     ON job_listings (employer_id);
CREATE INDEX IF NOT EXISTS idx_job_listings_type         ON job_listings (type);
CREATE INDEX IF NOT EXISTS idx_job_listings_location     ON job_listings (location);
CREATE INDEX IF NOT EXISTS idx_job_listings_deadline     ON job_listings (application_deadline)
  WHERE active = TRUE AND application_deadline IS NOT NULL;
-- GIN index for skills array overlap (matching engine)
CREATE INDEX IF NOT EXISTS idx_job_listings_skills       ON job_listings USING GIN (required_skills);
CREATE INDEX IF NOT EXISTS idx_grad_profiles_skills      ON graduate_profiles USING GIN (skills);
CREATE INDEX IF NOT EXISTS idx_grad_profiles_visible     ON graduate_profiles (visible) WHERE visible = TRUE;
CREATE INDEX IF NOT EXISTS idx_grad_profiles_user        ON graduate_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job      ON job_applications (job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_applicant ON job_applications (applicant_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status   ON job_applications (status);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user           ON saved_jobs (user_id);

-- ------------------------------------------------------------
-- Full-text search: courses and jobs
-- ------------------------------------------------------------
ALTER TABLE skillup_courses  ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;
ALTER TABLE job_listings     ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;

-- Populate search vectors
UPDATE skillup_courses SET search_vector =
  TO_TSVECTOR('english', COALESCE(title, '') || ' ' || COALESCE(description, ''));

UPDATE job_listings SET search_vector =
  TO_TSVECTOR('english', COALESCE(title, '') || ' ' || COALESCE(description, ''));

-- GIN indexes for full-text search
CREATE INDEX IF NOT EXISTS idx_skillup_courses_fts ON skillup_courses USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_job_listings_fts    ON job_listings    USING GIN (search_vector);

-- Trigger: keep search vectors up to date
CREATE OR REPLACE FUNCTION update_skillup_course_fts()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector := TO_TSVECTOR('english',
    COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.description, ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER skillup_courses_fts_update
  BEFORE INSERT OR UPDATE ON skillup_courses
  FOR EACH ROW EXECUTE FUNCTION update_skillup_course_fts();

CREATE OR REPLACE FUNCTION update_job_listing_fts()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector := TO_TSVECTOR('english',
    COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.description, ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER job_listings_fts_update
  BEFORE INSERT OR UPDATE ON job_listings
  FOR EACH ROW EXECUTE FUNCTION update_job_listing_fts();
