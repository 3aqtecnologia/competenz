
import { supabase } from './services/supabase.js';
import { auth } from './services/auth.js';
import { renderDashboard } from './modules/dashboard.js';
import { planejamento } from './modules/planejamento.js';
import { matrizesView } from './modules/matrizesView.js';
import { docentes } from './modules/docentes.js';
import { docentesView } from './modules/docentesView.js';
import { turmas } from './modules/turmas.js';
import { turmasView } from './modules/turmasView.js';
import { ambientes } from './modules/ambientes.js?v=3';
import { alocacaoAmbientes } from './modules/alocacaoAmbientes.js';
import { usuarios } from './modules/usuarios.js';
import { configuracoes } from './modules/configuracoes.js';
import { secretaria } from './modules/secretaria.js';
import { pedagogico } from './modules/pedagogico.js';
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
            areasTecnologicas: [],
            // User & Auth
            currentUser: null,
            currentProfile: null
        };

        // Modules Registry
        this.planejamento = planejamento;
        // this.matrizes = matrizes; // (Service)
        this.matrizesView = matrizesView; // (UI Controller)
        this.docentes = docentes;
        this.docentesView = docentesView;
        this.turmas = turmas;
        this.turmasView = turmasView;
        this.turmasView = turmasView;
        this.ambientes = ambientes;
        this.alocacaoAmbientes = alocacaoAmbientes;
        this.usuarios = usuarios;
        this.configuracoes = configuracoes;
        this.secretaria = secretaria;
        this.pedagogico = pedagogico;
        this.dashboard = { render: renderDashboard }; // Adapter

        // Expose UI helper globally for HTML onclick events
        window.ui = ui;
        window.auth = auth;
    }

    async init() {
        console.log('Competenz App Initializing...');

        // Verificar autenticação
        const isAuthenticated = await auth.init();

        if (!isAuthenticated) {
            console.log('Usuário não autenticado, redirecionando para login...');
            window.location.href = 'login.html';
            return;
        }

        // Carregar dados do usuário no state
        this.state.currentUser = auth.getCurrentUser();
        this.state.currentProfile = auth.getCurrentProfile();

        console.log('Usuário autenticado:', this.state.currentUser.nome_completo);
        console.log('Perfil:', this.state.currentProfile.nome);

        // Renderizar informações do usuário no header
        this.renderUserInfo();

        await this.refreshData();
        this.navigate('dashboard');
    }


    /* === USER INFO === */
    renderUserInfo() {
        const user = this.state.currentUser;
        const profile = this.state.currentProfile;

        if (!user || !profile) return;

        const avatarEl = document.getElementById('userAvatar');
        const userAvatarUrl = user.avatar_url || user.metadata?.avatar_url;

        if (userAvatarUrl) {
            // Renderizar Imagem
            avatarEl.innerHTML = `<img src="${userAvatarUrl}" alt="${user.nome_completo}" class="w-full h-full rounded-full object-cover">`;
            // Remover classes de inicial se necessário, mas imagem cobre o fundo
        } else {
            // Renderizar Iniciais
            const initials = user.nome_completo
                .split(' ')
                .map(n => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

            avatarEl.innerHTML = initials;
        }

        document.getElementById('userName').textContent = user.nome_completo;
        document.getElementById('userRole').textContent = profile.nome;

        // Mas se quisermos acessar a IMAGEM especificamente de fora:
        const img = avatarEl.querySelector('img');
        if (img) img.id = 'header-user-avatar';
    }

    /* === LOGOUT === */
    async logout() {
        if (!confirm('Deseja realmente sair do sistema?')) {
            return;
        }

        const result = await auth.logout();

        if (result.success) {
            window.location.href = 'login.html';
        } else {
            ui.toast('Erro ao fazer logout', 'error');
        }
    }

    /* === USER MENU === */
    showUserMenu() {
        // Redirecionar para o módulo de configurações
        this.navigate('configuracoes');
    }


    /* === DATA LAYER === */
    async refreshData() {
        this.state.isLoading = true;
        try {
            console.log('Fetching global data...');
            const [c, m, d, t, a] = await Promise.all([
                supabase.from('cursos').select('*'),
                supabase.from('matrizes').select('*'), // Removed outdated join
                // Fetch Docentes with Areas Relation
                supabase.from('docentes').select(`
                    *,
                    docentes_areas (
                        area_id,
                        areas_tecnologicas (nome)
                    )
                `).order('nome'),
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
        // Update Sidebar UI with Toggle Logic
        document.querySelectorAll('.nav-item').forEach(el => {
            const onClick = el.getAttribute('onclick');
            // Loose match to catch simple string usage
            const isMatch = onClick && onClick.includes(`navigate('${viewName}')`);

            if (isMatch) {
                if (el.classList.contains('active')) {
                    el.classList.toggle('collapsed');
                } else {
                    el.classList.remove('collapsed');
                    el.classList.add('active');
                }
            } else {
                el.classList.remove('active');
                el.classList.remove('collapsed');
            }
        });

        this.state.view = viewName;

        // Close Mobile Menu if open
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && sidebar.classList.contains('menu-open')) {
            sidebar.classList.remove('menu-open');
        }

        this.renderView(viewName);
    }

    navigateToTab(viewName, tabName) {
        // 1. Update Module State to ensure correct initial render
        if (this[viewName]) {
            this[viewName].currentTab = tabName;
        }

        // 2. Perform Main Navigation or Content Refresh
        if (this.state.view !== viewName) {
            this.navigate(viewName);
        } else {
            this.renderView(viewName);
        }

        // 3. Highlight Sub-Item
        document.querySelectorAll('.nav-sub-item').forEach(el => {
            el.classList.remove('active');
            if (el.getAttribute('onclick')?.includes(`'${tabName}'`)) {
                el.classList.add('active');
            }
        });
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
                    html = secretaria.render(this.state);
                    break;
                case 'pedagogico':
                    html = pedagogico.render(this.state);
                    break;
                case 'alocacaoAmbientes':
                    html = alocacaoAmbientes.render(this.state);
                    break;
                case 'usuarios':
                    html = usuarios.render();
                    break;
                case 'configuracoes':
                    html = configuracoes.render(this.state);
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
