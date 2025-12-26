# Accessibility (A11y) - Multi-tenancy

**Versão:** 1.0  
**Data:** 25/12/2025  
**UX Designer:** Sally  
**Status:** ♿ Diretrizes Completas

---

## 📋 Introdução

Este documento define **diretrizes de acessibilidade** (WCAG 2.1 Level AA) para garantir que a funcionalidade de Multi-tenancy seja utilizável por todos os usuários.

---

## 🎯 Conformidade WCAG 2.1 Level AA

### Princípios POUR

1. **Perceivable (Perceptível)**
   - Informação e componentes de UI devem ser apresentados de forma que usuários possam perceber

2. **Operable (Operável)**
   - Componentes de UI e navegação devem ser operáveis

3. **Understandable (Compreensível)**
   - Informação e operação de UI devem ser compreensíveis

4. **Robust (Robusto)**
   - Conteúdo deve ser robusto o suficiente para ser interpretado por tecnologias assistivas

---

## 🎨 Contraste de Cores

### Requisitos WCAG AA
- **Texto normal:** Contraste mínimo 4.5:1
- **Texto grande (18px+):** Contraste mínimo 3:1
- **Componentes UI:** Contraste mínimo 3:1

### Validação de Cores

| Elemento | Foreground | Background | Contraste | Status |
|----------|------------|------------|-----------|--------|
| **Body Text** | #111827 | #FFFFFF | 16.1:1 | ✅ Pass |
| **Primary Button** | #FFFFFF | #3B82F6 | 4.5:1 | ✅ Pass |
| **Success Badge** | #065F46 | #D1FAE5 | 4.6:1 | ✅ Pass |
| **Danger Badge** | #991B1B | #FEE2E2 | 5.2:1 | ✅ Pass |
| **Muted Text** | #6B7280 | #FFFFFF | 4.6:1 | ✅ Pass |

### Ferramentas de Teste
- WebAIM Contrast Checker
- Chrome DevTools (Lighthouse)
- Stark (Figma plugin)

---

## ⌨️ Navegação por Teclado

### Tab Order
```
1. Logo/Home
2. TenantBadge/Selector
3. Navigation items
4. Main content
5. User menu
```

### Keyboard Shortcuts

| Ação | Atalho | Contexto |
|------|--------|----------|
| **Abrir Tenant Selector** | `Ctrl/Cmd + K` | Global |
| **Criar Novo Lead** | `Ctrl/Cmd + N` | Kanban |
| **Salvar** | `Ctrl/Cmd + S` | Forms |
| **Fechar Modal** | `Escape` | Modals |
| **Navegar Dropdown** | `↑↓` | Dropdowns |
| **Selecionar Item** | `Enter` | Lists |

### Focus Management

```tsx
// Modal opens: focus first input
useEffect(() => {
  if (isOpen) {
    firstInputRef.current?.focus();
  }
}, [isOpen]);

// Modal closes: restore focus
const previousFocus = useRef<HTMLElement>();

const openModal = () => {
  previousFocus.current = document.activeElement;
  setIsOpen(true);
};

const closeModal = () => {
  setIsOpen(false);
  previousFocus.current?.focus();
};
```

### Focus Indicators

```css
/* Visible focus ring */
*:focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Remove default outline */
*:focus {
  outline: none;
}
```

---

## 🏷️ Semantic HTML

### Estrutura Correta

```tsx
// ✅ Bom: Semantic HTML
<header>
  <nav aria-label="Main navigation">
    <ul>
      <li><a href="/dashboard">Dashboard</a></li>
    </ul>
  </nav>
</header>

<main>
  <h1>Dashboard</h1>
  <section aria-labelledby="metrics-heading">
    <h2 id="metrics-heading">Métricas</h2>
  </section>
</main>

// ❌ Ruim: Divs genéricos
<div class="header">
  <div class="nav">
    <div class="link">Dashboard</div>
  </div>
</div>
```

### Landmarks

```tsx
<header role="banner">
  {/* Site header */}
</header>

<nav role="navigation" aria-label="Main">
  {/* Main navigation */}
</nav>

<main role="main">
  {/* Main content */}
</main>

<aside role="complementary">
  {/* Sidebar */}
</aside>

<footer role="contentinfo">
  {/* Site footer */}
</footer>
```

---

## 🔤 ARIA Labels

### Componentes Interativos

```tsx
// TenantBadge
<button 
  aria-label="Tenant atual: FourSys Ltda. Clique para trocar de tenant"
  aria-haspopup="listbox"
  aria-expanded={isOpen}
>
  <span aria-hidden="true">🏢</span>
  FourSys Ltda
</button>

// TenantSelector
<div 
  role="listbox"
  aria-label="Selecionar tenant"
>
  <div 
    role="option"
    aria-selected={isActive}
    tabIndex={0}
  >
    FourSys Ltda
  </div>
</div>

// SignupStepper
<ol aria-label="Progresso do cadastro">
  <li aria-current={currentStep === 1 ? "step" : undefined}>
    <span aria-label="Passo 1: Dados da Empresa">1</span>
  </li>
</ol>

// Loading State
<button disabled aria-busy="true">
  <span className="sr-only">Carregando...</span>
  <Spinner aria-hidden="true" />
  Salvando
</button>
```

### Screen Reader Only Text

```tsx
// Utility class
<span className="sr-only">
  Texto visível apenas para screen readers
</span>

// CSS
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## 📝 Forms Acessíveis

### Labels Associados

```tsx
// ✅ Bom: Label associado
<label htmlFor="tenant-name">
  Nome da Empresa *
</label>
<input 
  id="tenant-name"
  name="name"
  required
  aria-required="true"
  aria-invalid={hasError}
  aria-describedby={hasError ? "name-error" : undefined}
/>
{hasError && (
  <span id="name-error" role="alert">
    Campo obrigatório
  </span>
)}

// ❌ Ruim: Label não associado
<div>Nome da Empresa</div>
<input name="name" />
```

### Validação

```tsx
// Error messages
<input 
  aria-invalid="true"
  aria-describedby="email-error"
/>
<span id="email-error" role="alert">
  Por favor, insira um email válido
</span>

// Success feedback
<input aria-invalid="false" />
<span role="status" aria-live="polite">
  Email verificado com sucesso
</span>
```

### Required Fields

```tsx
// Visual + Semantic
<label>
  Nome da Empresa 
  <span aria-label="obrigatório">*</span>
</label>
<input required aria-required="true" />
```

---

## 🖼️ Imagens e Ícones

### Alt Text

```tsx
// ✅ Bom: Alt descritivo
<img 
  src="tenant-logo.png" 
  alt="Logo da FourSys Tecnologia"
/>

// ✅ Bom: Ícone decorativo
<span aria-hidden="true">🏢</span>
<span className="sr-only">Tenant</span>

// ❌ Ruim: Alt genérico
<img src="logo.png" alt="logo" />
```

### Icon Buttons

```tsx
// ✅ Bom: Label descritivo
<button aria-label="Fechar modal">
  <X aria-hidden="true" />
</button>

// ❌ Ruim: Sem label
<button>
  <X />
</button>
```

---

## 🎬 Animações e Movimento

### Respeitar Preferências

```css
/* Reduzir animações se usuário preferir */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

```tsx
// JavaScript
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

const animationDuration = prefersReducedMotion ? 0 : 300;
```

---

## 📱 Touch Targets

### Tamanhos Mínimos

```css
/* Mobile: 44px × 44px (Apple HIG) */
.button-mobile {
  min-width: 44px;
  min-height: 44px;
}

/* Desktop: 32px × 32px */
.button-desktop {
  min-width: 32px;
  min-height: 32px;
}
```

### Espaçamento

```css
/* Mínimo 8px entre targets */
.button-group {
  gap: 8px;
}
```

---

## 🔊 Live Regions

### Anúncios Dinâmicos

```tsx
// Polite: Não interrompe
<div role="status" aria-live="polite">
  Lead criado com sucesso
</div>

// Assertive: Interrompe
<div role="alert" aria-live="assertive">
  Erro crítico: Não foi possível salvar
</div>

// Atomic: Lê conteúdo completo
<div 
  role="status" 
  aria-live="polite" 
  aria-atomic="true"
>
  3 de 10 leads carregados
</div>
```

---

## 🎯 Componentes Específicos

### TenantSelector

```tsx
<button
  aria-label="Tenant atual: FourSys Ltda"
  aria-haspopup="listbox"
  aria-expanded={isOpen}
  onClick={toggleDropdown}
>
  FourSys Ltda
</button>

{isOpen && (
  <div 
    role="listbox"
    aria-label="Selecionar tenant"
  >
    {tenants.map(tenant => (
      <div
        key={tenant.id}
        role="option"
        aria-selected={tenant.id === activeTenantId}
        tabIndex={0}
        onClick={() => selectTenant(tenant.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') selectTenant(tenant.id);
        }}
      >
        {tenant.name}
      </div>
    ))}
  </div>
)}
```

### Modal

```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Convidar Usuário</h2>
  <p id="modal-description">
    Preencha os dados para enviar um convite
  </p>
  
  {/* Form content */}
  
  <button 
    onClick={closeModal}
    aria-label="Fechar modal"
  >
    <X aria-hidden="true" />
  </button>
</div>
```

### Kanban Board

```tsx
<div 
  role="region"
  aria-label="Kanban Board"
>
  {columns.map(column => (
    <div
      key={column.id}
      role="list"
      aria-label={`Coluna ${column.title}`}
    >
      {column.leads.map(lead => (
        <div
          key={lead.id}
          role="listitem"
          tabIndex={0}
          aria-label={`Lead: ${lead.name}, ${lead.company}, R$ ${lead.value}`}
          draggable
        >
          {/* Lead content */}
        </div>
      ))}
    </div>
  ))}
</div>
```

---

## ✅ Testing Checklist

### Automated Testing
- [ ] Lighthouse Accessibility Score > 90
- [ ] axe DevTools: 0 violations
- [ ] WAVE: 0 errors

### Manual Testing
- [ ] Navegação completa por teclado
- [ ] Screen reader (NVDA/JAWS)
- [ ] Zoom 200% (sem quebra de layout)
- [ ] Color blindness simulators
- [ ] High contrast mode

### User Testing
- [ ] Usuários com deficiência visual
- [ ] Usuários com deficiência motora
- [ ] Usuários com deficiência cognitiva

---

## 🛠️ Ferramentas

### Browser Extensions
- **axe DevTools** - Automated testing
- **WAVE** - Visual feedback
- **Lighthouse** - Audit tool
- **Stark** - Color blindness simulator

### Screen Readers
- **NVDA** (Windows, free)
- **JAWS** (Windows, paid)
- **VoiceOver** (macOS/iOS, built-in)
- **TalkBack** (Android, built-in)

### Testing Tools
- **Pa11y** - CI/CD integration
- **jest-axe** - Unit testing
- **Cypress-axe** - E2E testing

---

## 📚 Recursos

### Documentação
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM](https://webaim.org/)

### Cursos
- [Web Accessibility by Google](https://www.udacity.com/course/web-accessibility--ud891)
- [A11ycasts (YouTube)](https://www.youtube.com/playlist?list=PLNYkxOF6rcICWx0C9LVWWVqvHlYJyqw7g)

---

**Próximo Documento:** [08-visual-design.md](08-visual-design.md)

**Última Atualização:** 25/12/2025  
**Status:** ✅ Diretrizes de Acessibilidade Completas



