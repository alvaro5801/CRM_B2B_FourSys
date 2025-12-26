'use server';

import { prisma } from '@/lib/prisma';
import { requireTenant } from '@/lib/auth';
import * as bcrypt from 'bcryptjs';

// ============================================
// TYPES & INTERFACES
// ============================================

export type UserRole = 'admin' | 'user' | 'viewer';

export interface User {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
  role?: UserRole;
}

// Tipo seguro para retorno de usuários (sem senha)
export type SafeUser = Omit<User, 'password'>;

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
 * SA-U001 - Listar usuários do tenant (TENANT-SCOPED)
 * 
 * SEGURANÇA: 
 * - Lista apenas usuários do tenant atual
 * - NUNCA aceita tenantId como parâmetro
 * - Usa requireTenant() para obter tenantId da sessão
 * - NUNCA retorna campo password
 * 
 * @returns ActionResult com array de usuários ou erro
 */
export async function getTenantUsers(): Promise<ActionResult<SafeUser[]>> {
  try {
    // 🔒 SEGURANÇA: Obter tenantId da sessão (NUNCA do cliente)
    const tenantId = await requireTenant();
    
    // Buscar todos os usuários do tenant
    const users = await prisma.user.findMany({
      where: {
        tenantId, // ← ISOLAMENTO: Apenas users do tenant atual
      },
      select: {
        id: true,
        tenantId: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // 🔒 SEGURANÇA: password NUNCA é incluído
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return {
      data: users as SafeUser[],
      success: true,
    };
  } catch (error) {
    // Tratamento de erro específico
    if (error instanceof Error && error.message.includes('autenticado')) {
      return {
        error: 'Usuário não autenticado',
        success: false,
      };
    }
    
    return {
      error: 'Erro ao carregar usuários. Tente novamente.',
      success: false,
    };
  }
}

/**
 * SA-U002 - Criar novo usuário (TENANT-SCOPED)
 * 
 * SEGURANÇA: 
 * - Associa automaticamente ao tenant atual
 * - NUNCA aceita tenantId como parâmetro
 * - Hash de senha com bcrypt
 * - Valida email único
 * 
 * @param data - Dados do usuário
 * @returns ActionResult com usuário criado (sem senha) ou erro
 */
export async function createUser(data: CreateUserInput): Promise<ActionResult<SafeUser>> {
  try {
    // 🔒 SEGURANÇA: Obter tenantId da sessão
    const tenantId = await requireTenant();
    
    // Validações
    if (!data.email || !data.email.includes('@')) {
      return {
        error: 'Email inválido',
        success: false,
      };
    }
    
    if (!data.name || data.name.trim().length < 2) {
      return {
        error: 'Nome deve ter pelo menos 2 caracteres',
        success: false,
      };
    }
    
    if (!data.password || data.password.length < 8) {
      return {
        error: 'Senha deve ter pelo menos 8 caracteres',
        success: false,
      };
    }
    
    // Validar email único (global, não apenas no tenant)
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    
    if (existingUser) {
      return {
        error: 'Email já cadastrado',
        success: false,
      };
    }
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    // Criar usuário
    const user = await prisma.user.create({
      data: {
        tenantId, // ← ISOLAMENTO: Associar ao tenant atual
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: data.role || 'user',
      },
      select: {
        id: true,
        tenantId: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    return {
      data: user as SafeUser,
      success: true,
    };
  } catch (error) {
    return {
      error: 'Erro ao criar usuário. Tente novamente.',
      success: false,
    };
  }
}

/**
 * SA-U003 - Obter usuário por ID (TENANT-SCOPED)
 * 
 * SEGURANÇA: 
 * - Retorna apenas se pertence ao tenant atual
 * - Valida ownership antes de retornar
 * 
 * @param userId - ID do usuário
 * @returns ActionResult com usuário ou erro
 */
export async function getUserById(userId: string): Promise<ActionResult<SafeUser>> {
  try {
    // 🔒 SEGURANÇA: Obter tenantId da sessão
    const tenantId = await requireTenant();
    
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        tenantId, // ← ISOLAMENTO: Apenas do tenant atual
      },
      select: {
        id: true,
        tenantId: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    if (!user) {
      return {
        error: 'Usuário não encontrado',
        success: false,
      };
    }
    
    return {
      data: user as SafeUser,
      success: true,
    };
  } catch (error) {
    return {
      error: 'Erro ao buscar usuário',
      success: false,
    };
  }
}

/**
 * SA-U004 - Ativar/Desativar usuário (TENANT-SCOPED)
 * 
 * SEGURANÇA:
 * - Valida que o usuário pertence ao tenant atual
 * - Impede cross-tenant attacks
 * - Não permite desativar o próprio usuário
 * 
 * @param userId - ID do usuário a ser alterado
 * @param isActive - Novo status (true = ativo, false = inativo)
 * @returns ActionResult com usuário atualizado ou erro
 */
export async function toggleUserStatus(
  userId: string,
  isActive: boolean
): Promise<ActionResult<SafeUser>> {
  try {
    // 🔒 SEGURANÇA: Obter tenantId da sessão
    const tenantId = await requireTenant();
    
    // 🔒 SEGURANÇA: Obter usuário atual
    const { getCurrentUser } = await import('@/lib/auth');
    const currentUser = await getCurrentUser();
    
    if (!currentUser?.id) {
      return {
        error: 'Usuário não autenticado',
        success: false,
      };
    }
    
    // 🔒 SEGURANÇA: Impedir que usuário desative a si mesmo
    if (userId === currentUser.id) {
      return {
        error: 'Você não pode alterar seu próprio status',
        success: false,
      };
    }
    
    // 🔒 SEGURANÇA: Validar que o usuário pertence ao tenant atual
    const targetUser = await prisma.user.findFirst({
      where: {
        id: userId,
        tenantId, // ← ISOLAMENTO: Apenas do tenant atual
      },
    });
    
    if (!targetUser) {
      return {
        error: 'Usuário não encontrado ou não pertence ao seu tenant',
        success: false,
      };
    }
    
    // Atualizar status do usuário
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        isActive,
      },
      select: {
        id: true,
        tenantId: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    return {
      data: updatedUser as SafeUser,
      success: true,
    };
  } catch (error) {
    return {
      error: 'Erro ao atualizar status do usuário',
      success: false,
    };
  }
}

/**
 * SA-U005 - Obter usuário por email (TENANT-SCOPED)
 * 
 * SEGURANÇA: Retorna apenas se pertence ao tenant atual
 * 
 * @param email - Email do usuário
 * @returns ActionResult com usuário ou erro
 */
export async function getUserByEmail(email: string): Promise<ActionResult<SafeUser>> {
  try {
    const tenantId = await requireTenant();
    
    const user = await prisma.user.findFirst({
      where: {
        email,
        tenantId, // ← ISOLAMENTO: Apenas do tenant atual
      },
      select: {
        id: true,
        tenantId: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    if (!user) {
      return {
        error: 'Usuário não encontrado',
        success: false,
      };
    }
    
    return {
      data: user as SafeUser,
      success: true,
    };
  } catch (error) {
    return {
      error: 'Erro ao buscar usuário',
      success: false,
    };
  }
}

/**
 * SA-U006 - Contar usuários do tenant (TENANT-SCOPED)
 * 
 * SEGURANÇA: Conta apenas usuários do tenant atual
 * 
 * @returns ActionResult com contagem ou erro
 */
export async function getTenantUsersCount(): Promise<ActionResult<{
  total: number;
  active: number;
  inactive: number;
}>> {
  try {
    const tenantId = await requireTenant();
    
    const [total, active] = await Promise.all([
      prisma.user.count({
        where: { tenantId },
      }),
      prisma.user.count({
        where: { tenantId, isActive: true },
      }),
    ]);
    
    return {
      data: {
        total,
        active,
        inactive: total - active,
      },
      success: true,
    };
  } catch (error) {
    return {
      error: 'Erro ao contar usuários',
      success: false,
    };
  }
}


