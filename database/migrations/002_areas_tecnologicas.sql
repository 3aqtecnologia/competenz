-- ============================================================================
-- Script de Criação e População da Tabela: areas_tecnologicas
-- Sistema: TrilhaTec - Gestão Escolar
-- Autor: Sistema
-- Data: 2025-12-17
-- Descrição: Estrutura para armazenar as áreas tecnológicas/eixos de formação
-- ============================================================================
-- 1. CONFIGURAÇÃO INICIAL - Habilitar extensões necessárias
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- Para gen_random_uuid()
-- 2. DDL - CRIAÇÃO DA TABELA
-- ============================================================================
CREATE TABLE IF NOT EXISTS areas_tecnologicas (
    -- Identificador único (UUID)
    id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    -- Nome da área tecnológica (único)
    nome VARCHAR(100) NOT NULL UNIQUE,
    -- Slug para URLs amigáveis (único)
    slug VARCHAR(100) NOT NULL UNIQUE,
    -- Descrição detalhada da área (opcional)
    descricao TEXT,
    -- Status de ativação
    ativo BOOLEAN DEFAULT TRUE NOT NULL,
    -- Timestamps de auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
-- Comentários na tabela e colunas para documentação
COMMENT ON TABLE areas_tecnologicas IS 'Catálogo de áreas tecnológicas/eixos de formação técnica disponíveis no sistema';
COMMENT ON COLUMN areas_tecnologicas.id IS 'Identificador único da área tecnológica';
COMMENT ON COLUMN areas_tecnologicas.nome IS 'Nome oficial da área tecnológica';
COMMENT ON COLUMN areas_tecnologicas.slug IS 'Identificador amigável para URLs (ex: tecnologia-da-informacao)';
COMMENT ON COLUMN areas_tecnologicas.descricao IS 'Descrição detalhada da área e suas competências';
COMMENT ON COLUMN areas_tecnologicas.ativo IS 'Indica se a área está ativa no sistema';
-- 3. ÍNDICES PARA PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_areas_tecnologicas_ativo ON areas_tecnologicas(ativo);
CREATE INDEX IF NOT EXISTS idx_areas_tecnologicas_slug ON areas_tecnologicas(slug);
-- 4. SEGURANÇA - ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Habilitar RLS na tabela
ALTER TABLE areas_tecnologicas ENABLE ROW LEVEL SECURITY;
-- Política de LEITURA: Acesso público (anônimo e autenticado)
-- Áreas tecnológicas são dados de domínio público do sistema
CREATE POLICY "Permitir leitura pública de áreas tecnológicas" ON areas_tecnologicas FOR
SELECT USING (true);
-- Política de INSERÇÃO: Apenas service_role ou administradores
CREATE POLICY "Permitir inserção apenas para service_role" ON areas_tecnologicas FOR
INSERT WITH CHECK (auth.role() = 'service_role');
-- Política de ATUALIZAÇÃO: Apenas service_role ou administradores
CREATE POLICY "Permitir atualização apenas para service_role" ON areas_tecnologicas FOR
UPDATE USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
-- Política de EXCLUSÃO: Apenas service_role ou administradores
CREATE POLICY "Permitir exclusão apenas para service_role" ON areas_tecnologicas FOR DELETE USING (auth.role() = 'service_role');
-- 5. TRIGGER PARA ATUALIZAÇÃO AUTOMÁTICA DO updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER set_updated_at BEFORE
UPDATE ON areas_tecnologicas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- 6. DML - POPULAÇÃO INICIAL (SEED DATA)
-- ============================================================================
-- Inserção idempotente: ON CONFLICT DO NOTHING permite rodar múltiplas vezes
INSERT INTO areas_tecnologicas (nome, slug, descricao, ativo)
VALUES (
        'Automação e Mecatrônica',
        'automacao-e-mecatronica',
        'Formação em sistemas automatizados, robótica industrial, instrumentação e controle de processos.',
        true
    ),
    (
        'Construção Civil',
        'construcao-civil',
        'Capacitação em edificações, infraestrutura, projetos arquitetônicos e gestão de obras.',
        true
    ),
    (
        'Eletroeletrônica',
        'eletroeletronica',
        'Formação em sistemas elétricos, eletrônicos, manutenção e projetos de instalações.',
        true
    ),
    (
        'Energia',
        'energia',
        'Capacitação em energias renováveis, eficiência energética e sistemas de geração e distribuição.',
        true
    ),
    (
        'Gestão e Negócios',
        'gestao-e-negocios',
        'Formação em administração, empreendedorismo, logística, recursos humanos e processos gerenciais.',
        true
    ),
    (
        'Metalmecânica',
        'metalmecanica',
        'Capacitação em usinagem, soldagem, caldeiraria, manutenção mecânica e processos de fabricação.',
        true
    ),
    (
        'Mineração',
        'mineracao',
        'Formação em processos de extração mineral, beneficiamento e gestão ambiental em mineração.',
        true
    ),
    (
        'Produção Alimentícia',
        'producao-alimenticia',
        'Capacitação em processamento de alimentos, controle de qualidade e segurança alimentar.',
        true
    ),
    (
        'Química e Meio Ambiente',
        'quimica-e-meio-ambiente',
        'Formação em processos químicos, tratamento de resíduos, gestão ambiental e sustentabilidade.',
        true
    ),
    (
        'Refrigeração e Climatização',
        'refrigeracao-e-climatizacao',
        'Capacitação em sistemas de refrigeração, ar-condicionado e climatização industrial.',
        true
    ),
    (
        'Segurança do Trabalho',
        'seguranca-do-trabalho',
        'Formação em prevenção de acidentes, normas regulamentadoras e gestão de segurança ocupacional.',
        true
    ),
    (
        'Tecnologia da Informação (TI)',
        'tecnologia-da-informacao',
        'Capacitação em desenvolvimento de software, redes, banco de dados, segurança da informação e infraestrutura.',
        true
    ),
    (
        'Telecomunicações',
        'telecomunicacoes',
        'Formação em sistemas de comunicação, redes de telefonia, transmissão de dados e fibra óptica.',
        true
    ),
    (
        'Têxtil e Vestuário',
        'textil-e-vestuario',
        'Capacitação em processos têxteis, confecção, modelagem e design de moda.',
        true
    ),
    (
        'Transporte e Logística',
        'transporte-e-logistica',
        'Formação em gestão de transportes, armazenagem, distribuição e cadeia de suprimentos.',
        true
    ) ON CONFLICT (nome) DO NOTHING;
-- 7. VERIFICAÇÃO DOS DADOS INSERIDOS
-- ============================================================================
-- Consulta para validar a inserção
SELECT id,
    nome,
    slug,
    ativo,
    created_at
FROM areas_tecnologicas
ORDER BY nome;
-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================
-- Total de registros esperados: 15 áreas tecnológicas
-- Para executar: Cole este script no SQL Editor do Supabase Dashboard
-- ============================================================================