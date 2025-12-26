
## 1. O Que Estamos Construindo 
Um CRM B2B focado em **Gestão Visual de Leads** para PMEs.
**Diferencial da Demo:** Interface extremamente fluida e simulação visual de "Inteligência de Vendas".


## 2. Escopo Fechado (O Que Entra)
Faremos **apenas** estas 3 telas/funcionalidades. Todo o resto (Login real, Integrações, Configurações) está fora.

### A. Dashboard (Home)
- **Visual:** 3 Cards de Métricas no topo + Gráfico de linha simples.
- **Métricas (Mockadas/Calculadas):**
  1. "Pipeline Total" (Soma dos valores dos leads abertos).
  2. "Leads Ativos" (Contagem).
  3. "Taxa de Conversão" (Valor estático % para impressionar).
- **Gráfico:** "Vendas nos últimos 30 dias" (Usar Recharts com dados estáticos).

### B. Kanban Board (O Coração do App)
- **Colunas Fixas:** `Prospect` -> `Qualificado` -> `Proposta` -> `Fechado`.
- **Ação:** Drag & Drop (Arrastar cards entre colunas).
- **O Card do Lead:** Deve mostrar Nome, Empresa, Valor e uma **Badge de "IA Score"**.

### C. Gestão de Leads (CRUD Simplificado)
- Botão "Novo Lead" abre um Modal (Dialog).
- **Campos Obrigatórios:** Nome do Cliente, Nome da Empresa, Valor Estimado (R$), Status.
- **Campos Opcionais:** Email, Telefone.

## 3. Estrutura de Dados (Schema JSON)
Não usaremos Banco de Dados Real. Usaremos `LocalStorage` ou `Zustand Store`.
O objeto `Lead` deve seguir estritamente este formato:

```typescript
type Lead = {
  id: string;           // UUID
  name: string;         // Ex: "João Silva"
  company: string;      // Ex: "Tech Solutions"
  status: 'prospect' | 'qualified' | 'proposal' | 'closed';
  value: number;        // Ex: 5000.00
  aiScore: number;      // 0 a 100 (Gerado automaticamente)
  lastContact: string;  // Data ISO
};