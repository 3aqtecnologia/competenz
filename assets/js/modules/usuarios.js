/**
 * Módulo de Gestão de Usuários - UI/UX Aprimorada
 * Interface moderna com Tailwind CSS mantendo identidade visual
 */

import { supabase } from '../services/supabase.js';
import { auth } from '../services/auth.js';
import { ui } from '../utils/ui.js';

const AVAILABLE_PERMISSIONS = {
    'dashboard': ['visualizar'],
    'secretaria': ['visualizar', 'criar', 'editar', 'excluir'],
    'pedagogico': ['visualizar', 'criar', 'editar'],
    'planejamento': ['visualizar', 'criar', 'editar', 'excluir'],
    'usuarios': ['visualizar', 'criar', 'editar', 'excluir'],
    'perfis': ['visualizar', 'criar', 'editar', 'excluir'],
    'turmas': ['visualizar', 'criar', 'editar', 'excluir', 'visualizar_vinculadas', 'visualizar_por_docente'],
    'docentes': ['visualizar', 'criar', 'editar', 'visualizar_vinculados'],
    'alunos': ['visualizar', 'criar', 'editar', 'excluir'],
    'ambientes': ['visualizar', 'criar', 'editar', 'excluir'],
    'cursos': ['visualizar', 'criar', 'editar', 'excluir'],
    'matrizes': ['visualizar', 'criar', 'editar', 'excluir'],
    'frequencia': ['visualizar', 'criar', 'editar', 'enviar']
};

export const usuarios = {
    currentTab: 'lista',
    usuarios: [],
    perfis: [],
    turmas: [],
    docentes: [],
    searchTerm: '',
    filterPerfil: '',
    filterStatus: '',

    async init() {
        await this.loadData();
    },

    async loadData() {
        try {
            const [u, p, t, d] = await Promise.all([
                supabase.from('usuarios').select(`
                    *,
                    perfis (nome, descricao)
                `).order('nome_completo'),
                supabase.from('perfis').select('*').order('nome'),
                supabase.from('turmas').select('id, codigo, nome').order('codigo'),
                supabase.from('docentes').select('id, nome').order('nome')
            ]);

            this.usuarios = u.data || [];
            this.perfis = p.data || [];
            this.turmas = t.data || [];
            this.docentes = d.data || [];
        } catch (error) {
            console.error('Erro ao carregar dados de usuários:', error);
            ui.toast('Erro ao carregar usuários', 'error');
        }
    },

    render() {
        // Verificar permissão
        if (!auth.hasPermission('usuarios', 'visualizar')) {
            return `
                <div class="flex flex-col items-center justify-center py-16">
                    <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <i class="ph ph-lock text-4xl text-red-600"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">Acesso Negado</h3>
                    <p class="text-gray-600 text-center max-w-md">
                        Você não tem permissão para acessar o módulo de gestão de usuários.
                    </p>
                </div>
            `;
        }

        return `
            <div class="animate-fade-in">
                <!-- Inner Section Header -->
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                         <h3 class="input-label" style="font-size: 1.25rem; margin-bottom: 0.25rem;">Gestão de Acessos</h3>
                         <p class="token-meta">Administre usuários, perfis e permissões da plataforma</p>
                    </div>
                ${this.currentTab === 'lista' && auth.hasPermission('usuarios', 'criar') ? `
                    <button onclick="usuarios.showCreateModal()" class="btn btn-primary">
                        <i class="ph ph-plus-circle"></i> Novo Usuário
                    </button>
                ` : ''}

                ${this.currentTab === 'perfis' && auth.hasPermission('perfis', 'criar') ? `
                    <button onclick="usuarios.showCreatePerfilModal()" class="btn btn-primary">
                        <i class="ph ph-plus-circle"></i> Novo Perfil
                    </button>
                ` : ''}
                </div>

                <!-- Inner Tabs (Sub-navigation) -->
                <div class="mb-6 border-b border-gray-200">
                    <nav class="flex gap-6">
                        <button 
                            onclick="usuarios.switchTab('lista')"
                            class="pb-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${this.currentTab === 'lista'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }"
                        >
                            <i class="ph ph-users"></i>
                            Lista de Usuários
                        </button>
                        <button 
                            onclick="usuarios.switchTab('perfis')"
                            class="pb-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${this.currentTab === 'perfis'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }"
                        >
                            <i class="ph ph-shield-check"></i>
                            Perfis de Acesso
                        </button>
                    </nav>
                </div>

                <!-- Content -->
                <div>
                    ${this.currentTab === 'lista' ? this.renderUsuariosList() : this.renderPerfisList()}
                </div>
            </div>
        `;
    },

    renderUsuariosList() {
        const filteredUsers = this.getFilteredUsers();
        const activeUsers = this.usuarios.filter(u => u.ativo).length;
        const totalUsers = this.usuarios.length;
        const perfisCount = this.perfis.length;

        return `
            <!-- Stats Row -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="card p-6 flex items-center justify-between bg-gradient-to-br from-white to-purple-50 hover:shadow-md transition-shadow">
                    <div>
                        <p class="text-sm font-medium text-gray-500 mb-1">Total de Usuários</p>
                        <h3 class="text-3xl font-bold text-gray-800">${totalUsers}</h3>
                    </div>
                    <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                        <i class="ph-fill ph-users text-2xl"></i>
                    </div>
                </div>
                
                <div class="card p-6 flex items-center justify-between bg-gradient-to-br from-white to-green-50 hover:shadow-md transition-shadow">
                    <div>
                        <p class="text-sm font-medium text-gray-500 mb-1">Usuários Ativos</p>
                        <h3 class="text-3xl font-bold text-gray-800">${activeUsers}</h3>
                    </div>
                    <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                        <i class="ph-fill ph-check-circle text-2xl"></i>
                    </div>
                </div>

                <div class="card p-6 flex items-center justify-between bg-gradient-to-br from-white to-blue-50 hover:shadow-md transition-shadow">
                    <div>
                        <p class="text-sm font-medium text-gray-500 mb-1">Perfis de Acesso</p>
                        <h3 class="text-3xl font-bold text-gray-800">${perfisCount}</h3>
                    </div>
                    <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                        <i class="ph-fill ph-shield-check text-2xl"></i>
                    </div>
                </div>
            </div>

            <!-- Enhanced Filters -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
                <div class="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
                    <h3 class="font-bold text-gray-800 flex items-center gap-2">
                        <i class="ph-fill ph-faders text-purple-600"></i> Filtros de Busca
                    </h3>
                    <span class="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                        Mostrando ${filteredUsers.length} de ${totalUsers} registros
                    </span>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div class="md:col-span-6 relative group">
                        <i class="ph ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors"></i>
                        <input 
                            type="text" 
                            placeholder="Buscar por nome ou e-mail..."
                            value="${this.searchTerm}"
                            oninput="usuarios.handleSearch(this.value)"
                            class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all outline-none"
                        >
                    </div>
                    <div class="md:col-span-3">
                        <div class="relative">
                            <i class="ph ph-shield absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <select 
                                onchange="usuarios.handleFilterPerfil(this.value)"
                                class="w-full pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all outline-none appearance-none cursor-pointer"
                            >
                                <option value="">Todos os perfis</option>
                                ${this.perfis.map(p => `
                                    <option value="${p.id}" ${this.filterPerfil === p.id ? 'selected' : ''}>
                                        ${p.nome}
                                    </option>
                                `).join('')}
                            </select>
                            <i class="ph ph-caret-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                        </div>
                    </div>
                    <div class="md:col-span-3">
                        <div class="relative">
                            <i class="ph ph-toggle-left absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <select 
                                onchange="usuarios.handleFilterStatus(this.value)"
                                class="w-full pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all outline-none appearance-none cursor-pointer"
                            >
                                <option value="">Todos os status</option>
                                <option value="true" ${this.filterStatus === 'true' ? 'selected' : ''}>Ativos</option>
                                <option value="false" ${this.filterStatus === 'false' ? 'selected' : ''}>Inativos</option>
                            </select>
                            <i class="ph ph-caret-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                        </div>
                    </div>
                </div>
            </div>

            ${filteredUsers.length === 0 ? this.renderEmptyState() : this.renderUsersGrid(filteredUsers)}
        `;
    },

    renderUsersGrid(users) {
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${users.map(user => this.renderUserCard(user)).join('')}
            </div>
        `;
    },

    renderUserCard(user) {
        const initials = user.nome_completo.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
        const perfilColor = this.getPerfilColor(user.perfis?.nome);

        return `
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group">
                <!-- Header com gradiente -->
                <div class="h-24 bg-gradient-to-br ${perfilColor} relative">
                    <div class="absolute -bottom-8 left-6">
                        <div class="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-white">
                            ${initials}
                        </div>
                    </div>
                </div>

                <!-- Content -->
                <div class="pt-10 px-6 pb-6">
                    <div class="mb-4">
                        <h3 class="font-bold text-gray-900 text-lg mb-1">${user.nome_completo}</h3>
                        <p class="text-sm text-gray-600 flex items-center gap-1">
                            <i class="ph ph-envelope text-xs"></i>
                            ${user.email}
                        </p>
                    </div>

                    <div class="space-y-2 mb-4">
                        <div class="flex items-center justify-between">
                            <span class="text-xs text-gray-500">Perfil</span>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                ${user.perfis?.nome || 'N/A'}
                            </span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-xs text-gray-500">Status</span>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.ativo
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }">
                                <span class="w-1.5 h-1.5 rounded-full ${user.ativo ? 'bg-green-500' : 'bg-red-500'} mr-1.5"></span>
                                ${user.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                        </div>
                        ${user.ultimo_acesso ? `
                            <div class="flex items-center justify-between">
                                <span class="text-xs text-gray-500">Último acesso</span>
                                <span class="text-xs text-gray-700">
                                    ${window.dayjs(user.ultimo_acesso).format('DD/MM/YY HH:mm')}
                                </span>
                            </div>
                        ` : ''}
                    </div>

                    <!-- Actions -->
                    <div class="flex gap-2 pt-4 border-t border-gray-100">
                        ${auth.hasPermission('usuarios', 'editar') ? `
                            <button 
                                onclick="usuarios.showEditModal('${user.id}')"
                                class="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <i class="ph ph-pencil"></i>
                                Editar
                            </button>
                        ` : ''}
                        ${auth.hasPermission('usuarios', 'excluir') ? `
                            <button 
                                onclick="usuarios.deleteUser('${user.id}')"
                                class="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors"
                                title="Excluir"
                            >
                                <i class="ph ph-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    },

    renderPerfisList() {
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${this.perfis.map(perfil => this.renderPerfilCard(perfil)).join('')}
            </div>
        `;
    },

    renderPerfilCard(perfil) {
        const perfilColor = this.getPerfilColor(perfil.nome);
        const permissoesCount = Object.keys(perfil.permissoes || {}).length;

        return `
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
                <!-- Header -->
                <div class="p-6 bg-gradient-to-br ${perfilColor}">
                    <div class="flex items-start justify-between mb-3">
                        <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <i class="ph-fill ph-shield-check text-2xl text-white"></i>
                        </div>
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${perfil.ativo
                ? 'bg-white/20 text-white'
                : 'bg-black/20 text-white'
            }">
                            ${perfil.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                    </div>
                    <h3 class="text-xl font-bold text-white mb-1">${perfil.nome}</h3>
                    <p class="text-sm text-white/80">${perfil.descricao || 'Sem descrição'}</p>
                </div>

                <!-- Content -->
                <div class="p-6">
                    <div class="mb-4">
                        <div class="flex items-center justify-between mb-3">
                            <span class="text-sm font-medium text-gray-700">Permissões</span>
                            <span class="text-xs text-gray-500">${permissoesCount} módulos</span>
                        </div>
                        <div class="flex flex-wrap gap-2">
                            ${Object.keys(perfil.permissoes || {}).slice(0, 4).map(modulo => `
                                <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                                    ${modulo}
                                </span>
                            `).join('')}
                            ${permissoesCount > 4 ? `
                                <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
                                    +${permissoesCount - 4}
                                </span>
                            ` : ''}
                        </div>
                    </div>

                    ${auth.hasPermission('perfis', 'editar') ? `
                        <button 
                            onclick="usuarios.showEditPerfilModal('${perfil.id}')"
                            class="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 mb-2"
                        >
                            <i class="ph ph-pencil"></i>
                            Editar Perfil
                        </button>
                    ` : ''}
                    ${auth.hasPermission('perfis', 'excluir') ? `
                         <button 
                            onclick="usuarios.deletePerfil('${perfil.id}')"
                            class="w-full px-4 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                        >
                            <i class="ph ph-trash"></i>
                            Excluir
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    },

    renderEmptyState() {
        return `
            <div class="flex flex-col items-center justify-center py-16">
                <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <i class="ph ph-users-three text-4xl text-gray-400"></i>
                </div>
                <h3 class="text-lg font-semibold text-gray-800 mb-2">Nenhum usuário encontrado</h3>
                <p class="text-gray-600 text-center max-w-md mb-6">
                    ${this.searchTerm || this.filterPerfil || this.filterStatus
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando o primeiro usuário do sistema'
            }
                </p>
                ${auth.hasPermission('usuarios', 'criar') && !this.searchTerm && !this.filterPerfil && !this.filterStatus ? `
                    <button 
                        onclick="usuarios.showCreateModal()" 
                        class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
                    >
                        <i class="ph ph-plus-circle text-lg"></i>
                        Criar Primeiro Usuário
                    </button>
                ` : ''}
            </div>
        `;
    },

    getPerfilColor(perfilNome) {
        const colors = {
            'Administrador': 'from-red-500 to-pink-600',
            'Analista de Educação': 'from-blue-500 to-cyan-600',
            'Coordenador Pedagógico': 'from-green-500 to-emerald-600',
            'Assistente Educacional': 'from-yellow-500 to-orange-600',
            'Planejamento': 'from-purple-500 to-indigo-600',
            'Secretaria': 'from-teal-500 to-cyan-600'
        };
        return colors[perfilNome] || 'from-gray-500 to-gray-600';
    },

    getFilteredUsers() {
        return this.usuarios.filter(user => {
            const matchSearch = !this.searchTerm ||
                user.nome_completo.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(this.searchTerm.toLowerCase());

            const matchPerfil = !this.filterPerfil || user.perfil_id === this.filterPerfil;
            const matchStatus = !this.filterStatus || user.ativo.toString() === this.filterStatus;

            return matchSearch && matchPerfil && matchStatus;
        });
    },

    handleSearch(value) {
        this.searchTerm = value;
        window.app.renderView('configuracoes');
    },

    handleFilterPerfil(value) {
        this.filterPerfil = value;
        window.app.renderView('configuracoes');
    },

    handleFilterStatus(value) {
        this.filterStatus = value;
        window.app.renderView('configuracoes');
    },

    switchTab(tab) {
        this.currentTab = tab;
        window.app.renderView('configuracoes');
    },

    async showCreateModal() {
        const html = `
            <form id="userForm" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Nome Completo *
                        </label>
                        <input 
                            type="text" 
                            name="nome_completo" 
                            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
                            required
                        >
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            E-mail *
                        </label>
                        <input 
                            type="email" 
                            name="email" 
                            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
                            required
                        >
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Telefone
                        </label>
                        <input 
                            type="tel" 
                            name="telefone" 
                            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        >
                    </div>

                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Perfil de Acesso *
                        </label>
                        <select 
                            name="perfil_id" 
                            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" 
                            required 
                            onchange="usuarios.handlePerfilChange(this.value)"
                        >
                            <option value="">Selecione um perfil...</option>
                            ${this.perfis.filter(p => p.ativo).map(p => `
                                <option value="${p.id}">${p.nome}</option>
                            `).join('')}
                        </select>
                    </div>

                    <div id="vinculacoes" class="md:col-span-2" style="display: none;"></div>
                </div>

                <div class="flex gap-3 pt-4 border-t">
                    <button 
                        type="button" 
                        onclick="ui.closeModal()" 
                        class="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        class="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 font-medium transition-all"
                    >
                        Criar Usuário
                    </button>
                </div>
            </form>
        `;

        ui.openModal('Novo Usuário', html);

        document.getElementById('userForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.createUser(new FormData(e.target));
        });
    },

    handlePerfilChange(perfilId) {
        const perfil = this.perfis.find(p => p.id === perfilId);
        const vinculacoesDiv = document.getElementById('vinculacoes');

        if (!perfil) {
            vinculacoesDiv.style.display = 'none';
            return;
        }

        let html = '';

        if (perfil.nome === 'Analista de Educação') {
            html = `
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    Turmas Vinculadas
                </label>
                <select name="turmas" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" multiple size="5">
                    ${this.turmas.map(t => `
                        <option value="${t.id}">${t.codigo} - ${t.nome}</option>
                    `).join('')}
                </select>
                <p class="text-xs text-gray-500 mt-1">Segure Ctrl para selecionar múltiplas turmas</p>
            `;
        }

        if (perfil.nome === 'Coordenador Pedagógico') {
            html = `
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    Docentes Vinculados
                </label>
                <select name="docentes" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" multiple size="5">
                    ${this.docentes.map(d => `
                        <option value="${d.id}">${d.nome}</option>
                    `).join('')}
                </select>
                <p class="text-xs text-gray-500 mt-1">Segure Ctrl para selecionar múltiplos docentes</p>
            `;
        }

        if (html) {
            vinculacoesDiv.innerHTML = html;
            vinculacoesDiv.style.display = 'block';
        } else {
            vinculacoesDiv.style.display = 'none';
        }
    },

    async createUser(formData) {
        try {
            const userData = {
                nome_completo: formData.get('nome_completo'),
                email: formData.get('email'),
                telefone: formData.get('telefone'),
                perfil_id: formData.get('perfil_id'),
                ativo: true
            };

            const { data: user, error } = await supabase
                .from('usuarios')
                .insert([userData])
                .select()
                .single();

            if (error) throw error;

            const turmas = formData.getAll('turmas');
            const docentes = formData.getAll('docentes');

            if (turmas.length > 0) {
                await supabase.from('usuario_turmas').insert(
                    turmas.map(turma_id => ({ usuario_id: user.id, turma_id }))
                );
            }

            if (docentes.length > 0) {
                await supabase.from('usuario_docentes').insert(
                    docentes.map(docente_id => ({ usuario_id: user.id, docente_id }))
                );
            }

            ui.toast('Usuário criado com sucesso!', 'success');
            ui.closeModal();
            await this.loadData();
            window.app.renderView('configuracoes');
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            ui.toast('Erro ao criar usuário: ' + error.message, 'error');
        }
    },

    async deleteUser(userId) {
        if (!confirm('Deseja realmente excluir este usuário?')) return;

        try {
            const { error } = await supabase
                .from('usuarios')
                .delete()
                .eq('id', userId);

            if (error) throw error;

            ui.toast('Usuário excluído com sucesso!', 'success');
            await this.loadData();
            window.app.renderView('configuracoes');
        } catch (error) {
            console.error('Erro ao excluir usuário:', error);
            ui.toast('Erro ao excluir usuário', 'error');
        }
    },

    async showEditModal(userId) {
        // Implementar edição (similar ao create)
        ui.toast('Funcionalidade de edição em desenvolvimento', 'info');
    },

    /* === PERFIS MANAGEMENT === */

    showCreatePerfilModal() {
        this.renderPerfilFormModal('Novo Perfil de Acesso');
    },

    showEditPerfilModal(perfilId) {
        const perfil = this.perfis.find(p => p.id === perfilId);
        if (!perfil) return;
        this.renderPerfilFormModal('Editar Perfil', perfil);
    },

    renderPerfilFormModal(title, perfil = null) {
        const html = `
            <form id="perfilForm" class="space-y-6">
                ${perfil ? `<input type="hidden" name="id" value="${perfil.id}">` : ''}
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Nome do Perfil *</label>
                    <input type="text" name="nome" value="${perfil?.nome || ''}" required
                        class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                    <textarea name="descricao" rows="2"
                        class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">${perfil?.descricao || ''}</textarea>
                </div>

                <div class="border-t pt-4">
                    <label class="block text-sm font-bold text-gray-800 mb-4">Permissões de Acesso</label>
                    <div class="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        ${this.renderPermissionsForm(perfil?.permissoes)}
                    </div>
                </div>

                <div class="flex gap-3 pt-4 border-t">
                    <button type="button" onclick="ui.closeModal()" class="flex-1 btn btn-secondary">Cancelar</button>
                    <button type="submit" class="flex-1 btn btn-primary">Salvar Perfil</button>
                </div>
            </form>
        `;

        ui.openModal(title, html, 'modal-lg');

        document.getElementById('perfilForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handlePerfilSubmit(new FormData(e.target), perfil?.id);
        });
    },

    renderPermissionsForm(currentPermissions = {}) {
        return Object.entries(AVAILABLE_PERMISSIONS).map(([modulo, acoes]) => `
            <div class="p-4 bg-gray-50 rounded-lg border border-gray-100 mb-3 hover:border-purple-200 transition-colors">
                <div class="flex items-center justify-between mb-3">
                    <h4 class="font-bold text-gray-700 capitalize flex items-center gap-2">
                        <i class="ph-fill ph-squares-four text-purple-600"></i> ${modulo}
                    </h4>
                    <label class="text-xs text-purple-600 cursor-pointer hover:underline">
                        <input type="checkbox" class="hidden" onchange="usuarios.toggleModulePermissions(this, '${modulo}')">
                        Selecionar Todos
                    </label>
                </div>
                <div class="flex flex-wrap gap-4" id="group-${modulo}">
                    ${acoes.map(acao => {
            const isChecked = currentPermissions[modulo]?.includes(acao) ? 'checked' : '';
            const label = acao.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            return `
                            <label class="flex items-center gap-2 cursor-pointer select-none">
                                <input type="checkbox" name="perm_${modulo}" value="${acao}" ${isChecked} 
                                    class="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500 transition-all">
                                <span class="text-sm text-gray-600">${label}</span>
                            </label>
                        `;
        }).join('')}
                </div>
            </div>
        `).join('');
    },

    toggleModulePermissions(checkbox, modulo) {
        const group = document.getElementById(`group-${modulo}`);
        const inputs = group.querySelectorAll('input[type="checkbox"]');
        inputs.forEach(input => input.checked = checkbox.checked);
    },

    async handlePerfilSubmit(formData, id = null) {
        const btnSubmit = document.querySelector('#perfilForm button[type="submit"]');
        let originalText = '';
        if (btnSubmit) {
            originalText = btnSubmit.innerHTML;
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = '<i class="ph ph-spinner animate-spin"></i> Salvando...';
        }

        try {
            const permissoes = {};

            // Coletar permissões
            // Usando for...of entries para clareza
            for (const [key, value] of formData.entries()) {
                if (key.startsWith('perm_')) {
                    const modulo = key.replace('perm_', '');
                    if (!permissoes[modulo]) permissoes[modulo] = [];
                    permissoes[modulo].push(value);
                }
            }

            console.log('Salvando Perfil:', { nome: formData.get('nome'), permissoes });

            const perfilData = {
                nome: formData.get('nome'),
                descricao: formData.get('descricao'),
                permissoes: permissoes
            };

            let error;
            if (id) {
                // Update
                const res = await supabase.from('perfis').update(perfilData).eq('id', id).select();
                error = res.error;
            } else {
                // Create
                perfilData.ativo = true;
                const res = await supabase.from('perfis').insert([perfilData]).select();
                error = res.error;
            }

            if (error) {
                console.error('Erro Supabase:', error);
                throw error;
            }

            ui.toast(`Perfil ${id ? 'atualizado' : 'criado'} com sucesso!`, 'success');
            ui.closeModal();

            await this.loadData();

            if (window.app) {
                window.app.renderView('configuracoes');
            }

        } catch (error) {
            console.error('Erro ao salvar perfil:', error);
            ui.toast('Erro ao salvar perfil: ' + (error.message || 'Erro desconhecido'), 'error');
        } finally {
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = originalText;
            }
        }
    },

    async deletePerfil(id) {
        if (!confirm('Tem certeza? Isso pode afetar usuários vinculados.')) return;

        try {
            // Verificar usuários vinculados
            const { count } = await supabase
                .from('usuarios')
                .select('*', { count: 'exact', head: true })
                .eq('perfil_id', id);

            if (count > 0) {
                ui.toast(`Não é possível excluir: Existem ${count} usuários com este perfil.`, 'warning');
                return;
            }

            const { error } = await supabase.from('perfis').delete().eq('id', id);
            if (error) throw error;

            ui.toast('Perfil excluído.', 'success');
            await this.loadData();
            window.app.renderView('configuracoes');
        } catch (error) {
            ui.toast('Erro ao excluir: ' + error.message, 'error');
        }
    }
};

window.usuarios = usuarios;
