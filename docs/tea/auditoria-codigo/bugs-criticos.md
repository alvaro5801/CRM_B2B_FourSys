# 🐞 Bugs Críticos Identificados

**Data da Auditoria:** 25/12/2025  
**Total de Bugs Críticos:** 5  
**Status:** ⚠️ REQUER AÇÃO IMEDIATA

---

## 📋 Índice

1. [Bug #1 - Estado Otimista Não Reverte em Erro](#bug-1---estado-otimista-não-reverte-em-erro)
2. [Bug #2 - URL do Banco Hardcoded](#bug-2---url-do-banco-hardcoded)
3. [Bug #3 - Validação de Valor Aceita Infinity/NaN](#bug-3---validação-de-valor-aceita-infinitynan)
4. [Bug #4 - Erro Genérico Esconde Causa Real](#bug-4---erro-genérico-esconde-causa-real)
5. [Bug #5 - router.refresh() Duplicado](#bug-5---routerrefresh-duplicado)

---

## Bug #1 - Estado Otimista Não Reverte em Erro

### 📌 Informações Básicas

| Campo | Valor |
|-------|-------|
| **Severidade** | 🔴 Crítica |
| **Prioridade** | P0 (Urgente) |
| **Arquivo** | `src/components/kanban/KanbanBoard.tsx` |
| **Linhas** | 102-107 |
| **Impacto** | Alto - Dados inconsistentes na UI |
| **Probabilidade** | Média - Ocorre em falhas de rede |

### 🔍 Descrição do Problema

Quando o drag & drop falha no servidor (erro de rede, timeout, etc.), o estado otimista não é revertido. O lead permanece visualmente na nova coluna, mas no banco de dados está na coluna original.

**Resultado:** Ao recarregar a página, o lead "pula" de volta para a coluna original, confundindo o usuário.

### 📝 Código Atual (Problemático)

```typescript
// Linhas 94-107
try {
  await updateLeadStatus({ id: leadId, status: newStatus as LeadStatus });
  
  // Toast discreto de sucesso
  toast.success('Lead movido!', {
    description: `Movido para ${STATUS_LABELS[newStatus as LeadStatus]}.`,
    duration: 2000,
  });
} catch (error) {
  console.error('Failed to update lead:', error);
  toast.error('Erro ao mover lead', {
    description: 'A alteração não foi salva. Tente novamente.',
  });
}
```

### ✅ Correção Proposta

```typescript
// Linhas 94-117 (corrigido)
try {
  await updateLeadStatus({ id: leadId, status: newStatus as LeadStatus });
  
  // Toast discreto de sucesso
  toast.success('Lead movido!', {
    description: `Movido para ${STATUS_LABELS[newStatus as LeadStatus]}.`,
    duration: 2000,
  });
} catch (error) {
  console.error('Failed to update lead:', error);
  
  // 🔧 CORREÇÃO: Reverter estado otimista
  const originalLead = initialLeads.find(l => l.id === leadId);
  if (originalLead) {
    updateOptimisticLeads({ leadId, newStatus: originalLead.status });
  }
  
  // Toast com opção de retry
  toast.error('Erro ao mover lead', {
    description: 'A alteração não foi salva. Tente novamente.',
    action: {
      label: 'Tentar Novamente',
      onClick: async () => {
        try {
          await updateLeadStatus({ id: leadId, status: newStatus as LeadStatus });
          updateOptimisticLeads({ leadId, newStatus: newStatus as LeadStatus });
          toast.success('Lead movido com sucesso!');
        } catch (retryError) {
          toast.error('Falha ao mover lead novamente.');
        }
      },
    },
  });
}
```

### 🧪 Teste de Validação

```typescript
// Teste manual:
// 1. Desconectar internet
// 2. Arrastar lead para outra coluna
// 3. Verificar que lead volta para coluna original
// 4. Verificar toast de erro
// 5. Clicar em "Tentar Novamente"
// 6. Reconectar internet
// 7. Verificar que lead move corretamente

// Teste automatizado:
describe('KanbanBoard - Error Handling', () => {
  it('deve reverter estado otimista em erro', async () => {
    const mockLeads = [
      { id: '1', name: 'Test', status: 'prospect', /* ... */ }
    ];
    
    // Mock de erro no updateLeadStatus
    jest.spyOn(actions, 'updateLeadStatus').mockRejectedValue(new Error('Network error'));
    
    render(<KanbanBoard initialLeads={mockLeads} />);
    
    // Simular drag & drop
    const card = screen.getByText('Test');
    fireEvent.dragStart(card);
    fireEvent.drop(screen.getByText('Qualificado'));
    
    // Aguardar processamento
    await waitFor(() => {
      // Lead deve estar de volta na coluna original
      expect(screen.getByText('Prospect')).toContainElement(card);
    });
    
    // Verificar toast de erro
    expect(screen.getByText('Erro ao mover lead')).toBeInTheDocument();
  });
});
```

### 📊 Impacto

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Consistência de Dados** | ❌ Inconsistente | ✅ Consistente |
| **UX em Erro** | ❌ Confuso | ✅ Claro |
| **Recovery** | ❌ Manual | ✅ Automático |

### ⏱️ Estimativa de Correção

**Tempo:** 1-2 horas  
**Complexidade:** Média

---

## Bug #2 - URL do Banco Hardcoded

### 📌 Informações Básicas

| Campo | Valor |
|-------|-------|
| **Severidade** | 🔴 Crítica |
| **Prioridade** | P0 (Urgente) |
| **Arquivo** | `prisma/schema.prisma` |
| **Linha** | 10 |
| **Impacto** | Alto - Impede configuração por ambiente |
| **Probabilidade** | Alta - Afeta todos os deploys |

### 🔍 Descrição do Problema

A URL do banco de dados está hardcoded no schema do Prisma, impedindo configuração diferente por ambiente (dev, staging, prod). Isso viola boas práticas de segurança e dificulta deploy.

### 📝 Código Atual (Problemático)

```prisma
// Linha 8-11
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

### ✅ Correção Proposta

**1. Atualizar `prisma/schema.prisma`:**

```prisma
// Linha 8-11 (corrigido)
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

**2. Criar/Atualizar `.env`:**

```env
# Database
DATABASE_URL="file:./dev.db"

# Para produção (PostgreSQL):
# DATABASE_URL="postgresql://user:password@localhost:5432/crm_foursys?schema=public"
```

**3. Criar `.env.example` (template para outros devs):**

```env
# Database
DATABASE_URL="file:./dev.db"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**4. Atualizar `.gitignore`:**

```gitignore
# Environment variables
.env
.env.local
.env.production

# Database
*.db
*.db-journal
```

### 🧪 Teste de Validação

```bash
# Teste 1: Verificar que variável é lida corretamente
echo "DATABASE_URL=file:./test.db" > .env.test
npx prisma generate --schema=./prisma/schema.prisma
# Deve gerar client sem erros

# Teste 2: Verificar que funciona em diferentes ambientes
export DATABASE_URL="file:./staging.db"
npm run db:push
# Deve criar staging.db

# Teste 3: Verificar que falha sem variável
unset DATABASE_URL
npx prisma generate
# Deve mostrar erro claro sobre variável faltando
```

### 📊 Impacto

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Flexibilidade** | ❌ Ambiente único | ✅ Multi-ambiente |
| **Segurança** | ❌ Credenciais no código | ✅ Variáveis de ambiente |
| **Deploy** | ❌ Difícil | ✅ Fácil |

### ⏱️ Estimativa de Correção

**Tempo:** 30 minutos  
**Complexidade:** Baixa

---

## Bug #3 - Validação de Valor Aceita Infinity/NaN

### 📌 Informações Básicas

| Campo | Valor |
|-------|-------|
| **Severidade** | 🔴 Crítica |
| **Prioridade** | P1 (Alta) |
| **Arquivo** | `src/app/actions/leads.ts` |
| **Linhas** | 83-85 |
| **Impacto** | Alto - Dados inválidos no banco |
| **Probabilidade** | Baixa - Requer input malicioso |

### 🔍 Descrição do Problema

A validação de valor apenas verifica se é negativo, mas não valida se é um número finito válido. Valores como `Infinity`, `-Infinity` ou `NaN` passariam pela validação e seriam salvos no banco.

### 📝 Código Atual (Problemático)

```typescript
// Linhas 83-85
// Validação de valor
if (data.value < 0) {
  throw new Error('Valor não pode ser negativo');
}
```

### ✅ Correção Proposta

**Opção 1: Validação Simples**

```typescript
// Linhas 83-88 (corrigido)
// Validação de valor
if (data.value < 0 || !isFinite(data.value)) {
  throw new Error('Valor inválido');
}
```

**Opção 2: Validação Detalhada (Recomendado)**

```typescript
// Linhas 83-93 (corrigido)
// Validação de valor
if (data.value < 0) {
  throw new Error('Valor não pode ser negativo');
}

if (!isFinite(data.value)) {
  throw new Error('Valor deve ser um número válido');
}

if (data.value > Number.MAX_SAFE_INTEGER) {
  throw new Error('Valor muito grande');
}
```

**Opção 3: Validação no Schema Zod (Melhor Prática)**

```typescript
// src/lib/validations/lead.ts
export const createLeadSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  company: z.string().min(2, 'Empresa deve ter no mínimo 2 caracteres'),
  value: z.number()
    .min(0, 'Valor não pode ser negativo')
    .finite('Valor deve ser um número válido')
    .max(Number.MAX_SAFE_INTEGER, 'Valor muito grande'),
  status: z.enum(['prospect', 'qualified', 'proposal', 'closed']),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
});
```

### 🧪 Teste de Validação

```typescript
describe('createLead - Validação de Valor', () => {
  it('deve rejeitar Infinity', async () => {
    await expect(
      createLead({
        name: 'Test',
        company: 'Test Corp',
        status: 'prospect',
        value: Infinity,
      })
    ).rejects.toThrow('Valor deve ser um número válido');
  });
  
  it('deve rejeitar -Infinity', async () => {
    await expect(
      createLead({
        name: 'Test',
        company: 'Test Corp',
        status: 'prospect',
        value: -Infinity,
      })
    ).rejects.toThrow('Valor deve ser um número válido');
  });
  
  it('deve rejeitar NaN', async () => {
    await expect(
      createLead({
        name: 'Test',
        company: 'Test Corp',
        status: 'prospect',
        value: NaN,
      })
    ).rejects.toThrow('Valor deve ser um número válido');
  });
  
  it('deve aceitar valores válidos', async () => {
    const lead = await createLead({
      name: 'Test',
      company: 'Test Corp',
      status: 'prospect',
      value: 10000.50,
    });
    
    expect(lead.value).toBe(10000.50);
  });
  
  it('deve aceitar zero', async () => {
    const lead = await createLead({
      name: 'Test',
      company: 'Test Corp',
      status: 'prospect',
      value: 0,
    });
    
    expect(lead.value).toBe(0);
  });
});
```

### 📊 Impacto

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Integridade de Dados** | ❌ Vulnerável | ✅ Protegido |
| **Cálculos** | ❌ Podem quebrar | ✅ Sempre corretos |
| **Segurança** | ❌ Input malicioso aceito | ✅ Rejeitado |

### ⏱️ Estimativa de Correção

**Tempo:** 1 hora (incluindo testes)  
**Complexidade:** Baixa

---

## Bug #4 - Erro Genérico Esconde Causa Real

### 📌 Informações Básicas

| Campo | Valor |
|-------|-------|
| **Severidade** | 🟡 Alta |
| **Prioridade** | P1 (Alta) |
| **Arquivo** | `src/app/actions/leads.ts` |
| **Linhas** | 102-104, 132-135, 174-176, 192-194 |
| **Impacto** | Médio - Dificulta debugging |
| **Probabilidade** | Alta - Ocorre em todos os erros |

### 🔍 Descrição do Problema

Todas as Server Actions capturam erros e lançam mensagens genéricas, escondendo a causa real. Isso dificulta debugging em produção e não ajuda o usuário a entender o problema.

### 📝 Código Atual (Problemático)

```typescript
// Exemplo: createLead (linhas 102-104)
} catch (error) {
  console.error('Error creating lead:', error);
  throw new Error('Falha ao criar lead');
}
```

### ✅ Correção Proposta

```typescript
// Exemplo: createLead (linhas 102-115, corrigido)
} catch (error) {
  console.error('Error creating lead:', error);
  
  // Preservar erros conhecidos (validação, etc)
  if (error instanceof Error) {
    // Se já é um erro com mensagem clara, preservar
    throw error;
  }
  
  // Detectar erros específicos do Prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      throw new Error('Já existe um lead com esses dados');
    }
    if (error.code === 'P2003') {
      throw new Error('Referência inválida no banco de dados');
    }
  }
  
  // Erro de conexão
  if (error instanceof Prisma.PrismaClientInitializationError) {
    throw new Error('Não foi possível conectar ao banco de dados. Tente novamente.');
  }
  
  // Erro genérico apenas para casos desconhecidos
  throw new Error('Falha ao criar lead. Entre em contato com o suporte.');
}
```

**Aplicar padrão similar em todas as Server Actions.**

### 🧪 Teste de Validação

```typescript
describe('Error Handling', () => {
  it('deve preservar erro de validação', async () => {
    await expect(
      createLead({
        name: 'Te', // Muito curto
        company: 'Test',
        status: 'prospect',
        value: 1000,
      })
    ).rejects.toThrow('Nome deve ter no mínimo 3 caracteres');
  });
  
  it('deve mostrar erro de conexão específico', async () => {
    // Mock de erro de conexão
    jest.spyOn(prisma, 'lead').mockImplementation(() => {
      throw new Prisma.PrismaClientInitializationError('Connection failed', '');
    });
    
    await expect(
      createLead({
        name: 'Test',
        company: 'Test',
        status: 'prospect',
        value: 1000,
      })
    ).rejects.toThrow('Não foi possível conectar ao banco de dados');
  });
});
```

### 📊 Impacto

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Debugging** | ❌ Difícil | ✅ Fácil |
| **UX** | ❌ Mensagens vagas | ✅ Mensagens claras |
| **Suporte** | ❌ Muitas perguntas | ✅ Menos perguntas |

### ⏱️ Estimativa de Correção

**Tempo:** 2 horas (todas as funções)  
**Complexidade:** Média

---

## Bug #5 - router.refresh() Duplicado

### 📌 Informações Básicas

| Campo | Valor |
|-------|-------|
| **Severidade** | 🟡 Média |
| **Prioridade** | P2 (Média) |
| **Arquivo** | `src/components/kanban/CreateLeadModal.tsx` |
| **Linha** | 65 |
| **Impacto** | Baixo - Performance degradada |
| **Probabilidade** | Alta - Ocorre sempre |

### 🔍 Descrição do Problema

O componente chama `router.refresh()` após criar lead, mas a Server Action `createLead()` já chama `revalidatePath()`. Isso causa duplo fetch desnecessário, degradando performance.

### 📝 Código Atual (Problemático)

```typescript
// Linhas 56-66
const onSubmit = async (data: CreateLeadFormData) => {
  setIsLoading(true);
  try {
    await createLead(data);
    toast.success('Lead criado com sucesso!', {
      description: `${data.name} foi adicionado ao pipeline.`,
    });
    form.reset();
    setOpen(false);
    router.refresh(); // ❌ DUPLICADO
  } catch (error) {
    // ...
  }
};
```

### ✅ Correção Proposta

```typescript
// Linhas 56-65 (corrigido)
const onSubmit = async (data: CreateLeadFormData) => {
  setIsLoading(true);
  try {
    await createLead(data);
    toast.success('Lead criado com sucesso!', {
      description: `${data.name} foi adicionado ao pipeline.`,
    });
    form.reset();
    setOpen(false);
    // router.refresh() removido - revalidatePath() já atualiza
  } catch (error) {
    // ...
  }
};
```

### 🧪 Teste de Validação

```typescript
// Teste de performance
describe('CreateLeadModal - Performance', () => {
  it('não deve fazer duplo fetch', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch');
    
    render(<CreateLeadModal />);
    
    // Abrir modal e preencher
    fireEvent.click(screen.getByText('Novo Lead'));
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Test' } });
    // ... preencher outros campos
    
    // Submeter
    fireEvent.click(screen.getByText('Criar Lead'));
    
    await waitFor(() => {
      // Deve fazer apenas 1 fetch (createLead)
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
  });
});
```

### 📊 Impacto

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Requests** | 2 (duplicado) | 1 (otimizado) |
| **Performance** | ⚠️ Lenta | ✅ Rápida |
| **Latência** | ~200ms extra | Otimizada |

### ⏱️ Estimativa de Correção

**Tempo:** 15 minutos  
**Complexidade:** Muito Baixa

---

## 📊 Resumo de Prioridades

| Bug | Severidade | Prioridade | Tempo | Deve Corrigir Antes de |
|-----|------------|------------|-------|------------------------|
| #1 - Estado Otimista | 🔴 Crítica | P0 | 1-2h | Demo |
| #2 - URL Hardcoded | 🔴 Crítica | P0 | 30min | Demo |
| #3 - Validação Infinity | 🔴 Crítica | P1 | 1h | Demo |
| #4 - Erro Genérico | 🟡 Alta | P1 | 2h | Produção |
| #5 - router.refresh() | 🟡 Média | P2 | 15min | Produção |

**Tempo Total de Correção:** ~5 horas

---

## 🎯 Plano de Ação Recomendado

### Fase 1: Correções Urgentes (Antes do Demo)
**Prazo:** 1 dia  
**Bugs:** #1, #2, #3

1. Corrigir Bug #2 (30min) - Mais rápido
2. Corrigir Bug #3 (1h) - Validação crítica
3. Corrigir Bug #1 (1-2h) - Mais complexo
4. Testar manualmente todos os cenários
5. Deploy em ambiente de staging

### Fase 2: Melhorias (Antes da Produção)
**Prazo:** 1 semana  
**Bugs:** #4, #5

1. Corrigir Bug #5 (15min) - Quick win
2. Corrigir Bug #4 (2h) - Melhor error handling
3. Implementar testes automatizados
4. Code review final
5. Deploy em produção

---

## 📞 Contato

**QA Engineer:** TEA Agent  
**Para dúvidas:** tea@foursys.com  
**Última Atualização:** 25/12/2025

---

**Próximo Passo:** [Ver Plano de Correção Detalhado](./plano-correcao.md)

