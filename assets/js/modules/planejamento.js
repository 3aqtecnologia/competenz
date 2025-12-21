
import { supabase } from '../services/supabase.js';
import { ui } from '../utils/ui.js';
import { ux } from '../utils/ux.js';

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
                        <i class="ph ph-books"></i> Cursos & Matrizes
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
            case 'cursos': return this.renderCursosMatrizes(state);
            case 'docentes': return this.renderDocentes(state);
            case 'turmas': return this.renderTurmas(state);
            case 'ucs': return this.renderUCs(state);
            default: return this.renderCursosMatrizes(state);
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
            content.innerHTML = '<div class="loading-spinner"></div>';
            setTimeout(() => {
                content.innerHTML = this.renderTabContent(app.state);
            }, 200);
        }
    },

    /* ==========================================================================================
       TAB 1: GESTÃO DE CURSOS E MATRIZES (COMPLETO)
       ========================================================================================== */
    renderCursosMatrizes(state) {
        return `
            <div class="animate-fade-in">
                <!-- Header & Actions -->
                <div class="flex-between" style="margin-bottom: 2rem;">
                    <div>
                         <h3 class="input-label" style="font-size: 1.25rem; margin-bottom: 0.25rem;">Portfólio de Cursos</h3>
                         <p class="token-meta">Gerencie os cursos ofertados e suas estruturas curriculares</p>
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

    renderCursosListItems(courses) {
        if (!courses || courses.length === 0) return ux.renderEmptyState('Nenhum curso encontrado.');

        return courses.map(c => {
            const matricesCount = app.state.matrices.filter(m => m.curso_id === c.id).length;
            const activeMatrix = app.state.matrices.find(m => m.curso_id === c.id && m.status === 'Ativa');

            // Calculate Active Matrix Workload
            let chMatriz = 0;
            if (activeMatrix && app.state.allUCs) {
                chMatriz = app.state.allUCs
                    .filter(u => u.matriz_id === activeMatrix.id)
                    .reduce((acc, curr) => acc + (curr.carga_horaria || 0), 0);
            }

            const chCurso = c.carga_horaria || 0;

            // Determine Relation & Styling
            let relationHtml = '';
            if (activeMatrix) {
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
                relationHtml = `<span class="${colorClass} ml-1" title="Carga Horária da Matriz: ${chMatriz}h">${icon} ${chMatriz}h / ${chCurso}h</span>`;
            } else {
                relationHtml = `<span class="text-gray-400">Sem matriz ativa</span>`;
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
                        <span style="margin: 0 6px;">•</span>
                        ${matricesCount} Versões
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
    renderDocentes(state) {
        // Trigger initial render shortly
        setTimeout(() => this.filterDocentes(), 50);

        return `
            <div class="animate-fade-in">
                <div class="flex-between" style="margin-bottom: 2rem;">
                    <div>
                         <h3 class="input-label" style="font-size: 1.25rem;">Corpo Docente</h3>
                         <p class="token-meta">Gestão de professores e instrutores</p>
                    </div>
                    <button onclick="app.planejamento.openModalDocente()" class="btn btn-primary">
                        <i class="ph ph-user-plus"></i> Novo Docente
                    </button>
                </div>

                <!-- Filters -->
                <div class="card" style="padding: 1rem; margin-bottom: 1.5rem; display: flex; gap: 1rem;">
                    <div style="flex: 1; position: relative;">
                        <i class="ph ph-magnifying-glass" style="position: absolute; left: 1rem; top: 1rem; color: #94a3b8;"></i>
                        <input id="docente-search" onkeyup="app.planejamento.filterDocentes()" class="input-field" style="padding-left: 2.5rem;" placeholder="Buscar por nome ou formação...">
                    </div>
                    <div style="width: 220px;">
                        <select id="docente-filter-area" onchange="app.planejamento.filterDocentes()" class="input-field">
                            <option value="">Todas as Áreas</option>
                            ${state.areasTecnologicas.map(a => `<option value="${a.nome}">${a.nome}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <div id="docentes-list-container" class="token-list">
                    <div class="loading-spinner"></div>
                </div>
            </div>
        `;
    },

    filterDocentes() {
        const term = document.getElementById('docente-search')?.value.toLowerCase() || '';
        const areaFilter = document.getElementById('docente-filter-area')?.value || '';

        const all = app.state.teachers || [];

        const filtered = all.filter(d => {
            const matchText = d.nome.toLowerCase().includes(term) ||
                (d.formacao || '').toLowerCase().includes(term);

            const matchArea = areaFilter
                ? (d.areas_atuacao && d.areas_atuacao.includes(areaFilter))
                : true;

            return matchText && matchArea;
        });

        this.renderDocentesList(filtered);
    },

    renderDocentesList(list) {
        const container = document.getElementById('docentes-list-container');
        if (!container) return;

        if (!list.length) {
            container.innerHTML = ux.renderEmptyState('Nenhum docente encontrado.');
            return;
        }

        container.innerHTML = list.map(d => `
            <div class="token-item" onclick="app.planejamento.openModalDocente('${d.id}')">
                <div class="token-icon purple" style="font-size: 1.1rem; font-weight: 600;">
                    ${d.nome.charAt(0)}
                </div>
                <div class="token-info">
                    <div class="token-name">${d.nome}</div>
                    <div class="token-meta">${d.formacao || 'Formação n/i'} • ${d.email || 'Sem e-mail'}</div>
                </div>
                
                <!-- Tags Area -->
                <div class="flex gap-1 flex-wrap mr-4 items-center" style="max-width: 35%;">
                    ${(d.areas_atuacao || []).slice(0, 3).map(a =>
            `<span style="background:#f3f4f6; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; color: #4b5563; border: 1px solid #e5e7eb;">${a}</span>`
        ).join('')}
                    ${(d.areas_atuacao?.length > 3) ? `<span style="font-size: 0.7rem; color: #9ca3af;">+${d.areas_atuacao.length - 3}</span>` : ''}
                </div>

                <div class="badge ${d.status === 'Ativo' ? 'badge-success' : 'badge-neutral'}">
                    ${d.status || 'Ativo'}
                </div>
            </div>
        `).join('');
    },

    /* ==========================================================================================
       TAB 3: TURMAS
       ========================================================================================== */
    renderTurmas(state) {
        return `
             <div>
                <div class="flex-between" style="margin-bottom: 1.5rem;">
                    <div>
                         <h3 class="input-label" style="font-size: 1.1rem;">Turmas em Andamento</h3>
                    </div>
                    <button onclick="app.planejamento.openModalTurma()" class="btn btn-primary">
                        <i class="ph ph-plus"></i> Nova Turma
                    </button>
                </div>

                <div class="grid-3">
                    ${state.classes.map(t => `
                        <div class="card" style="border-left: 4px solid ${t.turno === 'Noite' ? '#6366f1' : '#eab308'}; display: flex; flex-direction: column; gap: 1rem;">
                            <div class="flex-between">
                                <h4 style="margin:0; font-size: 1.25rem; font-weight: 700;">${t.codigo_sge}</h4>
                                <span class="badge badge-neutral">${t.turno}</span>
                            </div>
                            <p style="margin:0; font-size: 0.9rem; color: var(--text-secondary); line-height: 1.4;">${t.cursos?.nome}</p>
                            
                            <div style="margin-top: auto; padding-top: 1rem; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-size: 0.75rem; color: var(--text-secondary);">
                                    Início: ${window.dayjs(t.data_inicio).format('DD/MM/YYYY')}
                                </span>
                                <button onclick="app.planejamento.openLotacao('${t.id}')" class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.75rem;">
                                    <i class="ph ph-users-three"></i> Lotação
                                </button>
                            </div>
                        </div>
                    `).join('') || '<div class="card" style="grid-column: 1/-1; text-align: center;">Nenhuma turma.</div>'}
                </div>
            </div>
        `;
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
                <div class="card" style="padding: 1rem; margin-bottom: 1.5rem; display: flex; gap: 1rem;">
                    <div style="flex: 1; position: relative;">
                        <i class="ph ph-magnifying-glass" style="position: absolute; left: 1rem; top: 1rem; color: #94a3b8;"></i>
                        <input id="uc-search" onkeyup="app.planejamento.filterUCs()" class="input-field" style="padding-left: 2.5rem;" placeholder="Buscar por nome da UC...">
                    </div>
                    <div style="width: 200px;">
                        <select id="uc-filter-area" onchange="app.planejamento.filterUCs()" class="input-field">
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
        const { data: ucs, error } = await supabase.from('catalogo_ucs').select('*').order('nome');

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
            <div class="token-item group" onclick="app.planejamento.openModalCatalogoUC('${uc.id}')">
                <div class="token-icon ${this.getAreaColor(uc.area_tecnologica)}">
                    <i class="ph ph-book-open"></i>
                </div>
                <div class="token-info">
                    <div class="token-name">${uc.nome}</div>
                    <div class="token-meta">
                        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${uc.ativo ? 'var(--success)' : '#cbd5e1'}; margin-right: 4px;"></span>
                        ${uc.area_tecnologica} • ${uc.carga_horaria} horas
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <div class="badge badge-neutral">${uc.tipo || 'Padrão'}</div>
                    <button onclick="event.stopPropagation(); app.planejamento.deleteCatalogoUC('${uc.id}')" class="btn btn-secondary text-red-500 hover:bg-red-50 px-2 opacity-0 group-hover:opacity-100 transition-opacity" title="Excluir do Catálogo">
                        <i class="ph ph-trash"></i>
                    </button>
                    <i class="ph ph-caret-right text-gray-300"></i>
                </div>
            </div>
        `).join('');
    },

    filterUCs() {
        const term = document.getElementById('uc-search').value.toLowerCase();
        const area = document.getElementById('uc-filter-area').value;

        const filtered = app.state.catalogoUcs.filter(uc => {
            const matchName = uc.nome.toLowerCase().includes(term);
            const matchArea = area ? uc.area_tecnologica === area : true;
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

                        <div class="input-group" style="max-width: 200px;">
                             <label class="input-label">Status</label>
                             <select name="ativo" class="input-field">
                                <option value="true" ${uc?.ativo !== false ? 'selected' : ''}>Ativa</option>
                                <option value="false" ${uc?.ativo === false ? 'selected' : ''}>Inativa</option>
                            </select>
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
                        <div class="grid-2">
                            <div class="input-group">
                                <label class="input-label">Conhecimentos (Saber)</label>
                                <textarea name="conhecimentos" class="input-field" rows="5" placeholder="Um item por linha...">${toText(uc?.conhecimentos)}</textarea>
                            </div>
                            <div class="input-group">
                                <label class="input-label">Capacidades Técnicas (Saber Fazer)</label>
                                <textarea name="cap_tecnicas" class="input-field" rows="5" placeholder="Um item por linha...">${toText(uc?.capacidades_tecnicas)}</textarea>
                            </div>
                        </div>
                        <div class="grid-2">
                             <div class="input-group">
                                <label class="input-label">Capacidades Sociais</label>
                                <textarea name="cap_sociais" class="input-field" rows="4" placeholder="Um item por linha...">${toText(uc?.capacidades_sociais)}</textarea>
                            </div>
                            <div class="input-group">
                                <label class="input-label">Capacidades Socioemocionais</label>
                                <textarea name="cap_socio" class="input-field" rows="4" placeholder="Um item por linha...">${toText(uc?.capacidades_socioemocionais)}</textarea>
                            </div>
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
            ativo: f.ativo.value === 'true',
            // Pedagogical Data
            objetivo: f.objetivo.value,
            bibliografia_basica: f.bibliografia.value,
            conhecimentos: toArray(f.conhecimentos.value),
            capacidades_tecnicas: toArray(f.cap_tecnicas.value),
            capacidades_sociais: toArray(f.cap_sociais.value),
            capacidades_socioemocionais: toArray(f.cap_socio.value)
        };

        const { error } = id
            ? await supabase.from('catalogo_ucs').update(data).eq('id', id)
            : await supabase.from('catalogo_ucs').insert(data);

        if (error) {
            ui.toast('Erro ao salvar: ' + error.message, 'error');
        } else {
            ui.toast('UC salva no catálogo com sucesso!', 'success');
            ui.closeModal();
            this.loadUCsAsync(); // Reload list
        }
    },

    async deleteCatalogoUC(id) {
        if (!confirm('Tem certeza? Isso pode afetar matrizes que usam esta UC (se não houver FK restritiva).')) return;

        const { error } = await supabase.from('catalogo_ucs').delete().eq('id', id);
        if (error) ui.toast('Erro ao excluir: ' + error.message, 'error');
        else {
            ui.toast('UC removida do catálogo.');
            this.loadUCsAsync();
        }
    },


    /* ==========================================================================================
       MODALS ACTIONS (CRUD & HIERARCHY MANAGER)
       ========================================================================================== */

    // --- CURSO MANAGER (DETAILS & MATRICES) ---
    async openModalCurso(id = null) {
        const curso = id ? app.state.courses.find(c => c.id === id) : null;
        let cursoMatrices = [];

        if (id) {
            cursoMatrices = app.state.matrices.filter(m => m.curso_id === id).sort((a, b) => b.created_at.localeCompare(a.created_at));
        }

        const areas = app.state.areasTecnologicas;

        const matricesListHtml = cursoMatrices.length ? cursoMatrices.map(m => `
            <div class="token-item p-3 mb-2" onclick="app.planejamento.openModalMatriz('${m.id}')">
                <div class="token-icon yellow" style="width: 36px; height: 36px; font-size: 1.1rem;"><i class="ph ph-file-text"></i></div>
                <div class="token-info">
                    <div class="token-name text-sm">${m.codigo}</div>
                    <div class="token-meta text-xs">${window.dayjs(m.created_at).format('DD/MM/YYYY')} • ${m.status}</div>
                </div>
                <i class="ph ph-pencil-simple text-gray-400"></i>
            </div>
        `).join('') : '<div class="text-center text-sm text-gray-400 py-4">Nenhuma matriz curricular cadastrada para este curso.</div>';

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
                    <div class="mt-4">
                        <button type="submit" class="btn btn-primary w-full">
                            <i class="ph ph-check"></i> ${curso ? 'Atualizar Dados do Curso' : 'Criar Curso'}
                        </button>
                    </div>
                </form>

                ${id ? `
                    <div style="border-top: 1px solid var(--border); padding-top: 1.5rem;">
                        <div class="flex-between mb-4">
                            <h4 class="font-bold text-gray-800">Matrizes Curriculares</h4>
                            <button type="button" onclick="app.planejamento.openModalMatriz(null, '${id}')" class="btn btn-secondary text-xs py-2">
                                <i class="ph ph-plus"></i> Nova Matriz/Versão
                            </button>
                        </div>
                        <div style="max-height: 200px; overflow-y: auto;">
                            ${matricesListHtml}
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
            carga_horaria: parseInt(e.target.carga_horaria.value) || 0
        };

        const { error } = id
            ? await supabase.from('cursos').update(data).eq('id', id)
            : await supabase.from('cursos').insert({ ...data, status: 'Ativo' });

        if (error) ui.toast(error.message, 'error');
        else { ui.toast('Curso salvo!'); ui.closeModal(); app.refreshCurrentView(); }
    },

    // --- MATRIZ EDITOR (UCS & CATALOG IMPORT) ---
    async openModalMatriz(id = null, parentCursoId = null) {
        let m = null, ucs = [];
        let cursoId = parentCursoId;
        let totalPrevisto = 0;

        // Load Matrix & Grade
        if (id) {
            const { data } = await supabase.from('matrizes').select('*').eq('id', id).single();
            m = data;
            cursoId = m.curso_id;
            const resUCs = await supabase.from('unidades_curriculares').select('*').eq('matriz_id', id).order('created_at');
            ucs = resUCs.data || [];
        }

        // Load Course Info (Target Hours)
        if (cursoId) {
            const { data: c } = await supabase.from('cursos').select('carga_horaria').eq('id', cursoId).single();
            if (c) totalPrevisto = c.carga_horaria || 0;
        }

        const totalAtual = ucs.reduce((acc, u) => acc + u.carga_horaria, 0);
        const progressPercent = totalPrevisto > 0 ? Math.min((totalAtual / totalPrevisto) * 100, 100) : 0;
        const progressColor = totalAtual > totalPrevisto ? 'bg-red-500' : (totalAtual === totalPrevisto ? 'bg-green-500' : 'bg-primary');

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
                <button onclick="app.planejamento.deleteUC('${u.id}', '${id}')" class="text-red-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <i class="ph ph-trash"></i>
                </button>
            </div>
        `).join('') || '<div class="text-xs text-gray-400 text-center py-4">Nenhuma UC na grade.</div>';

        // Picker List (Right)
        const pickerHtml = (id && catalog) ? catalog.map(c => {
            const added = isAdded(c);
            return `
                <div class="uc-picker-item ${added ? 'added' : ''}" onclick="${added ? '' : `app.planejamento.importUCFromCatalog('${c.id}', '${id}')`}">
                    <div style="flex:1;">
                        <div class="text-sm font-semibold" style="color: ${added ? '#15803d' : '#334155'}">${c.nome}</div>
                        <div class="text-xs text-gray-500">${c.carga_horaria}h • ${c.tipo || '-'}</div>
                    </div>
                    ${added
                    ? '<i class="ph ph-check-circle text-green-500"></i>'
                    : '<i class="ph ph-plus-circle text-primary hover:scale-110 transition-transform text-lg"></i>'
                }
                </div>
             `;
        }).join('') : '<div class="p-4 text-center text-gray-400 text-sm">Salve a matriz para buscar UCs.</div>';

        ui.openModalWindow(id ? `Editor de Matriz: ${m.codigo}` : 'Nova Matriz Curricular', `
             <div class="animate-fade-in" style="height: 100%; display: flex; flex-direction: column;">
                
                <!-- Matrix Meta Form (Top) -->
                <form onsubmit="app.planejamento.saveMatriz(event, '${id || ''}', '${cursoId}')" class="mb-4 bg-gray-50 p-4 rounded-xl border border-gray-100 shrink-0">
                    <div class="grid-2">
                        <div class="input-group mb-0">
                            <label class="input-label">Código da Versão</label>
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
                            <!-- Progress Bar -->
                            ${totalPrevisto > 0 ? `
                                <div class="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                                    <div class="${progressColor} h-1.5 rounded-full" style="width: ${progressPercent}%"></div>
                                </div>
                                <div class="flex-between text-[10px] font-medium uppercase tracking-wider">
                                    <span class="${totalAtual > totalPrevisto ? 'text-red-500' : 'text-gray-600'}">Atual: ${totalAtual}h</span>
                                    <span class="text-gray-400">Meta: ${totalPrevisto}h</span>
                                </div>
                            ` : `<div class="text-[10px] text-gray-400 text-center">Defina a carga horária do curso para ver o progresso.</div>`}
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
                        <div class="p-2 border-b border-gray-100">
                             <input id="picker-search" class="input-field text-sm py-1" placeholder="Filtrar catálogo..." 
                                onkeyup="const t=this.value.toLowerCase(); document.querySelectorAll('.uc-picker-item').forEach(el => el.style.display = el.textContent.toLowerCase().includes(t) ? 'flex' : 'none')">
                        </div>
                        <div class="flex-1 overflow-y-auto p-0">
                            ${pickerHtml}
                        </div>
                    </div>

                </div>
            </div>
        `, 'modal-lg');
    },

    // --- CATALOG SEARCH & ADD HELPER ---
    async searchCatalogForMatrix(query, matrizId) {
        const resultsContainer = document.getElementById(`catalog-results-${matrizId}`);
        if (query.length < 2) {
            resultsContainer.classList.add('hidden');
            return;
        }

        const { data: results } = await supabase.from('catalogo_ucs').select('*').ilike('nome', `%${query}%`).limit(5);

        if (!results || results.length === 0) {
            resultsContainer.innerHTML = '<div class="p-3 text-xs text-gray-500">Nenhuma UC encontrada no catálogo.</div>';
        } else {
            resultsContainer.innerHTML = results.map(r => `
                <div class="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 flex justify-between items-center" 
                     onclick="app.planejamento.importUCFromCatalog('${r.id}', '${matrizId}')">
                    <div>
                        <div class="font-bold text-sm text-gray-800">${r.nome}</div>
                        <div class="text-xs text-gray-500">${r.area_tecnologica} • ${r.carga_horaria}h</div>
                    </div>
                    <i class="ph ph-plus-circle text-primary"></i>
                </div>
            `).join('');
        }
        resultsContainer.classList.remove('hidden');
    },

    async importUCFromCatalog(catalogId, matrizId) {
        // Fetch raw catalog entry
        const { data: source } = await supabase.from('catalogo_ucs').select('*').eq('id', catalogId).single();
        if (!source) return;

        // Clone FULL data to local matrix UC table
        const { error } = await supabase.from('unidades_curriculares').insert({
            matriz_id: matrizId,
            nome: source.nome,
            area_tecnologica: source.area_tecnologica, // Keeps Array format
            carga_horaria: source.carga_horaria,
            objetivo: source.objetivo,
            bibliografia_basica: source.bibliografia_basica,
            conhecimentos: source.conhecimentos,
            capacidades_tecnicas: source.capacidades_tecnicas,
            capacidades_sociais: source.capacidades_sociais,
            capacidades_socioemocionais: source.capacidades_socioemocionais
        });

        if (error) ui.toast('Erro ao importar UC: ' + error.message, 'error');
        else {
            ui.toast('UC adicionada à grade com sucesso.');
            this.openModalMatriz(matrizId); // Refresh modal content
        }
    },

    async saveMatriz(e, id, cursoId) {
        e.preventDefault();
        const data = { curso_id: cursoId, codigo: e.target.codigo.value, status: e.target.status.value };

        const { data: res, error } = id
            ? await supabase.from('matrizes').update(data).eq('id', id).select().single()
            : await supabase.from('matrizes').insert(data).select().single();

        if (error) ui.toast(error.message, 'error');
        else {
            ui.toast('Matriz salva!');
            if (!id) { ui.closeModal(); setTimeout(() => this.openModalMatriz(res.id), 300); }
            else { app.refreshCurrentView(); this.openModalMatriz(res.id); }
        }
    },

    async deleteUC(ucId, matrizId) {
        if (!confirm('Excluir UC da grade?')) return;
        await supabase.from('unidades_curriculares').delete().eq('id', ucId);
        this.openModalMatriz(matrizId);
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
