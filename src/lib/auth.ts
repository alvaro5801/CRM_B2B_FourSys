/**
 * Authentication Helpers
 * Multi-tenancy: Tenant Context Management
 * 
 * USANDO NextAuth.js v5 (Auth.js)
 * 
 * MODELO DE TENANT:
 * - Cada usuário pertence a UM tenant (organização)
 * - O tenantId é injetado automaticamente na sessão durante o login
 * - NUNCA é necessário selecionar ou trocar de tenant manualmente
 * - Todos os dados são filtrados automaticamente pelo tenant do usuário
 */

import { auth } from '@/auth';

/**
 * Obter o tenantId da sessão atual
 * 
 * SEGURANÇA CRÍTICA:
 * - NUNCA aceitar tenantId do cliente (query params, body, etc)
 * - SEMPRE obter da sessão autenticada
 * - O tenantId é injetado automaticamente no login
 * - O usuário não precisa (e não pode) selecionar tenant
 * 
 * @returns tenantId da sessão ou null se não autenticado
 */
export async function getTenantId(): Promise<string | null> {
  const session = await auth();
  
  if (!session?.user?.tenantId) {
    return null;
  }
  
  // Retorna o tenantId que foi automaticamente injetado no login
  return session.user.tenantId;
}

/**
 * Obter sessão completa do usuário
 * 
 * @returns Session com user e tenantId
 */
export async function getSession() {
  return await auth();
}

/**
 * Obter dados completos do tenant atual
 * 
 * @returns Tenant completo ou null
 */
export async function getCurrentTenant() {
  const tenantId = await getTenantId();
  
  if (!tenantId) {
    return null;
  }
  
  const { prisma } = await import('@/lib/prisma');
  
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { 
        id: tenantId,
        isActive: true 
      }
    });
    
    return tenant;
  } catch (error) {
    console.error('Error fetching current tenant:', error);
    return null;
  }
}

/**
 * Obter usuário atual da sessão
 * 
 * @returns User ou null
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user || null;
}

/**
 * Validar se um recurso pertence ao tenant atual
 * 
 * @param resourceTenantId - tenantId do recurso
 * @returns true se pertence ao tenant atual
 */
export async function validateTenantOwnership(resourceTenantId: string): Promise<boolean> {
  const currentTenantId = await getTenantId();
  
  if (!currentTenantId) {
    return false;
  }
  
  return currentTenantId === resourceTenantId;
}

/**
 * Garantir que o usuário está autenticado e tem um tenant
 * 
 * Esta função é usada em TODAS as Server Actions para:
 * 1. Validar que o usuário está autenticado
 * 2. Obter automaticamente o tenantId da sessão
 * 3. Garantir isolamento de dados entre tenants
 * 
 * O tenantId é injetado automaticamente no login - o usuário
 * não precisa selecionar ou trocar de tenant manualmente.
 * 
 * @throws Error se não autenticado
 * @returns tenantId do usuário logado
 */
export async function requireTenant(): Promise<string> {
  const tenantId = await getTenantId();
  
  if (!tenantId) {
    throw new Error('Não autenticado ou tenant não encontrado');
  }
  
  // Retorna o tenantId automaticamente extraído da sessão
  return tenantId;
}


