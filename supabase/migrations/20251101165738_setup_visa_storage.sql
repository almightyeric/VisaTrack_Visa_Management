/*
  # Setup Visa Photo Storage

  ## Overview
  Creates storage bucket and policies for visa photo uploads

  ## Storage Setup
  - Create 'visa-photos' bucket for storing visa images
  - Enable public access for authenticated users' own photos
  - Set up RLS policies for upload, view, and delete

  ## Security
  - Users can only upload to their own folder
  - Users can only view their own photos
  - Users can only delete their own photos
  - File size limits enforced
  - Allowed file types: image/jpeg, image/png, image/webp
*/

-- Enable storage if not already enabled
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'visa-photos',
  'visa-photos',
  false,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Allow users to upload photos to their own folder
CREATE POLICY "Users can upload own visa photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'visa-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own photos
CREATE POLICY "Users can view own visa photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'visa-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own photos
CREATE POLICY "Users can update own visa photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'visa-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'visa-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own photos
CREATE POLICY "Users can delete own visa photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'visa-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
