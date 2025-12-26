/**
 * Server Action: Switch Tenant
 * 
 * ⚠️ ARQUIVO NÃO UTILIZADO ⚠️
 * 
 * Este arquivo foi mantido para compatibilidade, mas NÃO é mais usado.
 * 
 * MODELO ATUAL:
 * - Cada usuário pertence a UM tenant fixo
 * - O tenantId é injetado automaticamente no login
 * - NÃO há interface para trocar de tenant
 * - O tenant é invisível para o usuário
 * 
 * Este arquivo pode ser deletado com segurança.
 */

'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

interface SwitchTenantResult {
  success?: boolean;
  error?: string;
  tenantId?: string;
  tenantName?: string;
}

/**
 * Troca o tenant ativo do usuário
 * 
 * @param tenantId - ID do tenant para o qual o usuário deseja trocar
 * @returns Resultado da operação com sucesso ou erro
 */
export async function switchTenant(
  tenantId: string
): Promise<SwitchTenantResult> {
  try {
    // 1. Verificar autenticação
    const session = await auth();

    if (!session?.user?.id) {
      return { error: 'Usuário não autenticado' };
    }

    // 2. SEGURANÇA: Validar se o usuário pertence ao tenant solicitado
    const user = await prisma.user.findFirst({
      where: {
        id: session.user.id,
        tenantId: tenantId,
        isActive: true,
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
          },
        },
      },
    });

    // 3. Validações de segurança
    if (!user) {
      return {
        error: 'Você não tem acesso a este tenant',
      };
    }

    if (!user.tenant.isActive) {
      return {
        error: 'Este tenant está inativo',
      };
    }

    // 4. Retornar sucesso com dados do tenant
    return {
      success: true,
      tenantId: user.tenant.id,
      tenantName: user.tenant.name,
    };
  } catch (error) {
    return {
      error: 'Erro ao trocar de tenant. Tente novamente.',
    };
  }
}

/**
 * Busca todos os tenants aos quais o usuário tem acesso
 * 
 * @returns Lista de tenants do usuário
 */
export async function getUserTenants() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: 'Usuário não autenticado' };
    }

    // Buscar todos os tenants do usuário
    // NOTA: Atualmente um usuário pertence a apenas 1 tenant
    // Mas a estrutura permite multi-tenant no futuro
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
            _count: {
              select: {
                leads: true,
                users: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return { error: 'Usuário não encontrado' };
    }

    // Retornar como array para compatibilidade com TenantSelector
    return {
      tenants: user.tenant ? [user.tenant] : [],
      activeTenantId: user.tenantId,
    };
  } catch (error) {
    return { error: 'Erro ao buscar tenants' };
  }
}


