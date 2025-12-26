# Impacto no Script de Seed

**Versão:** 1.0  
**Data:** 25/12/2025  
**Analista:** Mary (Business Analyst)

---

## 1. ARQUIVO IMPACTADO

📄 **`prisma/seed.ts`**

**Complexidade:** 🟡 Média  
**Prioridade:** Alta  
**Tipo de Alteração:** Criar tenants e associar leads

---

## 2. CÓDIGO ATUAL

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const leads = [
    {
      name: 'João Silva',
      company: 'Tech Solutions',
      status: 'prospect',
      value: 15000,
      aiScore: 85,
      email: 'joao@techsolutions.com',
      phone: '(11) 98765-4321',
    },
    // ... mais 14 leads
  ];

  for (const leadData of leads) {
    await prisma.lead.create({
      data: leadData,
    });
  }

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## 3. CÓDIGO ATUALIZADO

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with multi-tenancy...');

  // ============================================
  // 1. CRIAR TENANTS
  // ============================================
  
  console.log('📦 Creating tenants...');
  
  const tenant1 = await prisma.tenant.upsert({
    where: { slug: 'foursys' },
    update: {},
    create: {
      name: 'FourSys',
      slug: 'foursys',
      domain: 'crm.foursys.com',
      isActive: true,
    },
  });
  
  const tenant2 = await prisma.tenant.upsert({
    where: { slug: 'techcorp' },
    update: {},
    create: {
      name: 'TechCorp',
      slug: 'techcorp',
      domain: null,
      isActive: true,
    },
  });
  
  const tenant3 = await prisma.tenant.upsert({
    where: { slug: 'innovate' },
    update: {},
    create: {
      name: 'Innovate Solutions',
      slug: 'innovate',
      domain: null,
      isActive: true,
    },
  });
  
  console.log(`✅ Created 3 tenants: ${tenant1.name}, ${tenant2.name}, ${tenant3.name}`);

  // ============================================
  // 2. CRIAR LEADS PARA TENANT 1 (FourSys)
  // ============================================
  
  console.log('📊 Creating leads for FourSys...');
  
  const fourSysLeads = [
    {
      tenantId: tenant1.id,
      name: 'João Silva',
      company: 'Tech Solutions',
      status: 'prospect',
      value: 15000,
      aiScore: 85,
      email: 'joao@techsolutions.com',
      phone: '(11) 98765-4321',
    },
    {
      tenantId: tenant1.id,
      name: 'Maria Santos',
      company: 'Digital Corp',
      status: 'qualified',
      value: 25000,
      aiScore: 92,
      email: 'maria@digitalcorp.com',
      phone: '(11) 97654-3210',
    },
    {
      tenantId: tenant1.id,
      name: 'Pedro Oliveira',
      company: 'Cloud Systems',
      status: 'proposal',
      value: 35000,
      aiScore: 78,
      email: 'pedro@cloudsystems.com',
      phone: '(21) 98765-1234',
    },
    {
      tenantId: tenant1.id,
      name: 'Ana Costa',
      company: 'Smart Tech',
      status: 'closed',
      value: 50000,
      aiScore: 95,
      email: 'ana@smarttech.com',
      phone: '(11) 99876-5432',
    },
    {
      tenantId: tenant1.id,
      name: 'Carlos Ferreira',
      company: 'Data Insights',
      status: 'prospect',
      value: 12000,
      aiScore: 65,
      email: 'carlos@datainsights.com',
      phone: '(11) 98123-4567',
    },
  ];

  for (const leadData of fourSysLeads) {
    await prisma.lead.create({ data: leadData });
  }
  
  console.log(`✅ Created ${fourSysLeads.length} leads for FourSys`);

  // ============================================
  // 3. CRIAR LEADS PARA TENANT 2 (TechCorp)
  // ============================================
  
  console.log('📊 Creating leads for TechCorp...');
  
  const techCorpLeads = [
    {
      tenantId: tenant2.id,
      name: 'Roberto Lima',
      company: 'Mega Store',
      status: 'prospect',
      value: 8000,
      aiScore: 55,
      email: 'roberto@megastore.com',
      phone: '(11) 91234-5678',
    },
    {
      tenantId: tenant2.id,
      name: 'Juliana Rocha',
      company: 'Fashion Plus',
      status: 'qualified',
      value: 18000,
      aiScore: 88,
      email: 'juliana@fashionplus.com',
      phone: '(21) 92345-6789',
    },
    {
      tenantId: tenant2.id,
      name: 'Fernando Alves',
      company: 'Auto Parts',
      status: 'proposal',
      value: 22000,
      aiScore: 72,
      email: 'fernando@autoparts.com',
      phone: '(11) 93456-7890',
    },
    {
      tenantId: tenant2.id,
      name: 'Patrícia Mendes',
      company: 'Health Care',
      status: 'closed',
      value: 45000,
      aiScore: 90,
      email: 'patricia@healthcare.com',
      phone: '(11) 94567-8901',
    },
    {
      tenantId: tenant2.id,
      name: 'Lucas Barbosa',
      company: 'Edu Tech',
      status: 'prospect',
      value: 10000,
      aiScore: 60,
      email: 'lucas@edutech.com',
      phone: '(21) 95678-9012',
    },
  ];

  for (const leadData of techCorpLeads) {
    await prisma.lead.create({ data: leadData });
  }
  
  console.log(`✅ Created ${techCorpLeads.length} leads for TechCorp`);

  // ============================================
  // 4. CRIAR LEADS PARA TENANT 3 (Innovate)
  // ============================================
  
  console.log('📊 Creating leads for Innovate Solutions...');
  
  const innovateLeads = [
    {
      tenantId: tenant3.id,
      name: 'Gabriela Souza',
      company: 'Green Energy',
      status: 'prospect',
      value: 30000,
      aiScore: 82,
      email: 'gabriela@greenenergy.com',
      phone: '(11) 96789-0123',
    },
    {
      tenantId: tenant3.id,
      name: 'Ricardo Nunes',
      company: 'Logistics Pro',
      status: 'qualified',
      value: 20000,
      aiScore: 75,
      email: 'ricardo@logisticspro.com',
      phone: '(21) 97890-1234',
    },
    {
      tenantId: tenant3.id,
      name: 'Camila Dias',
      company: 'Food Tech',
      status: 'proposal',
      value: 28000,
      aiScore: 80,
      email: 'camila@foodtech.com',
      phone: '(11) 98901-2345',
    },
    {
      tenantId: tenant3.id,
      name: 'Bruno Cardoso',
      company: 'Finance Plus',
      status: 'closed',
      value: 55000,
      aiScore: 98,
      email: 'bruno@financeplus.com',
      phone: '(11) 99012-3456',
    },
    {
      tenantId: tenant3.id,
      name: 'Larissa Martins',
      company: 'Travel Agency',
      status: 'prospect',
      value: 9000,
      aiScore: 58,
      email: 'larissa@travelagency.com',
      phone: '(21) 90123-4567',
    },
  ];

  for (const leadData of innovateLeads) {
    await prisma.lead.create({ data: leadData });
  }
  
  console.log(`✅ Created ${innovateLeads.length} leads for Innovate Solutions`);

  // ============================================
  // 5. RESUMO
  // ============================================
  
  const totalLeads = fourSysLeads.length + techCorpLeads.length + innovateLeads.length;
  
  console.log('\n📊 Seeding Summary:');
  console.log(`   - Tenants: 3`);
  console.log(`   - Total Leads: ${totalLeads}`);
  console.log(`   - FourSys: ${fourSysLeads.length} leads`);
  console.log(`   - TechCorp: ${techCorpLeads.length} leads`);
  console.log(`   - Innovate: ${innovateLeads.length} leads`);
  console.log('\n✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## 4. MUDANÇAS DETALHADAS

### 4.1 Criar Tenants

**Antes:** Não existia

**Depois:**
```typescript
const tenant1 = await prisma.tenant.upsert({
  where: { slug: 'foursys' },
  update: {},
  create: {
    name: 'FourSys',
    slug: 'foursys',
    domain: 'crm.foursys.com',
    isActive: true,
  },
});
```

**Por que `upsert`?**
- Evita erro se executar seed múltiplas vezes
- Cria se não existe, atualiza se existe

---

### 4.2 Adicionar `tenantId` aos Leads

**Antes:**
```typescript
{
  name: 'João Silva',
  company: 'Tech Solutions',
  status: 'prospect',
  value: 15000,
  aiScore: 85,
}
```

**Depois:**
```typescript
{
  tenantId: tenant1.id, // ← NOVO
  name: 'João Silva',
  company: 'Tech Solutions',
  status: 'prospect',
  value: 15000,
  aiScore: 85,
}
```

---

### 4.3 Distribuir Leads Entre Tenants

**Estratégia:**
- **Tenant 1 (FourSys):** 5 leads
- **Tenant 2 (TechCorp):** 5 leads
- **Tenant 3 (Innovate):** 5 leads
- **Total:** 15 leads

**Benefício:** Permite testar isolamento de dados entre tenants.

---

## 5. EXECUTAR SEED

### 5.1 Comandos

```bash
# Resetar banco e aplicar seed
npm run db:reset

# Ou apenas executar seed (sem resetar)
npm run db:seed
```

### 5.2 Saída Esperada

```
🌱 Seeding database with multi-tenancy...
📦 Creating tenants...
✅ Created 3 tenants: FourSys, TechCorp, Innovate Solutions
📊 Creating leads for FourSys...
✅ Created 5 leads for FourSys
📊 Creating leads for TechCorp...
✅ Created 5 leads for TechCorp
📊 Creating leads for Innovate Solutions...
✅ Created 5 leads for Innovate Solutions

📊 Seeding Summary:
   - Tenants: 3
   - Total Leads: 15
   - FourSys: 5 leads
   - TechCorp: 5 leads
   - Innovate: 5 leads

✅ Seeding completed successfully!
```

---

## 6. VALIDAÇÃO

### 6.1 Via Prisma Studio

```bash
npx prisma studio
```

**Verificar:**
- [ ] Tabela `Tenant` tem 3 registros
- [ ] Tabela `Lead` tem 15 registros
- [ ] Cada lead tem `tenantId` preenchido
- [ ] Leads estão distribuídos entre os 3 tenants

### 6.2 Via SQL

```sql
-- Contar tenants
SELECT COUNT(*) FROM Tenant;
-- Esperado: 3

-- Contar leads por tenant
SELECT t.name, COUNT(l.id) as lead_count
FROM Tenant t
LEFT JOIN Lead l ON l.tenantId = t.id
GROUP BY t.id, t.name;
-- Esperado:
-- FourSys: 5
-- TechCorp: 5
-- Innovate: 5

-- Verificar se há leads sem tenant (deve ser 0)
SELECT COUNT(*) FROM Lead WHERE tenantId IS NULL;
-- Esperado: 0
```

---

## 7. CENÁRIOS DE TESTE

### 7.1 Teste de Isolamento

**Objetivo:** Verificar que cada tenant vê apenas seus leads.

**Passos:**
1. Executar seed
2. Mockar `getCurrentTenantId()` para retornar `tenant1.id`
3. Chamar `getLeads()`
4. Verificar que retorna apenas 5 leads do FourSys

**Código:**
```typescript
// Mock getCurrentTenantId
jest.spyOn(global, 'getCurrentTenantId').mockResolvedValue(tenant1.id);

const leads = await getLeads();

expect(leads).toHaveLength(5);
expect(leads.every(l => l.tenantId === tenant1.id)).toBe(true);
```

---

### 7.2 Teste de Métricas

**Objetivo:** Verificar que métricas são calculadas por tenant.

**Passos:**
1. Executar seed
2. Mockar `getCurrentTenantId()` para retornar `tenant1.id`
3. Chamar `getDashboardMetrics()`
4. Verificar que métricas são apenas do FourSys

**Código:**
```typescript
jest.spyOn(global, 'getCurrentTenantId').mockResolvedValue(tenant1.id);

const metrics = await getDashboardMetrics();

// FourSys tem 4 leads ativos (1 fechado)
expect(metrics.activeLeads).toBe(4);

// Pipeline total = 15000 + 25000 + 35000 + 12000 = 87000
expect(metrics.pipelineTotal).toBe(87000);
```

---

## 8. DADOS DE SEED CUSTOMIZADOS

### 8.1 Adicionar Mais Tenants

```typescript
const tenant4 = await prisma.tenant.create({
  data: {
    name: 'Startup XYZ',
    slug: 'startup-xyz',
    isActive: true,
  },
});

const startupLeads = [
  {
    tenantId: tenant4.id,
    name: 'Cliente Startup 1',
    company: 'Company A',
    status: 'prospect',
    value: 5000,
    aiScore: 70,
  },
  // ... mais leads
];
```

---

### 8.2 Criar Tenant de Teste

```typescript
// Tenant específico para testes automatizados
const testTenant = await prisma.tenant.create({
  data: {
    name: 'Test Tenant',
    slug: 'test-tenant',
    isActive: true,
  },
});

// Leads de teste com dados previsíveis
const testLeads = [
  {
    tenantId: testTenant.id,
    name: 'Test Lead 1',
    company: 'Test Company',
    status: 'prospect',
    value: 1000,
    aiScore: 50,
  },
];
```

---

## 9. TROUBLESHOOTING

### 9.1 Erro: Foreign Key Constraint Failed

**Problema:**
```
Error: Foreign key constraint failed on the field: `tenantId`
```

**Causa:** Tentando criar lead sem `tenantId` ou com `tenantId` inválido.

**Solução:**
- Verificar que tenant foi criado antes dos leads
- Verificar que `tenantId` está correto

---

### 9.2 Erro: Unique Constraint Failed (slug)

**Problema:**
```
Unique constraint failed on the fields: (`slug`)
```

**Causa:** Tentando criar tenant com slug duplicado.

**Solução:**
- Usar `upsert` ao invés de `create`
- Ou resetar banco antes de executar seed

---

## 10. CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Adicionar criação de tenants no seed
- [ ] Adicionar `tenantId` a todos os leads
- [ ] Distribuir leads entre múltiplos tenants
- [ ] Usar `upsert` para evitar duplicatas
- [ ] Adicionar logs informativos
- [ ] Testar execução do seed
- [ ] Validar dados no Prisma Studio
- [ ] Verificar isolamento de dados

---

**Próximo Documento:** [07-seguranca.md](07-seguranca.md)



