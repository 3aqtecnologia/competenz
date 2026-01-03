-- Migration: 020_create_secretaria_module.sql (UPDATED)
-- Description: Cria tabelas para gestão de alunos (update), matrículas, empresas e documentos
-- 1. Empresas (Parceiras de Aprendizagem)
CREATE TABLE IF NOT EXISTS public.empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20) UNIQUE,
    responsavel_nome VARCHAR(255),
    responsavel_email VARCHAR(255),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- 2. Alunos (Update existing table)
ALTER TABLE public.alunos
ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE public.alunos
ADD COLUMN IF NOT EXISTS telefone VARCHAR(20);
ALTER TABLE public.alunos
ADD COLUMN IF NOT EXISTS data_nascimento DATE;
ALTER TABLE public.alunos
ADD COLUMN IF NOT EXISTS matricula_sge VARCHAR(50);
ALTER TABLE public.alunos
ADD COLUMN IF NOT EXISTS foto_url TEXT;
ALTER TABLE public.alunos
ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id);
-- Ensure Constraints (Unique Matricula if not exists)
-- DO $$ BEGIN
--     IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'alunos_matricula_sge_key') THEN
--         ALTER TABLE public.alunos ADD CONSTRAINT alunos_matricula_sge_key UNIQUE (matricula_sge);
--     END IF;
-- END $$;
-- 3. Matrículas (Vínculo Aluno <-> Turma)
CREATE TABLE IF NOT EXISTS public.matriculas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE,
    turma_id UUID REFERENCES public.turmas(id) ON DELETE CASCADE,
    data_matricula DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'Ativa',
    -- Ativa, Cancelada, Transferida
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(aluno_id, turma_id)
);
-- 4. Documentos / Atestados
CREATE TABLE IF NOT EXISTS public.documentos_alunos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL,
    -- Atestado Médico, Declaração Trabalho, RG, CPF...
    descricao TEXT,
    arquivo_url TEXT NOT NULL,
    data_upload TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'Pendente',
    -- Pendente, Aprovado, Rejeitado
    validado_por UUID REFERENCES auth.users(id)
);
-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_alunos_empresa ON public.alunos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_turma ON public.matriculas(turma_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_aluno ON public.matriculas(aluno_id);
-- RLS Policies (Basic)
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matriculas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos_alunos ENABLE ROW LEVEL SECURITY;
-- Allow read access
DO $$ BEGIN CREATE POLICY "Enable read access for authenticated users" ON public.empresas FOR
SELECT USING (auth.role() = 'authenticated');
EXCEPTION
WHEN duplicate_object THEN NULL;
END $$;
-- Alunos policy might already exist, try creating if not
DO $$ BEGIN CREATE POLICY "Enable read access for authenticated users" ON public.matriculas FOR
SELECT USING (auth.role() = 'authenticated');
EXCEPTION
WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN CREATE POLICY "Enable read access for authenticated users" ON public.documentos_alunos FOR
SELECT USING (auth.role() = 'authenticated');
EXCEPTION
WHEN duplicate_object THEN NULL;
END $$;
-- Policies for Alunos (Handling existing policies simply)
-- Assuming existing policies are sufficient or we verify later.