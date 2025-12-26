-- Execute this in your Supabase SQL Editor
-- 1. Add column for photo URL
ALTER TABLE public.docentes
ADD COLUMN IF NOT EXISTS foto_url TEXT;
-- 2. Create Storage Bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('docentes-fotos', 'docentes-fotos', true) ON CONFLICT (id) DO NOTHING;
-- 3. Set up Storage Policies (Allowing public read/write for this demo)
-- NOTE: In production, restrict INSERT/UPDATE/DELETE to authenticated roles
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'objects'
        AND policyname = 'Public Access Docentes Fotos'
) THEN CREATE POLICY "Public Access Docentes Fotos" ON storage.objects FOR
SELECT USING (bucket_id = 'docentes-fotos');
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'objects'
        AND policyname = 'Upload Docentes Fotos'
) THEN CREATE POLICY "Upload Docentes Fotos" ON storage.objects FOR
INSERT WITH CHECK (bucket_id = 'docentes-fotos');
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'objects'
        AND policyname = 'Update Docentes Fotos'
) THEN CREATE POLICY "Update Docentes Fotos" ON storage.objects FOR
UPDATE USING (bucket_id = 'docentes-fotos');
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'objects'
        AND policyname = 'Delete Docentes Fotos'
) THEN CREATE POLICY "Delete Docentes Fotos" ON storage.objects FOR DELETE USING (bucket_id = 'docentes-fotos');
END IF;
END $$;