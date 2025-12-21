-- Migration: Add missing fields to catalogo_ucs
-- Description: Adds 'ativo' and 'tipo', and converts 'area_tecnologica' to array text[] to support multi-select.
-- 1. Add missing scalar fields
ALTER TABLE catalogo_ucs
ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS tipo VARCHAR(50);
-- 2. Alter area_tecnologica to support multiple select (Array)
-- We use a safe conversion strategy: string -> array[string]
DO $$ BEGIN -- Check if column exists and is not an array yet (data_type 'character varying' vs 'ARRAY')
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'catalogo_ucs'
        AND column_name = 'area_tecnologica'
        AND data_type NOT LIKE '%[]%'
) THEN -- First drop default if exists to avoid casting issues
ALTER TABLE catalogo_ucs
ALTER COLUMN area_tecnologica DROP DEFAULT;
-- Convert
ALTER TABLE catalogo_ucs
ALTER COLUMN area_tecnologica TYPE TEXT [] USING CASE
        WHEN area_tecnologica IS NULL
        OR area_tecnologica = '' THEN '{}'
        ELSE ARRAY [area_tecnologica]::TEXT []
    END;
-- Set defaut to empty array
ALTER TABLE catalogo_ucs
ALTER COLUMN area_tecnologica
SET DEFAULT '{}';
END IF;
END $$;