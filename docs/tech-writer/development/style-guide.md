# Style Guide - Padrões de Desenvolvimento

**Versão:** 2.0.0  
**Data:** 26/12/2025  
**Autor:** Paige (Senior Technical Writer) 📚

---

## 📋 Visão Geral

Este guia documenta os padrões de código, convenções de nomenclatura e boas práticas utilizadas no desenvolvimento do CRM FourSys.

---

## 🎨 Padrão de Toasts

### Biblioteca

**Sonner** - Toast notifications elegantes e acessíveis

```bash
npm install sonner
```

### Configuração Global

**Localização:** `src/app/layout.tsx`

```typescript
import { Toaster } from "sonner";

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <Toaster 
          position="top-right" 
          richColors 
          closeButton
          style={{ zIndex: 99999 }}
        />
      </body>
    </html>
  );
}
```

**Propriedades:**
- `position="top-right"` - Canto superior direito
- `richColors` - Cores semânticas automáticas
- `closeButton` - Botão X para fechar
- `style={{ zIndex: 99999 }}` - Sempre no topo

---

### Cores Semânticas

#### Sucesso (Esmeralda)

```typescript
import { toast } from 'sonner';

toast.success('Lead criado com sucesso!', {
  description: 'João Silva foi adicionado ao pipeline.',
  duration: 4000, // 4 segundos (padrão)
});
```

**Cor:** Verde esmeralda (#10b981)  
**Uso:** Operações bem-sucedidas  
**Duração:** 4 segundos (padrão)

---

#### Erro (Vermelho)

```typescript
toast.error('Erro ao criar lead', {
  description: 'Já existe um lead com este e-mail.',
  duration: 5000, // 5 segundos para erros
});
```

**Cor:** Vermelho (#ef4444)  
**Uso:** Erros e falhas  
**Duração:** 5 segundos (mais tempo para ler)

---

#### Informação (Azul)

```typescript
toast.info('Lead movido!', {
  description: 'Movido para Qualificado.',
  duration: 2000, // 2 segundos (discreto)
});
```

**Cor:** Azul (#3b82f6)  
**Uso:** Informações neutras  
**Duração:** 2 segundos (ações rápidas)

---

#### Aviso (Amarelo)

```typescript
toast.warning('Atenção', {
  description: 'Este lead não possui email cadastrado.',
});
```

**Cor:** Amarelo (#f59e0b)  
**Uso:** Avisos e alertas

---

### Z-Index

**Valor:** `99999`

**Motivo:** Garantir que toasts apareçam sobre:
- Modais (z-index: 50)
- Dropdowns (z-index: 1000)
- Overlays (z-index: 40)

```typescript
<Toaster style={{ zIndex: 99999 }} />
```

---

### Botão de Fechar com stopPropagation

**Implementação Automática:**

O Sonner já implementa `stopPropagation` no botão de fechar. Não é necessário código adicional.

**Comportamento:**
- Clicar no X fecha apenas o toast
- Não propaga evento para elementos abaixo
- Não interfere com cliques na página

---

### Padrões de Uso

#### Criar Lead

```typescript
try {
  const lead = await createLead(data);
  toast.success('Lead criado com sucesso!', {
    description: `${lead.name} foi adicionado ao pipeline.`
  });
} catch (error) {
  toast.error('Erro ao criar lead', {
    description: error.message
  });
}
```

#### Mover Lead (Drag & Drop)

```typescript
try {
  await updateLeadStatus({ id, status });
  toast.success('Lead movido!', {
    description: `Movido para ${STATUS_LABELS[status]}.`,
    duration: 2000 // Discreto
  });
} catch (error) {
  toast.error('Erro ao mover lead');
}
```

#### Excluir Lead

```typescript
try {
  await deleteLead(id);
  toast.success('Lead excluído com sucesso!');
} catch (error) {
  toast.error('Erro ao excluir lead', {
    description: 'Tente novamente em alguns instantes.'
  });
}
```

---

## 📁 Organização de Pastas (Next.js 15)

### App Router

```
src/
├── app/
│   ├── (auth)/              # Route Group: Autenticação
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── (dashboard)/         # Route Group: Dashboard
│   │   ├── layout.tsx       # Layout com Sidebar
│   │   ├── page.tsx         # Dashboard
│   │   └── kanban/
│   │       └── page.tsx
│   ├── actions/             # Server Actions
│   │   ├── leads.ts
│   │   ├── auth.ts
│   │   ├── tenants.ts
│   │   └── users.ts
│   ├── api/                 # API Routes (se necessário)
│   ├── layout.tsx           # Layout raiz
│   └── globals.css          # Estilos globais
├── components/
│   ├── dashboard/
│   ├── kanban/
│   ├── layout/
│   └── ui/                  # Shadcn/ui components
└── lib/
    ├── prisma.ts
    ├── auth.ts
    ├── utils.ts
    └── validations/
```

### Route Groups

**Sintaxe:** `(nome-do-grupo)`

**Características:**
- Não afeta a URL
- Permite layouts diferentes
- Organiza rotas logicamente

**Exemplo:**

```
app/
├── (auth)/
│   ├── layout.tsx          # Layout sem Sidebar
│   ├── login/page.tsx      # URL: /login
│   └── signup/page.tsx     # URL: /signup
└── (dashboard)/
    ├── layout.tsx          # Layout com Sidebar
    ├── page.tsx            # URL: /
    └── kanban/page.tsx     # URL: /kanban
```

---

## 🎯 Nomenclatura

### Arquivos

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Componente | PascalCase.tsx | `LeadCard.tsx` |
| Server Action | kebab-case.ts | `leads.ts` |
| Utilitário | kebab-case.ts | `utils.ts` |
| Tipo | PascalCase.ts | `Lead.ts` |
| Página | page.tsx | `page.tsx` |
| Layout | layout.tsx | `layout.tsx` |

### Variáveis e Funções

```typescript
// Variáveis: camelCase
const leadCount = 10;
const isActive = true;

// Funções: camelCase
function formatCurrency(value: number) { }
async function getLeads() { }

// Componentes: PascalCase
function LeadCard() { }

// Constantes: UPPER_SNAKE_CASE
const MAX_LEADS = 100;
const API_URL = 'https://api.example.com';

// Tipos/Interfaces: PascalCase
interface Lead { }
type LeadStatus = 'prospect' | 'qualified';
```

### Server Actions

**Prefixo:** `SA` + número sequencial

```typescript
/**
 * SA001 - Obter todos os leads
 */
export async function getLeads() { }

/**
 * SA002 - Criar novo lead
 */
export async function createLead() { }

/**
 * SA-AUTH001 - Signup
 */
export async function signup() { }
```

---

## 🎨 Convenções de Código

### TypeScript

#### Sempre Tipar

```typescript
// ✅ BOM
function formatCurrency(value: number): string {
  return `R$ ${value.toFixed(2)}`;
}

// ❌ RUIM
function formatCurrency(value) {
  return `R$ ${value.toFixed(2)}`;
}
```

#### Interfaces vs Types

```typescript
// ✅ Interface para objetos
interface Lead {
  id: string;
  name: string;
}

// ✅ Type para unions
type LeadStatus = 'prospect' | 'qualified' | 'proposal' | 'closed';

// ✅ Type para funções
type FormatFunction = (value: number) => string;
```

---

### React

#### Componentes Funcionais

```typescript
// ✅ BOM: Arrow function com tipos
export const LeadCard: React.FC<LeadCardProps> = ({ lead }) => {
  return <div>{lead.name}</div>;
};

// ✅ BOM: Function declaration
export function LeadCard({ lead }: LeadCardProps) {
  return <div>{lead.name}</div>;
}
```

#### Hooks

```typescript
// ✅ BOM: Hooks no topo
export function MyComponent() {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // ...
  }, []);
  
  return <div />;
}

// ❌ RUIM: Hooks condicionais
export function MyComponent({ show }) {
  if (show) {
    const [value, setValue] = useState(""); // ERRO!
  }
}
```

---

### Server Actions

#### Padrão de Estrutura

```typescript
'use server';

import { prisma } from '@/lib/prisma';
import { requireTenant } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface MyInput {
  // ...
}

export interface MyOutput {
  // ...
}

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * SA001 - Descrição da ação
 * 
 * SEGURANÇA: Notas de segurança
 * 
 * @param data - Descrição do parâmetro
 * @returns Descrição do retorno
 */
export async function myAction(data: MyInput): Promise<MyOutput> {
  try {
    // 1. Obter tenantId
    const tenantId = await requireTenant();
    
    // 2. Validações
    if (!data.field) {
      throw new Error('Campo obrigatório');
    }
    
    // 3. Operação no banco
    const result = await prisma.model.create({
      data: {
        ...data,
        tenantId
      }
    });
    
    // 4. Revalidar cache
    revalidatePath('/');
    
    // 5. Retornar resultado
    return result;
  } catch (error) {
    console.error('Error in myAction:', error);
    throw new Error('Mensagem amigável');
  }
}
```

---

## 🎨 Tailwind CSS

### Classes Utilitárias

```typescript
// ✅ BOM: Usar cn() para classes condicionais
import { cn } from '@/lib/utils';

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  isDisabled && "disabled-classes"
)} />

// ❌ RUIM: Concatenação manual
<div className={`base-classes ${isActive ? 'active' : ''}`} />
```

### Responsividade

```typescript
// Mobile-first
<div className="
  p-4           // Mobile
  md:p-6        // Tablet (768px+)
  lg:p-8        // Desktop (1024px+)
" />
```

### Animações

```typescript
// Transições suaves
<div className="
  transition-all
  duration-200
  hover:scale-105
  hover:shadow-lg
" />
```

---

## 📚 Comentários e Documentação

### JSDoc para Funções

```typescript
/**
 * Formatar valor monetário em R$
 * 
 * @param value - Valor numérico ou string
 * @returns String formatada (ex: "R$ 15.000,00")
 * 
 * @example
 * formatCurrency(15000) // "R$ 15.000,00"
 */
export function formatCurrency(value: number | string): string {
  // ...
}
```

### Comentários Inline

```typescript
// ✅ BOM: Explicar o porquê
// Usar transação para garantir atomicidade
await prisma.$transaction(async (tx) => {
  // ...
});

// ❌ RUIM: Repetir o código
// Criar lead
await prisma.lead.create({ ... });
```

---

## 🔒 Segurança

### Checklist

- [ ] Usar `requireTenant()` em todas as Server Actions
- [ ] Filtrar queries por `tenantId`
- [ ] Validar propriedade antes de update/delete
- [ ] Hash de senhas com bcrypt
- [ ] Sanitizar inputs
- [ ] Não expor informações sensíveis em erros
- [ ] Usar HTTPS em produção

---

## 📚 Referências

### Documentação Externa

- [Next.js 15 App Router](https://nextjs.org/docs/app)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Sonner](https://sonner.emilkowal.ski/)

### Documentação Interna

- [Multi-Tenancy](../architecture/multi-tenancy.md)
- [Server Actions](../api/server-actions.md)
- [Leads Management](../features/leads-management.md)

---

**Documentado por:** Paige (Senior Technical Writer) 📚  
**Versão:** 2.0.0  
**Data:** 26/12/2025  
**Status:** ✅ Completo

