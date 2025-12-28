
import { ambientesService } from '../services/ambientes.js';
import { ui } from '../utils/ui.js';
import { ux } from '../utils/ux.js';

export const alocacaoAmbientes = {
    render() {
        setTimeout(() => this.init(), 50);
        return `
            <div class="animate-fade-in" style="padding-bottom: 80px;">
                <!-- Header -->
                <div class="flex-between mb-6">
                    <div>
                        <h2 class="text-2xl font-bold text-slate-800">Alocação de Ambientes</h2>
                        <p class="text-slate-500">Planejamento de Salas por Turma e Unidade Curricular</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="app.navigate('ambientes')" class="btn btn-white text-slate-600 border border-slate-200 hover:bg-slate-50">
                            <i class="ph ph-arrow-left"></i> Voltar para Ambientes
                        </button>
                    </div>
                </div>

                <!-- List Content -->
                <div id="alocacao-turmas-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     <div class="col-span-full text-center py-10">
                        <div class="loading-spinner mb-2"></div>
                        <p class="text-slate-400 text-sm">Carregando turmas...</p>
                     </div>
                </div>
            </div>
        `;
    },

    async init() {
        const container = document.getElementById('alocacao-turmas-list');
        if (!container) return;

        // Use global state for turmas if available, otherwise fetch
        let turmas = app.state.classes;
        if (!turmas || !turmas.length) {
            // Fallback if app state not ready (unlikely)
            try {
                const { data } = await import('../services/supabase.js').then(m => m.supabase.from('turmas').select('*, cursos(nome)'));
                turmas = data || [];
            } catch (e) {
                console.error(e);
            }
        }

        // Filter: Em Andamento or Planejada
        const active = turmas.filter(t => t.status === 'Em Andamento' || t.status === 'Planejamento');

        if (!active.length) {
            container.innerHTML = `<div class="col-span-full">${ux.renderEmptyState('Nenhuma turma ativa ou em planejamento.')}</div>`;
            return;
        }

        container.innerHTML = active.map(t => `
            <div class="card p-5 hover:shadow-lg transition-all border border-transparent hover:border-blue-200 group">
                <div class="flex justify-between items-start mb-2">
                    <span class="px-2 py-1 text-[10px] font-bold uppercase rounded ${this.getStatusColor(t.status)}">
                        ${t.status}
                    </span>
                    <span class="text-xs font-mono text-slate-400">${t.codigo_sge || 'Sem Cód.'}</span>
                </div>
                
                <h3 class="font-bold text-slate-800 text-lg mb-1">${t.nome || 'Turma sem nome'}</h3>
                <p class="text-xs text-slate-500 mb-4 font-medium uppercase tracking-wide">${t.cursos?.nome || 'Curso não definido'}</p>

                <div class="pt-3 border-t border-slate-100 mt-auto">
                    <button onclick="app.alocacaoAmbientes.openDetails('${t.id}')" 
                        class="btn btn-sm w-full btn-white text-blue-600 border-blue-100 hover:bg-blue-50 flex items-center justify-center gap-2">
                        <i class="ph ph-list-dashes"></i> Visualizar UCs
                    </button>
                </div>
            </div>
        `).join('');
    },

    getStatusColor(status) {
        if (status === 'Em Andamento') return 'bg-green-100 text-green-700';
        if (status === 'Planejamento') return 'bg-yellow-100 text-yellow-700';
        return 'bg-slate-100 text-slate-600';
    },

    async openDetails(turmaId) {
        const turma = app.state.classes.find(t => t.id === turmaId);
        if (!turma) return;

        ui.openModalWindow(`Alocação: ${turma.nome}`, `
            <div id="alocacao-details-container" class="min-h-[400px]">
                <div class="flex items-center justify-center h-40">
                    <div class="loading-spinner"></div>
                </div>
            </div>
        `, 'modal-xl');

        try {
            const plan = await ambientesService.getTurmaPlanning(turmaId);
            this.renderDetailsTable(turma, plan);
        } catch (err) {
            const el = document.getElementById('alocacao-details-container');
            if (el) el.innerHTML = ux.renderError('Erro ao carregar UCs da turma. Verifique se a turma possui matriz vinculada.');
            console.error(err);
        }
    },

    renderDetailsTable(turma, plan) {
        const container = document.getElementById('alocacao-details-container');
        if (!container) return;

        if (!plan.ucs || !plan.ucs.length) {
            container.innerHTML = ux.renderEmptyState('Nenhuma Unidade Curricular encontrada para esta turma.');
            return;
        }

        container.innerHTML = `
            <div class="mb-4 bg-blue-50 p-4 rounded-lg flex justify-between items-center">
                <div>
                     <p class="text-xs text-blue-600 font-bold uppercase tracking-wider">Curso</p>
                     <p class="font-bold text-blue-900">${turma.cursos?.nome || '-'}</p>
                </div>
                <div class="text-right">
                     <p class="text-xs text-blue-600 font-bold uppercase tracking-wider">Turno</p>
                     <p class="font-bold text-blue-900">${turma.turno || '-'}</p>
                </div>
            </div>

            <div class="overflow-x-auto border rounded-lg">
                <table class="w-full text-sm text-left">
                    <thead class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                            <th class="p-3 w-1/3">Unidade Curricular</th>
                            <th class="p-3">Docente</th>
                            <th class="p-3">Ambiente Alocado</th>
                            <th class="p-3">Período</th>
                            <th class="p-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 bg-white">
                        ${plan.ucs.map(u => {
            const hasAlloc = !!u.alocacao;
            return `
                                <tr class="hover:bg-slate-50 transition-colors">
                                    <td class="p-3">
                                        <div class="font-bold text-slate-700">${u.nome}</div>
                                        <div class="text-xs text-slate-400">${u.periodo_matriz || ''} • ${u.carga_horaria}h</div>
                                    </td>
                                    <td class="p-3">
                                        ${u.docente ? `
                                            <div class="flex items-center gap-2">
                                                <div class="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                                    ${u.docente.nome.charAt(0)}
                                                </div>
                                                <span class="text-slate-700">${u.docente.nome}</span>
                                            </div>
                                        ` : '<span class="text-slate-400 italic text-xs">Não definido</span>'}
                                    </td>
                                    <td class="p-3">
                                        ${hasAlloc ? `
                                            <div class="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-50 text-green-700 border border-green-100">
                                                <i class="ph-fill ph-check-circle"></i>
                                                <span class="font-bold text-xs">${u.alocacao.ambientes?.nome}</span>
                                            </div>
                                        ` : '<span class="text-slate-400 text-xs">—</span>'}
                                    </td>
                                    <td class="p-3 whitespace-nowrap text-xs">
                                        ${hasAlloc ? `
                                            <div class="text-slate-700 font-mono">
                                                ${window.dayjs(u.alocacao.data_inicio.slice(0, 10)).format('DD/MM/YY')}
                                                <span class="text-slate-300">➜</span>
                                                ${window.dayjs(u.alocacao.data_fim.slice(0, 10)).format('DD/MM/YY')}
                                            </div>
                                        ` : '<span class="text-slate-400">—</span>'}
                                    </td>
                                    <td class="p-3 text-right">
                                        ${hasAlloc ? `
                                            <button onclick="app.alocacaoAmbientes.openEditModal('${turma.id}', '${u.uc_id}', '${u.alocacao.id}')" 
                                                class="btn btn-xs btn-white border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200" title="Editar">
                                                <i class="ph ph-pencil-simple"></i>
                                            </button>
                                        ` : `
                                            <button onclick="app.alocacaoAmbientes.openAllocModal('${turma.id}', '${u.uc_id}')" 
                                                class="btn btn-xs btn-primary shadow-sm">
                                                Alocar
                                            </button>
                                        `}
                                    </td>
                                </tr>
                            `;
        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    async openAllocModal(turmaId, ucId) {
        // Find UC details (we might need to re-fetch or pass details, re-fetching planning for safety/simplicity of state)
        // Or store temp state. Let's re-fetch light data or use what we check in validation

        // We need Environment List
        const ambientesData = await import('../services/ambientes.js').then(m => m.ambientesService.list());
        const ambientesList = ambientesData.filter(a => a.status === 'Ativo');

        // Initial dates -> Should come from somewhere? 
        // For now, user picks. Or we could try to guess from 'lotacoes_turma' (daily schedule) if it existed.

        ui.openModalWindow('Alocar Ambiente', `
            <form onsubmit="app.alocacaoAmbientes.submitAlloc(event, '${turmaId}', '${ucId}')" class="space-y-4">
                <div class="bg-blue-50 p-3 rounded text-sm text-blue-900 mb-4">
                    <i class="ph-fill ph-info"></i> Selecione o ambiente e o período para alocar esta Unidade Curricular.
                </div>

                <div class="input-group">
                    <label class="input-label">Ambiente</label>
                    <select name="ambiente_id" class="input-field" required>
                        <option value="">Selecione...</option>
                        ${ambientesList.map(a => `<option value="${a.id}">${a.nome} (${a.capacidade} lug.) - ${a.tipo}</option>`).join('')}
                    </select>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="input-group">
                        <label class="input-label">Data Início</label>
                        <input name="data_inicio" type="date" class="input-field" required>
                    </div>
                    <div class="input-group">
                        <label class="input-label">Data Fim</label>
                        <input name="data_fim" type="date" class="input-field" required>
                    </div>
                </div>

                <div class="flex justify-end pt-4 border-t border-slate-100">
                    <button type="submit" class="btn btn-primary w-full">Confirmar Alocação</button>
                </div>
            </form>
        `, 'modal-md');
    },

    async openEditModal(turmaId, ucId, allocId) {
        // Reuse logic but pre-fill. 
        // Fetch current allocation details
        const { data: alloc } = await import('../services/supabase.js').then(m => m.supabase.from('alocacoes_ambientes').select('*').eq('id', allocId).single());
        if (!alloc) return;

        const ambientesData = await import('../services/ambientes.js').then(m => m.ambientesService.list());
        const ambientesList = ambientesData.filter(a => a.status === 'Ativo');

        ui.openModalWindow('Editar Alocação', `
            <form onsubmit="app.alocacaoAmbientes.submitEdit(event, '${allocId}', '${turmaId}')" class="space-y-4">
                <div class="input-group">
                    <label class="input-label">Ambiente</label>
                    <select name="ambiente_id" class="input-field" required>
                        <option value="">Selecione...</option>
                        ${ambientesList.map(a => `<option value="${a.id}" ${a.id === alloc.ambiente_id ? 'selected' : ''}>${a.nome} (${a.capacidade} lug.) - ${a.tipo}</option>`).join('')}
                    </select>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="input-group">
                        <label class="input-label">Data Início</label>
                        <input name="data_inicio" type="date" class="input-field" required value="${alloc.data_inicio.slice(0, 10)}">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Data Fim</label>
                        <input name="data_fim" type="date" class="input-field" required value="${alloc.data_fim.slice(0, 10)}">
                    </div>
                </div>

                <div class="flex justify-between pt-4 border-t border-slate-100">
                    <button type="button" onclick="app.alocacaoAmbientes.deleteAlloc('${allocId}', '${turmaId}')" class="btn btn-white text-red-600 border-red-200 hover:bg-red-50">Excluir</button>
                    <button type="submit" class="btn btn-primary">Salvar Alterações</button>
                </div>
            </form>
        `, 'modal-md');
    },

    async submitAlloc(e, turmaId, ucId) {
        e.preventDefault();
        const f = e.target;

        // We need course_id and docente_id as well to keep data consistent?
        // 'alocacoes_ambientes' has columns course_id, docente_id.
        // We should try to fetch them from Turma/Lotacao if possible, or leave null if not critical (but data consistency helps)
        // Let's do a quick fetch or passed params. 
        // For now, let's insert essential linkage. The table schema allows nulls? 
        // I made 'docente_id' and 'curso_id' nullable or not? Migration said:
        // "docente_id UUID REFERENCES docentes(id) ON DELETE SET NULL" (Previous step)
        // "curso_id UUID REFERENCES cursos(id) ON DELETE SET NULL"
        // So they are nullable.

        // However, for reporting, it's nice to have.
        // Let's fetch the turma's course.
        const turma = app.state.classes.find(t => t.id === turmaId);

        const data = {
            turma_id: turmaId,
            uc_id: ucId,
            ambiente_id: f.ambiente_id.value,
            data_inicio: f.data_inicio.value,
            data_fim: f.data_fim.value,
            curso_id: turma?.curso_id || null
        };

        try {
            await ambientesService.createBlockAllocation(data); // Reusing creating method
            ui.toast('Alocação salva com sucesso!');
            ui.closeModal(); // Close form modal
            this.openDetails(turmaId); // Refresh details modal
        } catch (err) {
            ui.toast(err.message, 'error');
        }
    },

    async submitEdit(e, allocId, turmaId) {
        e.preventDefault();
        const f = e.target;

        const data = {
            ambiente_id: f.ambiente_id.value,
            data_inicio: f.data_inicio.value,
            data_fim: f.data_fim.value
        };

        try {
            const { error } = await import('../services/supabase.js').then(m => m.supabase.from('alocacoes_ambientes').update(data).eq('id', allocId));
            if (error) throw error;

            ui.toast('Alocação atualizada!');
            ui.closeModal();
            this.openDetails(turmaId);
        } catch (err) {
            ui.toast(err.message, 'error');
        }
    },

    async deleteAlloc(allocId, turmaId) {
        if (!confirm('Remover esta alocação?')) return;
        try {
            await ambientesService.deleteBlockAllocation(allocId);
            ui.toast('Removido com sucesso.');
            ui.closeModal();
            this.openDetails(turmaId);
        } catch (err) {
            ui.toast(err.message, 'error');
        }
    }
};
