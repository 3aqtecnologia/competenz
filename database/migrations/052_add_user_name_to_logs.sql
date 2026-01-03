-- Migration: 052_add_user_name_to_logs.sql
-- Description: Adiciona o nome do usuário ao log para facilitar leitura direta (denormalização)
ALTER TABLE public.logs_acesso
ADD COLUMN IF NOT EXISTS nome_usuario TEXT;
-- Tentar preencher logs passados (se possível)
DO $$ BEGIN
UPDATE public.logs_acesso l
SET nome_usuario = u.nome_completo
FROM public.usuarios u
WHERE l.usuario_id = u.id
    AND l.nome_usuario IS NULL;
END $$;