/**
 * Server Actions: Lead Management
 * 
 * MODELO DE MULTI-TENANCY:
 * - Cada usuário pertence a UM tenant (organização)
 * - O tenantId é extraído AUTOMATICAMENTE da sessão
 * - NUNCA aceitar tenantId de parâmetros do cliente
 * - Todos os dados são filtrados automaticamente por tenant
 * - O usuário não vê e não interage com o conceito de "tenant"
 */

'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireTenant, validateTenantOwnership } from '@/lib/auth';

// ============================================
// TYPES & INTERFACES
// ============================================

export type LeadStatus = 'prospect' | 'qualified' | 'proposal' | 'closed';

export interface Lead {
  id: string;
  tenantId: string; // ← NOVO: Multi-tenancy
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

export interface UpdateLeadInput {
  id: string;
  name?: string;
  company?: string;
  status?: LeadStatus;
  value?: number;
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

// Tipo padrão de resposta para Server Actions
export interface ActionResult<T> {
  data?: T;
  error?: string;
  success?: boolean;
}

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * SA001 - Obter todos os leads (TENANT-SCOPED)
 * 
 * SEGURANÇA: Filtra automaticamente por tenantId da sessão
 * 
 * @returns ActionResult com array de leads ou erro
 */
export async function getLeads(): Promise<ActionResult<Lead[]>> {
  try {
    // CRÍTICO: Obter tenantId da sessão (NUNCA do cliente)
    const tenantId = await requireTenant();
    
    const leads = await prisma.lead.findMany({
      where: {
        tenantId // ← ISOLAMENTO: Apenas leads do tenant atual
      },
      orderBy: [
        { aiScore: 'desc' },
        { createdAt: 'desc' }
      ]
    });
    
    return {
      data: leads as Lead[],
      success: true,
    };
  } catch (error) {
    // Tratamento de erro específico
    if (error instanceof Error && error.message.includes('autenticado')) {
      return {
        data: [], // Retorna array vazio em vez de erro
        success: true, // Permite que a página carregue
      };
    }
    
    return {
      data: [],
      error: 'Erro ao carregar leads',
      success: false,
    };
  }
}

/**
 * SA002 - Criar novo lead (TENANT-SCOPED)
 * 
 * SEGURANÇA: Associa automaticamente ao tenantId da sessão
 * VALIDAÇÃO: Previne duplicatas de email/telefone no mesmo tenant
 * 
 * @param data - Dados do lead (sem aiScore e tenantId)
 * @returns Lead criado ou erro de duplicata
 */
export async function createLead(data: CreateLeadInput): Promise<Lead> {
  try {
    // CRÍTICO: Obter tenantId da sessão (NUNCA do cliente)
    const tenantId = await requireTenant();
    
    // Validação de status
    const validStatuses: LeadStatus[] = ['prospect', 'qualified', 'proposal', 'closed'];
    if (!validStatuses.includes(data.status)) {
      throw new Error('Status inválido');
    }

    // Validação de valor
    if (data.value < 0) {
      throw new Error('Valor não pode ser negativo');
    }

    // VALIDAÇÃO DE DUPLICATAS: Verificar se já existe lead com mesmo email ou telefone
    if (data.email || data.phone) {
      const conditions = [];
      
      if (data.email) {
        conditions.push({ email: data.email });
      }
      
      if (data.phone) {
        conditions.push({ phone: data.phone });
      }

      const existingLead = await prisma.lead.findFirst({
        where: {
          tenantId,
          OR: conditions
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        }
      });

      if (existingLead) {
        // Identificar qual campo está duplicado
        const duplicatedField = 
          existingLead.email === data.email ? 'e-mail' : 'telefone';
        
        throw new Error(
          `Já existe um lead cadastrado com este ${duplicatedField}. Lead: ${existingLead.name}`
        );
      }
    }

    // Gerar AI Score aleatório (0-100)
    const aiScore = Math.floor(Math.random() * 101);

    const lead = await prisma.lead.create({
      data: {
        ...data,
        tenantId, // ← ISOLAMENTO: Associar ao tenant atual
        aiScore,
      }
    });

    revalidatePath('/');
    revalidatePath('/kanban');
    
    return lead as Lead;
  } catch (error) {
    console.error('Error creating lead:', error);
    
    // Propagar mensagens de erro específicas
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Falha ao criar lead');
  }
}

/**
 * SA003 - Atualizar status do lead (TENANT-SCOPED)
 * 
 * SEGURANÇA: Valida que o lead pertence ao tenant atual antes de atualizar
 * 
 * @param input - ID e novo status
 * @returns Lead atualizado
 */
export async function updateLeadStatus(input: UpdateLeadStatusInput): Promise<Lead> {
  try {
    // CRÍTICO: Obter tenantId da sessão
    const tenantId = await requireTenant();
    
    const validStatuses: LeadStatus[] = ['prospect', 'qualified', 'proposal', 'closed'];
    if (!validStatuses.includes(input.status)) {
      throw new Error('Status inválido');
    }

    // SEGURANÇA: Validar que o lead pertence ao tenant atual
    const existingLead = await prisma.lead.findUnique({
      where: { id: input.id },
      select: { tenantId: true }
    });
    
    if (!existingLead) {
      throw new Error('Lead não encontrado');
    }
    
    if (existingLead.tenantId !== tenantId) {
      throw new Error('Acesso negado: Lead não pertence ao seu tenant');
    }

    // Atualizar apenas se pertence ao tenant
    const lead = await prisma.lead.update({
      where: { 
        id: input.id,
        tenantId // ← ISOLAMENTO: Double-check no WHERE
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

/**
 * SA004 - Obter métricas do dashboard (TENANT-SCOPED)
 * 
 * SEGURANÇA: Calcula métricas apenas para o tenant atual
 * 
 * @returns ActionResult com métricas ou erro
 */
export async function getDashboardMetrics(): Promise<ActionResult<DashboardMetrics>> {
  try {
    // CRÍTICO: Obter tenantId da sessão
    const tenantId = await requireTenant();
    
    // Pipeline Total: Soma dos valores de leads não-fechados do tenant
    const pipelineResult = await prisma.lead.aggregate({
      where: {
        tenantId, // ← ISOLAMENTO: Apenas do tenant atual
        status: {
          not: 'closed'
        }
      },
      _sum: {
        value: true
      }
    });

    // Leads Ativos: Contagem de leads não-fechados do tenant
    const activeLeads = await prisma.lead.count({
      where: {
        tenantId, // ← ISOLAMENTO: Apenas do tenant atual
        status: {
          not: 'closed'
        }
      }
    });

    // Taxa de Conversão: Mockada (valor estático para demo)
    const conversionRate = 23.5;

    return {
      data: {
        pipelineTotal: pipelineResult._sum.value || 0,
        activeLeads,
        conversionRate
      },
      success: true,
    };
  } catch (error) {
    // Tratamento de erro específico
    if (error instanceof Error && error.message.includes('autenticado')) {
      return {
        data: {
          pipelineTotal: 0,
          activeLeads: 0,
          conversionRate: 0,
        },
        success: true,
      };
    }
    
    return {
      data: {
        pipelineTotal: 0,
        activeLeads: 0,
        conversionRate: 0,
      },
      error: 'Erro ao calcular métricas',
      success: false,
    };
  }
}

/**
 * SA005 - Atualizar lead (TENANT-SCOPED)
 * 
 * SEGURANÇA: Valida que o lead pertence ao tenant atual antes de atualizar
 * VALIDAÇÃO: Previne duplicatas de email/telefone ao editar
 * 
 * @param input - ID e dados para atualizar
 * @returns Lead atualizado
 */
export async function updateLead(input: UpdateLeadInput): Promise<Lead> {
  try {
    // CRÍTICO: Obter tenantId da sessão
    const tenantId = await requireTenant();
    
    // SEGURANÇA: Validar que o lead pertence ao tenant atual
    const existingLead = await prisma.lead.findUnique({
      where: { id: input.id },
      select: { tenantId: true }
    });
    
    if (!existingLead) {
      throw new Error('Lead não encontrado');
    }
    
    if (existingLead.tenantId !== tenantId) {
      throw new Error('Acesso negado: Lead não pertence ao seu tenant');
    }

    // Validações
    if (input.status) {
      const validStatuses: LeadStatus[] = ['prospect', 'qualified', 'proposal', 'closed'];
      if (!validStatuses.includes(input.status)) {
        throw new Error('Status inválido');
      }
    }

    if (input.value !== undefined && input.value < 0) {
      throw new Error('Valor não pode ser negativo');
    }

    // VALIDAÇÃO DE DUPLICATAS: Verificar se email/telefone já existem em outro lead
    if (input.email || input.phone) {
      const conditions = [];
      
      if (input.email) {
        conditions.push({ email: input.email });
      }
      
      if (input.phone) {
        conditions.push({ phone: input.phone });
      }

      const duplicateLead = await prisma.lead.findFirst({
        where: {
          tenantId,
          id: { not: input.id }, // Excluir o próprio lead da busca
          OR: conditions
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        }
      });

      if (duplicateLead) {
        // Identificar qual campo está duplicado
        const duplicatedField = 
          duplicateLead.email === input.email ? 'e-mail' : 'telefone';
        
        throw new Error(
          `Já existe outro lead com este ${duplicatedField}. Lead: ${duplicateLead.name}`
        );
      }
    }

    // Preparar dados para atualização (remover id e campos undefined)
    const { id, ...updateData } = input;
    const cleanData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    // Atualizar apenas se pertence ao tenant
    const lead = await prisma.lead.update({
      where: { 
        id: input.id,
        tenantId // ← ISOLAMENTO: Double-check no WHERE
      },
      data: {
        ...cleanData,
        lastContact: new Date()
      }
    });

    revalidatePath('/');
    revalidatePath('/kanban');

    return lead as Lead;
  } catch (error) {
    console.error('Error updating lead:', error);
    
    // Propagar mensagens de erro específicas
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Falha ao atualizar lead');
  }
}

/**
 * SA006 - Deletar lead (TENANT-SCOPED)
 * 
 * SEGURANÇA: Valida que o lead pertence ao tenant atual antes de deletar
 * 
 * @param id - ID do lead
 */
export async function deleteLead(id: string): Promise<void> {
  try {
    // CRÍTICO: Obter tenantId da sessão
    const tenantId = await requireTenant();
    
    // SEGURANÇA: Validar que o lead pertence ao tenant atual
    const existingLead = await prisma.lead.findUnique({
      where: { id },
      select: { tenantId: true }
    });
    
    if (!existingLead) {
      throw new Error('Lead não encontrado');
    }
    
    if (existingLead.tenantId !== tenantId) {
      throw new Error('Acesso negado: Lead não pertence ao seu tenant');
    }

    // Deletar apenas se pertence ao tenant
    await prisma.lead.delete({
      where: { 
        id,
        tenantId // ← ISOLAMENTO: Double-check no WHERE
      }
    });

    revalidatePath('/');
    revalidatePath('/kanban');
  } catch (error) {
    console.error('Error deleting lead:', error);
    throw new Error('Falha ao deletar lead');
  }
}

