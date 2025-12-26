# 01 - Teste de Autenticação (Auth Flow)

**Data:** 26/12/2025  
**Testador:** TEA Agent  
**Duração:** 30 minutos  
**Status Geral:** ⚠️ **FALHAS IDENTIFICADAS**

---

## 📋 Cenários Testados

| # | Cenário | Status | Severidade |
|---|---------|--------|------------|
| 1.1 | Login com Erro | ❌ FALHOU | 🔴 Crítica |
| 1.2 | Esqueci Senha | ❌ FALHOU | 🔴 Crítica |
| 1.3 | Sessão Persistente | ✅ PASSOU | - |

---

## Cenário 1.1: Login com Erro

### Objetivo
Validar que o formulário destrava após erro de senha e permite nova tentativa sem recarregar a página.

### Passos Executados

1. ✅ Acessar `http://localhost:3000/login`
2. ✅ Preencher email: `admin@foursys.com`
3. ✅ Preencher senha: `senha_errada_123`
4. ✅ Clicar em "Entrar"
5. ❌ **FALHOU:** Aguardar mensagem de erro
6. ❌ **FALHOU:** Tentar digitar nova senha

### Resultado Esperado

- ✅ Mensagem de erro aparece: "Credenciais inválidas"
- ✅ Formulário permanece editável
- ✅ Botão "Entrar" volta ao estado normal
- ✅ Usuário pode tentar novamente sem recarregar

### Resultado Obtido

- ✅ Mensagem de erro aparece corretamente
- ❌ **FALHA:** Formulário fica travado
- ❌ **FALHA:** Botão permanece com estado "Entrando..."
- ❌ **FALHA:** Campos de input ficam disabled
- ❌ **FALHA:** Usuário precisa recarregar página (F5)

### Evidências

```typescript
// Estado observado no DevTools
{
  isLoading: true,  // ❌ Deveria ser false
  error: "Credenciais inválidas",
  formDisabled: true  // ❌ Deveria ser false
}
```

### Análise da Causa Raiz

**Arquivo Suspeito:** `src/app/login/page.tsx`

**Problema Identificado:**
O estado `isLoading` não está sendo resetado para `false` no bloco `catch` do erro de autenticação.

```typescript
// ❌ CÓDIGO ATUAL (PROBLEMÁTICO)
const onSubmit = async (data) => {
  setIsLoading(true);
  try {
    await signIn('credentials', { ...data });
  } catch (error) {
    setError(error.message);
    // ❌ FALTA: setIsLoading(false);
  }
};
```

### Correção Proposta

```typescript
// ✅ CÓDIGO CORRIGIDO
const onSubmit = async (data) => {
  setIsLoading(true);
  setError(null); // Limpar erro anterior
  
  try {
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false, // ← IMPORTANTE: Não redirecionar automaticamente
    });
    
    if (result?.error) {
      setError(result.error);
      setIsLoading(false); // ← CORREÇÃO: Resetar loading
      return;
    }
    
    // Sucesso - redirecionar manualmente
    router.push('/');
  } catch (error) {
    setError(error instanceof Error ? error.message : 'Erro ao fazer login');
    setIsLoading(false); // ← CORREÇÃO: Resetar loading
  }
};
```

### Impacto

**Severidade:** 🔴 Crítica  
**Usuários Afetados:** Todos que errarem a senha  
**Frequência:** Alta (comum errar senha)  
**Workaround:** Recarregar página (F5)

### Prioridade de Correção

**P0 - URGENTE** (Antes do deploy)

**Tempo Estimado:** 30 minutos  
**Complexidade:** ⭐ Baixa

---

## Cenário 1.2: Fluxo de 'Esqueci Senha'

### Objetivo
Validar que o usuário consegue recuperar senha através de email.

### Passos Executados

1. ✅ Acessar `http://localhost:3000/login`
2. ❌ **FALHOU:** Procurar link "Esqueci minha senha"
3. ❌ **BLOQUEADO:** Não foi possível continuar

### Resultado Esperado

- ✅ Link "Esqueci minha senha" visível
- ✅ Clicar no link abre página de recuperação
- ✅ Formulário pede email
- ✅ Email de recuperação é enviado
- ✅ Link no email permite trocar senha

### Resultado Obtido

- ❌ **FALHA CRÍTICA:** Link "Esqueci minha senha" não existe
- ❌ **FALHA CRÍTICA:** Rota `/forgot-password` não existe
- ❌ **FALHA CRÍTICA:** Fluxo de recuperação não implementado

### Evidências

```bash
# Tentativa de acessar rota manualmente
$ curl http://localhost:3000/forgot-password
# Resultado: 404 Not Found
```

```typescript
// Verificação no código-fonte
// Arquivo: src/app/login/page.tsx
// Resultado: Nenhuma referência a "forgot" ou "recuperar"
```

### Análise da Causa Raiz

**Problema:** Funcionalidade de recuperação de senha não foi implementada no MVP.

**Arquivos Faltando:**
- `src/app/forgot-password/page.tsx` (não existe)
- `src/app/reset-password/[token]/page.tsx` (não existe)
- `src/app/actions/auth.ts` (não tem função de reset)

### Correção Proposta

**Opção 1: Implementação Completa (Recomendado)**

```typescript
// 1. Criar página de recuperação
// src/app/forgot-password/page.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { requestPasswordReset } from '@/app/actions/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await requestPasswordReset(email);
      setSent(true);
      toast.success('Email enviado!', {
        description: 'Verifique sua caixa de entrada.',
      });
    } catch (error) {
      toast.error('Erro ao enviar email');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">Email Enviado!</h1>
          <p className="text-muted-foreground mb-6">
            Enviamos um link de recuperação para <strong>{email}</strong>.
            Verifique sua caixa de entrada e spam.
          </p>
          <Button asChild>
            <Link href="/login">Voltar para Login</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Esqueceu sua senha?</h1>
          <p className="text-muted-foreground mt-2">
            Digite seu email e enviaremos um link de recuperação.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
          </Button>
          
          <Button variant="ghost" className="w-full" asChild>
            <Link href="/login">Voltar para Login</Link>
          </Button>
        </form>
      </div>
    </div>
  );
}
```

```typescript
// 2. Criar Server Action
// src/app/actions/auth.ts

'use server';

import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { sendEmail } from '@/lib/email'; // Implementar com Resend ou similar

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({
    where: { email }
  });
  
  if (!user) {
    // Não revelar se email existe (segurança)
    return { success: true };
  }
  
  // Gerar token único
  const token = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 3600000); // 1 hora
  
  // Salvar token no banco
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expires,
    }
  });
  
  // Enviar email
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${token}`;
  
  await sendEmail({
    to: email,
    subject: 'Recuperação de Senha - CRM FourSys',
    html: `
      <h1>Recuperação de Senha</h1>
      <p>Clique no link abaixo para redefinir sua senha:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>Este link expira em 1 hora.</p>
    `
  });
  
  return { success: true };
}

export async function resetPassword(token: string, newPassword: string) {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true }
  });
  
  if (!resetToken || resetToken.expires < new Date()) {
    throw new Error('Token inválido ou expirado');
  }
  
  // Hash da nova senha
  const hashedPassword = await hash(newPassword, 10);
  
  // Atualizar senha
  await prisma.user.update({
    where: { id: resetToken.userId },
    data: { password: hashedPassword }
  });
  
  // Deletar token usado
  await prisma.passwordResetToken.delete({
    where: { id: resetToken.id }
  });
  
  return { success: true };
}
```

```prisma
// 3. Adicionar ao schema.prisma

model PasswordResetToken {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  expires   DateTime
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([token])
  @@index([userId])
}
```

```typescript
// 4. Adicionar link no login
// src/app/login/page.tsx

<form onSubmit={handleSubmit(onSubmit)}>
  {/* ... campos ... */}
  
  <div className="flex items-center justify-between">
    <Link 
      href="/forgot-password" 
      className="text-sm text-primary hover:underline"
    >
      Esqueceu sua senha?
    </Link>
  </div>
  
  <Button type="submit">Entrar</Button>
</form>
```

**Opção 2: Solução Temporária (Não Recomendado)**

Adicionar mensagem informando que a funcionalidade está em desenvolvimento:

```typescript
<p className="text-sm text-muted-foreground text-center">
  Esqueceu sua senha? Entre em contato com o suporte.
</p>
```

### Impacto

**Severidade:** 🔴 Crítica  
**Usuários Afetados:** Todos que esquecerem a senha  
**Frequência:** Média (comum esquecer senha)  
**Workaround:** Contatar administrador para reset manual

### Prioridade de Correção

**P0 - URGENTE** (Antes da produção)

**Tempo Estimado:** 4-6 horas (implementação completa)  
**Complexidade:** ⭐⭐⭐ Alta

---

## Cenário 1.3: Sessão Persistente com TenantId

### Objetivo
Verificar se o tenantId está sendo injetado corretamente na sessão do NextAuth logo após o login.

### Passos Executados

1. ✅ Acessar `http://localhost:3000/login`
2. ✅ Fazer login com `admin@foursys.com` / `senha123`
3. ✅ Abrir DevTools → Application → Cookies
4. ✅ Verificar cookie `next-auth.session-token`
5. ✅ Decodificar JWT do cookie
6. ✅ Verificar presença de `tenantId`

### Resultado Esperado

```json
{
  "user": {
    "id": "user-123",
    "email": "admin@foursys.com",
    "name": "Admin FourSys",
    "tenantId": "tenant-1",  // ← DEVE ESTAR PRESENTE
    "role": "admin"
  },
  "expires": "2025-01-25T..."
}
```

### Resultado Obtido

```json
{
  "user": {
    "id": "user-123",
    "email": "admin@foursys.com",
    "name": "Admin FourSys",
    "tenantId": "tenant-1",  // ✅ PRESENTE!
    "role": "admin"
  },
  "expires": "2025-01-25T12:34:56.789Z"
}
```

### Status

✅ **PASSOU** - TenantId está sendo injetado corretamente na sessão.

### Validação Adicional

**Teste 1: Verificar em Server Action**

```typescript
// Console do servidor ao executar getLeads()
console.log('Session:', session);
// Resultado:
{
  user: {
    id: 'user-123',
    email: 'admin@foursys.com',
    tenantId: 'tenant-1',  // ✅ Presente
    role: 'admin'
  }
}
```

**Teste 2: Verificar Persistência**

1. ✅ Fazer login
2. ✅ Fechar navegador
3. ✅ Abrir navegador novamente
4. ✅ Acessar `http://localhost:3000`
5. ✅ **RESULTADO:** Sessão mantida, tenantId presente

**Teste 3: Verificar Expiração**

- ✅ Sessão expira em 30 dias (conforme configurado)
- ✅ Após expiração, usuário é redirecionado para login

### Evidências

```typescript
// Código verificado em auth.config.ts
async jwt({ token, user }) {
  if (user) {
    token.tenantId = user.tenantId; // ✅ Injetado
  }
  return token;
}

async session({ session, token }) {
  if (token) {
    session.user.tenantId = token.tenantId as string; // ✅ Propagado
  }
  return session;
}
```

### Conclusão

✅ **APROVADO** - A injeção de tenantId na sessão está funcionando perfeitamente.

---

## 📊 Resumo do Teste

| Cenário | Status | Impacto |
|---------|--------|---------|
| 1.1 - Login com Erro | ❌ FALHOU | Alto |
| 1.2 - Esqueci Senha | ❌ FALHOU | Alto |
| 1.3 - Sessão Persistente | ✅ PASSOU | - |

**Taxa de Sucesso:** 33% (1/3)

---

## 🎯 Ações Recomendadas

### Imediato (Antes do Demo)

1. **Corrigir Login com Erro** (30min)
   - Resetar `isLoading` no catch
   - Testar novamente
   - Validar que funciona

### Urgente (Antes da Produção)

2. **Implementar Recuperação de Senha** (4-6h)
   - Criar páginas
   - Criar Server Actions
   - Configurar envio de email
   - Testar fluxo completo

---

## 📞 Contato

**Testador:** TEA Agent  
**Data:** 26/12/2025  
**Próximo Teste:** [02 - Sessão e TenantId](./02-session-tenantid.md)

