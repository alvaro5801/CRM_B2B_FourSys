# API Reference - Server Actions

**Versão:** 1.0.0  
**Data:** 25/12/2025  
**Localização:** `src/app/actions/leads.ts`

---

## Visão Geral

O CRM B2B FourSys utiliza **Next.js Server Actions** como estratégia de backend, eliminando a necessidade de criar rotas API REST separadas. Todas as operações de dados são realizadas através de funções server-side type-safe.

### Vantagens

- ✅ Type-safety completo com TypeScript
- ✅ Zero configuração de rotas API
- ✅ Revalidação automática de cache
- ✅ Optimistic updates no cliente
- ✅ Error handling integrado

---

## Types & Interfaces

### LeadStatus

```typescript
export type LeadStatus = 'prospect' | 'qualified' | 'proposal' | 'closed';
```

**Valores Permitidos:**
- `prospect` - Lead inicial, primeiro contato
- `qualified` - Lead qualificado, interesse confirmado
- `proposal` - Proposta enviada ao cliente
- `closed` - Negócio fechado (ganho)

---

### Lead

```typescript
export interface Lead {
  id: string;
  name: string;
  company: string;
  status: LeadStatus;
  value: number;
  aiScore: number;
  email?: string | null;
  phone?: string | null;
  lastContact: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

**Campos:**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | string | Sim | UUID gerado automaticamente |
| `name` | string | Sim | Nome do cliente |
| `company` | string | Sim | Nome da empresa |
| `status` | LeadStatus | Sim | Status atual no pipeline |
| `value` | number | Sim | Valor estimado em R$ |
| `aiScore` | number | Sim | Score de IA (0-100, gerado automaticamente) |
| `email` | string? | Não | Email do cliente |
| `phone` | string? | Não | Telefone do cliente |
| `lastContact` | Date | Sim | Data do último contato |
| `createdAt` | Date | Sim | Data de criação |
| `updatedAt` | Date | Sim | Data da última atualização |

---

### CreateLeadInput

```typescript
export interface CreateLeadInput {
  name: string;
  company: string;
  status: LeadStatus;
  value: number;
  email?: string;
  phone?: string;
}
```

**Validações:**
- `name`: mínimo 3 caracteres
- `company`: mínimo 2 caracteres
- `value`: não pode ser negativo
- `status`: deve ser um dos valores de `LeadStatus`
- `email`: formato de email válido (se fornecido)

---

### UpdateLeadStatusInput

```typescript
export interface UpdateLeadStatusInput {
  id: string;
  status: LeadStatus;
}
```

**Uso:** Atualizar o status de um lead (usado no drag & drop do Kanban).

---

### DashboardMetrics

```typescript
export interface DashboardMetrics {
  pipelineTotal: number;
  activeLeads: number;
  conversionRate: number;
}
```

**Campos:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `pipelineTotal` | number | Soma dos valores de leads não fechados (R$) |
| `activeLeads` | number | Contagem de leads não fechados |
| `conversionRate` | number | Taxa de conversão (23.5% fixo para MVP) |

---

## Server Actions

### SA001 - getLeads()

Obtém todos os leads do banco de dados, ordenados por AI Score (decrescente) e data de criação.

**Assinatura:**

```typescript
export async function getLeads(): Promise<Lead[]>
```

**Retorno:**
- Array de objetos `Lead` ordenados por `aiScore` (desc) e `createdAt` (desc)

**Exemplo de Uso:**

```typescript
import { getLeads } from '@/app/actions/leads';

export default async function KanbanPage() {
  const leads = await getLeads();
  
  return <KanbanBoard initialLeads={leads} />;
}
```

**Erros:**
- Lança `Error` com mensagem "Falha ao carregar leads" em caso de erro no banco

---

### SA002 - createLead()

Cria um novo lead no banco de dados.

**Assinatura:**

```typescript
export async function createLead(data: CreateLeadInput): Promise<Lead>
```

**Parâmetros:**

```typescript
{
  name: string;        // Nome do cliente (min 3 caracteres)
  company: string;     // Nome da empresa (min 2 caracteres)
  status: LeadStatus;  // Status inicial
  value: number;       // Valor estimado (>= 0)
  email?: string;      // Email (opcional, formato válido)
  phone?: string;      // Telefone (opcional)
}
```

**Retorno:**
- Objeto `Lead` criado com `id`, `aiScore`, `createdAt` e `updatedAt` gerados automaticamente

**Comportamento:**
1. Valida o status (deve ser um dos 4 valores permitidos)
2. Valida o valor (não pode ser negativo)
3. Gera AI Score aleatório entre 0 e 100
4. Cria o lead no banco
5. Revalida cache das páginas `/` e `/kanban`

**Exemplo de Uso:**

```typescript
import { createLead } from '@/app/actions/leads';

const handleSubmit = async (data) => {
  try {
    const newLead = await createLead({
      name: 'João Silva',
      company: 'Tech Solutions',
      status: 'prospect',
      value: 15000,
      email: 'joao@techsolutions.com',
      phone: '(11) 98765-4321'
    });
    
    console.log('Lead criado:', newLead);
  } catch (error) {
    console.error('Erro ao criar lead:', error);
  }
};
```

**Erros:**
- `"Status inválido"` - Status não é um dos valores permitidos
- `"Valor não pode ser negativo"` - Valor fornecido é menor que 0
- `"Falha ao criar lead"` - Erro genérico do banco de dados

---

### SA003 - updateLeadStatus()

Atualiza o status de um lead existente (usado no drag & drop do Kanban).

**Assinatura:**

```typescript
export async function updateLeadStatus(input: UpdateLeadStatusInput): Promise<Lead>
```

**Parâmetros:**

```typescript
{
  id: string;          // UUID do lead
  status: LeadStatus;  // Novo status
}
```

**Retorno:**
- Objeto `Lead` atualizado

**Comportamento:**
1. Valida o novo status
2. Atualiza o status do lead
3. Atualiza `lastContact` para a data/hora atual
4. Revalida cache das páginas `/` e `/kanban`

**Exemplo de Uso:**

```typescript
import { updateLeadStatus } from '@/app/actions/leads';

const handleDragEnd = async (leadId, newStatus) => {
  try {
    const updatedLead = await updateLeadStatus({
      id: leadId,
      status: newStatus
    });
    
    console.log('Lead movido:', updatedLead);
  } catch (error) {
    console.error('Erro ao mover lead:', error);
  }
};
```

**Erros:**
- `"Status inválido"` - Status não é um dos valores permitidos
- `"Falha ao atualizar status do lead"` - Erro do banco (ex: lead não encontrado)

---

### SA004 - getDashboardMetrics()

Calcula e retorna as métricas do dashboard.

**Assinatura:**

```typescript
export async function getDashboardMetrics(): Promise<DashboardMetrics>
```

**Retorno:**

```typescript
{
  pipelineTotal: number;    // Soma dos valores de leads não fechados
  activeLeads: number;      // Contagem de leads não fechados
  conversionRate: number;   // Taxa de conversão (23.5% fixo)
}
```

**Comportamento:**
1. Agrega valores de leads onde `status != 'closed'`
2. Conta leads onde `status != 'closed'`
3. Retorna taxa de conversão fixa de 23.5% (mockado para MVP)

**Exemplo de Uso:**

```typescript
import { getDashboardMetrics } from '@/app/actions/leads';

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();
  
  return (
    <div>
      <MetricCard
        title="Pipeline Total"
        value={metrics.pipelineTotal}
        format="currency"
      />
      <MetricCard
        title="Leads Ativos"
        value={metrics.activeLeads}
        format="number"
      />
      <MetricCard
        title="Taxa de Conversão"
        value={metrics.conversionRate}
        format="percentage"
      />
    </div>
  );
}
```

**Erros:**
- `"Falha ao calcular métricas"` - Erro do banco de dados

---

### SA005 - deleteLead()

Deleta um lead do banco de dados.

**Assinatura:**

```typescript
export async function deleteLead(id: string): Promise<void>
```

**Parâmetros:**
- `id` (string) - UUID do lead a ser deletado

**Retorno:**
- `void` (sem retorno)

**Comportamento:**
1. Deleta o lead com o ID fornecido
2. Revalida cache das páginas `/` e `/kanban`

**Exemplo de Uso:**

```typescript
import { deleteLead } from '@/app/actions/leads';

const handleDelete = async (leadId) => {
  if (confirm('Tem certeza que deseja deletar este lead?')) {
    try {
      await deleteLead(leadId);
      console.log('Lead deletado com sucesso');
    } catch (error) {
      console.error('Erro ao deletar lead:', error);
    }
  }
};
```

**Erros:**
- `"Falha ao deletar lead"` - Erro do banco (ex: lead não encontrado)

**Nota:** Esta função é opcional e foi implementada para facilitar testes. Não está exposta na UI do MVP.

---

## Revalidação de Cache

Todas as Server Actions que modificam dados (`createLead`, `updateLeadStatus`, `deleteLead`) automaticamente revalidam o cache das seguintes páginas:

```typescript
revalidatePath('/');        // Dashboard
revalidatePath('/kanban');  // Kanban Board
```

Isso garante que os dados exibidos estejam sempre atualizados após qualquer modificação.

---

## Error Handling

### Padrão de Erros

Todas as Server Actions seguem o mesmo padrão de tratamento de erros:

```typescript
try {
  // Lógica da função
} catch (error) {
  console.error('Error message:', error);
  throw new Error('Mensagem amigável para o usuário');
}
```

### Tratamento no Cliente

```typescript
'use client';

import { createLead } from '@/app/actions/leads';
import { toast } from 'sonner';

const handleSubmit = async (data) => {
  try {
    await createLead(data);
    toast.success('Lead criado com sucesso!');
  } catch (error) {
    toast.error('Erro ao criar lead', {
      description: error.message
    });
  }
};
```

---

## Optimistic Updates

Para melhor UX, o Kanban Board utiliza **optimistic updates** com o hook `useOptimistic` do React:

```typescript
'use client';

import { useOptimistic } from 'react';
import { updateLeadStatus } from '@/app/actions/leads';

const [optimisticLeads, updateOptimisticLeads] = useOptimistic(
  initialLeads,
  (state, { leadId, newStatus }) => {
    return state.map(lead =>
      lead.id === leadId ? { ...lead, status: newStatus } : lead
    );
  }
);

const handleDragEnd = async (leadId, newStatus) => {
  // Atualiza UI imediatamente
  updateOptimisticLeads({ leadId, newStatus });
  
  // Atualiza servidor em background
  try {
    await updateLeadStatus({ id: leadId, status: newStatus });
  } catch (error) {
    // UI reverte automaticamente em caso de erro
    console.error('Failed to update lead:', error);
  }
};
```

---

## Validação com Zod

Antes de chamar as Server Actions, os dados são validados no cliente usando Zod:

```typescript
// src/lib/validations/lead.ts
import * as z from 'zod';

export const createLeadSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  company: z.string().min(2, 'Empresa deve ter no mínimo 2 caracteres'),
  value: z.number().min(0, 'Valor não pode ser negativo'),
  status: z.enum(['prospect', 'qualified', 'proposal', 'closed']),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
});
```

---

## Exemplos Completos

### Criar Lead com Validação

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createLeadSchema } from '@/lib/validations/lead';
import { createLead } from '@/app/actions/leads';
import { toast } from 'sonner';

export function CreateLeadForm() {
  const form = useForm({
    resolver: zodResolver(createLeadSchema),
    defaultValues: {
      name: '',
      company: '',
      value: 0,
      status: 'prospect',
      email: '',
      phone: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      await createLead(data);
      toast.success('Lead criado com sucesso!');
      form.reset();
    } catch (error) {
      toast.error('Erro ao criar lead');
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Campos do formulário */}
    </form>
  );
}
```

### Listar Leads no Kanban

```typescript
// Server Component
import { getLeads } from '@/app/actions/leads';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';

export default async function KanbanPage() {
  const leads = await getLeads();
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Pipeline de Vendas</h1>
      <KanbanBoard initialLeads={leads} />
    </div>
  );
}
```

### Dashboard com Métricas

```typescript
// Server Component
import { getDashboardMetrics } from '@/app/actions/leads';
import { MetricCard } from '@/components/dashboard/MetricCard';

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MetricCard
        title="Pipeline Total"
        value={metrics.pipelineTotal}
        format="currency"
        icon="DollarSign"
      />
      <MetricCard
        title="Leads Ativos"
        value={metrics.activeLeads}
        format="number"
        icon="Users"
      />
      <MetricCard
        title="Taxa de Conversão"
        value={metrics.conversionRate}
        format="percentage"
        icon="TrendingUp"
      />
    </div>
  );
}
```

---

## Performance

### Caching

Next.js 14 aplica cache agressivo por padrão em Server Components. As Server Actions automaticamente revalidam o cache quando necessário usando `revalidatePath()`.

### Optimistic Updates

Reduz a latência percebida para 0ms, atualizando a UI instantaneamente antes da resposta do servidor.

### Type Safety

TypeScript garante type-safety em toda a cadeia de dados, desde o banco até a UI, eliminando erros de runtime.

---

## Segurança

### Validação Server-Side

Todas as Server Actions validam inputs no servidor, mesmo que já tenham sido validados no cliente:

```typescript
// Validação de status
const validStatuses: LeadStatus[] = ['prospect', 'qualified', 'proposal', 'closed'];
if (!validStatuses.includes(data.status)) {
  throw new Error('Status inválido');
}

// Validação de valor
if (data.value < 0) {
  throw new Error('Valor não pode ser negativo');
}
```

### SQL Injection

Prisma ORM previne SQL injection automaticamente usando prepared statements.

### XSS

React previne XSS automaticamente escapando valores renderizados.

---

## Migração para Produção

### PostgreSQL

Para produção, recomenda-se migrar de SQLite para PostgreSQL:

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Rate Limiting

Considere adicionar rate limiting para produção:

```typescript
import { rateLimit } from '@/lib/rate-limit';

export async function createLead(data: CreateLeadInput): Promise<Lead> {
  // Rate limit: 10 requests por minuto
  await rateLimit('create-lead', 10, 60);
  
  // ... resto da lógica
}
```

---

## Referências

- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Zod Documentation](https://zod.dev)
- [React useOptimistic](https://react.dev/reference/react/useOptimistic)

---

**Documentado por:** Paige (Technical Writer) 📚  
**Data:** 25/12/2025  
**Versão:** 1.0.0



