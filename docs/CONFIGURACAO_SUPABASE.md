# Guia de Configuração do Supabase para o Sistema SaaS

## 1. Configuração Inicial

### 1.1 Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Clique em "New Project"
4. Preencha:
   - Nome do projeto: `competenz-sgp`
   - Database Password: (escolha uma senha forte)
   - Region: Escolha a mais próxima (ex: South America - São Paulo)
5. Aguarde a criação do projeto (2-3 minutos)

### 1.2 Obter Credenciais

1. No dashboard do projeto, vá em **Settings** → **API**
2. Copie as seguintes informações:
   - **Project URL**: `https://[seu-projeto].supabase.co`
   - **anon/public key**: Chave pública para uso no frontend

### 1.3 Configurar arquivo supabase.js

Atualize o arquivo `assets/js/services/supabase.js`:

```javascript
const SUPABASE_URL = 'https://[seu-projeto].supabase.co';
const SUPABASE_ANON_KEY = 'sua-chave-publica-aqui';

export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

## 2. Executar Migrations

### 2.1 Via SQL Editor (Recomendado)

1. No dashboard do Supabase, vá em **SQL Editor**
2. Clique em **New Query**
3. Execute as migrations na ordem:

#### Migration 001-017 (Existentes)

Execute todas as migrations existentes em `database/migrations/` na ordem numérica.

#### Migration 018 - Sistema de Autenticação

Execute o conteúdo de `database/migrations/018_create_auth_system.sql`

### 2.2 Verificar Tabelas Criadas

No **Table Editor**, você deve ver:

- `perfis`
- `usuarios`
- `usuario_turmas`
- `usuario_docentes`

## 3. Configurar Autenticação

### 3.1 Habilitar Email Authentication

1. Vá em **Authentication** → **Providers**
2. Certifique-se que **Email** está habilitado
3. Configure:
   - **Enable Email Confirmations**: OFF (para desenvolvimento)
   - **Enable Email Signups**: ON

### 3.2 Configurar Email Templates (Opcional)

1. Vá em **Authentication** → **Email Templates**
2. Personalize os templates de:
   - Confirmação de email
   - Recuperação de senha
   - Convite de usuário

### 3.3 Criar Usuário Administrador

#### Opção 1: Via SQL (Recomendado)

O usuário admin já foi criado na migration 018. Agora crie a conta de autenticação:

1. Vá em **Authentication** → **Users**
2. Clique em **Add User**
3. Preencha:
   - Email: `admin@competenz.com.br`
   - Password: (escolha uma senha forte)
   - Auto Confirm User: ON
4. Clique em **Create User**

#### Opção 2: Via Interface

Após configurar tudo, você pode criar usuários pela interface do sistema.

## 4. Configurar Row Level Security (RLS)

### 4.1 Políticas para Tabela `usuarios`

```sql
-- Habilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas seus próprios dados
CREATE POLICY "Usuários podem ver seus próprios dados"
ON usuarios FOR SELECT
USING (auth.uid()::text = id::text);

-- Política: Administradores podem ver todos os usuários
CREATE POLICY "Administradores podem ver todos os usuários"
ON usuarios FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM usuarios u
    INNER JOIN perfis p ON u.perfil_id = p.id
    WHERE u.id::text = auth.uid()::text
    AND p.nome = 'Administrador'
  )
);

-- Política: Administradores podem inserir usuários
CREATE POLICY "Administradores podem inserir usuários"
ON usuarios FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios u
    INNER JOIN perfis p ON u.perfil_id = p.id
    WHERE u.id::text = auth.uid()::text
    AND p.nome = 'Administrador'
  )
);

-- Política: Administradores podem atualizar usuários
CREATE POLICY "Administradores podem atualizar usuários"
ON usuarios FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM usuarios u
    INNER JOIN perfis p ON u.perfil_id = p.id
    WHERE u.id::text = auth.uid()::text
    AND p.nome = 'Administrador'
  )
);

-- Política: Administradores podem deletar usuários
CREATE POLICY "Administradores podem deletar usuários"
ON usuarios FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM usuarios u
    INNER JOIN perfis p ON u.perfil_id = p.id
    WHERE u.id::text = auth.uid()::text
    AND p.nome = 'Administrador'
  )
);
```

### 4.2 Políticas para Tabela `perfis`

```sql
-- Habilitar RLS
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem visualizar perfis
CREATE POLICY "Todos podem visualizar perfis"
ON perfis FOR SELECT
USING (true);

-- Política: Apenas administradores podem modificar perfis
CREATE POLICY "Administradores podem modificar perfis"
ON perfis FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM usuarios u
    INNER JOIN perfis p ON u.perfil_id = p.id
    WHERE u.id::text = auth.uid()::text
    AND p.nome = 'Administrador'
  )
);
```

### 4.3 Políticas para Vinculações

```sql
-- usuario_turmas
ALTER TABLE usuario_turmas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas vinculações de turmas"
ON usuario_turmas FOR SELECT
USING (usuario_id::text = auth.uid()::text);

CREATE POLICY "Administradores podem gerenciar vinculações de turmas"
ON usuario_turmas FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM usuarios u
    INNER JOIN perfis p ON u.perfil_id = p.id
    WHERE u.id::text = auth.uid()::text
    AND p.nome = 'Administrador'
  )
);

-- usuario_docentes
ALTER TABLE usuario_docentes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas vinculações de docentes"
ON usuario_docentes FOR SELECT
USING (usuario_id::text = auth.uid()::text);

CREATE POLICY "Administradores podem gerenciar vinculações de docentes"
ON usuario_docentes FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM usuarios u
    INNER JOIN perfis p ON u.perfil_id = p.id
    WHERE u.id::text = auth.uid()::text
    AND p.nome = 'Administrador'
  )
);
```

## 5. Configurar Storage (Opcional)

Se você planeja armazenar documentos (atestados, etc.):

1. Vá em **Storage**
2. Crie um bucket: `documentos`
3. Configure políticas de acesso

## 6. Testar Configuração

### 6.1 Teste de Conexão

1. Abra o console do navegador em `login.html`
2. Verifique se não há erros de conexão
3. Tente fazer login com o usuário admin

### 6.2 Teste de Permissões

1. Faça login como administrador
2. Verifique se o menu "Usuários" aparece
3. Tente criar um novo usuário
4. Faça logout e login com o novo usuário
5. Verifique se as permissões estão corretas

## 7. Configurações de Produção

### 7.1 Variáveis de Ambiente

Em produção, use variáveis de ambiente:

```javascript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

### 7.2 Segurança

- Habilite **Email Confirmations**
- Configure **Rate Limiting** em Authentication
- Habilite **CAPTCHA** para login
- Configure **CORS** adequadamente
- Use HTTPS

### 7.3 Backup

1. Configure backups automáticos em **Settings** → **Database**
2. Exporte dados regularmente

## 8. Monitoramento

### 8.1 Logs

- Vá em **Logs** para ver:
  - Logs de API
  - Logs de Autenticação
  - Logs de Database

### 8.2 Métricas

- Monitore em **Reports**:
  - Número de usuários ativos
  - Requisições por dia
  - Uso de storage

## 9. Troubleshooting

### Problema: "Invalid API Key"

- Verifique se copiou a chave correta
- Certifique-se de usar a `anon/public` key, não a `service_role`

### Problema: "User not found"

- Verifique se o usuário existe em Authentication → Users
- Verifique se existe registro correspondente na tabela `usuarios`

### Problema: "Permission denied"

- Verifique as políticas RLS
- Certifique-se que o perfil do usuário está correto

### Problema: Login não funciona

- Verifique console do navegador para erros
- Verifique se Email Authentication está habilitado
- Verifique credenciais do usuário

## 10. Recursos Adicionais

- [Documentação Supabase](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
