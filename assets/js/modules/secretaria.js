
import { supabase } from '../services/supabase.js';

export const secretaria = {
    async render(state) {
        const { data: alunos } = await supabase.from('alunos').select('*, turmas(codigo_sge)');
        return `
            <div class="max-w-6xl mx-auto space-y-8">
                <header class="flex justify-between items-center">
                    <div>
                        <h2 class="text-3xl font-bold text-gray-800">Secretaria Digital</h2>
                         <p class="text-gray-500 mt-1">Gestão Acadêmica e Matrículas</p>
                    </div>
                    <button class="btn-primary shadow-lg shadow-blue-500/20" onclick="alert('Funcionalidade Matrícula segue padrão similar ao Planejamento.')">
                        <i class="ph ph-user-plus"></i> Nova Matrícula
                    </button>
                </header>

                <div class="table-container shadow-sm">
                    <table class="w-full text-sm text-left">
                        <thead class="table-header">
                            <tr>
                                <th class="px-6 py-4">Nome do Aluno</th>
                                <th class="px-6 py-4">RA / CPF</th>
                                <th class="px-6 py-4">Turma Atual</th>
                                <th class="px-6 py-4 text-center">Status</th>
                                <th class="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-50">
                            ${alunos.map(a => `
                                <tr class="table-row group">
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-3">
                                            <div class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">
                                                ${a.nome.charAt(0)}
                                            </div>
                                            <span class="font-bold text-gray-700 group-hover:text-emerald-700 transition-colors">${a.nome}</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 font-mono text-gray-500">${a.rm_cpf}</td>
                                    <td class="px-6 py-4">
                                        ${a.turmas?.codigo_sge
                ? `<span class="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-bold border border-blue-100">${a.turmas.codigo_sge}</span>`
                : '<span class="text-gray-400 text-xs italic">Sem turma</span>'}
                                    </td>
                                    <td class="px-6 py-4 text-center">
                                        <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 mx-auto animate-pulse" title="Ativo"></div>
                                    </td>
                                    <td class="px-6 py-4 text-right">
                                        <button class="text-gray-400 hover:text-blue-600 transition-colors"><i class="ph ph-dots-three-vertical text-lg"></i></button>
                                    </td>
                                </tr>
                            `).join('') || '<tr><td colspan="5" class="p-8 text-center text-gray-400 italic">Nenhum aluno matriculado.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
};
