-- ============================================================
-- Migration 004: OpportunityHub — Jobs & Matching Module
-- Tables: job listings, applications, graduate profiles,
--         employer profiles, saved jobs
-- ============================================================

-- ------------------------------------------------------------
-- ENUM types
-- ------------------------------------------------------------
CREATE TYPE job_type AS ENUM ('job', 'apprenticeship', 'freelance', 'internship');

CREATE TYPE application_status AS ENUM (
  'pending', 'reviewed', 'shortlisted', 'rejected', 'hired'
);

-- ------------------------------------------------------------
-- employer_profiles
-- Extended profile for employer users.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS employer_profiles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  company_name    TEXT NOT NULL CHECK (char_length(company_name) BETWEEN 2 AND 200),
  industry        TEXT,
  company_size    TEXT,                        -- e.g. '1-10', '11-50', '50-200', '200+'
  website         TEXT,
  logo_url        TEXT,
  description     TEXT CHECK (char_length(description) <= 2000),
  state           TEXT,
  lga             TEXT,
  verified        BOOLEAN NOT NULL DEFAULT FALSE,
  hire_count      INTEGER NOT NULL DEFAULT 0,   -- total hires made via platform
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER employer_profiles_updated_at
  BEFORE UPDATE ON employer_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- job_listings
-- Job, apprenticeship and freelance postings by employers.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS job_listings (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title            TEXT NOT NULL CHECK (char_length(title) BETWEEN 3 AND 200),
  description      TEXT NOT NULL CHECK (char_length(description) BETWEEN 20 AND 5000),
  type             job_type NOT NULL DEFAULT 'job',
  location         TEXT NOT NULL,
  remote_ok        BOOLEAN NOT NULL DEFAULT FALSE,
  required_skills  TEXT[] NOT NULL DEFAULT '{}',
  salary_range     JSONB,                       -- { min: 50000, max: 150000, currency: 'NGN' }
  duration         TEXT,                        -- e.g. '3 months', 'permanent'
  application_deadline TIMESTAMPTZ,
  active           BOOLEAN NOT NULL DEFAULT TRUE,
  featured         BOOLEAN NOT NULL DEFAULT FALSE,  -- paid featured listing
  view_count       INTEGER NOT NULL DEFAULT 0,
  application_count INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE job_listings IS 'Job, apprenticeship and freelance postings by employers/SMEs.';

CREATE TRIGGER job_listings_updated_at
  BEFORE UPDATE ON job_listings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- graduate_profiles
-- Auto-generated public portfolio from completed courses & certs.
-- Visible to employers on OpportunityHub.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS graduate_profiles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  headline        TEXT CHECK (char_length(headline) <= 150),
  bio             TEXT CHECK (char_length(bio) <= 1000),
  skills          TEXT[] NOT NULL DEFAULT '{}',  -- derived from completed courses
  location        TEXT,
  state           TEXT,
  available_for   job_type[] DEFAULT '{job,apprenticeship,freelance}',
  visible         BOOLEAN NOT NULL DEFAULT TRUE,
  profile_views   INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE graduate_profiles IS 'Public skill portfolios for youth learners. Skills auto-populated from certificates.';

CREATE TRIGGER graduate_profiles_updated_at
  BEFORE UPDATE ON graduate_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Trigger: when a youth certificate is issued, add course skill to graduate_profiles
CREATE OR REPLACE FUNCTION sync_graduate_skills()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_category TEXT;
BEGIN
  -- Get the course category
  SELECT category::TEXT INTO v_category
  FROM skillup_courses WHERE id = NEW.course_id;

  -- Upsert graduate_profile and append skill if not present
  INSERT INTO graduate_profiles (user_id, skills)
  VALUES (NEW.user_id, ARRAY[v_category])
  ON CONFLICT (user_id) DO UPDATE
    SET skills = (
      SELECT ARRAY(
        SELECT DISTINCT unnest(graduate_profiles.skills || ARRAY[v_category])
      )
    ),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

CREATE TRIGGER cert_sync_graduate_skills
  AFTER INSERT ON youth_certificates
  FOR EACH ROW EXECUTE FUNCTION sync_graduate_skills();

-- ------------------------------------------------------------
-- job_applications
-- Youth apply using their verified graduate profile.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS job_applications (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id        UUID NOT NULL REFERENCES job_listings(id) ON DELETE CASCADE,
  applicant_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cover_note    TEXT CHECK (char_length(cover_note) <= 1000),
  status        application_status NOT NULL DEFAULT 'pending',
  employer_note TEXT CHECK (char_length(employer_note) <= 500),
  applied_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at   TIMESTAMPTZ,
  UNIQUE (job_id, applicant_id)
);

COMMENT ON TABLE job_applications IS 'One-click job applications using verified graduate profiles.';

-- Trigger: keep application_count in sync on job_listings
CREATE OR REPLACE FUNCTION sync_application_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE job_listings SET application_count = application_count + 1 WHERE id = NEW.job_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE job_listings SET application_count = GREATEST(0, application_count - 1) WHERE id = OLD.job_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER job_application_count
  AFTER INSERT OR DELETE ON job_applications
  FOR EACH ROW EXECUTE FUNCTION sync_application_count();

-- Trigger: update hire_count on employer_profile when status → hired
CREATE OR REPLACE FUNCTION update_hire_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_employer_id UUID;
BEGIN
  IF NEW.status = 'hired' AND OLD.status <> 'hired' THEN
    SELECT employer_id INTO v_employer_id FROM job_listings WHERE id = NEW.job_id;
    UPDATE employer_profiles SET hire_count = hire_count + 1 WHERE user_id = v_employer_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER application_hire_count
  AFTER UPDATE ON job_applications
  FOR EACH ROW EXECUTE FUNCTION update_hire_count();

-- ------------------------------------------------------------
-- saved_jobs
-- Youth bookmark jobs for later.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS saved_jobs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id     UUID NOT NULL REFERENCES job_listings(id) ON DELETE CASCADE,
  saved_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, job_id)
);
