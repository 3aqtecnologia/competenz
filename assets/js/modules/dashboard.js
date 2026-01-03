
// modules/dashboard.js
// Modern Dashboard using the new Design System
import { auth } from '../services/auth.js';

export function renderDashboard(state) {
    const hour = new Date().getHours();
    const saudacao = hour < 12 ? 'Bom dia' : (hour < 18 ? 'Boa tarde' : 'Boa noite');

    // Auth Context
    const profileName = auth.currentProfile?.nome || 'Usuário';
    const userName = auth.currentUser?.nome?.split(' ')[0] || '';
    const displayName = profileName; // Use Profile Name as the main role indicator

    // Data Safety
    const teachers = state.teachers || [];
    const courses = state.courses || [];
    const classes = state.classes || [];

    // --- LOGIC PER PROFILE ---
    const isDocente = profileName.toLowerCase().includes('docente') || profileName.toLowerCase().includes('professor');
    const isSecretaria = profileName.toLowerCase().includes('secretaria');
    const isAdmin = !isDocente && !isSecretaria; // Coord or Admin

    // 1. CONTENT GENERATION
    let kpiCards = '';
    let quickActions = '';
    let tipsContent = '';
    let mainActivityTitle = 'Atividades Recentes';

    // --- ADMIN / COORDENADOR VIEW ---
    if (isAdmin) {
        const activeTeachers = teachers.filter(t => t.status === 'Ativo').length;
        const activeCourses = courses.filter(c => c.status === 'Ativo').length;
        const totalClasses = classes.length;
        const totalStudents = Math.floor(totalClasses * 25); // Mock estimation

        kpiCards = `
            <div class="grid-3" style="margin-bottom: 2rem;">
                <!-- Alunos -->
                <div class="card p-6 border-l-4 hover:shadow-lg transition-shadow" onclick="app.planejamento.currentTab = 'turmas'; app.navigate('planejamento')" style="padding: 1.5rem; border-left: 4px solid #6366f1; cursor: pointer;">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <p class="text-xs font-bold text-indigo-500 uppercase">Alunos Matriculados</p>
                            <h3 class="text-4xl font-extrabold text-slate-800 mt-1">${totalStudents}</h3>
                        </div>
                        <div class="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                             <i class="ph-fill ph-student text-2xl"></i>
                        </div>
                    </div>
                    <div class="flex items-center text-sm text-slate-500">
                        <span class="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded mr-2 flex items-center gap-1">
                            <i class="ph-bold ph-trend-up"></i> 12%
                        </span>
                        <span>vs. mês anterior</span>
                    </div>
                </div>

                <!-- Docentes -->
                <div class="card p-6 border-l-4 hover:shadow-lg transition-shadow" onclick="app.planejamento.currentTab = 'docentes'; app.navigate('planejamento')" style="padding: 1.5rem; border-left: 4px solid #a855f7; cursor: pointer;">
                     <div class="flex justify-between items-start mb-4">
                        <div>
                            <p class="text-xs font-bold text-purple-500 uppercase">Docentes Ativos</p>
                            <h3 class="text-4xl font-extrabold text-slate-800 mt-1">${activeTeachers}</h3>
                        </div>
                        <div class="p-3 bg-purple-50 rounded-xl text-purple-600">
                             <i class="ph-fill ph-chalkboard-teacher text-2xl"></i>
                        </div>
                    </div>
                    <div class="text-sm text-slate-500">
                         <span class="font-bold text-slate-700">${teachers.length}</span> cadastrados no total
                    </div>
                </div>

                <!-- Turmas -->
                <div class="card p-6 border-l-4 hover:shadow-lg transition-shadow" onclick="app.planejamento.currentTab = 'cursos'; app.navigate('planejamento')" style="padding: 1.5rem; border-left: 4px solid #10b981; cursor: pointer;">
                     <div class="flex justify-between items-start mb-4">
                        <div>
                            <p class="text-xs font-bold text-emerald-500 uppercase">Turmas / Classes</p>
                            <h3 class="text-4xl font-extrabold text-slate-800 mt-1">${totalClasses}</h3>
                        </div>
                        <div class="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                             <i class="ph-fill ph-users-three text-2xl"></i>
                        </div>
                    </div>
                     <div class="text-sm text-slate-500">
                        <span class="font-bold text-slate-700">${activeCourses}</span> cursos ativos na grade
                    </div>
                </div>
            </div>`;

        quickActions = `
             <button onclick="app.planejamento.currentTab = 'ucs'; app.navigate('planejamento')" class="card hover-scale w-full text-left p-4 flex items-center gap-4 transition-all">
                 <div class="p-3 bg-blue-50 rounded-lg text-blue-600">
                    <i class="ph-bold ph-book-open text-xl"></i>
                 </div>
                 <div>
                    <div class="font-bold text-slate-800">Catálogo de UCs</div>
                    <div class="text-xs text-slate-500">Consultar e gerenciar disciplinas</div>
                 </div>
            </button>

             <button onclick="app.planejamento.currentTab = 'docentes'; app.navigate('planejamento')" class="card hover-scale w-full text-left p-4 flex items-center gap-4 transition-all">
                 <div class="p-3 bg-purple-50 rounded-lg text-purple-600">
                    <i class="ph-bold ph-users-three text-xl"></i>
                 </div>
                 <div>
                    <div class="font-bold text-slate-800">Gestão de Docentes</div>
                    <div class="text-xs text-slate-500">Visualizar corpo docente</div>
                 </div>
            </button>`;

        const tips = [
            "Mantenha os cadastros dos docentes atualizados para facilitar a alocação.",
            "Verifique regularmente a carga horária total das matrizes.",
            "Utilize o Catálogo Global de UCs para padronizar disciplinas."
        ];
        const randomTip = tips[Math.floor(Math.random() * tips.length)];

        tipsContent = `
            <div class="p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl text-white relative overflow-hidden mt-4">
                <i class="ph-fill ph-lightbulb absolute -right-2 -bottom-2 text-[5rem] opacity-10 text-yellow-400"></i>
                <h4 class="font-bold text-base mb-2 relative z-10">Dica de Gestão</h4>
                <p class="text-sm text-slate-300 mb-4 leading-relaxed relative z-10">${randomTip}</p>
                <button class="text-xs font-bold bg-white/10 px-3 py-1 rounded text-white relative z-10">Ver todas</button>
            </div>
        `;
    }

    // --- DOCENTE VIEW ---
    else if (isDocente) {
        mainActivityTitle = 'Minhas Aulas';
        // Mock data for teacher
        kpiCards = `
            <div class="grid-3" style="margin-bottom: 2rem;">
                <div class="card p-6 border-l-4 border-blue-500">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-xs font-bold text-blue-500 uppercase">Aulas Hoje</p>
                            <h3 class="text-4xl font-extrabold text-slate-800 mt-1">4</h3>
                        </div>
                        <div class="p-3 bg-blue-50 rounded-xl text-blue-600"><i class="ph-fill ph-chalkboard text-2xl"></i></div>
                    </div>
                </div>
                <div class="card p-6 border-l-4 border-orange-500">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-xs font-bold text-orange-500 uppercase">Turmas Ativas</p>
                            <h3 class="text-4xl font-extrabold text-slate-800 mt-1">3</h3>
                        </div>
                        <div class="p-3 bg-orange-50 rounded-xl text-orange-600"><i class="ph-fill ph-users text-2xl"></i></div>
                    </div>
                </div>
                <div class="card p-6 border-l-4 border-green-500">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-xs font-bold text-green-500 uppercase">Diários Pendentes</p>
                            <h3 class="text-4xl font-extrabold text-slate-800 mt-1">0</h3>
                        </div>
                        <div class="p-3 bg-green-50 rounded-xl text-green-600"><i class="ph-fill ph-check-circle text-2xl"></i></div>
                    </div>
                </div>
            </div>
        `;

        quickActions = `
             <button class="card hover-scale w-full text-left p-4 flex items-center gap-4 transition-all">
                 <div class="p-3 bg-blue-50 rounded-lg text-blue-600"><i class="ph-bold ph-calendar-check text-xl"></i></div>
                 <div><div class="font-bold text-slate-800">Meus Horários</div><div class="text-xs text-slate-500">Grade curricular</div></div>
            </button>
             <button class="card hover-scale w-full text-left p-4 flex items-center gap-4 transition-all">
                 <div class="p-3 bg-orange-50 rounded-lg text-orange-600"><i class="ph-bold ph-notebook text-xl"></i></div>
                 <div><div class="font-bold text-slate-800">Lançar Conteúdo</div><div class="text-xs text-slate-500">Registro de aulas</div></div>
            </button>`;

        tipsContent = `
            <div class="p-6 bg-gradient-to-br from-indigo-800 to-indigo-900 rounded-xl text-white relative overflow-hidden mt-4">
                <h4 class="font-bold text-base mb-2 relative z-10">Lembrete</h4>
                <p class="text-sm text-indigo-200 mb-0 leading-relaxed relative z-10">O prazo para lançamento de notas da AV1 encerra em <strong>5 dias</strong>.</p>
            </div>
        `;
    }

    // --- SECRETARIA VIEW ---
    else if (isSecretaria) {
        kpiCards = `
            <div class="grid-3" style="margin-bottom: 2rem;">
                <div class="card p-6 border-l-4 border-pink-500">
                    <div class="flex justify-between items-start">
                        <div><p class="text-xs font-bold text-pink-500 uppercase">Novas Matrículas</p><h3 class="text-4xl font-extrabold text-slate-800 mt-1">12</h3></div>
                        <div class="p-3 bg-pink-50 rounded-xl text-pink-600"><i class="ph-fill ph-user-plus text-2xl"></i></div>
                    </div>
                </div>
                <!-- More secretaria cards... -->
            </div>
        `;
        quickActions = `
             <button class="card hover-scale w-full text-left p-4 flex items-center gap-4 transition-all">
                 <div class="p-3 bg-pink-50 rounded-lg text-pink-600"><i class="ph-bold ph-student text-xl"></i></div>
                 <div><div class="font-bold text-slate-800">Novo Aluno</div><div class="text-xs text-slate-500">Realizar matrícula</div></div>
            </button>`;
    }

    return `
        <div class="animate-fade-in space-y-8 pb-10">
            <!-- Header -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6 mb-6">
                <div>
                    <h1 class="text-3xl font-bold text-slate-900 tracking-tight">
                        ${saudacao}, <span class="text-indigo-600">${displayName}</span>
                    </h1>
                    <p class="text-slate-500 mt-1 flex items-center gap-2 text-sm font-medium">
                        <i class="ph ph-calendar-blank"></i>
                        ${window.dayjs().format('dddd, D [de] MMMM [de] YYYY')}
                    </p>
                </div>
                <div class="flex gap-3">
                    <button class="btn btn-secondary bg-white shadow-sm hover:shadow-md" onclick="app.refreshCurrentView()" title="Atualizar">
                        <i class="ph ph-arrows-clockwise text-lg"></i>
                    </button>
                    ${isAdmin ? `
                    <button class="btn btn-primary shadow-lg bg-indigo-600 hover:bg-indigo-700 border-none" onclick="app.planejamento.openModalCurso()">
                        <i class="ph ph-plus-circle text-lg"></i>
                        <span>Novo Curso</span>
                    </button>` : ''}
                </div>
            </div>

            <!-- Dynamic KPI Cards -->
            ${kpiCards}

            <!-- Content Split Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <!-- Main Activity (Left - 2cols) -->
                <div class="lg:col-span-2 space-y-6"> 
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <i class="ph-duotone ph-clock text-indigo-500"></i> ${mainActivityTitle}
                        </h3>
                    </div>
                    
                    <div class="card overflow-hidden bg-white shadow-sm border border-slate-200 rounded-xl">
                        ${classes.slice(0, 5).map(t => `
                            <div class="p-4 border-b border-gray-100 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors" 
                                 onclick="app.navigate('planejamento')">
                                <div class="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                                    ${(t.codigo_sge || '??').substring(0, 2)}
                                </div>
                                <div class="flex-1 min-w-0">
                                    <h4 class="font-bold text-sm text-slate-800 truncate">${t.nome}</h4>
                                    <p class="text-xs text-slate-500 truncate">${t.cursos?.nome || 'Curso não informado'}</p>
                                </div>
                                <div class="text-right shrink-0">
                                    <span class="badge ${t.turno === 'Noite' ? 'badge-primary' : 'badge-warning'} scale-90 origin-right">${t.turno}</span>
                                    <div class="text-[10px] text-slate-400 mt-1">Atualizado hoje</div>
                                </div>
                                <i class="ph ph-caret-right text-slate-300"></i>
                            </div>
                        `).join('') || '<div class="p-8 text-center text-slate-400">Nenhuma atividade recente.</div>'}
                        
                        <div class="p-3 bg-slate-50 text-center border-t border-gray-100">
                            <button onclick="app.planejamento.currentTab = 'turmas'; app.navigate('planejamento')" class="text-xs font-bold text-indigo-600 uppercase hover:underline">
                                Ver todas as turmas
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions (Right - 1col) -->
                <div class="space-y-6">
                    <h3 class="text-lg font-bold text-slate-800">Acesso Rápido</h3>
                    
                    <div class="flex flex-col gap-3">
                        ${quickActions}
                        ${tipsContent}
                    </div>
                </div>
            </div>
        </div>
    `;
}
