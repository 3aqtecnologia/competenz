-- Migration: 051_add_action_to_logs.sql
-- Description: Adiciona coluna 'acao' para diferenciar LOGIN de LOGOUT
ALTER TABLE public.logs_acesso
ADD COLUMN IF NOT EXISTS acao TEXT NOT NULL DEFAULT 'LOGIN';
-- Check constraint para garantir integridade
ALTER TABLE public.logs_acesso
ADD CONSTRAINT check_acao_valida CHECK (acao IN ('LOGIN', 'LOGOUT'));
-- Atualizar logs antigos (se houver)
UPDATE public.logs_acesso
SET acao = 'LOGIN'
WHERE acao IS NULL;