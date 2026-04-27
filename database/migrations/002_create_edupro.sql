-- ============================================================
-- Migration 002: EduPro — Teacher Upskilling Module
-- Tables: CPD courses, enrollments, materials, certificates,
--         community forum, lesson plan history, class tools
-- ============================================================

-- ------------------------------------------------------------
-- ENUM types
-- ------------------------------------------------------------
CREATE TYPE course_level   AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE material_type  AS ENUM ('worksheet', 'slide', 'rubric', 'assessment', 'video', 'audio', 'other');
CREATE TYPE post_status    AS ENUM ('published', 'draft', 'flagged', 'removed');

-- ------------------------------------------------------------
-- edupro_courses
-- CPD (Continuing Professional Development) courses for teachers.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS edupro_courses (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            TEXT NOT NULL CHECK (char_length(title) BETWEEN 3 AND 200),
  description      TEXT NOT NULL,
  subject          TEXT NOT NULL,               -- e.g. Mathematics, Digital Skills
  level            course_level NOT NULL DEFAULT 'beginner',
  duration_weeks   INTEGER NOT NULL CHECK (duration_weeks BETWEEN 1 AND 52),
  thumbnail_url    TEXT,
  instructor_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  is_free          BOOLEAN NOT NULL DEFAULT FALSE,
  published        BOOLEAN NOT NULL DEFAULT FALSE,
  certificate_awarded BOOLEAN NOT NULL DEFAULT TRUE,
  nerdc_aligned    BOOLEAN NOT NULL DEFAULT FALSE,
  tags             TEXT[] DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE edupro_courses IS 'CPD short courses for teachers. 2-6 weeks, self-paced.';

CREATE TRIGGER edupro_courses_updated_at
  BEFORE UPDATE ON edupro_courses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- edupro_enrollments
-- Teacher-course enrollment and progress.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS edupro_enrollments (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id      UUID NOT NULL REFERENCES edupro_courses(id) ON DELETE CASCADE,
  progress       INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  completed      BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at   TIMESTAMPTZ,
  enrolled_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, course_id)
);

COMMENT ON TABLE edupro_enrollments IS 'Teacher enrollments in CPD courses. Progress tracked 0-100%.';

-- ------------------------------------------------------------
-- teaching_materials
-- Downloadable library of 1000+ worksheets, slides, rubrics.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS teaching_materials (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title          TEXT NOT NULL,
  description    TEXT,
  subject        TEXT NOT NULL,
  grade_level    TEXT NOT NULL,              -- e.g. JSS1, SS2, Primary 5
  material_type  material_type NOT NULL DEFAULT 'worksheet',
  file_url       TEXT NOT NULL,
  file_size_kb   INTEGER,
  download_count INTEGER NOT NULL DEFAULT 0,
  nerdc_aligned  BOOLEAN NOT NULL DEFAULT FALSE,
  uploaded_by    UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE teaching_materials IS 'Library of Nigerian curriculum-aligned teaching materials.';

-- ------------------------------------------------------------
-- cpd_certificates
-- Verifiable digital CPD certificates issued on course completion.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cpd_certificates (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id        UUID NOT NULL REFERENCES edupro_courses(id) ON DELETE CASCADE,
  enrollment_id    UUID NOT NULL REFERENCES edupro_enrollments(id) ON DELETE CASCADE,
  certificate_no   TEXT NOT NULL UNIQUE,      -- e.g. SBNC-2026-00001
  verify_url       TEXT,                      -- e.g. https://verify.skillbridge.ng/SBNC-...
  issued_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, course_id)
);

COMMENT ON TABLE cpd_certificates IS 'Blockchain-verifiable CPD certificates issued to teachers.';

-- ------------------------------------------------------------
-- lesson_plan_history
-- Stores AI-generated lesson plans per teacher for reference.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lesson_plan_history (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic            TEXT NOT NULL,
  subject          TEXT NOT NULL,
  grade_level      TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  plan_json        JSONB NOT NULL,            -- full lesson plan object from OpenAI
  model_used       TEXT DEFAULT 'gpt-4o',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE lesson_plan_history IS 'History of AI-generated lesson plans. Teachers can revisit and reuse.';

-- ------------------------------------------------------------
-- community_posts
-- Teacher peer learning community (subject-specific forums).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS community_posts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL CHECK (char_length(title) BETWEEN 3 AND 200),
  content     TEXT NOT NULL CHECK (char_length(content) BETWEEN 10 AND 5000),
  subject     TEXT NOT NULL,
  status      post_status NOT NULL DEFAULT 'published',
  view_count  INTEGER NOT NULL DEFAULT 0,
  like_count  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER community_posts_updated_at
  BEFORE UPDATE ON community_posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- community_replies
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS community_replies (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id    UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content    TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Trigger: auto-issue certificate when enrollment reaches 100%
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION auto_issue_cpd_certificate()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_course       edupro_courses%ROWTYPE;
  v_cert_no      TEXT;
BEGIN
  -- Only act when progress changes to 100 and course awards certificate
  IF NEW.progress = 100 AND OLD.progress < 100 THEN
    SELECT * INTO v_course FROM edupro_courses WHERE id = NEW.course_id;

    IF v_course.certificate_awarded THEN
      -- Generate certificate number: SBCPD-YYYY-XXXXXXXX
      v_cert_no := 'SBCPD-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
                   UPPER(SUBSTRING(MD5(NEW.id::TEXT), 1, 8));

      INSERT INTO cpd_certificates (user_id, course_id, enrollment_id, certificate_no)
      VALUES (NEW.user_id, NEW.course_id, NEW.id, v_cert_no)
      ON CONFLICT (user_id, course_id) DO NOTHING;

      -- Mark enrollment as completed
      NEW.completed   := TRUE;
      NEW.completed_at := NOW();
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER edupro_auto_certificate
  BEFORE UPDATE ON edupro_enrollments
  FOR EACH ROW EXECUTE FUNCTION auto_issue_cpd_certificate();
