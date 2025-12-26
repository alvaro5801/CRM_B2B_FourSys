# Implementation Guide - Multi-tenancy

**Versão:** 1.0  
**Data:** 25/12/2025  
**UX Designer:** Sally  
**Status:** 🛠️ Guia Completo

---

## 📋 Introdução

Este documento é um **guia prático de implementação** para desenvolvedores frontend implementarem o design de Multi-tenancy.

---

## 🚀 Getting Started

### 1. Revisar Documentação
```
Ordem de leitura recomendada:
1. README.md - Visão geral
2. 01-design-system.md - Tokens e componentes
3. 04-component-specs.md - Especificações técnicas
4. 09-animations.md - Animações
5. Este documento - Implementação
```

### 2. Setup do Projeto
```bash
# Instalar dependências
npm install @dnd-kit/core framer-motion sonner

# Copiar tokens do design system
# Ver seção "Design Tokens" abaixo
```

---

## 🎨 Design Tokens

### Criar arquivo de tokens
```typescript
// src/lib/design-tokens.ts

export const colors = {
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1E40AF',
  },
  success: {
    100: '#D1FAE5',
    500: '#10B981',
  },
  danger: {
    100: '#FEE2E2',
    500: '#EF4444',
  },
  gray: {
    50: '#F9FAFB',
    200: '#E5E7EB',
    500: '#6B7280',
    900: '#111827',
  },
};

export const spacing = {
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
};

export const typography = {
  fontFamily: {
    sans: "'Inter', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
  },
};

export const animations = {
  duration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
  },
  easing: {
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};
```

---

## 🧩 Componentes - Ordem de Implementação

### Fase 1: Componentes Base (Prioridade Alta)

#### 1.1 TenantBadge
```tsx
// src/components/multi-tenancy/TenantBadge.tsx

import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TenantBadgeProps {
  tenantName: string;
  tenantSlug: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function TenantBadge({
  tenantName,
  tenantSlug,
  isActive = true,
  onClick,
  className
}: TenantBadgeProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-2',
        'bg-primary-50 border border-primary-200 rounded-md',
        'text-sm font-medium text-primary-700',
        'transition-all duration-200',
        'hover:bg-primary-100 hover:border-primary-300',
        onClick && 'cursor-pointer',
        !isActive && 'opacity-50',
        className
      )}
      aria-label={`Tenant atual: ${tenantName}`}
      aria-haspopup={onClick ? 'listbox' : undefined}
    >
      <Building2 className="h-4 w-4" aria-hidden="true" />
      <div className="flex flex-col items-start">
        <span className="font-semibold">{tenantName}</span>
        <span className="text-xs font-mono text-primary-600">
          {tenantSlug}
        </span>
      </div>
    </button>
  );
}
```

**Checklist:**
- [ ] Implementar componente
- [ ] Adicionar testes unitários
- [ ] Validar acessibilidade (ARIA labels)
- [ ] Testar responsividade
- [ ] Adicionar ao Storybook

---

#### 1.2 TenantSelector
```tsx
// src/components/multi-tenancy/TenantSelector.tsx

import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  leadsCount: number;
  usersCount: number;
}

interface TenantSelectorProps {
  tenants: Tenant[];
  activeTenantId: string;
  onSelect: (tenantId: string) => Promise<void>;
  isLoading?: boolean;
}

export function TenantSelector({
  tenants,
  activeTenantId,
  onSelect,
  isLoading = false
}: TenantSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const activeTenant = tenants.find(t => t.id === activeTenantId);

  const handleSelect = async (tenantId: string) => {
    setIsOpen(false);
    await onSelect(tenantId);
  };

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2',
          'bg-white border border-gray-200 rounded-md',
          'hover:border-primary-300 hover:bg-primary-50',
          'transition-all duration-200'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>{activeTenant?.name}</span>
        <ChevronDown className={cn(
          'h-4 w-4 transition-transform',
          isOpen && 'rotate-180'
        )} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Selecionar tenant"
          className={cn(
            'absolute top-full left-0 right-0 mt-2',
            'bg-white border border-gray-200 rounded-lg',
            'shadow-lg max-h-96 overflow-y-auto',
            'animate-slide-down z-50'
          )}
        >
          {tenants.map(tenant => (
            <div
              key={tenant.id}
              role="option"
              aria-selected={tenant.id === activeTenantId}
              tabIndex={0}
              onClick={() => handleSelect(tenant.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSelect(tenant.id);
              }}
              className={cn(
                'flex items-center justify-between gap-3 p-3',
                'cursor-pointer transition-colors',
                'hover:bg-gray-50',
                tenant.id === activeTenantId && 'bg-primary-50'
              )}
            >
              <div className="flex-1">
                <div className="font-medium">{tenant.name}</div>
                <div className="text-xs text-gray-500 font-mono">
                  {tenant.slug}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {tenant.leadsCount} leads • {tenant.usersCount} usuários
                </div>
              </div>
              {tenant.id === activeTenantId && (
                <Check className="h-4 w-4 text-primary-600" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Checklist:**
- [ ] Implementar componente
- [ ] Adicionar busca (se > 5 tenants)
- [ ] Implementar navegação por teclado
- [ ] Fechar ao click fora
- [ ] Adicionar loading state
- [ ] Testes unitários

---

#### 1.3 SignupStepper
```tsx
// src/components/multi-tenancy/SignupStepper.tsx

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: number;
  title: string;
  status: 'completed' | 'current' | 'upcoming';
}

interface SignupStepperProps {
  currentStep: number;
  steps: Step[];
  onStepClick?: (step: number) => void;
}

export function SignupStepper({
  currentStep,
  steps,
  onStepClick
}: SignupStepperProps) {
  return (
    <nav aria-label="Progresso do cadastro">
      <ol className="flex items-center justify-center gap-2">
        {steps.map((step, index) => (
          <li key={step.id} className="flex items-center">
            {/* Step Circle */}
            <button
              onClick={() => onStepClick?.(step.id)}
              disabled={step.status === 'upcoming'}
              className={cn(
                'flex items-center justify-center',
                'w-8 h-8 rounded-full',
                'font-semibold text-sm',
                'transition-all duration-200',
                step.status === 'completed' && 'bg-success-500 text-white',
                step.status === 'current' && 'bg-primary-500 text-white ring-4 ring-primary-100',
                step.status === 'upcoming' && 'bg-gray-200 text-gray-500'
              )}
              aria-current={step.status === 'current' ? 'step' : undefined}
              aria-label={`Passo ${step.id}: ${step.title}`}
            >
              {step.status === 'completed' ? (
                <Check className="h-4 w-4" />
              ) : (
                step.id
              )}
            </button>

            {/* Connector */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'w-10 h-0.5 mx-2',
                  step.status === 'completed' ? 'bg-success-500' : 'bg-gray-200'
                )}
                aria-hidden="true"
              />
            )}
          </li>
        ))}
      </ol>

      {/* Step Title (Mobile) */}
      <div className="text-center mt-4 md:hidden">
        <p className="text-sm text-gray-600">
          Passo {currentStep} de {steps.length}
        </p>
        <p className="font-medium">
          {steps.find(s => s.id === currentStep)?.title}
        </p>
      </div>
    </nav>
  );
}
```

---

### Fase 2: Componentes Avançados (Prioridade Média)

#### 2.1 UserInviteModal
```tsx
// src/components/multi-tenancy/UserInviteModal.tsx

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

const inviteSchema = z.object({
  email: z.string().email('Email inválido'),
  role: z.enum(['admin', 'user', 'viewer']),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface UserInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (data: InviteFormData) => Promise<void>;
}

export function UserInviteModal({
  isOpen,
  onClose,
  onInvite
}: UserInviteModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      role: 'user',
    },
  });

  const handleSubmit = async (data: InviteFormData) => {
    setIsLoading(true);
    try {
      await onInvite(data);
      form.reset();
      onClose();
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convidar Usuário</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email">Email do Usuário *</label>
            <Input
              id="email"
              type="email"
              {...form.register('email')}
              error={form.formState.errors.email?.message}
            />
          </div>

          {/* Role */}
          <div>
            <label htmlFor="role">Função *</label>
            <Select {...form.register('role')}>
              <option value="admin">Admin - Acesso total</option>
              <option value="user">User - Criar e editar leads</option>
              <option value="viewer">Viewer - Apenas visualizar</option>
            </Select>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-sm text-blue-700">
              💡 O usuário receberá um email com link para ativar a conta.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Enviar Convite'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 🎬 Implementando Animações

### Com Framer Motion
```tsx
import { motion, AnimatePresence } from 'framer-motion';

// Modal com animação
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Modal />
    </motion.div>
  )}
</AnimatePresence>

// Dropdown com animação
<motion.div
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2 }}
>
  <Dropdown />
</motion.div>
```

### Com CSS
```css
/* globals.css */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-down {
  animation: slideDown 200ms cubic-bezier(0, 0, 0.2, 1);
}
```

---

## ♿ Implementando Acessibilidade

### Checklist por Componente
```tsx
// ✅ Bom exemplo
<button
  aria-label="Tenant atual: FourSys Ltda"
  aria-haspopup="listbox"
  aria-expanded={isOpen}
  onClick={toggle}
>
  <span aria-hidden="true">🏢</span>
  FourSys Ltda
</button>

// Focus management
useEffect(() => {
  if (isOpen) {
    firstInputRef.current?.focus();
  }
}, [isOpen]);

// Keyboard navigation
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') close();
  if (e.key === 'ArrowDown') navigateDown();
  if (e.key === 'ArrowUp') navigateUp();
  if (e.key === 'Enter') select();
};
```

---

## 📱 Implementando Responsividade

### Tailwind Breakpoints
```tsx
<div className={cn(
  'grid gap-4',
  'grid-cols-1',           // Mobile
  'md:grid-cols-2',        // Tablet
  'lg:grid-cols-3'         // Desktop
)}>
  {/* Content */}
</div>
```

### Mobile-specific
```tsx
// Sidebar collapsible
<aside className={cn(
  'fixed inset-y-0 left-0 z-50',
  'w-64 bg-white border-r',
  'transform transition-transform',
  'lg:relative lg:translate-x-0',
  isOpen ? 'translate-x-0' : '-translate-x-full'
)}>
  {/* Sidebar content */}
</aside>
```

---

## 🧪 Testes

### Unit Tests (Jest + React Testing Library)
```tsx
// TenantBadge.test.tsx
import { render, screen } from '@testing-library/react';
import { TenantBadge } from './TenantBadge';

describe('TenantBadge', () => {
  it('renders tenant name', () => {
    render(
      <TenantBadge
        tenantName="FourSys Ltda"
        tenantSlug="foursys"
      />
    );

    expect(screen.getByText('FourSys Ltda')).toBeInTheDocument();
    expect(screen.getByText('foursys')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(
      <TenantBadge
        tenantName="FourSys"
        tenantSlug="foursys"
        onClick={handleClick}
      />
    );

    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### E2E Tests (Cypress)
```typescript
// tenant-selector.cy.ts
describe('Tenant Selector', () => {
  it('switches tenant successfully', () => {
    cy.visit('/dashboard');
    
    // Open selector
    cy.get('[aria-label*="Tenant atual"]').click();
    
    // Select different tenant
    cy.get('[role="option"]').contains('Tech Solutions').click();
    
    // Verify switch
    cy.get('[aria-label*="Tenant atual"]').should('contain', 'Tech Solutions');
    cy.url().should('include', '/dashboard');
  });
});
```

---

## 📦 Deployment Checklist

### Antes de Deploy
- [ ] Todos os componentes implementados
- [ ] Testes unitários passando (> 80% coverage)
- [ ] Testes E2E passando
- [ ] Lighthouse score > 90
- [ ] Acessibilidade validada (axe)
- [ ] Responsividade testada (mobile, tablet, desktop)
- [ ] Performance otimizada (< 3s FCP)

### Deploy
- [ ] Build de produção sem erros
- [ ] Assets otimizados (images, fonts)
- [ ] Code splitting configurado
- [ ] Error tracking (Sentry)
- [ ] Analytics configurado

---

## 🐛 Troubleshooting

### Problema: Animações não funcionam
```tsx
// Solução: Verificar prefers-reduced-motion
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

const duration = prefersReducedMotion ? 0 : 200;
```

### Problema: Focus trap não funciona em modal
```tsx
// Solução: Usar biblioteca focus-trap-react
import FocusTrap from 'focus-trap-react';

<FocusTrap>
  <Modal />
</FocusTrap>
```

### Problema: Dropdown fecha ao click interno
```tsx
// Solução: Parar propagação
<div onClick={(e) => e.stopPropagation()}>
  {/* Dropdown content */}
</div>
```

---

## 📚 Recursos Úteis

### Bibliotecas Recomendadas
- **Framer Motion:** Animações
- **Radix UI:** Componentes acessíveis
- **React Hook Form:** Formulários
- **Zod:** Validação
- **Sonner:** Toast notifications

### Ferramentas
- **Storybook:** Documentação de componentes
- **Chromatic:** Visual regression testing
- **Playwright:** E2E testing
- **Lighthouse:** Performance audit

---

## ✅ Checklist Final

### Componentes
- [ ] TenantBadge
- [ ] TenantSelector
- [ ] SignupStepper
- [ ] UserInviteModal
- [ ] TenantCard
- [ ] ActivityLog

### Funcionalidades
- [ ] Trocar de tenant
- [ ] Signup flow
- [ ] Convidar usuário
- [ ] Admin dashboard

### Qualidade
- [ ] Testes unitários
- [ ] Testes E2E
- [ ] Acessibilidade
- [ ] Performance
- [ ] Responsividade

---

**Última Atualização:** 25/12/2025  
**Status:** ✅ Guia de Implementação Completo

**Dúvidas?** Consulte a documentação completa ou entre em contato com o UX Designer (Sally).



