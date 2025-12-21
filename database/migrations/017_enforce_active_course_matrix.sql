-- Migration: Enforce Active Course must have Matrix
-- Description: Adds a CHECK constraint to ensure courses with status 'Ativo' have a not-null matriz_id.
DO $$ BEGIN -- Check if there are any invalid records first and fix them (set to Inativo)
-- This avoids the migration failing if bad data exists
UPDATE cursos
SET status = 'Inativo'
WHERE status = 'Ativo'
    AND matriz_id IS NULL;
-- Add the constraint only if it doesn't exist to prevent errors
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'check_curso_ativo_has_matriz'
) THEN
ALTER TABLE cursos
ADD CONSTRAINT check_curso_ativo_has_matriz CHECK (
        status != 'Ativo'
        OR matriz_id IS NOT NULL
    );
END IF;
END $$;
COMMENT ON CONSTRAINT check_curso_ativo_has_matriz ON cursos IS 'Ensures that an Active course must always have a linked Matrix.';