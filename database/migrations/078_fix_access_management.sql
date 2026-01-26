-- =====================================================
-- MIGRATION 078: Fix Access Management Module
-- =====================================================
-- Ensures all necessary tables and permissions exist
-- Runs idempotently to repair any missing schema elements
-- 1. Ensure 'perfis' table exists
CREATE TABLE IF NOT EXISTS perfis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    permissoes JSONB NOT NULL DEFAULT '{}',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 2. Ensure 'usuarios' table exists
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    nome_completo VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    perfil_id UUID NOT NULL REFERENCES perfis(id),
    ativo BOOLEAN DEFAULT true,
    ultimo_acesso TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);
-- 3. Ensure Junction Tables exist
CREATE TABLE IF NOT EXISTS usuario_turmas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    turma_id UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(usuario_id, turma_id)
);
CREATE TABLE IF NOT EXISTS usuario_docentes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    docente_id UUID NOT NULL REFERENCES docentes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(usuario_id, docente_id)
);
-- 4. Enable RLS (Security Best Practice) but allow access for now
-- Check if RLS is enabled, if not enable it
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public'
        AND tablename = 'perfis'
        AND rowsecurity = true
) THEN
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public'
        AND tablename = 'usuarios'
        AND rowsecurity = true
) THEN
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
END IF;
END $$;
-- 5. Create permissive policies if they don't exist (Fixes "Access Denied" if RLS is on)
-- Policy for 'perfis' - Allow Read for everyone, Write for Admins (simplified to authenticated for now to ensure function)
DO $$ BEGIN DROP POLICY IF EXISTS "Enable read access for all users" ON perfis;
CREATE POLICY "Enable read access for all users" ON perfis FOR
SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON perfis;
CREATE POLICY "Enable insert for authenticated users only" ON perfis FOR
INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON perfis;
CREATE POLICY "Enable update for authenticated users only" ON perfis FOR
UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON perfis;
CREATE POLICY "Enable delete for authenticated users only" ON perfis FOR DELETE USING (auth.role() = 'authenticated');
END $$;
-- Policy for 'usuarios'
DO $$ BEGIN DROP POLICY IF EXISTS "Enable read access for all users" ON usuarios;
CREATE POLICY "Enable read access for all users" ON usuarios FOR
SELECT USING (true);
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON usuarios;
CREATE POLICY "Enable all access for authenticated users" ON usuarios FOR ALL USING (auth.role() = 'authenticated');
END $$;
-- 6. Grant Permissions (Crucial for Anon Access if RLS is off, or generally required)
GRANT ALL ON perfis TO anon,
    authenticated,
    service_role;
GRANT ALL ON usuarios TO anon,
    authenticated,
    service_role;
GRANT ALL ON usuario_turmas TO anon,
    authenticated,
    service_role;
GRANT ALL ON usuario_docentes TO anon,
    authenticated,
    service_role;
-- 7. Ensure Standard Profiles Exist (Idempotent Insert)
INSERT INTO perfis (nome, descricao, permissoes)
VALUES (
        'Administrador',
        'Gestão completa de usuários, perfis e acesso total ao sistema',
        '{
        "dashboard": ["visualizar"],
        "secretaria": ["visualizar", "criar", "editar", "excluir"],
        "pedagogico": ["visualizar", "criar", "editar"],
        "planejamento": ["visualizar", "criar", "editar", "excluir"],
        "usuarios": ["visualizar", "criar", "editar", "excluir"],
        "perfis": ["visualizar", "criar", "editar", "excluir"],
        "turmas": ["visualizar", "criar", "editar", "excluir", "visualizar_vinculadas", "visualizar_por_docente"],
        "docentes": ["visualizar", "criar", "editar", "visualizar_vinculados"],
        "alunos": ["visualizar", "criar", "editar", "excluir"],
        "ambientes": ["visualizar", "criar", "editar", "excluir"],
        "cursos": ["visualizar", "criar", "editar", "excluir"],
        "matrizes": ["visualizar", "criar", "editar", "excluir"],
        "frequencia": ["visualizar", "criar", "editar", "enviar"]
    }'::jsonb
    ) ON CONFLICT (nome) DO
UPDATE
SET permissoes = EXCLUDED.permissoes;
-- 8. Ensure Admin User Exists
-- Checks if an admin exists, if not creates one
DO $$
DECLARE admin_profile_id UUID;
BEGIN
SELECT id INTO admin_profile_id
FROM perfis
WHERE nome = 'Administrador'
LIMIT 1;
IF admin_profile_id IS NOT NULL THEN IF NOT EXISTS (
    SELECT 1
    FROM usuarios
    WHERE email = 'admin@competenz.com.br'
) THEN
INSERT INTO usuarios (email, nome_completo, perfil_id, ativo)
VALUES (
        'admin@competenz.com.br',
        'Administrador do Sistema',
        admin_profile_id,
        true
    );
END IF;
END IF;
END $$;
COMMENT ON TABLE usuarios IS 'System users (Repaired)';