# Especificação de Server Actions

**Versão:** 1.0  
**Data:** 25/12/2025  
**Arquiteto:** Alex  
**Status:** 🟢 Pronto para Implementação

---

## Arquivo: `src/app/actions/leads.ts`

### Função de Contexto de Tenant

```typescript
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// ============================================
// TENANT CONTEXT
// ============================================

/**
 * Obter tenantId do contexto da requisição
 * @returns tenantId do usuário autenticado
 * @throws Error se tenant não encontrado
 */
async function getCurrentTenantId(): Promise<string> {
  // FASE 1 (MVP): Hardcoded para testes
  // return 'default-tenant-id';
  
  // FASE 2: Via sessão (PRODUÇÃO)
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.tenantId) {
    throw new Error('Usuário não autenticado ou sem tenant');
  }
  
  // Validar que tenant existe e está ativo
  const tenant = await prisma.tenant.findUnique({
    where: { id: session.user.tenantId },
    select: { isActive: true }
  });
  
  if (!tenant || !tenant.isActive) {
    throw new Error('Tenant inativo ou não encontrado');
  }
  
  return session.user.tenantId;
}

// ============================================
// TYPES & SCHEMAS
// ============================================

export interface Lead {
  id: string;
  tenantId: string;
  name: string;
  company: string;
  status: string;
  value: number;
  aiScore: number;
  email: string | null;
  phone: string | null;
  lastContact: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type LeadStatus = 'prospect' | 'qualified' | 'proposal' | 'closed';

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

// Schemas de validação
const createLeadSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório.'),
  company: z.string().min(1, 'Empresa é obrigatória.'),
  value: z.number().min(0, 'Valor deve ser positivo.'),
  status: z.enum(['prospect', 'qualified', 'proposal', 'closed']),
  email: z.string().email('Email inválido.').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
});

const updateLeadStatusSchema = z.object({
  id: z.string().uuid('ID inválido.'),
  status: z.enum(['prospect', 'qualified', 'proposal', 'closed']),
});

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * SA001 - Obter todos os leads do tenant atual
 * @returns Array de leads filtrados por tenant
 */
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

/**
 * SA002 - Criar novo lead
 * @param data - Dados do lead (SEM tenantId)
 * @returns Lead criado
 */
export async function createLead(data: CreateLeadInput): Promise<Lead> {
  try {
    const tenantId = await getCurrentTenantId(); // ← NOVO
    
    // Validação de dados
    const validatedData = createLeadSchema.parse(data);
    
    // Gerar AI Score aleatório (0-100)
    const aiScore = Math.floor(Math.random() * 101);
    
    const lead = await prisma.lead.create({
      data: {
        ...validatedData,
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

/**
 * SA003 - Atualizar status do lead
 * @param input - ID do lead e novo status
 * @returns Lead atualizado
 */
export async function updateLeadStatus(input: UpdateLeadStatusInput): Promise<Lead> {
  try {
    const tenantId = await getCurrentTenantId(); // ← NOVO
    
    // Validação de dados
    const validatedInput = updateLeadStatusSchema.parse(input);
    
    // VALIDAR PROPRIEDADE (previne IDOR)
    const existingLead = await prisma.lead.findFirst({
      where: { 
        id: validatedInput.id,
        tenantId // ← VALIDAÇÃO DE PROPRIEDADE
      }
    });
    
    if (!existingLead) {
      throw new Error('Lead não encontrado ou acesso negado');
    }
    
    // Atualizar lead
    const lead = await prisma.lead.update({
      where: { 
        id: validatedInput.id,
        tenantId // ← FILTRO ADICIONAL (defense in depth)
      },
      data: { 
        status: validatedInput.status,
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

/**
 * SA004 - Obter métricas do dashboard
 * @returns Métricas agregadas do tenant
 */
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

/**
 * SA005 - Deletar lead
 * @param id - ID do lead
 */
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

---

## Arquivo: `src/app/actions/tenants.ts` (NOVO)

```typescript
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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

export interface TenantStats {
  totalLeads: number;
  activeLeads: number;
  closedLeads: number;
  conversionRate: number;
}

// ============================================
// TENANT CONTEXT
// ============================================

async function getCurrentTenantId(): Promise<string> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.tenantId) {
    throw new Error('Usuário não autenticado ou sem tenant');
  }
  
  return session.user.tenantId;
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
export async function getTenantStats(): Promise<TenantStats> {
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

## Resumo de Mudanças

### Arquivo: `src/app/actions/leads.ts`

| Função | Mudanças | Criticidade |
|--------|----------|-------------|
| `getCurrentTenantId()` | ✅ Adicionada | 🔴 Crítica |
| `getLeads()` | ✅ Filtro `where: { tenantId }` | 🔴 Crítica |
| `createLead()` | ✅ Adiciona `tenantId` aos dados | 🔴 Crítica |
| `updateLeadStatus()` | ✅ Validação de propriedade | 🔴 Crítica |
| `getDashboardMetrics()` | ✅ Filtro em aggregate e count | 🔴 Crítica |
| `deleteLead()` | ✅ Validação de propriedade | 🔴 Crítica |

### Arquivo: `src/app/actions/tenants.ts` (NOVO)

| Função | Descrição | Criticidade |
|--------|-----------|-------------|
| `getCurrentTenant()` | Obter dados do tenant atual | 🟡 Média |
| `updateTenantSettings()` | Atualizar configurações | 🟡 Média |
| `getTenantStats()` | Estatísticas agregadas | 🟡 Média |

---

## Checklist de Implementação

### Fase 1: Modificar `leads.ts`
- [ ] Adicionar função `getCurrentTenantId()`
- [ ] Modificar `getLeads()` - adicionar filtro
- [ ] Modificar `createLead()` - adicionar tenantId
- [ ] Modificar `updateLeadStatus()` - validar propriedade
- [ ] Modificar `getDashboardMetrics()` - filtrar por tenant
- [ ] Modificar `deleteLead()` - validar propriedade

### Fase 2: Criar `tenants.ts`
- [ ] Criar arquivo `src/app/actions/tenants.ts`
- [ ] Implementar `getCurrentTenant()`
- [ ] Implementar `updateTenantSettings()`
- [ ] Implementar `getTenantStats()`

### Fase 3: Validação
- [ ] Executar `npm run build` (deve compilar sem erros)
- [ ] Testar cada Server Action manualmente
- [ ] Verificar que dados são filtrados por tenant

---

**Próximo Documento:** [13-implementation-guide.md](13-implementation-guide.md)

