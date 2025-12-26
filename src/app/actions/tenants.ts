'use server';

import { prisma } from '@/lib/prisma';
import { requireTenant } from '@/lib/auth';

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

export interface TenantWithStats extends Tenant {
  _count: {
    leads: number;
    users: number;
  };
}

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * SA-T001 - Obter tenant atual
 * 
 * @returns Tenant atual da sessão
 */
export async function getCurrentTenant(): Promise<Tenant | null> {
  try {
    const tenantId = await requireTenant();
    
    const tenant = await prisma.tenant.findUnique({
      where: { 
        id: tenantId,
        isActive: true 
      }
    });
    
    return tenant as Tenant | null;
  } catch (error) {
    console.error('Error fetching current tenant:', error);
    return null;
  }
}

/**
 * SA-T002 - Obter tenant com estatísticas
 * 
 * @returns Tenant com contagem de leads e users
 */
export async function getCurrentTenantWithStats(): Promise<TenantWithStats | null> {
  try {
    const tenantId = await requireTenant();
    
    const tenant = await prisma.tenant.findUnique({
      where: { 
        id: tenantId,
        isActive: true 
      },
      include: {
        _count: {
          select: {
            leads: true,
            users: true
          }
        }
      }
    });
    
    return tenant as TenantWithStats | null;
  } catch (error) {
    console.error('Error fetching tenant with stats:', error);
    return null;
  }
}

/**
 * SA-T003 - Listar todos os tenants (ADMIN ONLY)
 * 
 * TODO: Adicionar verificação de role admin na Fase 2
 * 
 * @returns Array de todos os tenants com estatísticas
 */
export async function getAllTenants(): Promise<TenantWithStats[]> {
  try {
    // TODO: Verificar se usuário é admin global
    
    const tenants = await prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            leads: true,
            users: true
          }
        }
      }
    });
    
    return tenants as TenantWithStats[];
  } catch (error) {
    console.error('Error fetching all tenants:', error);
    throw new Error('Falha ao carregar tenants');
  }
}


