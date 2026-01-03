# Sistema SaaS - Competenz

## Visão Geral

O Competenz foi transformado em um sistema SaaS (Software as a Service) completo com gestão de usuários e controle de acesso baseado em perfis (ACL - Access Control List).

## Arquitetura do Sistema

### 1. Autenticação e Autorização

O sistema utiliza **Supabase Auth** para autenticação e um sistema customizado de ACL para autorização baseada em perfis.

#### Componentes Principais

- **`auth.js`**: Serviço de autenticação e autorização
- **`login.html`**: Página de login
- **`usuarios.js`**: Módulo de gestão de usuários (admin)

### 2. Perfis de Usuário

O sistema possui 6 perfis pré-configurados:

#### 2.1 Administrador

- **Descrição**: Gestão completa de usuários, perfis e acesso total ao sistema
- **Permissões**:
  - Gestão de Usuários (criar, editar, excluir, visualizar)
  - Gestão de Perfis (criar, editar, excluir, visualizar)
  - Acesso total a todos os módulos

#### 2.2 Analista de Educação

- **Descrição**: Acompanhamento de alunos nas turmas destinadas ao usuário
- **Permissões**:
  - Visualizar apenas turmas vinculadas ao seu usuário
  - Visualizar e editar informações de alunos
  - Acesso ao módulo pedagógico (visualização)
- **Vinculações**: Turmas específicas

#### 2.3 Coordenador Pedagógico

- **Descrição**: Acompanhamento de docentes e planejamento de atividades
- **Permissões**:
  - Visualizar apenas docentes vinculados ao seu usuário
  - Visualizar turmas onde os docentes vinculados estão lotados
  - Criar, editar e visualizar no módulo pedagógico
  - Visualizar planejamento
- **Vinculações**: Docentes específicos

#### 2.4 Assistente Educacional

- **Descrição**: Gerencia dados das turmas e repassa informações para analistas
- **Permissões**:
  - Criar, editar e visualizar turmas
  - Criar, editar e visualizar alunos
  - Acesso ao módulo pedagógico

#### 2.5 Planejamento

- **Descrição**: Gerenciar turmas, docentes, ambientes, cursos e matrizes
- **Permissões**:
  - Gestão completa do módulo de planejamento
  - Criar, editar e visualizar:
    - Turmas
    - Docentes
    - Ambientes
    - Cursos
    - Matrizes
    - Unidades Curriculares

#### 2.6 Secretaria

- **Descrição**: Gerencia matrículas, documentos e frequência
- **Permissões**:
  - Gestão completa do módulo secretaria
  - Criar, editar e visualizar:
    - Matrículas
    - Alunos
    - Documentos (atestados, justificativas)
    - Frequência
  - Enviar frequência para empresas (aprendizagem)

## Estrutura do Banco de Dados

### Tabelas Principais

#### `perfis`

```sql
- id (UUID, PK)
- nome (VARCHAR, UNIQUE)
- descricao (TEXT)
- permissoes (JSONB)
- ativo (BOOLEAN)
- created_at, updated_at
```

#### `usuarios`

```sql
- id (UUID, PK)
- email (VARCHAR, UNIQUE)
- nome_completo (VARCHAR)
- telefone (VARCHAR)
- perfil_id (UUID, FK -> perfis)
- ativo (BOOLEAN)
- ultimo_acesso (TIMESTAMP)
- metadata (JSONB)
- created_at, updated_at
```

#### `usuario_turmas`

```sql
- id (UUID, PK)
- usuario_id (UUID, FK -> usuarios)
- turma_id (UUID, FK -> turmas)
- created_at
```

#### `usuario_docentes`

```sql
- id (UUID, PK)
- usuario_id (UUID, FK -> usuarios)
- docente_id (UUID, FK -> docentes)
- created_at
```

## Sistema de Permissões

### Estrutura JSON de Permissões

```json
{
  "modulo": ["acao1", "acao2", ...]
}
```

### Ações Disponíveis

- `criar`: Criar novos registros
- `editar`: Editar registros existentes
- `excluir`: Excluir registros
- `visualizar`: Visualizar registros
- `visualizar_vinculadas`: Visualizar apenas registros vinculados ao usuário
- `visualizar_por_docente`: Visualizar turmas dos docentes vinculados
- `enviar`: Enviar dados (ex: frequência para empresas)

### Verificação de Permissões

```javascript
// Verificar se tem permissão
auth.hasPermission('usuarios', 'criar');

// Verificar se pode acessar módulo
auth.canAccessModule('planejamento');

// Filtrar dados baseado em permissões
auth.filterDataByPermissions('turmas', turmasData);
```

## Fluxo de Autenticação

1. **Acesso ao Sistema**: Usuário acessa `index.html`
2. **Verificação**: `app.init()` verifica se há sessão ativa
3. **Redirecionamento**: Se não autenticado, redireciona para `login.html`
4. **Login**: Usuário insere credenciais
5. **Validação**: Sistema valida via Supabase Auth
6. **Carregamento**: Carrega dados do usuário, perfil e vinculações
7. **Renderização**: Renderiza interface baseada nas permissões

## Uso do Sistema

### Para Administradores

1. **Acessar Gestão de Usuários**:
   - Menu lateral → "Usuários"

2. **Criar Novo Usuário**:
   - Clicar em "Novo Usuário"
   - Preencher dados (nome, email, telefone)
   - Selecionar perfil
   - Se Analista de Educação: vincular turmas
   - Se Coordenador Pedagógico: vincular docentes
   - Salvar

3. **Gerenciar Perfis**:
   - Aba "Perfis" no módulo de usuários
   - Visualizar permissões de cada perfil
   - Editar permissões (se necessário)

### Para Usuários Comuns

- **Login**: Acessar com email e senha fornecidos pelo administrador
- **Navegação**: Apenas módulos permitidos pelo perfil estarão visíveis
- **Dados**: Apenas dados vinculados ao usuário serão exibidos (quando aplicável)

## Credenciais Padrão

**Administrador**:

- Email: `admin@competenz.com.br`
- Senha: Configurar via Supabase Auth

## Segurança

### Implementações de Segurança

1. **Autenticação via Supabase Auth**: JWT tokens seguros
2. **Verificação de Sessão**: A cada carregamento de página
3. **Controle de Acesso**: Baseado em perfis e permissões
4. **Filtragem de Dados**: Usuários veem apenas dados permitidos
5. **Validação Server-Side**: Todas as operações validadas no backend

### Boas Práticas

- Alterar senha padrão do administrador
- Revisar permissões regularmente
- Desativar usuários inativos
- Monitorar último acesso dos usuários
- Usar HTTPS em produção

## Próximos Passos

### Funcionalidades Futuras

1. **Recuperação de Senha**: Implementar fluxo de reset de senha
2. **2FA**: Autenticação de dois fatores
3. **Auditoria**: Log de ações dos usuários
4. **Notificações**: Sistema de notificações por email
5. **API Keys**: Para integrações externas
6. **Multi-tenancy**: Suporte a múltiplas organizações

## Suporte Técnico

Para dúvidas ou problemas:

1. Verificar logs do console do navegador
2. Verificar logs do Supabase
3. Revisar permissões do perfil
4. Contatar administrador do sistema
