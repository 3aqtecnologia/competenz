-- Migration: 040_add_responsaveis_turma.sql
-- Description: Adiciona colunas para vincular Coordenador Pedagógico e Analista de Educação à turma.
ALTER TABLE public.turmas
ADD COLUMN IF NOT EXISTS coordenador_id UUID REFERENCES public.usuarios(id),
    ADD COLUMN IF NOT EXISTS analista_id UUID REFERENCES public.usuarios(id);
-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_turmas_coordenador ON public.turmas(coordenador_id);
CREATE INDEX IF NOT EXISTS idx_turmas_analista ON public.turmas(analista_id);