-- Update status check constraint to include 'Bloqueada'
ALTER TABLE turmas DROP CONSTRAINT IF EXISTS turmas_status_check;
ALTER TABLE turmas
ADD CONSTRAINT turmas_status_check CHECK (
        status IN (
            'Planejamento',
            'Em Andamento',
            'Concluída',
            'Cancelada',
            'Bloqueada'
        )
    );
-- Create pausas table
CREATE TABLE IF NOT EXISTS turma_pausas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    turma_id UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
    descricao TEXT NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);