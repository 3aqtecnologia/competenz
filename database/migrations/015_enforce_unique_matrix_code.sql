-- Migration: Enforce Unique and Not Null Matrix Code
-- Description: Ensures that each matrix has a unique code and that the code is mandatory.
-- Step 1: Ensure column is NOT NULL (it was already created as NOT NULL in 006, but enforcing here)
ALTER TABLE matrizes
ALTER COLUMN codigo
SET NOT NULL;
-- Step 2: Add UNIQUE constraint
-- Using IF NOT EXISTS logic via DO block to prevent errors if running multiple times
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'matrizes_codigo_key'
) THEN
ALTER TABLE matrizes
ADD CONSTRAINT matrizes_codigo_key UNIQUE (codigo);
END IF;
END $$;
COMMENT ON COLUMN matrizes.codigo IS 'Código único de identificação da matriz (ex: 2024.1). Deve ser único no sistema.';