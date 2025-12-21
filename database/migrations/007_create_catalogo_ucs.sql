-- Migration: Create Capacities and Skills structure for UCs
-- Description: Creates catalogo_ucs table and adds detail columns to unidades_curriculares
-- 1. Create Catalog table (Banco de UCs)
CREATE TABLE IF NOT EXISTS catalogo_ucs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    area_tecnologica VARCHAR(100),
    carga_horaria INTEGER NOT NULL,
    objetivo TEXT,
    bibliografia_basica TEXT,
    capacidades_sociais TEXT [],
    -- Array de texto
    capacidades_tecnicas TEXT [],
    -- Array de texto
    capacidades_socioemocionais TEXT [],
    -- Array de texto
    conhecimentos TEXT [],
    -- Array de texto
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 2. Add detailed columns to existing 'unidades_curriculares' (Matrix instances)
-- This allows specific UCs in a Matrix to have their own capabilities defined/copied
ALTER TABLE unidades_curriculares
ADD COLUMN IF NOT EXISTS objetivo TEXT,
    ADD COLUMN IF NOT EXISTS bibliografia_basica TEXT,
    ADD COLUMN IF NOT EXISTS capacidades_sociais TEXT [],
    ADD COLUMN IF NOT EXISTS capacidades_tecnicas TEXT [],
    ADD COLUMN IF NOT EXISTS capacidades_socioemocionais TEXT [],
    ADD COLUMN IF NOT EXISTS conhecimentos TEXT [];
-- 3. RLS Policies
ALTER TABLE catalogo_ucs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for catalogo_ucs" ON catalogo_ucs FOR ALL USING (true) WITH CHECK (true);
-- Comments
COMMENT ON TABLE catalogo_ucs IS 'Catálogo central de Unidades Curriculares para reutilização em matrizes';
COMMENT ON COLUMN catalogo_ucs.capacidades_tecnicas IS 'Lista de capacidades técnicas (saber fazer)';
COMMENT ON COLUMN catalogo_ucs.conhecimentos IS 'Lista de conhecimentos (saber)';