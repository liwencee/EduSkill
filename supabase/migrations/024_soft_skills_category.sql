-- ── 024: Soft Skills catalogue category ─────────────────────────────────────
-- Kept in its own migration: Postgres can't use a new enum value in the
-- transaction that added it, so the course row is inserted in 025.

ALTER TYPE course_category ADD VALUE IF NOT EXISTS 'soft_skills';
