# 01 - Server Actions (Backend)

**Arquivo Avaliado:** `src/app/actions/leads.ts`  
**Status:** ✅ **APROVADO COM RESSALVAS MENORES**  
**Nível de Risco:** Médio  
**Pontuação:** 8/10

---

## 📋 Resumo da Análise

As Server Actions estão bem implementadas, seguindo as melhores práticas do Next.js 14. O código é type-safe, com validações adequadas e tratamento de erros. Porém, existem alguns pontos que precisam ser melhorados antes de produção.

---

## ✅ Pontos Positivos

### 1. Arquitetura Correta
- ✅ Uso correto da diretiva `'use server'`
- ✅ Funções assíncronas bem estruturadas
- ✅ Separação clara de responsabilidades

### 2. Type Safety
- ✅ Interfaces TypeScript bem definidas
- ✅ Type exports para reutilização
- ✅ Type assertions onde necessário

### 3. Validação de Dados
- ✅ Validação de status em todas as operações
- ✅ Validação de valores negativos
- ✅ Arrays de status válidos centralizados

### 4. Cache Management
- ✅ Uso correto de `revalidatePath()`
- ✅ Invalidação em rotas corretas (`/` e `/kanban`)
- ✅ Garante sincronização de dados

### 5. Error Handling
- ✅ Try/catch em todas as funções
- ✅ Logging de erros no console
- ✅ Mensagens de erro em português

---

## 🔴 Problemas Críticos

### 1. Mensagens de Erro Genéricas

**Localização:** Linhas 102-104

```typescript
} catch (error) {
  console.error('Error creating lead:', error);
  throw new Error('Falha ao criar lead');
}
```

**Problema:**
- A mensagem genérica esconde o erro real
- Usuário não sabe se foi erro de validação, rede ou banco
- Dificulta debugging em produção

**Impacto:** Alto  
**Severidade:** 🔴 Crítico

**Correção Sugerida:**

```typescript
} catch (error) {
  console.error('Error creating lead:', error);
  
  // Preservar mensagem original se for erro conhecido
  if (error instanceof Error) {
    throw error;
  }
  
  // Erro genérico apenas para casos desconhecidos
  throw new Error('Falha ao criar lead');
}
```

**Aplicar também em:**
- Linha 132-135 (`updateLeadStatus`)
- Linha 174-176 (`getDashboardMetrics`)
- Linha 192-194 (`deleteLead`)

---

### 2. Validação Incompleta de Valores

**Localização:** Linhas 83-85

```typescript
// Validação de valor
if (data.value < 0) {
  throw new Error('Valor não pode ser negativo');
}
```

**Problema:**
- Não valida `Infinity`, `-Infinity` ou `NaN`
- Esses valores passariam pela validação
- Causariam problemas no banco e cálculos

**Impacto:** Alto  
**Severidade:** 🔴 Crítico

**Correção Sugerida:**

```typescript
// Validação de valor
if (data.value < 0 || !isFinite(data.value)) {
  throw new Error('Valor inválido');
}

// Ou mais detalhado:
if (data.value < 0) {
  throw new Error('Valor não pode ser negativo');
}
if (!isFinite(data.value)) {
  throw new Error('Valor deve ser um número válido');
}
```

---

## 🟡 Problemas Médios

### 3. AI Score Não-Determinístico

**Localização:** Linha 88

```typescript
const aiScore = Math.floor(Math.random() * 101);
```

**Problema:**
- Sem seed, testes não são reproduzíveis
- Dificulta testes automatizados
- Para MVP está OK, mas deveria ter comentário

**Impacto:** Médio  
**Severidade:** 🟡 Médio

**Correção Sugerida:**

```typescript
// Gerar AI Score aleatório (0-100)
// TODO: Substituir por algoritmo real de scoring em produção
const aiScore = Math.floor(Math.random() * 101);
```

**Alternativa para Testes:**

```typescript
// Permitir override para testes
const aiScore = data.aiScore ?? Math.floor(Math.random() * 101);
```

---

### 4. Erro Sem Distinção de Tipo

**Localização:** Linha 132-135

```typescript
} catch (error) {
  console.error('Error updating lead status:', error);
  throw new Error('Falha ao atualizar status do lead');
}
```

**Problema:**
- Se lead não existir (Prisma erro P2025), mensagem deveria ser específica
- Usuário não sabe se lead foi deletado ou se houve erro de rede

**Impacto:** Médio  
**Severidade:** 🟡 Médio

**Correção Sugerida:**

```typescript
} catch (error) {
  console.error('Error updating lead status:', error);
  
  // Verificar se é erro de registro não encontrado
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      throw new Error('Lead não encontrado');
    }
  }
  
  throw new Error('Falha ao atualizar status do lead');
}
```

---

### 5. Taxa de Conversão Hardcoded

**Localização:** Linha 166

```typescript
const conversionRate = 23.5;
```

**Problema:**
- Valor fixo sem comentário explicativo
- Pode confundir desenvolvedores futuros
- Deveria ter TODO para implementação real

**Impacto:** Baixo  
**Severidade:** 🟡 Médio

**Correção Sugerida:**

```typescript
// Taxa de Conversão: Mockada para MVP
// TODO: Calcular baseado em leads fechados vs total em produção
const conversionRate = 23.5;
```

---

## ⚠️ Cenários de Borda Identificados

### Cenário 1: Concorrência de Atualizações

**Descrição:**
Dois usuários movem o mesmo lead simultaneamente para colunas diferentes.

**Comportamento Atual:**
- Último update vence (Last Write Wins)
- Não há controle de concorrência
- Pode causar perda de dados

**Impacto:** Médio  
**Probabilidade:** Baixa (em MVP)

**Recomendação:**
```typescript
// Adicionar versioning ou timestamp check
export async function updateLeadStatus(input: UpdateLeadStatusInput): Promise<Lead> {
  try {
    // Buscar lead atual
    const currentLead = await prisma.lead.findUnique({
      where: { id: input.id }
    });
    
    if (!currentLead) {
      throw new Error('Lead não encontrado');
    }
    
    // Verificar se updatedAt mudou (outra pessoa atualizou)
    if (input.expectedUpdatedAt && 
        currentLead.updatedAt.getTime() !== input.expectedUpdatedAt.getTime()) {
      throw new Error('Lead foi modificado por outro usuário. Recarregue a página.');
    }
    
    // Continuar com update...
  }
}
```

---

### Cenário 2: Banco de Dados Offline

**Descrição:**
Banco de dados está inacessível durante operação.

**Comportamento Atual:**
- ✅ Erro é capturado
- ❌ Mensagem genérica não ajuda usuário

**Impacto:** Alto  
**Probabilidade:** Baixa (SQLite local)

**Recomendação:**
```typescript
} catch (error) {
  console.error('Error creating lead:', error);
  
  // Detectar erro de conexão
  if (error instanceof Prisma.PrismaClientInitializationError) {
    throw new Error('Não foi possível conectar ao banco de dados. Tente novamente.');
  }
  
  if (error instanceof Error) {
    throw error;
  }
  
  throw new Error('Falha ao criar lead');
}
```

---

### Cenário 3: Timeout em Operações Longas

**Descrição:**
Operação demora muito (ex: banco com 10.000 leads).

**Comportamento Atual:**
- Sem timeout configurado
- Pode travar indefinidamente

**Impacto:** Médio  
**Probabilidade:** Baixa (MVP com poucos dados)

**Recomendação:**
```typescript
// Configurar timeout no Prisma Client
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Adicionar timeout
  __internal: {
    engine: {
      connectionTimeout: 5000, // 5 segundos
    },
  },
});
```

---

## 🧪 Testes Recomendados

### Unit Tests

```typescript
// __tests__/actions/leads.test.ts

describe('createLead', () => {
  it('deve criar lead com dados válidos', async () => {
    const input = {
      name: 'João Silva',
      company: 'Tech Corp',
      status: 'prospect' as LeadStatus,
      value: 10000,
    };
    
    const lead = await createLead(input);
    
    expect(lead).toHaveProperty('id');
    expect(lead.name).toBe('João Silva');
    expect(lead.aiScore).toBeGreaterThanOrEqual(0);
    expect(lead.aiScore).toBeLessThanOrEqual(100);
  });
  
  it('deve rejeitar valor negativo', async () => {
    const input = {
      name: 'João Silva',
      company: 'Tech Corp',
      status: 'prospect' as LeadStatus,
      value: -1000,
    };
    
    await expect(createLead(input)).rejects.toThrow('Valor não pode ser negativo');
  });
  
  it('deve rejeitar Infinity', async () => {
    const input = {
      name: 'João Silva',
      company: 'Tech Corp',
      status: 'prospect' as LeadStatus,
      value: Infinity,
    };
    
    await expect(createLead(input)).rejects.toThrow('Valor inválido');
  });
  
  it('deve rejeitar status inválido', async () => {
    const input = {
      name: 'João Silva',
      company: 'Tech Corp',
      status: 'invalid' as LeadStatus,
      value: 10000,
    };
    
    await expect(createLead(input)).rejects.toThrow('Status inválido');
  });
});

describe('updateLeadStatus', () => {
  it('deve atualizar status do lead', async () => {
    // Criar lead primeiro
    const lead = await createLead({
      name: 'Test',
      company: 'Test Corp',
      status: 'prospect',
      value: 5000,
    });
    
    // Atualizar status
    const updated = await updateLeadStatus({
      id: lead.id,
      status: 'qualified',
    });
    
    expect(updated.status).toBe('qualified');
    expect(updated.lastContact).not.toBe(lead.lastContact);
  });
  
  it('deve rejeitar lead inexistente', async () => {
    await expect(
      updateLeadStatus({
        id: 'non-existent-id',
        status: 'qualified',
      })
    ).rejects.toThrow('Lead não encontrado');
  });
});

describe('getDashboardMetrics', () => {
  it('deve calcular métricas corretamente', async () => {
    // Criar leads de teste
    await createLead({ name: 'A', company: 'A', status: 'prospect', value: 1000 });
    await createLead({ name: 'B', company: 'B', status: 'qualified', value: 2000 });
    await createLead({ name: 'C', company: 'C', status: 'closed', value: 3000 });
    
    const metrics = await getDashboardMetrics();
    
    expect(metrics.pipelineTotal).toBe(3000); // prospect + qualified
    expect(metrics.activeLeads).toBe(2);
    expect(metrics.conversionRate).toBe(23.5);
  });
  
  it('deve retornar 0 quando não há leads', async () => {
    // Limpar banco
    await prisma.lead.deleteMany();
    
    const metrics = await getDashboardMetrics();
    
    expect(metrics.pipelineTotal).toBe(0);
    expect(metrics.activeLeads).toBe(0);
  });
});
```

---

## 📊 Checklist de Correções

### Antes do Deploy (Demo)

- [ ] Corrigir mensagens de erro genéricas
- [ ] Adicionar validação de Infinity/NaN
- [ ] Adicionar comentários explicativos
- [ ] Testar manualmente todos os cenários

### Antes da Produção

- [ ] Implementar unit tests
- [ ] Adicionar tratamento de erros específicos do Prisma
- [ ] Implementar controle de concorrência
- [ ] Configurar timeout no Prisma
- [ ] Substituir AI Score mock por algoritmo real
- [ ] Adicionar rate limiting
- [ ] Implementar logging estruturado (Winston/Pino)

---

## 📈 Métricas de Qualidade

| Aspecto | Pontuação | Notas |
|---------|-----------|-------|
| **Arquitetura** | 9/10 | Excelente uso de Server Actions |
| **Type Safety** | 10/10 | TypeScript bem aplicado |
| **Validação** | 7/10 | Boa, mas falta validação de edge cases |
| **Error Handling** | 6/10 | Presente, mas genérico demais |
| **Performance** | 9/10 | Eficiente, sem N+1 queries |
| **Segurança** | 8/10 | Prisma previne SQL injection |
| **Testabilidade** | 5/10 | Sem testes automatizados |

**Pontuação Geral:** 8/10

---

## 🔗 Arquivos Relacionados

- [Tech Spec - Server Actions](../archer/tech-spec.md#2-server-actions-backend-strategy)
- [Bugs Críticos](./bugs-criticos.md#1-mensagens-de-erro-genéricas)
- [Plano de Correção](./plano-correcao.md#server-actions)

---

**Última Atualização:** 25/12/2025  
**Próxima Revisão:** Após correções implementadas



