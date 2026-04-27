-- ============================================================
-- Migration 003: SkillUp — Youth Learning Module
-- Tables: courses, lessons, enrollments, progress, certificates,
--         study groups, WhatsApp bot sessions
-- ============================================================

-- ------------------------------------------------------------
-- ENUM types
-- ------------------------------------------------------------
CREATE TYPE skillup_category AS ENUM (
  'digital_marketing', 'coding', 'fashion_design',
  'solar_tech', 'agribusiness', 'financial_literacy',
  'graphic_design', 'photography', 'food_processing',
  'welding', 'plumbing', 'carpentry', 'auto_mechanics'
);

CREATE TYPE supported_language AS ENUM (
  'english', 'yoruba', 'igbo', 'hausa', 'pidgin'
);

CREATE TYPE lesson_type AS ENUM (
  'video', 'reading', 'quiz', 'project', 'live_session'
);

-- ------------------------------------------------------------
-- skillup_courses
-- Practical vocational & digital skills courses for youth (18-35).
-- Offline-first: content downloadable for 2G/3G environments.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS skillup_courses (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title             TEXT NOT NULL CHECK (char_length(title) BETWEEN 3 AND 200),
  description       TEXT NOT NULL,
  category          skillup_category NOT NULL,
  duration_weeks    INTEGER NOT NULL CHECK (duration_weeks BETWEEN 1 AND 52),
  difficulty        course_level NOT NULL DEFAULT 'beginner',
  languages         supported_language[] NOT NULL DEFAULT '{english}',
  thumbnail_url     TEXT,
  trailer_url       TEXT,
  offline_available BOOLEAN NOT NULL DEFAULT TRUE,
  is_free           BOOLEAN NOT NULL DEFAULT FALSE,
  published         BOOLEAN NOT NULL DEFAULT FALSE,
  instructor_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  employer_validated BOOLEAN NOT NULL DEFAULT FALSE,  -- curriculum reviewed by hiring partners
  lesson_count      INTEGER NOT NULL DEFAULT 0,
  enrolment_count   INTEGER NOT NULL DEFAULT 0,
  rating_avg        NUMERIC(3, 2) DEFAULT 0.00,
  rating_count      INTEGER NOT NULL DEFAULT 0,
  tags              TEXT[] DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE skillup_courses IS 'Youth vocational/digital skills courses. Offline-first, multi-language.';

CREATE TRIGGER skillup_courses_updated_at
  BEFORE UPDATE ON skillup_courses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- lessons
-- Individual lessons within a SkillUp course.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lessons (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id     UUID NOT NULL REFERENCES skillup_courses(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  lesson_type   lesson_type NOT NULL DEFAULT 'video',
  order_index   INTEGER NOT NULL DEFAULT 0,
  duration_mins INTEGER,
  video_url     TEXT,
  content_json  JSONB,                    -- rich text / quiz questions
  is_preview    BOOLEAN NOT NULL DEFAULT FALSE,   -- free preview lesson
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE lessons IS 'Individual lessons within a SkillUp course.';

-- ------------------------------------------------------------
-- skillup_enrollments
-- Youth enrollment & overall course progress.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS skillup_enrollments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id     UUID NOT NULL REFERENCES skillup_courses(id) ON DELETE CASCADE,
  progress      INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  completed     BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at  TIMESTAMPTZ,
  last_lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  enrolled_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, course_id)
);

COMMENT ON TABLE skillup_enrollments IS 'Youth course enrollments with progress tracking.';

-- Trigger: keep enrolment_count in sync
CREATE OR REPLACE FUNCTION sync_enrollment_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE skillup_courses SET enrolment_count = enrolment_count + 1 WHERE id = NEW.course_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE skillup_courses SET enrolment_count = GREATEST(0, enrolment_count - 1) WHERE id = OLD.course_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER skillup_enrollment_count
  AFTER INSERT OR DELETE ON skillup_enrollments
  FOR EACH ROW EXECUTE FUNCTION sync_enrollment_count();

-- ------------------------------------------------------------
-- lesson_progress
-- Per-lesson completion state.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lesson_progress (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id    UUID NOT NULL REFERENCES skillup_courses(id) ON DELETE CASCADE,
  lesson_id    UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed    BOOLEAN NOT NULL DEFAULT FALSE,
  score        INTEGER CHECK (score BETWEEN 0 AND 100),   -- quiz score if applicable
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, lesson_id)
);

-- Trigger: recalculate enrollment progress when a lesson is marked complete
CREATE OR REPLACE FUNCTION recalculate_course_progress()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_total     INTEGER;
  v_completed INTEGER;
  v_progress  INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total
  FROM lessons WHERE course_id = NEW.course_id;

  SELECT COUNT(*) INTO v_completed
  FROM lesson_progress
  WHERE user_id = NEW.user_id AND course_id = NEW.course_id AND completed = TRUE;

  IF v_total > 0 THEN
    v_progress := ROUND((v_completed::NUMERIC / v_total) * 100);
  ELSE
    v_progress := 0;
  END IF;

  UPDATE skillup_enrollments
  SET progress = v_progress,
      last_lesson_id = NEW.lesson_id
  WHERE user_id = NEW.user_id AND course_id = NEW.course_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER lesson_progress_recalculate
  AFTER INSERT OR UPDATE ON lesson_progress
  FOR EACH ROW EXECUTE FUNCTION recalculate_course_progress();

-- ------------------------------------------------------------
-- youth_certificates
-- Micro-certifications awarded on course completion.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS youth_certificates (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id        UUID NOT NULL REFERENCES skillup_courses(id) ON DELETE CASCADE,
  enrollment_id    UUID NOT NULL REFERENCES skillup_enrollments(id) ON DELETE CASCADE,
  certificate_no   TEXT NOT NULL UNIQUE,     -- e.g. SBSKL-2026-00001
  verify_url       TEXT,
  issued_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, course_id)
);

COMMENT ON TABLE youth_certificates IS 'Verifiable micro-certifications for youth learners.';

-- Trigger: auto-issue certificate when skillup enrollment hits 100%
CREATE OR REPLACE FUNCTION auto_issue_youth_certificate()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_cert_no TEXT;
BEGIN
  IF NEW.progress = 100 AND OLD.progress < 100 THEN
    v_cert_no := 'SBSKL-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
                 UPPER(SUBSTRING(MD5(NEW.id::TEXT), 1, 8));

    INSERT INTO youth_certificates (user_id, course_id, enrollment_id, certificate_no)
    VALUES (NEW.user_id, NEW.course_id, NEW.id, v_cert_no)
    ON CONFLICT (user_id, course_id) DO NOTHING;

    NEW.completed    := TRUE;
    NEW.completed_at := NOW();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER skillup_auto_certificate
  BEFORE UPDATE ON skillup_enrollments
  FOR EACH ROW EXECUTE FUNCTION auto_issue_youth_certificate();

-- ------------------------------------------------------------
-- course_ratings
-- Youth star ratings for completed courses.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS course_ratings (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id  UUID NOT NULL REFERENCES skillup_courses(id) ON DELETE CASCADE,
  rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review     TEXT CHECK (char_length(review) <= 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, course_id)
);

-- Trigger: update average rating on skillup_courses
CREATE OR REPLACE FUNCTION update_course_rating()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE skillup_courses
  SET rating_avg   = (SELECT ROUND(AVG(rating)::NUMERIC, 2) FROM course_ratings WHERE course_id = NEW.course_id),
      rating_count = (SELECT COUNT(*) FROM course_ratings WHERE course_id = NEW.course_id)
  WHERE id = NEW.course_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER course_rating_sync
  AFTER INSERT OR UPDATE ON course_ratings
  FOR EACH ROW EXECUTE FUNCTION update_course_rating();

-- ------------------------------------------------------------
-- study_groups
-- Peer learning communities around a course.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS study_groups (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100),
  course_id    UUID NOT NULL REFERENCES skillup_courses(id) ON DELETE CASCADE,
  creator_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  max_members  INTEGER NOT NULL DEFAULT 20 CHECK (max_members BETWEEN 2 AND 50),
  member_count INTEGER NOT NULL DEFAULT 1,
  is_open      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- study_group_members
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS study_group_members (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id    UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (group_id, user_id)
);
