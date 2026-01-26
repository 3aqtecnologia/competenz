# 🎓 Competenz | Gestão Educacional

**Competenz** é um sistema moderno de gestão educacional focado em simplificar processos administrativos e pedagógicos. Construído com uma arquitetura leve e responsiva, o sistema oferece uma experiência de usuário fluida e intuitiva.

![Status do Projeto](https://img.shields.io/badge/status-em_desenvolvimento-yellow)
![Tech Stack](https://img.shields.io/badge/stack-HTML_|_Tailwind_|_JS-blue)
![Backend](https://img.shields.io/badge/backend-Supabase-green)

## 🆕 Histórico de Versões

### v2.6 - Integridade Curricular & UI Docente (Jan/2026)

- **📚 Gestão Curricular Robusta**:
  - **Catálogo de UCs Refinado**: Interface do catálogo modernizada com Tailwind para consistência visual.
  - **Filtros Avançados**: Correção na filtragem de UCs por Área Tecnológica (suporte a múltiplas áreas).
  - **Integridade de Dados**:
    - **Proteção de Exclusão**: Bloqueio de exclusão de Matrizes e UCs que possuem vínculos ativos (Turmas, Cursos).
    - **Atualização em Cascata**: Alterar a carga horária de uma UC atualiza automaticamente o total de horas de todas as Matrizes vinculadas.
  - **Detalhes "Read-Only"**: Novo modal de visualização de detalhes pedagógicos (Capacidades, Saberes) sem risco de edição acidental.
- **👨‍🏫 Gestão Docente**:
  - **Visibilidade de Lotação**: Lista de docentes agora exibe se o professor está "Em aula" (alocado em turma ativa).
  - **Detalhes de Lotação**: Modal de edição mostra informações completas da alocação atual (Turma, Início e Fim).
  - **Correções de UI**: Ajuste na exibição de nomes em tabelas de agendamento (correção de JOIN).
- **🛠️ Melhorias Técnicas**:
  - **Tratamento de Erros**: Mensagens de erro amigáveis para violações de FK (Foreign Keys) ao tentar excluir registros.
  - **Limpeza de Banco**: Remoção de referências a colunas inexistentes (`ativo` em UCs) e tabelas legadas.

### v2.5 - Gestão de Acessos Completa (Jan/2026)

- **👥 Gestão de Usuários Aprimorada**:
  - **Carregamento Automático**: Dados de usuários e perfis carregados automaticamente do Supabase ao acessar a tab.
  - **Loading State**: Spinner de carregamento enquanto busca dados do banco.
  - **Edição Completa**: Implementação total da funcionalidade de edição de usuários com todos os campos.
  - **Vinculações Dinâmicas**: Gerenciamento de vinculações de turmas (Analista de Educação) e docentes (Coordenador Pedagógico).
- **🎨 UX Melhorada**:
  - **Máscaras de Input**: Aplicação automática de máscara de telefone nos formulários de criação e edição.
  - **Formulários Inteligentes**: Campos de vinculação aparecem/desaparecem dinamicamente baseado no perfil selecionado.
  - **Feedback Visual**: Toast messages para todas as operações (criar, editar, excluir).
- **🔧 Correções Técnicas**:
  - **Alias openModal**: Adicionada função `ui.openModal()` como alias de `ui.openModalWindow()` para compatibilidade.
  - **Pré-preenchimento**: Todos os campos do formulário de edição são pré-preenchidos com valores atuais.
  - **Checkbox de Status**: Toggle "Usuário Ativo" funcional no formulário de edição.

### v2.4 - Arquitetura Modular com Antigravity Kit (Jan/2026)

- **🤖 Antigravity Kit Integration**:
  - **Agentes Especializados**: Implementação de agentes AI especializados (Frontend Specialist, Backend Specialist, Mobile Developer, etc.) para desenvolvimento guiado.
  - **Skills Modulares**: Sistema de skills reutilizáveis (clean-code, react-patterns, frontend-design, etc.) para melhores práticas.
  - **Workflows Automatizados**: Comandos slash (/create, /debug, /deploy, /test) para automação de tarefas comuns.
  - **Intelligent Routing**: Seleção automática do agente mais adequado baseado no contexto da tarefa.
- **📐 Design System Consistency**:
  - **Frontend Specialist Rules**: Aplicação rigorosa de regras de design (Purple Ban, Layout Diversification, Deep Design Thinking).
  - **Anti-Cliché Protocol**: Verificação automática contra padrões genéricos (Bento Grid, Mesh Gradients, Standard Splits).
  - **Quality Control Loop**: Validação obrigatória (lint + TypeScript) após cada edição.
- **🔧 Developer Experience**:
  - **GEMINI.md**: Arquivo central de configuração do comportamento da AI no workspace.
  - **Task Planning**: Sistema de planejamento estruturado com artifacts e walkthroughs.
  - **Code Review Automation**: Checklists automáticos de qualidade de código.

### v2.3 - Automação Docente & Style Guide 2.0 (Jan/2026)

- **🎨 Style Guide 2.0 (Premium UI)**:
  - **Identidade Visual Refinada**: Implementação rigorosa do novo guia de estilos com paleta Dark Navy (`#1a1a2e`) e Lime Green (`#b3ff50`).
  - **Design System Unificado**: Migração completa para **Tailwind CSS** com configuração centralizada em `tailwind.config`.
  - **Componentes Modernos**: Botões, Inputs e Cards com bordas arredondadas (Radius 12px/16px) e sombras suaves ("Float" & "Glow").
  - **Limpeza de Código**: Remoção de 8 arquivos CSS legados, centralizando a estilização em `app.css` e utilitários Tailwind.
- **🤖 Automação Docente**:
  - **Cadastro Automático**: Criação automática de usuário no sistema ao cadastrar um docente no Planejamento.
  - **Perfil "Docente"**: Novo perfil com permissões específicas para autogestão (Meus Dados, Minha Disponibilidade).
  - **Fluxo de Lotação**: Notificações automáticas de alocação em turmas e fluxo de Aceite/Recusa para o professor.
  - **Metadados Inteligentes**: Geração de senha inicial baseada no CPF e flags de "Primeiro Acesso".

### v2.2 - Auditoria, Perfil & Localização (Jan/2026)

- **🔒 Auditoria e Segurança**:
  - **Logs de Acesso Detalhados**: Registro automático de Login/Logout com captura de IP e User Agent.
  - **Identificação Real**: Logs agora armazenam o nome do usuário para auditoria facilitada.
  - **Termos e Privacidade**: Seção dedicada a Cookies e Armazenamento Local nos Termos de Uso.
- **👤 Meu Perfil Aprimorado**:
  - **Gestão de Dados**: Atualização de telefone com máscara dinâmica (Fixo/Celular) e toggle "É WhatsApp".
  - **Avatar**: Upload e visualização de foto de perfil.
  - **Alteração de Senha**: Fluxo seguro com logout automático.
- **🌍 Localização e Timezone**:
  - **Fuso Horário Fixo**: Todo o sistema agora opera explicitamente em `America/Fortaleza`, garantindo consistência em datas e horários independente da máquina do usuário.
  - **Dashboard Personalizado**: Saudação ("Bom dia", etc.) baseada na hora local da instituição e exibição do nome real do usuário.

### v2.1 - Secretaria, Pedagógico & Gestão (Jan/2026)

- **🏛️ Módulo Secretaria (Novo)**:
  - Gestão completa de pré-matrículas e alunos.
  - UI refinada com listagens em cartões (Token List) e filtros rápidos.
  - Controle de documentos pendentes e status de enturmação.
- **🎓 Módulo Pedagógico (Novo)**:
  - Interface dedicada para docentes registrarem Diários de Classe e Frequência.
  - Gestão de Avaliações e Notas por turma e aluno.
  - Dashboards de desempenho e painéis de indicadores acadêmicos.
- **👥 Gestão de Responsáveis**:
  - **Vínculo Oficial**: Agora é possível definir oficialmente um **Coordenador Pedagógico** e um **Analista de Educação** para cada turma.
  - **Identificação Visual**: Ícones e nomes dos responsáveis exibidos diretamente nos cards de listagem de turmas.
- **🤖 Automação de Cronogramas**:
  - **Recálculo Inteligente**: Ao alterar regras de frequência (dias letivos, carga horária, início), o sistema regera todas as datas de aula automaticamente.
  - **Previsão Automática**: A "Data de Término Prevista" é calculada em tempo real, garantindo coerência entre o plano de aula e o calendário.
  - **UI Aprimorada**: Formulário de regras de frequência com design visual moderno e seleção intuitiva de dias da semana.
- **✨ UI Refinada**:
  - **Tabs Expansivas**: Menus de navegação interna agora ocupam 100% da largura disponível.
  - **Cards de Ação**: Botões e indicadores visuais mais claros em toda a aplicação.

### v2.0 - UI Premium & Dashboard Inteligente (Jan/2026)

- **✨ UI/UX Premium Refinado**:
  - **Login Split Screen**: Nova experiência de login com layout dividido, animações suaves e identidade visual reforçada (Dark Navy + Lime Green).
  - **Recuperação de Senha Completa**: Página de "Esqueceu a senha" redesenhada para total consistência visual com o login.
  - **Branding Coeso**: Padronização de logos, favicons e assinaturas de rodapé em todo o sistema.
- **🧠 Dashboard Inteligente (Smart Dashboard)**:
  - **Contexto de Usuário**: O dashboard agora adapta saudação, métricas e atalhos de ação baseados no perfil logado (Docente vs Coordenador vs Secretaria).
  - **Dicas Dinâmicas**: Cards de dicas rotativos personalizados para gestão escolar.
- **📱 Mobile First & Acessibilidade**:
  - **Layout Responsivo Profundo**: Melhorias significativas na visualização mobile de tabelas e menus laterais.
  - **Contraste e Acessibilidade**: Ajustes de cores para garantir leitura confortável em todos os dispositivos.

### v1.0 - Lançamento Inicial (Dez/2025)

- **🚀 Funcionalidades**:
  - Sistema de Login Unificado com Auth via Supabase.
  - Módulos Iniciais: Planejamento, Docentes, Turmas, Matrizes.
  - Dashboard básico com estatísticas rápidas.
  - Integração inicial com banco de dados Supabase.
  - Estrutura de projeto modular baseada em Vanilla JS + Tailwind.

***

## 🛠️ Tecnologias

- **Frontend**: HTML5, Vanilla JavaScript (ES Modules), Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Libs**: Day.js (Datas), IMask (Máscaras), SheetJS (Excel), Chart.js (Gráficos), jsPDF (Relatórios)

## 📌 Próximos Passos (Roadmap)

- [ ] Implementação do módulo financeiro básico.
- [ ] Melhoria na geração de relatórios PDF (com cabeçalhos dinâmicos).
- [ ] Sistema de notificações em tempo real.

***

Desenvolvido por **3AQ Tecnologia**.
