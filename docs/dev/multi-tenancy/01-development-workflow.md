# Development Workflow - Multi-tenancy

**Versão:** 1.0  
**Data:** 25/12/2025  
**Dev Lead:** Dev Agent  
**Status:** 🚀 Workflow Definido

---

## 📋 Introdução

Este documento define o **fluxo de trabalho completo** para desenvolvimento da feature de Multi-tenancy, desde o planejamento até o deploy em produção.

---

## 🎯 Metodologia

### Abordagem: Iterativa e Incremental

Vamos seguir uma abordagem **fase por fase**, onde cada fase entrega valor incremental e pode ser testada independentemente.

**Princípios:**
1. **Backend First:** Garantir isolamento de dados antes de UI
2. **Test-Driven:** Testes de segurança desde o início
3. **Incremental:** Entregas pequenas e frequentes
4. **Documentado:** Cada fase gera documentação

---

## 🚀 Fases de Desenvolvimento

### FASE 1: Backend MVP (21 horas)

**Objetivo:** Multi-tenancy funcional com isolamento de dados

**Entregas:**
1. Schema Prisma com Tenant, User, Lead
2. Migrations aplicadas
3. Seed atualizado com multi-tenant data
4. Server Actions com filtro de tenantId
5. Testes de isolamento

**Workflow:**
```
Dia 1 (8h):
├── Manhã (4h)
│   ├── 1. Backup do banco (30min)
│   ├── 2. Criar branch feature/multi-tenancy (15min)
│   ├── 3. Atualizar schema.prisma (2h)
│   └── 4. Aplicar migrations (1h15min)
└── Tarde (4h)
    ├── 5. Atualizar seed.ts (2h)
    ├── 6. Testar seed (1h)
    └── 7. Commit + Push (1h)

Dia 2 (8h):
├── Manhã (4h)
│   ├── 1. Atualizar Server Actions (3h)
│   └── 2. Adicionar validações (1h)
└── Tarde (4h)
    ├── 3. Criar testes de isolamento (2h)
    ├── 4. Executar testes (1h)
    └── 5. Code review + Ajustes (1h)

Dia 3 (5h):
├── Manhã (3h)
│   ├── 1. Refatoração (1h)
│   ├── 2. Documentação (1h)
│   └── 3. Testes finais (1h)
└── Tarde (2h)
    ├── 4. PR + Review (1h)
    └── 5. Merge (1h)
```

**Documentos de Referência:**
- [04-database-implementation.md](04-database-implementation.md)
- [05-server-actions-implementation.md](05-server-actions-implementation.md)
- [07-data-migration.md](07-data-migration.md)

**Critérios de Aceitação:**
- [ ] Schema Prisma com 3 modelos (Tenant, User, Lead)
- [ ] Migrations aplicadas sem erros
- [ ] Seed gera 3 tenants com 5 leads cada
- [ ] Todas as Server Actions filtram por tenantId
- [ ] Testes de isolamento passam (100%)
- [ ] Zero warnings de linting
- [ ] Build de produção sem erros

---

### FASE 2: Autenticação (12 horas)

**Objetivo:** Sistema completo de auth com signup self-service

**Entregas:**
1. NextAuth.js configurado
2. Signup flow (3 steps)
3. Login/Logout
4. Session com tenantId
5. Password reset

**Workflow:**
```
Dia 1 (8h):
├── Manhã (4h)
│   ├── 1. Instalar NextAuth.js (30min)
│   ├── 2. Configurar providers (1h30min)
│   └── 3. Criar API routes (2h)
└── Tarde (4h)
    ├── 4. Implementar Signup (3 steps) (3h)
    └── 5. Testes de signup (1h)

Dia 2 (4h):
├── Manhã (2h)
│   ├── 1. Implementar Login (1h)
│   └── 2. Implementar Logout (30min)
│   └── 3. Password reset (30min)
└── Tarde (2h)
    ├── 4. Testes de auth (1h)
    └── 5. Code review + Merge (1h)
```

**Documentos de Referência:**
- [06-authentication-implementation.md](06-authentication-implementation.md)
- [08-components-implementation.md](08-components-implementation.md)
- [09-pages-implementation.md](09-pages-implementation.md)

**Critérios de Aceitação:**
- [ ] NextAuth.js configurado
- [ ] Signup em 3 steps funcional
- [ ] Login/Logout funcionando
- [ ] Session contém tenantId
- [ ] Password reset funcional
- [ ] Testes de auth passam (100%)
- [ ] Email verification (opcional)

---

### FASE 3: Frontend Completo (16 horas)

**Objetivo:** Interface elegante e componentes avançados

**Entregas:**
1. TenantBadge component
2. TenantSelector component
3. User Management UI
4. Admin Dashboard
5. Animações e transições

**Workflow:**
```
Dia 1 (8h):
├── Manhã (4h)
│   ├── 1. TenantBadge component (2h)
│   ├── 2. TenantSelector component (2h)
└── Tarde (4h)
    ├── 3. User Management UI (3h)
    └── 4. Testes de componentes (1h)

Dia 2 (8h):
├── Manhã (4h)
│   ├── 1. Admin Dashboard (3h)
│   └── 2. Tenant Stats (1h)
└── Tarde (4h)
    ├── 3. Animações e transições (2h)
    ├── 4. Responsividade (1h)
    └── 5. Code review + Merge (1h)
```

**Documentos de Referência:**
- [08-components-implementation.md](08-components-implementation.md)
- [09-pages-implementation.md](09-pages-implementation.md)
- [10-animations-implementation.md](10-animations-implementation.md)
- [11-responsive-implementation.md](11-responsive-implementation.md)

**Critérios de Aceitação:**
- [ ] TenantBadge renderiza corretamente
- [ ] TenantSelector funciona (multi-tenant users)
- [ ] User Management UI completa
- [ ] Admin Dashboard funcional
- [ ] Animações suaves (< 300ms)
- [ ] Responsivo (mobile, tablet, desktop)
- [ ] Acessível (WCAG AA)

---

### FASE 4: Testes e Qualidade (8 horas)

**Objetivo:** Garantir qualidade e segurança

**Entregas:**
1. Testes unitários (Server Actions)
2. Testes de integração
3. Testes de segurança (isolamento)
4. Testes de performance
5. Testes E2E (Playwright)

**Workflow:**
```
Dia 1 (8h):
├── Manhã (4h)
│   ├── 1. Testes unitários (Server Actions) (2h)
│   └── 2. Testes de integração (2h)
└── Tarde (4h)
    ├── 3. Testes de segurança (2h)
    ├── 4. Testes de performance (1h)
    └── 5. Testes E2E (1h)
```

**Documentos de Referência:**
- [12-testing-guide.md](12-testing-guide.md)
- [13-security-testing.md](13-security-testing.md)
- [14-performance-testing.md](14-performance-testing.md)

**Critérios de Aceitação:**
- [ ] Code coverage > 80%
- [ ] Testes de isolamento passam (100%)
- [ ] Testes de performance passam (< 200ms)
- [ ] Testes E2E passam (100%)
- [ ] Zero vulnerabilidades de segurança

---

### FASE 5: Deploy e Monitoramento (3 horas)

**Objetivo:** Deploy seguro em produção

**Entregas:**
1. Deploy em staging
2. Smoke tests
3. Deploy em produção
4. Monitoramento configurado
5. Documentação de rollback

**Workflow:**
```
Dia 1 (3h):
├── Manhã (2h)
│   ├── 1. Deploy staging (30min)
│   ├── 2. Smoke tests (30min)
│   └── 3. Ajustes (1h)
└── Tarde (1h)
    ├── 4. Deploy produção (30min)
    └── 5. Monitoramento (30min)
```

**Documentos de Referência:**
- [15-deployment-checklist.md](15-deployment-checklist.md)
- [16-monitoring-setup.md](16-monitoring-setup.md)
- [17-troubleshooting.md](17-troubleshooting.md)

**Critérios de Aceitação:**
- [ ] Deploy staging sem erros
- [ ] Smoke tests passam (100%)
- [ ] Deploy produção sem erros
- [ ] Monitoramento ativo
- [ ] Documentação de rollback pronta

---

## 🔄 Workflow Diário

### Início do Dia (15 minutos)
1. **Pull latest changes**
   ```bash
   git checkout feature/multi-tenancy
   git pull origin feature/multi-tenancy
   ```

2. **Revisar documento da fase atual**
   - Ler objetivos do dia
   - Revisar critérios de aceitação
   - Preparar ambiente

3. **Atualizar status**
   - Marcar tarefas iniciadas
   - Comunicar bloqueios

---

### Durante o Desenvolvimento (Contínuo)

1. **Desenvolvimento Iterativo**
   ```
   Ciclo de 2 horas:
   ├── 1. Implementar (1h)
   ├── 2. Testar localmente (30min)
   ├── 3. Refatorar (20min)
   └── 4. Commit (10min)
   ```

2. **Commits Frequentes**
   ```bash
   # Conventional Commits
   git add .
   git commit -m "feat(tenant): add TenantBadge component"
   git push origin feature/multi-tenancy
   ```

3. **Testes Contínuos**
   ```bash
   # Executar a cada commit
   npm run lint
   npm run test
   npm run build
   ```

---

### Fim do Dia (15 minutos)

1. **Push Changes**
   ```bash
   git push origin feature/multi-tenancy
   ```

2. **Atualizar Status**
   - Marcar tarefas concluídas
   - Documentar bloqueios
   - Planejar próximo dia

3. **Code Review (se aplicável)**
   - Criar PR se fase completa
   - Solicitar review do Tech Lead
   - Responder comentários

---

## 🔀 Git Workflow

### Branching Strategy

```
main (produção)
  └── develop (staging)
       └── feature/multi-tenancy (desenvolvimento)
            ├── feat/tenant-schema
            ├── feat/server-actions
            ├── feat/auth
            ├── feat/components
            └── feat/tests
```

### Convenções de Branch
- **feature/*:** Novas funcionalidades
- **bugfix/*:** Correções de bugs
- **hotfix/*:** Correções urgentes em produção
- **refactor/*:** Refatorações
- **docs/*:** Documentação

### Convenções de Commit
```
<type>(<scope>): <subject>

Types:
- feat: Nova funcionalidade
- fix: Correção de bug
- refactor: Refatoração
- test: Adicionar testes
- docs: Documentação
- style: Formatação
- perf: Performance
- chore: Manutenção

Exemplos:
feat(tenant): add Tenant model to schema
fix(auth): resolve session expiration issue
test(tenant): add isolation tests
docs(dev): update implementation guide
```

---

## 📝 Code Review Process

### Quando Criar PR

1. **Fase Completa:** Todos os critérios de aceitação atendidos
2. **Testes Passando:** 100% dos testes passam
3. **Linting OK:** Zero erros de linting
4. **Build OK:** Build de produção sem erros

### Template de PR

```markdown
## Descrição
[Descrição clara da mudança]

## Fase
- [ ] Fase 1: Backend MVP
- [ ] Fase 2: Autenticação
- [ ] Fase 3: Frontend
- [ ] Fase 4: Testes
- [ ] Fase 5: Deploy

## Checklist
- [ ] Testes passam (100%)
- [ ] Linting OK
- [ ] Build OK
- [ ] Documentação atualizada
- [ ] Critérios de aceitação atendidos

## Screenshots (se aplicável)
[Adicionar screenshots]

## Notas para Reviewer
[Pontos de atenção]
```

### Code Review Checklist

**Reviewer deve verificar:**
- [ ] Código segue padrões do projeto
- [ ] Testes cobrem casos críticos
- [ ] Sem hardcoded secrets
- [ ] Sem console.logs desnecessários
- [ ] Comentários claros em código complexo
- [ ] TypeScript types corretos
- [ ] Sem any types
- [ ] Performance adequada
- [ ] Acessibilidade (se UI)
- [ ] Responsividade (se UI)

---

## 🧪 Testing Strategy

### Pirâmide de Testes

```
        E2E (10%)
       /         \
    Integration (30%)
   /                 \
  Unit Tests (60%)
```

### Quando Testar

1. **Durante Desenvolvimento:**
   - Testes unitários a cada função
   - Testes de integração a cada Server Action
   - Testes de componentes a cada componente

2. **Antes de PR:**
   - Executar todos os testes
   - Verificar coverage > 80%
   - Executar testes de segurança

3. **Antes de Deploy:**
   - Executar testes E2E
   - Smoke tests em staging
   - Performance tests

### Comandos de Teste

```bash
# Testes unitários
npm run test

# Testes com coverage
npm run test:coverage

# Testes E2E
npm run test:e2e

# Testes de segurança
npm run test:security

# Todos os testes
npm run test:all
```

---

## 📊 Métricas e Monitoramento

### Métricas Diárias

| Métrica | Meta | Como Medir |
|---------|------|------------|
| **Commits** | 5-10/dia | Git log |
| **Testes Passando** | 100% | Jest |
| **Code Coverage** | > 80% | Jest coverage |
| **Linting Errors** | 0 | ESLint |
| **Build Time** | < 60s | Next.js build |

### Métricas de Fase

| Métrica | Meta | Como Medir |
|---------|------|------------|
| **Tarefas Concluídas** | 100% | Checklist |
| **Critérios Atendidos** | 100% | Manual |
| **Bugs Encontrados** | < 5 | Issue tracker |
| **Code Review Aprovado** | Sim | GitHub |
| **Deploy Sucesso** | Sim | Vercel |

---

## 🚨 Gestão de Riscos

### Riscos Comuns e Mitigações

| Risco | Probabilidade | Mitigação |
|-------|---------------|-----------|
| **Data Leakage** | Média | Testes rigorosos de isolamento |
| **Perda de Dados** | Baixa | Backup antes de migration |
| **Performance** | Baixa | Índices adequados + monitoramento |
| **Atraso** | Média | Buffer de 20% no cronograma |
| **Bugs em Produção** | Baixa | Testes E2E + staging |

### Quando Escalar

**Escalar para Tech Lead se:**
- Bloqueio técnico > 2 horas
- Decisão arquitetural necessária
- Bug crítico encontrado
- Atraso > 1 dia

---

## 📞 Comunicação

### Daily Standup (15 minutos)

**Formato:**
1. O que fiz ontem?
2. O que farei hoje?
3. Algum bloqueio?

**Exemplo:**
```
Ontem:
- Implementei schema Prisma com Tenant model
- Apliquei migrations
- Iniciei atualização do seed

Hoje:
- Finalizar seed com multi-tenant data
- Iniciar atualização de Server Actions
- Adicionar filtros de tenantId

Bloqueios:
- Nenhum
```

### Canais de Comunicação

| Canal | Quando Usar |
|-------|-------------|
| **Slack #dev** | Dúvidas rápidas |
| **GitHub Issues** | Bugs e features |
| **GitHub PR** | Code review |
| **Email** | Comunicação formal |
| **Zoom** | Pair programming |

---

## 🎓 Boas Práticas

### Desenvolvimento

1. **Leia a documentação ANTES de codificar**
2. **Teste localmente ANTES de commit**
3. **Commit pequeno e frequente**
4. **Mensagens de commit claras**
5. **Code review antes de merge**

### Segurança

1. **NUNCA aceitar tenantId do cliente**
2. **SEMPRE obter tenantId da sessão**
3. **SEMPRE filtrar queries por tenantId**
4. **SEMPRE validar propriedade de recursos**
5. **SEMPRE testar isolamento**

### Performance

1. **Usar índices adequados**
2. **Evitar N+1 queries**
3. **Usar select para campos específicos**
4. **Implementar pagination**
5. **Monitorar query time**

---

## 📚 Recursos de Aprendizado

### Documentação Obrigatória
- [Next.js App Router](https://nextjs.org/docs/app)
- [Prisma Multi-tenancy](https://www.prisma.io/docs/guides/database/multi-tenancy)
- [NextAuth.js](https://next-auth.js.org/)

### Tutoriais Recomendados
- [Building a Multi-tenant App](https://www.youtube.com/watch?v=...)
- [NextAuth.js Tutorial](https://www.youtube.com/watch?v=...)
- [Prisma Best Practices](https://www.youtube.com/watch?v=...)

---

## 🔄 Retrospectiva

### Ao Final de Cada Fase

**Perguntas:**
1. O que funcionou bem?
2. O que poderia melhorar?
3. Aprendizados?
4. Ações para próxima fase?

**Documentar em:**
`docs/dev/multi-tenancy/retrospectives/fase-X.md`

---

## 📅 Cronograma Detalhado

### Semana 1: Backend MVP
| Dia | Horas | Tarefas |
|-----|-------|---------|
| Seg | 8h | Schema + Migrations |
| Ter | 8h | Server Actions |
| Qua | 5h | Testes + Review |

### Semana 2: Autenticação
| Dia | Horas | Tarefas |
|-----|-------|---------|
| Seg | 8h | NextAuth.js + Signup |
| Ter | 4h | Login + Tests |

### Semana 3: Frontend
| Dia | Horas | Tarefas |
|-----|-------|---------|
| Seg | 8h | Componentes |
| Ter | 8h | Admin + Animações |

### Semana 4: Testes
| Dia | Horas | Tarefas |
|-----|-------|---------|
| Seg | 8h | Todos os testes |

### Semana 5: Deploy
| Dia | Horas | Tarefas |
|-----|-------|---------|
| Seg | 3h | Deploy + Monitoramento |

---

**Documentação gerada por:** BMAD Business Method Module  
**Agente:** Dev Agent 👨‍💻  
**Status:** ✅ Workflow Completo  
**Última Atualização:** 25/12/2025

---

## 💡 Lembre-se

> **"Um bom workflow não é sobre seguir regras cegamente, mas sobre ter uma estrutura que nos permite focar no que importa: entregar valor com qualidade."**  
> — Dev Agent

**Vamos construir algo incrível!** 🚀

