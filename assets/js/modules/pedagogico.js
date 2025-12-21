
import { supabase } from '../services/supabase.js';
import { ui } from '../utils/ui.js';

export const pedagogico = {
    // State local para edição
    tempTags: {
        tecnicas: [],
        sociais: [],
        socioemocionais: [],
        conhecimentos: []
    },

    async render(state) {
        // Fetch Catalog UCs
        const { data: ucs, error } = await supabase
            .from('catalogo_ucs')
            .select('*')
            .order('nome', { ascending: true });

        if (error) {
            console.error(error);
            return `<div class="p-8 text-center text-red-500">Erro ao carregar catálogo: ${error.message}</div>`;
        }

        const areas = [...new Set(ucs.map(u => u.area_tecnologica).filter(Boolean))];

        return `
            <div class="max-w-7xl mx-auto space-y-6 pb-10">
                <header class="flex justify-between items-end">
                    <div>
                        <h2 class="text-3xl font-bold text-gray-800">Pedagógico</h2>
                        <p class="text-gray-500 mt-1">Banco de Unidades Curriculares e Desenho Curricular</p>
                    </div>
                    <button onclick="app.pedagogico.openModalUC()" class="btn-primary flex items-center gap-2 shadow-lg shadow-purple-500/20">
                        <i class="ph ph-plus-circle text-lg"></i> Nova UC Padrão
                    </button>
                </header>

                <!-- Stats / Filters -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="glass-panel p-4 flex items-center gap-4 bg-white">
                        <div class="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xl"><i class="ph ph-books"></i></div>
                        <div>
                            <p class="text-2xl font-bold text-gray-800">${ucs.length}</p>
                            <p class="text-xs text-gray-500 font-medium uppercase tracking-wide">UCs Cadastradas</p>
                        </div>
                    </div>
                </div>

                <!-- Catalog Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${ucs.map(uc => `
                        <div class="group bg-white rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 relative overflow-hidden cursor-pointer" onclick="app.pedagogico.openModalUC('${uc.id}')">
                            <div class="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <i class="ph ph-book-bookmark text-8xl text-purple-600"></i>
                            </div>
                            
                            <div class="relative z-10">
                                <span class="inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 mb-3">${uc.area_tecnologica || 'Geral'}</span>
                                <h3 class="text-lg font-bold text-gray-800 mb-1 line-clamp-2 h-14">${uc.nome}</h3>
                                <div class="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                    <span class="flex items-center gap-1"><i class="ph ph-clock"></i> ${uc.carga_horaria}h</span>
                                    <span class="flex items-center gap-1" title="Capacidades Técnicas"><i class="ph ph-wrench"></i> ${uc.capacidades_tecnicas?.length || 0}</span>
                                    <span class="flex items-center gap-1" title="Conhecimentos"><i class="ph ph-brain"></i> ${uc.conhecimentos?.length || 0}</span>
                                </div>
                                <div class="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                                    <div class="h-full bg-purple-500 w-full transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    async openModalUC(ucId = null) {
        let uc = null;

        // Reset temp state
        this.tempTags = { tecnicas: [], sociais: [], socioemocionais: [], conhecimentos: [] };

        if (ucId) {
            const { data, error } = await supabase.from('catalogo_ucs').select('*').eq('id', ucId).single();
            if (error) { ui.toast('Erro ao carregar UC', 'error'); return; }
            uc = data;
            // Load existing tags into temp state
            this.tempTags.tecnicas = uc.capacidades_tecnicas || [];
            this.tempTags.sociais = uc.capacidades_sociais || [];
            this.tempTags.socioemocionais = uc.capacidades_socioemocionais || [];
            this.tempTags.conhecimentos = uc.conhecimentos || [];
        }

        const areasOptions = app.state.areasTecnologicas.map(a =>
            `<option value="${a.nome}" ${uc?.area_tecnologica === a.nome ? 'selected' : ''}>${a.nome}</option>`
        ).join('');

        ui.openModalWindow(uc ? 'Editar Unidade Curricular' : 'Nova Unidade Curricular', `
            <form onsubmit="app.pedagogico.submitUC(event, '${ucId || ''}')" class="space-y-6">
                <!-- Basic Data -->
                <div class="grid grid-cols-12 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div class="col-span-12 md:col-span-6">
                        <label class="input-label">Nome da Unidade Curricular</label>
                        <input name="nome" required class="input-field" value="${uc?.nome || ''}" placeholder="Ex: Programação Front-end">
                    </div>
                    <div class="col-span-6 md:col-span-3">
                        <label class="input-label">Área Tecnológica</label>
                        <select name="area" class="input-field bg-white">
                            <option value="">Selecione...</option>
                            ${areasOptions}
                        </select>
                    </div>
                    <div class="col-span-6 md:col-span-3">
                        <label class="input-label">Carga Horária (h)</label>
                        <input name="ch" type="number" required class="input-field" value="${uc?.carga_horaria || ''}">
                    </div>
                    <div class="col-span-12">
                        <label class="input-label">Objetivo Geral</label>
                        <textarea name="objetivo" class="input-field min-h-[80px]" placeholder="Descreva o objetivo formativo desta UC...">${uc?.objetivo || ''}</textarea>
                    </div>
                </div>

                <!-- Tags Sections -->
                <div class="space-y-4">
                    ${this.renderTagSection('Capacidades Técnicas', 'tecnicas', 'ph-wrench', 'Ex: Desenvolver interfaces web responsivas...')}
                    ${this.renderTagSection('Capacidades Sociais', 'sociais', 'ph-users', 'Ex: Trabalhar em equipe colaborativa...')}
                    ${this.renderTagSection('Capacidades Socioemocionais', 'socioemocionais', 'ph-heart', 'Ex: Demonstrar resiliência...')}
                    ${this.renderTagSection('Conhecimentos', 'conhecimentos', 'ph-brain', 'Ex: Sintaxe HTML5, Seletores CSS3...')}
                </div>

                <!-- Footer -->
                <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <label class="input-label">Bibliografia Básica</label>
                    <textarea name="bibliografia" class="input-field min-h-[60px]" placeholder="Livros e referências...">${uc?.bibliografia_basica || ''}</textarea>
                </div>

                <div class="flex gap-3 justify-end pt-4 border-t border-gray-100">
                    <button type="button" onclick="ui.closeModal()" class="btn-secondary">Cancelar</button>
                    ${ucId ? `<button type="button" onclick="app.pedagogico.deleteUC('${ucId}')" class="btn-secondary text-red-600 hover:bg-red-50 border-red-200">Excluir</button>` : ''}
                    <button type="submit" class="btn-primary min-w-[200px]">
                        <i class="ph ph-check"></i> Salvar Unidade
                    </button>
                </div>
            </form>
        `);

        // Initial render of tags
        this.updateAllTagLists();
    },

    // Helper to render a tag section HTML
    renderTagSection(title, type, icon, placeholder) {
        return `
            <div class="border border-gray-200 rounded-xl overflow-hidden">
                <div class="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <h4 class="font-bold text-gray-700 flex items-center gap-2"><i class="ph ${icon}"></i> ${title}</h4>
                    <span class="text-xs bg-white px-2 py-1 rounded border border-gray-200 font-mono text-gray-500" id="count-${type}">0 itens</span>
                </div>
                <div class="p-4 bg-white">
                    <div class="flex gap-2 mb-3">
                        <input type="text" id="input-${type}" class="flex-1 input-field" placeholder="${placeholder}" onkeydown="if(event.key === 'Enter'){event.preventDefault(); app.pedagogico.addTag('${type}')}">
                        <button type="button" onclick="app.pedagogico.addTag('${type}')" class="btn-secondary px-4"><i class="ph ph-plus"></i></button>
                    </div>
                    <ul id="list-${type}" class="space-y-1 max-h-[150px] overflow-y-auto pr-2">
                        <!-- Tags rendered here -->
                    </ul>
                </div>
            </div>
        `;
    },

    addTag(type) {
        const input = document.getElementById(`input-${type}`);
        const value = input.value.trim();
        if (value) {
            this.tempTags[type].push(value);
            input.value = '';
            this.renderTagList(type);
        }
    },

    removeTag(type, index) {
        this.tempTags[type].splice(index, 1);
        this.renderTagList(type);
    },

    renderTagList(type) {
        const list = document.getElementById(`list-${type}`);
        const count = document.getElementById(`count-${type}`);
        const items = this.tempTags[type];

        if (list) {
            list.innerHTML = items.map((item, idx) => `
                <li class="flex items-start gap-2 text-sm text-gray-600 group hover:bg-gray-50 p-1.5 rounded transition-colors bg-white border border-gray-100">
                    <i class="ph ph-check-circle text-green-500 mt-0.5"></i>
                    <span class="flex-1">${item}</span>
                    <button type="button" onclick="app.pedagogico.removeTag('${type}', ${idx})" class="text-gray-300 hover:text-red-500 transition-colors">
                        <i class="ph ph-x"></i>
                    </button>
                </li>
            `).join('') || '<li class="text-xs text-gray-400 italic text-center py-2">Nenhum item adicionado.</li>';
        }

        if (count) {
            count.innerText = `${items.length} itens`;
        }
    },

    updateAllTagLists() {
        ['tecnicas', 'sociais', 'socioemocionais', 'conhecimentos'].forEach(type => this.renderTagList(type));
    },

    async submitUC(e, ucId) {
        e.preventDefault();
        const form = e.target;

        const data = {
            nome: form.nome.value,
            area_tecnologica: form.area.value,
            carga_horaria: form.ch.value,
            objetivo: form.objetivo.value,
            bibliografia_basica: form.bibliografia.value,
            capacidades_tecnicas: this.tempTags.tecnicas,
            capacidades_sociais: this.tempTags.sociais,
            capacidades_socioemocionais: this.tempTags.socioemocionais,
            conhecimentos: this.tempTags.conhecimentos
        };

        let result;
        if (ucId) {
            result = await supabase.from('catalogo_ucs').update(data).eq('id', ucId);
        } else {
            result = await supabase.from('catalogo_ucs').insert(data);
        }

        if (result.error) {
            ui.toast('Erro ao salvar UC: ' + result.error.message, 'error');
        } else {
            ui.toast('Unidade Curricular salva com sucesso!');
            ui.closeModal();
            app.refreshCurrentView(); // Reload list
        }
    },

    async deleteUC(ucId) {
        if (!confirm('Deseja realmente excluir esta UC do catálogo? Isso não afeta matrizes que já importaram esta UC.')) return;

        const { error } = await supabase.from('catalogo_ucs').delete().eq('id', ucId);

        if (error) {
            ui.toast('Erro ao excluir: ' + error.message, 'error');
        } else {
            ui.toast('UC excluída do catálogo.');
            ui.closeModal();
            app.refreshCurrentView();
        }
    }
};
