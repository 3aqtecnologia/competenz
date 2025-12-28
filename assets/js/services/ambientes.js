
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
        // Try deleting from 'lotacoes_turma' (old system)
        const { error } = await supabase
            .from('lotacoes_turma')
            .update({ ambiente_id: null })
            .eq('id', id);

        // Also try deleting from 'alocacoes_ambientes' (new system)
        if (error) {
            // If it wasn't a lotacao, maybe it is a block allocation? 
            // Actually, IDs are UUIDs so chance of collision is low, but better separate methods.
            // For backward compatibility we keep this, but add deleteBlockAllocation
        }
    },

    // --- New Block Allocation System ---
    async createBlockAllocation(data) {
        const { error } = await supabase.from('alocacoes_ambientes').insert(data);
        if (error) throw error;
    },

    async listBlockAllocations(ambienteId) {
        const { data, error } = await supabase
            .from('alocacoes_ambientes')
            .select(`
                *, 
                cursos(nome), 
                docentes(nome), 
                turmas(codigo_sge), 
                unidades_curriculares(nome)
            `)
            .eq('ambiente_id', ambienteId)
            .order('data_inicio', { ascending: false });
        if (error) throw error;
        return data;
    },

    // --- New Methods for Turma-Centric Allocation ---

    async getTurmaPlanning(turmaId) {
        // 1. Get Turma UCs (via Matrix)
        // 2. Get existing allocations for this Turma
        // 3. Get Teachers (via Lotacoes Docente) for this Turma

        // Step 1: Turma -> Matrix -> MatrixUCs -> UCs
        const turmaRes = await supabase
            .from('turmas')
            .select('matriz_id')
            .eq('id', turmaId)
            .single();

        if (turmaRes.error) throw turmaRes.error;
        const matrizId = turmaRes.data.matriz_id;

        const ucsRes = await supabase
            .from('matriz_ucs')
            .select('*, unidades_curriculares(*)')
            .eq('matriz_id', matrizId)
            .order('periodo');

        if (ucsRes.error) throw ucsRes.error;
        const ucs = ucsRes.data;

        // Step 2: Allocations
        const allocRes = await supabase
            .from('alocacoes_ambientes')
            .select('*, ambientes(nome, tipo)')
            .eq('turma_id', turmaId);

        if (allocRes.error) throw allocRes.error;
        const allocations = allocRes.data;

        // Step 3: Teachers (Lotacao Docente) - Assuming we have a table for this
        // Check schema confirms 'lotacoes_docente' or 'lotacao_docente'. 
        // Based on previous checks, let's try 'lotacoes_docente' (likely singular/plural confusion in my head, checking query logs...)
        // Query log showed 'lotacao_docente' AND 'lotacao_docentes'. I'll try 'lotacoes_docente' which implies relationship between turma/docente/uc (maybe?) or just 'lotacao_docente'.
        // Let's assume 'lotacao_docente' links (docente_id, turma_id, uc_id).

        const teachersRes = await supabase
            .from('lotacoes_turma')
            .select('*, docentes(nome)')
            .eq('turma_id', turmaId)
            .not('docente_id', 'is', null);

        return {
            ucs: ucs.map(item => {
                const uc = item.unidades_curriculares;
                const alloc = allocations.find(a => a.uc_id === uc.id);
                // Try to find teacher for this specific UC
                const teacherRel = teachersRes.data ? teachersRes.data.find(t => t.uc_id === uc.id) : null;

                return {
                    uc_id: uc.id,
                    nome: uc.nome,
                    carga_horaria: uc.carga_horaria,
                    periodo_matriz: item.periodo, // 1º Semestre, etc.
                    alocacao: alloc || null,
                    docente: teacherRel ? teacherRel.docentes : null
                };
            })
        };
    },

    // Quick method to get UCs for dropdown
    async getTurmaUCsList(turmaId) {
        const { data, error } = await supabase
            .from('turmas')
            .select(`
                matrizes!inner (
                    matriz_ucs!inner (
                        unidades_curriculares!inner (id, nome)
                    )
                )
            `)
            .eq('id', turmaId)
            .single();

        if (error) return [];
        return data.matrizes.matriz_ucs.map(i => i.unidades_curriculares);
    },

    async deleteBlockAllocation(id) {
        const { error } = await supabase.from('alocacoes_ambientes').delete().eq('id', id);
        if (error) throw error;
    },

    async getReportNew(startDate, endDate) {
        // Fetch from new block allocations
        const { data, error } = await supabase
            .from('alocacoes_ambientes')
            .select(`
                id,
                data_inicio,
                data_fim,
                turma_id,
                uc_id,
                ambientes!inner (nome, tipo),
                cursos (nome),
                docentes (nome, foto_url),
                turmas (nome, turno)
            `)
            .gte('data_inicio', startDate)
            .lte('data_inicio', endDate)
            .order('data_inicio');

        if (error) throw error;
        return data;
    }
};
