
import { supabase } from '../services/supabase.js';

/**
 * Matrix Model – Handles creation, edition and related UC operations (N:N Relationship).
 */
export const matrizes = {

    /**
     * Validate matrix payload.
     */
    async _validate(data, id = null) {
        // 1. Unique Code
        const { data: existing, error } = await supabase
            .from('matrizes')
            .select('id')
            .eq('codigo', data.codigo)
            .maybeSingle();

        if (error) throw error;
        if (existing && existing.id !== id) {
            throw new Error('Código da matriz já está em uso.');
        }

        // 2. Active Status requires linked UCs
        if (data.status === 'Ativa' && id) {
            const { count, error: errCount } = await supabase
                .from('matriz_ucs')
                .select('*', { count: 'exact', head: true })
                .eq('matriz_id', id);

            if (errCount) throw errCount;
            if (count === 0) {
                throw new Error('Uma matriz ativa deve possuir ao menos uma UC vinculada.');
            }
        }
    },

    /**
     * Create generic matrix
     */
    async create(data) {
        await this._validate(data);
        const { data: matrix, error } = await supabase.from('matrizes').insert(data).select().single();
        if (error) throw error;
        return matrix;
    },

    /**
     * Update matrix
     */
    async update(id, data) {
        await this._validate(data, id);
        const { data: matrix, error } = await supabase.from('matrizes').update(data).eq('id', id).select().single();
        if (error) throw error;
        return matrix;
    },

    async save(data, id = null) {
        return id ? this.update(id, data) : this.create(data);
    },

    async delete(id) {
        // 1. Verificar se há turmas vinculadas a esta matriz
        const { data: turmasVinculadas, error: errorTurmas } = await supabase
            .from('turmas')
            .select('id, nome, codigo_sge')
            .eq('matriz_id', id);

        if (errorTurmas) throw errorTurmas;

        if (turmasVinculadas && turmasVinculadas.length > 0) {
            const turmasNomes = turmasVinculadas.map(t => t.nome || t.codigo_sge).join(', ');
            throw new Error(`Não é possível excluir esta matriz pois ela está vinculada a ${turmasVinculadas.length} turma(s): ${turmasNomes}. Remova as vinculações primeiro.`);
        }

        // 2. Verificar se há cursos vinculados a esta matriz
        const { data: cursosVinculados, error: errorCursos } = await supabase
            .from('cursos')
            .select('id, nome')
            .eq('matriz_id', id);

        if (errorCursos) throw errorCursos;

        if (cursosVinculados && cursosVinculados.length > 0) {
            const cursosNomes = cursosVinculados.map(c => c.nome).join(', ');
            throw new Error(`Não é possível excluir esta matriz pois ela está vinculada a ${cursosVinculados.length} curso(s): ${cursosNomes}. Remova as vinculações primeiro.`);
        }

        // 3. Se não há vínculos, pode excluir
        const { error } = await supabase.from('matrizes').delete().eq('id', id);
        if (error) throw error;
        return true;
    },

    async getById(id) {
        const { data, error } = await supabase.from('matrizes').select('*').eq('id', id).single();
        if (error) throw error;
        return data;
    },

    /**
     * Links a UC to a Matrix (N:N).
     * @param {string} matrizId 
     * @param {string} ucId 
     */
    async linkUC(matrizId, ucId) {
        // Check if already linked
        const { data: existing } = await supabase
            .from('matriz_ucs')
            .select('id')
            .eq('matriz_id', matrizId)
            .eq('uc_id', ucId)
            .maybeSingle();

        if (existing) return existing; // Already linked

        const { data, error } = await supabase
            .from('matriz_ucs')
            .insert({ matriz_id: matrizId, uc_id: ucId })
            .select()
            .single();

        if (error) throw error;
        await this.updateTotalHours(matrizId);
        return data;
    },

    /**
     * Unlinks a UC from a Matrix.
     * @param {string} junctionId - The ID from 'matriz_ucs' table
     * @param {string} matrizId - Needed to update totals
     */
    async unlinkUC(junctionId, matrizId) {
        const { error } = await supabase
            .from('matriz_ucs')
            .delete()
            .eq('id', junctionId);

        if (error) throw error;
        await this.updateTotalHours(matrizId);
        return true;
    },

    /**
     * Recalculates total hours for a matrix based on linked UCs.
     */
    async updateTotalHours(matrizId) {
        // Fetch all linked UCs and their hours
        const { data: links, error } = await supabase
            .from('matriz_ucs')
            .select(`
                uc_id,
                unidades_curriculares (
                    carga_horaria
                )
            `)
            .eq('matriz_id', matrizId);

        if (error) throw error;

        const total = links.reduce((acc, link) => {
            return acc + (link.unidades_curriculares?.carga_horaria || 0);
        }, 0);

        await supabase
            .from('matrizes')
            .update({ carga_horaria_total: total })
            .eq('id', matrizId);

        return total;
    },

    /**
     * Logic to "Import" from Catalog:
     * 1. Check if UC exists in `unidades_curriculares` by Name.
     * 2. If not, create it using Catalog data.
     * 3. Link it to the Matrix.
     */
    async importFromCatalog(catalogId, matrizId) {
        // 1. Get Catalog Item
        const { data: template, error: errTpl } = await supabase
            .from('unidades_curriculares')
            .select('*')
            .eq('id', catalogId)
            .single();
        if (errTpl) throw errTpl;

        // 2. Find or Create Real UC
        let targetUcId;
        const { data: existingUC } = await supabase
            .from('unidades_curriculares')
            .select('id')
            .eq('nome', template.nome)
            .maybeSingle();

        if (existingUC) {
            targetUcId = existingUC.id;
        } else {
            const { data: newUC, error: errNew } = await supabase
                .from('unidades_curriculares')
                .insert({
                    nome: template.nome,
                    carga_horaria: template.carga_horaria,
                    area_tecnologica: template.area_tecnologica,
                    tipo: template.tipo // Ensure schema has this column
                })
                .select('id')
                .single();

            if (errNew) throw errNew;
            targetUcId = newUC.id;
        }

        // 3. Link
        return await this.linkUC(matrizId, targetUcId);
    }
};
