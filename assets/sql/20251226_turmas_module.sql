-- =====================================================
-- TURMAS MODULE - Database Setup
-- =====================================================
-- This script is idempotent and can be run multiple times
-- 1. Create Turmas Table (if not exists)
CREATE TABLE IF NOT EXISTS public.turmas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    nome TEXT NOT NULL,
    matriz_id UUID REFERENCES public.matrizes(id),
    curso_id UUID REFERENCES public.cursos(id),
    data_inicio DATE,
    data_fim_previsao DATE,
    turno TEXT CHECK (turno IN ('Manhã', 'Tarde', 'Noite', 'Integral')),
    horas_diarias INTEGER DEFAULT 4,
    status TEXT DEFAULT 'Planejamento' CHECK (
        status IN (
            'Planejamento',
            'Em Andamento',
            'Concluída',
            'Cancelada'
        )
    )
);
-- Add codigo_sge column if it doesn't exist and add unique constraint
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
        AND table_name = 'turmas'
        AND column_name = 'codigo_sge'
) THEN
ALTER TABLE public.turmas
ADD COLUMN codigo_sge TEXT;
END IF;
-- Add UNIQUE constraint to codigo_sge if not exists
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'turmas_codigo_sge_key'
) THEN
ALTER TABLE public.turmas
ADD CONSTRAINT turmas_codigo_sge_key UNIQUE (codigo_sge);
END IF;
-- Make codigo_sge TEXT (if not already) and nullable/required as needed
-- (We keep it nullable in DB to avoid mig issues, but required in APP)
ALTER TABLE public.turmas
ALTER COLUMN codigo_sge TYPE TEXT;
EXCEPTION
WHEN duplicate_column THEN RAISE NOTICE 'Column already exists';
END;
$$;
-- 2. Add dias_aula column if it doesn't exist
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
        AND table_name = 'turmas'
        AND column_name = 'dias_aula'
) THEN
ALTER TABLE public.turmas
ADD COLUMN dias_aula JSONB DEFAULT '[]'::jsonb;
END IF;
END $$;
-- 3. Create Lotacoes Table (if not exists)
CREATE TABLE IF NOT EXISTS public.lotacoes_turma (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    turma_id UUID REFERENCES public.turmas(id) ON DELETE CASCADE,
    uc_id UUID REFERENCES public.unidades_curriculares(id),
    docente_id UUID REFERENCES public.docentes(id),
    data_inicio DATE,
    data_fim DATE,
    status TEXT DEFAULT 'Pendente' CHECK (
        status IN ('Pendente', 'Confirmado', 'Ministrado')
    )
);
-- 4. Create Indexes
CREATE INDEX IF NOT EXISTS idx_turmas_matriz ON public.turmas(matriz_id);
CREATE INDEX IF NOT EXISTS idx_turmas_curso ON public.turmas(curso_id);
CREATE INDEX IF NOT EXISTS idx_lotacoes_turma ON public.lotacoes_turma(turma_id);
CREATE INDEX IF NOT EXISTS idx_lotacoes_uc ON public.lotacoes_turma(uc_id);
CREATE INDEX IF NOT EXISTS idx_lotacoes_docente ON public.lotacoes_turma(docente_id);
-- 5. Enable RLS (Row Level Security)
ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lotacoes_turma ENABLE ROW LEVEL SECURITY;
-- 6. Create Policies (Permissive for development)
DROP POLICY IF EXISTS "Public Turmas" ON public.turmas;
CREATE POLICY "Public Turmas" ON public.turmas FOR ALL USING (true);
DROP POLICY IF EXISTS "Public Lotacoes" ON public.lotacoes_turma;
CREATE POLICY "Public Lotacoes" ON public.lotacoes_turma FOR ALL USING (true);
-- 7. Success Message
DO $$ BEGIN RAISE NOTICE 'Turmas module setup completed successfully!';
END $$;