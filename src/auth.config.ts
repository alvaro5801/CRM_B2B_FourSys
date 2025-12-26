/**
 * Auth.js v5 Configuration
 * Multi-tenancy: Session includes tenantId
 */

import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const authConfig = {
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  callbacks: {
    // Callback authorized simplificado
    // A lógica de redirecionamento está no middleware.ts
    authorized({ auth }) {
      // Retorna true para permitir que o middleware gerencie os redirecionamentos
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      // Initial sign in - Inject tenantId automatically
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        // IMPORTANTE: tenantId é sempre injetado automaticamente do banco
        // O usuário não precisa selecionar - usa o tenant associado à conta
        token.tenantId = user.tenantId;
        token.role = user.role;
      }

      // Update session (mantido para compatibilidade, mas não usado na UI)
      if (trigger === 'update' && session?.tenantId) {
        token.tenantId = session.tenantId;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        // IMPORTANTE: tenantId sempre presente na sessão
        // Extraído automaticamente do banco durante o login
        session.user.tenantId = token.tenantId as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha são obrigatórios');
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
          include: {
            tenant: true,
          },
        });

        if (!user) {
          throw new Error('Credenciais inválidas');
        }

        if (!user.isActive) {
          throw new Error('Usuário inativo. Contate o administrador.');
        }

        if (!user.tenant.isActive) {
          throw new Error('Tenant inativo. Contate o suporte.');
        }

        const isPasswordValid = await compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Credenciais inválidas');
        }

        // Return user with tenantId for session
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          tenantId: user.tenantId,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig;

