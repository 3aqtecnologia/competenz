-- Migration: Add 'carga_horaria_total' to 'matrizes'
-- Description: Store the calculated total workload of the matrix (sum of UCs)
ALTER TABLE matrizes
ADD COLUMN IF NOT EXISTS carga_horaria_total INTEGER DEFAULT 0;
COMMENT ON COLUMN matrizes.carga_horaria_total IS 'Soma da carga horária de todas as UCs vinculadas';