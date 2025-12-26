# Arquitetura de Dados

**Versão:** 1.0  
**Data:** 25/12/2025  
**Arquiteto:** Alex  
**Status:** 🟢 Aprovado

---

## Introdução

Este documento descreve a arquitetura de dados completa para o sistema multi-tenant, incluindo modelos, relacionamentos, índices e estratégias de isolamento.

---

## Diagrama de Relacionamentos (ERD)

```
┌─────────────────────────────────────┐
│            Tenant                   │
│─────────────────────────────────────│
│ id          String (PK, UUID)       │
│ name        String                  │
│ slug        String (UNIQUE)         │
│ domain      String? (NULLABLE)      │
│ isActive    Boolean (DEFAULT true)  │
│ createdAt   DateTime                │
│ updatedAt   DateTime                │
└───────────┬─────────────────────────┘
            │
            │ 1:N
            │
    ┌───────┴────────────────┐
    │                        │
┌───▼──────────────┐   ┌─────▼────────────┐
│      Lead        │   │      User        │
│──────────────────│   │──────────────────│
│ id        (PK)   │   │ id        (PK)   │
│ tenantId  (FK)   │   │ tenantId  (FK)   │
│ name             │   │ email     (UQ)   │
│ company          │   │ name             │
│ status           │   │ password         │
│ value            │   │ role             │
│ aiScore          │   │ isActive         │
│ email            │   │ createdAt        │
│ phone            │   │ updatedAt        │
│ lastContact      │   └──────────────────┘
│ createdAt        │
│ updatedAt        │
└──────────────────┘
```

---

## Modelos de Dados

### Model: Tenant

**Propósito:** Representa uma empresa cliente (inquilino) que usa o sistema.

**Características:**
- Identificador único (UUID)
- Slug único para URLs (e.g., subdomain)
- Soft delete via `isActive`
- Timestamps automáticos

**Schema Prisma:**
```prisma
model Tenant {
  id        String   @id @default(uuid())
  name      String   // Nome da empresa (ex: "FourSys Ltda")
  slug      String   @unique // URL-friendly (ex: "foursys")
  domain    String?  // Domínio customizado (ex: "crm.foursys.com")
  isActive  Boolean  @default(true) // Soft delete
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relações
  leads     Lead[]
  users     User[]
  
  // Índices
  @@index([slug])     // Busca por slug
  @@index([isActive]) // Filtrar ativos
}
```

**Regras de Negócio:**
- `slug` deve ser único e URL-safe (apenas letras, números, hífen)
- `slug` é gerado automaticamente do `name` no signup
- `domain` é opcional (recurso premium)
- `isActive = false` desativa tenant sem deletar dados

**Exemplo de Dados:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "FourSys Ltda",
  "slug": "foursys",
  "domain": null,
  "isActive": true,
  "createdAt": "2025-12-25T10:00:00.000Z",
  "updatedAt": "2025-12-25T10:00:00.000Z"
}
```

---

### Model: Lead (Atualizado)

**Propósito:** Representa um lead de vendas pertencente a um tenant.

**Mudanças para Multi-tenancy:**
- ✅ Adicionado campo `tenantId` (FK obrigatória)
- ✅ Adicionada relação com `Tenant`
- ✅ Adicionados índices compostos com `tenantId`
- ✅ Cascade delete (se tenant deletado, leads também)

**Schema Prisma:**
```prisma
model Lead {
  id          String   @id @default(uuid())
  tenantId    String   // ← NOVO: Foreign Key para Tenant
  name        String   // Nome do Cliente
  company     String   // Nome da Empresa
  status      String   // 'prospect' | 'qualified' | 'proposal' | 'closed'
  value       Float    // Valor Estimado em R$
  aiScore     Int      // Score de IA (0-100)
  email       String?  // Email (opcional)
  phone       String?  // Telefone (opcional)
  lastContact DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relação com Tenant
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  // Índices CRÍTICOS para performance
  @@index([status])              // Índice existente
  @@index([aiScore])             // Índice existente
  @@index([tenantId])            // ← NOVO: Query básica por tenant
  @@index([tenantId, status])    // ← NOVO: Kanban board
  @@index([tenantId, aiScore])   // ← NOVO: Ordenação por score
  @@index([tenantId, createdAt]) // ← NOVO: Ordenação por data
}
```

**Regras de Negócio:**
- `tenantId` é **obrigatório** e **imutável**
- `tenantId` NUNCA vem do cliente (sempre da sessão)
- Cascade delete: se tenant deletado, leads também são deletados
- Validação de `status` feita na aplicação (não no DB)

**Exemplo de Dados:**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "tenantId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "João Silva",
  "company": "Tech Solutions",
  "status": "qualified",
  "value": 15000.00,
  "aiScore": 85,
  "email": "joao@techsolutions.com",
  "phone": "+55 11 98765-4321",
  "lastContact": "2025-12-25T14:30:00.000Z",
  "createdAt": "2025-12-20T10:00:00.000Z",
  "updatedAt": "2025-12-25T14:30:00.000Z"
}
```

---

### Model: User (Novo)

**Propósito:** Representa um usuário que pertence a um tenant.

**Características:**
- Associado a um tenant
- Email único no sistema
- Senha hasheada (bcrypt)
- Roles: admin, user, viewer
- Soft delete via `isActive`

**Schema Prisma:**
```prisma
model User {
  id        String   @id @default(uuid())
  tenantId  String   // Foreign Key para Tenant
  email     String   @unique // Email único no sistema
  name      String   // Nome completo do usuário
  password  String   // Senha hasheada (bcrypt)
  role      String   @default("user") // 'admin' | 'user' | 'viewer'
  isActive  Boolean  @default(true) // Soft delete
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relação com Tenant
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  // Índices
  @@index([tenantId])        // Listar usuários do tenant
  @@index([email])           // Login por email
  @@index([tenantId, role])  // Filtrar por role
}
```

**Regras de Negócio:**
- `email` deve ser único no sistema (não por tenant)
- `password` deve ser hasheada com bcrypt (salt rounds: 10)
- Primeiro usuário do tenant é sempre `admin`
- `role = 'admin'` pode gerenciar outros usuários do tenant
- Cascade delete: se tenant deletado, usuários também

**Exemplo de Dados:**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "tenantId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "admin@foursys.com",
  "name": "Maria Administradora",
  "password": "$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
  "role": "admin",
  "isActive": true,
  "createdAt": "2025-12-25T10:00:00.000Z",
  "updatedAt": "2025-12-25T10:00:00.000Z"
}
```

---

## Estratégia de Isolamento

### Princípio: Row-Level Security

**Definição:** Cada linha (row) de dados contém um identificador de tenant (`tenantId`), garantindo isolamento lógico.

**Implementação:**
```typescript
// ✅ CORRETO: Query com filtro de tenant
const leads = await prisma.lead.findMany({
  where: { tenantId: currentTenantId }
});

// ❌ ERRADO: Query sem filtro de tenant
const leads = await prisma.lead.findMany();
```

### Validação de Propriedade

**Princípio:** Antes de atualizar/deletar, validar que o recurso pertence ao tenant.

**Implementação:**
```typescript
// Validar propriedade antes de atualizar
const existingLead = await prisma.lead.findFirst({
  where: { 
    id: leadId,
    tenantId: currentTenantId // ← Validação de propriedade
  }
});

if (!existingLead) {
  throw new Error('Lead não encontrado ou acesso negado');
}

// Agora é seguro atualizar
await prisma.lead.update({
  where: { id: leadId },
  data: { status: newStatus }
});
```

### Defense in Depth

**Princípio:** Múltiplas camadas de segurança.

**Camadas:**
1. **Sessão:** `tenantId` vem da sessão (não do cliente)
2. **Server Actions:** Filtro obrigatório em todas as queries
3. **Validação:** Validação de propriedade em updates/deletes
4. **Índices:** Performance garantida com índices compostos
5. **Testes:** Testes automatizados de isolamento

---

## Índices de Performance

### Estratégia de Indexação

**Princípio:** Priorizar `tenantId` em índices compostos.

**Justificativa:**
- Todas as queries filtram por `tenantId`
- Índice composto `[tenantId, X]` otimiza queries com filtro adicional
- Ordem importa: `tenantId` sempre primeiro

### Índices Obrigatórios

#### Lead
```prisma
@@index([tenantId])              // Query básica: SELECT * FROM Lead WHERE tenantId = ?
@@index([tenantId, status])      // Kanban: WHERE tenantId = ? AND status = ?
@@index([tenantId, aiScore])     // Ordenação: WHERE tenantId = ? ORDER BY aiScore
@@index([tenantId, createdAt])   // Ordenação: WHERE tenantId = ? ORDER BY createdAt
```

#### Tenant
```prisma
@@index([slug])     // Busca por slug (subdomain)
@@index([isActive]) // Filtrar apenas tenants ativos
```

#### User
```prisma
@@index([tenantId])        // Listar usuários do tenant
@@index([email])           // Login por email
@@index([tenantId, role])  // Filtrar por role dentro do tenant
```

### Análise de Performance

**Sem Índice:**
```sql
-- Full table scan: O(n)
SELECT * FROM Lead WHERE tenantId = 'X' AND status = 'prospect';
-- Tempo: ~500ms para 100k leads
```

**Com Índice Composto:**
```sql
-- Index seek: O(log n)
SELECT * FROM Lead WHERE tenantId = 'X' AND status = 'prospect';
-- Tempo: ~50ms para 100k leads
```

**Ganho:** 10x mais rápido

### Overhead de Índices

**Storage:**
- Índice `[tenantId]`: ~8 bytes por lead
- Índice `[tenantId, status]`: ~20 bytes por lead
- Total: ~50 bytes por lead (4 índices)

**Exemplo:**
- 10.000 leads = ~500 KB de índices (negligível)
- 1.000.000 leads = ~50 MB de índices (aceitável)

**Insert/Update:**
- Overhead: ~10-20ms por operação
- Aceitável para garantir performance de leitura

---

## Migração de Dados

### Estratégia: Tenant Default

**Objetivo:** Migrar leads existentes sem perda de dados.

**Processo:**
1. Criar tenant "FourSys (Default)"
2. Associar todos os leads órfãos ao tenant default
3. Validar que nenhum lead ficou sem `tenantId`

**Script de Migração:**
```typescript
// prisma/migrations/assign-default-tenant.ts
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
  
  // 3. Associar leads órfãos ao tenant default
  const result = await prisma.lead.updateMany({
    where: { tenantId: null },
    data: { tenantId: defaultTenant.id },
  });
  
  console.log(`✅ ${result.count} leads migrados para tenant default`);
  
  // 4. Validar que não há mais leads órfãos
  const remainingOrphans = await prisma.lead.count({
    where: { tenantId: null }
  });
  
  if (remainingOrphans > 0) {
    throw new Error(`❌ Ainda existem ${remainingOrphans} leads órfãos!`);
  }
  
  console.log('✅ Migração concluída com sucesso!');
}

main()
  .catch((error) => {
    console.error('❌ Erro na migração:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

**Executar:**
```bash
npx ts-node prisma/migrations/assign-default-tenant.ts
```

### Validação Pós-Migração

**Checklist:**
- [ ] Tenant default criado
- [ ] Todos os leads têm `tenantId`
- [ ] Contagem de leads antes/depois igual
- [ ] Prisma Studio mostra dados corretos

**Query de Validação:**
```sql
-- Deve retornar 0
SELECT COUNT(*) FROM Lead WHERE tenantId IS NULL;

-- Deve retornar contagem total
SELECT COUNT(*) FROM Lead;
```

---

## Fluxos de Dados

### Fluxo 1: Criação de Lead

```
┌─────────────┐
│   Cliente   │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. POST /api/leads
       │    { name, company, value, ... }
       │    (SEM tenantId)
       ▼
┌──────────────────┐
│  Server Action   │
│  createLead()    │
├──────────────────┤
│ 2. Extrai        │
│    tenantId da   │
│    sessão        │
│                  │
│ 3. Valida dados  │
│    (Zod)         │
│                  │
│ 4. Adiciona      │
│    tenantId      │
│                  │
│ 5. Gera aiScore  │
└──────┬───────────┘
       │
       │ 6. prisma.lead.create({
       │      data: { ...data, tenantId }
       │    })
       ▼
┌──────────────────┐
│   Database       │
│                  │
│  Lead {          │
│    tenantId: X   │
│    name: "..."   │
│    ...           │
│  }               │
└──────────────────┘
       │
       │ 7. Retorna lead criado
       ▼
┌─────────────┐
│   Cliente   │
│  (Browser)  │
└─────────────┘
```

**Pontos Críticos:**
- ✅ `tenantId` NUNCA vem do cliente
- ✅ `tenantId` extraído da sessão (seguro)
- ✅ Validação de dados antes de persistir

---

### Fluxo 2: Listagem de Leads

```
┌─────────────┐
│   Cliente   │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. GET /api/leads
       ▼
┌──────────────────┐
│  Server Action   │
│  getLeads()      │
├──────────────────┤
│ 2. Extrai        │
│    tenantId da   │
│    sessão        │
│                  │
│ 3. Query com     │
│    WHERE         │
│    tenantId = X  │
└──────┬───────────┘
       │
       │ 4. prisma.lead.findMany({
       │      where: { tenantId }
       │    })
       ▼
┌──────────────────┐
│   Database       │
│                  │
│  SELECT * FROM   │
│  Lead            │
│  WHERE           │
│  tenantId = X    │
└──────┬───────────┘
       │
       │ 5. Retorna apenas
       │    leads do tenant
       ▼
┌─────────────┐
│   Cliente   │
│  (Browser)  │
└─────────────┘
```

**Pontos Críticos:**
- ✅ Filtro automático por `tenantId`
- ✅ Impossível acessar leads de outros tenants
- ✅ Índice `[tenantId]` garante performance

---

### Fluxo 3: Atualização de Lead

```
┌─────────────┐
│   Cliente   │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. PATCH /api/leads/:id
       │    { status: 'qualified' }
       ▼
┌──────────────────┐
│  Server Action   │
│  updateLead()    │
├──────────────────┤
│ 2. Extrai        │
│    tenantId da   │
│    sessão        │
│                  │
│ 3. VALIDA        │
│    PROPRIEDADE   │
│    (findFirst)   │
└──────┬───────────┘
       │
       │ 4. prisma.lead.findFirst({
       │      where: { id, tenantId }
       │    })
       ▼
┌──────────────────┐
│   Database       │
│                  │
│  Lead existe?    │
└──────┬───────────┘
       │
       │ 5. Se NÃO existe:
       │    throw Error('Acesso negado')
       │
       │ 6. Se existe:
       │    prisma.lead.update(...)
       ▼
┌──────────────────┐
│   Database       │
│                  │
│  UPDATE Lead     │
│  SET status = ?  │
│  WHERE id = ?    │
└──────┬───────────┘
       │
       │ 7. Retorna lead atualizado
       ▼
┌─────────────┐
│   Cliente   │
│  (Browser)  │
└─────────────┘
```

**Pontos Críticos:**
- ✅ Validação de propriedade ANTES de atualizar
- ✅ Previne IDOR (Insecure Direct Object Reference)
- ✅ Defense in depth (validação + filtro)

---

## Considerações de Compliance

### LGPD/GDPR

**Requisitos:**
- ✅ Isolamento de dados garantido
- ✅ Possibilidade de deletar tenant completo (direito ao esquecimento)
- ✅ Exportação de dados por tenant
- ⚠️ Alguns clientes podem exigir database separado

**Implementação:**

#### Exportação de Dados
```typescript
async function exportTenantData(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({
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
  
  return JSON.stringify(tenant, null, 2);
}
```

#### Deleção Completa
```typescript
async function deleteTenant(tenantId: string) {
  // Cascade delete automático (configurado no schema)
  await prisma.tenant.delete({
    where: { id: tenantId }
  });
  
  // Leads e Users são deletados automaticamente
}
```

---

## Próximos Passos

1. **Implementar Schema:** Aplicar mudanças no `schema.prisma`
2. **Criar Migration:** `npx prisma migrate dev --name add_multi_tenancy`
3. **Migrar Dados:** Executar script de migração
4. **Validar:** Verificar no Prisma Studio

---

**Próximo Documento:** [03-security-architecture.md](03-security-architecture.md)

