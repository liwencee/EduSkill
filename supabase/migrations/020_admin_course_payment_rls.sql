-- ============================================================
-- Migration 020: RLS for admin course & payments management
-- Admins can already SELECT all courses (existing policy) but had
-- no way to UPDATE them (publish/unpublish, edit pricing) or view
-- all enrollments (needed for the Payments admin page).
-- ============================================================

CREATE POLICY "Admins can update all courses"
  ON courses FOR UPDATE
  USING (current_user_role() = 'admin'::user_role)
  WITH CHECK (current_user_role() = 'admin'::user_role);

CREATE POLICY "Admins can view all enrollments"
  ON enrollments FOR SELECT
  USING (current_user_role() = 'admin'::user_role);
