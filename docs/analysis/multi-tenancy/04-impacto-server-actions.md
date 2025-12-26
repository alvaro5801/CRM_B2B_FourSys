# Impacto nas Server Actions

**Versão:** 1.0  
**Data:** 25/12/2025  
**Analista:** Mary (Business Analyst)

---

## 1. ARQUIVO IMPACTADO

📄 **`src/app/actions/leads.ts`**

**Complexidade:** 🔴 Alta  
**Prioridade:** Crítica  
**Tipo de Alteração:** Adicionar filtros por tenant em todas as funções

---

## 2. FUNÇÃO DE CONTEXTO DE TENANT

### 2.1 Adicionar no Topo do Arquivo

```typescript
// ============================================
// TENANT CONTEXT
// ============================================

/**
 * Obter tenantId do contexto da requisição
 * TODO: Integrar com sistema de autenticação
 * 
 * @returns tenantId do usuário autenticado
 * @throws Error se tenant não encontrado
 */
async function getCurrentTenantId(): Promise<string> {
  // OPÇÃO 1: Via sessão/auth (RECOMENDADO para produção)
  // const session = await getServerSession(authOptions);
  // if (!session?.user?.tenantId) {
  //   throw new Error('Usuário não autenticado ou sem tenant');
  // }
  // return session.user.tenantId;
  
  // OPÇÃO 2: Via header (temporário para testes)
  // const headersList = headers();
  // const tenantId = headersList.get('x-tenant-id');
  // if (!tenantId) {
  //   throw new Error('Tenant ID não fornecido no header');
  // }
  // return tenantId;
  
  // OPÇÃO 3: Hardcoded para MVP (REMOVER em produção)
  return 'default-tenant-id';
}
```

**⚠️ IMPORTANTE:** Esta função deve ser substituída por autenticação real antes de produção.

---

## 3. MODIFICAÇÕES NAS SERVER ACTIONS

### 3.1 SA001 - `getLeads()`

#### ANTES:
```typescript
export async function getLeads(): Promise<Lead[]> {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: [
        { aiScore: 'desc' },
        { createdAt: 'desc' }
      ]
    });
    return leads as Lead[];
  } catch (error) {
    console.error('Error fetching leads:', error);
    throw new Error('Falha ao carregar leads');
  }
}
```

#### DEPOIS:
```typescript
export async function getLeads(): Promise<Lead[]> {
  try {
    const tenantId = await getCurrentTenantId(); // ← NOVO
    
    const leads = await prisma.lead.findMany({
      where: { tenantId }, // ← FILTRO POR TENANT
      orderBy: [
        { aiScore: 'desc' },
        { createdAt: 'desc' }
      ]
    });
    return leads as Lead[];
  } catch (error) {
    console.error('Error fetching leads:', error);
    throw new Error('Falha ao carregar leads');
  }
}
```

**Mudanças:**
- ✅ Adicionar `getCurrentTenantId()`
- ✅ Adicionar `where: { tenantId }` na query

---

### 3.2 SA002 - `createLead()`

#### ANTES:
```typescript
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
    
    return lead as Lead;
  } catch (error) {
    console.error('Error creating lead:', error);
    throw new Error('Falha ao criar lead');
  }
}
```

#### DEPOIS:
```typescript
export async function createLead(data: CreateLeadInput): Promise<Lead> {
  try {
    const tenantId = await getCurrentTenantId(); // ← NOVO
    
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
        tenantId, // ← ASSOCIAR AO TENANT
        aiScore,
      }
    });

    revalidatePath('/');
    revalidatePath('/kanban');
    
    return lead as Lead;
  } catch (error) {
    console.error('Error creating lead:', error);
    throw new Error('Falha ao criar lead');
  }
}
```

**Mudanças:**
- ✅ Adicionar `getCurrentTenantId()`
- ✅ Adicionar `tenantId` aos dados do lead

**🔒 SEGURANÇA:** `tenantId` NUNCA vem do cliente, sempre da sessão.

---

### 3.3 SA003 - `updateLeadStatus()`

#### ANTES:
```typescript
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

    return lead as Lead;
  } catch (error) {
    console.error('Error updating lead status:', error);
    throw new Error('Falha ao atualizar status do lead');
  }
}
```

#### DEPOIS:
```typescript
export async function updateLeadStatus(input: UpdateLeadStatusInput): Promise<Lead> {
  try {
    const tenantId = await getCurrentTenantId(); // ← NOVO
    
    const validStatuses: LeadStatus[] = ['prospect', 'qualified', 'proposal', 'closed'];
    if (!validStatuses.includes(input.status)) {
      throw new Error('Status inválido');
    }

    // Validar que o lead pertence ao tenant (SEGURANÇA CRÍTICA)
    const existingLead = await prisma.lead.findFirst({
      where: { 
        id: input.id,
        tenantId // ← VALIDAÇÃO DE PROPRIEDADE
      }
    });
    
    if (!existingLead) {
      throw new Error('Lead não encontrado ou acesso negado');
    }

    const lead = await prisma.lead.update({
      where: { 
        id: input.id,
        tenantId // ← FILTRO ADICIONAL (defense in depth)
      },
      data: { 
        status: input.status,
        lastContact: new Date()
      }
    });

    revalidatePath('/');
    revalidatePath('/kanban');

    return lead as Lead;
  } catch (error) {
    console.error('Error updating lead status:', error);
    throw new Error('Falha ao atualizar status do lead');
  }
}
```

**Mudanças:**
- ✅ Adicionar `getCurrentTenantId()`
- ✅ Validar propriedade antes de atualizar (previne IDOR)
- ✅ Adicionar `tenantId` no `where` do update

**🔒 SEGURANÇA:** Validação dupla previne acesso cruzado entre tenants.

---

### 3.4 SA004 - `getDashboardMetrics()`

#### ANTES:
```typescript
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
```

#### DEPOIS:
```typescript
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    const tenantId = await getCurrentTenantId(); // ← NOVO
    
    // Pipeline Total: Soma dos valores de leads não-fechados
    const pipelineResult = await prisma.lead.aggregate({
      where: {
        tenantId, // ← FILTRO POR TENANT
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
        tenantId, // ← FILTRO POR TENANT
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
```

**Mudanças:**
- ✅ Adicionar `getCurrentTenantId()`
- ✅ Adicionar `tenantId` em ambas as queries (aggregate e count)

---

### 3.5 SA005 - `deleteLead()`

#### ANTES:
```typescript
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

#### DEPOIS:
```typescript
export async function deleteLead(id: string): Promise<void> {
  try {
    const tenantId = await getCurrentTenantId(); // ← NOVO
    
    // Validar propriedade antes de deletar (SEGURANÇA CRÍTICA)
    await prisma.lead.delete({
      where: { 
        id,
        tenantId // ← VALIDAÇÃO DE PROPRIEDADE
      }
    });

    revalidatePath('/');
    revalidatePath('/kanban');
  } catch (error) {
    console.error('Error deleting lead:', error);
    throw new Error('Falha ao deletar lead');
  }
}
```

**Mudanças:**
- ✅ Adicionar `getCurrentTenantId()`
- ✅ Adicionar `tenantId` no `where` do delete

**🔒 SEGURANÇA:** Previne deletar leads de outros tenants.

---

## 4. NOVO ARQUIVO: `tenants.ts`

### 4.1 Criar Arquivo

📄 **`src/app/actions/tenants.ts`** (NOVO)

```typescript
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateTenantInput {
  name?: string;
  domain?: string;
  isActive?: boolean;
}

// ============================================
// TENANT CONTEXT (Importar de leads.ts ou criar aqui)
// ============================================

async function getCurrentTenantId(): Promise<string> {
  // Mesma implementação de leads.ts
  return 'default-tenant-id';
}

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * TA001 - Obter tenant atual
 * @returns Dados do tenant do usuário autenticado
 */
export async function getCurrentTenant(): Promise<Tenant | null> {
  try {
    const tenantId = await getCurrentTenantId();
    
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });
    
    return tenant as Tenant | null;
  } catch (error) {
    console.error('Error fetching current tenant:', error);
    throw new Error('Falha ao carregar dados do tenant');
  }
}

/**
 * TA002 - Atualizar configurações do tenant
 * @param data - Dados a atualizar
 * @returns Tenant atualizado
 */
export async function updateTenantSettings(data: UpdateTenantInput): Promise<Tenant> {
  try {
    const tenantId = await getCurrentTenantId();
    
    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data
    });
    
    revalidatePath('/');
    
    return tenant as Tenant;
  } catch (error) {
    console.error('Error updating tenant:', error);
    throw new Error('Falha ao atualizar configurações do tenant');
  }
}

/**
 * TA003 - Obter estatísticas do tenant
 * @returns Estatísticas agregadas
 */
export async function getTenantStats() {
  try {
    const tenantId = await getCurrentTenantId();
    
    const [totalLeads, activeLeads, closedLeads] = await Promise.all([
      prisma.lead.count({ where: { tenantId } }),
      prisma.lead.count({ where: { tenantId, status: { not: 'closed' } } }),
      prisma.lead.count({ where: { tenantId, status: 'closed' } }),
    ]);
    
    return {
      totalLeads,
      activeLeads,
      closedLeads,
      conversionRate: totalLeads > 0 ? (closedLeads / totalLeads) * 100 : 0,
    };
  } catch (error) {
    console.error('Error fetching tenant stats:', error);
    throw new Error('Falha ao carregar estatísticas');
  }
}
```

---

## 5. RESUMO DAS MUDANÇAS

### 5.1 Checklist de Alterações

#### `src/app/actions/leads.ts`
- [ ] Adicionar função `getCurrentTenantId()`
- [ ] Modificar `getLeads()` - adicionar filtro `where: { tenantId }`
- [ ] Modificar `createLead()` - adicionar `tenantId` aos dados
- [ ] Modificar `updateLeadStatus()` - adicionar validação de propriedade
- [ ] Modificar `getDashboardMetrics()` - adicionar filtro em aggregate e count
- [ ] Modificar `deleteLead()` - adicionar validação de propriedade

#### `src/app/actions/tenants.ts` (NOVO)
- [ ] Criar arquivo
- [ ] Implementar `getCurrentTenant()`
- [ ] Implementar `updateTenantSettings()`
- [ ] Implementar `getTenantStats()`

---

## 6. TESTES RECOMENDADOS

### 6.1 Testes Unitários

```typescript
// tests/actions/leads.test.ts
import { getLeads, createLead, updateLeadStatus } from '@/app/actions/leads';
import { prisma } from '@/lib/prisma';

describe('Multi-tenancy - Server Actions', () => {
  let tenant1Id: string;
  let tenant2Id: string;
  
  beforeAll(async () => {
    // Criar dois tenants para teste
    const tenant1 = await prisma.tenant.create({
      data: { name: 'Tenant 1', slug: 'tenant1' }
    });
    const tenant2 = await prisma.tenant.create({
      data: { name: 'Tenant 2', slug: 'tenant2' }
    });
    
    tenant1Id = tenant1.id;
    tenant2Id = tenant2.id;
  });
  
  it('deve retornar apenas leads do tenant atual', async () => {
    // Criar leads para tenant 1
    await prisma.lead.create({
      data: {
        tenantId: tenant1Id,
        name: 'Lead Tenant 1',
        company: 'Company 1',
        status: 'prospect',
        value: 1000,
        aiScore: 50,
      }
    });
    
    // Criar leads para tenant 2
    await prisma.lead.create({
      data: {
        tenantId: tenant2Id,
        name: 'Lead Tenant 2',
        company: 'Company 2',
        status: 'prospect',
        value: 2000,
        aiScore: 60,
      }
    });
    
    // Mock getCurrentTenantId para retornar tenant1Id
    jest.spyOn(global, 'getCurrentTenantId').mockResolvedValue(tenant1Id);
    
    const leads = await getLeads();
    
    expect(leads).toHaveLength(1);
    expect(leads[0].tenantId).toBe(tenant1Id);
    expect(leads[0].name).toBe('Lead Tenant 1');
  });
  
  it('não deve permitir atualizar lead de outro tenant', async () => {
    const lead = await prisma.lead.create({
      data: {
        tenantId: tenant2Id,
        name: 'Lead Tenant 2',
        company: 'Company 2',
        status: 'prospect',
        value: 1000,
        aiScore: 50,
      }
    });
    
    // Mock getCurrentTenantId para retornar tenant1Id
    jest.spyOn(global, 'getCurrentTenantId').mockResolvedValue(tenant1Id);
    
    await expect(
      updateLeadStatus({ id: lead.id, status: 'qualified' })
    ).rejects.toThrow('Lead não encontrado ou acesso negado');
  });
});
```

---

**Próximo Documento:** [05-impacto-componentes.md](05-impacto-componentes.md)



