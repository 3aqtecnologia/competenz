
import { supabase } from '../services/supabase.js';
import { ui } from '../utils/ui.js';
import { matrizes } from './matrizes.js';

export const matrizesView = {

    /**
     * Abre o modal de edição de Matriz
     * @param {string} id - ID da Matriz (opcional para criação)
     */
    async openModal(id = null) {
        let m = null, ucs = [];

        // Load Matrix & Grade
        // Load Matrix & Grade
        if (id) {
            const { data } = await supabase.from('matrizes').select('*').eq('id', id).single();
            m = data;

            // New N:N Fetch logic
            const { data: mnData } = await supabase
                .from('matriz_ucs')
                .select(`
                    id, 
                    created_at,
                    unidades_curriculares (
                        id, nome, carga_horaria, tipo
                    )
                `)
                .eq('matriz_id', id)
                .order('created_at'); // or order by 'ordem' if implemented

            // Map to flat structure for easier handling
            ucs = mnData ? mnData.map(item => ({
                id: item.unidades_curriculares.id, // UC ID for display/logic
                junction_id: item.id, // Junction ID for deletion
                nome: item.unidades_curriculares.nome,
                carga_horaria: item.unidades_curriculares.carga_horaria,
                tipo: item.unidades_curriculares.tipo
            })) : [];
        }

        // Note: We don't load course info here anymore since matrices are independent
        // The course workload target will be shown when viewing from the course context

        const totalAtual = ucs.reduce((acc, u) => acc + u.carga_horaria, 0);

        // Load Catalog for Picker
        const { data: catalog } = await supabase.from('catalogo_ucs').select('*').order('nome');

        // Helper
        const isAdded = (catUc) => ucs.some(u => u.nome === catUc.nome);

        // Grade List (Left)
        const uiUCs = ucs.map(u => `
            <div class="flex items-center justify-between p-2 mb-2 bg-gray-50 rounded border border-gray-100 group">
                <div>
                   <div class="text-sm font-bold text-gray-800">${u.nome}</div>
                   <div class="text-xs text-gray-500">${u.carga_horaria}h • ${u.tipo || 'N/A'}</div>
                </div>
                <button onclick="app.matrizesView.deleteUC('${u.junction_id}', '${id}')" class="text-red-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <i class="ph ph-trash"></i>
                </button>
            </div>
        `).join('') || '<div class="text-xs text-gray-400 text-center py-4">Nenhuma UC na grade.</div>';

        // Picker List (Right)
        const pickerHtml = catalog ? catalog.map(c => {
            // isAdded checks against UC ID (u.id) which matches catalog ID (c.id)
            const added = isAdded(c);
            const canAdd = id && !added; // Can only add if matrix is saved
            return `
                <div class="uc-picker-item ${added ? 'added' : ''} ${!canAdd && !added ? 'disabled' : ''}" 
                     onclick="${canAdd ? `app.matrizesView.importUC('${c.id}', '${id}')` : ''}"
                     style="${!canAdd && !added ? 'opacity: 0.5; cursor: not-allowed;' : ''}">
                    <div style="flex:1;">
                        <div class="text-sm font-semibold" style="color: ${added ? '#15803d' : '#334155'}">${c.nome}</div>
                        <div class="text-xs text-gray-500">${c.carga_horaria}h • ${c.tipo || '-'}</div>
                    </div>
                    ${added
                    ? '<i class="ph ph-check-circle text-green-500"></i>'
                    : (id ? '<i class="ph ph-plus-circle text-primary hover:scale-110 transition-transform text-lg"></i>' : '<i class="ph ph-lock text-gray-400"></i>')
                }
                </div>
             `;
        }).join('') : '<div class="p-4 text-center text-gray-400 text-sm">Carregando catálogo...</div>';

        ui.openModalWindow(id ? `Editor de Matriz: ${m.codigo}` : 'Nova Matriz Curricular', `
             <div class="animate-fade-in" style="height: 100%; display: flex; flex-direction: column;">
                
                <!-- Matrix Meta Form (Top) -->
                <form onsubmit="app.matrizesView.save(event, '${id || ''}')" class="mb-4 bg-gray-50 p-4 rounded-xl border border-gray-100 shrink-0">
                    <div class="grid-2">
                        <div class="input-group mb-0">
                            <label class="input-label">Código da Matriz</label>
                            <input name="codigo" class="input-field" required value="${m?.codigo || ''}" placeholder="Ex: V1.2024">
                        </div>
                         <div class="input-group mb-0">
                            <div class="flex gap-2 items-end">
                                <div style="flex:1;">
                                     <label class="input-label">Status</label>
                                     <select name="status" class="input-field">
                                         <option value="Ativa" ${m?.status === 'Ativa' ? 'selected' : ''}>Ativa</option>
                                         <option value="Inativa" ${m?.status === 'Inativa' ? 'selected' : ''}>Inativa</option>
                                     </select>
                                </div>
                                <button type="submit" class="btn btn-primary h-[42px] px-6">Salvar</button>
                            </div>
                        </div>
                    </div>
                </form>

                <!-- Dual Columns: Grade & Picker -->
                <div class="grid-2 gap-6" style="flex:1; min-height: 0; align-items: stretch;">
                    
                    <!-- Left: Grade -->
                    <div class="flex flex-col h-full bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <div class="p-3 bg-gray-50 border-b border-gray-200">
                            <div class="flex-between mb-2">
                                <span class="font-bold text-gray-700 text-sm">Grade Curricular</span>
                                <span class="badge badge-neutral text-xs">${ucs.length} UCs</span>
                            </div>
                        </div>

                        <div class="flex-1 overflow-y-auto p-2">
                            ${uiUCs}
                        </div>
                        <div class="p-2 bg-gray-50 border-t border-gray-200 text-center text-xs font-bold text-gray-500">
                            Total: ${totalAtual} Horas
                        </div>
                    </div>

                    <!-- Right: Catalog Picker -->
                     <div class="flex flex-col h-full bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <div class="p-3 bg-indigo-50 border-b border-indigo-100 flex-between">
                            <span class="font-bold text-indigo-700 text-sm">Banco de UCs (Catálogo)</span>
                            <i class="ph ph-books text-indigo-400"></i>
                        </div>
                        ${!id ? `
                            <div class="p-2 bg-yellow-50 border-b border-yellow-100 text-xs text-yellow-700">
                                <i class="ph ph-info"></i> Salve a matriz primeiro para adicionar UCs
                            </div>
                        ` : ''}
                        <div class="p-2 border-b border-gray-100">
                             <input id="picker-search" class="input-field text-sm py-1" placeholder="Filtrar catálogo..." 
                                onkeyup="const t=this.value.toLowerCase(); document.querySelectorAll('.uc-picker-item').forEach(el => el.style.display = el.textContent.toLowerCase().includes(t) ? 'flex' : 'none')">
                        </div>
                        <div class="flex-1 overflow-y-auto p-2">
                             ${pickerHtml}
                        </div>
                         <div class="p-2 bg-indigo-50 border-t border-indigo-100 text-center text-xs text-indigo-500">
                             Total no Banco: ${catalog ? catalog.length : 0}
                        </div>
                    </div>

                </div>
            </div>
        `, 'modal-lg');
    },

    /**
     * Actions called by HTML
     */
    async save(e, id) {
        e.preventDefault();

        const data = {
            codigo: e.target.codigo.value,
            status: e.target.status.value
        };

        try {
            const res = await matrizes.save(data, id);
            ui.toast('Matriz salva!');

            if (!id) {
                ui.closeModal();
                setTimeout(() => this.openModal(res.id), 300);
            } else {
                // Refresh main app view to show updated stats
                if (window.app) window.app.refreshCurrentView();
                this.openModal(res.id);
            }
        } catch (error) {
            ui.toast(error.message, 'error');
        }
    },

    /**
     * Import UC from Catalog
     * Ensures UC exists in 'unidades_curriculares' before linking
     */
    async importUC(catalogoId, matrizId) {
        try {
            // 1. Get Template from Catalog
            const { data: template } = await supabase.from('catalogo_ucs').select('*').eq('id', catalogoId).single();
            if (!template) throw new Error('UC não encontrada no catálogo.');

            // 2. Find existing UC by Name to enable reuse
            const { data: existing } = await supabase
                .from('unidades_curriculares')
                .select('id')
                .eq('nome', template.nome)
                .maybeSingle();

            let targetId = existing?.id;

            // 3. Create if not exists
            if (!targetId) {
                const { data: newUC, error: createError } = await supabase
                    .from('unidades_curriculares')
                    .insert({
                        nome: template.nome,
                        carga_horaria: template.carga_horaria,
                        area_tecnologica: template.area_tecnologica,
                        tipo: template.tipo // Ensure this column exists now
                    })
                    .select()
                    .single();

                if (createError) throw createError;
                targetId = newUC.id;
            }

            // 4. Link to Matrix (Check for duplicates handled by unique constraint or check first)
            // We'll let the DB constraint handle duplicates if set, otherwise simple check
            const { error: linkError } = await supabase
                .from('matriz_ucs')
                .insert({
                    matriz_id: matrizId,
                    uc_id: targetId,
                    periodo: 1
                });

            if (linkError) {
                if (linkError.code === '23505') throw new Error('Esta UC já está vinculada a esta matriz.');
                throw linkError;
            }

            ui.toast('UC vinculada com sucesso!');
            this.openModal(matrizId);
        } catch (error) {
            console.error(error);
            ui.toast(error.message, 'error');
        }
    },

    /**
     * Delete UC from Matrix
     */
    async deleteUC(junctionId, matrizId) {
        if (!confirm('Remover esta UC da matriz?')) return;

        try {
            // Delete the link, not the UC itself
            const { error } = await supabase.from('matriz_ucs').delete().eq('id', junctionId);

            if (error) throw error;

            ui.toast('UC removida.');
            this.openModal(matrizId);
        } catch (error) {
            ui.toast('Erro: ' + error.message, 'error');
        }
    }
};
