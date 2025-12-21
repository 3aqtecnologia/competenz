-- Migration: Add missing columns to docentes table
-- Description: Adds CPF, telefone, tipo_vinculo and other missing fields
-- Add CPF column
ALTER TABLE docentes
ADD COLUMN IF NOT EXISTS cpf VARCHAR(11);
-- Add telefone column
ALTER TABLE docentes
ADD COLUMN IF NOT EXISTS telefone VARCHAR(15);
-- Add email column (if not exists)
ALTER TABLE docentes
ADD COLUMN IF NOT EXISTS email VARCHAR(255);
-- Add tipo_vinculo column
ALTER TABLE docentes
ADD COLUMN IF NOT EXISTS tipo_vinculo VARCHAR(50);
-- Add formacao column (if not exists)
ALTER TABLE docentes
ADD COLUMN IF NOT EXISTS formacao VARCHAR(100);
-- Add area_formacao column (if not exists)
ALTER TABLE docentes
ADD COLUMN IF NOT EXISTS area_formacao VARCHAR(255);
-- Add areas_atuacao column (if not exists)
ALTER TABLE docentes
ADD COLUMN IF NOT EXISTS areas_atuacao TEXT [];
-- Add status column (if not exists)
ALTER TABLE docentes
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Ativo';
-- Add timestamps (if not exists)
ALTER TABLE docentes
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE docentes
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
-- Create index on CPF for faster lookups
CREATE INDEX IF NOT EXISTS idx_docentes_cpf ON docentes(cpf);
-- Create index on email
CREATE INDEX IF NOT EXISTS idx_docentes_email ON docentes(email);
-- Create index on status
CREATE INDEX IF NOT EXISTS idx_docentes_status ON docentes(status);
-- Add comment to table
COMMENT ON TABLE docentes IS 'Tabela de docentes com informações pessoais, acadêmicas e profissionais';
-- Add comments to columns
COMMENT ON COLUMN docentes.cpf IS 'CPF do docente (apenas números)';
COMMENT ON COLUMN docentes.telefone IS 'Telefone do docente (apenas números)';
COMMENT ON COLUMN docentes.email IS 'E-mail do docente';
COMMENT ON COLUMN docentes.tipo_vinculo IS 'Tipo de vínculo: Horista, Mensalista, CLT, PJ';
COMMENT ON COLUMN docentes.formacao IS 'Nível de formação: Médio, Superior, Pós-Graduação, Mestrado, Doutorado';
COMMENT ON COLUMN docentes.area_formacao IS 'Área de formação acadêmica';
COMMENT ON COLUMN docentes.areas_atuacao IS 'Array de áreas tecnológicas em que o docente pode atuar';
COMMENT ON COLUMN docentes.status IS 'Status do docente: Ativo ou Inativo';