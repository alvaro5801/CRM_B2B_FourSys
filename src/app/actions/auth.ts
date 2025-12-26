'use server';

import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface SignupInput {
  // Step 1: Empresa
  companyName: string;
  
  // Step 2: Usuário
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * SA-AUTH001 - Signup (Criar Tenant + User Admin)
 * 
 * MULTI-TENANCY: Cria tenant e primeiro usuário admin
 * 
 * @param data - Dados do signup
 * @returns Success message ou erro
 */
export async function signup(data: SignupInput) {
  try {
    // Validações
    if (!data.companyName || data.companyName.trim().length < 2) {
      return { error: 'Nome da empresa deve ter pelo menos 2 caracteres' };
    }

    if (!data.name || data.name.trim().length < 2) {
      return { error: 'Nome deve ter pelo menos 2 caracteres' };
    }

    if (!data.email || !data.email.includes('@')) {
      return { error: 'Email inválido' };
    }

    if (!data.password || data.password.length < 8) {
      return { error: 'Senha deve ter pelo menos 8 caracteres' };
    }

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return { error: 'Este email já está cadastrado' };
    }

    // Gerar slug único para o tenant
    const baseSlug = data.companyName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9]+/g, '-') // Substitui caracteres especiais por -
      .replace(/^-+|-+$/g, ''); // Remove - do início e fim

    let slug = baseSlug;
    let slugCounter = 1;

    // Verificar se slug é único
    while (await prisma.tenant.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${slugCounter}`;
      slugCounter++;
    }

    // Hash da senha
    const hashedPassword = await hash(data.password, 10);

    // Criar Tenant + User em transação
    const result = await prisma.$transaction(async (tx) => {
      // Criar Tenant
      const tenant = await tx.tenant.create({
        data: {
          name: data.companyName,
          slug,
          isActive: true,
        },
      });

      // Criar User Admin
      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: data.email,
          name: data.name,
          password: hashedPassword,
          role: 'admin',
          isActive: true,
        },
      });

      return { tenant, user };
    });

    return {
      success: true,
      message: 'Conta criada com sucesso!',
      tenantSlug: result.tenant.slug,
    };
  } catch (error) {
    return { error: 'Erro ao criar conta. Tente novamente.' };
  }
}

/**
 * SA-AUTH002 - Login
 * 
 * MULTI-TENANCY: Autentica e carrega tenantId na sessão
 * 
 * @param data - Credenciais de login
 * @returns Success ou erro
 */
export async function login(data: LoginInput) {
  try {
    await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Email ou senha incorretos' };
        default:
          return { error: 'Erro ao fazer login. Tente novamente.' };
      }
    }
    throw error;
  }
}

/**
 * SA-AUTH003 - Verificar disponibilidade de slug
 * 
 * @param companyName - Nome da empresa
 * @returns Slug disponível
 */
export async function checkSlugAvailability(companyName: string) {
  try {
    const baseSlug = companyName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = baseSlug;
    let slugCounter = 1;

    while (await prisma.tenant.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${slugCounter}`;
      slugCounter++;
    }

    return { slug, available: true };
  } catch (error) {
    return { slug: companyName, available: false };
  }
}

