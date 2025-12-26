# 📋 Plano de Correção Prioritário

**Data:** 25/12/2025  
**QA Engineer:** TEA Agent  
**Status:** 🟡 Aguardando Implementação

---

## 🎯 Objetivo

Este documento fornece um plano detalhado e priorizado para corrigir todos os bugs identificados na auditoria de QA do CRM B2B FourSys MVP.

---

## 📊 Visão Geral

| Fase | Bugs | Tempo Total | Prazo | Status |
|------|------|-------------|-------|--------|
| **Fase 1: Urgente (Demo)** | 3 bugs críticos | 3-4 horas | 1 dia | ⏳ Pendente |
| **Fase 2: Importante (Produção)** | 2 bugs médios | 2-3 horas | 1 semana | ⏳ Pendente |
| **Fase 3: Melhorias** | Refatorações | 8-12 horas | 2 semanas | ⏳ Pendente |

**Tempo Total Estimado:** 13-19 horas

---

## 🚨 Fase 1: Correções Urgentes (Antes do Demo)

**Prazo:** 1 dia útil  
**Prioridade:** P0 (Crítica)  
**Objetivo:** Garantir que o MVP funcione corretamente para demonstração

### Tarefa 1.1: Corrigir URL do Banco Hardcoded

**Bug:** [#2 - URL do Banco Hardcoded](./bugs-criticos.md#bug-2---url-do-banco-hardcoded)  
**Tempo Estimado:** 30 minutos  
**Complexidade:** ⭐ Baixa  
**Desenvolvedor Sugerido:** Qualquer

#### Checklist de Implementação

- [ ] Atualizar `prisma/schema.prisma` para usar `env("DATABASE_URL")`
- [ ] Criar arquivo `.env` com `DATABASE_URL="file:./dev.db"`
- [ ] Criar arquivo `.env.example` como template
- [ ] Atualizar `.gitignore` para ignorar `.env*`
- [ ] Executar `npx prisma generate` para validar
- [ ] Testar em ambiente local
- [ ] Documentar no README.md

#### Código a Modificar

**Arquivo:** `prisma/schema.prisma`

```diff
datasource db {
  provider = "sqlite"
- url      = "file:./dev.db"
+ url      = env("DATABASE_URL")
}
```

**Arquivo:** `.env` (criar)

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

#### Testes de Validação

```bash
# 1. Verificar que Prisma lê a variável
npx prisma generate

# 2. Verificar que banco funciona
npm run db:push

# 3. Verificar que app inicia
npm run dev

# 4. Verificar que CRUD funciona
# - Criar lead
# - Mover lead
# - Visualizar dashboard
```

#### Critérios de Aceitação

- ✅ Prisma Client gera sem erros
- ✅ Aplicação inicia sem erros
- ✅ CRUD de leads funciona normalmente
- ✅ `.env` está no `.gitignore`
- ✅ `.env.example` existe para referência

---

### Tarefa 1.2: Adicionar Validação de Infinity/NaN

**Bug:** [#3 - Validação de Valor Aceita Infinity/NaN](./bugs-criticos.md#bug-3---validação-de-valor-aceita-infinitynan)  
**Tempo Estimado:** 1 hora  
**Complexidade:** ⭐⭐ Média  
**Desenvolvedor Sugerido:** Dev com conhecimento de validação

#### Checklist de Implementação

- [ ] Atualizar validação em `src/app/actions/leads.ts`
- [ ] Atualizar schema Zod em `src/lib/validations/lead.ts`
- [ ] Adicionar testes unitários
- [ ] Testar manualmente no formulário
- [ ] Documentar edge cases

#### Código a Modificar

**Arquivo:** `src/lib/validations/lead.ts`

```diff
export const createLeadSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  company: z.string().min(2, 'Empresa deve ter no mínimo 2 caracteres'),
- value: z.number().min(0, 'Valor não pode ser negativo'),
+ value: z.number()
+   .min(0, 'Valor não pode ser negativo')
+   .finite('Valor deve ser um número válido')
+   .max(Number.MAX_SAFE_INTEGER, 'Valor muito grande'),
  status: z.enum(['prospect', 'qualified', 'proposal', 'closed']),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
});
```

**Arquivo:** `src/app/actions/leads.ts`

```diff
// Validação de valor
if (data.value < 0) {
  throw new Error('Valor não pode ser negativo');
}
+
+if (!isFinite(data.value)) {
+  throw new Error('Valor deve ser um número válido');
+}
```

#### Testes de Validação

```typescript
// Testes manuais no formulário:
// 1. Tentar criar lead com valor "Infinity" (via console)
// 2. Tentar criar lead com valor "NaN" (via console)
// 3. Verificar mensagem de erro apropriada
// 4. Criar lead com valor válido (10000)
// 5. Verificar que salva corretamente

// Testes automatizados (criar depois):
describe('Validação de Valor', () => {
  it('deve rejeitar Infinity', async () => {
    await expect(
      createLead({ /* ... */ value: Infinity })
    ).rejects.toThrow('Valor deve ser um número válido');
  });
  
  it('deve aceitar valores válidos', async () => {
    const lead = await createLead({ /* ... */ value: 10000 });
    expect(lead.value).toBe(10000);
  });
});
```

#### Critérios de Aceitação

- ✅ Infinity é rejeitado com mensagem clara
- ✅ -Infinity é rejeitado
- ✅ NaN é rejeitado
- ✅ Valores válidos (0, 1000, 999999) são aceitos
- ✅ Mensagens de erro são claras e em português

---

### Tarefa 1.3: Corrigir Estado Otimista no Kanban

**Bug:** [#1 - Estado Otimista Não Reverte em Erro](./bugs-criticos.md#bug-1---estado-otimista-não-reverte-em-erro)  
**Tempo Estimado:** 1-2 horas  
**Complexidade:** ⭐⭐⭐ Alta  
**Desenvolvedor Sugerido:** Dev com conhecimento de React hooks

#### Checklist de Implementação

- [ ] Modificar `handleDragEnd` em `KanbanBoard.tsx`
- [ ] Adicionar lógica de reversão de estado
- [ ] Adicionar botão "Tentar Novamente" no toast
- [ ] Testar com rede desconectada
- [ ] Testar com erro simulado
- [ ] Validar UX em diferentes cenários

#### Código a Modificar

**Arquivo:** `src/components/kanban/KanbanBoard.tsx`

```diff
const handleDragEnd = async (event: DragEndEvent) => {
  // ... código existente ...
  
  try {
    await updateLeadStatus({ id: leadId, status: newStatus as LeadStatus });
    
    toast.success('Lead movido!', {
      description: `Movido para ${STATUS_LABELS[newStatus as LeadStatus]}.`,
      duration: 2000,
    });
  } catch (error) {
    console.error('Failed to update lead:', error);
+   
+   // Reverter estado otimista
+   const originalLead = initialLeads.find(l => l.id === leadId);
+   if (originalLead) {
+     updateOptimisticLeads({ leadId, newStatus: originalLead.status });
+   }
    
    toast.error('Erro ao mover lead', {
      description: 'A alteração não foi salva. Tente novamente.',
+     action: {
+       label: 'Tentar Novamente',
+       onClick: async () => {
+         try {
+           await updateLeadStatus({ id: leadId, status: newStatus as LeadStatus });
+           updateOptimisticLeads({ leadId, newStatus: newStatus as LeadStatus });
+           toast.success('Lead movido com sucesso!');
+         } catch (retryError) {
+           toast.error('Falha ao mover lead novamente.');
+         }
+       },
+     },
    });
  }
  
  setActiveId(null);
};
```

#### Testes de Validação

```bash
# Teste Manual 1: Erro de Rede
# 1. Abrir DevTools → Network → Offline
# 2. Arrastar lead para outra coluna
# 3. Verificar que lead volta para coluna original
# 4. Verificar toast de erro com botão "Tentar Novamente"
# 5. Reconectar rede
# 6. Clicar "Tentar Novamente"
# 7. Verificar que lead move corretamente

# Teste Manual 2: Erro do Servidor
# 1. Modificar temporariamente updateLeadStatus para lançar erro
# 2. Arrastar lead
# 3. Verificar reversão
# 4. Verificar toast de erro

# Teste Manual 3: Múltiplos Erros
# 1. Offline
# 2. Arrastar 3 leads diferentes
# 3. Verificar que todos revertem
# 4. Verificar que toasts empilham corretamente
```

#### Critérios de Aceitação

- ✅ Lead reverte para coluna original em erro
- ✅ Toast de erro aparece com mensagem clara
- ✅ Botão "Tentar Novamente" funciona
- ✅ Retry bem-sucedido move o lead
- ✅ Retry falhado mostra novo erro
- ✅ Múltiplos erros são tratados corretamente
- ✅ UX é fluida e não confunde usuário

---

### 🎯 Resumo da Fase 1

| Tarefa | Tempo | Complexidade | Bloqueante? |
|--------|-------|--------------|-------------|
| 1.1 - URL Hardcoded | 30min | Baixa | ❌ |
| 1.2 - Validação Infinity | 1h | Média | ❌ |
| 1.3 - Estado Otimista | 1-2h | Alta | ✅ |

**Ordem Recomendada:** 1.1 → 1.2 → 1.3  
**Tempo Total:** 3-4 horas  
**Pode Paralelizar:** 1.1 e 1.2 (diferentes arquivos)

---

## ⚠️ Fase 2: Correções Importantes (Antes da Produção)

**Prazo:** 1 semana  
**Prioridade:** P1-P2 (Alta/Média)  
**Objetivo:** Melhorar robustez e performance

### Tarefa 2.1: Melhorar Tratamento de Erros

**Bug:** [#4 - Erro Genérico Esconde Causa Real](./bugs-criticos.md#bug-4---erro-genérico-esconde-causa-real)  
**Tempo Estimado:** 2 horas  
**Complexidade:** ⭐⭐ Média

#### Checklist de Implementação

- [ ] Atualizar `createLead()` com error handling específico
- [ ] Atualizar `updateLeadStatus()` com error handling específico
- [ ] Atualizar `getDashboardMetrics()` com error handling específico
- [ ] Atualizar `deleteLead()` com error handling específico
- [ ] Adicionar tipos de erro do Prisma
- [ ] Testar cada tipo de erro
- [ ] Documentar códigos de erro

#### Código a Modificar

**Arquivo:** `src/app/actions/leads.ts`

```typescript
// Adicionar imports
import { Prisma } from '@prisma/client';

// Atualizar cada função:
export async function createLead(data: CreateLeadInput): Promise<Lead> {
  try {
    // ... código existente ...
  } catch (error) {
    console.error('Error creating lead:', error);
    
    // Preservar erros de validação
    if (error instanceof Error && 
        (error.message.includes('Status inválido') || 
         error.message.includes('Valor'))) {
      throw error;
    }
    
    // Erros específicos do Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          throw new Error('Já existe um lead com esses dados');
        case 'P2003':
          throw new Error('Referência inválida no banco de dados');
        case 'P2025':
          throw new Error('Registro não encontrado');
        default:
          throw new Error(`Erro no banco de dados: ${error.code}`);
      }
    }
    
    // Erro de conexão
    if (error instanceof Prisma.PrismaClientInitializationError) {
      throw new Error('Não foi possível conectar ao banco de dados. Tente novamente.');
    }
    
    // Erro de timeout
    if (error instanceof Prisma.PrismaClientRustPanicError) {
      throw new Error('Operação demorou muito. Tente novamente.');
    }
    
    // Erro genérico para casos desconhecidos
    throw new Error('Falha ao criar lead. Entre em contato com o suporte.');
  }
}
```

#### Testes de Validação

```typescript
// Simular diferentes tipos de erro
describe('Error Handling Específico', () => {
  it('deve mostrar erro de validação original', async () => {
    await expect(
      createLead({ /* ... */ value: -100 })
    ).rejects.toThrow('Valor não pode ser negativo');
  });
  
  it('deve mostrar erro de conexão específico', async () => {
    // Mock de erro de conexão
    jest.spyOn(prisma, 'lead').mockImplementation(() => {
      throw new Prisma.PrismaClientInitializationError('', '');
    });
    
    await expect(createLead(validData))
      .rejects.toThrow('Não foi possível conectar ao banco');
  });
  
  it('deve mostrar erro de registro não encontrado', async () => {
    jest.spyOn(prisma.lead, 'update').mockImplementation(() => {
      throw new Prisma.PrismaClientKnownRequestError('', { code: 'P2025' });
    });
    
    await expect(updateLeadStatus({ id: 'invalid', status: 'qualified' }))
      .rejects.toThrow('Lead não encontrado');
  });
});
```

#### Critérios de Aceitação

- ✅ Erros de validação preservam mensagem original
- ✅ Erros de conexão têm mensagem específica
- ✅ Erros de registro não encontrado são claros
- ✅ Erros desconhecidos têm fallback genérico
- ✅ Logs mantêm erro completo para debugging

---

### Tarefa 2.2: Remover router.refresh() Duplicado

**Bug:** [#5 - router.refresh() Duplicado](./bugs-criticos.md#bug-5---routerrefresh-duplicado)  
**Tempo Estimado:** 15 minutos  
**Complexidade:** ⭐ Muito Baixa

#### Checklist de Implementação

- [ ] Remover `router.refresh()` de `CreateLeadModal.tsx`
- [ ] Testar que revalidação ainda funciona
- [ ] Verificar performance melhorou
- [ ] Documentar no código

#### Código a Modificar

**Arquivo:** `src/components/kanban/CreateLeadModal.tsx`

```diff
const onSubmit = async (data: CreateLeadFormData) => {
  setIsLoading(true);
  try {
    await createLead(data);
    toast.success('Lead criado com sucesso!', {
      description: `${data.name} foi adicionado ao pipeline.`,
    });
    form.reset();
    setOpen(false);
-   router.refresh();
+   // Não é necessário - createLead() já chama revalidatePath()
  } catch (error) {
    // ...
  }
};
```

#### Testes de Validação

```bash
# Teste Manual:
# 1. Abrir DevTools → Network
# 2. Criar novo lead
# 3. Verificar que há apenas 1 request (não 2)
# 4. Verificar que lead aparece no Kanban
# 5. Verificar que dashboard atualiza
```

#### Critérios de Aceitação

- ✅ Apenas 1 request após criar lead
- ✅ Lead aparece no Kanban imediatamente
- ✅ Dashboard atualiza corretamente
- ✅ Performance melhorou (~100ms mais rápido)

---

### 🎯 Resumo da Fase 2

| Tarefa | Tempo | Complexidade | Bloqueante? |
|--------|-------|--------------|-------------|
| 2.1 - Error Handling | 2h | Média | ❌ |
| 2.2 - router.refresh() | 15min | Baixa | ❌ |

**Ordem Recomendada:** 2.2 → 2.1  
**Tempo Total:** 2-3 horas  
**Pode Paralelizar:** Não (mesma pessoa pode fazer sequencial)

---

## 🔧 Fase 3: Melhorias e Refatorações

**Prazo:** 2 semanas  
**Prioridade:** P3 (Baixa)  
**Objetivo:** Preparar para escala e manutenção

### Tarefa 3.1: Implementar Testes Automatizados

**Tempo Estimado:** 8-12 horas  
**Complexidade:** ⭐⭐⭐⭐ Muito Alta

#### Escopo

- [ ] Configurar Jest + React Testing Library
- [ ] Configurar Playwright para E2E
- [ ] Escrever testes unitários para Server Actions
- [ ] Escrever testes de componente para Kanban
- [ ] Escrever testes E2E para fluxos principais
- [ ] Configurar CI/CD com testes

#### Detalhes

Ver documento: [Testes](./testes.md)

---

### Tarefa 3.2: Adicionar Proteção CSRF

**Tempo Estimado:** 2-3 horas  
**Complexidade:** ⭐⭐⭐ Alta

#### Escopo

- [ ] Implementar geração de tokens CSRF
- [ ] Adicionar validação em Server Actions
- [ ] Testar proteção

#### Detalhes

Ver documento: [Segurança](./seguranca.md)

---

### Tarefa 3.3: Implementar Rate Limiting

**Tempo Estimado:** 2-3 horas  
**Complexidade:** ⭐⭐⭐ Alta

#### Escopo

- [ ] Configurar rate limiting (ex: upstash/ratelimit)
- [ ] Adicionar limites por IP
- [ ] Adicionar limites por usuário (futuro)
- [ ] Testar limites

#### Detalhes

Ver documento: [Segurança](./seguranca.md)

---

## 📈 Tracking de Progresso

### Template de Atualização

```markdown
## [Data] - Atualização de Progresso

### Tarefas Completadas
- [x] Tarefa X.Y - [Desenvolvedor] - [Tempo Real]

### Tarefas em Andamento
- [ ] Tarefa X.Y - [Desenvolvedor] - [ETA]

### Bloqueios
- Nenhum / [Descrição do bloqueio]

### Próximos Passos
1. [Próxima tarefa]
2. [Próxima tarefa]
```

---

## 📞 Contato e Suporte

**QA Engineer:** TEA Agent  
**Para dúvidas técnicas:** tea@foursys.com  
**Para aprovações:** pm@foursys.com

---

## 📝 Histórico de Atualizações

| Data | Versão | Autor | Alterações |
|------|--------|-------|------------|
| 25/12/2025 | 1.0 | TEA Agent | Criação inicial do plano |

---

**Próximo Documento:** [Bugs Médios e Menores](./bugs-medios-menores.md)

