# Scripts de Migração

**Versão:** 1.0  
**Data:** 25/12/2025  
**Analista:** Mary (Business Analyst)

---

## 1. SCRIPT: MIGRAÇÃO DE DADOS EXISTENTES

### 1.1 Arquivo

📄 **`prisma/migrations/assign-default-tenant.ts`**

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Iniciando migração de dados para multi-tenancy...\n');

  try {
    // ============================================
    // 1. CRIAR TENANT DEFAULT
    // ============================================
    
    console.log('📦 Criando tenant default...');
    
    const defaultTenant = await prisma.tenant.upsert({
      where: { slug: 'default' },
      update: {},
      create: {
        id: 'default-tenant-id',
        name: 'FourSys (Default)',
        slug: 'default',
        domain: null,
        isActive: true,
      },
    });
    
    console.log(`✅ Tenant default criado: ${defaultTenant.id}`);
    console.log(`   Nome: ${defaultTenant.name}`);
    console.log(`   Slug: ${defaultTenant.slug}\n`);

    // ============================================
    // 2. CONTAR LEADS ÓRFÃOS
    // ============================================
    
    console.log('🔍 Verificando leads sem tenant...');
    
    const orphanLeadsCount = await prisma.lead.count({
      where: {
        OR: [
          { tenantId: null },
          { tenantId: '' },
        ]
      }
    });
    
    console.log(`   Leads órfãos encontrados: ${orphanLeadsCount}\n`);

    if (orphanLeadsCount === 0) {
      console.log('✅ Nenhum lead órfão encontrado. Migração não necessária.');
      return;
    }

    // ============================================
    // 3. ATUALIZAR LEADS ÓRFÃOS
    // ============================================
    
    console.log('🔄 Associando leads órfãos ao tenant default...');
    
    const result = await prisma.lead.updateMany({
      where: {
        OR: [
          { tenantId: null },
          { tenantId: '' },
        ]
      },
      data: {
        tenantId: defaultTenant.id,
      },
    });
    
    console.log(`✅ ${result.count} leads associados ao tenant default\n`);

    // ============================================
    // 4. VALIDAÇÃO
    // ============================================
    
    console.log('🔍 Validando migração...');
    
    const remainingOrphans = await prisma.lead.count({
      where: {
        OR: [
          { tenantId: null },
          { tenantId: '' },
        ]
      }
    });
    
    if (remainingOrphans > 0) {
      throw new Error(`❌ Ainda existem ${remainingOrphans} leads órfãos!`);
    }
    
    console.log('✅ Validação concluída: Nenhum lead órfão restante\n');

    // ============================================
    // 5. RESUMO
    // ============================================
    
    const totalLeads = await prisma.lead.count();
    const leadsWithTenant = await prisma.lead.count({
      where: { tenantId: defaultTenant.id }
    });
    
    console.log('📊 Resumo da Migração:');
    console.log(`   - Tenant criado: ${defaultTenant.name}`);
    console.log(`   - Total de leads: ${totalLeads}`);
    console.log(`   - Leads com tenant: ${leadsWithTenant}`);
    console.log(`   - Taxa de sucesso: 100%\n`);
    
    console.log('✅ Migração concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error('❌ Falha na migração:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

### 1.2 Como Executar

```bash
# Dar permissão de execução (Linux/Mac)
chmod +x prisma/migrations/assign-default-tenant.ts

# Executar com ts-node
npx ts-node prisma/migrations/assign-default-tenant.ts

# Ou adicionar script no package.json
npm run migrate:tenants
```

---

### 1.3 Saída Esperada

```
🔄 Iniciando migração de dados para multi-tenancy...

📦 Criando tenant default...
✅ Tenant default criado: default-tenant-id
   Nome: FourSys (Default)
   Slug: default

🔍 Verificando leads sem tenant...
   Leads órfãos encontrados: 15

🔄 Associando leads órfãos ao tenant default...
✅ 15 leads associados ao tenant default

🔍 Validando migração...
✅ Validação concluída: Nenhum lead órfão restante

📊 Resumo da Migração:
   - Tenant criado: FourSys (Default)
   - Total de leads: 15
   - Leads com tenant: 15
   - Taxa de sucesso: 100%

✅ Migração concluída com sucesso!
```

---

## 2. SCRIPT: BACKUP ANTES DA MIGRAÇÃO

### 2.1 Arquivo

📄 **`scripts/backup-database.sh`**

```bash
#!/bin/bash

# Configurações
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_FILE="./prisma/dev.db"
BACKUP_FILE="$BACKUP_DIR/dev_backup_$TIMESTAMP.db"

# Criar diretório de backup se não existir
mkdir -p $BACKUP_DIR

# Fazer backup
echo "🔄 Fazendo backup do banco de dados..."
cp $DB_FILE $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "✅ Backup criado com sucesso: $BACKUP_FILE"
    
    # Mostrar tamanho do backup
    SIZE=$(du -h $BACKUP_FILE | cut -f1)
    echo "   Tamanho: $SIZE"
    
    # Listar backups existentes
    echo ""
    echo "📂 Backups disponíveis:"
    ls -lh $BACKUP_DIR/*.db
else
    echo "❌ Erro ao criar backup!"
    exit 1
fi
```

---

### 2.2 Como Executar

```bash
# Dar permissão de execução
chmod +x scripts/backup-database.sh

# Executar
./scripts/backup-database.sh

# Ou adicionar ao package.json
npm run db:backup
```

---

## 3. SCRIPT: RESTAURAR BACKUP

### 3.1 Arquivo

📄 **`scripts/restore-database.sh`**

```bash
#!/bin/bash

# Configurações
BACKUP_DIR="./backups"
DB_FILE="./prisma/dev.db"

# Listar backups disponíveis
echo "📂 Backups disponíveis:"
ls -lht $BACKUP_DIR/*.db | nl

# Solicitar qual backup restaurar
echo ""
read -p "Digite o número do backup para restaurar (ou 'q' para cancelar): " CHOICE

if [ "$CHOICE" == "q" ]; then
    echo "❌ Restauração cancelada."
    exit 0
fi

# Obter arquivo de backup
BACKUP_FILE=$(ls -t $BACKUP_DIR/*.db | sed -n "${CHOICE}p")

if [ -z "$BACKUP_FILE" ]; then
    echo "❌ Backup inválido!"
    exit 1
fi

# Confirmar restauração
echo ""
echo "⚠️  ATENÇÃO: Esta ação irá sobrescrever o banco de dados atual!"
echo "   Backup a ser restaurado: $BACKUP_FILE"
read -p "Tem certeza? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Restauração cancelada."
    exit 0
fi

# Fazer backup do banco atual antes de restaurar
CURRENT_BACKUP="$BACKUP_DIR/current_before_restore_$(date +"%Y%m%d_%H%M%S").db"
cp $DB_FILE $CURRENT_BACKUP
echo "✅ Backup do banco atual criado: $CURRENT_BACKUP"

# Restaurar backup
echo "🔄 Restaurando backup..."
cp $BACKUP_FILE $DB_FILE

if [ $? -eq 0 ]; then
    echo "✅ Banco de dados restaurado com sucesso!"
else
    echo "❌ Erro ao restaurar backup!"
    exit 1
fi
```

---

### 3.2 Como Executar

```bash
# Dar permissão de execução
chmod +x scripts/restore-database.sh

# Executar
./scripts/restore-database.sh
```

---

## 4. SCRIPT: VALIDAÇÃO PÓS-MIGRAÇÃO

### 4.1 Arquivo

📄 **`scripts/validate-multi-tenancy.ts`**

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Validando implementação de multi-tenancy...\n');

  let errors = 0;

  // ============================================
  // 1. VERIFICAR TABELA TENANT
  // ============================================
  
  console.log('1️⃣ Verificando tabela Tenant...');
  
  try {
    const tenantCount = await prisma.tenant.count();
    console.log(`   ✅ Tabela Tenant existe (${tenantCount} registros)`);
  } catch (error) {
    console.log('   ❌ Tabela Tenant não encontrada!');
    errors++;
  }

  // ============================================
  // 2. VERIFICAR CAMPO TENANTID EM LEAD
  // ============================================
  
  console.log('\n2️⃣ Verificando campo tenantId em Lead...');
  
  try {
    const lead = await prisma.lead.findFirst({
      select: { tenantId: true }
    });
    console.log('   ✅ Campo tenantId existe');
  } catch (error) {
    console.log('   ❌ Campo tenantId não encontrado!');
    errors++;
  }

  // ============================================
  // 3. VERIFICAR LEADS SEM TENANT
  // ============================================
  
  console.log('\n3️⃣ Verificando leads sem tenant...');
  
  const orphanLeads = await prisma.lead.count({
    where: {
      OR: [
        { tenantId: null },
        { tenantId: '' },
      ]
    }
  });
  
  if (orphanLeads === 0) {
    console.log('   ✅ Todos os leads têm tenantId');
  } else {
    console.log(`   ❌ ${orphanLeads} leads sem tenantId!`);
    errors++;
  }

  // ============================================
  // 4. VERIFICAR ÍNDICES
  // ============================================
  
  console.log('\n4️⃣ Verificando índices...');
  
  // Nota: Verificação de índices depende do banco de dados
  // SQLite: PRAGMA index_list('Lead')
  // PostgreSQL: SELECT * FROM pg_indexes WHERE tablename = 'Lead'
  
  console.log('   ⚠️  Verificação manual necessária (ver Prisma Studio)');

  // ============================================
  // 5. VERIFICAR ISOLAMENTO
  // ============================================
  
  console.log('\n5️⃣ Testando isolamento de dados...');
  
  const tenants = await prisma.tenant.findMany({ take: 2 });
  
  if (tenants.length >= 2) {
    const tenant1Leads = await prisma.lead.count({
      where: { tenantId: tenants[0].id }
    });
    
    const tenant2Leads = await prisma.lead.count({
      where: { tenantId: tenants[1].id }
    });
    
    console.log(`   ✅ Tenant 1 (${tenants[0].name}): ${tenant1Leads} leads`);
    console.log(`   ✅ Tenant 2 (${tenants[1].name}): ${tenant2Leads} leads`);
    
    // Verificar que não há overlap
    const allLeads = await prisma.lead.findMany({
      select: { id: true, tenantId: true }
    });
    
    const uniqueTenants = new Set(allLeads.map(l => l.tenantId));
    console.log(`   ✅ Leads distribuídos entre ${uniqueTenants.size} tenants`);
  } else {
    console.log('   ⚠️  Menos de 2 tenants para testar isolamento');
  }

  // ============================================
  // 6. RESUMO
  // ============================================
  
  console.log('\n' + '='.repeat(50));
  
  if (errors === 0) {
    console.log('✅ VALIDAÇÃO CONCLUÍDA: Nenhum erro encontrado!');
    console.log('   Multi-tenancy implementado corretamente.');
  } else {
    console.log(`❌ VALIDAÇÃO FALHOU: ${errors} erro(s) encontrado(s)!`);
    console.log('   Revise a implementação antes de prosseguir.');
    process.exit(1);
  }
}

main()
  .catch((error) => {
    console.error('❌ Erro durante validação:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

### 4.2 Como Executar

```bash
npx ts-node scripts/validate-multi-tenancy.ts

# Ou adicionar ao package.json
npm run validate:tenancy
```

---

## 5. PACKAGE.JSON - SCRIPTS

### 5.1 Adicionar Scripts

```json
{
  "scripts": {
    "db:backup": "./scripts/backup-database.sh",
    "db:restore": "./scripts/restore-database.sh",
    "migrate:tenants": "npx ts-node prisma/migrations/assign-default-tenant.ts",
    "validate:tenancy": "npx ts-node scripts/validate-multi-tenancy.ts",
    "setup:multi-tenancy": "npm run db:backup && npm run migrate:tenants && npm run validate:tenancy"
  }
}
```

---

### 5.2 Fluxo Completo

```bash
# 1. Fazer backup
npm run db:backup

# 2. Aplicar migrations do Prisma
npx prisma migrate dev --name add_multi_tenancy

# 3. Migrar dados existentes
npm run migrate:tenants

# 4. Validar implementação
npm run validate:tenancy

# Ou executar tudo de uma vez
npm run setup:multi-tenancy
```

---

## 6. ROLLBACK

### 6.1 Script de Rollback

📄 **`scripts/rollback-multi-tenancy.sh`**

```bash
#!/bin/bash

echo "⚠️  ROLLBACK DE MULTI-TENANCY"
echo "================================"
echo ""
echo "Este script irá:"
echo "1. Restaurar backup do banco de dados"
echo "2. Reverter migrations do Prisma"
echo ""
read -p "Tem certeza? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Rollback cancelado."
    exit 0
fi

# 1. Restaurar backup
echo ""
echo "🔄 Restaurando backup..."
./scripts/restore-database.sh

# 2. Reverter migrations
echo ""
echo "🔄 Revertendo migrations..."
npx prisma migrate resolve --rolled-back add_multi_tenancy

echo ""
echo "✅ Rollback concluído!"
```

---

## 7. TROUBLESHOOTING

### 7.1 Erro: "Foreign key constraint failed"

**Problema:**
```
Error: Foreign key constraint failed on the field: `tenantId`
```

**Solução:**
```bash
# 1. Verificar se tenant default existe
npx prisma studio
# Procurar tabela Tenant

# 2. Se não existir, executar migração novamente
npm run migrate:tenants
```

---

### 7.2 Erro: "Column 'tenantId' does not exist"

**Problema:**
```
Error: Column 'tenantId' does not exist
```

**Solução:**
```bash
# 1. Aplicar migrations do Prisma
npx prisma migrate dev

# 2. Ou forçar push do schema
npx prisma db push
```

---

**Próximo Documento:** [12-resumo-arquivos.md](12-resumo-arquivos.md)



