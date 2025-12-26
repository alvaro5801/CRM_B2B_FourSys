# Guia de Componentes UI

**Versão:** 1.0.0  
**Data:** 25/12/2025  
**Localização:** `src/components/`  
**Documentação:** `docs/tech-writer/components-guide.md`

---

## Visão Geral

Este guia documenta todos os componentes UI customizados do CRM B2B FourSys, suas props, casos de uso e exemplos de implementação.

### Estrutura de Componentes

```
src/components/
├── dashboard/          # Componentes do Dashboard
│   ├── MetricCard.tsx
│   ├── SalesChart.tsx
│   └── DashboardGrid.tsx
├── kanban/             # Componentes do Kanban
│   ├── LeadCard.tsx
│   ├── KanbanColumn.tsx
│   ├── KanbanBoard.tsx
│   └── CreateLeadModal.tsx
├── layout/             # Componentes de Layout
│   └── Sidebar.tsx
└── ui/                 # Componentes Base (Shadcn/ui)
    ├── badge.tsx
    ├── button.tsx
    ├── card.tsx
    ├── dialog.tsx
    ├── form.tsx
    ├── input.tsx
    ├── label.tsx
    ├── select.tsx
    ├── loading.tsx
    └── empty-state.tsx
```

---

## Dashboard Components

### MetricCard

Card para exibir métricas do dashboard com ícone e descrição.

**Localização:** `src/components/dashboard/MetricCard.tsx`

**Props:**

```typescript
interface MetricCardProps {
  title: string;           // Título da métrica
  value: string | number;  // Valor da métrica
  description: string;     // Descrição/contexto
  icon: LucideIcon;        // Ícone do Lucide React
  className?: string;      // Classes CSS adicionais
}
```

**Exemplo de Uso:**

```typescript
import { MetricCard } from '@/components/dashboard/MetricCard';
import { DollarSign, Users, TrendingUp } from 'lucide-react';

<MetricCard
  title="Pipeline Total"
  value="R$ 245.000,00"
  description="Soma de leads ativos"
  icon={DollarSign}
/>

<MetricCard
  title="Leads Ativos"
  value={42}
  description="Leads não fechados"
  icon={Users}
/>

<MetricCard
  title="Taxa de Conversão"
  value="23,5%"
  description="Últimos 30 dias"
  icon={TrendingUp}
/>
```

**Características:**
- ✅ Animação hover (levanta e aumenta sombra)
- ✅ Ícone no canto superior direito
- ✅ Valor em destaque (text-4xl font-bold)
- ✅ Descrição em texto menor
- ✅ Responsivo

---

### SalesChart

Gráfico de linha para exibir vendas dos últimos 30 dias usando Recharts.

**Localização:** `src/components/dashboard/SalesChart.tsx`

**Props:**

```typescript
interface SalesChartProps {
  data?: Array<{
    date: string;
    value: number;
  }>;
}
```

**Exemplo de Uso:**

```typescript
import { SalesChart } from '@/components/dashboard/SalesChart';

const salesData = [
  { date: '01/12', value: 12000 },
  { date: '02/12', value: 15000 },
  { date: '03/12', value: 18000 },
  // ... mais dados
];

<SalesChart data={salesData} />
```

**Características:**
- ✅ Tooltip interativo ao hover
- ✅ Animação suave ao carregar
- ✅ Responsivo (ajusta altura automaticamente)
- ✅ Cores do tema (primary)
- ✅ Dados mockados por padrão se não fornecidos

---

### DashboardGrid

Container grid para organizar os cards do dashboard.

**Localização:** `src/components/dashboard/DashboardGrid.tsx`

**Props:**

```typescript
interface DashboardGridProps {
  children: React.ReactNode;
}
```

**Exemplo de Uso:**

```typescript
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';

<DashboardGrid>
  <MetricCard {...props1} />
  <MetricCard {...props2} />
  <MetricCard {...props3} />
</DashboardGrid>
```

**Características:**
- ✅ Grid responsivo (1 coluna mobile, 2 tablet, 3 desktop)
- ✅ Gap consistente entre cards
- ✅ Animação fade-in ao carregar

---

## Kanban Components

### LeadCard

Card individual de lead com drag & drop, exibindo informações do cliente.

**Localização:** `src/components/kanban/LeadCard.tsx`

**Props:**

```typescript
interface LeadCardProps {
  lead: Lead;              // Objeto Lead completo
  isDragging?: boolean;    // Se está sendo arrastado
}
```

**Estrutura do Lead:**

```typescript
interface Lead {
  id: string;
  name: string;
  company: string;
  status: LeadStatus;
  value: number;
  aiScore: number;
  email?: string | null;
  phone?: string | null;
  lastContact: Date;
}
```

**Exemplo de Uso:**

```typescript
import { LeadCard } from '@/components/kanban/LeadCard';

const lead = {
  id: '123',
  name: 'João Silva',
  company: 'Tech Solutions',
  status: 'prospect',
  value: 15000,
  aiScore: 85,
  email: 'joao@tech.com',
  phone: '(11) 98765-4321',
  lastContact: new Date(),
};

<LeadCard lead={lead} />
```

**Características:**
- ✅ **Drag & Drop:** Cursor muda para grab/grabbing
- ✅ **AI Score Badge:** Cores baseadas no score
  - 0-39: Vermelho (danger)
  - 40-69: Amarelo (warning)
  - 70-100: Verde (success)
- ✅ **Animação Pulse:** Scores > 85 pulsam
- ✅ **Hover:** Levanta e aumenta sombra
- ✅ **Dragging:** Opacidade 50% e rotação 3°
- ✅ **Informações:** Nome, empresa, valor, contatos, última data
- ✅ **Ícones:** Building2, Mail, Phone, Sparkles

**Lógica de Cores do AI Score:**

```typescript
function getScoreBadgeVariant(score: number): "success" | "warning" | "danger" {
  if (score >= 70) return 'success';  // Verde
  if (score >= 40) return 'warning';  // Amarelo
  return 'danger';                     // Vermelho
}
```

---

### KanbanColumn

Coluna do Kanban que contém múltiplos LeadCards.

**Localização:** `src/components/kanban/KanbanColumn.tsx`

**Props:**

```typescript
interface KanbanColumnProps {
  id: LeadStatus;          // ID da coluna (prospect, qualified, etc)
  title: string;           // Título da coluna
  leads: Lead[];           // Array de leads nesta coluna
}
```

**Exemplo de Uso:**

```typescript
import { KanbanColumn } from '@/components/kanban/KanbanColumn';

<KanbanColumn
  id="prospect"
  title="Prospect"
  leads={prospectLeads}
/>
```

**Características:**
- ✅ **Drop Zone:** Área para soltar cards
- ✅ **Contador:** Mostra número de leads na coluna
- ✅ **Highlight:** Borda azul quando card está sobre ela
- ✅ **Cores por Status:**
  - Prospect: Azul
  - Qualificado: Amarelo
  - Proposta: Laranja
  - Fechado: Verde
- ✅ **Empty State:** Mensagem quando vazia
- ✅ **Scroll:** Rolagem vertical se muitos cards

---

### KanbanBoard

Board principal que orquestra todas as colunas e o drag & drop.

**Localização:** `src/components/kanban/KanbanBoard.tsx`

**Props:**

```typescript
interface KanbanBoardProps {
  initialLeads: Lead[];    // Leads iniciais do servidor
}
```

**Exemplo de Uso:**

```typescript
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { getLeads } from '@/app/actions/leads';

export default async function KanbanPage() {
  const leads = await getLeads();
  
  return <KanbanBoard initialLeads={leads} />;
}
```

**Características:**
- ✅ **DnD Context:** Gerencia drag & drop com @dnd-kit
- ✅ **Optimistic Updates:** UI atualiza instantaneamente
- ✅ **4 Colunas Fixas:** Prospect → Qualificado → Proposta → Fechado
- ✅ **Drag Overlay:** Card fantasma segue o mouse
- ✅ **Toasts:** Feedback ao mover lead (sucesso/erro)
- ✅ **Revalidação:** Atualiza cache após mudanças
- ✅ **Responsivo:** 1 coluna mobile, 2 tablet, 4 desktop

**Fluxo de Drag & Drop:**

1. Usuário arrasta card (`handleDragStart`)
2. Card fantasma aparece no overlay
3. Colunas destacam ao hover
4. Usuário solta card (`handleDragEnd`)
5. UI atualiza instantaneamente (optimistic)
6. Servidor atualiza em background
7. Toast confirma sucesso ou erro

---

### CreateLeadModal

Modal para criar novo lead com formulário validado.

**Localização:** `src/components/kanban/CreateLeadModal.tsx`

**Props:**

```typescript
interface CreateLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

**Exemplo de Uso:**

```typescript
import { CreateLeadModal } from '@/components/kanban/CreateLeadModal';
import { useState } from 'react';

const [open, setOpen] = useState(false);

<>
  <Button onClick={() => setOpen(true)}>Novo Lead</Button>
  <CreateLeadModal open={open} onOpenChange={setOpen} />
</>
```

**Características:**
- ✅ **Validação:** Zod + React Hook Form
- ✅ **Campos Obrigatórios:** Nome, Empresa, Valor, Status
- ✅ **Campos Opcionais:** Email, Telefone
- ✅ **Validação em Tempo Real:** Mensagens de erro instantâneas
- ✅ **Loading State:** Botão mostra spinner durante envio
- ✅ **Toasts:** Sucesso (verde) ou erro (vermelho)
- ✅ **Auto-close:** Fecha após sucesso
- ✅ **Reset:** Limpa formulário após criar
- ✅ **Animação:** Slide-in ao abrir

**Validações:**

```typescript
name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres')
company: z.string().min(2, 'Empresa deve ter no mínimo 2 caracteres')
value: z.number().min(0, 'Valor não pode ser negativo')
status: z.enum(['prospect', 'qualified', 'proposal', 'closed'])
email: z.string().email('Email inválido').optional().or(z.literal(''))
phone: z.string().optional()
```

---

## Layout Components

### Sidebar

Barra lateral de navegação com logo e menu.

**Localização:** `src/components/layout/Sidebar.tsx`

**Props:** Nenhuma (componente standalone)

**Exemplo de Uso:**

```typescript
import { Sidebar } from '@/components/layout/Sidebar';

export default function RootLayout({ children }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
```

**Características:**
- ✅ **Logo:** "CRM FourSys" no topo
- ✅ **Menu Items:**
  - Dashboard (LayoutDashboard icon)
  - Pipeline (Kanban icon)
- ✅ **Active State:** Item atual destacado em azul
- ✅ **Hover:** Transição suave de cor
- ✅ **Footer:** Versão "v1.0" no rodapé
- ✅ **Responsivo:** Esconde em mobile (< 768px)
- ✅ **Navegação:** Link do Next.js (sem reload)

**Estrutura:**

```typescript
const menuItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/kanban', label: 'Pipeline', icon: Kanban },
];
```

---

## UI Components (Shadcn/ui)

### Badge

Componente para exibir badges com variantes de cor.

**Localização:** `src/components/ui/badge.tsx`

**Props:**

```typescript
interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'outline';
  className?: string;
  children: React.ReactNode;
}
```

**Exemplo de Uso:**

```typescript
import { Badge } from '@/components/ui/badge';

<Badge variant="success">Alta Prioridade</Badge>
<Badge variant="warning">Média Prioridade</Badge>
<Badge variant="danger">Baixa Prioridade</Badge>
```

**Variantes:**
- `default` - Cinza
- `success` - Verde
- `warning` - Amarelo
- `danger` - Vermelho
- `outline` - Borda apenas

---

### Button

Botão com variantes e tamanhos.

**Localização:** `src/components/ui/button.tsx`

**Props:**

```typescript
interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}
```

**Exemplo de Uso:**

```typescript
import { Button } from '@/components/ui/button';

<Button>Clique Aqui</Button>
<Button variant="destructive">Deletar</Button>
<Button variant="outline" size="sm">Pequeno</Button>
<Button disabled>Desabilitado</Button>
```

---

### Card

Container card com header e content.

**Localização:** `src/components/ui/card.tsx`

**Componentes:**
- `Card` - Container principal
- `CardHeader` - Cabeçalho
- `CardTitle` - Título
- `CardDescription` - Descrição
- `CardContent` - Conteúdo
- `CardFooter` - Rodapé

**Exemplo de Uso:**

```typescript
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Título do Card</CardTitle>
  </CardHeader>
  <CardContent>
    Conteúdo aqui
  </CardContent>
</Card>
```

---

### Dialog

Modal/Dialog acessível com overlay.

**Localização:** `src/components/ui/dialog.tsx`

**Componentes:**
- `Dialog` - Container principal
- `DialogTrigger` - Botão que abre
- `DialogContent` - Conteúdo do modal
- `DialogHeader` - Cabeçalho
- `DialogTitle` - Título
- `DialogDescription` - Descrição
- `DialogFooter` - Rodapé

**Exemplo de Uso:**

```typescript
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Abrir Modal</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título do Modal</DialogTitle>
    </DialogHeader>
    <p>Conteúdo do modal aqui</p>
  </DialogContent>
</Dialog>
```

---

### Form

Componentes de formulário integrados com React Hook Form.

**Localização:** `src/components/ui/form.tsx`

**Componentes:**
- `Form` - Provider do formulário
- `FormField` - Campo controlado
- `FormItem` - Container do campo
- `FormLabel` - Label do campo
- `FormControl` - Wrapper do input
- `FormMessage` - Mensagem de erro

**Exemplo de Uso:**

```typescript
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const form = useForm();

<Form {...form}>
  <FormField
    control={form.control}
    name="name"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Nome</FormLabel>
        <FormControl>
          <Input {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```

---

### Input

Campo de input estilizado.

**Localização:** `src/components/ui/input.tsx`

**Props:**

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}
```

**Exemplo de Uso:**

```typescript
import { Input } from '@/components/ui/input';

<Input type="text" placeholder="Digite seu nome" />
<Input type="email" placeholder="email@exemplo.com" />
<Input type="number" placeholder="0" />
```

---

### Loading

Spinner de loading animado.

**Localização:** `src/components/ui/loading.tsx`

**Props:**

```typescript
interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

**Exemplo de Uso:**

```typescript
import { Loading } from '@/components/ui/loading';

<Loading />
<Loading size="sm" />
<Loading size="lg" className="text-primary" />
```

---

### EmptyState

Componente para exibir estado vazio com mensagem e ação.

**Localização:** `src/components/ui/empty-state.tsx`

**Props:**

```typescript
interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

**Exemplo de Uso:**

```typescript
import { EmptyState } from '@/components/ui/empty-state';
import { Inbox } from 'lucide-react';

<EmptyState
  title="Nenhum lead encontrado"
  description="Crie seu primeiro lead para começar"
  icon={Inbox}
  action={{
    label: 'Criar Lead',
    onClick: () => setModalOpen(true)
  }}
/>
```

---

## Padrões de Uso

### Animações

Todas as animações seguem o padrão:

```css
/* Fade-in (Páginas) */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Slide-in (Modais) */
@keyframes slideIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

/* Card Hover */
.card-hover {
  transition: all 200ms ease;
}
.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}
```

### Responsividade

Breakpoints padrão:

```typescript
// Mobile: < 640px
// Tablet: 640px - 1024px
// Desktop: > 1024px

// Exemplo de grid responsivo
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Conteúdo */}
</div>
```

### Acessibilidade

Todos os componentes seguem:

- ✅ ARIA labels adequados
- ✅ Navegação por teclado (Tab, Enter, ESC)
- ✅ Focus visível (outline azul 2px)
- ✅ Contraste WCAG AA (4.5:1)
- ✅ Labels semânticos

### Type Safety

Todos os componentes são type-safe com TypeScript:

```typescript
// Sempre defina interfaces para props
interface MyComponentProps {
  title: string;
  value: number;
  optional?: boolean;
}

// Use tipos do domínio
import type { Lead, LeadStatus } from '@/app/actions/leads';
```

---

## Criando Novos Componentes

### Template Base

```typescript
'use client'; // Se usar hooks ou eventos

import { cn } from '@/lib/utils';

interface MyComponentProps {
  // Props aqui
}

export function MyComponent({ ...props }: MyComponentProps) {
  return (
    <div className={cn('base-classes', props.className)}>
      {/* Conteúdo */}
    </div>
  );
}
```

### Checklist

- [ ] Props tipadas com TypeScript
- [ ] Documentação JSDoc
- [ ] Acessibilidade (ARIA, keyboard)
- [ ] Responsividade
- [ ] Animações suaves
- [ ] Error boundaries (se necessário)
- [ ] Testes (se crítico)

---

## Referências

- [Shadcn/ui Documentation](https://ui.shadcn.com/)
- [Radix UI Primitives](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [DnD Kit](https://docs.dndkit.com/)

---

**Documentado por:** Paige (Technical Writer) 📚  
**Data:** 25/12/2025  
**Versão:** 1.0.0

