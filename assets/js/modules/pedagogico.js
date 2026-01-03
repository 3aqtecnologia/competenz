
import { supabase } from '../services/supabase.js';
import { ui } from '../utils/ui.js';

export const pedagogico = {
    currentTab: 'diarios', // diarios, frequencia, avaliacoes, desempenho

    // Mock Data for UI Prototyping
    mocks: {
        turmas: [
            { id: 1, nome: "Técnico em Desenv. Sistemas - Módulo 1", uc: "Lógica de Programação", turno: "Vespertino", alunos: 32, aulas_dadas: 14 },
            { id: 2, nome: "Aprendizagem Ind. Mecânica - Turma B", uc: "Leitura e Interpretação de Desenho", turno: "Matutino", alunos: 28, aulas_dadas: 8 },
        ],
        aulas: [
            { id: 1, data: "02/01/2026", conteudo: "Introdução a Algoritmos e Variáveis", status: "Registrada" },
            { id: 2, data: "03/01/2026", conteudo: "Estruturas Condicionais (If/Else)", status: "Pendente" }
        ]
    },

    render(state) {
        return `
            <div class="animate-fade-in space-y-6">
                <!-- Header -->
                <div class="page-header">
                    <div class="flex-between">
                        <div>
                            <h2 class="page-title">Gestão Pedagógica</h2>
                            <p class="page-subtitle">Diários de classe, frequência, avaliações e desempenho escolar</p>
                        </div>
                        <div class="flex gap-3">
                             <button class="btn btn-secondary" onclick="app.pedagogico.openRelatorios()">
                                <i class="ph-bold ph-chart-line-up"></i>
                                <span class="hidden md:inline">Indicadores</span>
                            </button>
                            <button class="btn btn-primary" onclick="app.pedagogico.openNovoDiario()">
                                <i class="ph-bold ph-book-open-text"></i>
                                <span>Registrar Aula</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Tabs -->
                <div class="tab-pills" style="margin-bottom: 2rem;">
                    ${this.renderTabButton('diarios', 'Meus Diários', 'ph-book-bookmark')}
                    ${this.renderTabButton('frequencia', 'Frequência', 'ph-check-circle')}
                    ${this.renderTabButton('avaliacoes', 'Avaliações & Notas', 'ph-exam')}
                    ${this.renderTabButton('desempenho', 'Desempenho', 'ph-chart-pie-slice')}
                </div>

                <!-- Tab Content -->
                <div id="pedagogico-content" class="min-h-[500px]">
                    ${this.renderCurrentTab(state)}
                </div>
            </div>
        `;
    },

    renderTabButton(id, label, icon) {
        const isActive = this.currentTab === id;
        return `
            <button onclick="app.pedagogico.setTab('${id}')" 
                class="tab-pill ${isActive ? 'active' : ''}">
                <i class="ph-bold ${icon}"></i>
                ${label}
            </button>
        `;
    },

    setTab(tab) {
        this.currentTab = tab;
        document.getElementById('content-area').innerHTML = this.render(app.state);
    },

    renderCurrentTab(state) {
        switch (this.currentTab) {
            case 'diarios': return this.renderDiariosView();
            case 'frequencia': return this.renderFrequenciaView();
            case 'avaliacoes': return this.renderAvaliacoesView();
            case 'desempenho': return this.renderDesempenhoView();
            default: return this.renderDiariosView();
        }
    },

    // --- VIEWS ---

    renderDiariosView() {
        return `
            <div class="space-y-6">
                <!-- Active Classes Grid -->
                <h3 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Suas Turmas Ativas</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${this.mocks.turmas.map(t => `
                        <div class="card p-0 overflow-hidden cursor-pointer group hover:ring-2 ring-indigo-500 transition-all shadow-sm hover:shadow-md">
                            <div class="h-2 bg-indigo-500"></div>
                            <div class="p-5">
                                <div class="flex justify-between items-start mb-3">
                                    <div class="badge bg-indigo-50 text-indigo-700 border-indigo-100">${t.turno}</div>
                                    <i class="ph-fill ph-dots-three-outline-vertical text-slate-300 hover:text-slate-600"></i>
                                </div>
                                <h4 class="font-bold text-slate-900 text-lg leading-tight mb-2 group-hover:text-indigo-600 transition-colors">${t.nome}</h4>
                                <p class="text-sm text-slate-500 mb-4 flex items-center gap-1">
                                    <i class="ph-bold ph-book-open"></i> ${t.uc}
                                </p>
                                
                                <div class="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <div class="text-xs text-slate-500">
                                        <strong class="text-slate-900 text-sm">${t.alunos}</strong> Alunos
                                    </div>
                                    <div class="text-xs text-slate-500">
                                        <strong class="text-slate-900 text-sm">${t.aulas_dadas}</strong> Aulas Reg.
                                    </div>
                                </div>
                            </div>
                            <div class="bg-slate-50 p-3 px-5 flex justify-between items-center group-hover:bg-indigo-50/50 transition-colors">
                                <span class="text-xs font-bold text-indigo-600 uppercase tracking-wide">Acessar Diário</span>
                                <i class="ph-bold ph-arrow-right text-indigo-400 group-hover:translate-x-1 transition-transform"></i>
                            </div>
                        </div>
                    `).join('')}
                    
                    <!-- Add Class Placeholder (if needed) -->
                    <!-- <div class="card p-6 border-dashed border-2 border-slate-200 flex flex-col items-center justify-center text-center text-slate-400 hover:text-indigo-500 hover:border-indigo-300 transition-all cursor-pointer">
                        <i class="ph-bold ph-plus-circle text-3xl mb-2"></i>
                        <span class="font-bold text-sm">Vincular Nova Turma</span>
                    </div> -->
                </div>

                <!-- Recent Logs -->
                <div class="mt-8">
                     <h3 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Registro Recente de Aulas</h3>
                     <div class="token-list">
                        ${this.mocks.aulas.map(aula => `
                            <div class="token-item">
                                <div class="token-icon ${aula.status === 'Registrada' ? 'green' : 'yellow'}">
                                    <i class="ph-bold ${aula.status === 'Registrada' ? 'ph-check' : 'ph-clock'}"></i>
                                </div>
                                <div class="token-info">
                                    <div class="token-name">${aula.conteudo}</div>
                                    <div class="token-meta">
                                        ${aula.data} • Técnico em Desenv. Sistemas
                                    </div>
                                </div>
                                <div class="flex items-center gap-3">
                                    <div class="badge ${aula.status === 'Registrada' ? 'badge-success' : 'badge-neutral'}">${aula.status}</div>
                                    <button class="btn btn-secondary text-xs py-1 px-3">
                                        <i class="ph-bold ph-pencil-simple"></i> Editar
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                     </div>
                </div>
            </div>
        `;
    },

    renderFrequenciaView() {
        return `
            <div class="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed text-center">
                 <div class="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <i class="ph-duotone ph-check-square-offset text-4xl"></i>
                </div>
                <h3 class="text-xl font-bold text-slate-900 mb-2">Chamada Digital</h3>
                <p class="text-slate-500 max-w-md mb-8">Selecione uma turma e aula para realizar o lançamento de frequência em lote ou individual.</p>
                <div class="flex gap-4">
                     <button class="btn btn-primary shadow-lg shadow-emerald-500/20 bg-emerald-600 border-emerald-600 hover:bg-emerald-700" onclick="ui.showToast('Selecione uma turma no Diário primeiro')">
                        <i class="ph-bold ph-list-checks"></i>
                        Iniciar Chamada
                    </button>
                    <button class="btn btn-secondary">
                        <i class="ph-bold ph-clock-counter-clockwise"></i>
                        Histórico
                    </button>
                </div>
            </div>
        `;
    },

    renderAvaliacoesView() {
        return `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                <!-- Config List -->
                <div class="lg:col-span-2 space-y-4">
                    <div class="flex-between mb-4">
                        <h3 class="text-slate-900 font-bold text-lg">Cronograma de Avaliações</h3>
                        <button class="btn btn-primary text-sm py-2 px-3">
                            <i class="ph-bold ph-plus"></i> Nova Avaliação
                        </button>
                    </div>
                    
                    <div class="token-list">
                        <div class="token-item group hover:border-indigo-300 cursor-pointer transition-all">
                             <div class="token-date flex flex-col items-center justify-center p-2 bg-indigo-50 rounded-lg text-indigo-700 min-w-[3.5rem]">
                                <span class="text-xs font-bold uppercase">Jan</span>
                                <span class="text-xl font-bold">15</span>
                             </div>
                             <div class="token-info ml-2">
                                <div class="token-name">Prova Teórica N1</div>
                                <div class="token-meta">Lógica de Programação • Peso 4.0</div>
                             </div>
                             <div class="badge badge-neutral">Agendada</div>
                        </div>

                         <div class="token-item group hover:border-indigo-300 cursor-pointer transition-all">
                             <div class="token-date flex flex-col items-center justify-center p-2 bg-orange-50 rounded-lg text-orange-700 min-w-[3.5rem]">
                                <span class="text-xs font-bold uppercase">Jan</span>
                                <span class="text-xl font-bold">28</span>
                             </div>
                             <div class="token-info ml-2">
                                <div class="token-name">Projeto Prático - Calculadora</div>
                                <div class="token-meta">Lógica de Programação • Peso 6.0</div>
                             </div>
                             <div class="badge badge-neutral">Planejada</div>
                        </div>
                    </div>
                </div>

                <!-- Stats Side -->
                <div class="card bg-slate-900 text-white p-6 relative overflow-hidden">
                    <div class="relative z-10">
                        <h4 class="font-bold text-lg mb-4">Notas Pendentes</h4>
                        <div class="flex items-center gap-4 mb-6">
                            <div class="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-white animate-spin"></div>
                            <div>
                                <div class="text-2xl font-bold">32</div>
                                <div class="text-xs text-slate-400">Alunos sem nota (N1)</div>
                            </div>
                        </div>
                        <button class="btn bg-white text-slate-900 hover:bg-slate-100 w-full font-bold">
                            Lançar Notas Agora
                        </button>
                    </div>
                     <div class="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500 blur-3xl rounded-full opacity-30"></div>
                </div>
            </div>
        `;
    },

    renderDesempenhoView() {
        return `
             <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="card p-6">
                    <div class="text-xs text-slate-500 font-bold uppercase mb-2">Média Geral da Turma</div>
                    <div class="text-4xl font-bold text-slate-900">7.8</div>
                    <div class="text-xs text-green-600 font-bold mt-2 flex items-center gap-1">
                        <i class="ph-bold ph-trend-up"></i> +0.4 vs mês anterior
                    </div>
                </div>
                <div class="card p-6">
                    <div class="text-xs text-slate-500 font-bold uppercase mb-2">Frequência Média</div>
                    <div class="text-4xl font-bold text-slate-900">92%</div>
                    <div class="text-xs text-slate-400 font-bold mt-2">Dentro da meta (85%)</div>
                </div>
                <div class="card p-6">
                    <div class="text-xs text-slate-500 font-bold uppercase mb-2">Alunos em Risco</div>
                    <div class="text-4xl font-bold text-amber-500">3</div>
                    <div class="text-xs text-amber-600 font-bold mt-2">Atenção requerida</div>
                </div>
                 <div class="card p-6 bg-indigo-600 text-white">
                    <div class="text-xs text-indigo-200 font-bold uppercase mb-2">Dias Letivos</div>
                    <div class="text-4xl font-bold">14/200</div>
                    <div class="w-full bg-indigo-800 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div class="bg-white h-full" style="width: 7%"></div>
                    </div>
                </div>
            </div>

            <div class="card p-8 text-center border-dashed border-2 border-slate-200">
                <i class="ph-duotone ph-chart-bar text-4xl text-slate-300 mb-4"></i>
                <p class="text-slate-500">Gráficos detahados de evolução de competências serão exibidos aqui.</p>
            </div>
        `;
    },

    // --- ACTIONS ---
    openNovoDiario() {
        ui.alert('Registro de Aula', 'O formulário de registro de conteúdo e metodologia será aberto aqui.');
    },

    openRelatorios() {
        ui.showToast('Gerando indicadores pedagógicos...');
    }
};

// Make it global
window.app = window.app || {};
window.app.pedagogico = pedagogico;
