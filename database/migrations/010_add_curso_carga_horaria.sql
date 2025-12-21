-- Migration: Add 'carga_horaria' to 'cursos'
-- Description: Total expected hours for the course to validate matrix sum.
ALTER TABLE cursos
ADD COLUMN IF NOT EXISTS carga_horaria INTEGER DEFAULT 0;
COMMENT ON COLUMN cursos.carga_horaria IS 'Carga horária total prevista para o curso';