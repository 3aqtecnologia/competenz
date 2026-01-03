-- =====================================================
-- MIGRATION 018: Sistema de Autenticação e ACL
-- =====================================================
-- Cria o sistema completo de usuários, perfis e permissões
-- para transformar o sistema em SaaS multi-tenant
-- 1. Tabela de Perfis (Roles)
CREATE TABLE IF NOT EXISTS perfis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    permissoes JSONB NOT NULL DEFAULT '{}',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 2. Tabela de Usuários
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
    -- Metadados adicionais
    metadata JSONB DEFAULT '{}'
);
-- 3. Tabela de Vinculação de Usuários com Turmas (para Analista de Educação)
CREATE TABLE IF NOT EXISTS usuario_turmas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    turma_id UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(usuario_id, turma_id)
);
-- 4. Tabela de Vinculação de Usuários com Docentes (para Coordenador Pedagógico)
CREATE TABLE IF NOT EXISTS usuario_docentes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    docente_id UUID NOT NULL REFERENCES docentes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(usuario_id, docente_id)
);
-- 5. Índices para performance
CREATE INDEX idx_usuarios_perfil ON usuarios(perfil_id);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_ativo ON usuarios(ativo);
CREATE INDEX idx_usuario_turmas_usuario ON usuario_turmas(usuario_id);
CREATE INDEX idx_usuario_turmas_turma ON usuario_turmas(turma_id);
CREATE INDEX idx_usuario_docentes_usuario ON usuario_docentes(usuario_id);
CREATE INDEX idx_usuario_docentes_docente ON usuario_docentes(docente_id);
-- 6. Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER update_perfis_updated_at BEFORE
UPDATE ON perfis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usuarios_updated_at BEFORE
UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- 7. Inserir Perfis Padrão
INSERT INTO perfis (nome, descricao, permissoes)
VALUES (
        'Administrador',
        'Gestão completa de usuários, perfis e acesso total ao sistema',
        '{
        "usuarios": ["criar", "editar", "excluir", "visualizar"],
        "perfis": ["criar", "editar", "excluir", "visualizar"],
        "dashboard": ["visualizar"],
        "secretaria": ["criar", "editar", "excluir", "visualizar"],
        "pedagogico": ["criar", "editar", "excluir", "visualizar"],
        "planejamento": ["criar", "editar", "excluir", "visualizar"]
    }'::jsonb
    ),
    (
        'Analista de Educação',
        'Acompanhamento de alunos nas turmas destinadas ao usuário',
        '{
        "dashboard": ["visualizar"],
        "pedagogico": ["visualizar"],
        "turmas": ["visualizar_vinculadas"],
        "alunos": ["visualizar", "editar"]
    }'::jsonb
    ),
    (
        'Coordenador Pedagógico',
        'Acompanhamento de docentes e planejamento de atividades',
        '{
        "dashboard": ["visualizar"],
        "pedagogico": ["criar", "editar", "visualizar"],
        "docentes": ["visualizar_vinculados"],
        "turmas": ["visualizar_por_docente"],
        "planejamento": ["visualizar"]
    }'::jsonb
    ),
    (
        'Assistente Educacional',
        'Gerencia dados das turmas e repassa informações para analistas',
        '{
        "dashboard": ["visualizar"],
        "pedagogico": ["criar", "editar", "visualizar"],
        "turmas": ["criar", "editar", "visualizar"],
        "alunos": ["criar", "editar", "visualizar"]
    }'::jsonb
    ),
    (
        'Planejamento',
        'Gerenciar turmas, docentes, ambientes, cursos e matrizes',
        '{
        "dashboard": ["visualizar"],
        "planejamento": ["criar", "editar", "excluir", "visualizar"],
        "turmas": ["criar", "editar", "visualizar"],
        "docentes": ["criar", "editar", "visualizar"],
        "ambientes": ["criar", "editar", "visualizar"],
        "cursos": ["criar", "editar", "visualizar"],
        "matrizes": ["criar", "editar", "visualizar"]
    }'::jsonb
    ),
    (
        'Secretaria',
        'Gerencia matrículas, documentos e frequência',
        '{
        "dashboard": ["visualizar"],
        "secretaria": ["criar", "editar", "excluir", "visualizar"],
        "turmas": ["visualizar"],
        "alunos": ["criar", "editar", "visualizar"],
        "matriculas": ["criar", "editar", "visualizar"],
        "documentos": ["criar", "editar", "visualizar"],
        "frequencia": ["criar", "editar", "visualizar", "enviar"]
    }'::jsonb
    );
-- 8. Criar usuário administrador padrão
-- Senha padrão: admin123 (deve ser alterada no primeiro login)
INSERT INTO usuarios (email, nome_completo, perfil_id)
SELECT 'admin@competenz.com.br',
    'Administrador do Sistema',
    id
FROM perfis
WHERE nome = 'Administrador'
LIMIT 1;
COMMENT ON TABLE perfis IS 'Perfis de acesso do sistema (Roles)';
COMMENT ON TABLE usuarios IS 'Usuários do sistema com autenticação via Supabase Auth';
COMMENT ON TABLE usuario_turmas IS 'Vinculação de usuários com turmas específicas';
COMMENT ON TABLE usuario_docentes IS 'Vinculação de usuários com docentes específicos';