/**
 * Middleware - NextAuth.js v5
 * 
 * Redirecionamentos Inteligentes:
 * - Usuários autenticados → / (dashboard) se tentarem acessar /login ou /signup
 * - Usuários não autenticados → /login (se tentarem acessar rotas protegidas)
 * - Mantém contexto de tenantId na sessão
 */

import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Definir rotas
  const isAuthRoute = nextUrl.pathname === '/login' || nextUrl.pathname === '/signup';
  const isRootRoute = nextUrl.pathname === '/';
  const isProtectedRoute = 
    nextUrl.pathname.startsWith('/kanban') ||
    nextUrl.pathname.startsWith('/settings') ||
    nextUrl.pathname.startsWith('/admin');

  // 1. USUÁRIO AUTENTICADO tentando acessar /login ou /signup
  // → Redirecionar para / (dashboard)
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL('/', nextUrl));
  }

  // 2. USUÁRIO NÃO AUTENTICADO tentando acessar raiz (/)
  // → Redirecionar para /login
  if (!isLoggedIn && isRootRoute) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  // 3. USUÁRIO NÃO AUTENTICADO tentando acessar rota protegida
  // → Redirecionar para /login
  if (!isLoggedIn && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  // 4. Permitir acesso para todas as outras rotas
  return NextResponse.next();
});

// Configuração do matcher
// Inclui: todas as rotas exceto arquivos estáticos, API routes, e assets
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder (images, fonts, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};

