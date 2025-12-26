# Glossário de Termos

**Versão:** 1.0  
**Data:** 25/12/2025  
**Analista:** Mary (Business Analyst)

---

## A

### Aggregate
Operação de agregação no Prisma (sum, count, avg, etc.) que calcula valores sobre múltiplos registros.

**Exemplo:**
```typescript
const result = await prisma.lead.aggregate({
  where: { tenantId },
  _sum: { value: true }
});
```

### ATDD (Acceptance Test-Driven Development)
Metodologia de desenvolvimento onde testes de aceitação são escritos antes do código.

---

## B

### Badge
Elemento visual (etiqueta) que exibe informação destacada, como o AI Score no card do lead.

### Backup
Cópia de segurança do banco de dados antes de operações críticas como migrations.

---

## C

### Cascade Delete
Comportamento onde deletar um registro pai (Tenant) automaticamente deleta registros filhos (Leads).

**Exemplo:**
```prisma
tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
```

### Connection Pool
Conjunto de conexões reutilizáveis ao banco de dados para melhorar performance.

### Cross-Tenant Data Leakage
Vulnerabilidade onde dados de um tenant são expostos a outro tenant.

### CRUD
Create, Read, Update, Delete - operações básicas de manipulação de dados.

---

## D

### Database Sharding
Técnica de particionamento horizontal onde dados são distribuídos entre múltiplos bancos de dados.

### Defense in Depth
Estratégia de segurança com múltiplas camadas de proteção.

**Exemplo:** Validar propriedade do lead antes E durante o update.

### DnD (Drag and Drop)
Funcionalidade de arrastar e soltar elementos na interface.

---

## E

### Entity
Objeto de negócio representado no banco de dados (ex: Lead, Tenant).

---

## F

### Foreign Key
Chave estrangeira que referencia a chave primária de outra tabela.

**Exemplo:** `tenantId` em Lead referencia `id` em Tenant.

---

## I

### IDOR (Insecure Direct Object Reference)
Vulnerabilidade onde usuário acessa recurso de outro usuário via ID direto.

**Exemplo:** Acessar `/api/leads/abc-123` de outro tenant.

### Índice (Index)
Estrutura de dados que melhora performance de queries no banco de dados.

**Exemplo:**
```prisma
@@index([tenantId, status])
```

### Índice Composto
Índice que combina múltiplas colunas para otimizar queries específicas.

---

## J

### JWT (JSON Web Token)
Token de autenticação codificado em JSON usado para sessões.

---

## L

### LGPD (Lei Geral de Proteção de Dados)
Lei brasileira de proteção de dados pessoais.

---

## M

### Migration
Script que altera a estrutura do banco de dados (adicionar tabelas, colunas, etc.).

### Middleware
Função que intercepta operações do Prisma para adicionar lógica customizada.

### Multi-tenancy
Arquitetura onde múltiplos clientes (tenants) compartilham a mesma instância da aplicação.

### MVP (Minimum Viable Product)
Versão mínima viável do produto com funcionalidades essenciais.

---

## O

### Optimistic Update
Técnica onde UI é atualizada imediatamente antes da confirmação do servidor.

### ORM (Object-Relational Mapping)
Ferramenta que mapeia objetos de código para tabelas de banco de dados (ex: Prisma).

---

## P

### Particionamento
Técnica de dividir tabela grande em partições menores para melhorar performance.

### Prisma
ORM moderno e type-safe para Node.js e TypeScript.

### Prisma Studio
Interface gráfica para visualizar e editar dados do banco de dados.

---

## R

### Read Replica
Cópia somente-leitura do banco de dados para distribuir carga de leitura.

### Revalidation
Processo de invalidar cache e buscar dados atualizados no Next.js.

**Exemplo:**
```typescript
revalidatePath('/kanban');
```

### Rollback
Reverter alterações no banco de dados para estado anterior.

### Row-Level Security (RLS)
Isolamento de dados onde cada linha tem identificador de tenant.

---

## S

### SaaS (Software as a Service)
Modelo de negócio onde software é fornecido como serviço pela internet.

### Schema
Estrutura que define tabelas, colunas e relacionamentos do banco de dados.

### Seed
Script que popula banco de dados com dados iniciais para desenvolvimento/testes.

### Server Action
Função server-side no Next.js 14+ que pode ser chamada diretamente do cliente.

### Session
Dados de autenticação do usuário armazenados entre requisições.

### Shared Database, Shared Schema
Modelo de multi-tenancy onde todos os tenants compartilham mesmo banco e schema.

### Slug
Identificador único amigável para URLs (ex: "foursys" ao invés de UUID).

### Spoofing
Ataque onde atacante se passa por outro usuário/tenant.

---

## T

### Tenant
Organização ou empresa cliente que usa o sistema multi-tenant.

### Tenant ID
Identificador único do tenant usado para isolar dados.

### Tenant Selector
Componente UI que permite usuário trocar entre tenants.

### Type-safe
Código que usa tipos estáticos para prevenir erros em tempo de compilação.

---

## U

### UUID (Universally Unique Identifier)
Identificador único de 128 bits usado como chave primária.

**Exemplo:** `abc-123-def-456-ghi-789`

### Upsert
Operação que cria registro se não existe, ou atualiza se existe.

**Exemplo:**
```typescript
await prisma.tenant.upsert({
  where: { slug: 'default' },
  update: {},
  create: { name: 'Default', slug: 'default' }
});
```

---

## W

### Where Clause
Cláusula SQL que filtra registros baseado em condições.

**Exemplo:**
```typescript
where: { tenantId, status: 'prospect' }
```

---

## Z

### Zod
Biblioteca de validação de schemas em TypeScript.

**Exemplo:**
```typescript
const schema = z.object({
  name: z.string().min(3),
  value: z.number().positive()
});
```

---

## SIGLAS COMUNS

| Sigla | Significado | Contexto |
|-------|-------------|----------|
| **API** | Application Programming Interface | Interface de comunicação |
| **CRUD** | Create, Read, Update, Delete | Operações básicas |
| **DB** | Database | Banco de dados |
| **FK** | Foreign Key | Chave estrangeira |
| **GDPR** | General Data Protection Regulation | Lei europeia de dados |
| **IDOR** | Insecure Direct Object Reference | Vulnerabilidade |
| **JWT** | JSON Web Token | Token de autenticação |
| **LGPD** | Lei Geral de Proteção de Dados | Lei brasileira de dados |
| **MVP** | Minimum Viable Product | Produto mínimo viável |
| **ORM** | Object-Relational Mapping | Mapeamento objeto-relacional |
| **PK** | Primary Key | Chave primária |
| **RLS** | Row-Level Security | Segurança por linha |
| **SaaS** | Software as a Service | Software como serviço |
| **SQL** | Structured Query Language | Linguagem de banco de dados |
| **UI** | User Interface | Interface do usuário |
| **UUID** | Universally Unique Identifier | Identificador único universal |
| **UX** | User Experience | Experiência do usuário |

---

## TERMOS ESPECÍFICOS DO PROJETO

### AI Score
Pontuação de 0-100 que simula prioridade do lead (gerada aleatoriamente no MVP).

### FourSys
Nome da empresa/tenant default usado no projeto.

### Kanban Board
Interface visual com colunas representando estágios do funil de vendas.

### Lead
Oportunidade de venda com dados de cliente e empresa.

### Pipeline
Conjunto de leads em diferentes estágios do funil de vendas.

### Status
Estado atual do lead no funil: `prospect`, `qualified`, `proposal`, `closed`.

---

## REFERÊNCIAS EXTERNAS

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [OWASP Multi-tenancy Security](https://owasp.org/www-project-multi-tenancy/)
- [LGPD - Lei 13.709/2018](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)

---

**Fim da Documentação de Multi-tenancy**

Para voltar ao índice principal: [README.md](README.md)

