
import { supabase } from '../services/supabase.js';
import { ui } from '../utils/ui.js';
import { matrizes } from './matrizes.js';

export const matrizesView = {

    async loadDependencies() {
        if (window.jQuery && window.DataTable) return;
        const loadScript = (src) => new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) return resolve();
            const s = document.createElement('script');
            s.src = src;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });
        const loadCSS = (href) => {
            if (document.querySelector(`link[href="${href}"]`)) return;
            const l = document.createElement('link');
            l.rel = 'stylesheet';
            l.href = href;
            document.head.appendChild(l);
        };
        loadCSS('https://cdn.datatables.net/1.13.7/css/jquery.dataTables.min.css');
        if (!window.jQuery) {
            await loadScript('https://code.jquery.com/jquery-3.7.1.min.js');
        }
        await loadScript('https://cdn.datatables.net/1.13.7/js/jquery.dataTables.min.js');
    },

    async openModal(id = null) {
        try { await this.loadDependencies(); } catch (e) { ui.toast('Erro libs', 'error'); return; }

        let m = null, linkedUCs = [], catalog = [];

        // 1. Fetch Data
        if (id) {
            try {
                m = await matrizes.getById(id);
                // Fetch links
                const { data: links } = await supabase
                    .from('matriz_ucs')
                    .select(`id, uc_id, unidades_curriculares(id, nome, carga_horaria, tipo, area_tecnologica)`)
                    .eq('matriz_id', id);

                linkedUCs = links ? links.map(l => ({
                    junction_id: l.id,
                    ...l.unidades_curriculares,
                    isLinked: true
                })) : [];
            } catch (err) { ui.toast(err.message, 'error'); return; }
        }

        const totalHours = linkedUCs.reduce((sum, uc) => sum + (uc.carga_horaria || 0), 0);

        // 2. Fetch Full Catalog (for the "Search/Add" tab)
        const { data: catRaw } = await supabase.from('catalogo_ucs').select('*').order('nome');
        catalog = catRaw || [];

        // Filter catalog: Mark those already linked or exclude them?
        // Let's mark them so user knows, but disable the add button
        const linkedIds = new Set(linkedUCs.map(l => l.nome)); // Matching by Name as per logic

        const catalogItems = catalog.map(c => ({
            ...c,
            isLinked: linkedIds.has(c.nome),
            displayId: c.id
        }));

        // Render Tables
        const linkedRows = this.renderLinkedRows(linkedUCs, id);
        const catalogRows = this.renderCatalogRows(catalogItems, id);

        ui.openModalWindow(id ? `Matriz: ${m.codigo}` : 'Nova Matriz', `
             <div class="animate-fade-in flex flex-col h-full bg-[#F8FAFC]">
                 
                 <!-- Header / Stats -->
                 <div class="bg-white border-b border-gray-200 px-6 py-4 shrink-0 z-20">
                    <form id="form-matriz" onsubmit="app.matrizesView.save(event, '${id || ''}')" class="grid grid-cols-1 md:grid-cols-12 gap-5 items-end mb-0">
                        <div class="md:col-span-8 input-group mb-0">
                            <label class="input-label">Código</label>
                            <input name="codigo" class="input-field font-bold" required value="${m?.codigo || ''}" placeholder="Ex: TAI.2024">
                        </div>
                        <div class="md:col-span-4 input-group mb-0">
                             <label class="input-label">Status</label>
                             <select name="status" class="input-field">
                                  <option value="Ativa" ${m?.status === 'Ativa' ? 'selected' : ''}>Ativa</option>
                                  <option value="Inativa" ${m?.status === 'Inativa' ? 'selected' : ''}>Inativa</option>
                             </select>
                        </div>
                    </form>
                    

                 </div>

                 <!-- Tabs Navigation -->
                 <div class="px-6 pt-0 bg-white border-b border-gray-200 flex items-center gap-4">
                     <div class="flex gap-1">
                         <button onclick="ui.switchModalTab('tab-linked')" class="tab-pill active px-4 py-2 text-sm font-bold text-slate-600 border-b-2 border-slate-600 hover:bg-white rounded-t-lg transition-all">
                            <i class="ph ph-list-dashes"></i> Composição da Matriz
                         </button>
                         <button onclick="ui.switchModalTab('tab-catalog')" class="tab-pill px-4 py-2 text-sm font-bold text-slate-500 hover:text-lime-600 border-b-2 border-transparent hover:border-lime-400 hover:bg-white rounded-t-lg transition-all">
                            <i class="ph ph-plus-circle"></i> Adicionar do Catálogo
                         </button>
                     </div>
                 </div>

                 <!-- Content Area -->
                 <div class="flex-1 overflow-y-auto bg-white p-6 relative">
                     
                     <!-- Tab 1: Linked UCs -->
                     <div id="tab-linked" class="modal-tab-content">
                         ${linkedUCs.length === 0
                ? `<div class="text-center py-10 text-slate-400">
                                 <i class="ph ph-info text-2xl mb-2"></i>
                                 <p>Nenhuma unidade vinculada. Use a aba "Adicionar" para buscar UCs.</p>
                               </div>`
                : `<table id="table-linked" class="display w-full text-sm text-left" style="width:100%">
                                 <thead>
                                     <tr>
                                         <th>Nome</th>
                                         <th>Área</th>
                                         <th>CH</th>
                                         <th>Ações</th>
                                     </tr>
                                 </thead>
                                 <tbody>${linkedRows}</tbody>
                               </table>`
            }
                     </div>

                     <!-- Tab 2: Catalog -->
                     <div id="tab-catalog" class="modal-tab-content hidden">
                         <div class="mb-4 bg-blue-50 text-blue-800 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                            <i class="ph ph-magnifying-glass"></i>
                            Busque abaixo para adicionar novas unidades à matriz.
                         </div>
                         <table id="table-catalog" class="display w-full text-sm text-left" style="width:100%">
                             <thead>
                                 <tr>
                                     <th>Nome</th>
                                     <th>Área</th>
                                     <th>CH</th>
                                     <th>Ação</th>
                                 </tr>
                             </thead>
                             <tbody>${catalogRows}</tbody>
                         </table>
                     </div>

                 </div>
                 </div>
<br>
                 <!-- Footer -->
                 <div class="bg-white border-t border-gray-200 p-4 shrink-0 z-20 flex items-center justify-end gap-3">
                     ${id ? `<button type="button" class="btn btn-secondary h-[48px] px-6 text-red-600 hover:bg-red-50 hover:border-red-200" onclick="app.matrizesView.deleteMatrix('${id}')"><i class="ph ph-trash"></i> Excluir</button>` : ''}
                     <button type="button" class="btn btn-secondary h-[48px] px-6" onclick="app.matrizesView.closeModal()">Cancelar</button>
                     <button type="submit" form="form-matriz" class="btn btn-primary h-[48px] px-8 shadow-lg shadow-blue-500/20">
                        <i class="ph ph-floppy-disk"></i> Salvar Matriz
                     </button>
                 </div>
             </div>
        `, 'modal-lg');

        // Init DataTables
        setTimeout(() => {
            if (window.jQuery && window.jQuery.fn.DataTable) {
                const ptBR_Common = {
                    sEmptyTable: "Nenhum registro encontrado",
                    sInfo: "Mostrando de _START_ até _END_ de _TOTAL_ registros",
                    sInfoEmpty: "Mostrando 0 até 0 de 0 registros",
                    sInfoFiltered: "(Filtrados de _MAX_ registros)",
                    sInfoPostFix: "",
                    sInfoThousands: ".",
                    sLengthMenu: "_MENU_ resultados por página",
                    sLoadingRecords: "Carregando...",
                    sProcessing: "Processando...",
                    sZeroRecords: "Nenhum registro encontrado",
                    sSearch: "Pesquisar",
                    oPaginate: {
                        sNext: "Próximo",
                        sPrevious: "Anterior",
                        sFirst: "Primeiro",
                        sLast: "Último"
                    },
                    oAria: {
                        sSortAscending: ": Ordenar colunas de forma ascendente",
                        sSortDescending: ": Ordenar colunas de forma descendente"
                    }
                };

                // Table 1 (Linked) - Simple listing
                if (linkedUCs.length > 0) {
                    window.jQuery('#table-linked').DataTable({
                        paging: false,
                        searching: false,
                        info: false,
                        language: ptBR_Common
                    });
                }

                // Table 2 (Catalog) - Full Features
                window.jQuery('#table-catalog').DataTable({
                    pageLength: 10,
                    lengthChange: false,
                    language: {
                        ...ptBR_Common,
                        sSearch: "",
                        searchPlaceholder: "Pesquisar no Catálogo..."
                    },
                    columnDefs: [{ orderable: false, targets: 3 }]
                });
            }
        }, 100);
    },

    renderLinkedRows(items, matrizId) {
        return items.map(item => `
            <tr>
                <td class="font-medium text-slate-800">${item.nome}</td>
                <td><span class="badge-area">${item.area_tecnologica || 'Geral'}</span></td>
                <td>${item.carga_horaria}h</td>
                <td>
                    <button onclick="app.matrizesView.unlinkUC('${item.junction_id}', '${matrizId}')" 
                            class="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-red-600 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all shadow-md active:scale-95 group outline-none" title="Desvincular">
                        <i class="ph ph-trash text-lg group-hover:scale-110 transition-transform"></i>
                        <span>Remover</span>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    renderCatalogRows(items, matrizId) {
        const canInteract = !!matrizId; // Only if matrix exists
        return items.map(item => {
            const btn = item.isLinked
                ? `<span class="flex items-center gap-1.5 px-4 py-2 bg-emerald-100/80 text-emerald-700 text-xs font-bold rounded-xl w-max select-none shadow-sm border border-emerald-200/50">
                       <i class="ph ph-check-circle text-lg"></i>
                       <span>Adicionada</span>
                   </span>`
                : (canInteract
                    ? `<button onclick="app.matrizesView.importUC('${item.displayId}', '${matrizId}')" 
                               class="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-lime-600 hover:shadow-lime-200 focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all shadow-md active:scale-95 group outline-none">
                           <i class="ph ph-plus-circle text-lg group-hover:scale-110 transition-transform"></i>
                           <span>Adicionar</span>
                       </button>`
                    : `<span class="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-400 text-xs font-bold rounded-xl select-none border border-slate-200 grayscale opacity-75">
                           <i class="ph ph-lock-key text-lg"></i>
                           <span>Bloqueado</span>
                       </span>`
                );

            return `
                <tr>
                    <td class="font-medium ${item.isLinked ? 'text-emerald-900' : 'text-slate-700'} py-3">${item.nome}</td>
                    <td><span class="badge-area">${item.area_tecnologica || '-'}</span></td>
                    <td>${item.carga_horaria}h</td>
                    <td>${btn}</td>
                </tr>
            `;
        }).join('');
    },

    /* --- Actions --- */

    async save(e, id) {
        e.preventDefault();
        const data = { codigo: e.target.codigo.value, status: e.target.status.value };
        try {
            const res = await matrizes.save(data, id);
            ui.toast('Matriz salva!');
            this.openModal(res.id);
            if (window.app && window.app.refreshCurrentView) window.app.refreshCurrentView();
        } catch (err) { ui.toast(err.message, 'error'); }
    },

    async deleteMatrix(id) {
        if (!confirm('Excluir?')) return;
        try { await matrizes.delete(id); ui.toast('Excluída'); ui.closeModal(); if (window.app) window.app.refreshCurrentView(); } catch (e) { ui.toast(e.message, 'error'); }
    },

    async importUC(id, mid) {
        try { await matrizes.importFromCatalog(id, mid); ui.toast('Adicionada'); this.openModal(mid); await this.switchToCatalogTab(); } catch (e) { ui.toast(e.message, 'error'); }
    },

    async unlinkUC(jid, mid) {
        try { await matrizes.unlinkUC(jid, mid); ui.toast('Removida'); this.openModal(mid); } catch (e) { ui.toast(e.message, 'error'); }
    },

    // Helper to keep user on catalog tab after adding
    async switchToCatalogTab() {
        setTimeout(() => ui.switchModalTab('tab-catalog'), 200);
    },

    closeModal() { ui.closeModal(); }
};
