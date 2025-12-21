# Guia de UX/UI - Competenz

## 🎯 Princípios Implementados

### 1. **Hierarquia Visual**

```html
<h1 class="hierarchy-primary">Título Principal</h1>
<h2 class="hierarchy-secondary">Subtítulo</h2>
<h3 class="hierarchy-tertiary">Seção</h3>
```

### 2. **Micro-interações**

```html
<button class="btn-primary btn-press interactive-element">
    Clique Aqui
</button>
```

### 3. **Progressive Disclosure**

```html
<div class="disclosure-trigger" onclick="toggleDisclosure()">
    Ver mais informações
</div>
<div class="disclosure-content" id="details">
    Conteúdo oculto...
</div>
```

### 4. **Affordance (Elementos Clicáveis)**

```html
<div class="clickable" onclick="action()">
    Este elemento é clicável
</div>
```

### 5. **Feedback Imediato**

```javascript
// Sucesso
element.classList.add('feedback-success');

// Erro
element.classList.add('feedback-error');
```

### 6. **Sistema de Espaçamento Consistente**

```css
padding: var(--space-md);    /* 16px */
margin: var(--space-lg);     /* 24px */
gap: var(--space-xl);        /* 32px */
```

### 7. **Acessibilidade (WCAG 2.1 AA)**

```html
<!-- Skip link -->
<a href="#main-content" class="skip-link">
    Pular para conteúdo principal
</a>

<!-- Focus rings -->
<button class="focus-ring">Botão Acessível</button>
```

### 8. **Princípios Gestalt**

```html
<!-- Agrupamento visual -->
<div class="group-related">
    <div class="proximity-group">
        <p>Item relacionado 1</p>
        <p>Item relacionado 2</p>
    </div>
</div>
```

### 9. **Lei de Fitts (Alvos Maiores)**

```html
<!-- Ação primária -->
<button class="primary-action">Ação Principal</button>

<!-- Ação secundária -->
<button class="secondary-action">Cancelar</button>
```

### 10. **Lei de Hick (Reduzir Decisões)**

```html
<div class="action-group">
    <button>Opção 1</button>
    <button>Opção 2</button>
    <button>Opção 3</button>
</div>
```

### 11. **Lei de Miller (Chunking)**

```html
<div class="info-chunk">
    <h3 class="info-chunk-title">Grupo 1</h3>
    <p>Informações relacionadas...</p>
</div>
```

### 12. **Efeito Estético-Usabilidade**

```html
<div class="aesthetic-card">
    Conteúdo bonito e funcional
</div>
```

### 13. **Lei de Jakob (Padrões Familiares)**

```html
<div class="familiar-pattern-search">
    <i class="ph ph-magnifying-glass"></i>
    <input type="text" placeholder="Buscar...">
</div>
```

### 14. **Regra Peak-End (Momentos Memoráveis)**

```javascript
// Celebração de sucesso
element.classList.add('memorable-moment');
element.classList.add('success-celebration');
```

### 15. **Lei de Tesler (Simplificar Complexidade)**

```html
<div class="complex-action-simplified">
    <div class="step-indicator">
        <div class="step completed"></div>
        <div class="step active"></div>
        <div class="step"></div>
    </div>
    <!-- Conteúdo do passo atual -->
</div>
```

### 16. **Limiar de Doherty (Resposta < 400ms)**

```html
<button class="instant-feedback">
    Resposta Rápida
</button>

<div class="loading-state">
    Carregando...
</div>
```

### 17. **Efeito Zeigarnik (Indicação de Progresso)**

```html
<div class="progress-tracker">
    <div class="progress-step completed">
        <i class="ph ph-check"></i> Passo 1
    </div>
    <div class="progress-step active">
        <i class="ph ph-circle"></i> Passo 2
    </div>
    <div class="progress-step">
        <i class="ph ph-circle"></i> Passo 3
    </div>
</div>
```

### 18. **Efeito Von Restorff (Destaque)**

```html
<div class="standout">
    ⭐ Informação Importante!
</div>
```

### 19. **Efeito de Posição Serial**

```html
<ul class="list-prioritized">
    <li>Item Importante (Primeiro)</li>
    <li>Item Normal</li>
    <li>Item Importante (Último)</li>
</ul>
```

### 20. **Carga Cognitiva Reduzida**

```html
<div class="visual-aid">
    <div class="visual-aid-icon">
        <i class="ph ph-info"></i>
    </div>
    <p class="low-cognitive-load">
        Texto fácil de ler com ícone visual
    </p>
</div>
```

## 📋 Checklist de UX/UI

### ✅ Visual

- [ ] Hierarquia clara (3 níveis máximo)
- [ ] Espaçamento consistente (sistema de 8px)
- [ ] Cores acessíveis (contraste 4.5:1)
- [ ] Tipografia legível (16px mínimo)

### ✅ Interação

- [ ] Feedback imediato (< 400ms)
- [ ] Estados hover/active/focus
- [ ] Animações suaves (< 300ms)
- [ ] Botões grandes (44px mínimo)

### ✅ Acessibilidade

- [ ] Navegação por teclado
- [ ] Focus rings visíveis
- [ ] Textos alternativos
- [ ] Contraste adequado

### ✅ Performance

- [ ] Loading states
- [ ] Skeleton screens
- [ ] Lazy loading
- [ ] Otimização de imagens

### ✅ Conteúdo

- [ ] Mensagens claras
- [ ] Empty states
- [ ] Error messages úteis
- [ ] Confirmações de ação

## 🎨 Paleta de Cores

```css
--color-primary: #C4FF0D      /* Verde-limão */
--color-sidebar: #0A0A0A      /* Preto */
--color-success: #10B981      /* Verde */
--color-danger: #EF4444       /* Vermelho */
--color-warning: #F59E0B      /* Laranja */
--color-info: #3B82F6         /* Azul */
--color-purple: #8B5CF6       /* Roxo */
--color-pink: #EC4899         /* Rosa */
```

## 📐 Sistema de Espaçamento

```css
--space-xs: 4px
--space-sm: 8px
--space-md: 16px
--space-lg: 24px
--space-xl: 32px
--space-2xl: 48px
--space-3xl: 64px
```

## 🚀 Melhores Práticas

1. **Sempre forneça feedback visual**
2. **Mantenha consistência em toda aplicação**
3. **Reduza passos para completar tarefas**
4. **Use padrões familiares**
5. **Teste com usuários reais**
6. **Otimize para mobile**
7. **Implemente dark mode**
8. **Garanta acessibilidade**
9. **Monitore performance**
10. **Itere baseado em dados**
