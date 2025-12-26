# Fase 10: Testes e Validação

**Duração Estimada:** 2 horas  
**Pré-requisito:** Fase 9 concluída  
**Objetivo:** Testar todas as funcionalidades e validar qualidade  
**Status:** 🟡 Pendente

---

## Visão Geral

Nesta fase, vamos:
1. **Testes Funcionais** - Verificar todas as features
2. **Testes de Performance** - Velocidade e responsividade
3. **Build de Produção** - Validar compilação
4. **Testes de Integração** - Fluxos completos

---

## 10.1 Checklist de Testes Funcionais

### Dashboard

#### Métricas
- [ ] **Pipeline Total** carrega corretamente
- [ ] **Leads Ativos** mostra contagem correta
- [ ] **Taxa de Conversão** mostra 23,5%
- [ ] Valores formatados em R$ (ex: R$ 150.000,00)
- [ ] Ícones corretos (💰, 👥, 📈)

#### Gráfico
- [ ] Gráfico renderiza sem erros
- [ ] 30 pontos de dados aparecem
- [ ] Tooltip funciona ao passar mouse
- [ ] Tooltip mostra data e valor
- [ ] Linha animada ao carregar

#### Atualização
- [ ] Criar lead no Kanban → Dashboard atualiza
- [ ] Mover lead para "Fechado" → Métricas atualizam
- [ ] Recarregar página → Dados persistem

---

### Kanban Board

#### Visualização
- [ ] 4 colunas aparecem (Prospect, Qualificado, Proposta, Fechado)
- [ ] Leads distribuídos corretamente
- [ ] Contador de leads em cada coluna correto
- [ ] Cores das bordas corretas (azul, amarelo, laranja, verde)

#### Lead Cards
- [ ] Nome do cliente aparece
- [ ] Nome da empresa aparece
- [ ] Valor formatado em R$
- [ ] AI Score badge com cor correta:
  - 0-40: Vermelho
  - 41-70: Amarelo
  - 71-100: Verde
- [ ] Email aparece (se existir)
- [ ] Telefone aparece (se existir)
- [ ] Último contato formatado (ex: "Há 2 dias")

#### Drag & Drop
- [ ] Arrastar card funciona
- [ ] Card segue o mouse durante drag
- [ ] Coluna de destino destaca ao hover
- [ ] Card aparece na nova coluna imediatamente (optimistic)
- [ ] Soltar card atualiza banco de dados
- [ ] Recarregar página mantém mudança

#### Persistência
- [ ] Mover lead → Recarregar → Lead na nova coluna
- [ ] Criar lead → Recarregar → Lead continua lá
- [ ] Fechar navegador → Reabrir → Dados mantidos

---

### Modal de Criação

#### Abrir/Fechar
- [ ] Clicar "Novo Lead" abre modal
- [ ] Modal abre com animação
- [ ] Clicar "Cancelar" fecha modal
- [ ] Clicar fora do modal fecha (opcional)
- [ ] ESC fecha modal

#### Validação de Campos Obrigatórios
- [ ] Submeter vazio → Mostra erros
- [ ] Nome < 3 caracteres → Mostra erro "Nome deve ter no mínimo 3 caracteres"
- [ ] Empresa < 2 caracteres → Mostra erro "Empresa deve ter no mínimo 2 caracteres"
- [ ] Valor negativo → Mostra erro "Valor não pode ser negativo"
- [ ] Status não selecionado → Mostra erro

#### Validação de Email
- [ ] Email inválido → Mostra erro "Email inválido"
- [ ] Email válido → Aceita
- [ ] Email vazio → Aceita (campo opcional)

#### Criar Lead
- [ ] Preencher campos obrigatórios
- [ ] Clicar "Criar Lead"
- [ ] Botão mostra loading
- [ ] Modal fecha após sucesso
- [ ] Lead aparece no Kanban imediatamente
- [ ] AI Score gerado automaticamente (0-100)
- [ ] Recarregar página → Lead continua lá

---

### Navegação

#### Sidebar
- [ ] Logo "CRM FourSys" aparece
- [ ] 2 itens de navegação aparecem
- [ ] Ícones corretos (📊 Dashboard, 📋 Pipeline)
- [ ] Footer "v1.0" aparece

#### Links
- [ ] Clicar "Dashboard" → Vai para `/`
- [ ] Clicar "Pipeline" → Vai para `/kanban`
- [ ] URL muda corretamente
- [ ] Navegação sem reload completo (SPA)

#### Active State
- [ ] Em `/` → "Dashboard" destacado (azul)
- [ ] Em `/kanban` → "Pipeline" destacado (azul)
- [ ] Item ativo tem background primário
- [ ] Itens inativos têm cor muted

#### Hover State
- [ ] Passar mouse sobre item → Muda cor
- [ ] Transição suave (200ms)

---

## 10.2 Testes de Performance

### Métricas de Performance

```bash
# Iniciar servidor
npm run dev

# Abrir DevTools (F12)
# Aba "Lighthouse"
# Rodar audit
```

#### Metas de Performance

- [ ] **Performance:** > 90
- [ ] **Accessibility:** > 90
- [ ] **Best Practices:** > 90
- [ ] **SEO:** > 90

### Tempos de Carregamento

- [ ] Dashboard carrega em < 2s
- [ ] Kanban carrega em < 2s
- [ ] Drag & Drop latência < 100ms
- [ ] Modal abre em < 200ms

### Verificar Console

- [ ] Sem erros no console
- [ ] Sem warnings críticos
- [ ] Sem memory leaks

---

## 10.3 Build de Produção

### Compilar Projeto

```bash
# Build de produção
npm run build
```

### Verificações

- [ ] Build completa sem erros
- [ ] Sem erros TypeScript
- [ ] Sem erros de linting
- [ ] Bundle size razoável (< 500KB)

### Testar Build

```bash
# Iniciar build
npm run start

# Abrir http://localhost:3000
```

- [ ] Todas as páginas funcionam
- [ ] Drag & Drop funciona
- [ ] Modal funciona
- [ ] Navegação funciona

---

## 10.4 Testes de Integração (Fluxos Completos)

### Fluxo 1: Criar e Mover Lead

1. [ ] Abrir `/kanban`
2. [ ] Clicar "Novo Lead"
3. [ ] Preencher dados:
   - Nome: "Teste User"
   - Empresa: "Teste Corp"
   - Valor: 10000
   - Status: Prospect
4. [ ] Clicar "Criar Lead"
5. [ ] Lead aparece em "Prospect"
6. [ ] Arrastar para "Qualificado"
7. [ ] Lead aparece em "Qualificado"
8. [ ] Ir para Dashboard
9. [ ] Métricas atualizadas
10. [ ] Recarregar página
11. [ ] Lead continua em "Qualificado"

### Fluxo 2: Validação de Formulário

1. [ ] Abrir `/kanban`
2. [ ] Clicar "Novo Lead"
3. [ ] Deixar campos vazios
4. [ ] Clicar "Criar Lead"
5. [ ] Erros aparecem
6. [ ] Preencher nome com "Te"
7. [ ] Erro "Nome deve ter no mínimo 3 caracteres"
8. [ ] Preencher nome com "Teste"
9. [ ] Erro desaparece
10. [ ] Preencher todos os campos
11. [ ] Clicar "Criar Lead"
12. [ ] Lead criado com sucesso

### Fluxo 3: Navegação Completa

1. [ ] Abrir `/`
2. [ ] Ver Dashboard
3. [ ] Clicar "Pipeline"
4. [ ] Ver Kanban
5. [ ] Clicar "Dashboard"
6. [ ] Voltar para Dashboard
7. [ ] Active state correto em cada página

---

## 10.5 Testes de Responsividade

### Mobile (375px - iPhone SE)

- [ ] Sidebar visível (ou menu hamburger se implementado)
- [ ] Dashboard: 1 coluna de cards
- [ ] Cards legíveis
- [ ] Kanban: 1 coluna
- [ ] Modal ocupa tela inteira
- [ ] Botões clicáveis (min 44x44px)
- [ ] Texto legível (min 16px)

### Tablet (768px - iPad)

- [ ] Dashboard: 2 colunas de cards
- [ ] Kanban: 2 colunas
- [ ] Sidebar visível
- [ ] Espaçamentos adequados

### Desktop (1920px)

- [ ] Dashboard: 3 colunas de cards
- [ ] Kanban: 4 colunas
- [ ] Sidebar visível
- [ ] Espaçamentos generosos
- [ ] Não há espaço vazio excessivo

---

## 10.6 Testes de Acessibilidade

### Navegação por Teclado

- [ ] Tab navega entre elementos
- [ ] Enter abre modal
- [ ] ESC fecha modal
- [ ] Focus visível (outline azul)

### Screen Readers

- [ ] Imagens têm alt text
- [ ] Botões têm labels descritivos
- [ ] Formulários têm labels associados

### Contraste

- [ ] Texto legível sobre background
- [ ] Contraste mínimo 4.5:1

---

## 10.7 Testes de Banco de Dados

### Verificar Dados

```bash
# Abrir Prisma Studio
npm run db:studio

# Verificar:
```

- [ ] Tabela `Lead` existe
- [ ] 15 leads iniciais (do seed)
- [ ] Campos corretos (id, name, company, etc.)
- [ ] Status válidos (prospect, qualified, proposal, closed)
- [ ] AI Score entre 0-100

### Testar CRUD

```bash
# No Prisma Studio:
```

- [ ] Criar lead manualmente
- [ ] Editar lead
- [ ] Deletar lead
- [ ] Mudanças refletem na UI

---

## 10.8 Checklist Final de Qualidade

### Código
- [ ] Sem erros TypeScript
- [ ] Sem erros de linting
- [ ] Sem console.log() esquecidos
- [ ] Sem TODOs críticos

### UI/UX
- [ ] Todas as animações suaves
- [ ] Sem "pulos" visuais
- [ ] Loading states implementados
- [ ] Feedback visual em todas as ações

### Performance
- [ ] Lighthouse score > 90
- [ ] Sem memory leaks
- [ ] Bundle size otimizado

### Funcionalidade
- [ ] Todos os fluxos funcionam
- [ ] Persistência de dados
- [ ] Validações funcionando

---

## Troubleshooting

### Build falha

```bash
# Verificar erros TypeScript
npm run build

# Corrigir erros um por um
```

### Performance ruim

```bash
# Verificar bundle size
npm run build

# Analisar com Bundle Analyzer
npm install -D @next/bundle-analyzer
```

### Dados não persistem

```bash
# Verificar banco de dados
npm run db:studio

# Verificar Server Actions
console.log() nas funções
```

---

## Próxima Fase

➡️ **Fase 11: Otimização e Performance**
- Adicionar metadata SEO
- Otimizar imagens
- Configurar loading states
- Verificar bundle size

**Arquivo:** `docs/design/fase-11-otimizacao.md`

---

**Preparado por:** Winston (Architect) 🏗️  
**Data:** 25/12/2025  
**Status:** ✅ Pronto para Execução

