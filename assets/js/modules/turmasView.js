import { turmas } from './turmas.js';
import { ui } from '../utils/ui.js';
import { supabase } from '../services/supabase.js';

export const turmasView = {
    render() {
        // Return HTML string for the module container
        return `
            <div id="turmas-view-container" class="animate-fade-in">
                <div class="flex-between mb-8">
                    <div>
                        <h3 class="input-label text-xl mb-1">Turmas</h3>
                        <p class="token-meta">Gerencie o calendário e alocação de turmas</p>
                    </div>
                    <button class="btn btn-primary" onclick="app.turmasView.openModal()">
                        <i class="ph ph-plus"></i> Nova Turma
                    </button>
                </div>

                <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <!-- Filters -->
                    <div class="p-4 border-b border-slate-100 bg-slate-50 flex gap-4">
                         <div class="relative w-[70%]">
                            <i class="ph ph-magnifying-glass absolute left-3 top-3 text-slate-400"></i>
                            <input type="text" placeholder="Buscar turma..." class="input-field pl-10" id="filter-search" oninput="app.turmasView.filterList()">
                         </div>
                         <select class="input-field flex-1" id="filter-status" onchange="app.turmasView.filterList()">
                            <option value="">Todas as Situações</option>
                            <option value="Em Andamento">Em Andamento</option>
                            <option value="Planejamento">Planejamento</option>
                         </select>
                    </div>

                    <div id="turmas-list" class="divide-y divide-slate-100">
                        <div class="p-8 text-center text-slate-400">
                            <i class="ph ph-spinner animate-spin text-2xl mb-2"></i>
                            <p>Carregando turmas...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    _initialized: false,
    _initRetries: 0,

    init() {
        // Prevent multiple initializations
        if (this._initialized) {
            console.log('[TurmasView] Already initialized, skipping');
            return;
        }

        // Verify DOM is ready
        const target = document.getElementById('turmas-list');
        if (!target) {
            this._initRetries++;
            if (this._initRetries > 10) {
                console.error('[TurmasView] Failed to initialize after 10 retries - DOM element not found');
                this._initRetries = 0;
                return;
            }
            console.warn(`[TurmasView] DOM not ready yet, retry ${this._initRetries}/10...`);
            setTimeout(() => this.init(), 50);
            return;
        }

        this._initialized = true;
        this._initRetries = 0;
        console.log('[TurmasView] Initializing...');
        this.loadList();
    },

    async loadList() {
        const target = document.getElementById('turmas-list');
        if (!target) {
            console.error('[TurmasView] Element #turmas-list not found in DOM');
            return;
        }

        try {
            const list = await turmas.list() || [];

            // Auto-update status based on date (Visual only)
            if (window.dayjs) {
                const today = window.dayjs().startOf('day');
                list.forEach(t => {
                    if (t.data_fim_previsto && t.status !== 'Concluída') {
                        const end = window.dayjs(t.data_fim_previsto);
                        if (today.isAfter(end)) {
                            t.status = 'Concluída';
                        }
                    }
                });
            }

            this.cachedList = list;
            this.renderListItems(list);
        } catch (err) {
            console.error(err);
            if (err.message && err.message.includes('relation')) {
                target.innerHTML = `
                    <div class="p-6 text-red-500 bg-red-50 rounded-lg text-center">
                        <i class="ph ph-warning text-2xl mb-2"></i><br>
                        <strong>Tabelas não encontradas!</strong><br>
                        Execute o script <code>assets/sql/20251226_turmas_module.sql</code> no Supabase.
                    </div>`;
            } else {
                target.innerHTML = `<div class="p-6 text-red-500">Erro ao carregar turmas: ${err.message}</div>`;
            }
        }
    },

    filterList() {
        const search = document.getElementById('filter-search')?.value.toLowerCase() || '';
        const status = document.getElementById('filter-status')?.value || '';

        if (!this.cachedList) return;

        const filtered = this.cachedList.filter(t => {
            const matchSearch = t.nome.toLowerCase().includes(search) ||
                (t.codigo_sge && t.codigo_sge.toLowerCase().includes(search));
            const matchStatus = status ? t.status === status : true;
            return matchSearch && matchStatus;
        });

        this.renderListItems(filtered);
    },

    renderListItems(list) {
        const target = document.getElementById('turmas-list');
        if (!list.length) {
            target.innerHTML = `<div class="p-10 text-center text-slate-400">Nenhuma turma cadastrada.</div>`;
            return;
        }

        const formatDate = (date) => {
            if (!date) return 'N/I';
            if (window.dayjs) return window.dayjs(date).format('DD/MM/YYYY');
            try {
                const [y, m, d] = date.split('-');
                return `${d}/${m}/${y}`;
            } catch (e) { return date; }
        };

        target.innerHTML = list.map(t => {
            const matrixCode = t.matrizes?.codigo || (Array.isArray(t.matrizes) && t.matrizes[0]?.codigo) || 'Sem Matriz';

            return `
            <div class="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer" onclick="app.turmasView.openModal('${t.id}')">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold">
                        ${(t.nome || '?').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <div class="text-[10px] font-mono font-bold text-slate-400 tracking-wider mb-0.5">${t.codigo_sge || 'S/ CÓDIGO'}</div>
                        <h4 class="font-bold text-slate-800">${t.nome}</h4>
                        <div class="text-xs text-slate-500 flex gap-3 mt-1">
                            <span><i class="ph ph-calendar"></i> ${formatDate(t.data_inicio)}</span>
                            <span>•</span>
                            <span>${matrixCode}</span>
                            <span>•</span>
                            <span>${t.turno || 'Turno n/i'}</span>
                        </div>
                        <div class="text-[11px] text-slate-400 mt-2 flex gap-2 items-center">
                             ${t.coordenador ? `<span class="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded border border-slate-100" title="Coord. Pedagógico: ${t.coordenador.nome_completo}"><i class="ph-fill ph-crown text-indigo-400"></i> ${t.coordenador.nome_completo.split(' ')[0]}</span>` : ''}
                             ${t.analista ? `<span class="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded border border-slate-100" title="Analista Educação: ${t.analista.nome_completo}"><i class="ph-fill ph-student text-emerald-400"></i> ${t.analista.nome_completo.split(' ')[0]}</span>` : ''}
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <span class="badge ${this.getStatusBadge(t.status)}">${t.status}</span>
                    <i class="ph ph-caret-right text-gray-300"></i>
                </div>
            </div>
        `}).join('');
    },

    getStatusBadge(status) {
        switch (status) {
            case 'Em Andamento': return 'badge-success';
            case 'Planejamento': return 'badge-neutral';
            case 'Concluída': return 'bg-blue-100 text-blue-700';
            case 'Bloqueada': return 'bg-red-100 text-red-700';
            default: return 'badge-neutral';
        }
    },

    async openModal(id = null) {
        let t = {};
        let lotacoes = [];
        let matrizUCs = [];

        if (id) {
            try {
                const data = await turmas.getById(id);
                t = data;
                lotacoes = data.lotacoes || [];
                this.currentPauses = data.turma_pausas || [];

                // Fetch UCs of the linked matrix for context
                if (t.matriz_id) {
                    // We need to implement a way to get UCs from Matriz Service or direct query
                    // Assuming we can fetch them:
                    const { data: ucs } = await supabase.from('matriz_ucs')
                        .select('*, unidades_curriculares(*)')
                        .eq('matriz_id', t.matriz_id)
                        .order('ordem');
                    matrizUCs = ucs.map(item => ({ ...item.unidades_curriculares, ordem: item.ordem }));
                }

            } catch (err) {
                console.error(err);
                ui.toast('Erro ao carregar turma', 'error');
                return;
            }
        }

        let matrices = app.state.matrices || [];
        let courses = app.state.courses || [];

        if (!matrices.length || !courses.length) {
            try {
                const [resM, resC] = await Promise.all([
                    !matrices.length ? supabase.from('matrizes').select('*') : { data: matrices },
                    !courses.length ? supabase.from('cursos').select('*') : { data: courses }
                ]);
                matrices = resM.data || [];
                courses = resC.data || [];

                // Cache updates
                if (app.state) {
                    if (!app.state.matrices || !app.state.matrices.length) app.state.matrices = matrices;
                    if (!app.state.courses || !app.state.courses.length) app.state.courses = courses;
                }
            } catch (e) {
                console.error('Error fetching defaults', e);
            }
        }
        this.cachedCourses = courses;

        // Fetch Users for Coordinator/Analyst selection
        let users = [];
        try {
            const { data } = await supabase.from('usuarios').select('id, nome_completo');
            users = data || [];
            // Sort alphabetically
            users.sort((a, b) => a.nome_completo.localeCompare(b.nome_completo));
        } catch (e) {
            console.error('Error fetching users:', e);
        }

        ui.openModalWindow(id ? 'Editar Turma' : 'Nova Turma', `
            <form id="form-turma" onsubmit="app.turmasView.save(event, '${id || ''}')" class="flex flex-col h-full">
                
                <div class="bg-white border-b border-slate-200 px-6 py-4 flex items-start gap-4 shrink-0">
                    <div class="w-1/4 max-w-[160px]">
                        <label class="block text-xs font-bold text-slate-400 uppercase mb-1">Cód. SGE *</label>
                        <input name="codigo_sge" value="${t.codigo_sge || ''}" class="input-field text-sm font-mono font-bold py-1 px-2" placeholder="00000.0000.0000" maxlength="15" required>
                    </div>
                    <div class="flex-1">
                        <label class="block text-xs font-bold text-slate-400 uppercase mb-1">Nome da Turma *</label>
                        <input name="nome" value="${t.nome || ''}" class="text-lg font-bold text-slate-800 bg-transparent border-none p-0 focus:ring-0 w-full placeholder-slate-300" placeholder="Ex: Téc. Enfermagem 2025.1" required>
                    </div>
                    </div>

                <!-- Tabs -->
                <div class="px-6 pt-4 bg-slate-50 border-b border-slate-200 flex gap-4 shrink-0">
                    <button type="button" class="tab-pill active" onclick="ui.switchModalTab('tab-dados')">Dados Gerais</button>
                    <button type="button" class="tab-pill" onclick="ui.switchModalTab('tab-cronograma')">Cronograma & Lotação</button>
                </div>

                <!-- Content Scrollable -->
                <div class="flex-1 overflow-y-auto p-6 bg-slate-50">
                    
                    <!-- TAB 1: DADOS GERAIS -->
                    <div id="tab-dados" class="modal-tab-content block space-y-6">
                        <div class="card bg-white p-6">
                            <h4 class="text-sm font-bold text-slate-700 mb-4 border-b pb-2">Configuração do Curso</h4>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="input-group">
                                    <label class="input-label">Curso Vinculado</label>
                                    <select name="curso_id" class="input-field" onchange="app.turmasView.onCursoChange(this)" required>
                                        <option value="">Selecione um Curso...</option>
                                        ${courses.map(c => `<option value="${c.id}" ${t.curso_id === c.id ? 'selected' : ''}>${c.nome}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="input-group">
                                    <label class="input-label">Matriz Curricular</label>
                                    <select name="matriz_id" class="input-field" onchange="app.turmasView.onMatrizChange(this)" required>
                                        <option value="">Selecione uma Matriz...</option>
                                        ${matrices.map(m => `<option value="${m.id}" ${t.matriz_id === m.id ? 'selected' : ''}>${m.codigo}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="input-group">
                                    <label class="input-label">Turno</label>
                                    <select name="turno" class="input-field">
                                        <option value="Manhã" ${t.turno === 'Manhã' ? 'selected' : ''}>Manhã</option>
                                        <option value="Tarde" ${t.turno === 'Tarde' ? 'selected' : ''}>Tarde</option>
                                        <option value="Noite" ${t.turno === 'Noite' ? 'selected' : ''}>Noite</option>
                                        <option value="Integral" ${t.turno === 'Integral' ? 'selected' : ''}>Integral</option>
                                    </select>
                                </div>
                                <div class="input-group">
                                    <label class="input-label">Capacidade (Max. Alunos) *</label>
                                    <input type="number" name="capacidade" value="${t.capacidade || ''}" class="input-field" min="1" placeholder="Ex: 40" required>
                                </div>
                                <div class="input-group">
                                    <label class="input-label">Situação</label>
                                    <select name="status" class="input-field">
                                        <option value="Planejamento" ${t.status === 'Planejamento' ? 'selected' : ''}>Planejamento</option>
                                        <option value="Em Andamento" ${t.status === 'Em Andamento' ? 'selected' : ''}>Em Andamento</option>
                                        <option value="Concluída" ${t.status === 'Concluída' ? 'selected' : ''}>Concluída</option>
                                        <option value="Bloqueada" ${t.status === 'Bloqueada' ? 'selected' : ''}>Bloqueada</option>
                                    </select>
                                </div>
                            </div>
                            
                            <h4 class="text-sm font-bold text-slate-700 mb-4 mt-6 border-b pb-2">Responsáveis</h4>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div class="input-group">
                                    <label class="input-label">Coord. Pedagógico</label>
                                    <select name="coordenador_id" class="input-field">
                                        <option value="">Selecione...</option>
                                        ${users.map(u => `<option value="${u.id}" ${t.coordenador_id === u.id ? 'selected' : ''}>${u.nome_completo}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="input-group">
                                    <label class="input-label">Analista de Educação</label>
                                    <select name="analista_id" class="input-field">
                                        <option value="">Selecione...</option>
                                        ${users.map(u => `<option value="${u.id}" ${t.analista_id === u.id ? 'selected' : ''}>${u.nome_completo}</option>`).join('')}
                                    </select>
                                </div>
                            </div>
                            </div>
                        </div>

                        <div class="card bg-slate-50 border border-slate-200 p-5 shadow-none mt-6">
                            <div class="flex items-center gap-3 mb-5 border-b border-slate-200 pb-3">
                                <div class="p-1.5 bg-white border border-slate-200 text-indigo-600 rounded-lg shadow-sm">
                                    <i class="ph-bold ph-calendar-check text-lg"></i>
                                </div>
                                <div>
                                    <h4 class="text-sm font-bold text-slate-800">Regras de Frequência</h4>
                                    <p class="text-[10px] text-slate-500">Defina os dias e horários para gerar o cronograma automático.</p>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                                <div class="input-group mb-0">
                                    <label class="input-label text-slate-500">Início das Aulas</label>
                                    <input type="date" name="data_inicio" value="${t.data_inicio || ''}" class="input-field bg-white shadow-sm" required onchange="app.turmasView.generateSchedule()">
                                </div>
                                 <div class="input-group mb-0">
                                    <label class="input-label text-slate-500">Carga Horária / Dia</label>
                                     <div class="relative">
                                        <input type="number" name="horas_diarias" value="${t.horas_diarias || 4}" class="input-field bg-white shadow-sm pl-4 pr-10" min="1" max="10" onchange="app.turmasView.generateSchedule()">
                                        <span class="absolute right-4 top-2.5 text-xs font-bold text-slate-400">Horas</span>
                                     </div>
                                </div>
                                <div class="input-group mb-0">
                                    <label class="input-label text-slate-500">Previsão de Término</label>
                                    <input type="date" name="data_fim_previsto" value="${t.data_fim_previsto || ''}" class="input-field bg-white shadow-sm">
                                </div>
                            </div>

                            <div class="input-group mb-0">
                                <label class="input-label text-slate-500 mb-3 block">Dias Letivos na Semana</label>
                                <div class="flex flex-wrap gap-2">
                                    ${[1, 2, 3, 4, 5, 6].map(d => {
            const shortNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
            const isChecked = t.dias_aula?.includes(d) || (!t.dias_aula && d <= 5);
            return `
                                            <label class="cursor-pointer relative group">
                                                <input type="checkbox" name="dias_aula" value="${d}" ${isChecked ? 'checked' : ''} onchange="app.turmasView.generateSchedule()" class="peer sr-only">
                                                <div class="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-500 text-xs font-bold uppercase transition-all peer-checked:bg-indigo-600 peer-checked:text-white peer-checked:border-indigo-600 peer-checked:shadow-md hover:border-indigo-300 shadow-sm flex items-center gap-2">
                                                    <i class="ph-bold ${isChecked ? 'ph-check-circle' : 'ph-circle'} text-[10px] opacity-50 peer-checked:opacity-100"></i>
                                                    ${shortNames[d]}
                                                </div>
                                            </label>
                                        `;
        }).join('')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- TAB 2: CRONOGRAMA -->
                    <div id="tab-cronograma" class="modal-tab-content hidden space-y-6">
                        
                        <!-- Pauses Section -->
                        <div class="card bg-white p-4 border border-slate-200">
                            <h5 class="font-bold text-slate-700 mb-3 flex items-center gap-2 text-sm">
                                <i class="ph ph-calendar-slash text-orange-500"></i> Pausas & Recessos
                            </h5>
                            
                            <div class="flex gap-2 mb-3 items-end">
                                <div class="flex-1">
                                    <label class="input-label text-[10px]">Descrição</label>
                                    <input type="text" id="pause-desc" class="input-field text-sm py-1" placeholder="Ex: Férias Coletivas">
                                </div>
                                <div class="w-32">
                                    <label class="input-label text-[10px]">Início</label>
                                    <input type="date" id="pause-start" class="input-field text-sm py-1">
                                </div>
                                <div class="w-32">
                                    <label class="input-label text-[10px]">Fim</label>
                                    <input type="date" id="pause-end" class="input-field text-sm py-1">
                                </div>
                                <button type="button" class="btn btn-secondary py-1 px-3" onclick="app.turmasView.addPause()" title="Adicionar Pausa">
                                    <i class="ph ph-plus"></i>
                                </button>
                            </div>

                            <div class="bg-slate-50 rounded border border-slate-200 overflow-hidden">
                                <table class="w-full text-xs">
                                    <thead>
                                        <tr class="bg-slate-100 text-slate-500 text-left">
                                            <th class="p-2 font-semibold">Descrição</th>
                                            <th class="p-2 font-semibold w-24">Início</th>
                                            <th class="p-2 font-semibold w-24">Fim</th>
                                            <th class="p-2 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody id="pauses-list-body" class="divide-y divide-slate-100"></tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Toolbar -->
                        <div class="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-center justify-between">
                            <div>
                                <h4 class="font-bold text-blue-900">Gerador de Cronograma</h4>
                                <p class="text-xs text-blue-700">Gera datas automaticamente baseado nas regras.</p>
                            </div>
                            <button type="button" class="btn btn-primary bg-blue-600 hover:bg-blue-700 py-2 text-sm" onclick="app.turmasView.generateSchedule()">
                                <i class="ph ph-magic-wand"></i> Gerar Datas
                            </button>
                        </div>

                        <!-- Schedule Table -->
                        <div class="bg-white rounded-lg border border-slate-200 overflow-hidden">
                            <table class="w-full text-sm text-left">
                                <thead class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                                    <tr>
                                        <th class="p-3">Ordem</th>
                                        <th class="p-3">Unidade Curricular</th>
                                        <th class="p-3">CH</th>
                                        <th class="p-3">Início</th>
                                        <th class="p-3">Fim</th>
                                        <th class="p-3">Docente</th>
                                    </tr>
                                </thead>
                                <tbody id="schedule-body" class="divide-y divide-slate-100">
                                    <!-- Rendered via JS -->
                                    <tr class="text-slate-400 text-center"><td colspan="6" class="p-6">Clique em "Gerar Datas" ou selecione uma matriz.</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

                <!-- Footer -->
                <div class="bg-white border-t border-gray-200 p-4 flex justify-end gap-3 shrink-0 z-20">
                    <button type="button" class="btn btn-secondary" onclick="ui.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary px-8">Salvar Turma</button>
                </div>
            </form>
        `, 'modal-lg');

        // Initial Render of Pauses
        this.renderPausesList();

        if (id && matrizUCs.length) {
            // Sort matrizUCs based on lotacoes dates to preserve saved order
            if (lotacoes && lotacoes.length > 0) {
                const sortMap = {};
                lotacoes.forEach(l => {
                    if (l.data_inicio) sortMap[l.uc_id] = l.data_inicio;
                });

                // Only sort if we have dates to sort by
                if (Object.keys(sortMap).length > 0) {
                    matrizUCs.sort((a, b) => {
                        const dateA = sortMap[a.id];
                        const dateB = sortMap[b.id];

                        // Sort by start date ASC
                        if (dateA && dateB) {
                            if (dateA < dateB) return -1;
                            if (dateA > dateB) return 1;
                            return 0;
                        }
                        // Items with dates come first (or last? Let's assume defined dates come first as they are scheduled)
                        if (dateA) return -1;
                        if (dateB) return 1;

                        // Fallback to original matrix order
                        return a.ordem - b.ordem;
                    });
                }
            }

            this.currentMatrizUCs = matrizUCs;
            this.renderScheduleTable(lotacoes, matrizUCs);
        } else {
            this.currentMatrizUCs = [];
            this.currentPauses = [];
        }

        // Apply SGE Mask: #####.####.####
        const sgeInput = document.getElementById('form-turma').querySelector('input[name="codigo_sge"]');
        if (sgeInput) {
            sgeInput.addEventListener('input', (e) => {
                let v = e.target.value.replace(/\D/g, '');
                if (v.length > 13) v = v.substring(0, 13);

                if (v.length > 9) {
                    v = v.replace(/^(\d{5})(\d{4})(\d+)/, '$1.$2.$3');
                } else if (v.length > 5) {
                    v = v.replace(/^(\d{5})(\d+)/, '$1.$2');
                }
                e.target.value = v;
            });
        }
    },

    onCursoChange(select) {
        const cursoId = select.value;
        if (!cursoId) return;

        const courses = this.cachedCourses || app.state.courses || [];
        const curso = courses.find(c => c.id === cursoId);

        if (curso && curso.matriz_id) {
            const matrizSelect = document.querySelector('select[name="matriz_id"]');
            if (matrizSelect) {
                matrizSelect.value = curso.matriz_id;
                this.onMatrizChange(matrizSelect);

                // Visual feedback
                ui.toast(`Matriz ${curso.matriz_id} auto-selecionada.`, 'info');
            }
        }
    },

    async onMatrizChange(select) {
        const matrizId = select.value;
        if (!matrizId) return;

        ui.toast('Carregando UCs da matriz...', 'info');
        const { data: ucs } = await supabase.from('matriz_ucs')
            .select('*, unidades_curriculares(*)')
            .eq('matriz_id', matrizId)
            .order('ordem');

        this.currentMatrizUCs = ucs.map(item => ({ ...item.unidades_curriculares, ordem: item.ordem }));

        // Render Empty Schedule Table
        this.renderScheduleTable(this.currentMatrizUCs.map(uc => ({ uc_id: uc.id })), this.currentMatrizUCs);
    },

    renderScheduleTable(lotacoes, ucs) {
        const tbody = document.getElementById('schedule-body');
        if (!ucs.length) return;

        const teachers = app.state.teachers || [];

        // Merge logic: UCs are the master list. Lotacoes fill in the gaps.
        const rows = ucs.map((uc, index) => {
            const lotacao = lotacoes.find(l => l.uc_id === uc.id) || {};

            return `
                <tr class="hover:bg-slate-50 group" data-uc-id="${uc.id}">
                    <td class="p-3 text-slate-500 font-mono text-xs">
                        <div class="flex items-center gap-2">
                            <span class="w-4 text-center">${index + 1}</span>
                            <div class="flex flex-col">
                                <button type="button" onclick="app.turmasView.moveUC(${index}, -1)" class="p-0.5 text-slate-400 hover:text-primary hover:bg-slate-100 rounded leading-none ${index === 0 ? 'invisible' : ''}" title="Mover para cima">
                                    <i class="ph ph-caret-up text-xs"></i>
                                </button>
                                <button type="button" onclick="app.turmasView.moveUC(${index}, 1)" class="p-0.5 text-slate-400 hover:text-primary hover:bg-slate-100 rounded leading-none ${index === ucs.length - 1 ? 'invisible' : ''}" title="Mover para baixo">
                                    <i class="ph ph-caret-down text-xs"></i>
                                </button>
                            </div>
                        </div>
                    </td>
                    <td class="p-3 font-medium text-slate-700">${uc.nome}</td>
                    <td class="p-3 text-slate-500">${uc.carga_horaria || uc.horas || 0}h</td>
                    <td class="p-3">
                        <input type="date" name="start_${uc.id}" value="${lotacao.data_inicio || ''}" class="input-field text-xs py-1 px-2 w-32 border-transparent bg-transparent hover:bg-white hover:border-slate-300 focus:bg-white focus:border-primary transition-all">
                    </td>
                    <td class="p-3">
                        <input type="date" name="end_${uc.id}" value="${lotacao.data_fim || ''}" class="input-field text-xs py-1 px-2 w-32 border-transparent bg-transparent hover:bg-white hover:border-slate-300 focus:bg-white focus:border-primary transition-all">
                    </td>
                    <td class="p-3">
                        <select name="docente_${uc.id}" class="input-field text-xs py-1 px-2 w-full border-transparent bg-transparent hover:bg-white hover:border-slate-300 focus:bg-white focus:border-primary transition-all">
                            <option value="">Selecione...</option>
                            ${teachers.filter(t => {
                // Always show the currently selected teacher
                if (lotacao.docente_id === t.id) return true;

                // Get UC area
                const ucArea = uc.area_tecnologica;

                // Normalize to array and handle empty cases
                let ucAreasList = [];
                if (Array.isArray(ucArea)) {
                    ucAreasList = ucArea;
                } else if (ucArea && ucArea !== 'Geral') {
                    ucAreasList = [ucArea];
                }

                // If list is empty or generic, show all
                if (ucAreasList.length === 0) return true;

                // Check intersection: Teacher has AT LEAST one area required by UC
                return t.docentes_areas?.some(da => {
                    const teacherAreaName = da.areas_tecnologicas?.nome;
                    return ucAreasList.includes(teacherAreaName);
                });
            }).map(d => `<option value="${d.id}" ${lotacao.docente_id === d.id ? 'selected' : ''}>${d.nome}</option>`).join('')}
                        </select>
                    </td>
                </tr>
            `;
        }).join('');

        tbody.innerHTML = rows;
    },

    /**
     * Check if a date is a Brazilian national holiday
     * @param {dayjs.Dayjs} date - Date to check
     * @returns {boolean} - True if it's a holiday
     */
    isBrazilianHoliday(date) {
        const year = date.year();
        // Check fixed holidays (Day/Month)
        const dayMonth = date.format('DD/MM');
        const fixedHolidays = [
            '01/01', // Ano Novo
            '19/03', // São José (Ceará)
            '25/03', // Data Magna (Ceará)
            '21/04', // Tiradentes
            '01/05', // Dia do Trabalho
            '07/09', // Independência
            '12/10', // Padroeira
            '02/11', // Finados
            '15/11', // Proclamação da República
            '25/12'  // Natal
        ];

        if (fixedHolidays.includes(dayMonth)) {
            return true;
        }

        // Mobile holidays (based on Easter - Páscoa)
        const easter = this.calculateEaster(year);
        const easterDate = window.dayjs(`${year}-${easter.month}-${easter.day}`);

        // Carnaval (47 days before Easter)
        const carnaval = easterDate.subtract(47, 'day');
        if (date.isSame(carnaval, 'day') || date.isSame(carnaval.subtract(1, 'day'), 'day')) {
            return true; // Segunda e Terça de Carnaval
        }

        // Sexta-feira Santa (2 days before Easter)
        const sextaFeiraSanta = easterDate.subtract(2, 'day');
        if (date.isSame(sextaFeiraSanta, 'day')) {
            return true;
        }

        // Corpus Christi (60 days after Easter)
        const corpusChristi = easterDate.add(60, 'day');
        if (date.isSame(corpusChristi, 'day')) {
            return true;
        }

        return false;
    },

    /**
     * Calculate Easter date using Meeus/Jones/Butcher algorithm
     * @param {number} year - Year to calculate
     * @returns {object} - {month, day}
     */
    calculateEaster(year) {
        const a = year % 19;
        const b = Math.floor(year / 100);
        const c = year % 100;
        const d = Math.floor(b / 4);
        const e = b % 4;
        const f = Math.floor((b + 8) / 25);
        const g = Math.floor((b - f + 1) / 3);
        const h = (19 * a + b - d - g + 15) % 30;
        const i = Math.floor(c / 4);
        const k = c % 4;
        const l = (32 + 2 * e + 2 * i - h - k) % 7;
        const m = Math.floor((a + 11 * h + 22 * l) / 451);
        const month = Math.floor((h + l - 7 * m + 114) / 31);
        const day = ((h + l - 7 * m + 114) % 31) + 1;

        return { month, day };
    },

    generateSchedule() {
        if (!this.currentMatrizUCs || !this.currentMatrizUCs.length) {
            ui.toast('Selecione uma matriz primeiro.', 'warning');
            return;
        }

        const form = document.getElementById('form-turma');
        const startStr = form.data_inicio.value;
        const hoursPerDay = parseInt(form.horas_diarias.value) || 4;

        if (!startStr) {
            ui.toast('Defina a Data de Início na aba Dados Gerais.', 'warning');
            ui.switchModalTab('tab-dados');
            return;
        }

        // Get selected days
        const daysOfWeek = [];
        form.querySelectorAll('input[name="dias_aula"]:checked').forEach(cb => {
            daysOfWeek.push(parseInt(cb.value));
        });

        if (!daysOfWeek.length) {
            ui.toast('Selecione os Dias de Aula.', 'warning');
            return;
        }

        ui.toast('Calculando cronograma (considerando feriados nacionais)...', 'info');

        // Preserve teachers
        const currentLotacoes = this.captureTableState();
        const teacherMap = {};
        currentLotacoes.forEach(l => { if (l.docente_id) teacherMap[l.uc_id] = l.docente_id; });

        // Algorithm
        let currentDate = window.dayjs(startStr);
        const newSchedule = [];

        this.currentMatrizUCs.forEach(uc => {
            const ch = uc.carga_horaria || uc.horas || 0;
            const daysNeeded = Math.ceil(ch / hoursPerDay);

            // Find valid start date (must be a class day AND not a holiday AND not paused)
            while (!daysOfWeek.includes(currentDate.day()) || this.isBrazilianHoliday(currentDate) || this.isPaused(currentDate)) {
                currentDate = currentDate.add(1, 'day');
            }
            const startDate = currentDate; // Found start

            // Find end date
            let daysCount = 0;
            let iterDate = startDate;
            while (daysCount < daysNeeded) {
                // Only count valid class days (not holidays)
                if (daysOfWeek.includes(iterDate.day()) && !this.isBrazilianHoliday(iterDate) && !this.isPaused(iterDate)) {
                    daysCount++;
                }
                if (daysCount < daysNeeded) { // Don't advance on the last day loop
                    iterDate = iterDate.add(1, 'day');
                }
            }
            const endDate = iterDate;

            newSchedule.push({
                uc_id: uc.id,
                data_inicio: startDate.format('YYYY-MM-DD'),
                data_fim: endDate.format('YYYY-MM-DD'),
                docente_id: teacherMap[uc.id]
            });

            // Set next start date (day after end date)
            currentDate = endDate.add(1, 'day');
        });

        // Update UI
        this.renderScheduleTable(newSchedule, this.currentMatrizUCs);

        // Update Previsão Término Input (Auto-fill)
        if (newSchedule.length > 0) {
            const lastDate = newSchedule[newSchedule.length - 1].data_fim;
            const endInput = document.querySelector('input[name="data_fim_previsto"]');
            if (endInput) {
                endInput.value = lastDate;
                ui.toast('Previsão de término atualizada.', 'info');
            }
        }

        ui.toast('Datas geradas com sucesso! (Feriados nacionais foram evitados)');
    },

    async save(e, id) {
        e.preventDefault();
        const f = e.target;
        const formData = new FormData(f);

        // Dias Aula e Cálculo de Datas
        const diasAula = [];
        f.querySelectorAll('input[name="dias_aula"]:checked').forEach(cb => diasAula.push(parseInt(cb.value)));

        // Calculate actual End Date based on the schedule table inputs (safest for manual edits)
        let maxDataFim = null;
        const currentLotacoes = this.captureTableState(); // Use newly created helper

        currentLotacoes.forEach(l => {
            if (l.data_fim) {
                if (!maxDataFim || l.data_fim > maxDataFim) {
                    maxDataFim = l.data_fim;
                }
            }
        });

        // Prioritize the manual End Date (Limite) if set
        // Otherwise, fallback to the calculated max allocation date
        let finalDataFim = formData.get('data_fim_previsto');
        if (!finalDataFim && maxDataFim) {
            finalDataFim = maxDataFim;
        }

        const turmaData = {
            codigo_sge: formData.get('codigo_sge'),
            nome: formData.get('nome'),
            curso_id: formData.get('curso_id'),
            matriz_id: formData.get('matriz_id'),
            turno: formData.get('turno'),
            capacidade: formData.get('capacidade') ? parseInt(formData.get('capacidade')) : null,
            data_inicio: formData.get('data_inicio'),
            data_fim_previsto: finalDataFim, // Set the final end date
            horas_diarias: formData.get('horas_diarias'),
            status: formData.get('status'),
            dias_aula: JSON.stringify(diasAula),
            coordenador_id: formData.get('coordenador_id') || null,
            analista_id: formData.get('analista_id') || null
        };

        try {
            const savedTurma = await turmas.save(turmaData, id);

            // Save Schedule (Lotacoes)
            const lotacoes = currentLotacoes.filter(l => l.data_inicio && l.data_fim).map(l => ({
                ...l,
                docente_id: l.docente_id || null
            }));

            if (lotacoes.length) {
                await turmas.saveLotacoes(savedTurma.id, lotacoes);
            }

            // Save Pauses
            await turmas.savePauses(savedTurma.id, this.currentPauses || []);

            ui.toast('Turma salva com sucesso!');
            ui.closeModal();
            this.loadList(); // Refresh list

        } catch (err) {
            console.error(err);
            ui.toast('Erro ao salvar turma: ' + err.message, 'error');
        }
    },

    captureTableState() {
        const rows = document.getElementById('schedule-body')?.querySelectorAll('tr[data-uc-id]') || [];
        const lotacoes = [];
        rows.forEach(row => {
            const ucId = row.dataset.ucId;
            lotacoes.push({
                uc_id: ucId,
                data_inicio: row.querySelector(`input[name="start_${ucId}"]`)?.value,
                data_fim: row.querySelector(`input[name="end_${ucId}"]`)?.value,
                docente_id: row.querySelector(`select[name="docente_${ucId}"]`)?.value
            });
        });
        return lotacoes;
    },

    moveUC(index, direction) {
        const ucs = this.currentMatrizUCs;
        if (!ucs) return;

        if (direction === -1 && index > 0) {
            // Move Up
            [ucs[index], ucs[index - 1]] = [ucs[index - 1], ucs[index]];
        } else if (direction === 1 && index < ucs.length - 1) {
            // Move Down
            [ucs[index], ucs[index + 1]] = [ucs[index + 1], ucs[index]];
        } else {
            return;
        }

        // Recalculate dates automatically based on new order
        this.generateSchedule();
    },

    // --- Pause Management ---

    isPaused(date) {
        if (!this.currentPauses || !this.currentPauses.length) return false;
        return this.currentPauses.some(p => {
            const start = window.dayjs(p.data_inicio).startOf('day');
            const end = window.dayjs(p.data_fim).endOf('day');
            return date.isAfter(start.subtract(1, 'second')) && date.isBefore(end.add(1, 'second'));
        });
    },

    addPause() {
        const descEl = document.getElementById('pause-desc');
        const startEl = document.getElementById('pause-start');
        const endEl = document.getElementById('pause-end');

        const desc = descEl?.value.trim();
        const start = startEl?.value;
        const end = endEl?.value;

        if (!desc || !start || !end) {
            ui.toast('Preencha os campos da pausa.', 'warning');
            return;
        }

        if (window.dayjs(start).isAfter(end)) {
            ui.toast('Data Início deve ser anterior ao Fim.', 'warning');
            return;
        }

        this.currentPauses = this.currentPauses || [];
        this.currentPauses.push({ descricao: desc, data_inicio: start, data_fim: end });

        // Clear inputs
        descEl.value = '';
        startEl.value = '';
        endEl.value = '';

        this.renderPausesList();
        this.generateSchedule(); // Auto-recalculate
        ui.toast('Pausa adicionada e cronograma recalculado.', 'success');
    },

    removePause(index) {
        if (!this.currentPauses) return;
        this.currentPauses.splice(index, 1);
        this.renderPausesList();
        this.generateSchedule(); // Auto-recalculate
        ui.toast('Pausa removida e cronograma recalculado.', 'info');
    },

    renderPausesList() {
        const tbody = document.getElementById('pauses-list-body');
        if (!tbody) return;

        if (!this.currentPauses || !this.currentPauses.length) {
            tbody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-slate-400">Nenhuma pausa cadastrada.</td></tr>`;
            return;
        }

        tbody.innerHTML = this.currentPauses.map((p, idx) => `
            <tr class="hover:bg-slate-50">
                <td class="p-2">${p.descricao}</td>
                <td class="p-2 text-slate-600">${window.dayjs(p.data_inicio).format('DD/MM/YYYY')}</td>
                <td class="p-2 text-slate-600">${window.dayjs(p.data_fim).format('DD/MM/YYYY')}</td>
                <td class="p-2 text-right">
                    <button type="button" class="text-red-500 hover:text-red-700" onclick="app.turmasView.removePause(${idx})">
                        <i class="ph ph-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
};
