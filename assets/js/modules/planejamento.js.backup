import { supabase } from '../services/supabase.js';
import { ui } from '../utils/ui.js';

export const planejamento = {
    currentTab: 'cursos', // Default tab

    render(state) {
        return `
            <div class="max-w-7xl mx-auto space-y-6 pb-10">
                <header class="flex justify-between items-end">
                    <div>
                        <h2 class="text-3xl font-bold text-gray-800">Planejamento</h2>
                        <p class="text-gray-500 mt-1">Gestão Estrutural: Cursos, Matrizes, Docentes e Alocação</p>
                    </div>
                </header>

                <!-- Tab Navigation -->
                <div class="border-b border-gray-200">
                    <nav class="flex gap-6">
                        <button onclick="app.planejamento.switchTab('cursos')" 
                            class="planejamento-tab ${this.currentTab === 'cursos' ? 'active' : ''}" 
                            data-tab="cursos">
                            <i class="ph ph-books"></i>
                            <span>Cursos & Matrizes</span>
                        </button>
                        <button onclick="app.planejamento.switchTab('docentes')" 
                            class="planejamento-tab ${this.currentTab === 'docentes' ? 'active' : ''}" 
                            data-tab="docentes">
                            <i class="ph ph-chalkboard-teacher"></i>
                            <span>Docentes</span>
                        </button>
                        <button onclick="app.planejamento.switchTab('turmas')" 
                            class="planejamento-tab ${this.currentTab === 'turmas' ? 'active' : ''}" 
                            data-tab="turmas">
                            <i class="ph ph-users-three"></i>
                            <span>Turmas & Lotação</span>
                        </button>
                    </nav>
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
            case 'cursos':
                return this.renderCursosMatrizes(state);
            case 'docentes':
                return this.renderDocentes(state);
            case 'turmas':
                return this.renderTurmasLotacao(state);
            default:
                return this.renderCursosMatrizes(state);
        }
    },

    switchTab(tabName) {
        this.currentTab = tabName;
        const content = document.getElementById('planejamento-content');
        if (content) {
            content.innerHTML = this.renderTabContent(app.state);
            // Update tab active states
            document.querySelectorAll('.planejamento-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
        }
    },

    renderCursosMatrizes(state) {
        return `
            <div class="space-y-8"

                <!-- GESTÃO DE CURSOS -->
                <section>
                    <div class="flex justify-between items-center mb-4 px-1">
                        <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <i class="ph ph-books text-blue-600"></i> Gestão de Cursos
                        </h3>
                        <button onclick="app.planejamento.openModalCurso()" class="btn-primary">
                            <i class="ph ph-plus"></i> Novo Curso
                        </button>
                    </div>
                    
                    <div class="table-container shadow-sm">
                        <table class="w-full text-sm text-left">
                            <thead class="table-header">
                                <tr>
                                    <th class="px-6 py-4">Nome do Curso</th>
                                    <th class="px-6 py-4">Área Tecnológica</th>
                                    <th class="px-6 py-4 text-center">Status</th>
                                    <th class="px-6 py-4">Criado em</th>
                                    <th class="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                ${state.courses.map(c => `
                                    <tr class="table-row group">
                                        <td class="px-6 py-4">
                                            <div class="flex items-center gap-3">
                                                <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                                    <i class="ph ph-book-open text-lg"></i>
                                                </div>
                                                <span class="font-bold text-gray-800 group-hover:text-blue-700 transition-colors">${c.nome}</span>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4">
                                            <span class="px-2.5 py-1 rounded-md text-xs font-bold border ${c.area_tecnologica === 'TI' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                c.area_tecnologica === 'Gestão' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                    c.area_tecnologica === 'Indústria' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                        'bg-pink-50 text-pink-700 border-pink-100'
            }">${c.area_tecnologica}</span>
                                        </td>
                                        <td class="px-6 py-4 text-center">
                                            ${c.status === 'Ativo'
                ? '<div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100"><div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Ativo</div>'
                : '<div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 text-gray-500 text-xs font-bold border border-gray-200"><div class="w-1.5 h-1.5 rounded-full bg-gray-400"></div> Inativo</div>'
            }
                                        </td>
                                        <td class="px-6 py-4 text-gray-500 text-xs">${window.dayjs(c.created_at).format('DD/MM/YYYY')}</td>
                                        <td class="px-6 py-4 text-right">
                                            <div class="flex items-center justify-end gap-2">
                                                <button onclick="app.planejamento.editCurso('${c.id}')" class="text-gray-400 hover:text-blue-600 transition-colors p-1.5 rounded-lg hover:bg-blue-50" title="Editar">
                                                    <i class="ph ph-pencil-simple text-lg"></i>
                                                </button>
                                                <button onclick="app.planejamento.toggleCursoStatus('${c.id}', '${c.status}')" class="text-gray-400 hover:text-${c.status === 'Ativo' ? 'red' : 'emerald'}-600 transition-colors p-1.5 rounded-lg hover:bg-${c.status === 'Ativo' ? 'red' : 'emerald'}-50" title="${c.status === 'Ativo' ? 'Inativar' : 'Ativar'}">
                                                    <i class="ph ph-${c.status === 'Ativo' ? 'x-circle' : 'check-circle'} text-lg"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('') || '<tr><td colspan="5" class="p-8 text-center text-gray-400 italic">Nenhum curso cadastrado.</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </section>

                <hr class="border-gray-200/60">

                <!-- Matrizes Grid -->
                <section>
                    <div class="flex justify-between items-center mb-4 px-1">
                        <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2"><i class="ph ph-squares-four text-blue-600"></i> Matrizes Curriculares Ativas</h3>
                        <button onclick="app.planejamento.openModalMatriz()" class="btn-secondary"><i class="ph ph-matrix"></i> Nova Matriz</button>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        ${state.matrices.map(m => `
                            <div class="glass-panel p-5 bg-white group hover:border-blue-300 transition-all cursor-pointer relative overflow-hidden" onclick="app.planejamento.openMatrizEditor('${m.id}')">
                                <div class="absolute right-0 top-0 opacity-5 transform translate-x-4 -translate-y-4">
                                     <i class="ph ph-file-text text-8xl"></i>
                                </div>
                                <div class="absolute top-4 right-4 text-gray-300 group-hover:text-blue-500 transition-colors bg-white/50 p-2 rounded-full hover:bg-blue-50"><i class="ph ph-pencil-simple text-xl"></i></div>
                                
                                <span class="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide bg-blue-50 text-blue-600 border border-blue-100">${m.codigo}</span>
                                <h4 class="text-lg font-bold text-gray-800 mt-3 mb-1 line-clamp-1 pr-8 relative z-10">${m.cursos?.nome}</h4>
                                <div class="flex items-center gap-2 mt-4 relative z-10">
                                    <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                                        <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Ativa
                                    </div>
                                    <span class="text-xs text-gray-400 ml-auto flex items-center gap-1"><i class="ph ph-calendar"></i> ${window.dayjs(m.created_at).format('DD/MMM/YY')}</span>
                                </div>
                            </div>
                        `).join('') || '<div class="col-span-3 text-center py-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 bg-gray-50/50">Nenhuma matriz cadastrada.</div>'}
                    </div>
                </section>

                <hr class="border-gray-200/60">

                <!-- Turmas & Alocação -->
                <section>
                    <div class="flex justify-between items-center mb-4 px-1">
                        <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2"><i class="ph ph-users-three text-emerald-600"></i> Turmas & Lotação</h3>
                        <button onclick="app.planejamento.openModalTurma()" class="btn-secondary text-xs"><i class="ph ph-plus"></i> Criar Nova Turma</button>
                    </div>
                    
                    <div class="table-container shadow-sm">
                        <table class="w-full text-sm text-left">
                            <thead class="table-header">
                                <tr>
                                    <th class="px-6 py-4">Cód. SGE</th>
                                    <th class="px-6 py-4">Curso</th>
                                    <th class="px-6 py-4">Turno</th>
                                    <th class="px-6 py-4">Início</th>
                                    <th class="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                ${state.classes.map(t => `
                                    <tr class="table-row group">
                                        <td class="px-6 py-4 font-mono font-medium text-blue-600 group-hover:text-blue-700">${t.codigo_sge}</td>
                                        <td class="px-6 py-4 text-gray-800 font-medium">${t.cursos?.nome}</td>
                                        <td class="px-6 py-4"><span class="px-2 py-0.5 rounded text-xs border border-gray-200 bg-gray-50">${t.turno}</span></td>
                                        <td class="px-6 py-4 text-gray-500">${window.dayjs(t.data_inicio).format('DD/MM/YYYY')}</td>
                                        <td class="px-6 py-4 text-right">
                                            <button onclick="app.planejamento.openLotacao('${t.id}')" class="text-blue-600 hover:text-white hover:bg-blue-600 font-medium text-xs border border-blue-200 hover:border-blue-600 px-3 py-1.5 rounded-lg transition-all bg-blue-50/50">
                                                Gerenciar Lotação
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        `;
    },

    renderDocentes(state) {
        return `
            <div class="space-y-6">
                <!-- GESTÃO DE DOCENTES -->
                <section>
                    <div class="flex justify-between items-center mb-4 px-1">
                        <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <i class="ph ph-chalkboard-teacher text-purple-600"></i> Gestão de Docentes
                        </h3>
                        <button onclick="app.planejamento.openModalDocente()" class="btn-primary">
                            <i class="ph ph-plus"></i> Novo Docente
                        </button>
                    </div>
                    
                    <div class="table-container shadow-sm">
                        <table class="w-full text-sm text-left">
                            <thead class="table-header">
                                <tr>
                                    <th class="px-6 py-4">Nome Completo</th>
                                    <th class="px-6 py-4">CPF</th>
                                    <th class="px-6 py-4">Formação</th>
                                    <th class="px-6 py-4">Áreas de Atuação</th>
                                    <th class="px-6 py-4 text-center">Status</th>
                                    <th class="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                ${state.teachers.map(d => `
                                    <tr class="table-row group">
                                        <td class="px-6 py-4">
                                            <div class="flex items-center gap-3">
                                                <div class="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">
                                                    ${d.nome.charAt(0)}
                                                </div>
                                                <div>
                                                    <p class="font-bold text-gray-800 group-hover:text-purple-700 transition-colors">${d.nome}</p>
                                                    <p class="text-xs text-gray-500">${d.email || 'Sem e-mail'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 font-mono text-gray-500 text-xs">${d.cpf || '-'}</td>
                                        <td class="px-6 py-4">
                                            <div class="flex flex-col gap-1">
                                                <span class="text-xs font-bold text-gray-700">${d.formacao || 'Não informado'}</span>
                                                <span class="text-[10px] text-gray-500">${d.area_formacao || ''}</span>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4">
                                            <div class="flex flex-wrap gap-1">
                                                ${(d.areas_atuacao || []).map(area => {
            const colors = [
                'bg-purple-50 text-purple-700 border-purple-100',
                'bg-emerald-50 text-emerald-700 border-emerald-100',
                'bg-orange-50 text-orange-700 border-orange-100',
                'bg-pink-50 text-pink-700 border-pink-100',
                'bg-blue-50 text-blue-700 border-blue-100',
                'bg-yellow-50 text-yellow-700 border-yellow-100',
                'bg-indigo-50 text-indigo-700 border-indigo-100',
                'bg-red-50 text-red-700 border-red-100'
            ];
            const areaIndex = state.areasTecnologicas.findIndex(a => a.nome === area);
            const colorClass = colors[areaIndex % colors.length] || colors[0];
            return `<span class="px-2 py-0.5 rounded-md text-[10px] font-bold border ${colorClass}">${area}</span>`;
        }).join('') || '<span class="text-gray-400 text-xs italic">Nenhuma área</span>'}
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 text-center">
                                            ${d.status === 'Ativo'
                ? '<div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100"><div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Ativo</div>'
                : '<div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 text-gray-500 text-xs font-bold border border-gray-200"><div class="w-1.5 h-1.5 rounded-full bg-gray-400"></div> Inativo</div>'
            }
                                        </td>
                                        <td class="px-6 py-4 text-right">
                                            <div class="flex items-center justify-end gap-2">
                                                <button onclick="app.planejamento.editDocente('${d.id}')" class="text-gray-400 hover:text-purple-600 transition-colors p-1.5 rounded-lg hover:bg-purple-50" title="Editar">
                                                    <i class="ph ph-pencil-simple text-lg"></i>
                                                </button>
                                                <button onclick="app.planejamento.toggleDocenteStatus('${d.id}', '${d.status}')" class="text-gray-400 hover:text-${d.status === 'Ativo' ? 'red' : 'emerald'}-600 transition-colors p-1.5 rounded-lg hover:bg-${d.status === 'Ativo' ? 'red' : 'emerald'}-50" title="${d.status === 'Ativo' ? 'Inativar' : 'Ativar'}">
                                                    <i class="ph ph-${d.status === 'Ativo' ? 'x-circle' : 'check-circle'} text-lg"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('') || '<tr><td colspan="6" class="p-8 text-center text-gray-400 italic">Nenhum docente cadastrado.</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        `;
    },

    renderTurmasLotacao(state) {
        return `
            <div class="space-y-6">
                <!-- Turmas & Alocação -->
                <section>
                    <div class="flex justify-between items-center mb-4 px-1">
                        <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2"><i class="ph ph-users-three text-emerald-600"></i> Turmas & Lotação</h3>
                        <button onclick="app.planejamento.openModalTurma()" class="btn-secondary text-xs"><i class="ph ph-plus"></i> Criar Nova Turma</button>
                    </div>
                    
                    <div class="table-container shadow-sm">
                        <table class="w-full text-sm text-left">
                            <thead class="table-header">
                                <tr>
                                    <th class="px-6 py-4">Cód. SGE</th>
                                    <th class="px-6 py-4">Curso</th>
                                    <th class="px-6 py-4">Turno</th>
                                    <th class="px-6 py-4">Início</th>
                                    <th class="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                ${state.classes.map(t => `
                                    <tr class="table-row group">
                                        <td class="px-6 py-4 font-mono font-medium text-blue-600 group-hover:text-blue-700">${t.codigo_sge}</td>
                                        <td class="px-6 py-4 text-gray-800 font-medium">${t.cursos?.nome}</td>
                                        <td class="px-6 py-4"><span class="px-2 py-0.5 rounded text-xs border border-gray-200 bg-gray-50">${t.turno}</span></td>
                                        <td class="px-6 py-4 text-gray-500">${window.dayjs(t.data_inicio).format('DD/MM/YYYY')}</td>
                                        <td class="px-6 py-4 text-right">
                                            <button onclick="app.planejamento.openLotacao('${t.id}')" class="text-blue-600 hover:text-white hover:bg-blue-600 font-medium text-xs border border-blue-200 hover:border-blue-600 px-3 py-1.5 rounded-lg transition-all bg-blue-50/50">
                                                Gerenciar Lotação
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        `;
    },

    // ===== MODAL FUNCTIONS =====

                < section >
                    <div class="flex justify-between items-center mb-4 px-1">
                        <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <i class="ph ph-chalkboard-teacher text-purple-600"></i> Gestão de Docentes
                        </h3>
                        <button onclick="app.planejamento.openModalDocente()" class="btn-primary">
                            <i class="ph ph-plus"></i> Novo Docente
                        </button>
                    </div>
                    
                    <div class="table-container shadow-sm">
                        <table class="w-full text-sm text-left">
                            <thead class="table-header">
                                <tr>
                                    <th class="px-6 py-4">Nome Completo</th>
                                    <th class="px-6 py-4">CPF</th>
                                    <th class="px-6 py-4">Formação</th>
                                    <th class="px-6 py-4">Áreas de Atuação</th>
                                    <th class="px-6 py-4 text-center">Status</th>
                                    <th class="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                ${state.teachers.map(d => `
                                    <tr class="table-row group">
                                        <td class="px-6 py-4">
                                            <div class="flex items-center gap-3">
                                                <div class="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">
                                                    ${d.nome.charAt(0)}
                                                </div>
                                                <div>
                                                    <p class="font-bold text-gray-800 group-hover:text-purple-700 transition-colors">${d.nome}</p>
                                                    <p class="text-xs text-gray-500">${d.email || 'Sem e-mail'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 font-mono text-gray-500 text-xs">${d.cpf || '-'}</td>
                                        <td class="px-6 py-4">
                                            <div class="flex flex-col gap-1">
                                                <span class="text-xs font-bold text-gray-700">${d.formacao || 'Não informado'}</span>
                                                <span class="text-[10px] text-gray-500">${d.area_formacao || ''}</span>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4">
                                            <div class="flex flex-wrap gap-1">
                                                ${(d.areas_atuacao || []).map(area => {
                const colors = [
                    'bg-purple-50 text-purple-700 border-purple-100',
                    'bg-emerald-50 text-emerald-700 border-emerald-100',
                    'bg-orange-50 text-orange-700 border-orange-100',
                    'bg-pink-50 text-pink-700 border-pink-100',
                    'bg-blue-50 text-blue-700 border-blue-100',
                    'bg-yellow-50 text-yellow-700 border-yellow-100',
                    'bg-indigo-50 text-indigo-700 border-indigo-100',
                    'bg-red-50 text-red-700 border-red-100'
                ];
                const areaIndex = state.areasTecnologicas.findIndex(a => a.nome === area);
                const colorClass = colors[areaIndex % colors.length] || colors[0];
                return `<span class="px-2 py-0.5 rounded-md text-[10px] font-bold border ${colorClass}">${area}</span>`;
            }).join('') || '<span class="text-gray-400 text-xs italic">Nenhuma área</span>'}
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 text-center">
                                            ${d.status === 'Ativo'
                    ? '<div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100"><div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Ativo</div>'
                    : '<div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 text-gray-500 text-xs font-bold border border-gray-200"><div class="w-1.5 h-1.5 rounded-full bg-gray-400"></div> Inativo</div>'
                }
                                        </td>
                                        <td class="px-6 py-4 text-right">
                                            <div class="flex items-center justify-end gap-2">
                                                <button onclick="app.planejamento.editDocente('${d.id}')" class="text-gray-400 hover:text-purple-600 transition-colors p-1.5 rounded-lg hover:bg-purple-50" title="Editar">
                                                    <i class="ph ph-pencil-simple text-lg"></i>
                                                </button>
                                                <button onclick="app.planejamento.toggleDocenteStatus('${d.id}', '${d.status}')" class="text-gray-400 hover:text-${d.status === 'Ativo' ? 'red' : 'emerald'}-600 transition-colors p-1.5 rounded-lg hover:bg-${d.status === 'Ativo' ? 'red' : 'emerald'}-50" title="${d.status === 'Ativo' ? 'Inativar' : 'Ativar'}">
                                                    <i class="ph ph-${d.status === 'Ativo' ? 'x-circle' : 'check-circle'} text-lg"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('') || '<tr><td colspan="6" class="p-8 text-center text-gray-400 italic">Nenhum docente cadastrado.</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </section >
            </div >
    `;
    },

    openModalCurso(cursoId = null) {
        let curso = null;
        if (cursoId) {
            curso = app.state.courses.find(c => c.id === cursoId);
        }

        const areasOptions = app.state.areasTecnologicas.map(area =>
            `< option value = "${area.nome}" ${ curso?.area_tecnologica === area.nome ? 'selected' : '' }> ${ area.nome }</option > `
        ).join('');

        ui.openModalWindow(curso ? 'Editar Curso' : 'Novo Curso', `
    < form onsubmit = "app.planejamento.submitCurso(event, '${cursoId || ''}')" class="space-y-5" >
                <div class="input-group">
                    <label class="input-label">Nome do Curso</label>
                    <input name="nome" required placeholder="Ex: Técnico em Desenvolvimento de Sistemas" class="input-field" value="${curso ? curso.nome : ''}">
                </div>
                <div class="input-group">
                    <label class="input-label">Área Tecnológica</label>
                    <select name="area" class="input-field cursor-pointer" required>
                        <option value="">Selecione uma área...</option>
                        ${areasOptions}
                    </select>
                </div>
                <div class="flex gap-3">
                    <button type="button" onclick="ui.closeModal()" class="btn-secondary flex-1">Cancelar</button>
                    <button type="submit" class="btn-primary flex-1 shadow-lg shadow-blue-500/20">
                        <i class="ph ph-check"></i> ${curso ? 'Atualizar' : 'Salvar'} Curso
                    </button>
                </div>
            </form >
    `);
    },

    async submitCurso(e, cursoId) {
        e.preventDefault();
        const formData = {
            nome: e.target.nome.value,
            area_tecnologica: e.target.area.value
        };

        if (cursoId) {
            // Atualizar curso existente
            const { error } = await supabase.from('cursos').update(formData).eq('id', cursoId);
            if (error) {
                ui.toast('Erro ao atualizar curso: ' + error.message, 'error');
                return;
            }
            ui.toast('Curso atualizado com sucesso!');
        } else {
            // Criar novo curso
            formData.status = 'Ativo';
            const { error } = await supabase.from('cursos').insert(formData);
            if (error) {
                ui.toast('Erro ao criar curso: ' + error.message, 'error');
                return;
            }
            ui.toast('Curso criado com sucesso!');
        }

        ui.closeModal();
        await app.refreshCurrentView();
    },

    async editCurso(cursoId) {
        this.openModalCurso(cursoId);
    },

    async toggleCursoStatus(cursoId, currentStatus) {
        const newStatus = currentStatus === 'Ativo' ? 'Inativo' : 'Ativo';
        const action = newStatus === 'Ativo' ? 'ativar' : 'inativar';

        if (!confirm(`Deseja realmente ${ action } este curso ? `)) return;

        const { error } = await supabase.from('cursos').update({ status: newStatus }).eq('id', cursoId);

        if (error) {
            ui.toast('Erro ao alterar status: ' + error.message, 'error');
            return;
        }

        ui.toast(`Curso ${ newStatus === 'Ativo' ? 'ativado' : 'inativado' } com sucesso!`);
        await app.refreshCurrentView();
    },

    openModalMatriz() {
        const options = app.state.courses.map(c => `< option value = "${c.id}" > ${ c.nome }</option > `).join('');
        ui.openModalWindow('Nova Matriz', `
    < form onsubmit = "app.planejamento.submitMatriz(event)" class="space-y-5" >
                <div class="input-group">
                    <label class="input-label">Curso Vinculado</label>
                    <select name="curso_id" required class="input-field cursor-pointer">${options}</select>
                </div>
                <div class="input-group">
                    <label class="input-label">Código (Versão)</label>
                    <input name="codigo" placeholder="Ex: MAT-DEV-2025.1" required class="input-field">
                </div>
                <button class="btn-primary w-full shadow-lg shadow-blue-500/20">Criar Matriz Vazia</button>
            </form >
    `);
    },

    async submitMatriz(e) {
        e.preventDefault();
        await supabase.from('matrizes').insert({ curso_id: e.target.curso_id.value, codigo: e.target.codigo.value, status: 'Ativa' });
        ui.closeModal(); ui.toast('Matriz criada!'); await app.refreshCurrentView();
    },

    openModalTurma() {
        const courseOptions = app.state.courses.map(c => `< option value = "${c.id}" > ${ c.nome }</option > `).join('');
        const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
        const dayChecks = days.map(d => `
    < label class="flex items-center gap-2 p-2 rounded hover:bg-gray-50 border border-transparent hover:border-gray-200 cursor-pointer transition-colors" >
        <input type="checkbox" name="dias" value="${d}" checked class="rounded text-blue-600 focus:ring-blue-500">
            <span class="text-sm font-medium text-gray-700">${d}</span>
        </label>
`).join('');

        ui.openModalWindow('Nova Turma', `
    < form onsubmit = "app.planejamento.submitTurma(event)" class="space-y-5" >
               <div class="grid grid-cols-2 gap-4">
                   <div class="input-group"><label class="input-label">Código SGE</label><input name="codigo" required class="input-field" placeholder="000.1.2.3"></div>
                   <div class="input-group"><label class="input-label">Curso</label><select name="curso_id" required class="input-field cursor-pointer">${courseOptions}</select></div>
               </div>
               <div class="grid grid-cols-2 gap-4">
                   <div class="input-group"><label class="input-label">Turno</label><select name="turno" class="input-field cursor-pointer"><option>Manhã</option><option>Tarde</option><option>Noite</option></select></div>
                   <div class="input-group"><label class="input-label">Data Início</label><input type="date" name="inicio" required class="input-field"></div>
               </div>
               <div class="bg-gray-50/50 p-4 rounded-xl border border-gray-200 space-y-3">
                   <div class="flex justify-between items-center"><span class="text-xs font-bold text-gray-500 uppercase tracking-widest">Calendário & Horários</span> <i class="ph ph-calendar text-gray-400"></i></div>
                   <div class="grid grid-cols-3 gap-2">${dayChecks}</div>
                   <div class="input-group"><label class="input-label">Horas/Aula por Dia</label><input type="number" name="horas_dia" value="4" class="input-field"></div>
               </div>
               <button class="btn-primary w-full shadow-lg shadow-blue-500/20">Criar Turma</button>
           </form >
    `);
    },

    async submitTurma(e) {
        e.preventDefault();
        const form = e.target;
        const { data: matrix } = await supabase.from('matrizes').select('id').eq('curso_id', form.curso_id.value).eq('status', 'Ativa').single();
        if (!matrix) return ui.toast('Este curso não possui Matriz Ativa!', 'error');

        const dias = Array.from(form.querySelectorAll('input[name="dias"]:checked')).map(cb => cb.value);
        await supabase.from('turmas').insert({
            codigo_sge: form.codigo.value,
            curso_id: form.curso_id.value,
            matriz_id: matrix.id,
            turno: form.turno.value,
            data_inicio: form.inicio.value,
            data_fim_previsto: window.dayjs(form.inicio.value).add(1, 'year').format('YYYY-MM-DD'),
            config_aulas: { dias, horas: form.horas_dia.value }
        });
        ui.closeModal(); ui.toast('Turma criada!'); await app.refreshCurrentView();
    },


    openModalDocente(docenteId = null) {
        let docente = null;
        if (docenteId) {
            docente = app.state.teachers.find(d => d.id === docenteId);
        }

        const areasCheckboxes = app.state.areasTecnologicas.map(area => `
    < label class="flex items-center gap-2 p-2 rounded hover:bg-gray-50 border border-transparent hover:border-gray-200 cursor-pointer transition-colors" >
        <input type="checkbox" name="areas_atuacao" value="${area.nome}"
            ${docente?.areas_atuacao?.includes(area.nome) ? 'checked' : ''}
            class="rounded text-purple-600 focus:ring-purple-500">
            <span class="text-sm font-medium text-gray-700">${area.nome}</span>
        </label>
`).join('');

        ui.openModalWindow(docente ? 'Editar Docente' : 'Novo Docente', `
    < form onsubmit = "app.planejamento.submitDocente(event, '${docenteId || ''}')" class="space-y-5" >
                <div class="input-group">
                    <label class="input-label">Nome Completo *</label>
                    <input name="nome" required class="input-field" placeholder="João da Silva" value="${docente ? docente.nome : ''}">
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div class="input-group">
                        <label class="input-label">CPF</label>
                        <input name="cpf" data-mask="cpf" class="input-field" placeholder="000.000.000-00" value="${docente?.cpf || ''}">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Telefone</label>
                        <input name="telefone" data-mask="phone" class="input-field" placeholder="(00) 00000-0000" value="${docente?.telefone || ''}">
                    </div>
                </div>

                <div class="input-group">
                    <label class="input-label">E-mail</label>
                    <input name="email" type="email" class="input-field" placeholder="joao@email.com" value="${docente?.email || ''}">
                </div>

                <div class="input-group">
                    <label class="input-label">Área de Formação *</label>
                    <input name="area_formacao" required class="input-field" placeholder="Ex: Engenharia de Software" value="${docente?.area_formacao || ''}">
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div class="input-group">
                        <label class="input-label">Nível de Formação</label>
                        <select name="formacao" class="input-field">
                            <option value="Médio" ${docente?.formacao === 'Médio' ? 'selected' : ''}>Médio</option>
                            <option value="Superior" ${docente?.formacao === 'Superior' ? 'selected' : ''}>Superior</option>
                            <option value="Pós-Graduação" ${docente?.formacao === 'Pós-Graduação' ? 'selected' : ''}>Pós-Graduação</option>
                            <option value="Mestrado" ${docente?.formacao === 'Mestrado' ? 'selected' : ''}>Mestrado</option>
                            <option value="Doutorado" ${docente?.formacao === 'Doutorado' ? 'selected' : ''}>Doutorado</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label class="input-label">Tipo de Vínculo</label>
                        <select name="tipo_vinculo" class="input-field">
                            <option value="Horista" ${docente?.tipo_vinculo === 'Horista' ? 'selected' : ''}>Horista</option>
                            <option value="Mensalista" ${docente?.tipo_vinculo === 'Mensalista' ? 'selected' : ''}>Mensalista</option>
                            <option value="CLT" ${docente?.tipo_vinculo === 'CLT' ? 'selected' : ''}>CLT</option>
                            <option value="PJ" ${docente?.tipo_vinculo === 'PJ' ? 'selected' : ''}>PJ</option>
                        </select>
                    </div>
                </div>

                <div class="bg-purple-50/30 p-4 rounded-xl border border-purple-100/50 space-y-3">
                    <div class="flex justify-between items-center">
                        <span class="text-xs font-bold text-purple-700 uppercase tracking-widest">Áreas de Atuação</span>
                        <i class="ph ph-graduation-cap text-purple-400"></i>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        ${areasCheckboxes}
                    </div>
                    <p class="text-[10px] text-gray-500 italic">Selecione todas as áreas em que o docente pode atuar</p>
                </div>

                <div class="flex gap-3">
                    <button type="button" onclick="ui.closeModal()" class="btn-secondary flex-1">Cancelar</button>
                    <button type="submit" class="btn-primary flex-1 shadow-lg shadow-purple-500/20">
                        <i class="ph ph-check"></i> ${docente ? 'Atualizar' : 'Salvar'} Docente
                    </button>
                </div>
            </form >
    `);
    },

    async submitDocente(e, docenteId) {
        e.preventDefault();
        const form = e.target;

        const areasAtuacao = Array.from(form.querySelectorAll('input[name="areas_atuacao"]:checked')).map(cb => cb.value);

        const formData = {
            nome: form.nome.value.trim(),
            cpf: form.cpf.value.replace(/\D/g, '') || null,
            telefone: form.telefone.value.replace(/\D/g, '') || null,
            email: form.email.value.trim() || null,
            area_formacao: form.area_formacao.value.trim(),
            formacao: form.formacao.value,
            tipo_vinculo: form.tipo_vinculo.value,
            areas_atuacao: areasAtuacao.length > 0 ? areasAtuacao : null
        };

        try {
            if (docenteId) {
                const { error } = await supabase.from('docentes').update(formData).eq('id', docenteId);
                if (error) throw error;
                ui.toast('Docente atualizado com sucesso!');
            } else {
                formData.status = 'Ativo';
                const { error } = await supabase.from('docentes').insert(formData);
                if (error) throw error;
                ui.toast('Docente cadastrado com sucesso!');
            }

            ui.closeModal();
            await app.refreshCurrentView();
        } catch (error) {
            console.error('Erro ao salvar docente:', error);
            ui.toast('Erro: ' + (error.message || 'Não foi possível salvar o docente'), 'error');
        }
    },


    async editDocente(docenteId) {
        this.openModalDocente(docenteId);
    },

    async toggleDocenteStatus(docenteId, currentStatus) {
        const newStatus = currentStatus === 'Ativo' ? 'Inativo' : 'Ativo';
        const action = newStatus === 'Ativo' ? 'ativar' : 'inativar';

        if (!confirm(`Deseja realmente ${ action } este docente ? `)) return;

        const { error } = await supabase.from('docentes').update({ status: newStatus }).eq('id', docenteId);

        if (error) {
            ui.toast('Erro ao alterar status: ' + error.message, 'error');
            return;
        }

        ui.toast(`Docente ${ newStatus === 'Ativo' ? 'ativado' : 'inativado' } com sucesso!`);
        await app.refreshCurrentView();
    },


    async openMatrizEditor(matrizId) {
        const { data: ucs } = await supabase.from('unidades_curriculares').select('*').eq('matriz_id', matrizId).order('created_at');
        const matrix = app.state.matrices.find(m => m.id === matrizId);
        const totalHours = ucs ? ucs.reduce((acc, curr) => acc + curr.carga_horaria, 0) : 0;

        const content = `
    < div class="space-y-6" >
                < !--Header Card-- >
                <div class="flex justify-between items-start bg-gradient-to-r from-gray-50 to-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="px-2 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700 font-bold uppercase tracking-wide">Matriz Ativa</span>
                            <span class="text-xs text-gray-400">ID: ${matrix.codigo}</span>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800">${matrix.cursos.nome}</h3>
                    </div>
                    <div class="text-right bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                        <p class="text-[10px] text-gray-500 uppercase tracking-wide font-bold">Carga Total</p>
                        <p class="text-2xl font-bold text-blue-600 leading-none mt-1">${totalHours}<span class="text-sm text-gray-400 font-medium">h</span></p>
                    </div>
                </div>

                <!--Add Form-- >
                <form onsubmit="app.planejamento.addUC(event, '${matrizId}')" class="flex gap-3 items-end p-4 bg-blue-50/30 rounded-2xl border border-blue-100/50">
                    <div class="flex-1 input-group">
                        <label class="input-label">Nome da Unidade Curricular</label>
                        <input name="nome" required placeholder="Ex: Lógica de Programação" class="input-field bg-white shadow-none">
                    </div>
                    <div class="w-24 input-group">
                        <label class="input-label">C.H.</label>
                        <input name="horas" type="number" required placeholder="80" class="input-field bg-white shadow-none text-center">
                    </div>
                    <div class="w-40 input-group">
                        <label class="input-label">Eixo</label>
                        <input name="eixo" placeholder="Ex: Geral" class="input-field bg-white shadow-none">
                    </div>
                    <button type="submit" class="h-[46px] w-[46px] flex items-center justify-center bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md hover:shadow-lg transition-all active:scale-95">
                        <i class="ph ph-plus text-lg"></i>
                    </button>
                </form>

                <!--List -->
    <div class="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        ${ucs && ucs.length ? ucs.map((uc, idx) => `
                        <div class="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all group">
                            <div class="flex items-center gap-4">
                                <span class="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 text-xs font-bold flex items-center justify-center border border-gray-100 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">${idx + 1}</span>
                                <div>
                                    <p class="font-bold text-gray-800">${uc.nome}</p>
                                    <p class="text-xs text-gray-500 flex items-center gap-1"><i class="ph ph-tag"></i> ${uc.eixo_tecnologico || 'Geral'}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-4">
                                <span class="font-mono font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-200 text-xs">${uc.carga_horaria}h</span>
                                <button onclick="app.planejamento.deleteUC('${uc.id}', '${matrizId}')" class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"><i class="ph ph-trash text-lg"></i></button>
                            </div>
                        </div>
                    `).join('') : '<p class="text-center text-gray-400 py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 italic">Nenhuma unidade curricular adicionada.</p>'}
    </div>
            </div >
    `;
        ui.openModalWindow('Editor de Matriz', content);
    },

    async addUC(e, matrizId) {
        e.preventDefault();
        const form = e.target;
        const { error } = await supabase.from('unidades_curriculares').insert({
            matriz_id: matrizId,
            nome: form.nome.value,
            carga_horaria: parseInt(form.horas.value),
            eixo_tecnologico: form.eixo.value
        });
        if (error) ui.toast(error.message, 'error');
        else { this.openMatrizEditor(matrizId); ui.toast('UC Adicionada'); }
    },

    async deleteUC(id, matrizId) {
        if (!confirm('Remover esta UC?')) return;
        await supabase.from('unidades_curriculares').delete().eq('id', id);
        this.openMatrizEditor(matrizId);
    },

    async openLotacao(turmaId) {
        const turma = app.state.classes.find(t => t.id === turmaId);
        const { data: ucs } = await supabase.from('unidades_curriculares').select('*').eq('matriz_id', turma.matriz_id).order('created_at');
        const { data: allocations } = await supabase.from('lotacao_docente').select('*').eq('turma_id', turmaId);

        const rows = ucs.map(uc => {
            const alloc = allocations.find(a => a.uc_id === uc.id) || {};
            const docente = app.state.teachers.find(d => d.id === alloc.docente_id);
            return { ...uc, alloc, docenteName: docente ? docente.nome : '' };
        });

        const content = `
    < div class="space-y-6" >
                < !--Info Header-- >
                <div class="grid grid-cols-4 gap-4 bg-gray-50/80 p-5 rounded-2xl border border-gray-200/60 shadow-sm backdrop-blur-sm">
                    <div><p class="text-gray-400 uppercase text-[10px] font-bold tracking-wider mb-1">Turma</p><p class="font-bold text-gray-800 text-lg">${turma.codigo_sge}</p></div>
                    <div><p class="text-gray-400 uppercase text-[10px] font-bold tracking-wider mb-1">Data Início</p><p class="font-bold text-gray-800">${window.dayjs(turma.data_inicio).format('DD/MM/YYYY')}</p></div>
                    <div><p class="text-gray-400 uppercase text-[10px] font-bold tracking-wider mb-1">Dias Letivos</p><p class="font-medium text-gray-700 bg-white px-2 py-0.5 rounded border border-gray-200 inline-block text-xs">${turma.config_aulas?.dias?.join(', ') || 'N/A'}</p></div>
                    <div class="text-right"><p class="text-gray-400 uppercase text-[10px] font-bold tracking-wider mb-1">Horas/Dia</p><p class="font-bold text-gray-800 text-xl">${turma.config_aulas?.horas || 0}h</p></div>
                </div>

                <div class="flex justify-end">
                    <button onclick="app.planejamento.runAutoSchedule('${turmaId}')" class="btn-accent text-sm shadow-purple-500/20"><i class="ph ph-magic-wand"></i> Gerar Cronograma Automático</button>
                </div>

                <div class="table-container max-h-[400px] overflow-y-auto">
                    <table class="w-full text-sm">
                        <thead class="table-header sticky top-0 bg-white z-10 shadow-sm">
                            <tr>
                                <th class="px-4 py-3 text-left">Unidade Curricular</th>
                                <th class="px-4 py-3 text-center w-20">C.H.</th>
                                <th class="px-4 py-3 w-32 border-l border-gray-100">Início</th>
                                <th class="px-4 py-3 w-32">Fim</th>
                                <th class="px-4 py-3 w-48 border-l border-gray-100">Docente</th>
                                <th class="px-4 py-3 w-10"></th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-50">
                            ${rows.map(row => `
                                <tr class="table-row hover:bg-blue-50/30">
                                    <td class="px-4 py-3 font-medium text-gray-800">${row.nome}</td>
                                    <td class="px-4 py-3 text-center text-gray-500 bg-gray-50/50 rounded-lg mx-2 text-xs font-mono">${row.carga_horaria}h</td>
                                    <td class="px-4 py-3 text-xs font-mono text-gray-600 border-l border-gray-50">${row.alloc.data_inicio ? window.dayjs(row.alloc.data_inicio).format('DD/MM/YY') : '<span class="text-gray-300">-</span>'}</td>
                                    <td class="px-4 py-3 text-xs font-mono text-gray-600">${row.alloc.data_fim ? window.dayjs(row.alloc.data_fim).format('DD/MM/YY') : '<span class="text-gray-300">-</span>'}</td>
                                    <td class="px-4 py-3 text-xs border-l border-gray-50">
                                        ${row.docenteName
                ? `<span class="px-2 py-1 rounded bg-blue-50 text-blue-700 font-bold border border-blue-100 inline-block truncate max-w-[150px]">${row.docenteName}</span>`
                : '<span class="text-gray-400 italic text-[10px]">Não atribuído</span>'}
                                    </td>
                                    <td class="px-4 py-3 text-center"><button onclick="app.planejamento.editAllocation('${row.id}', '${turmaId}')" class="p-1.5 rounded-lg text-gray-300 hover:text-blue-600 hover:bg-blue-50 transition-all"><i class="ph ph-gear text-lg"></i></button></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div >
    `;
        ui.openModalWindow('Lotação de Docentes', content);
    },

    async runAutoSchedule(turmaId) {
        if (!confirm('Isso irá sobrescrever as datas atuais. Continuar?')) return;
        const turma = app.state.classes.find(t => t.id === turmaId);
        const { data: ucs } = await supabase.from('unidades_curriculares').select('*').eq('matriz_id', turma.matriz_id).order('created_at');
        if (!turma.config_aulas) { return ui.toast('Configure os dias/horas da turma primeiro!', 'error'); }

        const activeDays = turma.config_aulas.dias.map(d => ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].indexOf(d));
        const hoursPerDay = parseInt(turma.config_aulas.horas);

        let currentDate = window.dayjs(turma.data_inicio);

        for (let uc of ucs) {
            let remainingHours = uc.carga_horaria;
            let startDate = currentDate.format('YYYY-MM-DD');
            while (remainingHours > 0) {
                if (activeDays.includes(currentDate.day())) remainingHours -= hoursPerDay;
                if (remainingHours > 0) currentDate = currentDate.add(1, 'day');
            }
            let endDate = currentDate.format('YYYY-MM-DD');
            const { data: existing } = await supabase.from('lotacao_docente').select('id').match({ turma_id: turmaId, uc_id: uc.id }).maybeSingle();
            if (existing) await supabase.from('lotacao_docente').update({ data_inicio: startDate, data_fim: endDate }).eq('id', existing.id);
            else await supabase.from('lotacao_docente').insert({ turma_id: turmaId, uc_id: uc.id, data_inicio: startDate, data_fim: endDate });
            currentDate = currentDate.add(1, 'day');
        }
        ui.toast('Cronograma gerado!'); this.openLotacao(turmaId);
    },

    async editAllocation(ucId, turmaId) {
        const docenteId = prompt("ID do Docente (Simulação):");
        if (docenteId) {
            const { data: existing } = await supabase.from('lotacao_docente').select('id').match({ turma_id: turmaId, uc_id: ucId }).maybeSingle();
            if (existing) await supabase.from('lotacao_docente').update({ docente_id: docenteId }).eq('id', existing.id);
            else await supabase.from('lotacao_docente').insert({ turma_id: turmaId, uc_id: ucId, docente_id: docenteId });
            this.openLotacao(turmaId);
        }
    }
};
