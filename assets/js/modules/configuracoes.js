/**
 * Módulo de Configurações
 * UI/UX Padronizada com Módulo de Planejamento (Tab Pills, Page Header, Token List)
 */

import { auth } from '../services/auth.js';
import { usuarios } from './usuarios.js';
import { ui } from '../utils/ui.js';

export const configuracoes = {
    currentTab: 'geral',

    async init() {
        // Inicializar submódulo de usuários se for admin
        if (auth.isAdmin()) {
            await usuarios.init();
        }
    },

    render(state) {
        // Verificar autenticação
        if (!auth.isAuthenticated()) return this.renderAccessDenied();

        const isAdmin = auth.isAdmin();

        return `
            <div class="animate-fade-in" style="padding-bottom: 80px;">
                <!-- Page Header -->
                <div class="page-header">
                    <h2 class="page-title">Configurações</h2>
                    <p class="page-subtitle">Gerencie suas preferências, perfil e usuários do sistema</p>
                </div>

                <!-- Tab Pills Navigation -->
                <div class="tab-pills">
                    <button onclick="configuracoes.switchTab('geral')" 
                        class="tab-pill ${this.currentTab === 'geral' ? 'active' : ''}">
                        <i class="ph ph-sliders"></i> Geral
                    </button>
                    <button onclick="configuracoes.switchTab('perfil')" 
                        class="tab-pill ${this.currentTab === 'perfil' ? 'active' : ''}">
                        <i class="ph ph-user-circle"></i> Meu Perfil
                    </button>
                    ${isAdmin ? `
                        <button onclick="configuracoes.switchTab('usuarios')" 
                             class="tab-pill ${this.currentTab === 'usuarios' ? 'active' : ''}">
                            <i class="ph ph-users-three"></i> Gestão de Acessos
                        </button>
                    ` : ''}
                </div>

                <!-- Tab Content -->
                <div id="configuracoes-content" class="mt-6">
                    ${this.renderTabContent(state)}
                </div>
            </div>
        `;
    },

    renderTabContent(state) {
        switch (this.currentTab) {
            case 'geral':
                return this.renderGeralTab();
            case 'perfil':
                return this.renderPerfilTab();
            case 'usuarios':
                return auth.isAdmin() ? usuarios.render() : this.renderAccessDenied();
            default:
                return this.renderGeralTab();
        }
    },

    switchTab(tab) {
        this.currentTab = tab;

        // Update UI Tabs visual state manually for performance
        document.querySelectorAll('.tab-pill').forEach(btn => btn.classList.remove('active'));
        const btn = document.querySelector(`button[onclick*="'${tab}'"]`);
        if (btn) btn.classList.add('active');

        // Render Content
        const content = document.getElementById('configuracoes-content');
        if (content) {
            content.innerHTML = this.renderTabContent();

            // Re-bind events if necessary (e.g. masks)
            if (window.imask) {
                document.querySelectorAll('input[type="tel"]').forEach(input => {
                    IMask(input, { mask: '(00) 00000-0000' });
                });
            }
        }
    },

    /* ==========================================================================================
       TAB 1: GERAL
       ========================================================================================== */
    renderGeralTab() {
        const user = auth.getCurrentUser();

        return `
            <div class="animate-fade-in">
                <div class="flex-between" style="margin-bottom: 2rem;">
                    <div>
                         <h3 class="input-label" style="font-size: 1.25rem; margin-bottom: 0.25rem;">Visão Geral</h3>
                         <p class="token-meta">Resumo das informações do sistema e da sua conta</p>
                    </div>
                </div>

                <!-- Info Cards (Dashboard Style) -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <!-- Card 1: Perfil -->
                    <div class="card p-6 flex items-center gap-4 hover:shadow-md transition-all border-l-4 border-l-purple-500">
                        <div class="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                            <i class="ph-fill ph-user text-2xl"></i>
                        </div>
                        <div>
                            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Conta</p>
                            <h3 class="text-lg font-bold text-gray-800">${user?.nome_completo || 'Usuário'}</h3>
                            <p class="text-xs text-gray-400 truncate max-w-[150px]">${user?.email}</p>
                        </div>
                    </div>

                    <!-- Card 2: Sistema -->
                    <div class="card p-6 flex items-center gap-4 hover:shadow-md transition-all border-l-4 border-l-blue-500">
                        <div class="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                            <i class="ph-fill ph-code text-2xl"></i>
                        </div>
                        <div>
                            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sistema</p>
                            <h3 class="text-lg font-bold text-gray-800">Competenz SaaS</h3>
                            <p class="text-xs text-green-600 font-medium">v1.9.0 • Estável</p>
                        </div>
                    </div>

                    <!-- Card 3: Acesso -->
                    <div class="card p-6 flex items-center gap-4 hover:shadow-md transition-all border-l-4 border-l-green-500">
                        <div class="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                            <i class="ph-fill ph-clock text-2xl"></i>
                        </div>
                        <div>
                            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Último Acesso</p>
                            <h3 class="text-lg font-bold text-gray-800">
                                ${user?.ultimo_acesso ? window.dayjs(user.ultimo_acesso).format('HH:mm') : '--:--'}
                            </h3>
                            <p class="text-xs text-gray-400">
                                ${user?.ultimo_acesso ? window.dayjs(user.ultimo_acesso).format('DD/MM/YYYY') : 'Primeiro login'}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- System About -->
                <div class="card p-8 text-center bg-gradient-to-b from-white to-gray-50">
                    <img src="assets/images/logo-competenz.png" alt="Competenz" class="h-24 mx-auto mb-6 object-contain hover:scale-105 transition-transform">
                    <!-- <h3 class="text-xl font-bold text-gray-900 mb-2">Competenz Educacional</h3> -->
                    <p class="text-gray-600 max-w-lg mx-auto mb-6">
                        Plataforma integrada de gestão acadêmica e pedagógica focada em resultados.
                    </p>
                    <div class="flex justify-center gap-4 text-sm text-gray-500">
                        <a href="#" class="hover:text-purple-600 transition-colors">Termos de Uso</a>
                        <span>•</span>
                        <a href="#" class="hover:text-purple-600 transition-colors">Privacidade</a>
                        <span>•</span>
                        <a href="#" class="hover:text-purple-600 transition-colors">Suporte</a>
                    </div>
                    <div class="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-400 leading-relaxed">
                        <span class="font-bold text-gray-600 block">© 2026 Competenz</span>
                        Feito com ❤️ por Alisson Almeida Q.
                    </div>
                </div>
            </div>
        `;
    },

    /* ==========================================================================================
       TAB 2: MEU PERFIL
       ========================================================================================== */
    renderPerfilTab() {
        const user = auth.getCurrentUser();
        const profile = auth.getCurrentProfile();
        // Tentar obter avatar da URL mapeada ou metadata
        const userAvatarUrl = user?.avatar_url || user?.metadata?.avatar_url;

        // Gerar iniciais
        const initials = user?.nome_completo
            ? user.nome_completo.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
            : 'US';

        return `
            <div class="animate-fade-in">
                <div class="flex-between" style="margin-bottom: 2rem;">
                    <div>
                         <h3 class="input-label" style="font-size: 1.25rem; margin-bottom: 0.25rem;">Meu Perfil</h3>
                         <p class="token-meta">Gerencie seus dados pessoais e de acesso</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Left Column: Avatar & Summary -->
                    <div class="lg:col-span-1">
                        <div class="card p-6 text-center h-full">
                            
                            <!-- Avatar Upload Component -->
                            <div class="relative w-32 h-32 mx-auto mb-6 group cursor-pointer" onclick="document.getElementById('avatar-upload').click()" title="Clique para alterar a foto">
                                ${userAvatarUrl
                ? `<img src="${userAvatarUrl}" alt="Avatar" class="w-full h-full rounded-full object-cover border-4 border-white shadow-lg">`
                : `<div class="w-full h-full rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg border-4 border-white">${initials}</div>`
            }
                                
                                <!-- Hover Overlay -->
                                <div class="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-[2px]">
                                    <i class="ph-fill ph-camera text-white text-3xl drop-shadow-md"></i>
                                </div>

                                <!-- Status Indicator -->
                                <div class="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full z-10" title="Status: Ativo"></div>
                                
                                <!-- Hidden Input -->
                                <input type="file" id="avatar-upload" class="hidden" accept="image/png, image/jpeg, image/webp" onchange="configuracoes.handleAvatarUpload(this)">
                            </div>

                            <h3 class="text-xl font-bold text-gray-900 mb-1">${user?.nome_completo || 'Usuário'}</h3>
                            <p class="text-gray-500 mb-4">${user?.email || ''}</p>

                            <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm font-medium border border-purple-100">
                                <i class="ph-fill ph-crown"></i> ${profile?.nome || 'Usuário'}
                            </div>

                            <div class="mt-8 pt-6 border-t border-gray-100 text-left">
                                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Sobre o Perfil</p>
                                <p class="text-sm text-gray-600 leading-relaxed">
                                    ${profile?.descricao || 'Sem descrição disponível.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column: Edit Form -->
                    <div class="lg:col-span-2">
                        <div class="card p-6">
                            <h4 class="font-bold text-gray-800 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                                <i class="ph-fill ph-user-gear text-purple-600"></i> Informações Pessoais
                            </h4>

                            <form id="perfilForm" onsubmit="configuracoes.saveProfile(event)">
                                <div class="grid-2">
                                    <div class="input-group">
                                        <label class="input-label">Nome Completo</label>
                                        <div class="relative">
                                            <i class="ph ph-user absolute left-3 top-3 text-gray-400"></i>
                                            <input name="nome_completo" type="text" class="input-field pl-10" value="${user?.nome_completo || ''}" required>
                                        </div>
                                    </div>
                                    <div class="input-group">
                                        <label class="input-label">Telefone / Celular</label>
                                        <div class="relative">
                                            <i class="ph ph-phone absolute left-3 top-3 text-gray-400"></i>
                                            <input name="telefone" type="tel" class="input-field pl-10" value="${user?.telefone || ''}" placeholder="(00) 00000-0000">
                                        </div>
                                    </div>
                                </div>

                                <div class="grid-2">
                                    <div class="input-group">
                                        <label class="input-label">E-mail de Acesso</label>
                                        <div class="relative">
                                            <i class="ph ph-envelope absolute left-3 top-3 text-gray-400"></i>
                                            <input type="email" class="input-field pl-10" value="${user?.email || ''}" readonly style="background-color: #f8fafc; cursor: not-allowed;" title="Entre em contato com o suporte para alterar o e-mail">
                                        </div>
                                        <p class="text-xs text-gray-400 mt-1">E-mail gerenciado pelo administrador.</p>
                                    </div>
                                    <div class="input-group">
                                        <label class="input-label">Data de Cadastro</label>
                                        <input type="text" class="input-field" value="${window.dayjs(user?.created_at).format('DD/MM/YYYY')}" readonly style="background-color: #f8fafc;">
                                    </div>
                                </div>

                                <div class="flex flex-col md:flex-row gap-4 mt-6 pt-6 border-t border-gray-100">
                                    <button type="button" onclick="configuracoes.openChangePasswordModal()" class="btn btn-secondary text-red-600 border-red-200 hover:bg-red-50 w-full md:w-auto">
                                        <i class="ph ph-lock-key"></i> Alterar Senha
                                    </button>
                                    <div class="flex-1"></div>
                                    <button type="submit" class="btn btn-primary w-full md:w-auto">
                                        <i class="ph ph-check"></i> Salvar Alterações
                                    </button>
                                </div>
                            </form>
                        </div>

                        <!-- Detalhes das Permissões -->
                        <div class="card mt-6">
                            <div class="card-header border-b border-gray-100 p-6 flex justify-between items-center">
                                <h3 class="text-base font-bold text-gray-800 flex items-center gap-2">
                                    <i class="ph ph-shield-check text-[#667eea]"></i>
                                    Permissões do Perfil
                                </h3>
                                <span class="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-500 rounded">Somente Leitura</span>
                            </div>
                            
                            <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                ${this.renderPermissoes(profile?.permissoes || {})}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    async handleAvatarUpload(input) {
        if (input.files && input.files[0]) {
            const file = input.files[0];

            // Validações
            if (file.size > 2 * 1024 * 1024) { // 2MB
                ui.toast('A imagem deve ter no máximo 2MB.', 'error');
                return;
            }

            if (!file.type.startsWith('image/')) {
                ui.toast('O arquivo deve ser uma imagem.', 'error');
                return;
            }

            try {
                ui.toast('Enviando imagem...', 'info');

                // Mostrar loading ou feedback visual no avatar
                const img = input.parentElement.querySelector('img');
                const initialsDiv = input.parentElement.querySelector('div:first-child');
                if (img) img.style.opacity = '0.5';
                if (initialsDiv) initialsDiv.style.opacity = '0.5';

                const result = await auth.uploadAvatar(file);

                if (result.success) {
                    ui.toast('Foto de perfil atualizada!', 'success');
                    // Pequeno delay para garantir propagação
                    setTimeout(() => {
                        this.render(app.state);
                    }, 500);
                }
            } catch (error) {
                ui.toast('Erro ao atualizar foto: ' + error.message, 'error');
                // Restaurar opacidade em caso de erro
                const img = input.parentElement.querySelector('img');
                const initialsDiv = input.parentElement.querySelector('div:first-child');
                if (img) img.style.opacity = '1';
                if (initialsDiv) initialsDiv.style.opacity = '1';
            }
        }
    },

    async saveProfile(e) {
        e.preventDefault();
        const f = e.target;

        try {
            const data = {
                nome_completo: f.nome_completo.value,
                telefone: f.telefone.value
            };

            const result = await auth.updateProfile(data);
            if (result.success) {
                ui.toast('Perfil atualizado com sucesso!', 'success');
                this.render(app.state); // Re-render to update UI
            }
        } catch (error) {
            ui.toast('Erro ao atualizar perfil: ' + error.message, 'error');
        }
    },

    openChangePasswordModal() {
        ui.openModalWindow('Alterar Senha de Acesso', `
            <form onsubmit="configuracoes.submitNewPassword(event)">
                <div class="alert alert-warning mb-4 flex items-start gap-3 p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
                    <i class="ph-fill ph-warning text-lg shrink-0 mt-0.5"></i>
                    <div>
                        <strong>Atenção:</strong> Ao alterar sua senha, sua sessão atual será encerrada e você precisará fazer login novamente.
                    </div>
                </div>

                <div class="input-group">
                    <label class="input-label">Nova Senha</label>
                    <div class="relative">
                        <input type="password" name="new_password" class="input-field" required minlength="6" placeholder="Mínimo de 6 caracteres">
                        <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onclick="ui.togglePasswordVisibility(this)">
                            <i class="ph ph-eye"></i>
                        </button>
                    </div>
                </div>

                <div class="input-group">
                    <label class="input-label">Confirmar Nova Senha</label>
                    <div class="relative">
                        <input type="password" name="confirm_password" class="input-field" required minlength="6" placeholder="Repita a nova senha">
                    </div>
                </div>

                <div class="flex justify-end gap-3 mt-6">
                    <button type="button" onclick="ui.closeModal()" class="btn btn-secondary">Cancelar</button>
                    <button type="submit" class="btn btn-primary bg-red-600 hover:bg-red-700 border-none">
                        Alterar Senha e Sair
                    </button>
                </div>
            </form>
        `, 'modal-md');
    },

    async submitNewPassword(e) {
        e.preventDefault();
        const f = e.target;
        const p1 = f.new_password.value;
        const p2 = f.confirm_password.value;

        if (p1 !== p2) {
            ui.toast('As senhas não coincidem.', 'error');
            return;
        }

        if (p1.length < 6) {
            ui.toast('A senha deve ter no mínimo 6 caracteres.', 'error');
            return;
        }

        try {
            await auth.updatePassword(p1);
            ui.toast('Senha alterada com sucesso! Redirecionando...', 'success');

            setTimeout(async () => {
                await auth.logout();
                window.location.reload();
            }, 1000);

        } catch (error) {
            ui.toast('Erro ao alterar senha: ' + error.message, 'error');
        }
    },

    renderPermissoes(permissoes) {
        if (Object.keys(permissoes).length === 0) return '<span class="text-sm text-gray-500">Nenhuma permissão específica.</span>';

        return `
            <div class="flex flex-wrap gap-3">
                ${Object.entries(permissoes).map(([modulo, acoes]) => `
                    <div class="flex items-center bg-white border border-gray-200 rounded-md px-3 py-1.5 shadow-sm">
                        <span class="text-xs font-bold text-gray-700 uppercase mr-2">${modulo}</span>
                        <div class="flex gap-1">
                            ${acoes.map(a => `<span class="w-2 h-2 rounded-full ${this.getActionColor(a)}" title="${a}"></span>`).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="mt-2 text-xs text-gray-400 flex gap-4">
                <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-green-500"></span> Criar/Editar</span>
                <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-blue-500"></span> Visualizar</span>
                <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-red-500"></span> Excluir</span>
            </div>
        `;
    },

    getActionColor(action) {
        if (['criar', 'editar', 'gravar'].includes(action)) return 'bg-green-500';
        if (['excluir', 'deletar'].includes(action)) return 'bg-red-500';
        return 'bg-blue-500';
    },

    renderAccessDenied() {
        return `
            <div class="card p-10 text-center">
                <i class="ph ph-lock text-4xl text-gray-400 mb-4"></i>
                <h3 class="text-xl font-bold text-gray-700 mb-2">Acesso Negado</h3>
                <p class="text-gray-500">Você precisa estar autenticado para acessar configurações.</p>
            </div>
        `;
    },

};

// Expor globalmente
window.configuracoes = configuracoes;
