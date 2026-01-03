
// modules/secretaria.js
import { supabase } from '../services/supabase.js';
import { ui } from '../utils/ui.js';

export const secretaria = {
    currentTab: 'alunos', // alunos, matriculas, documentos, empresas

    // Mocks for UI Development
    mocks: {
        alunos: [
            { id: 1, nome: "Ana Clara Souza", matricula: "2024001", status: "Ativo", curso: "Técnico em Enfermagem", empresa: null, avatar: null },
            { id: 2, nome: "Bruno Ferreira", matricula: "2024002", status: "Ativo", curso: "Aprendizagem Ind. Mecânica", empresa: "Bosch Ltda", avatar: null },
            { id: 3, nome: "Carlos Lima", matricula: "2024003", status: "Trancado", curso: "Técnico em Informática", empresa: null, avatar: null },
            { id: 4, nome: "Daniela Alves", matricula: "2024004", status: "Evadido", curso: "Técnico em Enfermagem", empresa: null, avatar: null },
            { id: 5, nome: "Eduardo Rocha", matricula: "2024005", status: "Ativo", curso: "Aprendizagem Ind. Elétrica", empresa: "Samsung", avatar: null },
        ]
    },

    alunosData: [],
    searchTerm: '',

    async init() {
        console.log('Secretaria module initialized');
        await this.loadAlunos();
    },

    async loadAlunos() {
        try {
            const contentParams = `
                id, nome, matricula_sge, status, foto_url,
                empresas (nome),
                matriculas (
                    status,
                    turmas (nome)
                )
            `;

            const { data, error } = await supabase
                .from('alunos')
                .select(contentParams)
                .order('nome');

            if (error) throw error;

            this.alunosData = data.map(a => {
                // Find active matricula or first one
                const matriculaAtiva = a.matriculas?.find(m => m.status === 'Ativa') || a.matriculas?.[0];
                const cursoNome = matriculaAtiva?.turmas?.nome || 'Não Enturmado';

                return {
                    id: a.id,
                    nome: a.nome,
                    matricula: a.matricula_sge || 'S/ Matrícula',
                    status: a.status || 'Ativo',
                    curso: cursoNome,
                    empresa: a.empresas?.nome || null,
                    avatar: a.foto_url
                };
            });

            this.render();
        } catch (error) {
            console.error('Erro ao buscar alunos:', error);
            ui.toast('Erro ao carregar alunos.', 'error');
            this.alunosData = this.mocks.alunos; // Fallback
            this.render();
        }
    },

    handleSearch(e) {
        this.searchTerm = e.target.value.toLowerCase();
        // Re-render filtrado
        document.getElementById('alunos-list-container').innerHTML = this.renderTokenList();
    },

    getFilteredAlunos() {
        if (!this.alunosData) return [];
        if (!this.searchTerm) return this.alunosData;
        return this.alunosData.filter(a =>
            (a.nome && a.nome.toLowerCase().includes(this.searchTerm)) ||
            (a.matricula && a.matricula.toLowerCase().includes(this.searchTerm))
        );
    },

    render() {
        // Main Render (Wrapper)
        if (!document.getElementById('secretaria-content')) {
            return `
            <div class="animate-fade-in space-y-6">
                <!-- Header -->
                <div class="page-header">
                    <div class="flex-between">
                        <div>
                            <h2 class="page-title">Secretaria Acadêmica</h2>
                            <p class="page-subtitle">Gestão de matrículas, documentação escolar e vida acadêmica</p>
                        </div>
                        <div class="flex gap-3">
                            <button class="btn btn-secondary" onclick="app.secretaria.exportData()">
                                <i class="ph-bold ph-download-simple"></i>
                                <span class="hidden md:inline">Relatórios</span>
                            </button>
                            <button class="btn btn-primary" onclick="app.secretaria.openModalMatricula()">
                                <i class="ph-bold ph-user-plus"></i>
                                <span>Nova Matrícula</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Tabs -->
                <div class="tab-pills" style="margin-bottom: 2rem;">
                    ${this.renderTabButton('alunos', 'Alunos', 'ph-users')}
                    ${this.renderTabButton('matriculas', 'Enturmação', 'ph-student')}
                    ${this.renderTabButton('documentos', 'Documentos', 'ph-files')}
                    ${this.renderTabButton('empresas', 'Empresas', 'ph-buildings')}
                </div>

                <!-- Tab Content -->
                <div id="secretaria-content" class="min-h-[500px]">
                    ${this.renderCurrentTab()}
                </div>
            </div>
            `;
        } else {
            // Update only content if wrapper exists
            document.getElementById('secretaria-content').innerHTML = this.renderCurrentTab();
            return ''; // Caller handles logic
        }
    },

    renderTabButton(id, label, icon) {
        const isActive = this.currentTab === id;
        return `
            <button onclick="app.secretaria.setTab('${id}')" 
                class="tab-pill ${isActive ? 'active' : ''}">
                <i class="ph-bold ${icon}"></i>
                ${label}
            </button>
        `;
    },

    setTab(tab) {
        this.currentTab = tab;
        this.render();
    },

    renderCurrentTab() {
        switch (this.currentTab) {
            case 'alunos': return this.renderAlunosView();
            case 'matriculas': return this.renderMatriculasView();
            case 'documentos': return this.renderDocumentosView();
            case 'empresas': return this.renderEmpresasView();
            default: return this.renderAlunosView();
        }
    },

    renderAlunosView() {
        return `
            <div class="animate-fade-in">
                <!-- Filters -->
                <div class="card" style="padding: 1rem; margin-bottom: 1.5rem; display: flex; gap: 1rem; align-items: center;">
                    <div style="flex: 1; position: relative;">
                        <i class="ph ph-magnifying-glass" style="position: absolute; left: 1rem; top: 1rem; color: #94a3b8;"></i>
                        <input type="text" 
                            placeholder="Buscar por aluno, matrícula ou CPF..." 
                            class="input-field" 
                            style="padding-left: 2.5rem;"
                            oninput="app.secretaria.handleSearch(event)"
                            value="${this.searchTerm}"
                            autofocus
                        >
                    </div>
                    <div style="width: 200px;">
                        <select class="input-field">
                            <option value="">Status: Todos</option>
                            <option value="Ativo">Ativo</option>
                            <option value="Trancado">Trancado</option>
                        </select>
                    </div>
                </div>

                <!-- List (Token Layout) -->
                <div id="alunos-list-container" class="token-list">
                    ${this.renderTokenList()}
                </div>
            </div>
        `;
    },

    renderTokenList() {
        const alunos = this.getFilteredAlunos();

        if (alunos.length === 0) {
            return `
                <div class="text-center py-12 text-slate-400">
                    <i class="ph-duotone ph-user-minus text-4xl mb-2"></i>
                    <p>Nenhum aluno encontrado.</p>
                </div>
            `;
        }

        return alunos.map(aluno => `
            <div class="token-item group cursor-pointer hover:border-indigo-200 transition-colors">
                <div class="token-icon ${this.getAvatarColor(aluno.nome)}">
                    ${aluno.avatar
                ? `<img src="${aluno.avatar}" class="w-full h-full rounded-xl object-cover">`
                : `<span class="font-bold text-lg">${this.getInitials(aluno.nome)}</span>`}
                </div>
                
                <div class="token-info">
                    <div class="token-name">${aluno.nome}</div>
                    <div class="token-meta">
                        <span class="font-mono bg-slate-100 px-1 rounded text-slate-600 mr-2">${aluno.matricula}</span>
                        ${aluno.curso}
                    </div>
                    ${aluno.empresa ? `
                        <div class="token-meta text-indigo-600 mt-1">
                            <i class="ph-fill ph-briefcase"></i> ${aluno.empresa}
                        </div>
                    ` : ''}
                </div>

                <div class="flex items-center gap-4">
                    <span class="badge ${this.getStatusBadge(aluno.status)}">${aluno.status}</span>
                    
                    <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button class="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors" title="Editar">
                            <i class="ph-bold ph-pencil-simple"></i>
                        </button>
                        <button class="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors" title="Histórico">
                            <i class="ph-bold ph-file-text"></i>
                        </button>
                    </div>
                    <i class="ph ph-caret-right text-gray-300 group-hover:text-indigo-400"></i>
                </div>
            </div>
        `).join('');
    },

    renderMatriculasView() {
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button class="card p-8 border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group text-left">
                    <div class="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                        <i class="ph-fill ph-users-three text-2xl"></i>
                    </div>
                    <h3 class="font-bold text-slate-900 text-lg mb-2">Enturmação em Lote</h3>
                    <p class="text-slate-500 text-sm leading-relaxed">Adicione múltiplos alunos a uma turma existente importando uma lista CSV ou selecionando registros do banco de dados.</p>
                </button>
                
                 <button class="card p-8 border-2 border-dashed border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all group text-left">
                     <div class="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                        <i class="ph-fill ph-arrows-left-right text-2xl"></i>
                    </div>
                    <h3 class="font-bold text-slate-900 text-lg mb-2">Transferência de Turma</h3>
                    <p class="text-slate-500 text-sm leading-relaxed">Realize a movimentação de alunos entre turmas mantendo o histórico acadêmico e financeiro íntegro.</p>
                </button>
            </div>
        `;
    },

    renderDocumentosView() {
        return `
            <div class="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
                <div class="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4 relative">
                    <i class="ph-duotone ph-folder-notch-open text-5xl text-slate-300"></i>
                    <div class="absolute -right-2 -bottom-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center text-white">
                        <i class="ph-bold ph-check text-xs"></i>
                    </div>
                </div>
                <h3 class="font-bold text-slate-900 text-xl">Tudo em dia!</h3>
                <p class="text-slate-500 mt-2 text-center max-w-sm">Não há documentos pendentes de validação na fila da secretaria.</p>
                
                <button class="btn btn-secondary mt-8" onclick="ui.showToast('Upload de documentos...')">
                    <i class="ph-bold ph-upload-simple"></i>
                    Novo Documento
                </button>
            </div>
        `;
    },

    renderEmpresasView() {
        return `
             <div class="space-y-8">
                <!-- Stats Row -->
                 <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="card p-5 flex items-center gap-4 bg-white border border-slate-100 shadow-sm">
                        <div class="p-3 bg-indigo-50 rounded-xl text-indigo-600"><i class="ph-fill ph-buildings text-2xl"></i></div>
                        <div><div class="text-2xl font-extrabold text-slate-900">12</div><div class="text-xs font-bold uppercase text-slate-400">Empresas Parceiras</div></div>
                    </div>
                    <div class="card p-5 flex items-center gap-4 bg-white border border-slate-100 shadow-sm">
                        <div class="p-3 bg-emerald-50 rounded-xl text-emerald-600"><i class="ph-fill ph-users text-2xl"></i></div>
                        <div><div class="text-2xl font-extrabold text-slate-900">45</div><div class="text-xs font-bold uppercase text-slate-400">Aprendizes Ativos</div></div>
                    </div>
                    <div class="card p-5 flex items-center gap-4 bg-white border border-slate-100 shadow-sm">
                        <div class="p-3 bg-amber-50 rounded-xl text-amber-600"><i class="ph-fill ph-warning-circle text-2xl"></i></div>
                        <div><div class="text-2xl font-extrabold text-slate-900">3</div><div class="text-xs font-bold uppercase text-slate-400">Pendências de Freq.</div></div>
                    </div>
                </div>

                <!-- Main Action Card -->
                 <div class="group relative overflow-hidden rounded-3xl bg-slate-900 p-8 shadow-2xl">
                    <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div class="max-w-xl">
                            <div class="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-300 mb-4 border border-indigo-500/30">
                                <span class="relative flex h-2 w-2">
                                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                  <span class="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                </span>
                                Fechamento Mensal
                            </div>
                            <h3 class="text-3xl font-bold text-white mb-3">Relatório de Frequência</h3>
                            <p class="text-slate-400 leading-relaxed">
                                Gere o consolidado de presença e faltas para envio às empresas parceiras. 
                                O sistema verifica automaticamente os diários de classe digitais.
                            </p>
                        </div>
                        
                        <div class="flex flex-col gap-3 min-w-[220px]">
                             <button class="h-12 w-full rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2" onclick="ui.showToast('Gerando PDF...', 'success')">
                                <i class="ph-bold ph-printer"></i> Gerar Relatório
                            </button>
                             <button class="h-12 w-full rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold border border-slate-700 transition-all flex items-center justify-center gap-2">
                                <i class="ph-bold ph-envelope"></i> Enviar por E-mail
                            </button>
                        </div>
                    </div>
                    
                    <!-- Background Decor -->
                    <div class="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl group-hover:bg-indigo-500/30 transition-all"></div>
                    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ">
                         <i class="ph-duotone ph-chart-bar text-[20rem] text-white/5 rotate-12"></i>
                    </div>
                 </div>
             </div>
        `;
    },

    // --- UTILS ---
    getAvatarColor(name) {
        const colors = ['purple', 'blue', 'green', 'yellow'];
        const index = name.length % colors.length;
        return colors[index];
    },

    getInitials(name) {
        return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    },

    getStatusBadge(status) {
        if (status === 'Ativo') return 'badge-success';
        if (status === 'Trancado') return 'badge-neutral';
        if (status === 'Evadido') return 'bg-red-50 text-red-600 border border-red-100';
        return 'badge-neutral';
    },

    openModalMatricula() {
        ui.alert('Módulo de Matrícula', 'O assistente de cadastro de alunos e matrículas será aberto aqui.');
    },

    exportData() {
        ui.showToast('Iniciando download dos dados...');
    }
};

// Make it global
window.app = window.app || {};
window.app.secretaria = secretaria;
