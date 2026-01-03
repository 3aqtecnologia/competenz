-- Migration: 050_create_access_logs.sql
-- Description: Cria tabela para auditoria de acessos (Logs de Login)
CREATE TABLE IF NOT EXISTS public.logs_acesso (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('america/fortaleza', now()) NOT NULL
);
-- Indexes
CREATE INDEX IF NOT EXISTS idx_logs_usuario ON public.logs_acesso(usuario_id);
CREATE INDEX IF NOT EXISTS idx_logs_data ON public.logs_acesso(created_at DESC);
-- RLS
ALTER TABLE public.logs_acesso ENABLE ROW LEVEL SECURITY;
-- Policies
CREATE POLICY "Usuarios podem ver seus proprios logs" ON public.logs_acesso FOR
SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "Usuarios podem inserir logs" ON public.logs_acesso FOR
INSERT WITH CHECK (auth.uid() = usuario_id);