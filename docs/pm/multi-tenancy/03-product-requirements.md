# Product Requirements Document (PRD) - Multi-tenancy

**Versão:** 1.0  
**Data:** 25/12/2025  
**Product Manager:** John  
**Status:** 🟢 Aprovado para Desenvolvimento

---

## 1. VISÃO GERAL

### 1.1 Objetivo
Implementar isolamento de dados por tenant (multi-tenancy) no CRM FourSys para permitir que múltiplas empresas clientes usem a mesma instância com total segurança e isolamento.

### 1.2 Escopo
**Incluído:**
- ✅ Row-Level Security (tenantId em todas as tabelas)
- ✅ Isolamento automático em Server Actions
- ✅ Autenticação com tenant context
- ✅ Onboarding self-service
- ✅ Gestão básica de tenants

**Excluído:**
- ❌ Multi-tenant por usuário (Fase 3)
- ❌ Tenant Selector UI (Fase 3)
- ❌ Customizações por tenant
- ❌ Subdomain routing (futuro)
- ❌ White-label (futuro)

---

## 2. REQUISITOS FUNCIONAIS

### RF001 - Isolamento de Dados por Tenant
**Prioridade:** 🔴 Crítica  
**Complexidade:** Alta

**Descrição:**  
Cada tenant (empresa cliente) deve ver apenas seus próprios dados. Impossibilidade de acesso cruzado entre tenants.

**Critérios de Aceitação:**
- ✅ Todas as queries incluem filtro `where: { tenantId }`
- ✅ Tenant A não consegue ver leads do Tenant B
- ✅ Tenant A não consegue atualizar/deletar leads do Tenant B
- ✅ Dashboard mostra apenas métricas do tenant atual
- ✅ Kanban Board mostra apenas leads do tenant atual

**Validação:**
- Testes automatizados de isolamento
- Tentativa de IDOR deve falhar
- Code review focado em segurança

---

### RF002 - Criação Automática de Tenant
**Prioridade:** 🔴 Crítica  
**Complexidade:** Média

**Descrição:**  
Durante signup, sistema cria automaticamente um novo tenant para a empresa.

**Fluxo:**
1. Usuário acessa página de signup
2. Preenche dados da empresa + dados pessoais
3. Sistema cria:
   - Novo `Tenant` (nome, slug único)
   - Primeiro `User` (admin do tenant)
4. Usuário é redirecionado para dashboard

**Critérios de Aceitação:**
- ✅ Tenant criado com slug único
- ✅ Primeiro usuário é admin
- ✅ Usuário consegue criar leads imediatamente
- ✅ Tempo de onboarding < 5 minutos

**Validação:**
- Teste end-to-end de signup
- Verificar unicidade de slug
- Verificar criação de tenant + user

---

### RF003 - Autenticação com Tenant Context
**Prioridade:** 🔴 Crítica  
**Complexidade:** Alta

**Descrição:**  
Sistema de autenticação que inclui `tenantId` no token/sessão.

**Implementação:**
- Usar NextAuth.js
- Token JWT contém `tenantId`
- Server Actions extraem `tenantId` da sessão

**Critérios de Aceitação:**
- ✅ Login funcional
- ✅ Sessão contém `tenantId`
- ✅ `getCurrentTenantId()` retorna valor correto
- ✅ Logout limpa sessão

**Validação:**
- Testar login/logout
- Verificar token JWT
- Testar sessão expirada

---

### RF004 - Gestão de Tenants (Admin)
**Prioridade:** 🟡 Média  
**Complexidade:** Baixa

**Descrição:**  
Funções básicas para gerenciar tenants.

**Funcionalidades:**
- Listar todos os tenants (admin global)
- Ver detalhes de um tenant
- Desativar tenant (soft delete)
- Ver estatísticas de uso

**Critérios de Aceitação:**
- ✅ Apenas admin global acessa
- ✅ Listagem paginada de tenants
- ✅ Desativação não deleta dados
- ✅ Estatísticas precisas

**Validação:**
- Testar permissões
- Verificar soft delete
- Validar estatísticas

---

### RF005 - Migração de Dados Existentes
**Prioridade:** 🔴 Crítica  
**Complexidade:** Média

**Descrição:**  
Migrar leads existentes para tenant default.

**Processo:**
1. Criar tenant "FourSys (Default)"
2. Associar todos os leads órfãos ao tenant default
3. Validar que nenhum lead ficou sem tenant

**Critérios de Aceitação:**
- ✅ Tenant default criado
- ✅ Todos os leads têm `tenantId`
- ✅ Nenhum dado perdido
- ✅ Backup restaurável

**Validação:**
- Contar leads antes/depois
- Verificar integridade referencial
- Testar restauração de backup

---

## 3. REQUISITOS NÃO-FUNCIONAIS

### RNF001 - Segurança
**Prioridade:** 🔴 Crítica

**Requisitos:**
- ✅ Zero data leakage entre tenants
- ✅ HTTPS obrigatório em produção
- ✅ HttpOnly cookies para sessão
- ✅ SameSite=Strict
- ✅ Token rotation a cada 24h
- ✅ Validação de propriedade em todas as operações

**Validação:**
- Testes de penetração
- Auditoria de segurança
- Code review rigoroso

---

### RNF002 - Performance
**Prioridade:** 🔴 Crítica

**Requisitos:**
- ✅ Queries com filtro de tenant < 200ms
- ✅ Dashboard carrega em < 1s
- ✅ Kanban Board carrega em < 1s
- ✅ Índices adequados em todas as queries

**Validação:**
- APM (Application Performance Monitoring)
- Load testing com 100 tenants
- Análise de slow queries

---

### RNF003 - Escalabilidade
**Prioridade:** 🟡 Média

**Requisitos:**
- ✅ Suporte para 1.000 tenants sem degradação
- ✅ Suporte para 100.000 leads totais
- ✅ Crescimento horizontal possível

**Validação:**
- Load testing com 1.000 tenants
- Monitoramento de recursos
- Plano de sharding documentado

---

### RNF004 - Disponibilidade
**Prioridade:** 🟡 Média

**Requisitos:**
- ✅ Uptime de 99.9% (8,76 horas de downtime/ano)
- ✅ Backup automático diário
- ✅ Rollback em < 15 minutos

**Validação:**
- Monitoramento 24/7
- Testes de disaster recovery
- Documentação de runbooks

---

### RNF005 - Compliance (LGPD/GDPR)
**Prioridade:** 🟡 Média

**Requisitos:**
- ✅ Isolamento de dados garantido
- ✅ Exportação de dados por tenant
- ✅ Deleção completa de tenant (direito ao esquecimento)
- ✅ Logs de auditoria

**Validação:**
- Auditoria de compliance
- Testes de exportação/deleção
- Revisão legal

---

## 4. USER STORIES

### US001 - Como Admin, quero criar minha conta e começar a usar
**Prioridade:** 🔴 Crítica

**Narrativa:**  
Como gestor de vendas de uma PME, quero me cadastrar no CRM e começar a usar imediatamente, sem esperar aprovação manual.

**Critérios de Aceitação:**
- Dado que acesso a página de signup
- Quando preencho dados da empresa e meus dados
- Então minha conta é criada automaticamente
- E sou redirecionado para o dashboard
- E posso criar meu primeiro lead

**Estimativa:** 8 pontos

---

### US002 - Como Usuário, quero ver apenas leads da minha empresa
**Prioridade:** 🔴 Crítica

**Narrativa:**  
Como vendedor, quero ter certeza de que vejo apenas os leads da minha empresa, sem risco de ver dados de outras empresas.

**Critérios de Aceitação:**
- Dado que estou autenticado como Tenant A
- Quando acesso o Kanban Board
- Então vejo apenas leads do Tenant A
- E não vejo leads de outros tenants
- E não consigo acessar leads de outros tenants via URL

**Estimativa:** 5 pontos

---

### US003 - Como Admin, quero convidar membros da equipe
**Prioridade:** 🟡 Média

**Narrativa:**  
Como admin do tenant, quero convidar outros usuários da minha empresa para usar o CRM.

**Critérios de Aceitação:**
- Dado que sou admin do tenant
- Quando envio convite por email
- Então o usuário recebe link de ativação
- E ao ativar, é associado ao meu tenant
- E tem acesso aos mesmos leads que eu

**Estimativa:** 5 pontos

---

### US004 - Como Desenvolvedor, quero garantir isolamento de dados
**Prioridade:** 🔴 Crítica

**Narrativa:**  
Como desenvolvedor, quero ter certeza de que todas as queries incluem filtro de tenant automaticamente.

**Critérios de Aceitação:**
- Dado que implemento uma nova Server Action
- Quando faço query no banco
- Então o sistema me força a incluir `tenantId`
- E testes automatizados validam isolamento
- E code review verifica segurança

**Estimativa:** 8 pontos

---

## 5. FLUXOS DE USUÁRIO

### Fluxo 1: Signup e Onboarding
```
1. Usuário acessa /signup
2. Preenche:
   - Nome da Empresa
   - Email
   - Senha
   - Nome completo
3. Clica "Criar Conta"
4. Sistema:
   - Valida dados
   - Cria Tenant (slug único)
   - Cria User (admin)
   - Gera sessão com tenantId
5. Redireciona para /dashboard
6. Mostra tutorial rápido (opcional)
7. Usuário cria primeiro lead
```

### Fluxo 2: Login
```
1. Usuário acessa /login
2. Preenche email + senha
3. Clica "Entrar"
4. Sistema:
   - Valida credenciais
   - Busca tenantId do usuário
   - Cria sessão com tenantId
5. Redireciona para /dashboard
6. Dashboard mostra dados do tenant
```

### Fluxo 3: Criar Lead (com Multi-tenancy)
```
1. Usuário autenticado acessa Kanban
2. Clica "Novo Lead"
3. Preenche formulário
4. Clica "Salvar"
5. Sistema:
   - Extrai tenantId da sessão
   - Adiciona tenantId aos dados
   - Persiste lead
6. Lead aparece no Kanban
7. Dashboard atualiza métricas
```

---

## 6. ARQUITETURA DE DADOS

### 6.1 Model Tenant
```prisma
model Tenant {
  id        String   @id @default(uuid())
  name      String   // Nome da empresa
  slug      String   @unique // URL-friendly
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  leads     Lead[]
  users     User[]
  
  @@index([slug])
  @@index([isActive])
}
```

### 6.2 Model Lead (Atualizado)
```prisma
model Lead {
  id          String   @id @default(uuid())
  tenantId    String   // ← NOVO
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
  
  @@index([tenantId])
  @@index([tenantId, status])
  @@index([tenantId, aiScore])
}
```

### 6.3 Model User (Novo)
```prisma
model User {
  id        String   @id @default(uuid())
  tenantId  String
  email     String   @unique
  name      String
  password  String   // Hashed
  role      String   @default("user") // admin | user
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  @@index([tenantId])
  @@index([email])
}
```

---

## 7. SEGURANÇA

### 7.1 Princípios de Segurança

**Princípio 1: Never Trust Client Input**
- NUNCA aceitar `tenantId` do cliente
- SEMPRE obter de fonte confiável (sessão)

**Princípio 2: Defense in Depth**
- Filtro em Server Actions
- Validação de propriedade
- Índices de performance
- Testes automatizados

**Princípio 3: Fail Secure**
- Se `tenantId` não encontrado → erro
- Se sessão inválida → logout
- Se query sem tenant → erro

---

### 7.2 Vulnerabilidades e Mitigações

| Vulnerabilidade | Mitigação |
|-----------------|-----------|
| **Tenant ID Spoofing** | Obter tenantId apenas da sessão |
| **IDOR** | Validar propriedade antes de operações |
| **Data Leakage** | Filtro obrigatório em todas as queries |
| **Session Hijacking** | HTTPS + HttpOnly + SameSite cookies |
| **SQL Injection** | Usar Prisma (parametrização automática) |

---

## 8. MÉTRICAS DE SUCESSO

### 8.1 Métricas Técnicas
| Métrica | Meta | Como Medir |
|---------|------|------------|
| Queries com filtro de tenant | 100% | Code review |
| Testes de isolamento passando | 100% | CI/CD |
| Performance de queries | < 200ms | APM |
| Zero data leakage | 0 incidentes | Testes de segurança |

### 8.2 Métricas de Produto
| Métrica | Meta | Como Medir |
|---------|------|------------|
| Tempo de onboarding | < 5 min | Analytics |
| Taxa de conversão signup | > 70% | Funnel analysis |
| Retenção Mês 1 | > 80% | Cohort analysis |
| NPS | > 50 | Pesquisa |

---

## 9. DEPENDÊNCIAS

### 9.1 Técnicas
- ✅ Prisma 5.x instalado
- ✅ Next.js 14+ com Server Actions
- ⏳ NextAuth.js (a instalar)
- ⏳ Biblioteca de hash de senha (bcrypt)

### 9.2 Decisões Pendentes
- [ ] Escolher biblioteca de autenticação (NextAuth.js vs Clerk)
- [ ] Definir estratégia de subdomain (futuro)
- [ ] Aprovar pricing strategy

---

## 10. RISCOS

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Data leakage | Média | 🔴 Crítico | Testes rigorosos + code review |
| Perda de dados na migration | Média | 🔴 Alto | Backup obrigatório |
| Complexidade de auth | Média | 🟡 Médio | Usar NextAuth.js |
| Performance degradada | Baixa | 🟡 Médio | Índices adequados |

---

## 11. FASES DE IMPLEMENTAÇÃO

### Fase 1: MVP Técnico (Sprint 1 - 1 semana)
- Schema + Migrations
- Server Actions com isolamento
- tenantId hardcoded
- Testes de segurança

### Fase 2: Autenticação (Sprint 2 - 1 semana)
- Integração NextAuth.js
- Signup self-service
- Login/Logout
- Gestão de usuários

### Fase 3: Componentes Avançados (Sprint 3 - Opcional)
- Tenant Selector
- Multi-tenant por usuário
- Dashboard de admin

---

## 12. CRITÉRIOS DE ACEITAÇÃO GLOBAL

Para considerar multi-tenancy **PRONTO**:

- ✅ Todas as queries incluem filtro de tenant
- ✅ Signup funcional (< 5 minutos)
- ✅ Login/Logout funcional
- ✅ Zero data leakage em testes
- ✅ Performance < 200ms
- ✅ Testes automatizados passando
- ✅ Code review aprovado
- ✅ Documentação completa
- ✅ Beta com 5 clientes bem-sucedido

---

## 13. PRÓXIMOS PASSOS

### Imediatos
1. ✅ Aprovar PRD (Tech Lead + PM)
2. ✅ Criar branch `feature/multi-tenancy`
3. ✅ Fazer backup do banco
4. ✅ Iniciar Sprint 1

### Curto Prazo
1. ⏳ Implementar Fase 1 (MVP)
2. ⏳ Testar em staging
3. ⏳ Beta com 5 clientes

### Médio Prazo
1. 📋 Implementar Fase 2 (Auth)
2. 📋 Rollout geral
3. 📋 Monitorar métricas

---

**Próximo Documento:** [04-user-stories.md](04-user-stories.md)

**Aprovações:**

| Stakeholder | Data | Status |
|-------------|------|--------|
| Product Manager (John) | 25/12/2025 | ✅ Aprovado |
| Tech Lead | Pendente | ⏳ Aguardando |
| Security | Pendente | ⏳ Aguardando |
| UX Designer | Pendente | ⏳ Aguardando |



