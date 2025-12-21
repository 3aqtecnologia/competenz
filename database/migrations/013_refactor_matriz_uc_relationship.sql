-- Migration: Refactor UCs to be shared across matrices
-- Description: Changes from 1:N (matriz -> UCs) to N:N (matrizes <-> UCs)
-- UCs can now be reused across multiple matrices
-- Step 1: Create junction table for matriz-UC relationship
CREATE TABLE IF NOT EXISTS matriz_ucs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matriz_id UUID NOT NULL REFERENCES matrizes(id) ON DELETE CASCADE,
    uc_id UUID NOT NULL REFERENCES unidades_curriculares(id) ON DELETE CASCADE,
    ordem INTEGER DEFAULT 0,
    periodo INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(matriz_id, uc_id)
);
-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_matriz_ucs_matriz_id ON matriz_ucs(matriz_id);
CREATE INDEX IF NOT EXISTS idx_matriz_ucs_uc_id ON matriz_ucs(uc_id);
-- Step 3: Migrate existing data from unidades_curriculares to junction table
DO $$
DECLARE uc_record RECORD;
BEGIN FOR uc_record IN
SELECT id,
    matriz_id
FROM unidades_curriculares
WHERE matriz_id IS NOT NULL LOOP -- Insert into junction table if not exists
INSERT INTO matriz_ucs (matriz_id, uc_id, periodo)
VALUES (
        uc_record.matriz_id,
        uc_record.id,
        1
    ) ON CONFLICT (matriz_id, uc_id) DO NOTHING;
END LOOP;
END $$;
-- Step 4: Remove matriz_id from unidades_curriculares (no longer needed)
-- Mark as deprecated first for backward compatibility
COMMENT ON COLUMN unidades_curriculares.matriz_id IS 'DEPRECATED: Use matriz_ucs junction table instead. Will be removed in future migration.';
-- Step 5: Add comments for new structure
COMMENT ON TABLE matriz_ucs IS 'Junction table linking matrices to UCs. Allows UCs to be shared across multiple matrices.';
COMMENT ON COLUMN matriz_ucs.matriz_id IS 'Reference to the curricular matrix';
COMMENT ON COLUMN matriz_ucs.uc_id IS 'Reference to the curricular unit';
COMMENT ON COLUMN matriz_ucs.ordem IS 'Display order within the matrix';
COMMENT ON COLUMN matriz_ucs.periodo IS 'Academic period/semester for this UC in this specific matrix';
-- Step 6: Enable RLS on junction table
ALTER TABLE matriz_ucs ENABLE ROW LEVEL SECURITY;
-- Step 7: Create RLS policy
CREATE POLICY "Enable all access for matriz_ucs" ON matriz_ucs FOR ALL USING (true) WITH CHECK (true);
-- Step 8: Update unidades_curriculares comment
COMMENT ON TABLE unidades_curriculares IS 'Curricular units that can be shared across multiple matrices. Link via matriz_ucs table.';