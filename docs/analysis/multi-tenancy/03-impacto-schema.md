# Impacto no Schema do Banco de Dados

**Versão:** 1.0  
**Data:** 25/12/2025  
**Analista:** Mary (Business Analyst)

---

## 1. ARQUIVO IMPACTADO

📄 **`prisma/schema.prisma`**

**Complexidade:** 🔴 Alta  
**Prioridade:** Crítica  
**Tipo de Alteração:** Adicionar models e campos

---

## 2. MUDANÇAS NECESSÁRIAS

### 2.1 Criar Model `Tenant`

```prisma
model Tenant {
  id        String   @id @default(uuid())
  name      String   // Nome da empresa cliente (ex: "FourSys Ltda")
  slug      String   @unique // URL-friendly identifier (ex: "foursys")
  domain    String?  // Domínio customizado (ex: "crm.foursys.com") - Opcional
  isActive  Boolean  @default(true) // Permite desativar tenant sem deletar
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relações
  leads     Lead[]   // Um tenant tem múltiplos leads
  users     User[]   // Um tenant tem múltiplos usuários (futuro)
  
  // Índices para performance
  @@index([slug])     // Busca por slug (usado em subdomain)
  @@index([isActive]) // Filtrar apenas tenants ativos
}
```

#### Campos Explicados:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | ✅ Sim | Identificador único do tenant |
| `name` | String | ✅ Sim | Nome da empresa (exibido na UI) |
| `slug` | String | ✅ Sim | Identificador único para URLs (ex: subdomain) |
| `domain` | String | ❌ Não | Domínio customizado (recurso premium) |
| `isActive` | Boolean | ✅ Sim | Permite soft-delete de tenants |
| `createdAt` | DateTime | ✅ Sim | Data de criação (auditoria) |
| `updatedAt` | DateTime | ✅ Sim | Última atualização (auditoria) |

---

### 2.2 Adicionar `tenantId` ao Model `Lead`

```prisma
model Lead {
  id          String   @id @default(uuid())
  tenantId    String   // ← NOVO CAMPO - Foreign Key para Tenant
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
  @@index([tenantId])            // ← NOVO - Query básica por tenant
  @@index([tenantId, status])    // ← NOVO - Kanban board (filtro por coluna)
  @@index([tenantId, aiScore])   // ← NOVO - Ordenação por score dentro do tenant
  @@index([tenantId, createdAt]) // ← NOVO - Ordenação por data dentro do tenant
}
```

#### Mudanças Detalhadas:

**Campo Adicionado:**
- `tenantId` (String): Foreign key obrigatória

**Relação Adicionada:**
- `tenant Tenant @relation(...)`: Relacionamento N:1 com Tenant
- `onDelete: Cascade`: Se tenant for deletado, todos os leads são deletados

**Índices Adicionados:**
- `[tenantId]`: Essencial para queries básicas
- `[tenantId, status]`: Otimiza Kanban Board (filtro por coluna)
- `[tenantId, aiScore]`: Otimiza ordenação por score
- `[tenantId, createdAt]`: Otimiza ordenação por data

---

### 2.3 Criar Model `User` (Opcional, mas Recomendado)

```prisma
model User {
  id        String   @id @default(uuid())
  tenantId  String   // Foreign Key para Tenant
  email     String   @unique // Email único no sistema
  name      String   // Nome completo do usuário
  role      String   @default("user") // 'admin' | 'user' | 'viewer'
  isActive  Boolean  @default(true) // Permite desativar usuário
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relação com Tenant
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  // Índices
  @@index([tenantId])  // Listar usuários do tenant
  @@index([email])     // Login por email
  @@index([tenantId, role]) // Filtrar por role dentro do tenant
}
```

**Nota:** Este model é necessário quando implementar autenticação real.

---

## 3. MIGRATION

### 3.1 Comando para Criar Migration

```bash
# Opção 1: Migration com histórico (recomendado)
npx prisma migrate dev --name add_multi_tenancy

# Opção 2: Aplicar direto sem histórico (desenvolvimento)
npx prisma db push
```

### 3.2 O Que a Migration Faz

1. **Cria tabela `Tenant`**
2. **Adiciona coluna `tenantId` à tabela `Lead`**
3. **Cria índices de performance**
4. **Cria foreign key constraint**

---

## 4. IMPACTO EM DADOS EXISTENTES

### 4.1 Problema

⚠️ **ATENÇÃO:** Leads existentes no banco **NÃO terão `tenantId`**.

**Erro esperado:**
```
Error: Foreign key constraint failed on the field: `tenantId`
```

### 4.2 Estratégias de Migração

#### Estratégia 1: Criar Tenant Default (Recomendado)

**Quando usar:**
- Ambiente de desenvolvimento com dados de teste
- Ambiente de produção com poucos dados

**Como fazer:**
```typescript
// prisma/migrations/assign-default-tenant.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Criando tenant default...');
  
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
  
  // 2. Atualizar leads órfãos
  const result = await prisma.lead.updateMany({
    where: { tenantId: null },
    data: { tenantId: defaultTenant.id },
  });
  
  console.log(`✅ ${result.count} leads associados ao tenant default`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Executar:**
```bash
npx ts-node prisma/migrations/assign-default-tenant.ts
```

---

#### Estratégia 2: Resetar Database (Desenvolvimento)

**Quando usar:**
- Ambiente de desenvolvimento local
- Dados são apenas para teste

**Como fazer:**
```bash
# 1. Deletar banco e recriar
npx prisma migrate reset

# 2. Aplicar migrations
npx prisma migrate dev

# 3. Popular com novos dados
npm run db:seed
```

⚠️ **CUIDADO:** Isso deleta TODOS os dados!

---

#### Estratégia 3: Migração Manual por SQL

**Quando usar:**
- Produção com muitos dados
- Necessidade de controle fino

**Como fazer:**
```sql
-- 1. Criar tenant default
INSERT INTO Tenant (id, name, slug, isActive, createdAt, updatedAt)
VALUES ('default-tenant-id', 'FourSys (Default)', 'default', true, datetime('now'), datetime('now'));

-- 2. Adicionar coluna tenantId (se não existir)
ALTER TABLE Lead ADD COLUMN tenantId TEXT;

-- 3. Atualizar leads existentes
UPDATE Lead 
SET tenantId = 'default-tenant-id'
WHERE tenantId IS NULL;

-- 4. Tornar coluna obrigatória
-- (Prisma faz isso automaticamente na migration)
```

---

## 5. VALIDAÇÃO DA MIGRATION

### 5.1 Checklist Pós-Migration

- [ ] Tabela `Tenant` criada
- [ ] Coluna `tenantId` existe em `Lead`
- [ ] Índices criados (verificar com `EXPLAIN QUERY PLAN`)
- [ ] Foreign key constraint ativa
- [ ] Todos os leads têm `tenantId` (nenhum NULL)
- [ ] Seed funciona sem erros

### 5.2 Comandos de Validação

```bash
# Abrir Prisma Studio para inspeção visual
npx prisma studio

# Verificar schema aplicado
npx prisma db pull

# Contar leads sem tenant (deve ser 0)
# Via Prisma Studio ou SQL:
SELECT COUNT(*) FROM Lead WHERE tenantId IS NULL;
```

---

## 6. ROLLBACK (SE NECESSÁRIO)

### 6.1 Reverter Migration

```bash
# Voltar para migration anterior
npx prisma migrate resolve --rolled-back <migration-name>

# Aplicar migration de rollback
npx prisma migrate dev
```

### 6.2 Remover Manualmente

```sql
-- 1. Remover foreign key
ALTER TABLE Lead DROP CONSTRAINT Lead_tenantId_fkey;

-- 2. Remover coluna
ALTER TABLE Lead DROP COLUMN tenantId;

-- 3. Deletar tabela Tenant
DROP TABLE Tenant;
```

---

## 7. PERFORMANCE

### 7.1 Impacto dos Índices

**Antes (sem índices):**
```sql
SELECT * FROM Lead WHERE tenantId = 'X' AND status = 'prospect';
-- Full table scan: O(n) - LENTO
```

**Depois (com índice composto):**
```sql
SELECT * FROM Lead WHERE tenantId = 'X' AND status = 'prospect';
-- Index seek: O(log n) - RÁPIDO
```

### 7.2 Tamanho dos Índices

**Estimativa:**
- Índice `[tenantId]`: ~8 bytes por lead
- Índice `[tenantId, status]`: ~20 bytes por lead
- Total: ~50 bytes por lead (4 índices)

**Exemplo:**
- 10.000 leads = ~500 KB de índices (negligível)
- 1.000.000 leads = ~50 MB de índices (aceitável)

---

## 8. TESTES RECOMENDADOS

### 8.1 Testes de Integridade

```typescript
// tests/schema.test.ts
import { prisma } from '@/lib/prisma';

describe('Multi-tenancy Schema', () => {
  it('deve criar tenant com sucesso', async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Test Tenant',
        slug: 'test-tenant',
      },
    });
    
    expect(tenant.id).toBeDefined();
    expect(tenant.slug).toBe('test-tenant');
  });
  
  it('deve criar lead associado a tenant', async () => {
    const tenant = await prisma.tenant.create({
      data: { name: 'Test', slug: 'test' },
    });
    
    const lead = await prisma.lead.create({
      data: {
        tenantId: tenant.id,
        name: 'João Silva',
        company: 'Tech Corp',
        status: 'prospect',
        value: 10000,
        aiScore: 75,
      },
    });
    
    expect(lead.tenantId).toBe(tenant.id);
  });
  
  it('deve deletar leads ao deletar tenant (cascade)', async () => {
    const tenant = await prisma.tenant.create({
      data: { name: 'Test', slug: 'test' },
    });
    
    await prisma.lead.create({
      data: {
        tenantId: tenant.id,
        name: 'Test Lead',
        company: 'Test',
        status: 'prospect',
        value: 1000,
        aiScore: 50,
      },
    });
    
    await prisma.tenant.delete({ where: { id: tenant.id } });
    
    const leads = await prisma.lead.findMany({
      where: { tenantId: tenant.id },
    });
    
    expect(leads).toHaveLength(0);
  });
});
```

---

**Próximo Documento:** [04-impacto-server-actions.md](04-impacto-server-actions.md)



