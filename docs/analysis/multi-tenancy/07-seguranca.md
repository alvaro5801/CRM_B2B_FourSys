# Segurança em Multi-tenancy

**Versão:** 1.0  
**Data:** 25/12/2025  
**Analista:** Mary (Business Analyst)

---

## 1. VISÃO GERAL

**Prioridade:** 🔴 CRÍTICA

Multi-tenancy introduz riscos de segurança específicos que podem levar a **vazamento de dados entre tenants**. Este documento detalha vulnerabilidades e mitigações.

---

## 2. VULNERABILIDADES PRINCIPAIS

### 2.1 Tenant ID Spoofing

#### Descrição
Usuário malicioso envia `tenantId` diferente no payload da requisição para acessar dados de outro tenant.

#### Exemplo de Ataque

```typescript
// ❌ CÓDIGO VULNERÁVEL
export async function createLead(data: CreateLeadInput & { tenantId: string }) {
  // Aceita tenantId do cliente - PERIGO!
  await prisma.lead.create({ data });
}

// Atacante envia:
fetch('/api/leads', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Lead Malicioso',
    company: 'Hacker Corp',
    tenantId: 'tenant-da-vitima', // ← SPOOFING!
    // ... outros campos
  })
});
```

#### Mitigação ✅

```typescript
// ✅ CÓDIGO SEGURO
export async function createLead(data: CreateLeadInput) {
  // tenantId vem APENAS da sessão, nunca do cliente
  const tenantId = await getCurrentTenantId();
  
  await prisma.lead.create({
    data: {
      ...data,
      tenantId // ← De fonte confiável
    }
  });
}
```

**Regra de Ouro:** NUNCA aceitar `tenantId` como input do cliente.

---

### 2.2 Cross-Tenant Data Leakage

#### Descrição
Query sem filtro de `tenantId` expõe dados de todos os tenants.

#### Exemplo de Ataque

```typescript
// ❌ CÓDIGO VULNERÁVEL
export async function searchLeads(query: string) {
  // Busca em TODOS os tenants - PERIGO!
  return await prisma.lead.findMany({
    where: {
      name: { contains: query }
      // FALTA: tenantId filter
    }
  });
}

// Atacante busca por "João" e vê leads de todos os tenants
```

#### Mitigação ✅

```typescript
// ✅ CÓDIGO SEGURO
export async function searchLeads(query: string) {
  const tenantId = await getCurrentTenantId();
  
  return await prisma.lead.findMany({
    where: {
      tenantId, // ← SEMPRE filtrar por tenant
      name: { contains: query }
    }
  });
}
```

**Regra de Ouro:** TODA query deve incluir `where: { tenantId }`.

---

### 2.3 Insecure Direct Object Reference (IDOR)

#### Descrição
Usuário acessa lead de outro tenant via ID direto na URL.

#### Exemplo de Ataque

```typescript
// ❌ CÓDIGO VULNERÁVEL
export async function updateLead(id: string, data: UpdateLeadInput) {
  // Atualiza lead sem verificar propriedade - PERIGO!
  return await prisma.lead.update({
    where: { id },
    data
  });
}

// Atacante descobre ID de lead de outro tenant e atualiza
fetch('/api/leads/abc-123-xyz', {
  method: 'PATCH',
  body: JSON.stringify({ value: 0 }) // Sabota lead da vítima
});
```

#### Mitigação ✅

```typescript
// ✅ CÓDIGO SEGURO
export async function updateLead(id: string, data: UpdateLeadInput) {
  const tenantId = await getCurrentTenantId();
  
  // Validar propriedade ANTES de atualizar
  const lead = await prisma.lead.findFirst({
    where: { id, tenantId }
  });
  
  if (!lead) {
    throw new Error('Lead não encontrado ou acesso negado');
  }
  
  return await prisma.lead.update({
    where: { id, tenantId }, // Defense in depth
    data
  });
}
```

**Regra de Ouro:** SEMPRE validar propriedade antes de operações.

---

### 2.4 Session Hijacking

#### Descrição
Atacante rouba token de sessão e acessa dados do tenant da vítima.

#### Mitigação ✅

```typescript
// Usar biblioteca de autenticação segura
import { getServerSession } from 'next-auth';

async function getCurrentTenantId(): Promise<string> {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    throw new Error('Não autenticado');
  }
  
  // Validar integridade do token
  if (!session.user?.tenantId) {
    throw new Error('Sessão inválida');
  }
  
  return session.user.tenantId;
}
```

**Medidas Adicionais:**
- ✅ HTTPS obrigatório
- ✅ HttpOnly cookies
- ✅ SameSite=Strict
- ✅ Token rotation
- ✅ Session timeout (15-30 min)

---

### 2.5 SQL Injection via tenantId

#### Descrição
Se `tenantId` for construído dinamicamente, pode haver SQL injection.

#### Exemplo de Ataque

```typescript
// ❌ CÓDIGO VULNERÁVEL (raw SQL)
const tenantId = req.headers.get('x-tenant-id'); // Do cliente!
const query = `SELECT * FROM Lead WHERE tenantId = '${tenantId}'`; // PERIGO!

// Atacante envia: x-tenant-id: ' OR '1'='1
// Query resultante: SELECT * FROM Lead WHERE tenantId = '' OR '1'='1'
// Retorna TODOS os leads
```

#### Mitigação ✅

```typescript
// ✅ CÓDIGO SEGURO (Prisma com parametrização)
const tenantId = await getCurrentTenantId(); // De sessão

const leads = await prisma.lead.findMany({
  where: { tenantId } // Prisma parametriza automaticamente
});
```

**Regra de Ouro:** Usar ORM (Prisma) que parametriza queries automaticamente.

---

## 3. CHECKLIST DE SEGURANÇA

### 3.1 Validações Obrigatórias

- [ ] **NUNCA** aceitar `tenantId` do cliente (body, query params, headers)
- [ ] **SEMPRE** obter `tenantId` da sessão autenticada
- [ ] **SEMPRE** incluir `where: { tenantId }` em queries
- [ ] **SEMPRE** validar propriedade antes de update/delete
- [ ] **SEMPRE** usar HTTPS em produção
- [ ] **SEMPRE** usar HttpOnly cookies para sessão

### 3.2 Code Review Checklist

Ao revisar código, verificar:

```typescript
// ❌ RED FLAGS
- Aceita tenantId como parâmetro de função
- Query sem filtro de tenantId
- Update/Delete sem validação de propriedade
- Raw SQL queries
- Headers/cookies acessados diretamente

// ✅ GREEN FLAGS
- tenantId vem de getCurrentTenantId()
- Todas as queries têm where: { tenantId }
- Validação de propriedade antes de operações
- Uso de Prisma (ORM)
- Autenticação via biblioteca testada
```

---

## 4. PRISMA MIDDLEWARE (AVANÇADO)

### 4.1 Filtro Automático de Tenant

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Middleware para adicionar filtro de tenant automaticamente
prisma.$use(async (params, next) => {
  // Apenas para model Lead (adicionar outros models conforme necessário)
  if (params.model === 'Lead') {
    const tenantId = await getCurrentTenantId();
    
    // Queries de leitura
    if (params.action === 'findMany' || params.action === 'findFirst') {
      params.args.where = {
        ...params.args.where,
        tenantId
      };
    }
    
    // Queries de escrita
    if (params.action === 'create') {
      params.args.data = {
        ...params.args.data,
        tenantId
      };
    }
    
    // Update e Delete
    if (params.action === 'update' || params.action === 'delete') {
      params.args.where = {
        ...params.args.where,
        tenantId
      };
    }
  }
  
  return next(params);
});

export { prisma };
```

**Vantagens:**
- ✅ Filtro automático (menos chance de esquecer)
- ✅ Centralizado (um lugar para manter)
- ✅ Defense in depth

**Desvantagens:**
- ⚠️ Complexidade adicional
- ⚠️ Pode mascarar bugs (filtro silencioso)
- ⚠️ Dificulta debugging

**Recomendação:** Usar apenas se equipe é experiente com Prisma.

---

## 5. TESTES DE SEGURANÇA

### 5.1 Teste de Isolamento

```typescript
// tests/security/isolation.test.ts
describe('Multi-tenancy Security', () => {
  let tenant1Id: string;
  let tenant2Id: string;
  let lead1Id: string;
  let lead2Id: string;
  
  beforeAll(async () => {
    // Criar 2 tenants
    const tenant1 = await prisma.tenant.create({
      data: { name: 'Tenant 1', slug: 'tenant1' }
    });
    const tenant2 = await prisma.tenant.create({
      data: { name: 'Tenant 2', slug: 'tenant2' }
    });
    
    tenant1Id = tenant1.id;
    tenant2Id = tenant2.id;
    
    // Criar lead para cada tenant
    const lead1 = await prisma.lead.create({
      data: {
        tenantId: tenant1Id,
        name: 'Lead Tenant 1',
        company: 'Company 1',
        status: 'prospect',
        value: 1000,
        aiScore: 50,
      }
    });
    
    const lead2 = await prisma.lead.create({
      data: {
        tenantId: tenant2Id,
        name: 'Lead Tenant 2',
        company: 'Company 2',
        status: 'prospect',
        value: 2000,
        aiScore: 60,
      }
    });
    
    lead1Id = lead1.id;
    lead2Id = lead2.id;
  });
  
  it('deve retornar apenas leads do tenant atual', async () => {
    // Mock: usuário do tenant 1
    jest.spyOn(global, 'getCurrentTenantId').mockResolvedValue(tenant1Id);
    
    const leads = await getLeads();
    
    expect(leads).toHaveLength(1);
    expect(leads[0].id).toBe(lead1Id);
    expect(leads[0].tenantId).toBe(tenant1Id);
  });
  
  it('NÃO deve permitir atualizar lead de outro tenant (IDOR)', async () => {
    // Mock: usuário do tenant 1 tenta atualizar lead do tenant 2
    jest.spyOn(global, 'getCurrentTenantId').mockResolvedValue(tenant1Id);
    
    await expect(
      updateLeadStatus({ id: lead2Id, status: 'qualified' })
    ).rejects.toThrow('Lead não encontrado ou acesso negado');
  });
  
  it('NÃO deve permitir deletar lead de outro tenant', async () => {
    jest.spyOn(global, 'getCurrentTenantId').mockResolvedValue(tenant1Id);
    
    await expect(
      deleteLead(lead2Id)
    ).rejects.toThrow();
  });
  
  it('NÃO deve permitir criar lead com tenantId diferente', async () => {
    jest.spyOn(global, 'getCurrentTenantId').mockResolvedValue(tenant1Id);
    
    const lead = await createLead({
      name: 'New Lead',
      company: 'New Company',
      status: 'prospect',
      value: 5000,
    });
    
    // Deve ter tenantId do usuário autenticado, não outro
    expect(lead.tenantId).toBe(tenant1Id);
  });
});
```

---

### 5.2 Teste de Spoofing

```typescript
it('NÃO deve aceitar tenantId do cliente', async () => {
  // Simular requisição maliciosa
  const maliciousData = {
    name: 'Hacker Lead',
    company: 'Evil Corp',
    status: 'prospect',
    value: 99999,
    tenantId: 'tenant-da-vitima', // ← Tentativa de spoofing
  };
  
  // Mock: usuário do tenant1
  jest.spyOn(global, 'getCurrentTenantId').mockResolvedValue(tenant1Id);
  
  // @ts-expect-error - tenantId não deve ser aceito
  const lead = await createLead(maliciousData);
  
  // Deve ter tenantId da sessão, não do payload
  expect(lead.tenantId).toBe(tenant1Id);
  expect(lead.tenantId).not.toBe('tenant-da-vitima');
});
```

---

## 6. AUDITORIA E LOGGING

### 6.1 Logs de Acesso

```typescript
// src/lib/audit.ts
export async function logAccess(action: string, resourceId: string) {
  const tenantId = await getCurrentTenantId();
  const userId = await getCurrentUserId();
  
  await prisma.auditLog.create({
    data: {
      tenantId,
      userId,
      action,
      resourceId,
      timestamp: new Date(),
      ipAddress: getClientIp(),
    }
  });
}

// Usar em Server Actions
export async function updateLeadStatus(input: UpdateLeadStatusInput) {
  const tenantId = await getCurrentTenantId();
  
  // ... validações ...
  
  const lead = await prisma.lead.update({ /* ... */ });
  
  // Log de auditoria
  await logAccess('UPDATE_LEAD_STATUS', lead.id);
  
  return lead;
}
```

---

### 6.2 Alertas de Segurança

```typescript
// Detectar tentativas de acesso cruzado
export async function detectCrossTenantAccess(
  requestedResourceId: string,
  resourceTenantId: string
) {
  const currentTenantId = await getCurrentTenantId();
  
  if (resourceTenantId !== currentTenantId) {
    // ALERTA: Tentativa de acesso cruzado!
    await prisma.securityAlert.create({
      data: {
        type: 'CROSS_TENANT_ACCESS_ATTEMPT',
        tenantId: currentTenantId,
        targetTenantId: resourceTenantId,
        resourceId: requestedResourceId,
        timestamp: new Date(),
      }
    });
    
    // Notificar equipe de segurança
    await notifySecurityTeam({
      alert: 'Tentativa de acesso cruzado detectada',
      tenant: currentTenantId,
      target: resourceTenantId,
    });
  }
}
```

---

## 7. COMPLIANCE (LGPD/GDPR)

### 7.1 Direito ao Esquecimento

```typescript
// Deletar todos os dados de um tenant
export async function deleteTenantData(tenantId: string) {
  // Validar que usuário tem permissão (admin)
  const isAdmin = await isUserAdmin();
  if (!isAdmin) {
    throw new Error('Acesso negado');
  }
  
  // Deletar em cascata (graças ao onDelete: Cascade no schema)
  await prisma.tenant.delete({
    where: { id: tenantId }
  });
  
  // Logs de auditoria
  await logDataDeletion(tenantId);
}
```

---

### 7.2 Exportação de Dados

```typescript
// Exportar todos os dados de um tenant
export async function exportTenantData(tenantId: string) {
  const currentTenantId = await getCurrentTenantId();
  
  // Validar que usuário pertence ao tenant
  if (currentTenantId !== tenantId) {
    throw new Error('Acesso negado');
  }
  
  const [tenant, leads] = await Promise.all([
    prisma.tenant.findUnique({ where: { id: tenantId } }),
    prisma.lead.findMany({ where: { tenantId } }),
  ]);
  
  return {
    tenant,
    leads,
    exportedAt: new Date(),
  };
}
```

---

## 8. RECOMENDAÇÕES FINAIS

### 8.1 Prioridade Alta
- ✅ Implementar validação de `tenantId` em TODAS as Server Actions
- ✅ Code review rigoroso focado em segurança
- ✅ Testes automatizados de isolamento
- ✅ HTTPS obrigatório em produção

### 8.2 Prioridade Média
- ⏳ Implementar auditoria de acessos
- ⏳ Alertas de tentativas de acesso cruzado
- ⏳ Prisma Middleware (se equipe experiente)

### 8.3 Prioridade Baixa
- 📋 Penetration testing
- 📋 Bug bounty program
- 📋 Security headers (CSP, HSTS, etc.)

---

**Próximo Documento:** [08-performance.md](08-performance.md)



