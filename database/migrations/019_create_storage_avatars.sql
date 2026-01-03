-- Migration 019: Create Storage Bucket for Avatars
-- 1. Create Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
-- 2. Policies
-- Public Acces for Reading
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
        AND tablename = 'objects'
        AND policyname = 'Public Access'
) THEN CREATE POLICY "Public Access" ON storage.objects FOR
SELECT USING (bucket_id = 'avatars');
END IF;
END $$;
-- Authenticated Upload
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
        AND tablename = 'objects'
        AND policyname = 'Authenticated Upload'
) THEN CREATE POLICY "Authenticated Upload" ON storage.objects FOR
INSERT WITH CHECK (
        bucket_id = 'avatars'
        AND auth.role() = 'authenticated'
    );
END IF;
END $$;
-- Update Own Avatar
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
        AND tablename = 'objects'
        AND policyname = 'User Update Own'
) THEN CREATE POLICY "User Update Own" ON storage.objects FOR
UPDATE USING (
        bucket_id = 'avatars'
        AND auth.uid() = owner
    );
END IF;
END $$;