import { supabase } from '../services/supabase.js';

export const turmas = {
    async list() {
        try {
            const { data, error } = await supabase
                .from('turmas')
                .select(`
                    *,
                    matrizes (codigo, carga_horaria_total),
                    coordenador:coordenador_id (nome_completo),
                    analista:analista_id (nome_completo)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (err) {
            console.warn('[Turmas] Relation fetch failed, falling back to simple list.', err);
            // Fallback: Fetch without join
            const { data, error } = await supabase
                .from('turmas')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        }
    },

    async getById(id) {
        // Fetch Turma + Linked Matriz info
        const { data: turma, error } = await supabase
            .from('turmas')
            .select(`
                *,
                matrizes (
                    id, 
                    codigo, 
                    carga_horaria_total
                ),
                turma_pausas (*)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;

        // Fetch Lotacoes (Existing Schedule)
        const { data: lotacoes, error: lotError } = await supabase
            .from('lotacoes_turma')
            .select(`
                *,
                unidades_curriculares (*),
                docentes (id, nome, foto_url)
            `)
            .eq('turma_id', id)
            .order('data_inicio', { ascending: true });

        if (lotError) throw lotError;

        return { ...turma, lotacoes };
    },

    async save(turmaData, id = null) {
        let result;
        if (id) {
            result = await supabase
                .from('turmas')
                .update(turmaData)
                .eq('id', id)
                .select()
                .single();
        } else {
            result = await supabase
                .from('turmas')
                .insert(turmaData)
                .select()
                .single();
        }
        if (result.error) throw result.error;
        return result.data;
    },

    async saveLotacoes(turmaId, lotacoesData) {
        // 1. Delete existing (Simple replacement strategy for now, or upset)
        // For safer scheduling, we might want to upsert, but delete-then-insert is easier for full regen
        const { error: delError } = await supabase
            .from('lotacoes_turma')
            .delete()
            .eq('turma_id', turmaId);

        if (delError) throw delError;

        // 2. Insert new
        const toInsert = lotacoesData.map(l => ({
            turma_id: turmaId,
            uc_id: l.uc_id,
            docente_id: l.docente_id || null,
            data_inicio: l.data_inicio,
            data_fim: l.data_fim,
            status: 'Pendente'
        }));

        const { data, error } = await supabase
            .from('lotacoes_turma')
            .insert(toInsert)
            .select();

        if (error) throw error;
        return data;
    },

    async savePauses(turmaId, pausesData) {
        // 1. Delete existing
        const { error: delError } = await supabase
            .from('turma_pausas')
            .delete()
            .eq('turma_id', turmaId);

        if (delError) throw delError;

        // 2. Insert new
        if (!pausesData || !pausesData.length) return [];

        const toInsert = pausesData.map(p => ({
            turma_id: turmaId,
            descricao: p.descricao,
            data_inicio: p.data_inicio,
            data_fim: p.data_fim
        }));

        const { data, error } = await supabase
            .from('turma_pausas')
            .insert(toInsert)
            .select();

        if (error) throw error;
        return data;
    },

    async delete(id) {
        const { error } = await supabase.from('turmas').delete().eq('id', id);
        if (error) throw error;
    }
};
