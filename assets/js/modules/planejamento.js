
import { supabase } from '../services/supabase.js';
import { ui } from '../utils/ui.js';
import { ux } from '../utils/ux.js';
import { matrizes } from './matrizes.js';

export const planejamento = {
    currentTab: 'cursos',

    render(state) {
        return `
            <div class="animate-fade-in" style="padding-bottom: 80px;">
                <!-- Header -->
                <div class="page-header">
                    <h2 class="page-title">Planejamento</h2>
                    <p class="page-subtitle">Gestão Estrutural: Cursos, Matrizes, Docentes e Alocação</p>
                </div>

                <!-- Tabs -->
                <div class="tab-pills">
                    <button onclick="app.planejamento.switchTab('cursos')" 
                        class="tab-pill ${this.currentTab === 'cursos' ? 'active' : ''}">
                        <i class="ph ph-graduation-cap"></i> Cursos
                    </button>
                    <button onclick="app.planejamento.switchTab('matrizes')" 
                        class="tab-pill ${this.currentTab === 'matrizes' ? 'active' : ''}">
                        <i class="ph ph-file-text"></i> Matrizes
                    </button>
                    <button onclick="app.planejamento.switchTab('docentes')" 
                         class="tab-pill ${this.currentTab === 'docentes' ? 'active' : ''}">
                        <i class="ph ph-chalkboard-teacher"></i> Docentes
                    </button>
                    <button onclick="app.planejamento.switchTab('turmas')" 
                         class="tab-pill ${this.currentTab === 'turmas' ? 'active' : ''}">
                        <i class="ph ph-users-three"></i> Turmas
                    </button>
                    <button onclick="app.planejamento.switchTab('ucs')" 
                         class="tab-pill ${this.currentTab === 'ucs' ? 'active' : ''}">
                        <i class="ph ph-book-bookmark"></i> Catálogo UCs
                    </button>
                    <button onclick="app.planejamento.switchTab('ambientes')" 
                         class="tab-pill ${this.currentTab === 'ambientes' ? 'active' : ''}">
                        <i class="ph ph-buildings"></i> Ambientes
                    </button>
                </div>

                <!-- Tab Content -->
                <div id="planejamento-content">
                    ${this.renderTabContent(state)}
                </div>
            </div>
        `;
    },

    renderTabContent(state) {
        switch (this.currentTab) {
            case 'cursos': return this.renderCursos(state);
            case 'matrizes': return this.renderMatrizes(state);
            case 'docentes': return this.renderDocentes(state);
            case 'turmas': return this.renderTurmas(state);
            case 'ucs': return this.renderUCs(state);
            case 'ambientes': return this.renderAmbientesTab(state);
            default: return this.renderCursos(state);
        }
    },

    switchTab(tabName) {
        this.currentTab = tabName;
        // Update UI Tabs
        document.querySelectorAll('.tab-pill').forEach(btn => btn.classList.remove('active'));
        const btn = document.querySelector(`button[onclick*="'${tabName}'"]`);
        if (btn) btn.classList.add('active');

        // Render Content
        const content = document.getElementById('planejamento-content');
        if (content) {
            content.innerHTML = this.renderTabContent(app.state);

            // Post-Render Hooks (with DOM update delay)
            if (tabName === 'turmas' && app.turmasView?.init) {
                app.turmasView._initialized = false; // Reset flag for re-initialization
                requestAnimationFrame(() => app.turmasView.init());
            }
        }
    },

    /* ... Cursos ... */

    renderTurmas(state) {
        return app.turmasView.render();
    },

    /* ==========================================================================================
       TAB 1: GESTÃO DE CURSOS
       ========================================================================================== */
    renderCursos(state) {
        return `
            <div class="animate-fade-in">
                <!-- Header & Actions -->
                <div class="flex-between" style="margin-bottom: 2rem;">
                    <div>
                         <h3 class="input-label" style="font-size: 1.25rem; margin-bottom: 0.25rem;">Portfólio de Cursos</h3>
                         <p class="token-meta">Gerencie os cursos ofertados na instituição</p>
                    </div>
                    <button onclick="app.planejamento.openModalCurso()" class="btn btn-primary">
                        <i class="ph ph-graduation-cap"></i> Novo Curso
                    </button>
                </div>

                <!-- Filters -->
                <div class="card" style="padding: 1rem; margin-bottom: 1.5rem; display: flex; gap: 1rem;">
                    <div style="flex: 1; position: relative;">
                        <i class="ph ph-magnifying-glass" style="position: absolute; left: 1rem; top: 1rem; color: #94a3b8;"></i>
                        <input id="curso-search" onkeyup="app.planejamento.filterCursos()" class="input-field" style="padding-left: 2.5rem;" placeholder="Buscar curso...">
                    </div>
                    <div style="width: 200px;">
                        <select id="curso-filter-area" onchange="app.planejamento.filterCursos()" class="input-field">
                            <option value="">Todas as Áreas</option>
                            ${state.areasTecnologicas.map(a => `<option value="${a.nome}">${a.nome}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <!-- Course List -->
                <div id="cursos-list-container" class="token-list">
                    ${this.renderCursosListItems(state.courses)}
                </div>
            </div>
        `;
    },

    /* ==========================================================================================
       TAB 1.5: GESTÃO DE MATRIZES
       ========================================================================================== */
    renderMatrizes(state) {
        // Prepare list (flat list of matrices with course name)
        const matricesWithCourse = state.matrices.map(m => {
            const linkedCourses = state.courses.filter(c => c.matriz_id === m.id);
            const courseNames = linkedCourses.length
                ? linkedCourses.map(c => c.nome).join(', ')
                : 'Não vinculada';

            return {
                ...m,
                curso_nome: courseNames,
                linked_count: linkedCourses.length
            };
        }).sort((a, b) => b.created_at.localeCompare(a.created_at));

        return `
            <div class="animate-fade-in">
                 <div class="flex-between" style="margin-bottom: 2rem;">
                    <div>
                         <h3 class="input-label" style="font-size: 1.25rem; margin-bottom: 0.25rem;">Matrizes Curriculares</h3>
                         <p class="token-meta">Todas as versões de currículos cadastradas</p>
                    </div>
                    <button onclick="app.matrizesView.openModal()" class="btn btn-primary">
                        <i class="ph ph-plus-circle"></i> Nova Matriz
                    </button>
                </div>

                 <!-- Filters -->
                <div class="card" style="padding: 1rem; margin-bottom: 1.5rem; display: flex; gap: 1rem;">
                    <div style="flex: 1; position: relative;">
                        <i class="ph ph-magnifying-glass" style="position: absolute; left: 1rem; top: 1rem; color: #94a3b8;"></i>
                        <input id="matriz-search" onkeyup="app.planejamento.filterMatrizes()" class="input-field" style="padding-left: 2.5rem;" placeholder="Buscar matriz por código ou curso...">
                    </div>
                </div>

                <div id="matrizes-list-container" class="token-list">
                    ${this.renderMatrizesListItems(matricesWithCourse)}
                </div>
            </div>
        `;
    },

    renderMatrizesListItems(list) {
        if (!list || list.length === 0) return ux.renderEmptyState('Nenhuma matriz encontrada.');

        return list.map(m => `
            <div class="token-item group" onclick="app.matrizesView.openModal('${m.id}')">
                <div class="token-icon yellow" style="font-size: 1.1rem;">
                    <i class="ph ph-file-text"></i>
                </div>
                 <div class="token-info">
                    <div class="token-name">${m.codigo}</div>
                    <div class="token-meta">
                        ${m.curso_nome}
                        <span style="margin: 0 6px;">•</span>
                        <span class="text-gray-700 font-medium bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                            <i class="ph-bold ph-clock"></i> ${m.carga_horaria_total || 0}h
                        </span>
                        <span style="margin: 0 6px;">•</span>
                        ${window.dayjs(m.created_at).format('DD/MM/YYYY')}
                    </div>
                </div>
                 <div class="flex items-center gap-3">
                    <div class="badge ${m.status === 'Ativa' ? 'badge-success' : 'badge-neutral'}">${m.status}</div>
                    <i class="ph ph-caret-right text-gray-300 group-hover:text-primary transition-colors"></i>
                </div>
            </div>
        `).join('');
    },

    filterMatrizes() {
        const term = document.getElementById('matriz-search').value.toLowerCase();

        const visible = app.state.matrices.map(m => {
            const linkedCourses = app.state.courses.filter(c => c.matriz_id === m.id);
            const courseNames = linkedCourses.length
                ? linkedCourses.map(c => c.nome).join(', ')
                : 'Não vinculada';
            return {
                ...m,
                curso_nome: courseNames
            };
        }).filter(m => {
            return m.codigo.toLowerCase().includes(term) || m.curso_nome.toLowerCase().includes(term);
        });

        document.getElementById('matrizes-list-container').innerHTML = this.renderMatrizesListItems(visible);
    },

    renderCursosListItems(courses) {
        if (!courses || courses.length === 0) return ux.renderEmptyState('Nenhum curso encontrado.');

        return courses.map(c => {
            // Get the linked matrix for this course
            const linkedMatriz = c.matriz_id
                ? app.state.matrices.find(m => m.id === c.matriz_id)
                : null;

            // Calculate Matrix Workload
            const chMatriz = linkedMatriz?.carga_horaria_total || 0;
            const chCurso = c.carga_horaria || 0;

            // Determine Relation & Styling
            let relationHtml = '';
            if (linkedMatriz) {
                const diff = chMatriz - chCurso;
                let colorClass = 'text-gray-500';
                let icon = '';

                if (chCurso > 0) {
                    if (diff === 0) {
                        colorClass = 'text-green-600 font-bold';
                        icon = '<i class="ph-bold ph-check"></i>';
                    } else if (Math.abs(diff) < chCurso * 0.05) { // 5% tolerance
                        colorClass = 'text-yellow-600 font-bold';
                        icon = '<i class="ph-bold ph-warning"></i>';
                    } else {
                        colorClass = 'text-red-500 font-bold';
                        icon = '<i class="ph-bold ph-warning-circle"></i>';
                    }
                }
                relationHtml = `
                    <span class="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded ml-2" title="Matriz Vinculada">
                        <i class="ph ph-link text-gray-400"></i> ${linkedMatriz.codigo}
                    </span>
                    <span class="${colorClass} ml-1" title="Carga Horária: Matriz vs Curso">
                        ${icon} ${chMatriz}h / ${chCurso}h
                    </span>
                `;
            } else {
                relationHtml = `<span class="text-gray-400">Sem matriz vinculada</span>`;
            }

            return `
            <div class="token-item group" onclick="app.planejamento.openModalCurso('${c.id}')">
                <div class="token-icon ${this.getAreaColor(c.area_tecnologica)}">
                    <i class="ph ph-graduation-cap"></i>
                </div>
                <div class="token-info">
                    <div class="token-name">${c.nome}</div>
                    <div class="token-meta">
                        ${c.area_tecnologica}
                        <span style="margin: 0 6px;">•</span>
                        ${relationHtml}
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <div class="badge ${c.status === 'Ativo' ? 'badge-success' : 'badge-neutral'}">${c.status}</div>
                    <i class="ph ph-caret-right text-gray-300 group-hover:text-primary transition-colors"></i>
                </div>
            </div>
            `;
        }).join('');
    },

    filterCursos() {
        const term = document.getElementById('curso-search').value.toLowerCase();
        const area = document.getElementById('curso-filter-area').value;

        const filtered = app.state.courses.filter(c => {
            const matchName = c.nome.toLowerCase().includes(term);
            const matchArea = area ? c.area_tecnologica === area : true;
            return matchName && matchArea;
        });

        document.getElementById('cursos-list-container').innerHTML = this.renderCursosListItems(filtered);
    },

    /* ==========================================================================================
       TAB 2: DOCENTES
       ========================================================================================== */
    /* ==========================================================================================
       TAB 2: DOCENTES
       ========================================================================================== */
    /* ==========================================================================================
       TAB 2: DOCENTES (Delegated to Module)
       ========================================================================================== */
    renderDocentes(state) {
        return app.docentesView.render(state);
    },




    /* ==========================================================================================
       TAB 4: GESTÃO DE UCS (CATÁLOGO GLOBAL)
       ========================================================================================== */
    /* ==========================================================================================
       TAB 5: AMBIENTES
       ========================================================================================== */
    renderAmbientesTab(state) {
        return app.ambientes.render(state);
    },

    /* ==========================================================================================
       TAB 4: GESTÃO DE UCS (CATÁLOGO GLOBAL)
       ========================================================================================== */
    renderUCs(state) {
        // Trigger load immediately
        setTimeout(() => this.loadUCsAsync(), 50);

        return `
            <div class="animate-fade-in">
                 <div class="flex-between" style="margin-bottom: 2rem;">
                    <div>
                         <h3 class="input-label" style="font-size: 1.25rem; margin-bottom: 0.25rem;">Catálogo de Unidades Curriculares</h3>
                         <p class="token-meta">Banco de dados global de disciplinas da instituição</p>
                    </div>
                    <button onclick="app.planejamento.openModalCatalogoUC()" class="btn btn-primary">
                        <i class="ph ph-plus-circle"></i> Nova UC no Catálogo
                    </button>
                </div>
                
                <!-- Filters -->
                <div class="card flex flex-wrap gap-4 p-4 mb-6 sticky top-0 bg-[#F8FAFC]/80 backdrop-blur z-10 border border-slate-200/60 shadow-sm">
                    <div class="relative flex-1">
                        <i class="ph ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        <input id="uc-search" onkeyup="app.planejamento.filterUCs()" class="input-field pl-10" placeholder="Buscar por nome da UC...">
                    </div>
                    <div class="w-full md:w-56">
                        <select id="uc-filter-area" onchange="app.planejamento.filterUCs()" class="input-field cursor-pointer">
                            <option value="">Todas as Áreas</option>
                            ${state.areasTecnologicas.map(a => `<option value="${a.nome}">${a.nome}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <!-- List Container -->
                <div id="catalogo-ucs-container" class="token-list">
                    <div class="loading-spinner"></div>
                </div>
            </div>
        `;
    },

    async loadUCsAsync() {
        const container = document.getElementById('catalogo-ucs-container');
        if (!container) return;

        // Fetch all UCs
        const { data: ucs, error } = await supabase.from('unidades_curriculares').select('*').order('nome');

        if (error) {
            container.innerHTML = `<div class="card p-4 text-center text-red-500">Erro ao carregar catálogo: ${error.message}</div>`;
            return;
        }

        // Store globally for filtering
        app.state.catalogoUcs = ucs || [];
        this.renderUCsList(app.state.catalogoUcs);
    },

    renderUCsList(ucs) {
        const container = document.getElementById('catalogo-ucs-container');
        if (!ucs || ucs.length === 0) {
            container.innerHTML = ux.renderEmptyState('Nenhuma UC encontrada no catálogo.');
            return;
        }

        container.innerHTML = ucs.map(uc => `
            <div class="token-item group hover:border-slate-300 transition-colors" onclick="app.planejamento.openModalCatalogoUC('${uc.id}')">
                <div class="token-icon bg-white border border-slate-100 text-slate-600">
                    <i class="ph ph-book-open text-xl"></i>
                </div>
                <div class="token-info">
                    <div class="token-name group-hover:text-primary transition-colors">${uc.nome}</div>
                    <div class="token-meta flex items-center gap-2 mt-1">
                        <span class="text-slate-500">${uc.carga_horaria}h</span>
                        <span class="text-slate-300 px-1">|</span>
                        <div class="flex flex-wrap gap-1">
                            ${Array.isArray(uc.area_tecnologica)
                ? uc.area_tecnologica.map(a => `<span class="text-xs font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">${a}</span>`).join('')
                : `<span class="text-xs font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">${uc.area_tecnologica || 'Geral'}</span>`}
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-2 pl-4 border-l border-slate-100">
                    <div class="badge badge-neutral whitespace-nowrap">${uc.tipo || 'Padrão'}</div>
                    
                    <button onclick="event.stopPropagation(); app.planejamento.openModalCatalogoUCDetails('${uc.id}')" 
                            class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg opacity-60 group-hover:opacity-100 transition-all ml-1" 
                            title="Ver Detalhes Pedagógicos">
                        <i class="ph ph-eye text-lg"></i>
                    </button>
                    
                    <button onclick="event.stopPropagation(); app.planejamento.deleteCatalogoUC('${uc.id}')" 
                            class="p-2 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all" 
                            title="Excluir do Catálogo">
                        <i class="ph ph-trash text-lg"></i>
                    </button>
                    
                    <i class="ph ph-caret-right text-gray-300 ml-2"></i>
                </div>
            </div>
        `).join('');
    },

    filterUCs() {
        const term = document.getElementById('uc-search').value.toLowerCase();
        const area = document.getElementById('uc-filter-area').value;

        const filtered = app.state.catalogoUcs.filter(uc => {
            const matchName = uc.nome.toLowerCase().includes(term);
            // Support both Array and String for area_tecnologica
            const matchArea = area ? (
                Array.isArray(uc.area_tecnologica)
                    ? uc.area_tecnologica.includes(area)
                    : uc.area_tecnologica === area
            ) : true;
            return matchName && matchArea;
        });

        this.renderUCsList(filtered);
    },

    // --- CRUD CATÁLOGO ---
    openModalCatalogoUC(id = null) {
        const uc = id ? app.state.catalogoUcs.find(u => u.id === id) : null;
        const areas = app.state.areasTecnologicas;

        // Helpers to format arrays for textarea (one per line)
        const toText = (arr) => arr ? arr.join('\n') : '';

        // Handle Area Array (normalize)
        let currentAreas = [];
        if (uc?.area_tecnologica) {
            currentAreas = Array.isArray(uc.area_tecnologica) ? uc.area_tecnologica : [uc.area_tecnologica];
        }

        // Generate Checkbox Tags HTML
        const areasTagsHtml = areas.map(a => `
            <label class="checkbox-tag">
                <input type="checkbox" name="area_tecnologica" value="${a.nome}" ${currentAreas.includes(a.nome) ? 'checked' : ''}>
                <span>${a.nome}</span>
            </label>
        `).join('');

        ui.openModalWindow(uc ? 'Editar UC do Catálogo' : 'Nova UC no Catálogo', `
            <div class="animate-fade-in">
                <!-- Tabs -->
                <div class="tab-pills mb-4" style="margin-bottom: 1.5rem; justify-content: center; width: 100%;">
                   <button type="button" class="tab-pill active" onclick="ui.switchModalTab('tab-img-geral')"><i class="ph ph-info"></i> Geral</button>
                   <button type="button" class="tab-pill" onclick="ui.switchModalTab('tab-img-pedag')"><i class="ph ph-book-bookmark"></i> Pedagógico</button>
                   <button type="button" class="tab-pill" onclick="ui.switchModalTab('tab-img-cap')"><i class="ph ph-brain"></i> Capacidades</button>
                </div>

                <form onsubmit="app.planejamento.submitCatalogoUC(event, '${id || ''}')">
                    
                    <!-- TAB GERAL -->
                    <div id="tab-img-geral" class="modal-tab-content">
                        <div class="input-group">
                            <label class="input-label">Nome da Unidade Curricular</label>
                            <input name="nome" class="input-field" required value="${uc?.nome || ''}" placeholder="Ex: Lógica de Programação">
                        </div>
                        
                        <div class="grid-2">
                            <div class="input-group">
                                <label class="input-label">Carga Horária (horas)</label>
                                <input name="carga_horaria" type="number" class="input-field" required value="${uc?.carga_horaria || ''}">
                            </div>
                             <div class="input-group">
                                <label class="input-label">Módulo</label>
                                <select name="tipo" class="input-field">
                                    <option value="Básico" ${(uc?.tipo === 'Básico' || uc?.tipo === 'Base') ? 'selected' : ''}>Básico</option>
                                    <option value="Introdutório" ${uc?.tipo === 'Introdutório' ? 'selected' : ''}>Introdutório</option>
                                    <option value="Específico" ${(uc?.tipo === 'Específico' || uc?.tipo === 'Específica') ? 'selected' : ''}>Específico</option>
                                </select>
                            </div>
                        </div>

                         <div class="input-group">
                            <label class="input-label">Áreas Tecnológicas (Múltipla Escolha)</label>
                            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; max-height: 120px; overflow-y: auto; padding: 0.5rem; border: 1px solid var(--border); border-radius: 8px; background: #f8fafc;">
                                ${areasTagsHtml}
                            </div>
                        </div>


                    </div>

                    <!-- TAB PEDAGÓGICO -->
                    <div id="tab-img-pedag" class="modal-tab-content hidden">
                        <div class="input-group">
                            <label class="input-label">Objetivo Geral</label>
                            <textarea name="objetivo" class="input-field" rows="4" placeholder="Descreva o objetivo desta UC...">${uc?.objetivo || ''}</textarea>
                        </div>
                        <div class="input-group">
                            <label class="input-label">Bibliografia Básica</label>
                            <textarea name="bibliografia" class="input-field" rows="4" placeholder="Livros e referências...">${uc?.bibliografia_basica || ''}</textarea>
                        </div>
                    </div>

                    <!-- TAB CAPACIDADES -->
                    <div id="tab-img-cap" class="modal-tab-content hidden">
                        <div class="input-hint" style="margin-bottom: 1rem; justify-content: center; background: #fffbeb; padding: 0.5rem; border-radius: 8px; color: #b45309;">
                            <i class="ph ph-lightbulb"></i> Pressione ENTER para separar cada item da lista (Um por linha).
                        </div>
                        <div class="input-group">
                            <label class="input-label">Conhecimentos (Saber)</label>
                            <textarea name="conhecimentos" class="input-field" rows="5" placeholder="Um item por linha...">${toText(uc?.conhecimentos)}</textarea>
                        </div>
                        <div class="input-group">
                            <label class="input-label">Capacidades Técnicas (Saber Fazer)</label>
                            <textarea name="cap_tecnicas" class="input-field" rows="5" placeholder="Um item por linha...">${toText(uc?.capacidades_tecnicas)}</textarea>
                        </div>
                        <div class="input-group">
                             <label class="input-label">Capacidades Sociais</label>
                             <textarea name="cap_sociais" class="input-field" rows="4" placeholder="Um item por linha...">${toText(uc?.capacidades_sociais)}</textarea>
                        </div>
                        <div class="input-group">
                             <label class="input-label">Capacidades Socioemocionais</label>
                             <textarea name="cap_socio" class="input-field" rows="4" placeholder="Um item por linha...">${toText(uc?.capacidades_socioemocionais)}</textarea>
                        </div>
                    </div>

                    <div class="flex-between" style="border-top: 1px solid var(--border); padding-top: 1.5rem; margin-top: 1rem;">
                        <button type="button" onclick="ui.closeModal()" class="btn btn-secondary">Cancelar</button>
                        <button type="submit" class="btn btn-primary">
                            <i class="ph ph-check"></i> Salvar no Catálogo
                        </button>
                    </div>
                </form>
            </div>
        `, 'modal-lg');
    },

    async submitCatalogoUC(e, id) {
        e.preventDefault();
        const f = e.target;

        // Helper to parse textarea lines to array
        const toArray = (text) => text.split('\n').map(t => t.trim()).filter(t => t);

        // Capture checked Areas
        const selectedAreas = Array.from(f.querySelectorAll('input[name="area_tecnologica"]:checked')).map(cb => cb.value);

        if (selectedAreas.length === 0) {
            ui.toast('Selecione pelo menos uma Área Tecnológica', 'error');
            return;
        }

        const data = {
            nome: f.nome.value,
            carga_horaria: parseInt(f.carga_horaria.value),
            area_tecnologica: selectedAreas, // Saves Array directly
            tipo: f.tipo.value,
            // ativo field removed as it does not exist in DB
            // Pedagogical Data
            objetivo: f.objetivo.value,
            bibliografia_basica: f.bibliografia.value,
            conhecimentos: toArray(f.conhecimentos.value),
            capacidades_tecnicas: toArray(f.cap_tecnicas.value),
            capacidades_sociais: toArray(f.cap_sociais.value),
            capacidades_socioemocionais: toArray(f.cap_socio.value)
        };

        const { error } = id
            ? await supabase.from('unidades_curriculares').update(data).eq('id', id)
            : await supabase.from('unidades_curriculares').insert(data);

        if (error) {
            ui.toast('Erro ao salvar: ' + error.message, 'error');
        } else {
            // Se for edição, recalcular Carga Horária das matrizes que usam esta UC
            if (id) {
                try {
                    const { data: links } = await supabase
                        .from('matriz_ucs')
                        .select('matriz_id')
                        .eq('uc_id', id);

                    if (links && links.length > 0) {
                        const uniqueMatrizIds = [...new Set(links.map(l => l.matriz_id))];
                        ui.toast(`Atualizando ${uniqueMatrizIds.length} matrizes vinculadas...`, 'info');

                        await Promise.all(uniqueMatrizIds.map(mid => matrizes.updateTotalHours(mid)));
                    }
                } catch (cascadeErr) {
                    console.error('Erro ao atualizar matrizes em cascata:', cascadeErr);
                }
            }

            ui.toast('UC salva e alterações propagadas com sucesso!', 'success');
            ui.closeModal();
            this.loadUCsAsync(); // Reload list
        }
    },

    openModalCatalogoUCDetails(id) {
        const uc = app.state.catalogoUcs.find(u => u.id === id);
        if (!uc) return;

        // Helper to render list
        const renderList = (arr) => {
            if (!arr || arr.length === 0) return '<p class="text-gray-400 italic">Nenhum registro.</p>';
            return `<ul class="list-disc pl-5 space-y-1 text-slate-700">${arr.map(i => `<li>${i}</li>`).join('')}</ul>`;
        };

        ui.openModalWindow(`Detalhes: ${uc.nome}`, `
            <div class="animate-fade-in text-sm">
                <!-- Header Info -->
                <div class="bg-slate-50 p-4 rounded-lg mb-4 border border-slate-100">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <span class="block text-xs font-bold text-slate-400 uppercase">Carga Horária</span>
                            <span class="text-slate-800 font-medium">${uc.carga_horaria} horas</span>
                        </div>
                        <div>
                            <span class="block text-xs font-bold text-slate-400 uppercase">Tipo</span>
                            <span class="badge badge-neutral mt-1">${uc.tipo || 'Padrão'}</span>
                        </div>
                        <div class="col-span-2">
                            <span class="block text-xs font-bold text-slate-400 uppercase mb-1">Áreas Tecnológicas</span>
                            <div class="flex gap-2 flex-wrap">
                                ${Array.isArray(uc.area_tecnologica)
                ? uc.area_tecnologica.map(a => `<span class="badge-area">${a}</span>`).join('')
                : `<span class="badge-area">${uc.area_tecnologica}</span>`}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tabs -->
                <div class="tab-pills mb-4" style="justify-content: center;">
                   <button type="button" class="tab-pill active" onclick="ui.switchModalTab('view-pedag')"><i class="ph ph-book-bookmark"></i> Pedagógico</button>
                   <button type="button" class="tab-pill" onclick="ui.switchModalTab('view-cap')"><i class="ph ph-brain"></i> Capacidades</button>
                </div>

                <div id="view-pedag" class="modal-tab-content space-y-4">
                    <div>
                        <h4 class="font-bold text-slate-700 mb-2 border-b border-slate-100 pb-1">Objetivo Geral</h4>
                        <p class="text-slate-600 leading-relaxed whitespace-pre-line">${uc.objetivo || '<span class="text-gray-400 italic">Não informado.</span>'}</p>
                    </div>
                    <div>
                        <h4 class="font-bold text-slate-700 mb-2 border-b border-slate-100 pb-1">Bibliografia Básica</h4>
                        <p class="text-slate-600 leading-relaxed whitespace-pre-line">${uc.bibliografia_basica || '<span class="text-gray-400 italic">Não informada.</span>'}</p>
                    </div>
                </div>

                <div id="view-cap" class="modal-tab-content hidden space-y-4">
                     <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 class="font-bold text-emerald-700 mb-2"><i class="ph ph-check-circle"></i> Conhecimentos (Saber)</h4>
                            ${renderList(uc.conhecimentos)}
                        </div>
                        <div>
                            <h4 class="font-bold text-blue-700 mb-2"><i class="ph ph-wrench"></i> Cap. Técnicas (Saber Fazer)</h4>
                            ${renderList(uc.capacidades_tecnicas)}
                        </div>
                        <div>
                            <h4 class="font-bold text-purple-700 mb-2"><i class="ph ph-users"></i> Cap. Sociais</h4>
                            ${renderList(uc.capacidades_sociais)}
                        </div>
                        <div>
                            <h4 class="font-bold text-pink-700 mb-2"><i class="ph ph-heart"></i> Cap. Socioemocionais</h4>
                            ${renderList(uc.capacidades_socioemocionais)}
                        </div>
                     </div>
                </div>

                <div class="mt-6 pt-4 border-t border-slate-100 text-right">
                    <button onclick="app.planejamento.openModalCatalogoUC('${uc.id}')" class="btn btn-secondary text-primary">
                        <i class="ph ph-pencil-simple"></i> Editar
                    </button>
                    <button onclick="ui.closeModal()" class="btn btn-primary ml-2">Fechar</button>
                </div>
            </div>
        `, 'modal-lg');
    },

    async deleteCatalogoUC(id) {
        if (!confirm('Tem certeza que deseja excluir esta Unidade Curricular?')) return;

        const { error } = await supabase.from('unidades_curriculares').delete().eq('id', id);

        if (error) {
            console.error('Erro ao excluir UC:', error);
            if (error.message.includes('lotacoes_turma')) {
                ui.toast('Não é possível excluir: Esta UC possui professores alocados em turmas (Lotações).', 'error');
            } else if (error.message.includes('matriz_ucs')) {
                ui.toast('Não é possível excluir: Esta UC está vinculada a uma ou mais Matrizes Curriculares.', 'error');
            } else {
                ui.toast('Erro ao excluir: ' + error.message, 'error');
            }
        } else {
            ui.toast('UC removida do catálogo com sucesso!', 'success');
            this.loadUCsAsync();
        }
    },


    /* ==========================================================================================
       MODALS ACTIONS (CRUD & HIERARCHY MANAGER)
       ========================================================================================== */

    // --- CURSO MANAGER (DETAILS & MATRICES) ---
    async openModalCurso(id = null) {
        const curso = id ? app.state.courses.find(c => c.id === id) : null;

        // Get the linked matrix for this course (if any)
        const linkedMatriz = curso?.matriz_id
            ? app.state.matrices.find(m => m.id === curso.matriz_id)
            : null;

        // Get all available matrices for selection
        const allMatrices = app.state.matrices || [];

        const areas = app.state.areasTecnologicas;

        ui.openModalWindow(curso ? 'Gerenciar Curso' : 'Novo Curso', `
            <div class="animate-fade-in">
                <form onsubmit="app.planejamento.submitCurso(event, '${id || ''}')" style="margin-bottom: 2rem;">
                    <div class="grid-2">
                        <div class="input-group">
                            <label class="input-label">Nome do Curso</label>
                            <input name="nome" class="input-field" required value="${curso?.nome || ''}" placeholder="Ex: Técnico em Desenvolvimento">
                        </div>
                        <div class="input-group">
                            <label class="input-label">Área Tecnológica</label>
                            <select name="area" class="input-field" required>
                                <option value="">Selecione...</option>
                                ${areas.map(a => `<option value="${a.nome}" ${curso?.area_tecnologica === a.nome ? 'selected' : ''}>${a.nome}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="grid-2">
                        <div class="input-group">
                            <label class="input-label">Carga Horária Total (h)</label>
                            <input name="carga_horaria" type="number" class="input-field" required value="${curso?.carga_horaria || ''}" placeholder="Ex: 1200">
                        </div>
                        <div class="input-group">
                            <label class="input-label">Status</label>
                            <select name="status" class="input-field">
                                <option value="Ativo" ${curso?.status === 'Ativo' ? 'selected' : ''}>Ativo</option>
                                <option value="Inativo" ${curso?.status === 'Inativo' ? 'selected' : ''}>Inativo</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="input-group">
                        <label class="input-label">Matriz Curricular</label>
                        <div class="flex gap-2">
                            <select name="matriz_id" class="input-field" style="flex: 1;">
                                <option value="">Nenhuma matriz vinculada</option>
                                ${allMatrices.map(m => `<option value="${m.id}" ${(curso?.matriz_id === m.id) ? 'selected' : ''}>${m.codigo}</option>`).join('')}
                            </select>
                        </div>
                        <small class="text-xs text-gray-500 mt-1">
                            ${linkedMatriz
                ? `Matriz atual: <strong>${linkedMatriz.codigo}</strong> • ${linkedMatriz.carga_horaria_total || 0}h`
                : 'Selecione uma matriz curricular para este curso'}
                        </small>
                    </div>
                    
                    <div class="mt-4">
                        <button type="submit" class="btn btn-primary w-full">
                            <i class="ph ph-check"></i> ${curso ? 'Atualizar Curso' : 'Criar Curso'}
                        </button>
                    </div>
                </form>

                ${linkedMatriz ? `
                    <div style="border-top: 1px solid var(--border); padding-top: 1.5rem;">
                        <div class="flex-between mb-3">
                            <h4 class="font-bold text-gray-800">Matriz Vinculada</h4>
                            <button type="button" onclick="app.matrizesView.openModal('${linkedMatriz.id}')" class="btn btn-secondary text-xs py-2">
                                <i class="ph ph-pencil-simple"></i> Editar Matriz
                            </button>
                        </div>
                        <div class="card p-4">
                            <div class="flex items-center gap-3 mb-3">
                                <div class="token-icon yellow" style="width: 48px; height: 48px; font-size: 1.3rem;">
                                    <i class="ph ph-file-text"></i>
                                </div>
                                <div>
                                    <div class="font-bold text-lg">${linkedMatriz.codigo}</div>
                                    <div class="text-sm text-gray-500">Carga Horária: ${linkedMatriz.carga_horaria_total || 0}h</div>
                                </div>
                            </div>
                            <div class="text-xs text-gray-400">
                                Criada em ${window.dayjs(linkedMatriz.created_at).format('DD/MM/YYYY')}
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
        `);
    },

    async submitCurso(e, id) {
        e.preventDefault();
        const data = {
            nome: e.target.nome.value,
            area_tecnologica: e.target.area.value,
            status: e.target.status.value,
            carga_horaria: parseInt(e.target.carga_horaria.value) || 0,
            matriz_id: e.target.matriz_id.value || null
        };

        // Validate: Active course MUST have a matrix
        if (data.status === 'Ativo' && !data.matriz_id) {
            ui.toast('Para ativar o curso, selecione uma Matriz Curricular. Ou salve como "Inativo".', 'error');
            return;
        }

        try {
            const { error } = id
                ? await supabase.from('cursos').update(data).eq('id', id)
                : await supabase.from('cursos').insert(data);

            if (error) throw error;

            ui.toast('Curso salvo!');
            ui.closeModal();
            app.refreshCurrentView();
        } catch (error) {
            ui.toast(error.message, 'error');
        }
    },

    // --- MATRIZ EDITOR (UCS & CATALOG IMPORT) ---
    // --- DELEGATE TO MATRIZES VIEW MODULE ---
    openModalMatriz(id, cursoId) {
        if (app.matrizesView) {
            app.matrizesView.openModal(id, cursoId);
        } else {
            console.error('Módulo matrizesView não carregado');
            ui.toast('Erro interno: Módulo de matrizes não carregado', 'error');
        }
    },

    // --- DOCENTE LISTENER ---
    openModalDocente(id = null) {
        const doc = id ? app.state.teachers.find(d => d.id === id) : null;
        const areas = app.state.areasTecnologicas;

        // Generate Checkbox Tags HTML
        const areasHtml = areas.map(a => `
            <label class="checkbox-tag">
                <input type="checkbox" name="areas_atuacao" value="${a.nome}" ${doc?.areas_atuacao?.includes(a.nome) ? 'checked' : ''}>
                <span>${a.nome}</span>
            </label>
        `).join('');

        ui.openModalWindow(doc ? 'Editar Docente' : 'Novo Docente', `
            <div class="animate-fade-in">
                <form onsubmit="app.planejamento.submitDocente(event, '${id || ''}')">
                    
                    <!-- Perfil Header -->
                    <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 2rem; background: #f8fafc; padding: 1rem; border-radius: 8px; border: 1px solid var(--border);">
                         <div class="token-icon purple" style="width: 56px; height: 56px; font-size: 1.5rem; flex-shrink: 0;">
                            ${doc?.nome ? doc.nome.charAt(0) : '<i class="ph ph-user"></i>'}
                         </div>
                         <div style="flex: 1;">
                            <div class="input-group" style="margin-bottom: 0;">
                                <label class="input-label">Nome Completo</label>
                                <input name="nome" class="input-field" required value="${doc?.nome || ''}" placeholder="Ex: João da Silva" style="background: white;">
                            </div>
                         </div>
                    </div>

                    <div class="grid-2">
                        <div class="input-group">
                            <label class="input-label">E-mail</label>
                            <input name="email" type="email" class="input-field" value="${doc?.email || ''}" placeholder="email@exemplo.com">
                        </div>
                        <div class="input-group">
                            <label class="input-label">Status</label>
                            <select name="status" class="input-field">
                                <option value="Ativo" ${doc?.status !== 'Inativo' ? 'selected' : ''}>Ativo</option>
                                <option value="Inativo" ${doc?.status === 'Inativo' ? 'selected' : ''}>Inativo</option>
                            </select>
                        </div>
                    </div>

                    <div class="grid-2">
                        <div class="input-group">
                            <label class="input-label">Formação Acadêmica</label>
                            <input name="formacao" class="input-field" value="${doc?.formacao || ''}" placeholder="Ex: Engenharia de Software">
                        </div>
                        <div class="input-group">
                            <label class="input-label">Área de Formação</label>
                            <input name="area_formacao" class="input-field" value="${doc?.area_formacao || ''}" placeholder="Ex: Exatas / Tecnologia">
                        </div>
                    </div>

                    <div class="input-group mt-4">
                        <label class="input-label">Áreas de Atuação (Habilidades)</label>
                        <div class="flex flex-wrap gap-2" style="padding: 0.5rem; border: 1px solid var(--border); border-radius: 8px; background: #fff;">
                            ${areasHtml}
                        </div>
                        <div class="input-hint"><i class="ph ph-info"></i> Selecione as áreas em que este docente pode lecionar.</div>
                    </div>

                    <div class="flex-between" style="border-top: 1px solid var(--border); padding-top: 1.5rem; margin-top: 1rem;">
                        <button type="button" onclick="ui.closeModal()" class="btn btn-secondary">Cancelar</button>
                        <button type="submit" class="btn btn-primary">
                            <i class="ph ph-check"></i> Salvar Docente
                        </button>
                    </div>
                </form>
            </div>
        `);
    },

    async submitDocente(e, id) {
        e.preventDefault();
        const f = e.target;
        const areas = Array.from(f.querySelectorAll('input[name="areas_atuacao"]:checked')).map(cb => cb.value);

        const data = {
            nome: f.nome.value,
            email: f.email.value,
            formacao: f.formacao.value,
            area_formacao: f.area_formacao.value,
            areas_atuacao: areas,
            status: f.status.value
        };

        const { error } = id
            ? await supabase.from('docentes').update(data).eq('id', id)
            : await supabase.from('docentes').insert(data);

        if (error) ui.toast(error.message, 'error');
        else {
            ui.toast('Docente salvo!');
            ui.closeModal();
            // Refresh list dynamically
            const { data: teachers } = await supabase.from('docentes').select('*').order('nome');
            app.state.teachers = teachers || [];
            app.planejamento.filterDocentes();
        }
    },

    // --- TURMA & LOTACAO ---
    openModalTurma() { ui.toast('Em desenvolvimento', 'info'); },
    openLotacao(turmaId) { ui.toast('Em desenvolvimento', 'info'); },

    // --- UTILS ---
    getAreaColor(area) {
        if (!area) return 'blue';
        if (area.includes('TI') || area.includes('Info')) return 'purple';
        if (area.includes('Gestão')) return 'green';
        if (area.includes('Indústria')) return 'yellow';
        return 'blue';
    }
};
