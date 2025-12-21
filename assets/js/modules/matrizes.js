
import { supabase } from '../services/supabase.js';
import { ui } from '../utils/ui.js';

/**
 * Módulo de Gestão de Matrizes Curriculares e UCs
 */
export const matrizes = {

    /**
     * Cria ou atualiza uma Matriz
     * @param {Object} data - Dados da matriz
     * @param {string} [id] - ID opcional para update
     */
    async save(data, id = null) {
        const { error, data: result } = id
            ? await supabase.from('matrizes').update(data).eq('id', id).select().single()
            : await supabase.from('matrizes').insert(data).select().single();

        if (error) throw error;
        return result;
    },

    /**
     * Adiciona uma UC à Matriz e atualiza o total
     * @param {Object} ucData - Dados da UC
     */
    async addUC(ucData) {
        // 1. Inserir UC
        const { data: uc, error } = await supabase
            .from('unidades_curriculares')
            .insert(ucData)
            .select()
            .single();

        if (error) throw error;

        // 2. Atualizar Carga Horária da Matriz
        await this.updateTotalHours(ucData.matriz_id);

        return uc;
    },

    /**
     * Remove uma UC e atualiza o total
     * @param {string} ucId 
     * @param {string} matrizId 
     */
    async removeUC(ucId, matrizId) {
        const { error } = await supabase
            .from('unidades_curriculares')
            .delete()
            .eq('id', ucId);

        if (error) throw error;

        // Atualizar Total
        await this.updateTotalHours(matrizId);
    },

    /**
     * Recalcula e salva a carga horária total da matriz
     * @param {string} matrizId 
     */
    async updateTotalHours(matrizId) {
        // 1. Calcular soma
        const { data: ucs, error: errFetch } = await supabase
            .from('unidades_curriculares')
            .select('carga_horaria')
            .eq('matriz_id', matrizId);

        if (errFetch) {
            console.error('Erro ao somar horas:', errFetch);
            return;
        }

        const total = ucs.reduce((acc, curr) => acc + (curr.carga_horaria || 0), 0);

        // 2. Atualizar Matriz
        const { error: errUpdate } = await supabase
            .from('matrizes')
            .update({ carga_horaria_total: total })
            .eq('id', matrizId);

        if (errUpdate) console.error('Erro ao atualizar total da matriz:', errUpdate);

        console.log(`Matriz ${matrizId} atualizada com ${total} horas.`);
    },

    /**
     * Importa uma UC do catálogo para a matriz
     */
    async importFromCatalog(catalogUcId, matrizId) {
        // 1. Buscar dados do catálogo
        const { data: catUc, error: errCat } = await supabase
            .from('catalogo_ucs')
            .select('*')
            .eq('id', catalogUcId)
            .single();

        if (errCat) throw errCat;

        // 2. Preparar payload (remove campos de sistema do catálogo)
        const ucPayload = {
            matriz_id: matrizId,
            nome: catUc.nome,
            carga_horaria: catUc.carga_horaria,
            area_tecnologica: catUc.area_tecnologica,
            tipo: 'Base', // Padrão ao importar
            objetivo: catUc.objetivo,
            bibliografia_basica: catUc.bibliografia_basica,
            conhecimentos: catUc.conhecimentos,
            capacidades_tecnicas: catUc.capacidades_tecnicas,
            capacidades_sociais: catUc.capacidades_sociais,
            capacidades_socioemocionais: catUc.capacidades_socioemocionais
        };

        // 3. Adicionar usando método que já recalcula
        return await this.addUC(ucPayload);
    }
};
