/*
# Create public gallery image storage

1. New storage bucket
- `gallery-images` stores photos selected from the administrator's device.
- The bucket is public so gallery visitors can view published images without signing in.
- Uploads are limited to common image formats and 10 MB per file.

2. Security
- Enable explicit storage object policies for the single-tenant, no-sign-in app.
- Allow public reads for gallery images so the website can display them.
- Allow anon and authenticated uploads and deletes because the existing admin panel uses a local administrator gate rather than Supabase accounts.

3. Important notes
- The application still checks the selected file type and size before uploading for a helpful user experience.
- Storage rules remain the authoritative boundary for accepted file size and MIME type.
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery-images',
  'gallery-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public can view gallery images" ON storage.objects;
CREATE POLICY "Public can view gallery images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'gallery-images');

DROP POLICY IF EXISTS "Public can upload gallery images" ON storage.objects;
CREATE POLICY "Public can upload gallery images"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'gallery-images');

DROP POLICY IF EXISTS "Public can update gallery images" ON storage.objects;
CREATE POLICY "Public can update gallery images"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'gallery-images')
WITH CHECK (bucket_id = 'gallery-images');

DROP POLICY IF EXISTS "Public can delete gallery images" ON storage.objects;
CREATE POLICY "Public can delete gallery images"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'gallery-images');