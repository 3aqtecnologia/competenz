
import { supabase } from '../services/supabase.js';

export const docentes = {
    async list() {
        const { data, error } = await supabase
            .from('docentes')
            .select(`
                *,
                docentes_areas (
                    area_id,
                    areas_tecnologicas (nome, id)
                ),
                lotacoes_turma (
                    id,
                    data_inicio,
                    data_fim,
                    turmas (id, codigo, nome)
                )
            `)
            .order('nome');
        if (error) throw error;
        return data;
    },

    async getById(id) {
        const { data, error } = await supabase
            .from('docentes')
            .select(`
                *,
                docentes_areas (
                    area_id,
                    areas_tecnologicas (nome, id)
                )
            `)
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    async save(data, id = null) {
        // Extract related data
        const { areas, ...docenteData } = data;

        // 1. Upsert Docente
        let docenteId = id;
        const query = id
            ? supabase.from('docentes').update(docenteData).eq('id', id).select()
            : supabase.from('docentes').insert(docenteData).select();

        const { data: savedDocente, error: docenteError } = await query;
        if (docenteError) throw docenteError;

        docenteId = savedDocente[0].id;

        // 2. Handle Areas (Delete all and re-insert logic is simplest for this scope)
        if (areas) {
            // Delete existing relations
            const { error: delError } = await supabase
                .from('docentes_areas')
                .delete()
                .eq('docente_id', docenteId);
            if (delError) throw delError;

            // Insert new relations
            if (areas.length > 0) {
                const areasToInsert = areas.map(areaId => ({
                    docente_id: docenteId,
                    area_id: areaId
                }));

                const { error: insertError } = await supabase
                    .from('docentes_areas')
                    .insert(areasToInsert);
                if (insertError) throw insertError;
            }
        }

        return savedDocente[0];
    },

    async delete(id) {
        const { error } = await supabase.from('docentes').delete().eq('id', id);
        if (error) throw error;
    },

    async uploadPhoto(file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('docentes-fotos')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('docentes-fotos')
            .getPublicUrl(filePath);

        return data.publicUrl;
    }
};
