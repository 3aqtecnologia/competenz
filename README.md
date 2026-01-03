# 🎓 Competenz | Gestão Educacional

**Competenz** é um sistema moderno de gestão educacional focado em simplificar processos administrativos e pedagógicos. Construído com uma arquitetura leve e responsiva, o sistema oferece uma experiência de usuário fluida e intuitiva.

![Status do Projeto](https://img.shields.io/badge/status-em_desenvolvimento-yellow)
![Tech Stack](https://img.shields.io/badge/stack-HTML_|_Tailwind_|_JS-blue)
![Backend](https://img.shields.io/badge/backend-Supabase-green)

## 🆕 Histórico de Versões

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

### 2. 📝 Secretaria (Em Breve)

Gestão do ciclo de vida do aluno.

- **Matrículas**: Processo de ingresso e enturmação.
- **Turmas**: Organização logística de alunos e horários.
- **Documentação**: Emissão de históricos e declarações.

### 3. 🎓 Pedagógico (Futuro)

Acompanhamento do processo de ensino-aprendizagem.

- **Diário de Classe**: Registro de frequência e conteúdo.
- **Notas e Avaliações**: Sistema avaliativo parametrizável.
- **Planos de Ensino**: Planejamento aula a aula.

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
