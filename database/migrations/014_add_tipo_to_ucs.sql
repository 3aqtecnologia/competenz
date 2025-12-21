-- Migration: Add Missing 'tipo' Column to Unidades Curriculares
-- Description: Adds 'tipo' column which is required by the frontend but missing in the schema.
ALTER TABLE unidades_curriculares
ADD COLUMN IF NOT EXISTS tipo VARCHAR(50) DEFAULT 'Base';
COMMENT ON COLUMN unidades_curriculares.tipo IS 'Tipo da Unidade Curricular (ex: Base, Específica, etc)';