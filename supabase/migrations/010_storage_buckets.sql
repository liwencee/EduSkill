-- ─────────────────────────────────────────────────────────────────
-- 010_storage_buckets.sql  — Storage buckets + RLS policies
-- ─────────────────────────────────────────────────────────────────

-- 1. Create buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 2097152,  -- 2 MB
   ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif']),
  ('teacher-documents', 'teacher-documents', false, 5242880,  -- 5 MB
   ARRAY['image/jpeg','image/jpg','image/png','image/webp','application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- ─── avatars bucket (public — anyone can view) ───────────────────

-- Drop old policies if they exist
DROP POLICY IF EXISTS "avatars_public_select"    ON storage.objects;
DROP POLICY IF EXISTS "avatars_auth_insert"      ON storage.objects;
DROP POLICY IF EXISTS "avatars_owner_update"     ON storage.objects;
DROP POLICY IF EXISTS "avatars_owner_delete"     ON storage.objects;

-- Anyone can read avatars
CREATE POLICY "avatars_public_select"
  ON storage.objects FOR SELECT
  TO public
  USING ( bucket_id = 'avatars' );

-- Authenticated users can upload into their own folder  (userId/filename)
CREATE POLICY "avatars_auth_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owner can replace / update their avatar
CREATE POLICY "avatars_owner_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owner can delete their avatar
CREATE POLICY "avatars_owner_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ─── teacher-documents bucket (private) ─────────────────────────

DROP POLICY IF EXISTS "tdocs_owner_select"   ON storage.objects;
DROP POLICY IF EXISTS "tdocs_admin_select"   ON storage.objects;
DROP POLICY IF EXISTS "tdocs_auth_insert"    ON storage.objects;
DROP POLICY IF EXISTS "tdocs_owner_update"   ON storage.objects;
DROP POLICY IF EXISTS "tdocs_owner_delete"   ON storage.objects;

-- Owner can read their own documents
CREATE POLICY "tdocs_owner_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'teacher-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated teachers can upload into their own folder
CREATE POLICY "tdocs_auth_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'teacher-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owner can replace their certificate
CREATE POLICY "tdocs_owner_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'teacher-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owner can delete their documents
CREATE POLICY "tdocs_owner_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'teacher-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
