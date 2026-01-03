/**
 * Serviço de Autenticação e Autorização
 * Gerencia login, logout, sessão e permissões de usuários
 */

import { supabase } from './supabase.js';

class AuthService {
    constructor() {
        this.currentUser = null;
        this.currentProfile = null;
        this.permissions = {};
    }

    /**
     * Inicializa o serviço de autenticação
     * Verifica se há uma sessão ativa
     */
    async init() {
        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                await this.loadUserData(session.user);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro ao inicializar autenticação:', error);
            return false;
        }
    }

    /**
     * Realiza login do usuário
     */
    async login(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            await this.loadUserData(data.user);

            // Atualizar último acesso
            await supabase
                .from('usuarios')
                .update({ ultimo_acesso: new Date().toISOString() })
                .eq('email', email);

            // Log de Acesso (Login)
            await this._logAccess('LOGIN');

            return { success: true, user: this.currentUser };
        } catch (error) {
            console.error('Erro no login:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Carrega dados do usuário logado
     */
    async loadUserData(authUser) {
        try {
            // Buscar dados do usuário (sem join aninhado para evitar erro de schema)
            const { data: userData, error: userError } = await supabase
                .from('usuarios')
                .select('*')
                .eq('email', authUser.email)
                .eq('ativo', true)
                .single();

            if (userError) throw userError;

            if (!userData) {
                throw new Error('Usuário não encontrado ou inativo');
            }

            // Buscar perfil separadamente
            const { data: perfilData, error: perfilError } = await supabase
                .from('perfis')
                .select('id, nome, descricao, permissoes')
                .eq('id', userData.perfil_id)
                .single();

            if (perfilError) throw perfilError;

            if (!perfilData) {
                throw new Error('Perfil do usuário não encontrado');
            }

            this.currentUser = userData;
            // Mapear avatar_url dos metadados para facilitar acesso
            this.currentUser.avatar_url = userData.metadata?.avatar_url;

            this.currentProfile = perfilData;
            this.permissions = perfilData.permissoes || {};

            // Carregar vinculações específicas do perfil
            await this.loadUserBindings();

            return userData;
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
            throw error;
        }
    }

    /**
     * Faz upload da foto de perfil
     * @param {File} file - Arquivo de imagem
     */
    async uploadAvatar(file) {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${this.currentUser.id}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload para o bucket 'avatars'
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Obter URL pública
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // Atualizar metadados do usuário
            const newMetadata = {
                ...(this.currentUser.metadata || {}),
                avatar_url: publicUrl
            };

            await this.updateProfile({ metadata: newMetadata });

            return { success: true, publicUrl };
        } catch (error) {
            console.error('Erro no upload de avatar:', error);
            // Se o bucket não existir, avisar
            if (error.message && error.message.includes('bucket not found')) {
                throw new Error('Bucket "avatars" não encontrado. Contate o administrador.');
            }
            throw error;
        }
    }

    /**
     * Carrega vinculações do usuário (turmas, docentes)
     */
    async loadUserBindings() {
        try {
            const userId = this.currentUser.id;

            // Carregar turmas vinculadas (para Analista de Educação)
            const { data: turmas } = await supabase
                .from('usuario_turmas')
                .select('turma_id')
                .eq('usuario_id', userId);

            // Carregar docentes vinculados (para Coordenador Pedagógico)
            const { data: docentes } = await supabase
                .from('usuario_docentes')
                .select('docente_id')
                .eq('usuario_id', userId);

            this.currentUser.turmas_vinculadas = turmas?.map(t => t.turma_id) || [];
            this.currentUser.docentes_vinculados = docentes?.map(d => d.docente_id) || [];
        } catch (error) {
            console.error('Erro ao carregar vinculações:', error);
        }
    }

    /**
     * Realiza logout do usuário
     */
    async logout() {
        try {
            if (this.currentUser) {
                await this._logAccess('LOGOUT');
            }
            await supabase.auth.signOut();
            this.currentUser = null;
            this.currentProfile = null;
            this.permissions = {};
            return { success: true };
        } catch (error) {
            console.error('Erro no logout:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Verifica se o usuário está autenticado
     */
    isAuthenticated() {
        return this.currentUser !== null;
    }

    /**
     * Verifica se o usuário tem uma permissão específica
     * @param {string} module - Nome do módulo (ex: 'usuarios', 'turmas')
     * @param {string} action - Ação (ex: 'criar', 'editar', 'visualizar', 'excluir')
     */
    hasPermission(module, action) {
        if (!this.permissions || !this.permissions[module]) {
            return false;
        }

        return this.permissions[module].includes(action);
    }

    /**
     * Verifica se o usuário tem acesso a um módulo
     */
    canAccessModule(moduleName) {
        // Administrador tem acesso a tudo
        if (this.currentProfile?.nome === 'Administrador') {
            return true;
        }

        // Verificar permissões específicas
        const modulePermissions = {
            'dashboard': () => this.hasPermission('dashboard', 'visualizar'),
            'secretaria': () => this.hasPermission('secretaria', 'visualizar'),
            'pedagogico': () => this.hasPermission('pedagogico', 'visualizar'),
            'planejamento': () => this.hasPermission('planejamento', 'visualizar'),
            'usuarios': () => this.hasPermission('usuarios', 'visualizar')
        };

        const checkFn = modulePermissions[moduleName];
        return checkFn ? checkFn() : false;
    }

    /**
     * Filtra dados baseado nas permissões do usuário
     * @param {string} dataType - Tipo de dado ('turmas', 'docentes')
     * @param {Array} data - Dados a serem filtrados
     */
    filterDataByPermissions(dataType, data) {
        // Administrador vê tudo
        if (this.currentProfile?.nome === 'Administrador') {
            return data;
        }

        switch (dataType) {
            case 'turmas':
                // Analista de Educação vê apenas turmas vinculadas
                if (this.hasPermission('turmas', 'visualizar_vinculadas')) {
                    return data.filter(item =>
                        this.currentUser.turmas_vinculadas?.includes(item.id)
                    );
                }

                // Coordenador Pedagógico vê turmas dos docentes vinculados
                if (this.hasPermission('turmas', 'visualizar_por_docente')) {
                    return data.filter(item => {
                        // Verificar se algum docente da turma está vinculado
                        const docentesTurma = item.lotacao_docentes || [];
                        return docentesTurma.some(d =>
                            this.currentUser.docentes_vinculados?.includes(d.docente_id)
                        );
                    });
                }
                break;

            case 'docentes':
                // Coordenador Pedagógico vê apenas docentes vinculados
                if (this.hasPermission('docentes', 'visualizar_vinculados')) {
                    return data.filter(item =>
                        this.currentUser.docentes_vinculados?.includes(item.id)
                    );
                }
                break;
        }

        // Por padrão, retorna todos os dados se tiver permissão de visualizar
        return data;
    }

    /**
     * Retorna informações do usuário atual
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Retorna perfil do usuário atual
     */
    getCurrentProfile() {
        return this.currentProfile;
    }

    /**
     * Atualiza dados do perfil do usuário
     */
    async updateProfile(profileData) {
        try {
            const { error } = await supabase
                .from('usuarios')
                .update(profileData)
                .eq('id', this.currentUser.id);

            if (error) throw error;

            // Atualizar cache local
            this.currentUser = { ...this.currentUser, ...profileData };
            return { success: true };
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            throw error;
        }
    }

    /**
     * Atualiza a senha do usuário
     */
    async updatePassword(newPassword) {
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Erro ao atualizar senha:', error);
            throw error;
        }
    }

    /**
     * Verifica se é administrador
     */
    isAdmin() {
        return this.currentProfile?.nome === 'Administrador';
    }
    /**
     * Helper interno para registrar logs de acesso (Login/Logout)
     */
    async _logAccess(action) {
        try {
            let ip = 'Unknown';
            // Tentar obter IP com timeout curto
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s timeout
                const response = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
                clearTimeout(timeoutId);
                if (response.ok) {
                    const json = await response.json();
                    ip = json.ip;
                }
            } catch (err) {
                // Silencioso em caso de falha de rede/timeout
            }

            await supabase.from('logs_acesso').insert({
                usuario_id: this.currentUser.id,
                nome_usuario: this.currentUser.nome_completo,
                acao: action,
                ip_address: ip,
                user_agent: navigator.userAgent
            });
        } catch (e) {
            console.error(`Erro ao registrar log (${action}):`, e);
        }
    }
}

// Exportar instância única (singleton)
export const auth = new AuthService();
