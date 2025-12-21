-- Migration: Fix docentes table constraints
-- Description: Remove or update check constraints that are blocking inserts
-- Drop existing check constraint on formacao (if exists)
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'docentes_formacao_check'
) THEN
ALTER TABLE docentes DROP CONSTRAINT docentes_formacao_check;
END IF;
END $$;
-- Drop any other problematic constraints
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'docentes_tipo_vinculo_check'
) THEN
ALTER TABLE docentes DROP CONSTRAINT docentes_tipo_vinculo_check;
END IF;
END $$;
-- Optionally, add new flexible check constraints (commented out - uncomment if needed)
-- ALTER TABLE docentes 
-- ADD CONSTRAINT docentes_formacao_check 
-- CHECK (formacao IN ('Médio', 'Superior', 'Pós-Graduação', 'Mestrado', 'Doutorado') OR formacao IS NULL);
-- ALTER TABLE docentes 
-- ADD CONSTRAINT docentes_tipo_vinculo_check 
-- CHECK (tipo_vinculo IN ('Horista', 'Mensalista', 'CLT', 'PJ') OR tipo_vinculo IS NULL);
-- ALTER TABLE docentes 
-- ADD CONSTRAINT docentes_status_check 
-- CHECK (status IN ('Ativo', 'Inativo') OR status IS NULL);
-- Verify the table structure
SELECT column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'docentes'
ORDER BY ordinal_position;