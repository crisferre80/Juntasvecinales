/*
# Storage Bucket for Photo Reports

This migration creates the Supabase Storage bucket used by the reportes
fotográficos feature. The app is a public community platform without sign-in,
so the policies allow both anon and authenticated roles to read and upload
files to the bucket.

Bucket name: reportes
Path prefix: reportes/
*/

-- ============================================
-- 1. CREATE BUCKET
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reportes',
  'reportes',
  true,
  5242880, -- 5 MB max per file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- 2. ENABLE RLS ON storage.objects
-- ============================================
-- NOTE: storage.objects already has RLS enabled by default in Supabase.
-- The following policies target the "reportes" bucket.

-- Allow anyone to read files from the reportes bucket
DROP POLICY IF EXISTS "anon_select_reportes_bucket" ON storage.objects;
CREATE POLICY "anon_select_reportes_bucket"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'reportes');

-- Allow anyone to upload files to the reportes bucket
DROP POLICY IF EXISTS "anon_insert_reportes_bucket" ON storage.objects;
CREATE POLICY "anon_insert_reportes_bucket"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'reportes');

-- Allow anyone to update their own files (optional, useful for replacements)
DROP POLICY IF EXISTS "anon_update_reportes_bucket" ON storage.objects;
CREATE POLICY "anon_update_reportes_bucket"
  ON storage.objects FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'reportes')
  WITH CHECK (bucket_id = 'reportes');

-- Allow anyone to delete files from the reportes bucket
-- Remove this policy if you want to restrict deletes to admins only.
DROP POLICY IF EXISTS "anon_delete_reportes_bucket" ON storage.objects;
CREATE POLICY "anon_delete_reportes_bucket"
  ON storage.objects FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'reportes');
