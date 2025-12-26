# Fase 3: Backend - Server Actions

**Duração Estimada:** 1.5 horas  
**Pré-requisito:** Fase 2 concluída  
**Objetivo:** Criar todas as Server Actions para comunicação com o banco  
**Status:** 🟡 Pendente

---

## Visão Geral

Nesta fase, criaremos 5 Server Actions que serão a camada de comunicação entre o frontend e o banco de dados:

1. **getLeads()** - Listar todos os leads
2. **createLead()** - Criar novo lead
3. **updateLeadStatus()** - Atualizar status (Drag & Drop)
4. **getDashboardMetrics()** - Calcular métricas
5. **deleteLead()** - Deletar lead (opcional)

---

## 3.1 Criar Arquivo de Server Actions

### Arquivo: `src/app/actions/leads.ts`

**Criar pasta e arquivo:**

```bash
mkdir -p src/app/actions
touch src/app/actions/leads.ts
```

**Conteúdo completo:**

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
 * @param input - ID e novo status
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

---

## 3.2 Entendendo as Server Actions

### O Que São Server Actions?

- Funções que rodam **no servidor** (não no browser)
- Marcadas com `'use server'` no topo do arquivo
- Podem ser chamadas diretamente do frontend
- Substituem rotas API REST tradicionais

### Vantagens

✅ **Zero-API:** Sem necessidade de criar rotas `/api/*`  
✅ **Type-Safe:** TypeScript end-to-end  
✅ **Simples:** Chamar como função normal  
✅ **Seguro:** Código não exposto ao cliente

### Exemplo de Uso

```typescript
// No componente (frontend)
import { getLeads } from '@/app/actions/leads';

// Chamar diretamente
const leads = await getLeads();
```

---

## 3.3 Detalhes das Server Actions

### SA001: getLeads()

**Propósito:** Buscar todos os leads do banco

**Ordenação:**
1. Por `aiScore` (descendente) - Leads com maior score primeiro
2. Por `createdAt` (descendente) - Mais recentes primeiro

**Uso:**
```typescript
const leads = await getLeads();
// Retorna: Lead[]
```

---

### SA002: createLead()

**Propósito:** Criar novo lead com validações

**Validações:**
- Status deve ser válido (prospect/qualified/proposal/closed)
- Valor não pode ser negativo
- AI Score gerado automaticamente (0-100)

**Uso:**
```typescript
const newLead = await createLead({
  name: 'João Silva',
  company: 'Tech Corp',
  status: 'prospect',
  value: 15000,
  email: 'joao@techcorp.com',
  phone: '(11) 99999-9999'
});
```

---

### SA003: updateLeadStatus()

**Propósito:** Atualizar status do lead (usado no Drag & Drop)

**Comportamento:**
- Atualiza status
- Atualiza `lastContact` para agora
- Revalida cache das páginas

**Uso:**
```typescript
await updateLeadStatus({
  id: 'lead-uuid',
  status: 'qualified'
});
```

---

### SA004: getDashboardMetrics()

**Propósito:** Calcular métricas para o dashboard

**Métricas:**
- **Pipeline Total:** Soma dos valores de leads não-fechados
- **Leads Ativos:** Contagem de leads não-fechados
- **Taxa de Conversão:** Valor mockado (23.5%)

**Uso:**
```typescript
const metrics = await getDashboardMetrics();
// Retorna: { pipelineTotal: 150000, activeLeads: 12, conversionRate: 23.5 }
```

---

### SA005: deleteLead()

**Propósito:** Deletar lead (útil para testes)

**Uso:**
```typescript
await deleteLead('lead-uuid');
```

---

## 3.4 Testar Server Actions (Opcional)

### Criar Página de Teste

**Arquivo:** `src/app/test-actions/page.tsx`

```typescript
import { getLeads, getDashboardMetrics } from '../actions/leads';

export default async function TestActionsPage() {
  const leads = await getLeads();
  const metrics = await getDashboardMetrics();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Teste de Server Actions</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Métricas</h2>
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify(metrics, null, 2)}
        </pre>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Leads ({leads.length})</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
          {JSON.stringify(leads, null, 2)}
        </pre>
      </div>
    </div>
  );
}
```

### Testar

```bash
# Abrir no navegador
http://localhost:3000/test-actions

# Deve mostrar:
# - Métricas calculadas
# - Lista de 15 leads
```

### Deletar Página de Teste (Após Validação)

```bash
rm -rf src/app/test-actions
```

---

## 3.5 Revalidação de Cache

### O Que é revalidatePath()?

Função do Next.js que invalida o cache de uma página específica.

### Por Que Usar?

Quando dados mudam no servidor, o Next.js precisa saber para atualizar as páginas que usam esses dados.

### Exemplo

```typescript
// Após criar/atualizar lead
revalidatePath('/');        // Revalida dashboard
revalidatePath('/kanban');  // Revalida kanban
```

---

## Checklist de Conclusão

### Arquivo Criado
- [ ] `src/app/actions/leads.ts` criado
- [ ] Diretiva `'use server'` no topo
- [ ] 5 Server Actions implementadas

### Tipos TypeScript
- [ ] `LeadStatus` type definido
- [ ] `Lead` interface definida
- [ ] `CreateLeadInput` interface definida
- [ ] `UpdateLeadStatusInput` interface definida
- [ ] `DashboardMetrics` interface definida

### Server Actions
- [ ] `getLeads()` implementada
- [ ] `createLead()` implementada com validações
- [ ] `updateLeadStatus()` implementada
- [ ] `getDashboardMetrics()` implementada
- [ ] `deleteLead()` implementada

### Validações
- [ ] Status validado em create e update
- [ ] Valor validado (não negativo)
- [ ] AI Score gerado automaticamente

### Revalidação
- [ ] `revalidatePath()` configurado em mutations
- [ ] Paths corretos ('/' e '/kanban')

### Testes
- [ ] Página de teste criada (opcional)
- [ ] Server Actions testadas
- [ ] Sem erros TypeScript
- [ ] Página de teste deletada (se criada)

---

## Troubleshooting

### Erro: "Module not found: Can't resolve '@/lib/prisma'"

```bash
# Verificar se arquivo existe
ls src/lib/prisma.ts

# Se não existir, voltar para Fase 2
```

### Erro: TypeScript reclamando de tipos

```bash
# Regenerar Prisma Client
npm run db:generate
```

### Erro: "revalidatePath is not defined"

```typescript
// Adicionar import no topo
import { revalidatePath } from 'next/cache';
```

---

## Próxima Fase

➡️ **Fase 4: UI Foundation - Shadcn Components**
- Criar utilitários de formatação
- Criar componentes Loading e EmptyState
- Preparar funções auxiliares

**Arquivo:** `docs/design/fase-04-ui-foundation.md`

---

**Preparado por:** Winston (Architect) 🏗️  
**Data:** 25/12/2025  
**Status:** ✅ Pronto para Execução

