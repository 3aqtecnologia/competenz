-- Migration: Change area_tecnologica to array in UC tables
-- Description: Allows UCs to belong to multiple technological areas
-- 1. Update catalogo_ucs table
ALTER TABLE catalogo_ucs DROP COLUMN IF EXISTS area_tecnologica;
ALTER TABLE catalogo_ucs
ADD COLUMN area_tecnologica TEXT [];
-- 2. Update unidades_curriculares table (used in matrices)
ALTER TABLE unidades_curriculares DROP COLUMN IF EXISTS area_tecnologica;
ALTER TABLE unidades_curriculares
ADD COLUMN area_tecnologica TEXT [];
-- Comments
COMMENT ON COLUMN catalogo_ucs.area_tecnologica IS 'Array de áreas tecnológicas às quais a UC pertence';
COMMENT ON COLUMN unidades_curriculares.area_tecnologica IS 'Array de áreas tecnológicas (copiado do catálogo ou definido manualmente)';