import { supabase } from '../services/supabase.js';
import { ui } from '../utils/ui.js';

export const planejamento = {
    currentTab: 'cursos',

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
                            class="planejamento-tab " 
                            data-tab="cursos">
                            <i class="ph ph-books"></i>
                            <span>Cursos & Matrizes</span>
                        </button>
                        <button onclick="app.planejamento.switchTab('docentes')" 
                            class="planejamento-tab " 
                            data-tab="docentes">
                            <i class="ph ph-chalkboard-teacher"></i>
                            <span>Docentes</span>
                        </button>
                        <button onclick="app.planejamento.switchTab('turmas')" 
                            class="planejamento-tab " 
                            data-tab="turmas">
                            <i class="ph ph-users-three"></i>
                            <span>Turmas & Lotação</span>
                        </button>
                    </nav>
                </div>

                <!-- Tab Content -->
                <div id="planejamento-content">
                    
                </div>
            </div>
        `;
    }
};
