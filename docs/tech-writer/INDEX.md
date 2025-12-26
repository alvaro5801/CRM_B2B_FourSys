# Documentação Técnica - CRM B2B FourSys

**Versão:** 2.0.0  
**Data:** 26/12/2025  
**Autor:** Paige (Senior Technical Writer) 📚  
**Status:** ✅ Completo

---

## 📋 Sobre o CRM FourSys

O **CRM B2B FourSys** é um sistema de gestão de relacionamento com clientes (Customer Relationship Management) focado em empresas B2B. O sistema oferece gestão visual de leads através de um Kanban Board intuitivo, com suporte a multi-tenancy para isolamento completo de dados entre organizações.

### Principais Características

- **Multi-Tenancy Nativo:** Isolamento completo de dados por organização
- **Gestão Visual de Leads:** Kanban Board com drag & drop fluido
- **Dashboard Analítico:** Métricas em tempo real do pipeline de vendas
- **Validações Robustas:** Prevenção de duplicatas e máscaras de input
- **Interface Moderna:** Next.js 15 com App Router e Server Components
- **Segurança:** Row-Level Security com validação em todas as operações

---

## 📚 Índice de Documentação

### 🏗️ Arquitetura

#### [Multi-Tenancy](architecture/multi-tenancy.md)
Explica o modelo de isolamento de dados por tenant, incluindo:
- Estratégia de Row-Level Security
- Captura automática de tenant na sessão
- Fluxo de autenticação e isolamento
- Diagrama Mermaid do fluxo completo

#### [Database](architecture/database.md)
Documenta o esquema do Prisma e estrutura de dados:
- Modelos Tenant, User e Lead
- Constraints de unicidade por tenant
- Índices para performance
- Relações e cascatas

---

### ⚡ Funcionalidades

#### [Gestão de Leads](features/leads-management.md)
Documenta o ciclo de vida completo dos leads:
- Estados do pipeline (Prospect → Qualificado → Proposta → Fechado)
- Máscaras de input (Moeda BRL e Telefone BR)
- Operações CRUD completas
- Validação de duplicatas
- Edição e exclusão

---

### 🔌 API

#### [Server Actions](api/server-actions.md)
Referência completa das Server Actions:
- **Leads:** getLeads, createLead, updateLead, updateLeadStatus, deleteLead
- **Auth:** signup, login, logout
- **Tenants:** getCurrentTenant, getTenantStats
- **Users:** getTenantUsers, createUser
- Parâmetros, retornos e tratamento de erros

---

### 💻 Desenvolvimento

#### [Style Guide](development/style-guide.md)
Padrões de código e convenções:
- Padrão de Toasts (cores, z-index, comportamento)
- Nomenclatura e organização de pastas
- Next.js 15 App Router e Route Groups
- Convenções de código TypeScript

---

## 🎯 Como Usar Esta Documentação

### Para Desenvolvedores Novos

1. Comece com [Multi-Tenancy](architecture/multi-tenancy.md) para entender o conceito fundamental
2. Leia [Database](architecture/database.md) para conhecer a estrutura de dados
3. Explore [Gestão de Leads](features/leads-management.md) para entender o fluxo principal
4. Consulte [Server Actions](api/server-actions.md) como referência da API

### Para Desenvolvedores Experientes

1. [Server Actions](api/server-actions.md) - Referência rápida da API
2. [Style Guide](development/style-guide.md) - Padrões e convenções
3. [Multi-Tenancy](architecture/multi-tenancy.md) - Regras de isolamento

### Para Arquitetos

1. [Multi-Tenancy](architecture/multi-tenancy.md) - Estratégia de isolamento
2. [Database](architecture/database.md) - Modelagem de dados
3. [Server Actions](api/server-actions.md) - Contratos de API

---

## 🔒 Conceitos Fundamentais

### Multi-Tenancy

O sistema implementa **Row-Level Security** onde:
- Cada registro (Lead, User) pertence a um Tenant
- O `tenantId` é capturado automaticamente da sessão
- **NUNCA** aceita `tenantId` como parâmetro do cliente
- Todas as queries filtram automaticamente por tenant
- Usuário não vê e não interage com o conceito de "tenant"

### Termo "Lead"

**IMPORTANTE:** O sistema utiliza o termo **"Lead"** (não "Cliente") para representar oportunidades de negócio no pipeline de vendas. Um Lead passa por diferentes estágios até se tornar um negócio fechado.

### Segurança

- Validação de propriedade em todas as operações
- Hash de senhas com bcrypt
- Prevenção de duplicatas por tenant
- Sanitização de inputs
- Tratamento de erros sem expor informações sensíveis

---

## 📊 Estrutura de Arquivos

```
tech-writer/
├── INDEX.md                              ← Este arquivo
├── architecture/
│   ├── multi-tenancy.md                  ← Isolamento de dados
│   └── database.md                       ← Esquema do Prisma
├── features/
│   └── leads-management.md               ← Gestão de Leads
├── api/
│   └── server-actions.md                 ← Referência da API
└── development/
    └── style-guide.md                    ← Padrões de código
```

---

## 🔄 Atualizações e Manutenção

Esta documentação é mantida sincronizada com o código-fonte. Todas as mudanças significativas no código devem ser refletidas aqui.

### Última Atualização

- **Data:** 26/12/2025
- **Versão:** 2.0.0
- **Mudanças:**
  - Documentação completa de multi-tenancy
  - Atualização para termo "Lead" (substituindo "Cliente")
  - Documentação de máscaras de input
  - Padrões de Toast atualizados
  - Server Actions completas

---

## 📞 Suporte

Para dúvidas sobre a documentação:

1. Consulte o documento específico no índice acima
2. Verifique o código-fonte em `src/`
3. Entre em contato com a equipe de desenvolvimento

---

## 🎓 Recursos Adicionais

### Documentação Externa

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Documentação do Projeto

- [README.md](../README.md) - Visão geral do projeto
- [Product Brief](../docs/pm/product-brief.md) - Requisitos do produto
- [Tech Spec](../docs/archer/tech-spec.md) - Especificação técnica original

---

## ✅ Checklist de Qualidade

Toda a documentação nesta pasta foi:

- [x] Revisada para consistência com o código
- [x] Validada quanto a exemplos funcionais
- [x] Verificada para uso do termo "Lead"
- [x] Atualizada com multi-tenancy
- [x] Revisada para gramática e clareza
- [x] Testada quanto a links quebrados

---

**Documentado por:** Paige (Senior Technical Writer) 📚  
**Versão:** 2.0.0  
**Data:** 26/12/2025  
**Status:** ✅ Completo e Sincronizado com Código

