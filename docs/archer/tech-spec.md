# Especificação Técnica - CRM B2B FourSys MVP

**Versão:** 1.0  
**Data:** 25/12/2025  
**Arquiteto:** Winston  
**Status:** 🟢 Pronto para Desenvolvimento  
**Baseado em:** Product Brief v1.1

---

## 1. ARQUITETURA DE DADOS

### 1.1 Prisma Schema Completo

**Localização:** `prisma/schema.prisma`

```prisma
// Prisma Schema para CRM B2B FourSys MVP
// Database: SQLite (Local Development)

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// Model Principal: Lead
model Lead {
  id          String   @id @default(uuid())
  name        String   // Nome do Cliente
  company     String   // Nome da Empresa
  status      String   // 'prospect' | 'qualified' | 'proposal' | 'closed'
  value       Float    // Valor Estimado em R$
  aiScore     Int      // Score de IA (0-100)
  email       String?  // Email (opcional)
  phone       String?  // Telefone (opcional)
  lastContact DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([status])
  @@index([aiScore])
}
```

### 1.2 Variáveis de Ambiente

**Localização:** `.env`

```env
# Database
DATABASE_URL="file:./dev.db"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 1.3 Validação de Status

**Nota:** SQLite não suporta ENUMs nativamente. A validação será feita na camada de aplicação.

**Status válidos:**
- `prospect` - Lead inicial
- `qualified` - Lead qualificado
- `proposal` - Proposta enviada
- `closed` - Negócio fechado

---

## 2. SERVER ACTIONS (BACKEND STRATEGY)

### 2.1 Arquitetura Zero-API

Usaremos **Next.js Server Actions** para comunicação direta entre frontend e backend, eliminando a necessidade de rotas API REST.

**Localização:** `src/app/actions/leads.ts`

### 2.2 Assinaturas das Funções

```typescript
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// ============================================
// TYPES & INTERFACES
// ============================================

export type LeadStatus = 'prospect' | 'qualified' | 'proposal' | 'closed';

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

export interface CreateLeadInput {
  name: string;
  company: string;
  status: LeadStatus;
  value: number;
  email?: string;
  phone?: string;
}

export interface UpdateLeadStatusInput {
  id: string;
  status: LeadStatus;
}

export interface DashboardMetrics {
  pipelineTotal: number;
  activeLeads: number;
  conversionRate: number;
}

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * SA001 - Obter todos os leads
 * @returns Array de leads ordenados por aiScore (desc)
 */
export async function getLeads(): Promise<Lead[]> {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: [
        { aiScore: 'desc' },
        { createdAt: 'desc' }
      ]
    });
    return leads;
  } catch (error) {
    console.error('Error fetching leads:', error);
    throw new Error('Falha ao carregar leads');
  }
}

/**
 * SA002 - Criar novo lead
 * @param data - Dados do lead (sem aiScore, será gerado automaticamente)
 * @returns Lead criado
 */
export async function createLead(data: CreateLeadInput): Promise<Lead> {
  try {
    // Validação de status
    const validStatuses: LeadStatus[] = ['prospect', 'qualified', 'proposal', 'closed'];
    if (!validStatuses.includes(data.status)) {
      throw new Error('Status inválido');
    }

    // Validação de valor
    if (data.value < 0) {
      throw new Error('Valor não pode ser negativo');
    }

    // Gerar AI Score aleatório (0-100)
    const aiScore = Math.floor(Math.random() * 101);

    const lead = await prisma.lead.create({
      data: {
        ...data,
        aiScore,
      }
    });

    revalidatePath('/');
    revalidatePath('/kanban');
    
    return lead;
  } catch (error) {
    console.error('Error creating lead:', error);
    throw new Error('Falha ao criar lead');
  }
}

/**
 * SA003 - Atualizar status do lead (Drag & Drop no Kanban)
 * @param id - ID do lead
 * @param status - Novo status
 * @returns Lead atualizado
 */
export async function updateLeadStatus(input: UpdateLeadStatusInput): Promise<Lead> {
  try {
    const validStatuses: LeadStatus[] = ['prospect', 'qualified', 'proposal', 'closed'];
    if (!validStatuses.includes(input.status)) {
      throw new Error('Status inválido');
    }

    const lead = await prisma.lead.update({
      where: { id: input.id },
      data: { 
        status: input.status,
        lastContact: new Date()
      }
    });

    revalidatePath('/');
    revalidatePath('/kanban');

    return lead;
  } catch (error) {
    console.error('Error updating lead status:', error);
    throw new Error('Falha ao atualizar status do lead');
  }
}

/**
 * SA004 - Obter métricas do dashboard
 * @returns Objeto com métricas calculadas
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    // Pipeline Total: Soma dos valores de leads não-fechados
    const pipelineResult = await prisma.lead.aggregate({
      where: {
        status: {
          not: 'closed'
        }
      },
      _sum: {
        value: true
      }
    });

    // Leads Ativos: Contagem de leads não-fechados
    const activeLeads = await prisma.lead.count({
      where: {
        status: {
          not: 'closed'
        }
      }
    });

    // Taxa de Conversão: Mockada (valor estático para demo)
    const conversionRate = 23.5;

    return {
      pipelineTotal: pipelineResult._sum.value || 0,
      activeLeads,
      conversionRate
    };
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    throw new Error('Falha ao calcular métricas');
  }
}

/**
 * SA005 - Deletar lead (opcional, para testes)
 * @param id - ID do lead
 */
export async function deleteLead(id: string): Promise<void> {
  try {
    await prisma.lead.delete({
      where: { id }
    });

    revalidatePath('/');
    revalidatePath('/kanban');
  } catch (error) {
    console.error('Error deleting lead:', error);
    throw new Error('Falha ao deletar lead');
  }
}
```

### 2.3 Prisma Client Singleton

**Localização:** `src/lib/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

---

## 3. COMPONENTES CRÍTICOS (FRONTEND ARCHITECTURE)

### 3.1 Estrutura de Componentes

```
src/
├── app/
│   ├── actions/
│   │   └── leads.ts              # Server Actions
│   ├── page.tsx                  # Dashboard (Home)
│   └── kanban/
│       └── page.tsx              # Kanban Board
├── components/
│   ├── dashboard/
│   │   ├── MetricCard.tsx        # Card de métrica individual
│   │   ├── SalesChart.tsx        # Gráfico de vendas (Recharts)
│   │   └── DashboardGrid.tsx     # Layout do dashboard
│   ├── kanban/
│   │   ├── KanbanBoard.tsx       # Board principal (DnD)
│   │   ├── KanbanColumn.tsx      # Coluna individual
│   │   ├── LeadCard.tsx          # Card do lead
│   │   └── CreateLeadModal.tsx   # Modal de criação
│   └── ui/
│       └── (shadcn components)   # Badge, Button, Dialog, etc.
└── lib/
    ├── prisma.ts                 # Prisma Client
    └── utils.ts                  # Funções auxiliares
```

### 3.2 KanbanBoard Component

**Localização:** `src/components/kanban/KanbanBoard.tsx`

```typescript
'use client';

import { useState, useOptimistic } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { updateLeadStatus, type Lead, type LeadStatus } from '@/app/actions/leads';
import { KanbanColumn } from './KanbanColumn';
import { LeadCard } from './LeadCard';

interface KanbanBoardProps {
  initialLeads: Lead[];
}

const COLUMNS: { id: LeadStatus; title: string }[] = [
  { id: 'prospect', title: 'Prospect' },
  { id: 'qualified', title: 'Qualificado' },
  { id: 'proposal', title: 'Proposta' },
  { id: 'closed', title: 'Fechado' },
];

export function KanbanBoard({ initialLeads }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // Optimistic Updates para UI instantânea
  const [optimisticLeads, updateOptimisticLeads] = useOptimistic(
    initialLeads,
    (state, { leadId, newStatus }: { leadId: string; newStatus: LeadStatus }) => {
      return state.map(lead =>
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      );
    }
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const leadId = active.id as string;
    const newStatus = over.id as LeadStatus;
    
    // Atualização otimista (UI instantânea)
    updateOptimisticLeads({ leadId, newStatus });
    
    // Atualização no servidor (background)
    try {
      await updateLeadStatus({ id: leadId, status: newStatus });
    } catch (error) {
      console.error('Failed to update lead:', error);
      // TODO: Adicionar toast de erro
    }
    
    setActiveId(null);
  };

  const activeLead = optimisticLeads.find(lead => lead.id === activeId);

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-4 gap-6">
        {COLUMNS.map(column => {
          const columnLeads = optimisticLeads.filter(
            lead => lead.status === column.id
          );
          
          return (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              leads={columnLeads}
            />
          );
        })}
      </div>
      
      {/* Overlay durante drag */}
      <DragOverlay>
        {activeLead ? <LeadCard lead={activeLead} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}
```

### 3.3 Optimistic Updates Strategy

**Conceito:** Atualizar a UI imediatamente (antes da resposta do servidor) para dar sensação de velocidade instantânea.

**Fluxo:**
1. User arrasta card no Kanban
2. `useOptimistic` atualiza estado local instantaneamente
3. UI reflete mudança imediatamente (< 16ms)
4. Server Action executa em background
5. Se falhar, reverter estado (com toast de erro)

**Vantagens:**
- ✅ Latência percebida: 0ms
- ✅ UX fluida mesmo com rede lenta
- ✅ Feedback visual instantâneo

---

## 4. SCRIPT DE SEED

### 4.1 Seed Script Completo

**Localização:** `prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Dados fictícios brasileiros
const LEAD_DATA = [
  { name: 'Carlos Silva', company: 'Tech Solutions Ltda', value: 15000 },
  { name: 'Ana Paula Costa', company: 'Inovação Digital', value: 8500 },
  { name: 'Roberto Mendes', company: 'Consultoria Estratégica', value: 22000 },
  { name: 'Juliana Santos', company: 'Marketing Pro', value: 12000 },
  { name: 'Fernando Oliveira', company: 'Vendas Inteligentes', value: 18500 },
  { name: 'Mariana Ferreira', company: 'Gestão Empresarial', value: 9500 },
  { name: 'Pedro Almeida', company: 'Automação Industrial', value: 35000 },
  { name: 'Camila Rodrigues', company: 'E-commerce Brasil', value: 14000 },
  { name: 'Lucas Martins', company: 'Logística Express', value: 11000 },
  { name: 'Beatriz Lima', company: 'Recursos Humanos Plus', value: 7500 },
  { name: 'Rafael Souza', company: 'Contabilidade Digital', value: 16000 },
  { name: 'Patrícia Gomes', company: 'Advocacia Corporativa', value: 28000 },
  { name: 'Thiago Pereira', company: 'Desenvolvimento Web', value: 19000 },
  { name: 'Fernanda Ribeiro', company: 'Design Criativo', value: 10500 },
  { name: 'Gustavo Carvalho', company: 'Segurança da Informação', value: 42000 },
];

const STATUSES = ['prospect', 'qualified', 'proposal', 'closed'] as const;

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes
  await prisma.lead.deleteMany();
  console.log('🗑️  Dados antigos removidos');

  // Criar leads
  const leads = [];
  for (const data of LEAD_DATA) {
    // Distribuir leads entre os status
    const randomStatus = STATUSES[Math.floor(Math.random() * STATUSES.length)];
    
    // Gerar AI Score aleatório (0-100)
    const aiScore = Math.floor(Math.random() * 101);
    
    // Gerar data de contato aleatória (últimos 30 dias)
    const daysAgo = Math.floor(Math.random() * 30);
    const lastContact = new Date();
    lastContact.setDate(lastContact.getDate() - daysAgo);

    const lead = await prisma.lead.create({
      data: {
        name: data.name,
        company: data.company,
        status: randomStatus,
        value: data.value,
        aiScore,
        email: `${data.name.toLowerCase().replace(' ', '.')}@${data.company.toLowerCase().replace(' ', '')}.com.br`,
        phone: `(11) 9${Math.floor(Math.random() * 9000 + 1000)}-${Math.floor(Math.random() * 9000 + 1000)}`,
        lastContact,
      },
    });

    leads.push(lead);
  }

  console.log(`✅ ${leads.length} leads criados com sucesso!`);
  
  // Estatísticas
  const stats = {
    prospect: leads.filter(l => l.status === 'prospect').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    proposal: leads.filter(l => l.status === 'proposal').length,
    closed: leads.filter(l => l.status === 'closed').length,
  };

  console.log('\n📊 Distribuição por Status:');
  console.log(`   Prospect: ${stats.prospect}`);
  console.log(`   Qualificado: ${stats.qualified}`);
  console.log(`   Proposta: ${stats.proposal}`);
  console.log(`   Fechado: ${stats.closed}`);
  
  const totalValue = leads.reduce((sum, lead) => sum + lead.value, 0);
  console.log(`\n💰 Valor Total do Pipeline: R$ ${totalValue.toLocaleString('pt-BR')}`);
}

main()
  .catch((e) => {
    console.error('❌ Erro durante seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### 4.2 Configuração do Package.json

Adicionar ao `package.json`:

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
  "scripts": {
    "db:push": "prisma db push",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset --force"
  }
}
```

### 4.3 Comandos de Setup

```bash
# 1. Instalar dependências
npm install prisma @prisma/client tsx

# 2. Gerar Prisma Client
npx prisma generate

# 3. Criar banco de dados
npx prisma db push

# 4. Popular com dados
npm run db:seed

# 5. Visualizar dados (opcional)
npm run db:studio
```

---

## 5. ESTRUTURA DE PASTAS COMPLETA

```
CRM_B2B_FourSys/
├── prisma/
│   ├── schema.prisma          # Schema do banco
│   ├── seed.ts                # Script de seed
│   └── dev.db                 # Banco SQLite (gerado)
├── src/
│   ├── app/
│   │   ├── actions/
│   │   │   └── leads.ts       # Server Actions
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Dashboard
│   │   └── kanban/
│   │       └── page.tsx       # Kanban Board
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── MetricCard.tsx
│   │   │   ├── SalesChart.tsx
│   │   │   └── DashboardGrid.tsx
│   │   ├── kanban/
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── KanbanColumn.tsx
│   │   │   ├── LeadCard.tsx
│   │   │   └── CreateLeadModal.tsx
│   │   └── ui/
│   │       └── (shadcn components)
│   └── lib/
│       ├── prisma.ts          # Prisma Client
│       └── utils.ts           # Utilitários
├── .env                       # Variáveis de ambiente
├── package.json
└── tsconfig.json
```

---

## 6. DEPENDÊNCIAS NECESSÁRIAS

### 6.1 Instalação Completa

```bash
# Core Framework
npm install next@latest react@latest react-dom@latest typescript

# Database & ORM
npm install prisma @prisma/client
npm install -D tsx

# UI Components
npm install @radix-ui/react-dialog @radix-ui/react-slot
npm install tailwindcss postcss autoprefixer
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react

# Drag & Drop
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Charts
npm install recharts

# Forms & Validation
npm install react-hook-form zod @hookform/resolvers
```

### 6.2 Package.json Completo (Referência)

```json
{
  "name": "crm-b2b-foursys",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:push": "prisma db push",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset --force"
  },
  "dependencies": {
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@hookform/resolvers": "^3.3.4",
    "@prisma/client": "^5.8.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-slot": "^1.0.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "lucide-react": "^0.309.0",
    "next": "14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.49.3",
    "recharts": "^2.10.4",
    "tailwind-merge": "^2.2.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "postcss": "^8",
    "prisma": "^5.8.0",
    "tailwindcss": "^3.3.0",
    "tsx": "^4.7.0",
    "typescript": "^5"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

---

## 7. CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Setup Inicial ✅
- [ ] Criar projeto Next.js 14 com TypeScript
- [ ] Instalar todas as dependências
- [ ] Configurar Tailwind CSS
- [ ] Instalar Shadcn/ui components necessários

### Fase 2: Database ✅
- [ ] Criar `prisma/schema.prisma`
- [ ] Criar `.env` com `DATABASE_URL`
- [ ] Executar `npx prisma generate`
- [ ] Executar `npx prisma db push`
- [ ] Criar `prisma/seed.ts`
- [ ] Executar `npm run db:seed`
- [ ] Verificar dados com `npm run db:studio`

### Fase 3: Backend ✅
- [ ] Criar `src/lib/prisma.ts`
- [ ] Criar `src/app/actions/leads.ts` com todas as Server Actions
- [ ] Testar Server Actions isoladamente

### Fase 4: Frontend - Dashboard ✅
- [ ] Criar `MetricCard.tsx`
- [ ] Criar `SalesChart.tsx` (com dados mockados)
- [ ] Criar `DashboardGrid.tsx`
- [ ] Criar página `app/page.tsx`

### Fase 5: Frontend - Kanban ✅
- [ ] Criar `LeadCard.tsx` com Badge de AI Score
- [ ] Criar `KanbanColumn.tsx`
- [ ] Criar `KanbanBoard.tsx` com DnD
- [ ] Criar `CreateLeadModal.tsx`
- [ ] Criar página `app/kanban/page.tsx`

### Fase 6: Testes & Refinamento ✅
- [ ] Testar Drag & Drop
- [ ] Testar criação de leads
- [ ] Testar persistência (recarregar página)
- [ ] Ajustar animações e transições
- [ ] Validar responsividade

---

## 8. NOTAS TÉCNICAS IMPORTANTES

### 8.1 Performance

**Optimistic Updates:**
- Usar `useOptimistic` do React 18+ para atualizações instantâneas
- Revalidar paths após mutações com `revalidatePath()`

**Caching:**
- Next.js 14 usa cache agressivo por padrão
- Server Actions automaticamente revalidam quando necessário

### 8.2 Validação

**Client-Side:**
- Usar `react-hook-form` + `zod` no modal de criação
- Validar formato de email e telefone

**Server-Side:**
- Validar status em todas as Server Actions
- Validar valores numéricos (não negativos)

### 8.3 Segurança

**SQLite Local:**
- Não expor arquivo `dev.db` no Git (adicionar ao `.gitignore`)
- Em produção, migrar para PostgreSQL/MySQL

**Server Actions:**
- Sempre validar inputs no servidor
- Usar `'use server'` directive

### 8.4 AI Score Logic

```typescript
// Gerar score aleatório (0-100)
const aiScore = Math.floor(Math.random() * 101);

// Cores do Badge baseadas no score
function getScoreColor(score: number): string {
  if (score <= 40) return 'bg-red-500';    // Baixa prioridade
  if (score <= 70) return 'bg-yellow-500'; // Média prioridade
  return 'bg-green-500';                    // Alta prioridade
}
```

---

## 9. PRÓXIMOS PASSOS

1. **Developer:** Implementar seguindo este spec
2. **TEA (Test Engineer):** Criar testes E2E para Kanban
3. **UX Designer:** Validar animações e micro-interações
4. **PM:** Validar funcionalidades contra Product Brief

---

## 10. REFERÊNCIAS

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Prisma SQLite Guide](https://www.prisma.io/docs/concepts/database-connectors/sqlite)
- [DnD Kit Documentation](https://docs.dndkit.com/)
- [Shadcn/ui Components](https://ui.shadcn.com/)
- [Recharts Examples](https://recharts.org/en-US/examples)

---

**Documento Preparado por:** Winston (Architect) 🏗️  
**Aprovação Necessária:** PM + Tech Lead  
**Status:** ✅ Ready for Development

