
import { docentes } from './docentes.js';
import { ui } from '../utils/ui.js';

export const docentesView = {
    masks: {
        cpf(v) {
            return v.replace(/\D/g, '')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d{1,2})/, '$1-$2')
                .replace(/(-\d{2})\d+?$/, '$1');
        },
        phone(v) {
            return v.replace(/\D/g, '')
                .replace(/^(\d{2})(\d)/g, '($1) $2')
                .replace(/(\d)(\d{4})$/, '$1-$2');
        }
    },

    render() {
        setTimeout(() => this.filterList(), 50);
        return `
            <div class="animate-fade-in">
                <div class="flex-between mb-6">
                    <div>
                         <h3 class="input-label text-xl">Corpo Docente</h3>
                         <p class="token-meta">Gestão administrativa de professores</p>
                    </div>
                    <button onclick="app.docentesView.openModal()" class="btn btn-primary">
                        <i class="ph ph-user-plus"></i> Novo Docente
                    </button>
                </div>

                <!-- Filters (Match UC Module Style) -->
                <div class="card" style="padding: 1rem; margin-bottom: 1.5rem; display: flex; gap: 1rem;">
                    <div style="flex: 1; position: relative;">
                        <i class="ph ph-magnifying-glass" style="position: absolute; left: 1rem; top: 1rem; color: #94a3b8;"></i>
                        <input id="docente-search" onkeyup="app.docentesView.filterList()" class="input-field" style="padding-left: 2.5rem;" placeholder="Buscar por nome, CPF ou formação...">
                    </div>
                    <div style="width: 200px;">
                        <select id="docente-filter-area" onchange="app.docentesView.filterList()" class="input-field">
                            <option value="">Todas as Áreas</option>
                            ${app.state.areasTecnologicas.map(a => `<option value="${a.id}">${a.nome}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <div id="docentes-list-container" class="token-list">
                    <div class="loading-spinner"></div>
                </div>
            </div>
        `;
    },

    filterList() {
        const term = document.getElementById('docente-search')?.value.toLowerCase() || '';
        const areaId = document.getElementById('docente-filter-area')?.value || '';

        const all = app.state.teachers || [];

        const filtered = all.filter(d => {
            const matchText = (d.nome || '').toLowerCase().includes(term) ||
                (d.cpf || '').includes(term) ||
                (d.area_formacao || '').toLowerCase().includes(term);

            let matchArea = true;
            if (areaId) {
                const dAreas = d.docentes_areas?.map(da => da.area_id) || [];
                matchArea = dAreas.includes(areaId);
            }
            return matchText && matchArea;
        });

        this.renderList(filtered);
    },

    renderList(list) {
        const target = document.getElementById('docentes-list-container');
        if (!target) return;

        if (!list.length) {
            target.innerHTML = `<div class="col-span-full text-center py-10 text-slate-400">Nenhum docente encontrado.</div>`;
            return;
        }

        target.innerHTML = list.map(d => {
            const areasBadges = d.docentes_areas
                ? d.docentes_areas.map(da => da.areas_tecnologicas?.nome).join(', ')
                : 'Sem áreas';

            return `
            <div class="token-item group" onclick="app.docentesView.openModal('${d.id}')">
                <div class="token-icon indigo" style="font-size: 1.1rem;">
                    <i class="ph ph-user"></i>
                </div>
                <div class="token-info">
                    <div class="token-name">${d.nome}</div>
                    <div class="token-meta">
                        ${d.nivel || 'Nível n/i'} • ${d.area_formacao || 'Formação n/i'}
                        <span style="margin: 0 6px;">|</span>
                        <span title="Áreas de Atuação" class="text-slate-500 truncate max-w-[300px] inline-block align-bottom">${areasBadges}</span>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <div class="badge ${d.status === 'Ativo' ? 'badge-success' : 'badge-neutral'}">${d.status || 'Ativo'}</div>
                    <i class="ph ph-caret-right text-gray-300 group-hover:text-primary transition-colors"></i>
                </div>
            </div>
            `;
        }).join('');
    },

    async openModal(id = null) {
        let d = {};
        let linkedAreaIds = [];
        let disp = [];

        if (id) {
            try {
                d = await docentes.getById(id);
                // Extract linked areas
                if (d.docentes_areas) {
                    linkedAreaIds = d.docentes_areas.map(da => da.area_id);
                }
                // Extract availability
                try {
                    disp = Array.isArray(d.disponibilidade) ? d.disponibilidade : JSON.parse(d.disponibilidade);
                } catch (e) { disp = []; }
            } catch (e) {
                ui.toast('Erro ao carregar', 'error');
                return;
            }
        }

        // Fetch areas from state
        const areas = app.state.areasTecnologicas || [];

        ui.openModalWindow(id ? 'Editar Docente' : 'Novo Docente', `
             <div class="animate-fade-in flex flex-col h-full bg-[#F8FAFC]">
                 
                 <form id="form-docente" onsubmit="app.docentesView.save(event, '${id || ''}')" class="flex flex-col h-full">
                     
                     <!-- Header / Stats -->
                     <div class="bg-white border-b border-gray-200 px-6 py-4 shrink-0 z-20">
                        <div class="grid grid-cols-1 md:grid-cols-12 gap-5 items-end mb-0">
                            <div class="md:col-span-8 input-group mb-0">
                                <label class="input-label">Nome Completo</label>
                                <input name="nome" class="input-field font-bold" required value="${d.nome || ''}" placeholder="Nome do Professor">
                            </div>
                            <div class="md:col-span-4 input-group mb-0">
                                 <label class="input-label">Status</label>
                                 <select name="status" class="input-field">
                                      <option value="Ativo" ${d.status !== 'Inativo' ? 'selected' : ''}>Ativo</option>
                                      <option value="Inativo" ${d.status === 'Inativo' ? 'selected' : ''}>Inativo</option>
                                 </select>
                            </div>
                        </div>
                     </div>

                     <!-- Tabs Navigation -->
                     <div class="px-6 pt-0 bg-white border-b border-gray-200 flex items-center gap-4">
                         <div class="flex gap-1">
                             <button type="button" onclick="ui.switchModalTab('tab-perfil')" class="tab-pill active px-4 py-2 text-sm font-bold text-slate-600 border-b-2 border-slate-600 hover:bg-white rounded-t-lg transition-all">
                                 <i class="ph ph-user"></i> Perfil e Contato
                             </button>
                             <button type="button" onclick="ui.switchModalTab('tab-profissional')" class="tab-pill px-4 py-2 text-sm font-medium text-slate-400 border-b-2 border-transparent hover:text-indigo-600 hover:bg-slate-50 rounded-t-lg transition-all">
                                 <i class="ph ph-briefcase"></i> Dados Profissionais
                             </button>
                         </div>
                     </div>

                     <!-- Scrollable Content -->
                     <div class="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        
                        <!-- TAB 1: PERFIL -->
                        <div id="tab-perfil" class="modal-tab-content block animate-fade-in">
                             <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Identificação Pessoal</h4>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div class="input-group mb-0">
                                        <label class="input-label">CPF</label>
                                        <input name="cpf" class="input-field" value="${this.masks.cpf(d.cpf || '')}" onkeyup="this.value = app.docentesView.masks.cpf(this.value)" placeholder="000.000.000-00" maxlength="14">
                                    </div>
                                    <div class="input-group mb-0">
                                        <label class="input-label">Email</label>
                                        <input type="email" name="email" class="input-field" value="${d.email || ''}" placeholder="email@exemplo.com">
                                    </div>
                                    <div class="input-group mb-0 relative">
                                        <label class="input-label">Telefone</label>
                                        <input name="telefone" class="input-field pr-24" value="${this.masks.phone(d.telefone || '')}" onkeyup="this.value = app.docentesView.masks.phone(this.value)" placeholder="(00) 00000-0000">
                                        
                                        <!-- Custom Toggle Switch Component -->
                                        ${ui.SwitchField({
            name: 'whatsapp',
            checked: d.whatsapp,
            title: 'É WhatsApp?',
            className: 'absolute top-[35px] right-3'
        })}         </div>
                                </div>
                            </div>
                        </div>

                        <!-- TAB 2: PROFISSIONAL -->
                        <div id="tab-profissional" class="modal-tab-content hidden animate-fade-in space-y-6">
                            
                            <!-- Qualification -->
                            <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Qualificação</h4>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div class="input-group mb-0">
                                        <label class="input-label">Nível</label>
                                        <select name="nivel" class="input-field">
                                            <option value="">Selecione...</option>
                                            <option value="Técnico" ${d.nivel === 'Técnico' ? 'selected' : ''}>Técnico</option>
                                            <option value="Graduação" ${d.nivel === 'Graduação' ? 'selected' : ''}>Graduação</option>
                                            <option value="Especialização" ${d.nivel === 'Especialização' ? 'selected' : ''}>Especialização</option>
                                            <option value="Mestrado" ${d.nivel === 'Mestrado' ? 'selected' : ''}>Mestrado</option>
                                            <option value="Doutorado" ${d.nivel === 'Doutorado' ? 'selected' : ''}>Doutorado</option>
                                        </select>
                                    </div>
                                    <div class="input-group mb-0">
                                        <label class="input-label">Vínculo</label>
                                        <select name="vinculo" class="input-field">
                                            <option value="Mensalista" ${d.vinculo === 'Mensalista' ? 'selected' : ''}>Mensalista</option>
                                            <option value="Horista" ${d.vinculo === 'Horista' ? 'selected' : ''}>Horista</option>
                                            <option value="Credenciado" ${d.vinculo === 'Credenciado' ? 'selected' : ''}>Credenciado</option>
                                        </select>
                                    </div>
                                    <div class="input-group mb-0 md:col-span-2">
                                        <label class="input-label">Área de Formação</label>
                                        <input name="area_formacao" class="input-field" value="${d.area_formacao || ''}" placeholder="Ex: Engenharia Elétrica">
                                    </div>
                                </div>
                            </div>

                            <!-- Availability -->
                            <div class="input-group">
                                <label class="input-label">Disponibilidade de Horário</label>
                                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; padding: 0.5rem; border: 1px solid var(--border); border-radius: 8px; background: #f8fafc;">
                                    <label class="checkbox-tag">
                                        <input type="checkbox" name="disp_manha" value="Manhã" ${disp.includes('Manhã') ? 'checked' : ''}>
                                        <span><i class="ph-bold ph-sun-horizon text-orange-500"></i> Manhã</span>
                                    </label>
                                    
                                    <label class="checkbox-tag">
                                        <input type="checkbox" name="disp_tarde" value="Tarde" ${disp.includes('Tarde') ? 'checked' : ''}>
                                        <span><i class="ph-bold ph-sun text-amber-500"></i> Tarde</span>
                                    </label>

                                    <label class="checkbox-tag">
                                        <input type="checkbox" name="disp_noite" value="Noite" ${disp.includes('Noite') ? 'checked' : ''}>
                                        <span><i class="ph-bold ph-moon-stars text-indigo-500"></i> Noite</span>
                                    </label>
                                </div>
                            </div>

                            <!-- Areas -->
                            <div class="input-group">
                                <label class="input-label">Áreas Tecnológicas (Múltipla Escolha)</label>
                                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; max-height: 120px; overflow-y: auto; padding: 0.5rem; border: 1px solid var(--border); border-radius: 8px; background: #f8fafc;">
                                    ${areas.map(a => {
            const isSelected = linkedAreaIds.includes(a.id);
            return `
                                        <label class="checkbox-tag">
                                            <input type="checkbox" name="area_${a.id}" value="${a.id}" ${isSelected ? 'checked' : ''}>
                                            <span>${a.nome}</span>
                                        </label>
                                        `;
        }).join('')}
                                </div>
                                 ${areas.length === 0 ? '<div class="text-xs text-gray-400 mt-1 italic">Nenhuma área cadastrada.</div>' : ''}
                            </div>

                        </div>
                     </div>
                     
                     <!-- Hidden Submit Button (triggered by footer button) -->
                     <button type="submit" class="hidden" id="submit-docente-native"></button>

                     <!-- Footer (Outside Form for visual stickiness, but triggers form) -->
                     <div class="bg-white border-t border-gray-200 p-4 flex justify-end gap-3 shrink-0 z-20">
                        ${id ? `<button type="button" class="btn btn-secondary text-red-600 hover:bg-red-50" onclick="app.docentesView.delete('${id}')">Excluir</button>` : ''}
                        <button type="button" class="btn btn-secondary" onclick="ui.closeModal()">Cancelar</button>
                        <button type="button" class="btn btn-primary px-8" onclick="document.getElementById('submit-docente-native').click()">Salvar</button>
                     </div>

                 </form>
             </div>
        `, 'modal-lg');
    },

    async save(e, id) {
        e.preventDefault();
        const f = e.target;

        try {
            // Use FormData for cleaner data extraction
            const formData = new FormData(f);

            // Manual handling for specific fields
            const disp = [];
            if (f.disp_manha?.checked) disp.push('Manhã');
            if (f.disp_tarde?.checked) disp.push('Tarde');
            if (f.disp_noite?.checked) disp.push('Noite');

            const selectedAreas = [];
            f.querySelectorAll('input[name^="area_"]:checked').forEach(cb => {
                selectedAreas.push(cb.value);
            });

            const data = {
                nome: formData.get('nome'),
                cpf: formData.get('cpf').replace(/\D/g, ''), // Remove formatting chars (dots, bash)
                email: formData.get('email'),
                telefone: formData.get('telefone').replace(/\D/g, ''), // Remove formatting chars (parentheses, dash)
                whatsapp: f.whatsapp?.checked || false,
                nivel: formData.get('nivel'),
                area_formacao: formData.get('area_formacao'),
                vinculo: formData.get('vinculo'),
                status: formData.get('status'),
                disponibilidade: JSON.stringify(disp),
                areas: selectedAreas
            };

            // Basic Validation
            if (!data.nome) throw new Error('O nome é obrigatório.');

            console.log('Salvando docente:', data); // Debug

            await docentes.save(data, id || null);
            ui.toast('Docente salvo com sucesso!');
            ui.closeModal();

            if (window.app && app.refreshCurrentView) {
                app.refreshCurrentView();
            } else if (window.app && app.docentesView) {
                app.docentesView.render(); // Fallback re-render
            }

        } catch (err) {
            console.error('Erro ao salvar docente:', err);
            ui.toast('Erro ao salvar: ' + (err.message || 'Erro desconhecido'), 'error');
        }
    },

    async delete(id) {
        if (!confirm('Tem certeza?')) return;
        try {
            await docentes.delete(id);
            ui.toast('Excluído');
            ui.closeModal();
            if (window.app) window.app.refreshCurrentView();
        } catch (err) {
            ui.toast('Erro', 'error');
        }
    }
};
