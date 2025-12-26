# Fase 7: Modal de Criação de Leads

**Duração Estimada:** 1.5 horas  
**Pré-requisito:** Fase 6 concluída  
**Objetivo:** Implementar modal para criar novos leads com validação  
**Status:** 🟡 Pendente

---

## Visão Geral

Nesta fase, criaremos:
1. **Schema de Validação** (Zod)
2. **CreateLeadModal** - Modal com formulário
3. **Integração** com Server Action

---

## 7.1 Criar Schema de Validação

### Arquivo: `src/lib/validations/lead.ts`

**Criar pasta e arquivo:**

```bash
mkdir -p src/lib/validations
touch src/lib/validations/lead.ts
```

**Conteúdo:**

```typescript
import * as z from 'zod';

export const createLeadSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  company: z.string().min(2, 'Empresa deve ter no mínimo 2 caracteres'),
  value: z.coerce.number().min(0, 'Valor não pode ser negativo'),
  status: z.enum(['prospect', 'qualified', 'proposal', 'closed']),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
});

export type CreateLeadFormData = z.infer<typeof createLeadSchema>;
```

### Validações Implementadas

| Campo | Validação |
|-------|-----------|
| `name` | Mínimo 3 caracteres |
| `company` | Mínimo 2 caracteres |
| `value` | Não pode ser negativo |
| `status` | Deve ser um dos 4 status válidos |
| `email` | Formato de email válido (opcional) |
| `phone` | Opcional |

---

## 7.2 Criar Modal de Criação

### Arquivo: `src/components/kanban/CreateLeadModal.tsx`

**Criar arquivo:**

```bash
touch src/components/kanban/CreateLeadModal.tsx
```

**Conteúdo:**

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { createLead } from '@/app/actions/leads';
import { createLeadSchema, type CreateLeadFormData } from '@/lib/validations/lead';
import { Loading } from '@/components/ui/loading';

export function CreateLeadModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateLeadFormData>({
    resolver: zodResolver(createLeadSchema),
    defaultValues: {
      name: '',
      company: '',
      value: 0,
      status: 'prospect',
      email: '',
      phone: '',
    },
  });

  const onSubmit = async (data: CreateLeadFormData) => {
    setIsLoading(true);
    try {
      await createLead(data);
      form.reset();
      setOpen(false);
      router.refresh();
      // TODO: Adicionar toast de sucesso
    } catch (error) {
      console.error('Error creating lead:', error);
      // TODO: Adicionar toast de erro
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Lead</DialogTitle>
          <DialogDescription>
            Preencha os dados do lead. Campos marcados com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Nome */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Cliente *</FormLabel>
                  <FormControl>
                    <Input placeholder="João Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Empresa */}
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empresa *</FormLabel>
                  <FormControl>
                    <Input placeholder="Tech Solutions" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Valor e Status (lado a lado) */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$) *</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="10000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="prospect">Prospect</SelectItem>
                        <SelectItem value="qualified">Qualificado</SelectItem>
                        <SelectItem value="proposal">Proposta</SelectItem>
                        <SelectItem value="closed">Fechado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="joao@empresa.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Telefone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="(11) 99999-9999" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loading size="sm" className="mr-2" />
                    Criando...
                  </>
                ) : (
                  'Criar Lead'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 7.3 Atualizar Página Kanban

### Arquivo: `src/app/kanban/page.tsx`

**Substituir import do Button e adicionar CreateLeadModal:**

```typescript
import { getLeads } from '../actions/leads';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { CreateLeadModal } from '@/components/kanban/CreateLeadModal';

export const metadata = {
  title: 'Pipeline | CRM FourSys',
  description: 'Gestão visual de leads',
};

export default async function KanbanPage() {
  const leads = await getLeads();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Pipeline de Vendas</h2>
        <CreateLeadModal />
      </div>

      <KanbanBoard initialLeads={leads} />
    </div>
  );
}
```

---

## 7.4 Testar Modal

### Abrir Kanban

```
http://localhost:3000/kanban
```

### Testes Funcionais

#### Abrir Modal
- [ ] Clicar em "Novo Lead"
- [ ] Modal abre com animação fade-in
- [ ] Todos os campos aparecem

#### Validação de Campos Obrigatórios
- [ ] Tentar submeter vazio → Mostra erros
- [ ] Nome com < 3 caracteres → Mostra erro
- [ ] Empresa com < 2 caracteres → Mostra erro
- [ ] Valor negativo → Mostra erro

#### Validação de Email
- [ ] Email inválido → Mostra erro
- [ ] Email válido → Aceita
- [ ] Email vazio → Aceita (opcional)

#### Criar Lead
- [ ] Preencher todos os campos obrigatórios
- [ ] Clicar em "Criar Lead"
- [ ] Loading aparece no botão
- [ ] Modal fecha
- [ ] Lead aparece imediatamente no Kanban
- [ ] Recarregar página → Lead continua lá

#### Cancelar
- [ ] Clicar em "Cancelar"
- [ ] Modal fecha
- [ ] Dados não são salvos

---

## 7.5 Fluxo Completo

### 1. User Clica "Novo Lead"

```typescript
<DialogTrigger asChild>
  <Button>Novo Lead</Button>
</DialogTrigger>
```

### 2. Modal Abre

- Formulário vazio
- Valores padrão: status = 'prospect', value = 0

### 3. User Preenche Dados

- React Hook Form gerencia estado
- Validação em tempo real (Zod)

### 4. User Clica "Criar Lead"

```typescript
const onSubmit = async (data) => {
  setIsLoading(true);
  await createLead(data);  // Server Action
  router.refresh();        // Atualiza página
  setOpen(false);          // Fecha modal
};
```

### 5. Lead Criado

- AI Score gerado automaticamente (0-100)
- Lead salvo no banco
- Kanban atualizado
- Dashboard atualizado

---

## Checklist de Conclusão

### Schema de Validação
- [ ] `lead.ts` criado em `lib/validations/`
- [ ] Schema Zod definido
- [ ] Validações implementadas
- [ ] Type exportado

### Modal Component
- [ ] `CreateLeadModal.tsx` criado
- [ ] Dialog do Shadcn/ui usado
- [ ] React Hook Form integrado
- [ ] Zod resolver configurado

### Formulário
- [ ] Todos os campos implementados
- [ ] Campos obrigatórios marcados com *
- [ ] Validação em tempo real
- [ ] Mensagens de erro exibidas

### Integração
- [ ] Server Action `createLead` chamada
- [ ] Loading state implementado
- [ ] Modal fecha após sucesso
- [ ] Página atualiza (router.refresh)

### Kanban Page
- [ ] CreateLeadModal integrado
- [ ] Botão "Novo Lead" funciona
- [ ] Lead aparece imediatamente após criação

### Testes
- [ ] Validação de campos obrigatórios funciona
- [ ] Validação de email funciona
- [ ] Lead criado com sucesso
- [ ] Persistência verificada
- [ ] Sem erros no console

---

## Troubleshooting

### Erro: "Cannot find module 'react-hook-form'"

```bash
npm install react-hook-form zod @hookform/resolvers
```

### Erro: Validação não funciona

```typescript
// Verificar se zodResolver está configurado
resolver: zodResolver(createLeadSchema)
```

### Erro: Modal não fecha após criar

```typescript
// Verificar se setOpen(false) está sendo chamado
setOpen(false);
```

### Erro: Lead não aparece após criar

```typescript
// Verificar se router.refresh() está sendo chamado
router.refresh();
```

---

## Melhorias Futuras (Pós-MVP)

1. **Toast Notifications** - Feedback visual de sucesso/erro
2. **Upload de Avatar** - Foto do lead
3. **Campos Customizados** - Configuráveis pelo usuário
4. **Validação de Telefone** - Formato brasileiro
5. **Autocomplete de Empresa** - Sugestões baseadas em CNPJ

---

## Próxima Fase

➡️ **Fase 8: Navegação e Layout**
- Criar Sidebar component
- Implementar navegação entre páginas
- Configurar layout principal
- Adicionar active states

**Arquivo:** `docs/design/fase-08-navegacao-layout.md`

---

**Preparado por:** Winston (Architect) 🏗️  
**Data:** 25/12/2025  
**Status:** ✅ Pronto para Execução

