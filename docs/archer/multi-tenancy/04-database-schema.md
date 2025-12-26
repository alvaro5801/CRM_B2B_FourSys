# Database Schema Completo

**Versão:** 1.0  
**Data:** 25/12/2025  
**Arquiteto:** Alex  
**Status:** 🟢 Pronto para Implementação

---

## Schema Prisma Completo

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// ============================================
// TENANT MODEL
// ============================================

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

// ============================================
// LEAD MODEL (ATUALIZADO)
// ============================================

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
  @@index([status])
  @@index([aiScore])
  @@index([tenantId])            // ← NOVO: Query básica por tenant
  @@index([tenantId, status])    // ← NOVO: Kanban board
  @@index([tenantId, aiScore])   // ← NOVO: Ordenação por score
  @@index([tenantId, createdAt]) // ← NOVO: Ordenação por data
}

// ============================================
// USER MODEL (NOVO)
// ============================================

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

---

## Comandos de Migration

### 1. Criar Migration

```bash
# Criar migration com nome descritivo
npx prisma migrate dev --name add_multi_tenancy

# Ou aplicar direto (desenvolvimento)
npx prisma db push
```

### 2. Gerar Prisma Client

```bash
# Gerar client atualizado
npx prisma generate
```

### 3. Visualizar Schema

```bash
# Abrir Prisma Studio
npx prisma studio
```

---

## SQL Gerado (SQLite)

```sql
-- Criar tabela Tenant
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "domain" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Índices Tenant
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");
CREATE INDEX "Tenant_slug_idx" ON "Tenant"("slug");
CREATE INDEX "Tenant_isActive_idx" ON "Tenant"("isActive");

-- Alterar tabela Lead (adicionar tenantId)
ALTER TABLE "Lead" ADD COLUMN "tenantId" TEXT;

-- Criar foreign key
CREATE INDEX "Lead_tenantId_fkey" ON "Lead"("tenantId");

-- Índices Lead (novos)
CREATE INDEX "Lead_tenantId_idx" ON "Lead"("tenantId");
CREATE INDEX "Lead_tenantId_status_idx" ON "Lead"("tenantId", "status");
CREATE INDEX "Lead_tenantId_aiScore_idx" ON "Lead"("tenantId", "aiScore");
CREATE INDEX "Lead_tenantId_createdAt_idx" ON "Lead"("tenantId", "createdAt");

-- Criar tabela User
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "isActive" BOOLEAN NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Índices User
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_tenantId_role_idx" ON "User"("tenantId", "role");
```

---

## Variáveis de Ambiente

```env
# .env
DATABASE_URL="file:./dev.db"

# Produção (PostgreSQL)
# DATABASE_URL="postgresql://user:password@localhost:5432/crm_foursys"
```

---

## Tipos TypeScript Gerados

```typescript
// node_modules/.prisma/client/index.d.ts

export type Tenant = {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Lead = {
  id: string;
  tenantId: string; // ← NOVO
  name: string;
  company: string;
  status: string;
  value: number;
  aiScore: number;
  email: string | null;
  phone: string | null;
  lastContact: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type User = {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  password: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
```

---

## Validação do Schema

### Checklist Pós-Migration

```bash
# 1. Verificar que migration foi aplicada
npx prisma migrate status

# 2. Abrir Prisma Studio
npx prisma studio

# 3. Verificar tabelas criadas
# - Tenant existe?
# - Lead tem coluna tenantId?
# - User existe?

# 4. Verificar índices
# SQLite:
sqlite3 prisma/dev.db ".indexes Lead"

# 5. Verificar foreign keys
sqlite3 prisma/dev.db "PRAGMA foreign_key_list(Lead);"
```

---

**Próximo Documento:** [05-server-actions-spec.md](05-server-actions-spec.md)

