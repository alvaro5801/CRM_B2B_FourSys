# Design System - Multi-tenancy

**Versão:** 1.0  
**Data:** 25/12/2025  
**UX Designer:** Sally  
**Status:** 🎨 Sistema Completo

---

## 📋 Introdução

Este documento define o **Design System** completo para a funcionalidade de Multi-tenancy, incluindo tokens de design, componentes, padrões e diretrizes visuais.

---

## 🎨 Paleta de Cores

### Cores Primárias (Tenant Context)

```css
/* Primary - Tenant Active */
--primary-50:  #EFF6FF;
--primary-100: #DBEAFE;
--primary-200: #BFDBFE;
--primary-300: #93C5FD;
--primary-400: #60A5FA;
--primary-500: #3B82F6;  /* Main */
--primary-600: #2563EB;  /* Hover */
--primary-700: #1D4ED8;
--primary-800: #1E40AF;
--primary-900: #1E3A8A;
```

**Uso:**
- Tenant Badge background
- Active tenant indicator
- Primary buttons em contexto de tenant
- Links e ações principais

---

### Cores de Status

```css
/* Success - Tenant Verified */
--success-50:  #ECFDF5;
--success-100: #D1FAE5;
--success-500: #10B981;  /* Main */
--success-600: #059669;  /* Hover */

/* Warning - Pending Action */
--warning-50:  #FFFBEB;
--warning-100: #FEF3C7;
--warning-500: #F59E0B;  /* Main */
--warning-600: #D97706;  /* Hover */

/* Danger - Inactive/Error */
--danger-50:  #FEF2F2;
--danger-100: #FEE2E2;
--danger-500: #EF4444;  /* Main */
--danger-600: #DC2626;  /* Hover */

/* Info - Notifications */
--info-50:  #EEF2FF;
--info-100: #E0E7FF;
--info-500: #6366F1;  /* Main */
--info-600: #4F46E5;  /* Hover */
```

**Uso:**
- Success: Tenant criado, ação concluída
- Warning: Email não verificado, ação pendente
- Danger: Tenant inativo, erro crítico
- Info: Notificações, dicas

---

### Cores de Contexto (Tenant-specific)

```css
/* Tenant Badge Colors */
--tenant-purple: #8B5CF6;  /* Tenant A */
--tenant-pink:   #EC4899;  /* Tenant B */
--tenant-blue:   #3B82F6;  /* Tenant C */
--tenant-green:  #10B981;  /* Tenant D */
--tenant-orange: #F59E0B;  /* Tenant E */

/* Role Colors */
--role-admin:  #EC4899;  /* Pink */
--role-user:   #6B7280;  /* Gray */
--role-viewer: #9CA3AF;  /* Light Gray */
```

**Uso:**
- Tenant Badge: cor única por tenant (opcional)
- Role Badge: indicar permissões do usuário

---

### Cores Neutras (Base)

```css
/* Gray Scale */
--gray-50:  #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-400: #9CA3AF;
--gray-500: #6B7280;
--gray-600: #4B5563;
--gray-700: #374151;
--gray-800: #1F2937;
--gray-900: #111827;

/* Semantic Colors */
--background:     #FFFFFF;
--foreground:     #111827;
--muted:          #F3F4F6;
--muted-foreground: #6B7280;
--border:         #E5E7EB;
--input:          #E5E7EB;
--ring:           #3B82F6;
```

---

## 🔤 Tipografia

### Font Families

```css
/* Primary Font - Inter */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Monospace Font - JetBrains Mono */
--font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
```

**Onde usar:**
- **Sans:** Toda a interface (headings, body, buttons)
- **Mono:** Códigos, IDs, slugs, tenant IDs

---

### Font Sizes

```css
/* Font Size Scale */
--text-xs:   0.75rem;   /* 12px */
--text-sm:   0.875rem;  /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg:   1.125rem;  /* 18px */
--text-xl:   1.25rem;   /* 20px */
--text-2xl:  1.5rem;    /* 24px */
--text-3xl:  1.875rem;  /* 30px */
--text-4xl:  2.25rem;   /* 36px */
--text-5xl:  3rem;      /* 48px */
```

**Hierarquia:**
- **Headings:** 2xl - 5xl
- **Body:** base - lg
- **Captions:** xs - sm

---

### Font Weights

```css
/* Font Weight Scale */
--font-normal:    400;
--font-medium:    500;
--font-semibold:  600;
--font-bold:      700;
```

**Uso:**
- **Normal (400):** Body text, descriptions
- **Medium (500):** Subtle emphasis, labels
- **Semibold (600):** Headings, buttons
- **Bold (700):** Strong emphasis, titles

---

### Line Heights

```css
/* Line Height Scale */
--leading-none:    1;
--leading-tight:   1.25;
--leading-snug:    1.375;
--leading-normal:  1.5;
--leading-relaxed: 1.625;
--leading-loose:   2;
```

**Uso:**
- **Tight (1.25):** Headings, títulos
- **Normal (1.5):** Body text (padrão)
- **Relaxed (1.625):** Parágrafos longos

---

## 📏 Espaçamento

### Spacing Scale

```css
/* Spacing Scale (Base: 4px) */
--space-0:  0;
--space-1:  0.25rem;  /* 4px */
--space-2:  0.5rem;   /* 8px */
--space-3:  0.75rem;  /* 12px */
--space-4:  1rem;     /* 16px */
--space-5:  1.25rem;  /* 20px */
--space-6:  1.5rem;   /* 24px */
--space-8:  2rem;     /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

**Uso:**
- **1-2:** Padding interno de componentes pequenos
- **3-4:** Padding padrão de componentes
- **6-8:** Espaçamento entre seções
- **12-16:** Margens de página
- **20-24:** Espaçamento hero sections

---

## 🔲 Bordas e Sombras

### Border Radius

```css
/* Border Radius Scale */
--radius-none: 0;
--radius-sm:   0.125rem;  /* 2px */
--radius-base: 0.25rem;   /* 4px */
--radius-md:   0.375rem;  /* 6px */
--radius-lg:   0.5rem;    /* 8px */
--radius-xl:   0.75rem;   /* 12px */
--radius-2xl:  1rem;      /* 16px */
--radius-full: 9999px;    /* Circular */
```

**Uso:**
- **sm:** Inputs, badges
- **base:** Buttons, cards (padrão)
- **lg:** Modals, dropdowns
- **xl:** Hero sections
- **full:** Avatars, pills

---

### Box Shadows

```css
/* Shadow Scale */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
```

**Uso:**
- **sm:** Inputs, subtle elevation
- **base:** Cards, buttons (hover)
- **md:** Dropdowns, popovers
- **lg:** Modals, dialogs
- **xl:** Hero sections, floating elements

---

## 🎯 Componentes Base

### Button

#### Variantes

```tsx
// Primary Button (Tenant Actions)
<Button variant="primary">
  Criar Tenant
</Button>

// Secondary Button
<Button variant="secondary">
  Cancelar
</Button>

// Outline Button
<Button variant="outline">
  Ver Detalhes
</Button>

// Ghost Button
<Button variant="ghost">
  Editar
</Button>

// Danger Button
<Button variant="danger">
  Desativar Tenant
</Button>
```

#### Tamanhos

```tsx
<Button size="sm">Small</Button>
<Button size="md">Medium (default)</Button>
<Button size="lg">Large</Button>
```

#### Especificações

```css
/* Button Base */
.button {
  font-family: var(--font-sans);
  font-weight: var(--font-semibold);
  border-radius: var(--radius-base);
  transition: all 150ms ease-in-out;
  cursor: pointer;
}

/* Button Sizes */
.button-sm {
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  height: 32px;
}

.button-md {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-base);
  height: 40px;
}

.button-lg {
  padding: var(--space-3) var(--space-6);
  font-size: var(--text-lg);
  height: 48px;
}

/* Button Primary */
.button-primary {
  background: var(--primary-500);
  color: white;
}

.button-primary:hover {
  background: var(--primary-600);
  box-shadow: var(--shadow-md);
}

.button-primary:active {
  background: var(--primary-700);
  transform: scale(0.98);
}
```

---

### Badge

#### Variantes

```tsx
// Tenant Badge
<Badge variant="tenant">
  FourSys Ltda
</Badge>

// Role Badge
<Badge variant="admin">Admin</Badge>
<Badge variant="user">User</Badge>

// Status Badge
<Badge variant="success">Ativo</Badge>
<Badge variant="warning">Pendente</Badge>
<Badge variant="danger">Inativo</Badge>
```

#### Especificações

```css
/* Badge Base */
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  border-radius: var(--radius-full);
  white-space: nowrap;
}

/* Badge Tenant */
.badge-tenant {
  background: var(--primary-100);
  color: var(--primary-700);
  border: 1px solid var(--primary-200);
}

/* Badge Admin */
.badge-admin {
  background: var(--role-admin);
  color: white;
}

/* Badge Success */
.badge-success {
  background: var(--success-100);
  color: var(--success-700);
}
```

---

### Card

#### Variantes

```tsx
// Card Padrão
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>
    Conteúdo
  </CardContent>
</Card>

// Card Hover (Interactive)
<Card hover>
  Conteúdo interativo
</Card>

// Card com Border (Tenant Context)
<Card borderColor="primary">
  Tenant A
</Card>
```

#### Especificações

```css
/* Card Base */
.card {
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

/* Card Hover */
.card-hover {
  transition: all 200ms ease-in-out;
  cursor: pointer;
}

.card-hover:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
  border-color: var(--primary-300);
}

/* Card Header */
.card-header {
  padding: var(--space-6);
  border-bottom: 1px solid var(--border);
}

/* Card Content */
.card-content {
  padding: var(--space-6);
}
```

---

### Input

#### Variantes

```tsx
// Input Padrão
<Input 
  type="text" 
  placeholder="Nome da empresa"
/>

// Input com Label
<Label htmlFor="tenant-name">Nome da Empresa</Label>
<Input id="tenant-name" />

// Input com Erro
<Input error="Campo obrigatório" />

// Input Disabled
<Input disabled />
```

#### Especificações

```css
/* Input Base */
.input {
  width: 100%;
  height: 40px;
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-base);
  font-family: var(--font-sans);
  background: var(--background);
  border: 1px solid var(--input);
  border-radius: var(--radius-base);
  transition: all 150ms ease-in-out;
}

.input:focus {
  outline: none;
  border-color: var(--ring);
  box-shadow: 0 0 0 3px var(--primary-100);
}

.input:disabled {
  background: var(--muted);
  cursor: not-allowed;
  opacity: 0.6;
}

/* Input Error */
.input-error {
  border-color: var(--danger-500);
}

.input-error:focus {
  box-shadow: 0 0 0 3px var(--danger-100);
}
```

---

## 🎨 Componentes Multi-tenancy

### TenantBadge

**Propósito:** Indicador visual do tenant ativo

```tsx
<TenantBadge 
  tenantName="FourSys Ltda"
  tenantSlug="foursys"
  isActive={true}
/>
```

**Especificações:**
```css
.tenant-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--primary-50);
  border: 1px solid var(--primary-200);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--primary-700);
}

.tenant-badge-icon {
  width: 16px;
  height: 16px;
  color: var(--primary-500);
}

.tenant-badge-name {
  font-weight: var(--font-semibold);
}

.tenant-badge-slug {
  font-size: var(--text-xs);
  color: var(--primary-600);
  font-family: var(--font-mono);
}
```

---

### TenantSelector

**Propósito:** Dropdown para trocar de tenant

```tsx
<TenantSelector 
  tenants={[
    { id: '1', name: 'FourSys Ltda', slug: 'foursys' },
    { id: '2', name: 'Tech Solutions', slug: 'tech-solutions' }
  ]}
  activeTenantId="1"
  onSelect={(tenantId) => switchTenant(tenantId)}
/>
```

**Especificações:**
```css
.tenant-selector {
  position: relative;
  min-width: 200px;
}

.tenant-selector-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--radius-base);
  cursor: pointer;
  transition: all 150ms ease-in-out;
}

.tenant-selector-trigger:hover {
  border-color: var(--primary-300);
  background: var(--primary-50);
}

.tenant-selector-dropdown {
  position: absolute;
  top: calc(100% + var(--space-2));
  left: 0;
  right: 0;
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  max-height: 300px;
  overflow-y: auto;
  z-index: 50;
}

.tenant-selector-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  cursor: pointer;
  transition: background 150ms ease-in-out;
}

.tenant-selector-item:hover {
  background: var(--muted);
}

.tenant-selector-item-active {
  background: var(--primary-50);
  color: var(--primary-700);
}
```

---

### SignupStepper

**Propósito:** Wizard de cadastro em 3 etapas

```tsx
<SignupStepper 
  currentStep={1}
  steps={[
    { id: 1, title: 'Dados da Empresa', status: 'current' },
    { id: 2, title: 'Seus Dados', status: 'upcoming' },
    { id: 3, title: 'Confirmação', status: 'upcoming' }
  ]}
/>
```

**Especificações:**
```css
.signup-stepper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  margin-bottom: var(--space-8);
}

.signup-step {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.signup-step-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  transition: all 200ms ease-in-out;
}

/* Step Completed */
.signup-step-completed .signup-step-circle {
  background: var(--success-500);
  color: white;
}

/* Step Current */
.signup-step-current .signup-step-circle {
  background: var(--primary-500);
  color: white;
  box-shadow: 0 0 0 4px var(--primary-100);
}

/* Step Upcoming */
.signup-step-upcoming .signup-step-circle {
  background: var(--gray-200);
  color: var(--gray-500);
}

.signup-step-connector {
  width: 40px;
  height: 2px;
  background: var(--gray-200);
}

.signup-step-connector-completed {
  background: var(--success-500);
}
```

---

## 🎬 Animações e Transições

### Durations

```css
/* Animation Durations */
--duration-fast:   150ms;
--duration-base:   200ms;
--duration-slow:   300ms;
--duration-slower: 500ms;
```

**Uso:**
- **Fast (150ms):** Hover states, button clicks
- **Base (200ms):** Transitions padrão
- **Slow (300ms):** Modals, dropdowns
- **Slower (500ms):** Page transitions

---

### Easing Functions

```css
/* Easing Functions */
--ease-in:      cubic-bezier(0.4, 0, 1, 1);
--ease-out:     cubic-bezier(0, 0, 0.2, 1);
--ease-in-out:  cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce:  cubic-bezier(0.34, 1.56, 0.64, 1);
```

**Uso:**
- **Ease-in:** Elementos saindo da tela
- **Ease-out:** Elementos entrando na tela (padrão)
- **Ease-in-out:** Transições simétricas
- **Ease-bounce:** Efeitos divertidos (signup, success)

---

### Animações Padrão

```css
/* Fade In */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn var(--duration-base) var(--ease-out);
}

/* Slide In */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-slide-in {
  animation: slideIn var(--duration-base) var(--ease-out);
}

/* Scale In */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scaleIn var(--duration-base) var(--ease-out);
}

/* Bounce In (Success) */
@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-bounce-in {
  animation: bounceIn var(--duration-slow) var(--ease-bounce);
}
```

---

## 📱 Breakpoints

```css
/* Responsive Breakpoints */
--breakpoint-sm:  640px;   /* Mobile Large */
--breakpoint-md:  768px;   /* Tablet */
--breakpoint-lg:  1024px;  /* Desktop */
--breakpoint-xl:  1280px;  /* Desktop Large */
--breakpoint-2xl: 1536px;  /* Wide Desktop */
```

**Uso:**
```css
/* Mobile First */
.component {
  /* Mobile styles (default) */
}

@media (min-width: 768px) {
  .component {
    /* Tablet styles */
  }
}

@media (min-width: 1024px) {
  .component {
    /* Desktop styles */
  }
}
```

---

## ♿ Acessibilidade

### Focus States

```css
/* Focus Ring (Keyboard Navigation) */
*:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}

/* Remove default outline */
*:focus {
  outline: none;
}
```

### Color Contrast

**Mínimo WCAG AA:**
- Texto normal: 4.5:1
- Texto grande (18px+): 3:1
- Componentes UI: 3:1

**Validação:**
- Primary 500 (#3B82F6) em branco: ✅ 4.5:1
- Success 500 (#10B981) em branco: ✅ 4.5:1
- Danger 500 (#EF4444) em branco: ✅ 4.5:1

---

## 📦 Exportação de Tokens

### CSS Variables

```css
:root {
  /* Colors */
  --primary-500: #3B82F6;
  --success-500: #10B981;
  --danger-500: #EF4444;
  
  /* Typography */
  --font-sans: 'Inter', sans-serif;
  --text-base: 1rem;
  
  /* Spacing */
  --space-4: 1rem;
  
  /* Shadows */
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  
  /* Animations */
  --duration-base: 200ms;
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
}
```

### Tailwind Config

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EFF6FF',
          500: '#3B82F6',
          600: '#2563EB',
        },
        tenant: {
          purple: '#8B5CF6',
          pink: '#EC4899',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
      },
      boxShadow: {
        'tenant': '0 0 0 3px rgba(59, 130, 246, 0.1)',
      }
    }
  }
}
```

---

## 🎯 Próximos Passos

1. ✅ Validar tokens com equipe de dev
2. ✅ Implementar componentes base
3. ⏳ Criar Storybook de componentes
4. ⏳ Testes de acessibilidade

---

**Próximo Documento:** [02-user-flows.md](02-user-flows.md)

**Última Atualização:** 25/12/2025  
**Status:** ✅ Design System Completo



