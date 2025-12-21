-- Migration: Refactor Course-Matrix Relationship
-- Description: Changes from 1:N (curso -> matrizes) to N:1 (cursos -> matriz)
-- Each course has ONE matrix, but a matrix can be shared by multiple courses
-- Step 1: Add matriz_id column to cursos table
ALTER TABLE cursos
ADD COLUMN IF NOT EXISTS matriz_id UUID REFERENCES matrizes(id) ON DELETE
SET NULL;
-- Step 2: Create index for performance
CREATE INDEX IF NOT EXISTS idx_cursos_matriz_id ON cursos(matriz_id);
-- Step 3: Migrate existing data
-- For each course, find its active matrix and link it
DO $$
DECLARE curso_record RECORD;
active_matriz_id UUID;
BEGIN FOR curso_record IN
SELECT id
FROM cursos LOOP -- Find the active matrix for this course
SELECT id INTO active_matriz_id
FROM matrizes
WHERE curso_id = curso_record.id
    AND status = 'Ativa'
LIMIT 1;
-- If found, link it to the course
IF active_matriz_id IS NOT NULL THEN
UPDATE cursos
SET matriz_id = active_matriz_id
WHERE id = curso_record.id;
END IF;
END LOOP;
END $$;
-- Step 4: Remove curso_id from matrizes (no longer needed)
-- But keep it for now to avoid breaking existing code
-- We'll mark it as deprecated with a comment
COMMENT ON COLUMN matrizes.curso_id IS 'DEPRECATED: Use cursos.matriz_id instead. Will be removed in future migration.';
-- Step 5: Remove status column from matrizes (no longer needed since only one matrix per course)
-- Keep it for backward compatibility but mark as deprecated
COMMENT ON COLUMN matrizes.status IS 'DEPRECATED: Status is now determined by curso.matriz_id link. Will be removed in future migration.';
-- Step 6: Add comments for new structure
COMMENT ON COLUMN cursos.matriz_id IS 'Reference to the active curricular matrix for this course. A matrix can be shared by multiple courses.';
COMMENT ON TABLE matrizes IS 'Curricular matrices that can be shared across multiple courses. Each course links to one matrix via cursos.matriz_id.';