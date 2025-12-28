
import { supabase } from './supabase.js';

export const ambientesService = {
    // CRUD Operations
    async list() {
        const { data, error } = await supabase
            .from('ambientes')
            .select('*')
            .order('nome');
        if (error) throw error;
        return data;
    },

    async save(data, id = null) {
        if (id) {
            const { error } = await supabase
                .from('ambientes')
                .update(data)
                .eq('id', id);
            if (error) throw error;
        } else {
            const { error } = await supabase
                .from('ambientes')
                .insert(data);
            if (error) throw error;
        }
    },

    async delete(id) {
        const { error } = await supabase
            .from('ambientes')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    // Allocation Operations
    async matches(ambienteId) {
        // Fetch allocations for this environment
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
            .from('lotacoes_turma')
            .select(`
                id,
                data_inicio,
                data_fim,
                turmas!inner (
                    id, 
                    codigo_sge, 
                    nome, 
                    turno, 
                    cursos (nome)
                )
            `)
            .eq('ambiente_id', ambienteId)
            // We want to see usage history, maybe filter extremely old ones if needed
            .order('data_inicio', { ascending: false }); // Newest first

        if (error) throw error;
        return data;
    },
    async getTurmaUCs(turmaId) {
        // Fetch UCs present in the schedule
        const { data, error } = await supabase
            .from('lotacoes_turma')
            .select('uc_id, unidades_curriculares(nome)')
            .eq('turma_id', turmaId);

        if (error) throw error;

        // Unique
        const map = new Map();
        data.forEach(r => {
            if (r.uc_id && r.unidades_curriculares) {
                map.set(r.uc_id, r.unidades_curriculares.nome);
            }
        });
        return Array.from(map.entries()).map(([id, nome]) => ({ id, nome }));
    },

    async getUCDates(turmaId, ucId) {
        const { data, error } = await supabase
            .from('lotacoes_turma')
            .select('data_inicio')
            .eq('turma_id', turmaId)
            .eq('uc_id', ucId)
            .order('data_inicio', { ascending: true });

        if (error) throw error;
        if (!data.length) return null;

        return {
            start: data[0].data_inicio,
            end: data[data.length - 1].data_inicio
        };
    },

    async assign(ambienteId, turmaId, startDate, endDate, ucId = null) {
        // We update the lotacoes_turma rows for the specific turma and optionally UC
        let query = supabase
            .from('lotacoes_turma')
            .update({ ambiente_id: ambienteId })
            .eq('turma_id', turmaId)
            .gte('data_inicio', startDate)
            .lte('data_inicio', endDate);

        if (ucId) {
            query = query.eq('uc_id', ucId);
        }

        const { data, error } = await query.select();
        if (error) throw error;
        return data;
    },

    async checkConflict(ambienteId, startDate, endDate, turno) {
        // Basic conflict check
        let query = supabase
            .from('lotacoes_turma')
            .select('id, data_inicio, turmas!inner(id, codigo_sge, turno)')
            .eq('ambiente_id', ambienteId)
            .gte('data_inicio', startDate)
            .lte('data_inicio', endDate);

        const { data, error } = await query;
        if (error) throw error;

        if (!data || data.length === 0) return null;

        // Check turnos validation (Integral blocks all, others block same)
        const conflicting = data.find(row => {
            const rowTurno = row.turmas.turno;
            if (turno === 'Integral') return true;
            if (rowTurno === 'Integral') return true;
            return rowTurno === turno;
        });

        return conflicting;
    },

    async clear(turmaId, startDate, endDate) {
        const { data, error } = await supabase
            .from('lotacoes_turma')
            .update({ ambiente_id: null })
            .eq('turma_id', turmaId)
            .gte('data_inicio', startDate)
            .lte('data_inicio', endDate)
            .select();
        if (error) throw error;
        return data;
    },

    async getReport(startDate, endDate) {
        const { data, error } = await supabase
            .from('lotacoes_turma')
            .select(`
                id,
                data_inicio,
                data_fim,
                ambientes!inner (nome, tipo),
                turmas!inner (codigo_sge, turno, cursos(nome)),
                docentes (nome)
            `)
            .gte('data_inicio', startDate)
            .lte('data_inicio', endDate)
            .order('data_inicio');

        if (error) throw error;
        return data;
    },

    async removeAllocation(id) {
        const { error } = await supabase
            .from('lotacoes_turma')
            .update({ ambiente_id: null })
            .eq('id', id);
        if (error) throw error;
    },


};
