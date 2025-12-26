# Arquitetura de Segurança

**Versão:** 1.0  
**Data:** 25/12/2025  
**Arquiteto:** Alex  
**Status:** 🟢 Aprovado

---

## Introdução

Este documento detalha a arquitetura de segurança para garantir isolamento completo de dados entre tenants, prevenir vulnerabilidades e garantir compliance com LGPD/GDPR.

---

## Princípios de Segurança

### 1. Never Trust Client Input
**Princípio:** NUNCA confiar em dados enviados pelo cliente.

**Aplicação:**
```typescript
// ❌ ERRADO: Aceitar tenantId do cliente
async function createLead(data: { tenantId: string; name: string }) {
  return prisma.lead.create({ data });
}

// ✅ CORRETO: Obter tenantId da sessão
async function createLead(data: { name: string }) {
  const tenantId = await getCurrentTenantId(); // Da sessão
  return prisma.lead.create({ 
    data: { ...data, tenantId } 
  });
}
```

---

### 2. Defense in Depth
**Princípio:** Múltiplas camadas de segurança.

**Camadas:**
1. **Sessão:** `tenantId` armazenado em token JWT seguro
2. **Server Actions:** Filtro obrigatório em todas as queries
3. **Validação:** Validação de propriedade antes de operações
4. **Índices:** Performance garante que filtros sejam usados
5. **Testes:** Testes automatizados de isolamento
6. **Auditoria:** Logs de tentativas de acesso cruzado

---

### 3. Fail Secure
**Princípio:** Em caso de erro, falhar de forma segura.

**Aplicação:**
```typescript
async function getCurrentTenantId(): Promise<string> {
  const session = await getServerSession(authOptions);
  
  // Se sessão inválida → erro (não retornar default)
  if (!session?.user?.tenantId) {
    throw new Error('Usuário não autenticado ou sem tenant');
  }
  
  return session.user.tenantId;
}
```

---

## Modelo de Ameaças

### Ameaça 1: Tenant ID Spoofing

**Descrição:** Atacante tenta enviar `tenantId` de outro tenant.

**Vetor de Ataque:**
```typescript
// Cliente malicioso envia:
fetch('/api/leads', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Lead Malicioso',
    tenantId: 'tenant-da-vitima' // ← Tentativa de spoofing
  })
});
```

**Mitigação:**
```typescript
// Server Action IGNORA tenantId do cliente
export async function createLead(data: CreateLeadInput) {
  const tenantId = await getCurrentTenantId(); // Da sessão
  
  // tenantId do cliente é ignorado
  return prisma.lead.create({
    data: {
      name: data.name,
      company: data.company,
      tenantId, // ← Sempre da sessão
      // ...
    }
  });
}
```

**Status:** ✅ Mitigado

---

### Ameaça 2: IDOR (Insecure Direct Object Reference)

**Descrição:** Atacante tenta acessar/modificar recursos de outro tenant via ID.

**Vetor de Ataque:**
```typescript
// Cliente malicioso envia:
fetch('/api/leads/lead-id-da-vitima', {
  method: 'PATCH',
  body: JSON.stringify({ status: 'closed' })
});
```

**Mitigação:**
```typescript
export async function updateLeadStatus(input: { id: string; status: string }) {
  const tenantId = await getCurrentTenantId();
  
  // 1. Validar propriedade ANTES de atualizar
  const existingLead = await prisma.lead.findFirst({
    where: { 
      id: input.id,
      tenantId // ← Validação de propriedade
    }
  });
  
  if (!existingLead) {
    throw new Error('Lead não encontrado ou acesso negado');
  }
  
  // 2. Atualizar com filtro de tenant (defense in depth)
  return prisma.lead.update({
    where: { 
      id: input.id,
      tenantId // ← Filtro adicional
    },
    data: { status: input.status }
  });
}
```

**Status:** ✅ Mitigado

---

### Ameaça 3: Data Leakage via Query sem Filtro

**Descrição:** Desenvolvedor esquece de adicionar filtro de `tenantId` em query.

**Vetor de Ataque:**
```typescript
// ❌ Query sem filtro de tenant
export async function getLeads() {
  return prisma.lead.findMany(); // ← Retorna leads de TODOS os tenants
}
```

**Mitigação:**

**Nível 1: Code Review**
- Code review obrigatório focado em segurança
- Checklist: todas as queries têm filtro de `tenantId`?

**Nível 2: Testes Automatizados**
```typescript
// tests/security/isolation.test.ts
describe('Isolamento de Dados', () => {
  it('deve retornar apenas leads do tenant atual', async () => {
    const tenant1 = await createTenant('Tenant 1');
    const tenant2 = await createTenant('Tenant 2');
    
    await createLead({ tenantId: tenant1.id, name: 'Lead 1' });
    await createLead({ tenantId: tenant2.id, name: 'Lead 2' });
    
    // Mock sessão para tenant1
    mockSession({ tenantId: tenant1.id });
    
    const leads = await getLeads();
    
    expect(leads).toHaveLength(1);
    expect(leads[0].tenantId).toBe(tenant1.id);
  });
});
```

**Nível 3: Prisma Middleware (Futuro)**
```typescript
// src/lib/prisma.ts
prisma.$use(async (params, next) => {
  if (params.model === 'Lead') {
    const tenantId = await getCurrentTenantId();
    
    if (params.action === 'findMany' || params.action === 'findFirst') {
      params.args.where = {
        ...params.args.where,
        tenantId,
      };
    }
  }
  
  return next(params);
});
```

**Status:** ⚠️ Mitigação em camadas (Code Review + Testes)

---

### Ameaça 4: Session Hijacking

**Descrição:** Atacante rouba token de sessão de outro usuário.

**Vetor de Ataque:**
- XSS (Cross-Site Scripting)
- Man-in-the-Middle
- Token exposto em logs

**Mitigação:**

**1. HttpOnly Cookies**
```typescript
// app/api/auth/[...nextauth]/route.ts
export const authOptions = {
  // ...
  cookies: {
    sessionToken: {
      name: '__Secure-next-auth.session-token',
      options: {
        httpOnly: true,  // ← Não acessível via JavaScript
        sameSite: 'strict', // ← Proteção contra CSRF
        secure: true,    // ← Apenas HTTPS
        path: '/',
      },
    },
  },
};
```

**2. Token Rotation**
```typescript
export const authOptions = {
  // ...
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 horas
  },
  callbacks: {
    async jwt({ token, user }) {
      // Rotacionar token a cada 24h
      if (user) {
        token.tenantId = user.tenantId;
        token.iat = Math.floor(Date.now() / 1000);
      }
      return token;
    },
  },
};
```

**3. HTTPS Obrigatório**
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // Redirecionar HTTP para HTTPS em produção
  if (process.env.NODE_ENV === 'production' && 
      request.headers.get('x-forwarded-proto') !== 'https') {
    return NextResponse.redirect(
      `https://${request.headers.get('host')}${request.nextUrl.pathname}`,
      301
    );
  }
}
```

**Status:** ✅ Mitigado

---

### Ameaça 5: SQL Injection

**Descrição:** Atacante tenta injetar SQL malicioso.

**Vetor de Ataque:**
```typescript
// Cliente malicioso envia:
{ name: "'; DROP TABLE Lead; --" }
```

**Mitigação:**

**Prisma usa parametrização automática:**
```typescript
// ✅ SEGURO: Prisma parametriza automaticamente
await prisma.lead.create({
  data: {
    name: userInput, // ← Escapado automaticamente
  }
});

// Equivalente SQL (parametrizado):
// INSERT INTO Lead (name) VALUES (?)
// Parâmetros: ["'; DROP TABLE Lead; --"]
```

**Status:** ✅ Mitigado (Prisma)

---

## Autenticação e Autorização

### Fluxo de Autenticação

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │
       │ 1. POST /api/auth/signin
       │    { email, password }
       ▼
┌──────────────────┐
│   NextAuth.js    │
├──────────────────┤
│ 2. Busca usuário │
│    por email     │
│                  │
│ 3. Valida senha  │
│    (bcrypt)      │
│                  │
│ 4. Busca tenantId│
│    do usuário    │
│                  │
│ 5. Gera token    │
│    JWT com       │
│    tenantId      │
└──────┬───────────┘
       │
       │ 6. Set-Cookie: session-token
       ▼
┌─────────────┐
│   Cliente   │
│  (Browser)  │
└─────────────┘
```

### Estrutura do Token JWT

```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "tenantId": "tenant-id", // ← CRÍTICO
  "role": "admin",
  "iat": 1703520000,
  "exp": 1703606400
}
```

### Validação de Sessão

```typescript
// src/lib/auth.ts
export async function getCurrentTenantId(): Promise<string> {
  const session = await getServerSession(authOptions);
  
  // Validações
  if (!session) {
    throw new Error('Usuário não autenticado');
  }
  
  if (!session.user) {
    throw new Error('Sessão inválida');
  }
  
  if (!session.user.tenantId) {
    throw new Error('Usuário sem tenant associado');
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
```

---

## Roles e Permissões

### Roles Disponíveis

| Role | Permissões |
|------|------------|
| **admin** | Todas as permissões do tenant |
| **user** | CRUD de leads, visualizar dashboard |
| **viewer** | Apenas visualizar (read-only) |

### Validação de Permissões

```typescript
// src/lib/permissions.ts
export async function requireRole(allowedRoles: string[]) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.role) {
    throw new Error('Não autorizado');
  }
  
  if (!allowedRoles.includes(session.user.role)) {
    throw new Error('Permissão negada');
  }
}

// Uso em Server Action
export async function deleteUser(userId: string) {
  await requireRole(['admin']); // Apenas admin pode deletar
  
  const tenantId = await getCurrentTenantId();
  
  // Validar que usuário pertence ao tenant
  const user = await prisma.user.findFirst({
    where: { id: userId, tenantId }
  });
  
  if (!user) {
    throw new Error('Usuário não encontrado');
  }
  
  await prisma.user.delete({ where: { id: userId } });
}
```

---

## Auditoria e Logging

### Logs de Segurança

```typescript
// src/lib/audit.ts
export async function logSecurityEvent(event: {
  type: 'access_denied' | 'data_leakage' | 'suspicious_activity';
  userId?: string;
  tenantId?: string;
  resource: string;
  details: string;
}) {
  console.error('[SECURITY]', {
    timestamp: new Date().toISOString(),
    ...event,
  });
  
  // Enviar para Sentry/Datadog
  // await sentry.captureMessage(`Security: ${event.type}`, {
  //   level: 'error',
  //   extra: event,
  // });
}

// Uso em Server Action
export async function updateLeadStatus(input: { id: string; status: string }) {
  const tenantId = await getCurrentTenantId();
  
  const existingLead = await prisma.lead.findFirst({
    where: { id: input.id, tenantId }
  });
  
  if (!existingLead) {
    // Log de tentativa de acesso inválido
    await logSecurityEvent({
      type: 'access_denied',
      tenantId,
      resource: `Lead:${input.id}`,
      details: 'Tentativa de atualizar lead de outro tenant',
    });
    
    throw new Error('Lead não encontrado ou acesso negado');
  }
  
  // ... atualizar lead
}
```

---

## Testes de Segurança

### Teste 1: Isolamento de Dados

```typescript
// tests/security/isolation.test.ts
describe('Isolamento de Dados', () => {
  it('Tenant A não vê leads do Tenant B', async () => {
    const tenantA = await createTenant('Tenant A');
    const tenantB = await createTenant('Tenant B');
    
    await createLead({ tenantId: tenantA.id, name: 'Lead A' });
    await createLead({ tenantId: tenantB.id, name: 'Lead B' });
    
    mockSession({ tenantId: tenantA.id });
    
    const leads = await getLeads();
    
    expect(leads).toHaveLength(1);
    expect(leads[0].name).toBe('Lead A');
  });
});
```

### Teste 2: IDOR

```typescript
it('Deve prevenir IDOR', async () => {
  const tenantA = await createTenant('Tenant A');
  const tenantB = await createTenant('Tenant B');
  
  const leadB = await createLead({ 
    tenantId: tenantB.id, 
    name: 'Lead B' 
  });
  
  // Tenant A tenta atualizar lead do Tenant B
  mockSession({ tenantId: tenantA.id });
  
  await expect(
    updateLeadStatus({ id: leadB.id, status: 'closed' })
  ).rejects.toThrow('Lead não encontrado ou acesso negado');
});
```

### Teste 3: Validação de Sessão

```typescript
it('Deve rejeitar requisições sem sessão', async () => {
  mockSession(null); // Sem sessão
  
  await expect(getLeads()).rejects.toThrow('Usuário não autenticado');
});
```

---

## Checklist de Segurança

### Pré-Deploy
- [ ] Code review focado em segurança
- [ ] Todas as queries têm filtro de `tenantId`
- [ ] Validação de propriedade em updates/deletes
- [ ] `tenantId` NUNCA vem do cliente
- [ ] Testes de isolamento passando
- [ ] Testes de IDOR passando
- [ ] HttpOnly cookies configurados
- [ ] HTTPS obrigatório em produção
- [ ] Logs de segurança implementados

### Pós-Deploy
- [ ] Monitoramento de tentativas de acesso inválido
- [ ] Alertas configurados (Sentry/Slack)
- [ ] Auditoria de logs de segurança
- [ ] Revisão de permissões

---

## Compliance (LGPD/GDPR)

### Requisitos

| Requisito | Implementação | Status |
|-----------|---------------|--------|
| **Isolamento de Dados** | Row-Level Security | ✅ Implementado |
| **Direito ao Esquecimento** | Cascade delete de tenant | ✅ Implementado |
| **Exportação de Dados** | API de exportação | ⏳ Planejado |
| **Logs de Auditoria** | Logging de acessos | ⏳ Planejado |
| **Consentimento** | Termo de uso no signup | ⏳ Planejado |

### Exportação de Dados

```typescript
export async function exportTenantData(tenantId: string) {
  await requireRole(['admin']);
  
  const currentTenantId = await getCurrentTenantId();
  
  if (currentTenantId !== tenantId) {
    throw new Error('Acesso negado');
  }
  
  const data = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      leads: true,
      users: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          // Não incluir password
        }
      }
    }
  });
  
  return JSON.stringify(data, null, 2);
}
```

---

## Próximos Passos

1. **Implementar Autenticação:** NextAuth.js com `tenantId` no token
2. **Implementar Validações:** Validação de propriedade em todas as operações
3. **Implementar Testes:** Testes de isolamento e IDOR
4. **Implementar Auditoria:** Logs de segurança

---

**Próximo Documento:** [04-database-schema.md](04-database-schema.md)

