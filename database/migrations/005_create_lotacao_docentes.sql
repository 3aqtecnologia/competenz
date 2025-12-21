-- Migration: Create tables for Curricular Units and Allocation (Lotação)
-- Description: Creates unidades_curriculares linked to matrices and lotacoes linked to classes and teachers.
-- 1. Create table for Curricular Units (if not exists)
CREATE TABLE IF NOT EXISTS unidades_curriculares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matriz_id UUID REFERENCES matrizes(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    sigla VARCHAR(20),
    carga_horaria INTEGER NOT NULL,
    periodo INTEGER,
    -- 1º Semestre, 2º Semestre, etc.
    area_tecnologica VARCHAR(100),
    -- Critical for validation
    tipo VARCHAR(50),
    -- Base, Técnica, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_uc_matriz ON unidades_curriculares(matriz_id);
-- 2. Create table for Allocation (Lotação)
CREATE TABLE IF NOT EXISTS lotacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    turma_id UUID REFERENCES turmas(id) ON DELETE CASCADE,
    unidade_curricular_id UUID REFERENCES unidades_curriculares(id) ON DELETE CASCADE,
    docente_id UUID REFERENCES docentes(id) ON DELETE
    SET NULL,
        dia_semana VARCHAR(20),
        -- Segunda, Terça...
        horario_inicio TIME,
        horario_fim TIME,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        -- Ensure unique assignment per time slot (simplified constraint)
        -- This constraint is complex in practice due to time ranges, keeping simple for now
        CONSTRAINT unique_allocation_slot UNIQUE (
            turma_id,
            unidade_curricular_id,
            docente_id,
            dia_semana
        )
);
-- Add comments
COMMENT ON TABLE unidades_curriculares IS 'Unidades Curriculares (disciplinas) vinculadas a uma matriz';
COMMENT ON TABLE lotacoes IS 'Lotação de docentes em unidades curriculares de uma turma';
-- 3. Trigger to Validate Area Match
-- Function to check if teacher's area matches UC's area
CREATE OR REPLACE FUNCTION check_lotacao_area_match() RETURNS TRIGGER AS $$
DECLARE uc_area VARCHAR;
docente_areas TEXT [];
BEGIN -- Get UC area
SELECT area_tecnologica INTO uc_area
FROM unidades_curriculares
WHERE id = NEW.unidade_curricular_id;
-- Get Teacher areas
SELECT areas_atuacao INTO docente_areas
FROM docentes
WHERE id = NEW.docente_id;
-- If either is missing, we might allow or block. Assuming strict blocking here.
IF uc_area IS NULL THEN RAISE EXCEPTION 'A Unidade Curricular selecionada não possui área tecnológica definida.';
END IF;
IF docente_areas IS NULL THEN RAISE EXCEPTION 'O Docente selecionado não possui áreas de atuação definidas.';
END IF;
-- Check if UC area contains in Teacher areas
-- Note: This is an array check. 
-- We check if the uc_area string exists in the docente_areas array.
IF NOT (uc_area = ANY(docente_areas)) THEN RAISE EXCEPTION 'O Docente não possui a área de atuação necessária (%) para esta Unidade Curricular.',
uc_area;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Attach trigger to lotacoes table
DROP TRIGGER IF EXISTS trg_check_lotacao_area ON lotacoes;
CREATE TRIGGER trg_check_lotacao_area BEFORE
INSERT
    OR
UPDATE ON lotacoes FOR EACH ROW EXECUTE FUNCTION check_lotacao_area_match();
-- 4. Seed some sample Units (optional, for testing if Matrizes exist)
-- Assuming we might need to populate this manually or via UI