# Database - Esquema e Estrutura de Dados

**Versão:** 2.0.0  
**Data:** 26/12/2025  
**Autor:** Paige (Senior Technical Writer) 📚

---

## 📋 Visão Geral

O CRM FourSys utiliza **SQLite** para desenvolvimento local e **Prisma ORM** para gerenciamento de banco de dados. O esquema é projetado para suportar multi-tenancy com Row-Level Security.

### Tecnologias

- **ORM:** Prisma 5.19.0
- **Database:** SQLite (desenvolvimento) / PostgreSQL (produção recomendado)
- **Localização:** `prisma/schema.prisma`
- **Migrations:** Prisma Migrate

---

## 🗄️ Modelos de Dados

### 1. Tenant (Organização)

Representa uma empresa cliente que utiliza o sistema.

```prisma
model Tenant {
  id        String   @id @default(uuid())
  name      String   // Nome da empresa (ex: "FourSys Ltda")
  slug      String   @unique // URL-friendly (ex: "foursys")
  domain    String?  // Domínio customizado (opcional)
  isActive  Boolean  @default(true) // Soft delete
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relações
  leads     Lead[]
  users     User[]
  
  // Índices para performance
  @@index([slug])
  @@index([isActive])
}
```

**Campos:**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | String (UUID) | Sim | Identificador único |
| `name` | String | Sim | Nome da empresa |
| `slug` | String | Sim | Identificador URL-friendly (único) |
| `domain` | String | Não | Domínio customizado para acesso |
| `isActive` | Boolean | Sim | Status ativo/inativo (soft delete) |
| `createdAt` | DateTime | Sim | Data de criação |
| `updatedAt` | DateTime | Sim | Data da última atualização |

**Relações:**
- `leads` - Todos os leads da organização
- `users` - Todos os usuários da organização

**Índices:**
- `slug` - Para busca rápida por slug
- `isActive` - Para filtrar tenants ativos

---

### 2. User (Usuário)

Representa um usuário do sistema pertencente a um tenant.

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
  @@index([tenantId])
  @@index([email])
  @@index([tenantId, role])
}
```

**Campos:**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | String (UUID) | Sim | Identificador único |
| `tenantId` | String (UUID) | Sim | ID do tenant (organização) |
| `email` | String | Sim | Email único no sistema |
| `name` | String | Sim | Nome completo |
| `password` | String | Sim | Hash bcrypt da senha |
| `role` | String | Sim | Papel do usuário (admin/user/viewer) |
| `isActive` | Boolean | Sim | Status ativo/inativo |
| `createdAt` | DateTime | Sim | Data de criação |
| `updatedAt` | DateTime | Sim | Data da última atualização |

**Relações:**
- `tenant` - Tenant ao qual o usuário pertence (Cascade delete)

**Índices:**
- `tenantId` - Para queries por tenant
- `email` - Para autenticação rápida
- `[tenantId, role]` - Para listagem de usuários por papel

**Segurança:**
- Email é único globalmente (não por tenant)
- Senha sempre hasheada com bcrypt
- Campo `password` **NUNCA** é retornado em queries

---

### 3. Lead (Oportunidade de Negócio)

Representa uma oportunidade de negócio no pipeline de vendas.

```prisma
model Lead {
  id          String   @id @default(uuid())
  tenantId    String   // Foreign Key para Tenant
  name        String   // Nome do cliente
  company     String   // Nome da empresa
  status      String   // 'prospect' | 'qualified' | 'proposal' | 'closed'
  value       Float    // Valor estimado em R$
  aiScore     Int      // Score de IA (0-100)
  email       String?  // Email (opcional)
  phone       String?  // Telefone (opcional)
  lastContact DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relação com Tenant
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  // Índices CRÍTICOS para performance e isolamento
  @@index([status])
  @@index([aiScore])
  @@index([tenantId])            // Query básica por tenant
  @@index([tenantId, status])    // Kanban board
  @@index([tenantId, aiScore])   // Ordenação por score
  @@index([tenantId, createdAt]) // Ordenação por data
  
  // Constraints de unicidade para prevenir duplicatas
  @@unique([email, tenantId], name: "unique_email_per_tenant")
  @@unique([phone, tenantId], name: "unique_phone_per_tenant")
}
```

**Campos:**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | String (UUID) | Sim | Identificador único |
| `tenantId` | String (UUID) | Sim | ID do tenant (isolamento) |
| `name` | String | Sim | Nome do cliente |
| `company` | String | Sim | Nome da empresa do cliente |
| `status` | String | Sim | Status no pipeline |
| `value` | Float | Sim | Valor estimado em R$ |
| `aiScore` | Int | Sim | Score de IA (0-100) |
| `email` | String | Não | Email do cliente |
| `phone` | String | Não | Telefone do cliente |
| `lastContact` | DateTime | Sim | Data do último contato |
| `createdAt` | DateTime | Sim | Data de criação |
| `updatedAt` | DateTime | Sim | Data da última atualização |

**Status Válidos:**
- `prospect` - Lead inicial, primeiro contato
- `qualified` - Lead qualificado, interesse confirmado
- `proposal` - Proposta enviada ao cliente
- `closed` - Negócio fechado (ganho)

**Relações:**
- `tenant` - Tenant ao qual o lead pertence (Cascade delete)

**Índices:**
- `status` - Para filtros por status
- `aiScore` - Para ordenação por prioridade
- `tenantId` - Para isolamento básico
- `[tenantId, status]` - Para Kanban Board (otimizado)
- `[tenantId, aiScore]` - Para ordenação por score
- `[tenantId, createdAt]` - Para ordenação por data

---

## 🔒 Constraints de Unicidade

### Email e Telefone por Tenant

O sistema previne duplicatas de email e telefone **dentro do mesmo tenant**:

```prisma
@@unique([email, tenantId], name: "unique_email_per_tenant")
@@unique([phone, tenantId], name: "unique_phone_per_tenant")
```

**Comportamento:**

```typescript
// ✅ PERMITIDO: Mesmo email em tenants diferentes
Tenant A: lead1@empresa.com
Tenant B: lead1@empresa.com // OK!

// ❌ BLOQUEADO: Email duplicado no mesmo tenant
Tenant A: lead1@empresa.com
Tenant A: lead1@empresa.com // ERRO!
```

**Tratamento de Erro:**

```typescript
try {
  await createLead({
    email: 'joao@empresa.com',
    // ... outros campos
  });
} catch (error) {
  // Prisma lança erro P2002 (Unique constraint failed)
  // Sistema captura e retorna mensagem amigável:
  // "Já existe um lead cadastrado com este e-mail. Lead: João Silva"
}
```

### Validação no Código

Antes de criar/atualizar, o sistema verifica duplicatas:

```typescript
// Verificar se já existe lead com mesmo email ou telefone
const existingLead = await prisma.lead.findFirst({
  where: {
    tenantId,
    OR: [
      { email: data.email },
      { phone: data.phone }
    ]
  },
  select: {
    id: true,
    name: true,
    email: true,
    phone: true
  }
});

if (existingLead) {
  const duplicatedField = 
    existingLead.email === data.email ? 'e-mail' : 'telefone';
  
  throw new Error(
    `Já existe um lead cadastrado com este ${duplicatedField}. Lead: ${existingLead.name}`
  );
}
```

---

## ⚡ Performance e Otimização

### Índices Compostos

Todos os índices multi-tenant começam com `tenantId` para máxima performance:

```prisma
@@index([tenantId])              // 1. Filtro básico
@@index([tenantId, status])      // 2. Kanban Board
@@index([tenantId, aiScore])     // 3. Ordenação por prioridade
@@index([tenantId, createdAt])   // 4. Ordenação por data
```

### Exemplo de Query Otimizada

```sql
-- Query do Kanban Board
-- Usa índice [tenantId, status] para máxima performance
SELECT * FROM Lead 
WHERE tenantId = 'abc123' AND status = 'prospect'
ORDER BY aiScore DESC;

-- Query do Dashboard
-- Usa índice [tenantId, status] para agregação
SELECT SUM(value) FROM Lead
WHERE tenantId = 'abc123' AND status != 'closed';
```

### Cascade Delete

Quando um tenant é deletado, **todos** os seus dados são automaticamente removidos:

```prisma
tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
```

**Comportamento:**
```typescript
// Deletar tenant
await prisma.tenant.delete({ where: { id: tenantId } });

// Automaticamente deleta:
// - Todos os leads do tenant
// - Todos os users do tenant
```

---

## 🛠️ Comandos Prisma

### Desenvolvimento

```bash
# Gerar Prisma Client
npx prisma generate

# Aplicar schema ao banco (sem migrations)
npx prisma db push

# Abrir Prisma Studio (GUI do banco)
npx prisma studio

# Popular banco com dados iniciais
npm run db:seed

# Resetar banco (CUIDADO: apaga todos os dados)
npm run db:reset
```

### Produção

```bash
# Criar migration
npx prisma migrate dev --name nome_da_migration

# Aplicar migrations em produção
npx prisma migrate deploy

# Verificar status das migrations
npx prisma migrate status
```

---

## 📊 Diagrama de Relacionamentos

```mermaid
erDiagram
    TENANT ||--o{ USER : "possui"
    TENANT ||--o{ LEAD : "possui"
    
    TENANT {
        string id PK
        string name
        string slug UK
        string domain
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }
    
    USER {
        string id PK
        string tenantId FK
        string email UK
        string name
        string password
        string role
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }
    
    LEAD {
        string id PK
        string tenantId FK
        string name
        string company
        string status
        float value
        int aiScore
        string email
        string phone
        datetime lastContact
        datetime createdAt
        datetime updatedAt
    }
```

---

## 🔄 Migrations

### Histórico de Mudanças

**Versão 2.0.0 (Atual):**
- ✅ Adicionado modelo `Tenant`
- ✅ Adicionado modelo `User`
- ✅ Adicionado `tenantId` ao modelo `Lead`
- ✅ Criados índices compostos para performance
- ✅ Adicionados constraints de unicidade por tenant
- ✅ Configurado cascade delete

**Versão 1.0.0 (Inicial):**
- ✅ Modelo `Lead` básico sem multi-tenancy

### Aplicar Migrations

```bash
# Desenvolvimento
npm run db:push

# Produção
npx prisma migrate deploy
```

---

## 🧪 Seed Data

O sistema inclui um script de seed para popular o banco com dados de teste:

**Localização:** `prisma/seed.ts`

**Dados Criados:**
- 2 Tenants de exemplo
- 2 Users por tenant (1 admin, 1 user)
- 15 Leads distribuídos entre os tenants

**Executar:**

```bash
npm run db:seed
```

**Resultado:**

```
🌱 Iniciando seed do banco de dados...
🗑️  Dados antigos removidos
✅ 2 tenants criados
✅ 4 usuários criados
✅ 15 leads criados com sucesso!

📊 Distribuição por Tenant:
   Tenant 1: 8 leads
   Tenant 2: 7 leads
```

---

## 📚 Referências

### Arquivos Relacionados

- `prisma/schema.prisma` - Definição do esquema
- `prisma/seed.ts` - Script de seed
- `src/lib/prisma.ts` - Prisma Client singleton

### Documentação Externa

- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Relations](https://www.prisma.io/docs/concepts/components/prisma-schema/relations)
- [Prisma Indexes](https://www.prisma.io/docs/concepts/components/prisma-schema/indexes)

---

## ⚠️ Notas Importantes

### SQLite vs PostgreSQL

**Desenvolvimento (SQLite):**
- ✅ Rápido para desenvolvimento local
- ✅ Zero configuração
- ✅ Arquivo único (`dev.db`)
- ❌ Não recomendado para produção

**Produção (PostgreSQL Recomendado):**
- ✅ Melhor performance com grandes volumes
- ✅ Suporte a conexões concorrentes
- ✅ Recursos avançados (full-text search, JSON, etc.)
- ✅ Backup e replicação robustos

### Migração para PostgreSQL

Para migrar para PostgreSQL, atualizar `datasource` no schema:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

E atualizar `.env`:

```env
DATABASE_URL="postgresql://user:password@host:5432/database"
```

---

**Documentado por:** Paige (Senior Technical Writer) 📚  
**Versão:** 2.0.0  
**Data:** 26/12/2025  
**Status:** ✅ Completo e Sincronizado

