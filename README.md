# 🎓 Competenz | Gestão Educacional

**Competenz** é um sistema moderno de gestão educacional focado em simplificar processos administrativos e pedagógicos. Construído com uma arquitetura leve e responsiva, o sistema oferece uma experiência de usuário fluida e intuitiva.

![Status do Projeto](https://img.shields.io/badge/status-em_desenvolvimento-yellow)
![Tech Stack](https://img.shields.io/badge/stack-HTML_|_Tailwind_|_JS-blue)
![Backend](https://img.shields.io/badge/backend-Supabase-green)

## 🆕 Histórico de Versões

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
  - **Sidebar Responsiva**: Ajustes de Z-Index e comportamento da sidebar em dispositivos móveis.
  - **Adaptação de Logos**: Tamanhos de logo otimizados para diferentes viewports.

### v1.9 - Sistema SaaS com ACL (Jan/2026)

- **🔐 Sistema de Autenticação Completo**:
  - Integração com Supabase Auth para login seguro
  - Página de login moderna e responsiva
  - Gestão de sessão com redirecionamento automático
  - Logout com confirmação
- **👥 Gestão de Usuários e Perfis**:
  - 6 perfis pré-configurados com permissões específicas
  - Interface administrativa para gestão de usuários
  - Vinculação de usuários a turmas e docentes
  - Controle de acesso baseado em perfis (ACL)
- **🛡️ Controle de Acesso (ACL)**:
  - Permissões granulares por módulo e ação
  - Filtragem automática de dados baseada em permissões
  - Visualização condicional de menus e funcionalidades
  - Segurança em nível de interface e dados
- **📋 Perfis Implementados**:
  - **Administrador**: Acesso total ao sistema
  - **Analista de Educação**: Acompanhamento de turmas vinculadas
  - **Coordenador Pedagógico**: Gestão de docentes vinculados
  - **Assistente Educacional**: Gerenciamento de dados de turmas
  - **Planejamento**: Gestão completa do módulo de planejamento
  - **Secretaria**: Matrículas, documentos e frequência

### v1.8 - Refinamento de Relatórios e UX (Dez/2025)

- **Interface de Relatório Otimizada**:
  - Novo layout de "Agenda Executiva" para alocação de ambientes, com linha do tempo vertical clara e rápida de escanear.
  - **Datas em Destaque**: Visualização unificada com dia em destaque e formato completo `DD/MM/YYYY` para arquivamento oficial.
- **PDF Profissional (Print-Safe)**:
  - Design de alto contraste (Preto sobre Branco) otimizado para impressão econômica e legibilidade máxima.
  - Correção crítica na exibição da "Vigência", garantindo que datas de validade do relatório apareçam em qualquer impressora.
  - Remoção de elementos puramente estéticos (sombras/gradientes) na versão impressa em favor da clareza de dados.
- **Robustez Temporal**:
  - Configuração global de Timezone (`America/Fortaleza`) para prevenir inconsistências de data (o bug do "dia anterior").

### v1.7 - Relatórios & Alocação Inteligente (Dez/2025)

- **Relatórios Visuais de Ambientes**:
  - Nova visualização em tela (modal dedicado) com layout refinado para impressão e leitura.
  - Geração de PDF integrada ("Alocação de Ambientes") com Zebra Striping, Badges de Turno e Identidade Visual Profissional.
  - Integração inteligente de dados: Recuperação automática de Docentes vinculados às Turmas/UCs, mesmo se não alocados diretamente ao ambiente.
  - Exibição de foto dos docentes nos relatórios.
- **Correções de Infraestrutura**:
  - Ajuste nas referências de tabelas de alocação (`lotacoes_turma`) para garantir integridade referencial.

### v1.6 - Gestão de Turmas & Capacidade (Dez/2025)

- **Capacidade de Turma**: Novo campo para definição do limite máximo de alunos por turma.
- **Data Fim Manual**:
  - Flexibilidade para definir manualmente a "Data de Término (Limite)".
  - O gerador de cronograma agora respeita esta data, alertando se a alocação exceder o limite, mas sem bloquear o salvamento.
- **Robustez e Estabilidade**:
  - **Fallback de Dados**: Sistema de recuperação automática caso a busca complexa (relacional) falhe, garantindo que a lista de turmas sempre seja carregada.
  - **Tratamento de Datas**: Formatação segura que previne erros visuais caso bibliotecas externas falhem.
  - **Correções de UI**: Ajustes na estrutura de modais e feedback de carregamento.

### v1.5 - Gestão de Ambientes (Dez/2025)

- **Módulo de Ambientes**: Controle completo de salas de aula e laboratórios.
  - **Alocação Inteligente**: Vínculo de Turmas a Ambientes com detecção automática de conflitos de horário e turno.
  - **Filtro por UC**: Possibilidade de alocar ambientes específicos para Unidades Curriculares específicas, com ajuste automático de datas baseado no cronograma.
  - **Relatórios**: Geração de PDFs de ocupação com detalhamento por Docente, Curso e Turno.

### v1.4 - Gestão de Calendário Avançada (Dez/2025)

- **Pausas e Recessos**: Novo sistema para gestão de períodos sem aula (Férias, Recessos, Feriados Internos). O gerador de datas pula automaticamente esses períodos ao calcular o cronograma.
- **Status "Bloqueada"**: Nova situação de turma para indicar turmas suspensas ou aguardando liberação.
- **Recálculo Inteligente**:
  - Ao reordenar UCs, as datas de todo o cronograma são recalculadas mantendo os docentes alocados.
  - Alterações em Pausas recalculam as datas instantaneamente.
  - "Auto-conclusão" visual: Turmas com data de término passada são exibidas como Concluídas.
- **Filtros e Busca**:
  - Busca textual e filtro de situação em tempo real no módulo de Turmas.
  - Layout otimizado da barra de busca (70% de largura).

### v1.3 - Refinamento Turmas & Integração (Dez/2025)

- **Gestão de Turmas Avançada**: Reordenação de UCs no cronograma com persistência automática e recálculo inteligente de datas (considerando feriados estaduais).
- **Integração Curso-Turma**: Vínculo direto entre Turmas e Cursos, com auto-seleção da Matriz Curricular para agilizar o cadastro.
- **UX Refinada**: Novos layouts padronizados para formulários de Turmas (Grid 4 colunas) e Capacidades de UCs (Visualização Vertical).
- **Integridade de Dados**: Constraints e índices adicionados ao banco para robustez no relacionamento Curso-Turma.

### v1.2 - Refinamento de UI & Docentes (Dez/2025)

- **Design System Aprimorado**: Integração com **Tailwind CSS** para estilização mais rápida e moderna.
- **Módulo Docentes 2.0**: Interface completamente redesenhada com modal em abas, cabeçalho fixo e lista em tokens.
- **Gestão de Imagens**: Upload de fotos de perfil para docentes com integração ao Supabase Storage e avatares automáticos (fallback).
- **Componentes Inteligentes**: Novo componente `SwitchField` (estilo iOS) para interações booleanas intuitivas.
- **Robustez de Dados**: Validações de CPF/Telefone reforçadas e correções críticas no salvamento de dados.

### v1.1 - Refatoração Estrutural (Dez/2025)

- **Flexibilidade Curricular**: Implementação de relacionamento N:1 para Cursos/Matrizes e N:N para UCs.
- **Banco de Dados Inteligente**: Uso de Triggers para cálculos automáticos e constraints reforçadas.
- **UX Aprimorado**: Fluxos de cadastro mais intuitivos e informativos.

---

## 🚀 Funcionalidades

O sistema é dividido em módulos estratégicos, cada um contendo submódulos especializados para atender diferentes áreas da instituição:

### 1. 📅 Planejamento Acadêmico

O coração da estrutura educacional. Permite a definição flexível e reaproveitável dos currículos.

- **Cursos**: Gestão do catálogo de oferta (Cursos Técnicos, FIC, etc.).
  - *Novidade*: Vínculo direto e simples com Matrizes Curriculares (N:1).
- **Matrizes Curriculares**: Criação e versionamento de grades curriculares.
- **Catálogo de UCs (Unidades Curriculares)**: Banco central de disciplinas.
- **Docentes**: Gestão do corpo docente e suas competências.
- **Turmas**: Gestão de turmas e cronogramas.
- **Ambientes**: Gestão física de salas e laboratórios com controle visual de alocações e relatórios.

### 2. 📝 Secretaria

Gestão completa do ciclo de vida do aluno.

- **Alunos e Matrículas**: Cadastro centralizado e gestão de enturmação.
- **Documentação Digital**: Controle de pendências e upload de arquivos.
- **Empresas**: Gestão de parceiros e relatórios de frequência.

### 3. 🎓 Pedagógico

Gestão acadêmica focada no docente.

- **Diário de Classe Digital**: Registro ágil de aulas e chamadas.
- **Avaliações e Notas**: Definição de critérios e lançamento de conceitos.
- **Frequência**: Controle automatizado de presença com relatórios.
- **Desempenho**: Dashboards de acompanhamento por turma e aluno.

### 4. 📊 Dashboard Gerencial

Visão holística com indicadores em tempo real para tomada de decisão rápida.

- Indicadores de Cursos Ativos.
- Ocupação de Matrizes.
- Visão geral de Docentes e Turmas.

## 🛠️ Tecnologias Utilizadas

O projeto utiliza uma stack tecnológica moderna e leve, sem necessidade de transpilação complexa:

### Frontend

- **HTML5 & CSS3**: Estrutura semântica e estilização moderna (CSS Variables, Flexbox/Grid).
- **JavaScript (ES6+)**: Lógica da aplicação utilizando Módulos ES.
- **[Phosphor Icons](https://phosphoricons.com/)**: Biblioteca de ícones consistente e flexível.
- **[Day.js](https://day.js.org/)**: Manipulação leve de datas.
- **[IMask](https://imask.js.org/)**: Máscaras de input para melhor UX.

### Backend & Infraestrutura

- **[Supabase](https://supabase.com/)**: Backend as a Service (BaaS) fornecendo:
  - Banco de dados Postgres.
  - Autenticação.
  - APIs em tempo real.

## 🎨 Design System e UX

O projeto segue um rigoroso guia de estilos e melhores práticas de UX, documentado em `docs/UX-UI-GUIDE.md`. Principais diretrizes:

- **Hierarquia Visual Clara**: Uso consistente de tipografia e cores.
- **Feedback Imediato**: Respostas visuais para todas as interações do usuário.
- **Acessibilidade**: Foco em contraste, navegação por teclado e semântica.
- **Design Responsivo**: Adaptável para desktop e dispositivos móveis.

## 🔐 Autenticação e Segurança

O Competenz implementa um sistema robusto de autenticação e controle de acesso:

### Sistema de Autenticação

- **Supabase Auth**: Autenticação segura com JWT tokens
- **Gestão de Sessão**: Verificação automática de sessão em cada carregamento
- **Login/Logout**: Interface moderna e segura
- **Redirecionamento Automático**: Proteção de rotas não autenticadas

### Controle de Acesso (ACL)

- **Baseado em Perfis**: 6 perfis com permissões específicas
- **Permissões Granulares**: Controle por módulo e ação (criar, editar, excluir, visualizar)
- **Filtragem de Dados**: Usuários veem apenas dados permitidos
- **Vinculações**: Analistas e Coordenadores veem apenas turmas/docentes vinculados

### Perfis Disponíveis

1. **Administrador**: Gestão completa do sistema
2. **Analista de Educação**: Acompanhamento de turmas vinculadas
3. **Coordenador Pedagógico**: Gestão de docentes vinculados
4. **Assistente Educacional**: Gerenciamento de dados de turmas
5. **Planejamento**: Gestão de cursos, matrizes e turmas
6. **Secretaria**: Matrículas, documentos e frequência

📖 **Documentação Completa**: Veja `docs/SISTEMA_SAAS.md` e `docs/CONFIGURACAO_SUPABASE.md`

## 📁 Estrutura do Projeto

```text
sgp/
├── assets/
│   ├── css/            # Estilos (app.css, componentes)
│   └── js/             # Lógica (app.js, módulos, serviços)
├── database/           # Scripts SQL e migrações
├── docs/               # Documentação técnica e de design
└── index.html          # Ponto de entrada da aplicação
```

## 🚀 Como Executar Localmente

Como o projeto é construído com tecnologias web padrão, você precisa apenas de um servidor estático para rodá-lo.

1. **Clone o repositório**

   ```bash
   git clone https://github.com/seu-usuario/competenz.git
   cd competenz
   ```

2. **Configure o Ambient**
   Certifique-se de que as credenciais do Supabase estão configuradas corretamente em `assets/js/services/supabase.js`.

3. **Inicie o Servidor**
   Você pode usar qualquer servidor estático. Exemplos:

   **Usando Python:**

   ```bash
   python -m http.server 8000
   ```

   **Usando Node.js (npx):**

   ```bash
   npx serve .
   ```

   **VS Code:**
   Instale a extensão "Live Server" e clique em "Go Live".

4. **Acesse**
   Abra `http://localhost:8000` (ou a porta indicada) no seu navegador.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, leia o guia de contribuição antes de enviar um Pull Request.

1. Faça um Fork do projeto
2. Crie sua Feature Branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona: MinhaFeature'`)
4. Push para a Branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE).
