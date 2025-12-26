# Guia de Implementação Passo a Passo

**Versão:** 1.0  
**Data:** 25/12/2025  
**Arquiteto:** Alex  
**Status:** 🟢 Pronto para Execução

---

## Introdução

Este guia fornece instruções detalhadas para implementar multi-tenancy no CRM B2B FourSys, dividido em fases executáveis.

---

## FASE 1: PREPARAÇÃO (30 minutos)

### Passo 1.1: Backup do Banco de Dados

```bash
# SQLite
cp prisma/dev.db prisma/dev.db.backup

# PostgreSQL
pg_dump -U user -d crm_foursys > backup_$(date +%Y%m%d).sql
```

**Validação:**
- [ ] Arquivo de backup criado
- [ ] Tamanho do backup > 0 bytes

---

### Passo 1.2: Criar Branch

```bash
git checkout -b feature/multi-tenancy
git push -u origin feature/multi-tenancy
```

**Validação:**
- [ ] Branch criada
- [ ] Branch pushed para remoto

---

### Passo 1.3: Verificar Dependências

```bash
# Verificar versões
node --version  # >= 18.x
npm --version   # >= 9.x

# Verificar Prisma
npx prisma --version  # >= 5.x
```

**Validação:**
- [ ] Node.js >= 18.x
- [ ] Prisma >= 5.x

---

## FASE 2: SCHEMA E MIGRATIONS (2-3 horas)

### Passo 2.1: Atualizar Schema Prisma

**Arquivo:** `prisma/schema.prisma`

```prisma
// Adicionar ao final do arquivo

model Tenant {
  id        String   @id @default(uuid())
  name      String
  slug      String   @unique
  domain    String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  leads     Lead[]
  users     User[]
  
  @@index([slug])
  @@index([isActive])
}

model User {
  id        String   @id @default(uuid())
  tenantId  String
  email     String   @unique
  name      String
  password  String
  role      String   @default("user")
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  @@index([tenantId])
  @@index([email])
  @@index([tenantId, role])
}
```

**Modificar model Lead:**

```prisma
model Lead {
  id          String   @id @default(uuid())
  tenantId    String   // ← ADICIONAR
  name        String
  company     String
  status      String
  value       Float
  aiScore     Int
  email       String?
  phone       String?
  lastContact DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade) // ← ADICIONAR
  
  @@index([status])
  @@index([aiScore])
  @@index([tenantId])            // ← ADICIONAR
  @@index([tenantId, status])    // ← ADICIONAR
  @@index([tenantId, aiScore])   // ← ADICIONAR
  @@index([tenantId, createdAt]) // ← ADICIONAR
}
```

**Validação:**
- [ ] Models `Tenant` e `User` adicionados
- [ ] Campo `tenantId` adicionado ao `Lead`
- [ ] Relação `tenant` adicionada ao `Lead`
- [ ] Índices adicionados

---

### Passo 2.2: Criar Migration

```bash
# Criar migration
npx prisma migrate dev --name add_multi_tenancy

# Gerar Prisma Client
npx prisma generate
```

**Validação:**
- [ ] Migration criada em `prisma/migrations/`
- [ ] Prisma Client gerado
- [ ] Sem erros de compilação

---

### Passo 2.3: Migrar Dados Existentes

**Criar arquivo:** `prisma/migrations/assign-default-tenant.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Iniciando migração de dados...');
  
  // 1. Criar tenant default
  const defaultTenant = await prisma.tenant.upsert({
    where: { slug: 'default' },
    update: {},
    create: {
      id: 'default-tenant-id',
      name: 'FourSys (Default)',
      slug: 'default',
      isActive: true,
    },
  });
  
  console.log('✅ Tenant default criado:', defaultTenant.id);
  
  // 2. Contar leads órfãos
  const orphanCount = await prisma.lead.count({
    where: { tenantId: null }
  });
  
  console.log(`📊 Leads órfãos encontrados: ${orphanCount}`);
  
  // 3. Associar leads órfãos
  const result = await prisma.lead.updateMany({
    where: { tenantId: null },
    data: { tenantId: defaultTenant.id },
  });
  
  console.log(`✅ ${result.count} leads migrados`);
  
  // 4. Validar
  const remainingOrphans = await prisma.lead.count({
    where: { tenantId: null }
  });
  
  if (remainingOrphans > 0) {
    throw new Error(`❌ Ainda existem ${remainingOrphans} leads órfãos!`);
  }
  
  console.log('✅ Migração concluída!');
}

main()
  .catch((error) => {
    console.error('❌ Erro:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

**Executar:**

```bash
npx ts-node prisma/migrations/assign-default-tenant.ts
```

**Validação:**
- [ ] Tenant default criado
- [ ] Todos os leads têm `tenantId`
- [ ] Query `SELECT COUNT(*) FROM Lead WHERE tenantId IS NULL` retorna 0

---

### Passo 2.4: Verificar no Prisma Studio

```bash
npx prisma studio
```

**Validação:**
- [ ] Tabela `Tenant` existe
- [ ] Tabela `User` existe
- [ ] Coluna `tenantId` em `Lead`
- [ ] Tenant default visível
- [ ] Leads associados ao tenant default

---

## FASE 3: SERVER ACTIONS (3-4 horas)

### Passo 3.1: Adicionar Função de Contexto

**Arquivo:** `src/app/actions/leads.ts`

**Adicionar no topo (após imports):**

```typescript
/**
 * Obter tenantId do contexto da requisição
 */
async function getCurrentTenantId(): Promise<string> {
  // FASE 1 (MVP): Hardcoded para testes
  return 'default-tenant-id';
  
  // FASE 2: Descomentar quando auth estiver pronto
  // const session = await getServerSession(authOptions);
  // if (!session?.user?.tenantId) {
  //   throw new Error('Usuário não autenticado ou sem tenant');
  // }
  // return session.user.tenantId;
}
```

**Validação:**
- [ ] Função adicionada
- [ ] Sem erros de compilação

---

### Passo 3.2: Modificar `getLeads()`

**Antes:**
```typescript
export async function getLeads(): Promise<Lead[]> {
  const leads = await prisma.lead.findMany({
    orderBy: [
      { aiScore: 'desc' },
      { createdAt: 'desc' }
    ]
  });
  return leads as Lead[];
}
```

**Depois:**
```typescript
export async function getLeads(): Promise<Lead[]> {
  const tenantId = await getCurrentTenantId(); // ← ADICIONAR
  
  const leads = await prisma.lead.findMany({
    where: { tenantId }, // ← ADICIONAR
    orderBy: [
      { aiScore: 'desc' },
      { createdAt: 'desc' }
    ]
  });
  return leads as Lead[];
}
```

**Validação:**
- [ ] Filtro `where: { tenantId }` adicionado
- [ ] Sem erros de compilação

---

### Passo 3.3: Modificar `createLead()`

**Adicionar após validação:**

```typescript
const tenantId = await getCurrentTenantId(); // ← ADICIONAR

const lead = await prisma.lead.create({
  data: {
    ...validatedData,
    tenantId, // ← ADICIONAR
    aiScore,
  }
});
```

**Validação:**
- [ ] `tenantId` adicionado aos dados
- [ ] Sem erros de compilação

---

### Passo 3.4: Modificar `updateLeadStatus()`

**Adicionar após validação:**

```typescript
const tenantId = await getCurrentTenantId(); // ← ADICIONAR

// Validar propriedade
const existingLead = await prisma.lead.findFirst({
  where: { 
    id: validatedInput.id,
    tenantId // ← ADICIONAR
  }
});

if (!existingLead) {
  throw new Error('Lead não encontrado ou acesso negado');
}

// Atualizar
const lead = await prisma.lead.update({
  where: { 
    id: validatedInput.id,
    tenantId // ← ADICIONAR
  },
  data: { 
    status: validatedInput.status,
    lastContact: new Date()
  }
});
```

**Validação:**
- [ ] Validação de propriedade adicionada
- [ ] Filtro no update adicionado
- [ ] Sem erros de compilação

---

### Passo 3.5: Modificar `getDashboardMetrics()`

**Adicionar filtro em ambas as queries:**

```typescript
const tenantId = await getCurrentTenantId(); // ← ADICIONAR

const pipelineResult = await prisma.lead.aggregate({
  where: {
    tenantId, // ← ADICIONAR
    status: { not: 'closed' }
  },
  _sum: { value: true }
});

const activeLeads = await prisma.lead.count({
  where: {
    tenantId, // ← ADICIONAR
    status: { not: 'closed' }
  }
});
```

**Validação:**
- [ ] Filtro adicionado em aggregate
- [ ] Filtro adicionado em count
- [ ] Sem erros de compilação

---

### Passo 3.6: Modificar `deleteLead()`

**Adicionar validação:**

```typescript
const tenantId = await getCurrentTenantId(); // ← ADICIONAR

await prisma.lead.delete({
  where: { 
    id,
    tenantId // ← ADICIONAR
  }
});
```

**Validação:**
- [ ] Filtro adicionado
- [ ] Sem erros de compilação

---

### Passo 3.7: Criar `tenants.ts`

**Criar arquivo:** `src/app/actions/tenants.ts`

**Copiar código completo de:** [05-server-actions-spec.md](05-server-actions-spec.md#arquivo-srcappactionstenantsts-novo)

**Validação:**
- [ ] Arquivo criado
- [ ] Funções implementadas
- [ ] Sem erros de compilação

---

### Passo 3.8: Compilar e Testar

```bash
# Compilar
npm run build

# Iniciar servidor
npm run dev
```

**Validação:**
- [ ] Build sem erros
- [ ] Servidor inicia sem erros
- [ ] Dashboard carrega
- [ ] Kanban carrega
- [ ] Leads são exibidos

---

## FASE 4: TESTES DE SEGURANÇA (2-3 horas)

### Passo 4.1: Criar Testes de Isolamento

**Criar arquivo:** `tests/security/isolation.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { prisma } from '@/lib/prisma';
import { getLeads, updateLeadStatus } from '@/app/actions/leads';

describe('Isolamento de Dados', () => {
  let tenant1Id: string;
  let tenant2Id: string;
  let lead1Id: string;
  let lead2Id: string;
  
  beforeAll(async () => {
    // Criar tenants de teste
    const tenant1 = await prisma.tenant.create({
      data: { name: 'Tenant 1', slug: 'tenant1' }
    });
    const tenant2 = await prisma.tenant.create({
      data: { name: 'Tenant 2', slug: 'tenant2' }
    });
    
    tenant1Id = tenant1.id;
    tenant2Id = tenant2.id;
    
    // Criar leads
    const lead1 = await prisma.lead.create({
      data: {
        tenantId: tenant1Id,
        name: 'Lead 1',
        company: 'Company 1',
        status: 'prospect',
        value: 1000,
        aiScore: 50,
      }
    });
    
    const lead2 = await prisma.lead.create({
      data: {
        tenantId: tenant2Id,
        name: 'Lead 2',
        company: 'Company 2',
        status: 'prospect',
        value: 2000,
        aiScore: 60,
      }
    });
    
    lead1Id = lead1.id;
    lead2Id = lead2.id;
  });
  
  afterAll(async () => {
    // Limpar dados de teste
    await prisma.lead.deleteMany({
      where: { tenantId: { in: [tenant1Id, tenant2Id] } }
    });
    await prisma.tenant.deleteMany({
      where: { id: { in: [tenant1Id, tenant2Id] } }
    });
    await prisma.$disconnect();
  });
  
  it('deve retornar apenas leads do tenant atual', async () => {
    // Mock getCurrentTenantId para retornar tenant1Id
    jest.spyOn(global, 'getCurrentTenantId').mockResolvedValue(tenant1Id);
    
    const leads = await getLeads();
    
    expect(leads).toHaveLength(1);
    expect(leads[0].tenantId).toBe(tenant1Id);
    expect(leads[0].name).toBe('Lead 1');
  });
  
  it('não deve permitir atualizar lead de outro tenant', async () => {
    // Mock getCurrentTenantId para retornar tenant1Id
    jest.spyOn(global, 'getCurrentTenantId').mockResolvedValue(tenant1Id);
    
    // Tentar atualizar lead do tenant2
    await expect(
      updateLeadStatus({ id: lead2Id, status: 'qualified' })
    ).rejects.toThrow('Lead não encontrado ou acesso negado');
  });
});
```

**Executar:**

```bash
npm test -- tests/security/isolation.test.ts
```

**Validação:**
- [ ] Todos os testes passam
- [ ] Isolamento confirmado

---

## FASE 5: AUTENTICAÇÃO (4-6 horas) - OPCIONAL

### Passo 5.1: Instalar NextAuth.js

```bash
npm install next-auth@beta
npm install bcrypt
npm install --save-dev @types/bcrypt
```

### Passo 5.2: Configurar NextAuth.js

**Criar arquivo:** `src/app/api/auth/[...nextauth]/route.ts`

```typescript
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export const authOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' }
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });
        
        if (!user) return null;
        
        const valid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        
        if (!valid) return null;
        
        return {
          id: user.id,
          email: user.email,
          tenantId: user.tenantId,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.tenantId = user.tenantId;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.tenantId = token.tenantId;
      return session;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### Passo 5.3: Atualizar `getCurrentTenantId()`

**Em `src/app/actions/leads.ts`:**

```typescript
async function getCurrentTenantId(): Promise<string> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.tenantId) {
    throw new Error('Usuário não autenticado ou sem tenant');
  }
  
  return session.user.tenantId;
}
```

**Validação:**
- [ ] Auth configurado
- [ ] Login funcional
- [ ] `tenantId` na sessão

---

## Checklist Final

### Funcionalidade
- [ ] Dashboard carrega dados do tenant
- [ ] Kanban mostra apenas leads do tenant
- [ ] Criar lead adiciona `tenantId` automaticamente
- [ ] Atualizar lead valida propriedade
- [ ] Deletar lead valida propriedade

### Segurança
- [ ] Todas as queries têm filtro de `tenantId`
- [ ] `tenantId` NUNCA vem do cliente
- [ ] Validação de propriedade em updates/deletes
- [ ] Testes de isolamento passando

### Performance
- [ ] Índices criados
- [ ] Queries < 200ms

---

**Próximo Documento:** [14-testing-strategy.md](14-testing-strategy.md)

