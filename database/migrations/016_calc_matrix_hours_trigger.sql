-- Migration: Auto-calculate Matrix Total Hours
-- Description: Creates a trigger to automatically update matrizes.carga_horaria_total when UCs are linked/unlinked.
-- 1. Create the function to calculate and update total hours
CREATE OR REPLACE FUNCTION update_matriz_total_hours() RETURNS TRIGGER AS $$
DECLARE target_matriz_id UUID;
total_hours INTEGER;
BEGIN -- Determine which matrix to update (handle INSERT, DELETE, UPDATE)
IF (TG_OP = 'DELETE') THEN target_matriz_id := OLD.matriz_id;
ELSE target_matriz_id := NEW.matriz_id;
END IF;
-- Calculate total hours by joining junction table with UCs table
SELECT COALESCE(SUM(uc.carga_horaria), 0) INTO total_hours
FROM matriz_ucs mu
    JOIN unidades_curriculares uc ON mu.uc_id = uc.id
WHERE mu.matriz_id = target_matriz_id;
-- Update the matrix record
UPDATE matrizes
SET carga_horaria_total = total_hours
WHERE id = target_matriz_id;
RETURN NULL;
-- Result is ignored for AFTER triggers
END;
$$ LANGUAGE plpgsql;
-- 2. Create the trigger on matriz_ucs
DROP TRIGGER IF EXISTS trigger_update_matriz_hours ON matriz_ucs;
CREATE TRIGGER trigger_update_matriz_hours
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON matriz_ucs FOR EACH ROW EXECUTE FUNCTION update_matriz_total_hours();
-- 3. Also create a trigger on unidades_curriculares in case the UC hours change
-- This is tricky because a UC can belong to multiple matrices.
-- We need to update ALL matrices that use this UC.
CREATE OR REPLACE FUNCTION update_matrices_on_uc_change() RETURNS TRIGGER AS $$ BEGIN -- Update all matrices linked to this updated/deleted UC
    -- We get the list of matrix_ids from existing links
    -- Note: loops over all affected matrices
UPDATE matrizes
SET carga_horaria_total = (
        SELECT COALESCE(SUM(uc.carga_horaria), 0)
        FROM matriz_ucs mu
            JOIN unidades_curriculares uc ON mu.uc_id = uc.id
        WHERE mu.matriz_id = matrizes.id
    )
WHERE id IN (
        SELECT matriz_id
        FROM matriz_ucs
        WHERE uc_id = COALESCE(NEW.id, OLD.id)
    );
RETURN NULL;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trigger_update_hours_on_uc_change ON unidades_curriculares;
CREATE TRIGGER trigger_update_hours_on_uc_change
AFTER
UPDATE OF carga_horaria
    OR DELETE ON unidades_curriculares FOR EACH ROW EXECUTE FUNCTION update_matrices_on_uc_change();
-- 4. Recalculate everything now to ensure consistency
DO $$
DECLARE m_rec RECORD;
BEGIN FOR m_rec IN
SELECT id
FROM matrizes LOOP
UPDATE matrizes
SET carga_horaria_total = (
        SELECT COALESCE(SUM(uc.carga_horaria), 0)
        FROM matriz_ucs mu
            JOIN unidades_curriculares uc ON mu.uc_id = uc.id
        WHERE mu.matriz_id = m_rec.id
    )
WHERE id = m_rec.id;
END LOOP;
END $$;