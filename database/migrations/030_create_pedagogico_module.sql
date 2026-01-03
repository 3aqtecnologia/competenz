-- Migration: 030_create_pedagogico_module.sql (Final Fix)
-- Description: Cria tabelas para gestão pedagógica. ATENÇÃO: 'avaliacoes' mudou para 'avaliacoes_turma' devido a conflito legado.
-- 1. Registro de Aulas (Diário de Classe)
CREATE TABLE IF NOT EXISTS public.aulas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    turma_id UUID NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
    docente_id UUID REFERENCES public.docentes(id),
    uc_id UUID REFERENCES public.matriz_ucs(id),
    data_aula DATE NOT NULL DEFAULT CURRENT_DATE,
    horario_inicio TIME,
    horario_fim TIME,
    conteudo_ministrado TEXT NOT NULL,
    metodologia TEXT,
    recursos_utilizados TEXT,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- 2. Frequência 
CREATE TABLE IF NOT EXISTS public.frequencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aula_id UUID NOT NULL REFERENCES public.aulas(id) ON DELETE CASCADE,
    aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
    presente BOOLEAN DEFAULT true,
    justificativa TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(aula_id, aluno_id)
);
-- 3. Avaliações (RENOMEADO de avaliacoes para avaliacoes_turma)
CREATE TABLE IF NOT EXISTS public.avaliacoes_turma (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    turma_id UUID NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
    uc_id UUID REFERENCES public.matriz_ucs(id),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(50) DEFAULT 'Prova',
    data_agendada DATE,
    valor_maximo DECIMAL(5, 2) DEFAULT 100.00,
    peso DECIMAL(5, 2) DEFAULT 1.0,
    status VARCHAR(20) DEFAULT 'Agendada',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- 4. Notas (References avaliacoes_turma)
CREATE TABLE IF NOT EXISTS public.notas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    avaliacao_id UUID NOT NULL REFERENCES public.avaliacoes_turma(id) ON DELETE CASCADE,
    aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
    nota_obtida DECIMAL(5, 2),
    feedback TEXT,
    data_lancamento TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(avaliacao_id, aluno_id)
);
-- Indexes
CREATE INDEX IF NOT EXISTS idx_aulas_turma ON public.aulas(turma_id);
CREATE INDEX IF NOT EXISTS idx_aulas_data ON public.aulas(data_aula);
CREATE INDEX IF NOT EXISTS idx_frequencias_aula ON public.frequencias(aula_id);
CREATE INDEX IF NOT EXISTS idx_frequencias_aluno ON public.frequencias(aluno_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_turma ON public.avaliacoes_turma(turma_id);
CREATE INDEX IF NOT EXISTS idx_notas_avaliacao ON public.notas(avaliacao_id);
CREATE INDEX IF NOT EXISTS idx_notas_aluno ON public.notas(aluno_id);
-- RLS Policies
ALTER TABLE public.aulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frequencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes_turma ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notas ENABLE ROW LEVEL SECURITY;
-- Read Access
DO $$ BEGIN CREATE POLICY "Enable read access for authenticated users" ON public.aulas FOR
SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON public.frequencias FOR
SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON public.avaliacoes_turma FOR
SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON public.notas FOR
SELECT USING (auth.role() = 'authenticated');
EXCEPTION
WHEN duplicate_object THEN NULL;
END $$;
-- Write Access
DO $$ BEGIN CREATE POLICY "Enable insert for authenticated users" ON public.aulas FOR
INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.aulas FOR
UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON public.frequencias FOR
INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.frequencias FOR
UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON public.avaliacoes_turma FOR
INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.avaliacoes_turma FOR
UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON public.notas FOR
INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.notas FOR
UPDATE USING (auth.role() = 'authenticated');
EXCEPTION
WHEN duplicate_object THEN NULL;
END $$;