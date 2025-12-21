
// modules/dashboard.js
// Modern Dashboard using the new Design System

export function renderDashboard(state) {
    const hour = new Date().getHours();
    const saudacao = hour < 12 ? 'Bom dia' : (hour < 18 ? 'Boa tarde' : 'Boa noite');

    // Safety check for arrays
    const teachers = state.teachers || [];
    const courses = state.courses || [];
    const classes = state.classes || [];

    const activeTeachers = teachers.filter(t => t.status === 'Ativo').length;
    const activeCourses = courses.filter(c => c.status === 'Ativo').length;
    const totalClasses = classes.length;

    // Estimate students (mock)
    const totalStudents = Math.floor(totalClasses * 25);

    // Random System Tips
    const tips = [
        "Mantenha os cadastros dos docentes atualizados para facilitar a alocação nas turmas e evitar conflitos de horário.",
        "Verifique regularmente a carga horária total das matrizes para garantir que projete a carga horária correta do curso.",
        "Utilize o Catálogo Global de UCs para padronizar disciplinas comuns entre diferentes cursos técnicos.",
        "Lembre-se de arquivar ou inativar matrizes antigas para manter a lista de seleção limpa e atualizada.",
        "Acompanhe o número de alunos matriculados versus a capacidade das turmas para otimizar o uso das salas.",
        "Cadastre as Áreas Tecnológicas corretamente nos cursos para filtrar os docentes especialistas com mais precisão."
    ];
    const randomTip = tips[Math.floor(Math.random() * tips.length)];

    return `
        <div class="animate-fade-in space-y-8 pb-10">
            <!-- Header -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900 tracking-tight" style="font-size: 1.8rem; font-weight: 700; color: var(--text-primary); margin:0;">${saudacao}, Coordenador</h1>
                    <p class="text-gray-500 mt-1 flex items-center gap-2" style="color: var(--text-secondary); margin-top: 0.25rem;">
                        <i class="ph ph-calendar-blank"></i>
                        ${window.dayjs().format('dddd, D [de] MMMM [de] YYYY')}
                    </p>
                </div>
                <div class="flex gap-3" style="display: flex; gap: 0.75rem;">
                    <button class="btn btn-secondary" onclick="app.refreshCurrentView()">
                        <i class="ph ph-arrows-clockwise text-lg"></i>
                    </button>
                    <button class="btn btn-primary shadow-lg" onclick="app.planejamento.openModalCurso()">
                        <i class="ph ph-plus-circle text-lg"></i>
                        <span>Novo Curso</span>
                    </button>
                </div>
            </div>

            <!-- KPI Cards -->
            <div class="grid-3" style="margin-bottom: 2rem;">
                <!-- Card 1 -->
                <div class="card p-6 border-l-4 hover:shadow-lg transition-shadow" onclick="app.planejamento.currentTab = 'turmas'; app.navigate('planejamento')" style="padding: 1.5rem; border-left: 4px solid #6366f1; position: relative; overflow: hidden; cursor: pointer;">
                    <div style="display:flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                        <div>
                            <p style="font-size: 0.75rem; font-weight: 700; color: #6366f1; text-transform: uppercase;">Alunos Matriculados</p>
                            <h3 style="font-size: 2.5rem; font-weight: 800; color: var(--text-primary); margin: 0.25rem 0 0;">${totalStudents}</h3>
                        </div>
                        <div style="padding: 0.75rem; background: #e0e7ff; border-radius: 12px; color: #4338ca;">
                             <i class="ph-fill ph-student text-2xl" style="font-size: 1.5rem;"></i>
                        </div>
                    </div>
                    <div style="display:flex; align-items: flex-end; font-size: 0.875rem; color: var(--text-secondary);">
                        <span style="color: #059669; font-weight: 700; background: #d1fae5; padding: 2px 6px; border-radius: 4px; margin-right: 0.5rem; display: flex; align-items: center; gap: 4px;">
                            <i class="ph-bold ph-trend-up"></i> 12%
                        </span>
                        <span>vs. mês anterior</span>
                    </div>
                </div>

                <!-- Card 2 -->
                <div class="card p-6 border-l-4 hover:shadow-lg transition-shadow" onclick="app.planejamento.currentTab = 'docentes'; app.navigate('planejamento')" style="padding: 1.5rem; border-left: 4px solid #a855f7; position: relative; overflow: hidden; cursor: pointer;">
                     <div style="display:flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                        <div>
                            <p style="font-size: 0.75rem; font-weight: 700; color: #a855f7; text-transform: uppercase;">Docentes Ativos</p>
                            <h3 style="font-size: 2.5rem; font-weight: 800; color: var(--text-primary); margin: 0.25rem 0 0;">${activeTeachers}</h3>
                        </div>
                        <div style="padding: 0.75rem; background: #f3e8ff; border-radius: 12px; color: #7e22ce;">
                             <i class="ph-fill ph-chalkboard-teacher text-2xl" style="font-size: 1.5rem;"></i>
                        </div>
                    </div>
                    <div style="font-size: 0.875rem; color: var(--text-secondary);">
                         <span style="font-weight: 600; color: var(--text-primary);">${teachers.length}</span> cadastrados no total
                    </div>
                </div>

                <!-- Card 3 -->
                <div class="card p-6 border-l-4 hover:shadow-lg transition-shadow" onclick="app.planejamento.currentTab = 'cursos'; app.navigate('planejamento')" style="padding: 1.5rem; border-left: 4px solid #10b981; position: relative; overflow: hidden; cursor: pointer;">
                     <div style="display:flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                        <div>
                            <p style="font-size: 0.75rem; font-weight: 700; color: #10b981; text-transform: uppercase;">Turmas / Classes</p>
                            <h3 style="font-size: 2.5rem; font-weight: 800; color: var(--text-primary); margin: 0.25rem 0 0;">${totalClasses}</h3>
                        </div>
                        <div style="padding: 0.75rem; background: #d1fae5; border-radius: 12px; color: #047857;">
                             <i class="ph-fill ph-users-three text-2xl" style="font-size: 1.5rem;"></i>
                        </div>
                    </div>
                     <div style="font-size: 0.875rem; color: var(--text-secondary);">
                        <span style="font-weight: 600; color: var(--text-primary);">${activeCourses}</span> cursos ativos na grade
                    </div>
                </div>
            </div>

            <!-- Content Split Grid -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                
                <!-- Main Activity (Left) -->
                <div style="flex: 2; min-width: 0;"> 
                    <!-- Using flex: 2 logic via grid-column if possible, sticking to simple grid for safety -->
                    
                    <div class="flex-between" style="margin-bottom: 1rem;">
                        <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
                            <i class="ph-duotone ph-clock" style="color: #3b82f6;"></i> Atividades Recentes
                        </h3>
                    </div>
                    
                    <div class="card" style="overflow: hidden;">
                        ${classes.slice(0, 5).map(t => `
                            <div style="padding: 1rem; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 1rem; cursor: pointer; transition: background 0.2s;" 
                                 onclick="app.navigate('planejamento')" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                                <div style="width: 40px; height: 40px; border-radius: 50%; background: #eff6ff; color: #2563eb; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem;">
                                    ${t.codigo_sge.substring(0, 2)}
                                </div>
                                <div style="flex: 1;">
                                    <h4 style="font-weight: 700; font-size: 0.9rem; color: var(--text-primary); margin:0;">${t.codigo_sge}</h4>
                                    <p style="font-size: 0.8rem; color: var(--text-secondary); margin:0;">${t.cursos?.nome || 'Curso não informado'}</p>
                                </div>
                                <div style="text-align: right;">
                                    <span class="badge ${t.turno === 'Noite' ? 'badge-primary' : 'badge-warning'}">${t.turno}</span>
                                    <div style="font-size: 0.65rem; color: var(--text-secondary); margin-top: 4px;">Atualizado hoje</div>
                                </div>
                                <i class="ph ph-caret-right" style="color: #cbd5e1;"></i>
                            </div>
                        `).join('') || '<div style="padding: 2rem; text-align: center; color: var(--text-secondary);">Nenhuma atividade recente.</div>'}
                        
                        <div style="padding: 0.75rem; background: #f8fafc; text-align: center; border-top: 1px solid var(--border);">
                            <button onclick="app.planejamento.currentTab = 'turmas'; app.navigate('planejamento')" style="font-size: 0.75rem; font-weight: 700; color: #2563eb; text-transform: uppercase;">
                                Ver todas as turmas
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions (Right) -->
                <div style="flex: 1; display: flex; flex-direction: column; gap: 1.5rem;">
                    <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary);">Acesso Rápido</h3>
                    
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        <button onclick="app.planejamento.currentTab = 'ucs'; app.navigate('planejamento')" class="card hover-scale" style="text-align: left; padding: 1rem; display: flex; align-items: center; gap: 1rem; border: 1px solid transparent; transition: all 0.2s;">
                             <div style="padding: 0.5rem; background: #eff6ff; border-radius: 8px; color: #2563eb;">
                                <i class="ph-bold ph-book-open" style="font-size: 1.25rem;"></i>
                             </div>
                             <div>
                                <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-primary);">Catálogo de UCs</div>
                                <div style="font-size: 0.75rem; color: var(--text-secondary);">Consultar e gerenciar disciplinas</div>
                             </div>
                        </button>

                         <button onclick="app.planejamento.currentTab = 'docentes'; app.navigate('planejamento')" class="card hover-scale" style="text-align: left; padding: 1rem; display: flex; align-items: center; gap: 1rem; border: 1px solid transparent; transition: all 0.2s;">
                             <div style="padding: 0.5rem; background: #f3e8ff; border-radius: 8px; color: #7e22ce;">
                                <i class="ph-bold ph-users-three" style="font-size: 1.25rem;"></i>
                             </div>
                             <div>
                                <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-primary);">Gestão de Docentes</div>
                                <div style="font-size: 0.75rem; color: var(--text-secondary);">Visualizar corpo docente</div>
                             </div>
                        </button>
                        
                        <!-- Insight Card -->
                        <div style="padding: 1.5rem; background: linear-gradient(135deg, #1e293b, #0f172a); border-radius: 12px; color: white; position: relative; overflow: hidden; margin-top: 1rem;">
                            <i class="ph-fill ph-lightbulb" style="position: absolute; right: -10px; bottom: -10px; font-size: 5rem; opacity: 0.1; color: #facc15;"></i>
                            <h4 style="font-weight: 700; font-size: 1rem; margin-bottom: 0.5rem; position: relative; z-index: 2;">Dica do Sistema</h4>
                            <p style="font-size: 0.85rem; color: #cbd5e1; margin-bottom: 1rem; line-height: 1.4; position: relative; z-index: 2;">
                                ${randomTip}
                            </p>
                            <button style="font-size: 0.75rem; font-weight: 700; background: rgba(255,255,255,0.1); padding: 4px 12px; border-radius: 4px; color: white; border: none; cursor: pointer;">
                                Saiba mais
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}
