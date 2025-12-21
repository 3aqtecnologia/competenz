
import { supabase } from './services/supabase.js';
import { renderDashboard } from './modules/dashboard.js';
import { planejamento } from './modules/planejamento.js';
import { matrizesView } from './modules/matrizesView.js';
// import { secretaria } from './modules/secretaria.js'; // Will enable later
// import { pedagogico } from './modules/pedagogico.js'; // Will enable later
import { ui } from './utils/ui.js';

class App {
    constructor() {
        this.state = {
            view: 'dashboard',
            isLoading: false,
            // Centralized Data Store
            courses: [],
            matrices: [],
            teachers: [],
            classes: [],
            areasTecnologicas: []
        };

        // Modules Registry
        this.planejamento = planejamento;
        // this.matrizes = matrizes; // (Service)
        this.matrizesView = matrizesView; // (UI Controller)
        this.dashboard = { render: renderDashboard }; // Adapter

        // Expose UI helper globally for HTML onclick events
        window.ui = ui;
    }

    async init() {
        console.log('Competenz App Initializing...');
        await this.refreshData();
        this.navigate('dashboard');
    }

    /* === DATA LAYER === */
    async refreshData() {
        this.state.isLoading = true;
        try {
            console.log('Fetching global data...');
            const [c, m, d, t, a] = await Promise.all([
                supabase.from('cursos').select('*'),
                supabase.from('matrizes').select('*'), // Removed outdated join
                supabase.from('docentes').select('*'),
                supabase.from('turmas').select('*, cursos(nome), matrizes(codigo)'),
                supabase.from('areas_tecnologicas').select('*').eq('ativo', true).order('nome')
            ]);

            this.state.courses = c.data || [];
            this.state.matrices = m.data || [];
            this.state.teachers = d.data || [];
            this.state.classes = t.data || [];
            this.state.areasTecnologicas = a.data || [];
            // this.state.allUCs removed (was using deprecated relation for calc)

            console.log('Data loaded:', this.state);
        } catch (error) {
            console.error('Critical Error loading data:', error);
            ui.toast('Erro de conexão. Tente recarregar.', 'error');
        } finally {
            this.state.isLoading = false;
        }
    }

    /* === DATA REFRESHER (For Actions) === */
    async refreshCurrentView() {
        await this.refreshData();
        this.renderView(this.state.view);
    }

    /* === NAVIGATION === */
    navigate(viewName) {
        this.state.view = viewName;

        // Update Sidebar UI
        document.querySelectorAll('.nav-item').forEach(el => {
            el.classList.remove('active');
            if (el.getAttribute('onclick')?.includes(viewName)) {
                el.classList.add('active');
            }
        });

        // Close Mobile Menu if open
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && sidebar.classList.contains('menu-open')) {
            sidebar.classList.remove('menu-open');
        }

        this.renderView(viewName);
    }

    renderView(viewName) {
        const container = document.getElementById('content-area');

        // Show loading if data is empty (first load)
        if (this.state.isLoading) {
            container.innerHTML = '<div class="loading-spinner"></div>';
            return;
        }

        let html = '';
        try {
            switch (viewName) {
                case 'dashboard':
                    html = renderDashboard(this.state);
                    break;
                case 'planejamento':
                    html = planejamento.render(this.state);
                    break;
                case 'secretaria':
                    html = '<div class="card p-10 text-center text-gray-400">Módulo Secretaria em breve...</div>';
                    // html = secretaria.render(this.state);
                    break;
                case 'pedagogico':
                    html = '<div class="card p-10 text-center text-gray-400">Módulo Pedagógico em breve...</div>';
                    // html = pedagogico.render(this.state);
                    break;
                default:
                    html = `
                        <div class="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
                            <i class="ph ph-warning text-4xl"></i>
                            <h2 class="text-xl font-bold">Página não encontrada</h2>
                        </div>
                    `;
            }
            container.innerHTML = html;
        } catch (err) {
            console.error(`Error rendering view ${viewName}:`, err);
            container.innerHTML = `<div class="card p-6 border-red-200 bg-red-50 text-red-800">Erro ao renderizar tela: ${err.message}</div>`;
        }
    }
}

// Initialize Global App
const app = new App();
window.app = app;
app.init();
