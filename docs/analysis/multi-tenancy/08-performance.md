# Performance e Otimizações

**Versão:** 1.0  
**Data:** 25/12/2025  
**Analista:** Mary (Business Analyst)

---

## 1. ÍNDICES NECESSÁRIOS

### 1.1 Índices Críticos

```prisma
model Lead {
  id          String   @id @default(uuid())
  tenantId    String
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
  
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  // Índices CRÍTICOS
  @@index([tenantId])              // Query básica por tenant
  @@index([tenantId, status])      // Kanban board (filtro por coluna)
  @@index([tenantId, aiScore])     // Ordenação por score
  @@index([tenantId, createdAt])   // Ordenação por data
  
  // Índices existentes (manter)
  @@index([status])
  @@index([aiScore])
}
```

---

### 1.2 Por Que Cada Índice é Necessário

#### Índice: `[tenantId]`
**Query:**
```typescript
await prisma.lead.findMany({
  where: { tenantId: 'abc-123' }
});
```

**Sem índice:** Full table scan O(n) - LENTO  
**Com índice:** Index seek O(log n) - RÁPIDO

**Impacto:**
- 10.000 leads: 10.000 rows → 13 rows (índice)
- 100.000 leads: 100.000 rows → 16 rows (índice)

---

#### Índice: `[tenantId, status]`
**Query:**
```typescript
await prisma.lead.findMany({
  where: {
    tenantId: 'abc-123',
    status: 'prospect'
  }
});
```

**Por que composto:**
- Índice `[tenantId]` filtra por tenant
- Índice `[tenantId, status]` filtra por tenant E status (mais eficiente)

**Uso:** Kanban Board (filtrar leads por coluna)

---

#### Índice: `[tenantId, aiScore]`
**Query:**
```typescript
await prisma.lead.findMany({
  where: { tenantId: 'abc-123' },
  orderBy: { aiScore: 'desc' }
});
```

**Por que composto:**
- Filtro por tenant + ordenação por aiScore
- Evita sort após filtro (mais rápido)

**Uso:** Listagem de leads ordenados por prioridade

---

#### Índice: `[tenantId, createdAt]`
**Query:**
```typescript
await prisma.lead.findMany({
  where: { tenantId: 'abc-123' },
  orderBy: { createdAt: 'desc' }
});
```

**Uso:** Listagem de leads mais recentes

---

## 2. ANÁLISE DE PERFORMANCE

### 2.1 Impacto dos Índices no Tamanho do Banco

**Estimativa de Tamanho:**
- Índice `[tenantId]`: ~8 bytes por lead
- Índice `[tenantId, status]`: ~20 bytes por lead
- Índice `[tenantId, aiScore]`: ~12 bytes por lead
- Índice `[tenantId, createdAt]`: ~16 bytes por lead
- **Total:** ~56 bytes por lead

**Exemplos:**
| Leads | Tamanho dos Índices | Status |
|-------|---------------------|--------|
| 1.000 | ~56 KB | ✅ Negligível |
| 10.000 | ~560 KB | ✅ Aceitável |
| 100.000 | ~5.6 MB | ✅ Bom |
| 1.000.000 | ~56 MB | ✅ Aceitável |
| 10.000.000 | ~560 MB | ⚠️ Considerar particionamento |

---

### 2.2 Comparação de Performance

#### Cenário: 100.000 leads, 100 tenants (1.000 leads/tenant)

**Query:** Buscar leads de um tenant

```sql
SELECT * FROM Lead WHERE tenantId = 'abc-123';
```

| Configuração | Tempo | Rows Scanned |
|--------------|-------|--------------|
| Sem índice | ~500ms | 100.000 |
| Com índice `[tenantId]` | ~10ms | 1.000 |
| **Melhoria** | **50x mais rápido** | **100x menos rows** |

---

**Query:** Buscar leads de um tenant por status (Kanban)

```sql
SELECT * FROM Lead 
WHERE tenantId = 'abc-123' AND status = 'prospect';
```

| Configuração | Tempo | Rows Scanned |
|--------------|-------|--------------|
| Índice `[tenantId]` apenas | ~5ms | 1.000 |
| Índice `[tenantId, status]` | ~2ms | 250 |
| **Melhoria** | **2.5x mais rápido** | **4x menos rows** |

---

## 3. OTIMIZAÇÕES DE QUERIES

### 3.1 Select Específico (Evitar SELECT *)

❌ **Evitar:**
```typescript
const leads = await prisma.lead.findMany({
  where: { tenantId }
});
// Retorna TODOS os campos (incluindo timestamps desnecessários)
```

✅ **Preferir:**
```typescript
const leads = await prisma.lead.findMany({
  where: { tenantId },
  select: {
    id: true,
    name: true,
    company: true,
    status: true,
    value: true,
    aiScore: true,
  }
});
// Retorna apenas campos necessários (menos dados trafegados)
```

**Benefício:** Reduz tamanho da resposta em ~30%.

---

### 3.2 Paginação

❌ **Evitar:**
```typescript
// Buscar TODOS os leads (pode ser milhares)
const leads = await prisma.lead.findMany({
  where: { tenantId }
});
```

✅ **Preferir:**
```typescript
// Buscar apenas 50 leads por vez
const leads = await prisma.lead.findMany({
  where: { tenantId },
  take: 50,
  skip: page * 50,
  orderBy: { createdAt: 'desc' }
});
```

**Benefício:** Reduz tempo de resposta e uso de memória.

---

### 3.3 Agregações Eficientes

❌ **Evitar:**
```typescript
// Buscar todos os leads e calcular no JavaScript
const leads = await prisma.lead.findMany({
  where: { tenantId, status: { not: 'closed' } }
});
const pipelineTotal = leads.reduce((sum, lead) => sum + lead.value, 0);
```

✅ **Preferir:**
```typescript
// Calcular no banco de dados
const result = await prisma.lead.aggregate({
  where: { tenantId, status: { not: 'closed' } },
  _sum: { value: true }
});
const pipelineTotal = result._sum.value || 0;
```

**Benefício:** 10-100x mais rápido (depende do volume).

---

## 4. CACHING

### 4.1 Cache de Tenant

```typescript
// src/lib/tenant-cache.ts
const tenantCache = new Map<string, Tenant>();

export async function getCachedTenant(tenantId: string): Promise<Tenant | null> {
  // Verificar cache
  if (tenantCache.has(tenantId)) {
    return tenantCache.get(tenantId)!;
  }
  
  // Buscar no banco
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId }
  });
  
  if (tenant) {
    // Armazenar em cache
    tenantCache.set(tenantId, tenant);
  }
  
  return tenant;
}

// Invalidar cache quando tenant for atualizado
export function invalidateTenantCache(tenantId: string) {
  tenantCache.delete(tenantId);
}
```

**Benefício:** Evita query ao banco em toda requisição.

---

### 4.2 Cache de Métricas (Redis)

```typescript
// src/lib/metrics-cache.ts
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function getCachedMetrics(tenantId: string) {
  const cacheKey = `metrics:${tenantId}`;
  
  // Tentar buscar do cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Calcular métricas
  const metrics = await getDashboardMetrics();
  
  // Armazenar em cache por 5 minutos
  await redis.setex(cacheKey, 300, JSON.stringify(metrics));
  
  return metrics;
}

// Invalidar cache quando lead for criado/atualizado
export async function invalidateMetricsCache(tenantId: string) {
  await redis.del(`metrics:${tenantId}`);
}
```

**Benefício:** Reduz carga no banco para métricas frequentemente acessadas.

---

## 5. CONNECTION POOLING

### 5.1 Configuração do Prisma

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
    // Connection pool otimizado
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**Configuração no DATABASE_URL:**
```env
# SQLite (desenvolvimento)
DATABASE_URL="file:./dev.db"

# PostgreSQL (produção)
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=10"
```

**Parâmetros:**
- `connection_limit=20`: Máximo de 20 conexões simultâneas
- `pool_timeout=10`: Timeout de 10s para obter conexão

---

## 6. MONITORAMENTO

### 6.1 Slow Query Log

```typescript
// src/lib/prisma.ts
const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
  ],
});

prisma.$on('query', (e) => {
  // Logar queries lentas (> 100ms)
  if (e.duration > 100) {
    console.warn('Slow query detected:', {
      query: e.query,
      duration: `${e.duration}ms`,
      params: e.params,
    });
  }
});
```

---

### 6.2 Métricas de Performance

```typescript
// src/lib/metrics.ts
export async function trackQueryPerformance(
  tenantId: string,
  queryType: string,
  duration: number
) {
  await prisma.performanceMetric.create({
    data: {
      tenantId,
      queryType,
      duration,
      timestamp: new Date(),
    }
  });
}

// Usar em Server Actions
export async function getLeads() {
  const start = Date.now();
  const tenantId = await getCurrentTenantId();
  
  const leads = await prisma.lead.findMany({
    where: { tenantId }
  });
  
  const duration = Date.now() - start;
  await trackQueryPerformance(tenantId, 'getLeads', duration);
  
  return leads;
}
```

---

## 7. ESCALABILIDADE

### 7.1 Limites do Modelo Atual

**Shared Database, Shared Schema suporta:**

| Métrica | Limite Recomendado | Status |
|---------|-------------------|--------|
| Tenants | 1.000 | ✅ Bom |
| Leads Totais | 10.000.000 | ✅ Aceitável |
| Leads por Tenant | 100.000 | ✅ Bom |
| Queries/segundo | 1.000 | ✅ Aceitável |

**Sinais de que precisa escalar:**
- ⚠️ Queries > 500ms consistentemente
- ⚠️ Connection pool esgotado frequentemente
- ⚠️ Banco de dados > 100 GB
- ⚠️ Um tenant domina uso (> 50% dos dados)

---

### 7.2 Estratégias de Escalabilidade

#### Opção 1: Read Replicas
```
┌─────────────┐
│   Primary   │ ← Writes
│  (Master)   │
└──────┬──────┘
       │ Replication
       ├────────────┬────────────┐
       ▼            ▼            ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Replica1 │ │ Replica2 │ │ Replica3 │ ← Reads
└──────────┘ └──────────┘ └──────────┘
```

**Quando usar:** Muitas leituras, poucas escritas

---

#### Opção 2: Sharding por Tenant
```
┌──────────────┐
│   Router     │
└──────┬───────┘
       │
       ├─────────────┬─────────────┐
       ▼             ▼             ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│  Shard 1 │  │  Shard 2 │  │  Shard 3 │
│ Tenants  │  │ Tenants  │  │ Tenants  │
│  1-100   │  │ 101-200  │  │ 201-300  │
└──────────┘  └──────────┘  └──────────┘
```

**Quando usar:** > 1.000 tenants ou > 10M leads

---

#### Opção 3: Tenant Premium (Database Dedicado)
```
┌──────────────────┐
│  Shared Database │ ← Tenants pequenos
│  (1.000 tenants) │
└──────────────────┘

┌──────────────────┐
│ Dedicated DB #1  │ ← Tenant grande (Enterprise)
│  (Tenant A)      │
└──────────────────┘

┌──────────────────┐
│ Dedicated DB #2  │ ← Tenant grande (Enterprise)
│  (Tenant B)      │
└──────────────────┘
```

**Quando usar:** Clientes enterprise com requisitos especiais

---

## 8. CHECKLIST DE OTIMIZAÇÃO

### 8.1 Implementação Inicial
- [ ] Criar índices `[tenantId]`, `[tenantId, status]`, etc.
- [ ] Usar `select` específico (não SELECT *)
- [ ] Implementar paginação
- [ ] Usar agregações do banco (não JavaScript)

### 8.2 Otimizações Intermediárias
- [ ] Cache de tenant em memória
- [ ] Slow query log
- [ ] Connection pooling configurado
- [ ] Monitoramento de performance

### 8.3 Otimizações Avançadas
- [ ] Cache de métricas (Redis)
- [ ] Read replicas
- [ ] Sharding (se necessário)
- [ ] CDN para assets estáticos

---

**Próximo Documento:** [09-checklist.md](09-checklist.md)



