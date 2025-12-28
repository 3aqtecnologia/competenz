
import { ambientesService } from '../services/ambientes.js';
import { ui } from '../utils/ui.js';
import { ux } from '../utils/ux.js';

export const ambientes = {
    state: {
        list: []
    },

    render(globalState) {
        setTimeout(() => this.init(), 50);

        return `
            <div class="animate-fade-in" style="padding-bottom: 80px;">
                <!-- Header -->
                <div class="flex-between mb-6">
                    <div>
                        <h2 class="text-2xl font-bold text-slate-800">Ambientes</h2>
                        <p class="text-slate-500">Gestão de Salas, Laboratórios e Oficinas</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="app.navigate('alocacaoAmbientes')" class="btn btn-white text-slate-600 border border-slate-200 hover:bg-slate-50">
                            <i class="ph ph-calendar-plus"></i> Visão de Turmas
                        </button>
                        <button onclick="app.ambientes.openReportModal()" class="btn btn-white text-slate-600 border border-slate-200 hover:bg-slate-50">
                            <i class="ph ph-printer"></i> Relatório
                        </button>
                        <button onclick="app.ambientes.openModal()" class="btn btn-primary">
                            <i class="ph ph-plus-circle"></i> Novo Ambiente
                        </button>
                    </div>
                </div>

                <!-- Filters could go here -->

                <!-- List Content -->
                <div id="ambientes-list-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     <div class="col-span-1 md:col-span-2 lg:col-span-3">
                        <div class="loading-spinner"></div>
                     </div>
                </div>
            </div>
        `;
    },

    async init() {
        try {
            const list = await ambientesService.list();
            this.state.list = list;
            this.renderList(list);
        } catch (err) {
            console.error(err);
            const container = document.getElementById('ambientes-list-container');
            if (container) container.innerHTML = ux.renderError('Falha ao carregar dados.');
        }
    },

    renderList(list) {
        const container = document.getElementById('ambientes-list-container');
        if (!container) return;

        if (!list || list.length === 0) {
            container.innerHTML = `<div class="col-span-full">${ux.renderEmptyState('Nenhum ambiente encontrado.')}</div>`;
            return;
        }

        container.innerHTML = list.map(a => `
            <div class="card p-4 hover:shadow-lg transition-all cursor-pointer border border-transparent hover:border-blue-200 group relative flex flex-col"
                 onclick="app.ambientes.openAllocations('${a.id}')">
                
                <div class="flex justify-between items-start mb-3">
                    <div class="p-3 rounded-lg ${this.getTypeColorClass(a.tipo)} text-white shadow-sm">
                        <i class="${this.getTypeIcon(a.tipo)} text-xl"></i>
                    </div>
                    <span class="px-2 py-1 text-[10px] font-bold uppercase rounded ${a.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                        ${a.status}
                    </span>
                </div>

                <h3 class="font-bold text-slate-800 text-lg mb-1 line-clamp-1">${a.nome}</h3>
                <p class="text-xs text-slate-500 mb-3">${a.tipo} • ${a.capacidade} Lugares</p>

                ${a.recursos ? `
                <div class="flex flex-wrap gap-1 mb-4">
                    ${a.recursos.split(',').slice(0, 3).map(r => `<span class="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full">${r.trim()}</span>`).join('')}
                    ${a.recursos.split(',').length > 3 ? '<span class="text-[10px] text-slate-400">...</span>' : ''}
                </div>` : '<div class="mb-4 text-xs text-slate-300 italic">Sem recursos listados</div>'}

                <div class="pt-3 border-t border-slate-100 mt-auto text-center font-medium text-xs flex items-center justify-between px-2">
                    <button class="text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors" onclick="event.stopPropagation(); app.ambientes.generateChecklist('${a.id}')">
                         <i class="ph ph-check-square"></i> Checklist
                    </button>
                    <button class="text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors group-hover:underline">
                         Gerenciar Alocação <i class="ph-bold ph-arrow-right"></i>
                    </button>
                </div>

                <button onclick="event.stopPropagation(); app.ambientes.openModal('${a.id}')" 
                        class="absolute top-4 right-12 text-slate-300 hover:text-blue-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Editar Cadastro">
                    <i class="ph ph-pencil-simple text-lg"></i>
                </button>
            </div>
        `).join('');
    },

    getTypeColorClass(type) {
        const map = {
            'Sala de Aula': 'bg-green-500',
            'Laboratório': 'bg-blue-500',
            'Oficina': 'bg-orange-600',
            'Auditório': 'bg-purple-600',
            'Outro': 'bg-slate-500'
        };
        return map[type] || 'bg-slate-500';
    },

    getTypeIcon(type) {
        const map = {
            'Sala de Aula': 'ph ph-chalkboard',
            'Laboratório': 'ph ph-desktop-tower',
            'Oficina': 'ph ph-wrench',
            'Auditório': 'ph ph-microphone-stage'
        };
        return map[type] || 'ph ph-buildings';
    },

    // --- CRUD ---
    openModal(id = null) {
        const item = id ? this.state.list.find(x => x.id === id) : null;

        ui.openModalWindow(item ? 'Editar Ambiente' : 'Novo Ambiente', `
            <form onsubmit="app.ambientes.onSubmit(event, '${id || ''}')" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="input-group">
                        <label class="input-label">Nome do Ambiente</label>
                        <input name="nome" class="input-field" required value="${item?.nome || ''}" placeholder="Ex: Laboratório 01">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Tipo</label>
                        <select name="tipo" class="input-field">
                            ${['Sala de Aula', 'Laboratório', 'Oficina', 'Auditório', 'Outro'].map(t =>
            `<option value="${t}" ${item?.tipo === t ? 'selected' : ''}>${t}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="input-group">
                        <label class="input-label">Capacidade</label>
                        <input name="capacidade" type="number" class="input-field" value="${item?.capacidade || 0}">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Status</label>
                        <select name="status" class="input-field">
                            <option value="Ativo" ${item?.status === 'Ativo' ? 'selected' : ''}>Ativo</option>
                            <option value="Inativo" ${item?.status === 'Inativo' ? 'selected' : ''}>Inativo</option>
                            <option value="Manutenção" ${item?.status === 'Manutenção' ? 'selected' : ''}>Manutenção</option>
                        </select>
                    </div>
                </div>
                <div class="input-group">
                    <label class="input-label">Recursos (Separados por vírgula)</label>
                    <textarea name="recursos" class="input-field" rows="3" placeholder="Ex: Projetor, Computadores, Lousa...">${item?.recursos || ''}</textarea>
                </div>
                <div class="flex justify-end gap-2 pt-4 border-t border-slate-100">
                    <button type="button" onclick="ui.closeModal()" class="btn btn-secondary">Cancelar</button>
                    ${id ? `<button type="button" onclick="app.ambientes.delete('${id}')" class="btn btn-white text-red-600 mr-auto">Excluir</button>` : ''}
                    <button type="submit" class="btn btn-primary">Salvar</button>
                </div>
            </form>
        `);
    },

    async onSubmit(e, id) {
        e.preventDefault();
        const f = e.target;
        const data = {
            nome: f.nome.value,
            tipo: f.tipo.value,
            capacidade: f.capacidade.value,
            recursos: f.recursos.value,
            status: f.status.value
        };

        try {
            await ambientesService.save(data, id);
            ui.toast('Registro salvo com sucesso!');
            ui.closeModal();
            this.init();
        } catch (err) {
            ui.toast(err.message, 'error');
        }
    },

    async delete(id) {
        if (!confirm('Deseja excluir este ambiente?')) return;
        try {
            await ambientesService.delete(id);
            ui.toast('Remover com sucesso.');
            ui.closeModal();
            this.init();
        } catch (err) {
            ui.toast('Erro: ' + err.message, 'error');
        }
    },

    openReportModal() {
        ui.openModalWindow('Alocação de Ambientes', `
            <div class="p-1">
                <p class="text-sm text-slate-500 mb-4">Selecione o período para gerar o relatório de alocação de ambientes em PDF.</p>
                <form onsubmit="app.ambientes.generateReport(event)" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="input-group">
                            <label class="input-label">Data Início</label>
                            <input name="start" type="date" class="input-field" required>
                        </div>
                        <div class="input-group">
                            <label class="input-label">Data Fim</label>
                            <input name="end" type="date" class="input-field" required>
                        </div>
                    </div>
                    <div class="flex justify-end pt-2 border-t border-slate-50 mt-4">
                        <button type="submit" class="btn btn-primary w-full md:w-auto">
                            <i class="ph ph-file-pdf"></i> Gerar PDF
                        </button>
                    </div>
                </form>
            </div>
        `);
    },

    async generateReport(e) {
        e.preventDefault();
        const start = e.target.start.value;
        const end = e.target.end.value;

        try {
            ui.toast('Buscando dados...', 'info');
            // Use new service method
            const data = await ambientesService.getReportNew(start, end);

            if (!data || !data.length) {
                ui.toast('Nenhum dado encontrado no período selecionado.', 'warning');
                return;
            }

            ui.toast('Gerando PDF...', 'info');

            const reportEl = document.createElement('div');
            reportEl.className = 'p-8 bg-white text-slate-800 font-sans';
            // Same Header ...
            reportEl.innerHTML = `
                <!-- Header -->
                <div class="flex justify-between items-end mb-8 pb-4 border-b-2 border-slate-800">
                    <div>
                        <h1 class="text-3xl font-bold uppercase tracking-wide text-slate-900">Alocação de Ambientes</h1>
                        <p class="text-sm text-slate-500 mt-1">SGP - Sistema de Gestão Pedagógica</p>
                    </div>
                    <div class="text-right">
                         <p class="text-xs font-bold text-slate-400 uppercase">Período</p>
                         <p class="text-lg font-mono font-medium text-slate-700">
                            ${window.dayjs(start).format('DD/MM/YYYY')} <span class="text-slate-400 mx-1">até</span> ${window.dayjs(end).format('DD/MM/YYYY')}
                         </p>
                    </div>
                </div>

                <table class="w-full text-xs text-left mb-8">
                    <thead class="bg-slate-100 text-slate-600 border-b-2 border-slate-200 uppercase tracking-wider font-bold">
                        <tr>
                            <th class="p-3">Período</th>
                            <th class="p-3">Ambiente</th>
                            <th class="p-3">Curso</th>
                            <th class="p-3">Turno</th>
                            <th class="p-3">Docente</th>
                        </tr>
                    </thead>
                    <tbody class="text-slate-700">
                        ${data.map(r => `
                            <tr class="border-b border-slate-100 hover:bg-slate-50">
                                <td class="p-3 whitespace-nowrap font-medium text-slate-900">
                                     ${window.dayjs(r.data_inicio.slice(0, 10)).format('DD/MM/YY')}
                                     <span class="text-slate-400 mx-1">➜</span>
                                     ${window.dayjs(r.data_fim.slice(0, 10)).format('DD/MM/YY')}
                                </td>
                                <td class="p-3 font-bold">${r.ambientes.nome} <span class="font-normal text-[10px] text-slate-400 block">${r.ambientes.tipo}</span></td>
                                <td class="p-3">${r.cursos?.nome || '-'}</td>
                                <td class="p-3"><span class="bg-slate-100 px-2 py-1 rounded text-[10px] uppercase font-bold text-slate-600">${r.turmas?.turno || '-'}</span></td>
                                <td class="p-3 font-medium">${r.docentes?.nome || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="flex justify-between items-center pt-4 border-t border-slate-200">
                    <div class="text-[10px] text-slate-400">Competenz Tecnologia Educacional</div>
                    <div class="text-[10px] text-slate-400">Gerado em ${new Date().toLocaleString('pt-BR')}</div>
                </div>
            `;

            const opt = {
                margin: 10,
                filename: `Relatorio_Ocupacao_${start}_${end}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, logging: false },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            await html2pdf().set(opt).from(reportEl).save();
            ui.toast('Download do PDF iniciado!');
            ui.closeModal();

        } catch (err) {
            console.error(err);
            ui.toast('Erro ao gerar relatório: ' + err.message, 'error');
        }
    },

    // --- Allocations UI ---
    async openAllocations(ambienteId) {
        const item = this.state.list.find(x => x.id === ambienteId);
        if (!item) return;

        ui.openModalWindow(`Gestão de Alocações: ${item.nome}`, `
            <div id="allocations-content" class="min-h-[300px] flex items-center justify-center">
                <div class="loading-spinner"></div>
            </div>
        `, 'modal-lg');

        try {
            // Load Data using Promises
            const [allocs, teachersRes, coursesRes] = await Promise.all([
                ambientesService.listBlockAllocations(ambienteId),
                // Try from state or fetch
                app.state.teachers ? { data: app.state.teachers } : import('../services/supabase.js').then(m => m.supabase.from('docentes').select('id, nome')),
                app.state.courses ? { data: app.state.courses } : import('../services/supabase.js').then(m => m.supabase.from('cursos').select('id, nome'))
            ]);

            // Handle response structure differences
            const teachers = Array.isArray(teachersRes.data) ? teachersRes.data : (app.state.teachers || []);
            const courses = Array.isArray(coursesRes.data) ? coursesRes.data : (app.state.courses || []);

            this.renderAllocationsContent(ambienteId, allocs || [], teachers, courses);
        } catch (err) {
            console.error(err);
            const el = document.getElementById('allocations-content');
            if (el) el.innerHTML = ux.renderError('Erro ao carregar alocações. ' + err.message);
        }
    },

    renderAllocationsContent(ambienteId, allocs, teachers, courses) {
        const container = document.getElementById('allocations-content');
        if (!container) return;

        const today = new Date().toISOString().split('T')[0];
        const future = allocs.filter(m => m.data_inicio >= today);
        const past = allocs.filter(m => m.data_inicio < today);

        const renderTable = (rows) => {
            if (!rows.length) return '<div class="text-xs text-slate-400 italic p-3 bg-slate-50 rounded border border-slate-100 text-center">Nenhum agendamento neste período.</div>';
            return `
            <div class="overflow-hidden border rounded-lg">
                <table class="w-full text-xs text-left">
                    <thead class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                            <th class="p-2">Período</th>
                            <th class="p-2">Curso</th>
                            <th class="p-2">Docente</th>
                            <th class="p-2 w-8"></th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 bg-white">
                        ${rows.map(r => `
                            <tr>
                                <td class="p-2 whitespace-nowrap">
                                    <span class="font-mono text-slate-600">${window.dayjs(r.data_inicio.slice(0, 10)).format('DD/MM/YY')}</span>
                                    <span class="text-[10px] text-slate-400 block">até ${window.dayjs(r.data_fim.slice(0, 10)).format('DD/MM/YY')}</span>
                                </td>
                                <td class="p-2 font-bold text-slate-700">${r.cursos?.nome || '-'}</td>
                                <td class="p-2 text-slate-600">${r.docentes?.nome || '-'}</td>
                                <td class="p-2 text-center">
                                    <button onclick="app.ambientes.removeBlockAlloc('${r.id}', '${ambienteId}')" class="text-slate-400 hover:text-red-500 transition-colors" title="Remover">
                                        <i class="ph ph-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>`;
        };

        container.className = 'block';
        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Form Panel -->
                <div class="bg-blue-50/50 p-5 rounded-xl border border-blue-100 h-fit">
                    <h4 class="font-bold text-blue-900 mb-4 text-sm flex items-center gap-2">
                        <i class="ph-fill ph-plus-circle text-blue-500"></i> Nova Alocação
                    </h4>
                    
                    <form onsubmit="app.ambientes.submitAlloc(event, '${ambienteId}')" class="space-y-4">
                        <div class="input-group mb-0">
                            <label class="input-label text-blue-800">Curso</label>
                            <select name="curso_id" class="input-field text-sm bg-white" required>
                                <option value="">Selecione...</option>
                                ${courses.map(c => `<option value="${c.id}">${c.nome}</option>`).join('')}
                            </select>
                        </div>

                         <div class="input-group mb-0">
                            <label class="input-label text-blue-800">Docente</label>
                            <select name="docente_id" class="input-field text-sm bg-white" required>
                                <option value="">Selecione...</option>
                                ${teachers.map(t => `<option value="${t.id}">${t.nome}</option>`).join('')}
                            </select>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-3">
                            <div class="input-group mb-0">
                                <label class="input-label text-blue-800">Data Início</label>
                                <input name="start" type="date" class="input-field text-sm bg-white" required>
                            </div>
                            <div class="input-group mb-0">
                                <label class="input-label text-blue-800">Data Fim</label>
                                <input name="end" type="date" class="input-field text-sm bg-white" required>
                            </div>
                        </div>

                        <button type="submit" class="btn btn-primary btn-sm w-full shadow-sm mt-2">
                            Confirmar Alocação
                        </button>
                    </form>
                </div>

                <!-- List Panel -->
                <div class="space-y-5 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                    <div>
                        <h4 class="font-bold text-slate-700 text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full bg-green-500"></span> Agendamentos Futuros
                        </h4>
                        ${renderTable(future)}
                    </div>
                    <div>
                         <h4 class="font-bold text-slate-400 text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full bg-slate-300"></span> Histórico Recente
                        </h4>
                        ${renderTable(past.slice(0, 5))} 
                    </div>
                </div>
            </div>
        `;
    },

    async submitAlloc(e, ambienteId) {
        e.preventDefault();
        const f = e.target;
        const data = {
            ambiente_id: ambienteId,
            curso_id: f.curso_id.value,
            docente_id: f.docente_id.value,
            data_inicio: f.start.value,
            data_fim: f.end.value
        };

        if (data.data_inicio > data.data_fim) {
            ui.toast('Data Início não pode ser maior que Data Fim', 'warning');
            return;
        }

        try {
            await ambientesService.createBlockAllocation(data);
            ui.toast('Alocação registrada com sucesso!');
            this.openAllocations(ambienteId);
        } catch (err) {
            console.error(err);
            ui.toast('Erro ao salvar: ' + err.message, 'error');
        }
    },

    async removeBlockAlloc(id, ambienteId) {
        if (!confirm('Remover esta alocação?')) return;
        try {
            await ambientesService.deleteBlockAllocation(id);
            this.openAllocations(ambienteId);
        } catch (err) {
            ui.toast('Erro: ' + err.message, 'error');
        }
    },

    async removeSingleAlloc(id, ambienteId) {
        if (!confirm('Liberar este agendamento específico?')) return;
        try {
            await ambientesService.removeAllocation(id);
            this.openAllocations(ambienteId);
        } catch (err) {
            ui.toast('Erro: ' + err.message, 'error');
        }
    },

    generateChecklist(id) {
        const item = this.state.list.find(x => x.id === id);
        if (!item) return;

        const resources = item.recursos ? item.recursos.split(',').map(r => r.trim()).filter(r => r) : [];
        if (!resources.length) {
            ui.toast('Este ambiente não possui recursos cadastrados para gerar checklist.', 'warning');
            return;
        }

        // Generate printable view
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Checklist - ${item.nome}</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
                    .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
                    .title { font-size: 24px; font-weight: bold; text-transform: uppercase; }
                    .subtitle { font-size: 14px; color: #666; margin-top: 5px; }
                    .info { font-size: 14px; margin-bottom: 15px; }
                    .checklist-item { display: flex; align-items: center; padding: 15px 0; border-bottom: 1px solid #eee; }
                    .checkbox { width: 20px; height: 20px; border: 2px solid #333; margin-right: 15px; border-radius: 4px; }
                    .item-name { font-size: 16px; font-weight: 500; }
                    .footer { margin-top: 50px; font-size: 12px; color: #888; text-align: center; border-top: 1px solid #ddd; padding-top: 20px; }
                    .signature-box { margin-top: 50px; border-top: 1px solid #333; width: 300px; padding-top: 5px; text-align: center; }
                    @media print {
                        .no-print { display: none; }
                        body { padding: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <div class="title">Checklist de Recursos</div>
                        <div class="subtitle">Conferência de Ambiente</div>
                    </div>
                    <div style="text-align: right;">
                        <strong>${item.nome}</strong><br>
                        ${item.tipo}
                    </div>
                </div>

                <div class="info">
                    <strong>Data da Conferência:</strong> ______/______/___________ &nbsp;&nbsp;&nbsp;
                    <strong>Hora:</strong> _____:_____
                </div>

                <div class="list">
                    ${resources.map(r => `
                        <div class="checklist-item">
                            <div class="checkbox"></div>
                            <div class="item-name">${r}</div>
                        </div>
                    `).join('')}
                    
                    <!-- Extra Empty Lines -->
                    <div class="checklist-item">
                        <div class="checkbox"></div>
                        <div class="item-name" style="color: #ccc; font-style: italic;">Observações: ________________________________________________</div>
                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; margin-top: 60px;">
                    <div class="signature-box">Responsável pela Conferência</div>
                    <div class="signature-box">Responsável pelo Ambiente</div>
                </div>

                <div class="footer">
                    Documento gerado pelo SGP em ${new Date().toLocaleString('pt-BR')}
                </div>

                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }
};

