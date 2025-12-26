# Fase 2: Configuração do Banco de Dados

**Duração Estimada:** 45 minutos  
**Pré-requisito:** Fase 1 concluída  
**Objetivo:** Configurar Prisma, criar schema e popular banco com dados de teste  
**Status:** 🟡 Pendente

---

## 2.1 Inicializar Prisma

### Comando de Inicialização

```bash
# Inicializar Prisma com SQLite
npx prisma init --datasource-provider sqlite
```

### O Que Foi Criado

```
✅ prisma/schema.prisma   - Schema do banco de dados
✅ .env                   - Variáveis de ambiente
```

### Verificar Criação

```bash
# Listar pasta prisma
ls prisma/

# Deve mostrar: schema.prisma
```

---

## 2.2 Criar Schema Prisma

### Arquivo: `prisma/schema.prisma`

**Substituir conteúdo completo:**

```prisma
// Prisma Schema para CRM B2B FourSys MVP
// Database: SQLite (Local Development)

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// Model Principal: Lead
model Lead {
  id          String   @id @default(uuid())
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

  @@index([status])
  @@index([aiScore])
}
```

### Explicação dos Campos

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | String (UUID) | Identificador único |
| `name` | String | Nome do cliente |
| `company` | String | Nome da empresa |
| `status` | String | Status no funil (prospect/qualified/proposal/closed) |
| `value` | Float | Valor estimado do negócio (R$) |
| `aiScore` | Int | Score de priorização (0-100) |
| `email` | String? | Email (opcional) |
| `phone` | String? | Telefone (opcional) |
| `lastContact` | DateTime | Data do último contato |
| `createdAt` | DateTime | Data de criação |
| `updatedAt` | DateTime | Data de atualização |

---

## 2.3 Configurar Variáveis de Ambiente

### Arquivo: `.env`

**Editar e adicionar:**

```env
# Database
DATABASE_URL="file:./dev.db"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Arquivo: `.env.example`

**Criar para versionamento:**

```env
# Database
DATABASE_URL="file:./dev.db"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Adicionar ao .gitignore

**Arquivo:** `.gitignore` (adicionar se não existe)

```
# Database
*.db
*.db-journal
/prisma/dev.db
/prisma/dev.db-journal

# Prisma
/prisma/migrations

# Environment
.env
.env*.local
```

---

## 2.4 Criar Prisma Client Singleton

### Arquivo: `src/lib/prisma.ts`

**Criar arquivo:**

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Por Que Singleton?

- Evita múltiplas conexões no modo desenvolvimento
- Hot reload do Next.js não cria novas instâncias
- Performance otimizada

---

## 2.5 Criar Script de Seed

### Arquivo: `prisma/seed.ts`

**Criar arquivo:**

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Dados fictícios brasileiros
const LEAD_DATA = [
  { name: 'Carlos Silva', company: 'Tech Solutions Ltda', value: 15000 },
  { name: 'Ana Paula Costa', company: 'Inovação Digital', value: 8500 },
  { name: 'Roberto Mendes', company: 'Consultoria Estratégica', value: 22000 },
  { name: 'Juliana Santos', company: 'Marketing Pro', value: 12000 },
  { name: 'Fernando Oliveira', company: 'Vendas Inteligentes', value: 18500 },
  { name: 'Mariana Ferreira', company: 'Gestão Empresarial', value: 9500 },
  { name: 'Pedro Almeida', company: 'Automação Industrial', value: 35000 },
  { name: 'Camila Rodrigues', company: 'E-commerce Brasil', value: 14000 },
  { name: 'Lucas Martins', company: 'Logística Express', value: 11000 },
  { name: 'Beatriz Lima', company: 'Recursos Humanos Plus', value: 7500 },
  { name: 'Rafael Souza', company: 'Contabilidade Digital', value: 16000 },
  { name: 'Patrícia Gomes', company: 'Advocacia Corporativa', value: 28000 },
  { name: 'Thiago Pereira', company: 'Desenvolvimento Web', value: 19000 },
  { name: 'Fernanda Ribeiro', company: 'Design Criativo', value: 10500 },
  { name: 'Gustavo Carvalho', company: 'Segurança da Informação', value: 42000 },
];

const STATUSES = ['prospect', 'qualified', 'proposal', 'closed'] as const;

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes
  await prisma.lead.deleteMany();
  console.log('🗑️  Dados antigos removidos');

  // Criar leads
  const leads = [];
  for (const data of LEAD_DATA) {
    // Distribuir leads entre os status
    const randomStatus = STATUSES[Math.floor(Math.random() * STATUSES.length)];
    
    // Gerar AI Score aleatório (0-100)
    const aiScore = Math.floor(Math.random() * 101);
    
    // Gerar data de contato aleatória (últimos 30 dias)
    const daysAgo = Math.floor(Math.random() * 30);
    const lastContact = new Date();
    lastContact.setDate(lastContact.getDate() - daysAgo);

    const lead = await prisma.lead.create({
      data: {
        name: data.name,
        company: data.company,
        status: randomStatus,
        value: data.value,
        aiScore,
        email: `${data.name.toLowerCase().replace(' ', '.')}@${data.company.toLowerCase().replace(/\s+/g, '')}.com.br`,
        phone: `(11) 9${Math.floor(Math.random() * 9000 + 1000)}-${Math.floor(Math.random() * 9000 + 1000)}`,
        lastContact,
      },
    });

    leads.push(lead);
  }

  console.log(`✅ ${leads.length} leads criados com sucesso!`);
  
  // Estatísticas
  const stats = {
    prospect: leads.filter(l => l.status === 'prospect').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    proposal: leads.filter(l => l.status === 'proposal').length,
    closed: leads.filter(l => l.status === 'closed').length,
  };

  console.log('\n📊 Distribuição por Status:');
  console.log(`   Prospect: ${stats.prospect}`);
  console.log(`   Qualificado: ${stats.qualified}`);
  console.log(`   Proposta: ${stats.proposal}`);
  console.log(`   Fechado: ${stats.closed}`);
  
  const totalValue = leads.reduce((sum, lead) => sum + lead.value, 0);
  console.log(`\n💰 Valor Total do Pipeline: R$ ${totalValue.toLocaleString('pt-BR')}`);
}

main()
  .catch((e) => {
    console.error('❌ Erro durante seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## 2.6 Configurar Scripts no Package.json

### Arquivo: `package.json`

**Adicionar na seção "scripts":**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:push": "prisma db push",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset --force",
    "db:generate": "prisma generate"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

---

## 2.7 Executar Setup do Banco

### Passo 1: Gerar Prisma Client

```bash
npm run db:generate
```

**Saída esperada:**
```
✔ Generated Prisma Client (5.x.x) to ./node_modules/@prisma/client
```

### Passo 2: Criar Banco de Dados

```bash
npm run db:push
```

**Saída esperada:**
```
✔ Your database is now in sync with your schema.
✔ Generated Prisma Client (5.x.x)
```

### Passo 3: Popular com Dados

```bash
npm run db:seed
```

**Saída esperada:**
```
🌱 Iniciando seed do banco de dados...
🗑️  Dados antigos removidos
✅ 15 leads criados com sucesso!

📊 Distribuição por Status:
   Prospect: 4
   Qualificado: 3
   Proposta: 5
   Fechado: 3

💰 Valor Total do Pipeline: R$ 249.000
```

### Passo 4: Visualizar Dados (Opcional)

```bash
npm run db:studio
```

**O que acontece:**
- Abre navegador em `http://localhost:5555`
- Interface visual do Prisma Studio
- Permite ver e editar dados do banco

---

## 2.8 Verificar Banco de Dados

### Verificar Arquivo do Banco

```bash
# Listar arquivos na pasta prisma
ls -la prisma/

# Deve mostrar:
# - schema.prisma
# - dev.db          ← Banco de dados SQLite
# - dev.db-journal  ← Arquivo de log (temporário)
```

### Testar Conexão com Prisma Client

**Criar arquivo temporário:** `test-db.js`

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.lead.count();
  console.log(`✅ Conexão OK! Total de leads: ${count}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Executar:**

```bash
node test-db.js

# Saída esperada:
# ✅ Conexão OK! Total de leads: 15
```

**Deletar arquivo de teste:**

```bash
rm test-db.js
```

---

## Checklist de Conclusão

### Prisma Setup
- [ ] Prisma inicializado com SQLite
- [ ] Schema criado com model Lead
- [ ] Prisma Client gerado sem erros

### Variáveis de Ambiente
- [ ] `.env` criado com DATABASE_URL
- [ ] `.env.example` criado para versionamento
- [ ] `.env` adicionado ao .gitignore

### Prisma Client
- [ ] `src/lib/prisma.ts` criado
- [ ] Singleton pattern implementado
- [ ] Logs configurados para desenvolvimento

### Script de Seed
- [ ] `prisma/seed.ts` criado
- [ ] 15 leads fictícios definidos
- [ ] Scripts npm configurados no package.json

### Banco de Dados
- [ ] Banco criado (`dev.db` existe)
- [ ] Seed executado com sucesso
- [ ] 15 leads inseridos no banco
- [ ] Dados visíveis no Prisma Studio

### Verificação Final
- [ ] Prisma Client funciona
- [ ] Conexão com banco OK
- [ ] Dados podem ser consultados
- [ ] Sem erros no console

---

## Comandos Úteis

### Resetar Banco (Limpar e Popular Novamente)

```bash
npm run db:reset
```

### Ver Dados no Prisma Studio

```bash
npm run db:studio
```

### Regenerar Prisma Client (Após Mudanças no Schema)

```bash
npm run db:generate
npm run db:push
```

---

## Troubleshooting

### Erro: "Environment variable not found: DATABASE_URL"

```bash
# Verificar se .env existe
cat .env

# Se não existir, criar:
echo 'DATABASE_URL="file:./dev.db"' > .env
```

### Erro: "Can't reach database server"

```bash
# Deletar banco e recriar
rm prisma/dev.db
npm run db:push
npm run db:seed
```

### Erro: Seed não executa

```bash
# Verificar se tsx está instalado
npm install -D tsx

# Executar seed manualmente
npx tsx prisma/seed.ts
```

---

## Próxima Fase

➡️ **Fase 3: Backend - Server Actions**
- Criar Server Actions para CRUD de leads
- Implementar validações
- Configurar revalidação de cache

**Arquivo:** `docs/design/fase-03-backend-server-actions.md`

---

**Preparado por:** Winston (Architect) 🏗️  
**Data:** 25/12/2025  
**Status:** ✅ Pronto para Execução

