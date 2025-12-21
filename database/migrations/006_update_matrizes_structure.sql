-- Migration: Ensure Matrizes table structure and policies
-- Description: Updates matrizes table to match requirements and ensures RLS policies
-- 1. Ensure Matrizes table exists with correct columns
CREATE TABLE IF NOT EXISTS matrizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
    codigo VARCHAR(50) NOT NULL,
    -- Código de Identificação
    status VARCHAR(20) DEFAULT 'Ativa',
    -- 'Ativa' ou 'Inativa'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 2. Add comments
COMMENT ON TABLE matrizes IS 'Matrizes curriculares vinculadas a cursos';
COMMENT ON COLUMN matrizes.codigo IS 'Código de identificação da matriz (ex: 2024.1)';
COMMENT ON COLUMN matrizes.status IS 'Status da matriz: Ativa ou Inativa';
-- 3. Ensure Unidades Curriculares table exists (created in 005 but reinforcing structure)
CREATE TABLE IF NOT EXISTS unidades_curriculares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matriz_id UUID REFERENCES matrizes(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    carga_horaria INTEGER NOT NULL,
    area_tecnologica VARCHAR(100),
    -- Important for allocation logic provided in previous step
    tipo VARCHAR(50) DEFAULT 'Base',
    -- Optional but good for structure
    periodo INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 4. Create RLS Policies (if not enabled)
ALTER TABLE matrizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE unidades_curriculares ENABLE ROW LEVEL SECURITY;
-- Policy for Matrizes: Allow all operations for authenticated users (simplified for prototype)
CREATE POLICY "Enable all access for matrizes" ON matrizes FOR ALL USING (true) WITH CHECK (true);
-- Policy for UCs: Allow all operations
CREATE POLICY "Enable all access for ucs" ON unidades_curriculares FOR ALL USING (true) WITH CHECK (true);