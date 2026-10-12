-- ── 026: Every SkillUp course costs ₦19,000 ─────────────────────────────────
-- Matches price_ngn in web/src/lib/static-courses.ts and the minimum the
-- Paystack webhook accepts for a course purchase (PLAN_MIN_NGN.course_purchase).
-- Teacher CPD courses are not stored in this table's youth catalogue and are
-- unaffected.

UPDATE courses
SET price_ngn = 19000, is_free = false, updated_at = now()
WHERE target_role = 'youth';
