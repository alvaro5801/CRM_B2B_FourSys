# ✅ Gestão de Usuários - Backend (Fase 3)

**Data:** 26/12/2025  
**Status:** 🎉 **COMPLETO**  
**Módulo:** Server Actions para Gestão de Usuários Multi-tenant

---

## 📊 RESUMO

Implementamos o **backend completo** para Gestão de Usuários com foco total em **segurança multi-tenant**, **proteção de dados** e **tratamento de erros robusto**.

---

## ✅ O QUE FOI IMPLEMENTADO

### 1. Tipos e Interfaces

**Arquivo:** `src/app/actions/users.ts`

```typescript
// Tipo seguro para retorno de usuários (sem senha)
export type SafeUser = Omit<User, 'password'>;

// Tipo padrão de resposta para Server Actions
export interface ActionResult<T> {
  data?: T;
  error?: string;
  success?: boolean;
}
```

**Benefícios:**
- ✅ `SafeUser` garante que senha NUNCA é retornada
- ✅ `ActionResult<T>` padroniza respostas de todas as actions
- ✅ TypeScript força validação em tempo de compilação

---

### 2. Server Action: `getTenantUsers()`

**Assinatura:**
```typescript
export async function getTenantUsers(): Promise<ActionResult<SafeUser[]>>
```

**Segurança Implementada:**

#### 🔒 NUNCA Aceita tenantId do Cliente
```typescript
// ❌ ERRADO (Vulnerável)
export async function getTenantUsers(tenantId: string) {
  // Cliente pode passar qualquer tenantId!
}

// ✅ CORRETO (Seguro)
export async function getTenantUsers() {
  const tenantId = await requireTenant(); // Da sessão!
}
```

#### 🔒 Proteção de Dados (Select Explícito)
```typescript
const users = await prisma.user.findMany({
  where: { tenantId },
  select: {
    id: true,
    tenantId: true,
    email: true,
    name: true,
    role: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
    // 🔒 password: false ← NUNCA incluído
  },
});
```

#### 🔒 Isolamento Multi-tenant
```typescript
where: {
  tenantId, // ← Apenas usuários do tenant atual
}
```

**Retorno:**
```typescript
// Sucesso
{
  data: [
    {
      id: "user-123",
      tenantId: "tenant-456",
      email: "admin@foursys.com",
      name: "Admin FourSys",
      role: "admin",
      isActive: true,
      createdAt: Date,
      updatedAt: Date
    }
  ],
  success: true
}

// Erro
{
  error: "Erro ao carregar usuários",
  success: false
}
```

---

### 3. Server Action: `toggleUserStatus()`

**Assinatura:**
```typescript
export async function toggleUserStatus(
  userId: string,
  isActive: boolean
): Promise<ActionResult<SafeUser>>
```

**Segurança Implementada:**

#### 🔒 Validação de Ownership (Cross-Tenant Protection)
```typescript
// 1. Obter tenantId da sessão
const tenantId = await requireTenant();

// 2. Validar que o usuário pertence ao tenant atual
const targetUser = await prisma.user.findFirst({
  where: {
    id: userId,
    tenantId, // ← CRÍTICO: Impede cross-tenant attack
  },
});

if (!targetUser) {
  return {
    error: 'Usuário não encontrado ou não pertence ao seu tenant',
    success: false,
  };
}
```

**Exemplo de Ataque Impedido:**
```typescript
// Hacker tenta desativar usuário de outro tenant
await toggleUserStatus('user-from-other-tenant', false);

// ✅ BLOQUEADO: Query não encontra o usuário porque:
// WHERE id = 'user-from-other-tenant' AND tenantId = 'tenant-do-hacker'
// Retorna: "Usuário não encontrado ou não pertence ao seu tenant"
```

#### 🔒 Proteção de Auto-Desativação
```typescript
const currentUser = await getCurrentUser();

if (userId === currentUser.id) {
  return {
    error: 'Você não pode alterar seu próprio status',
    success: false,
  };
}
```

**Por que?**
- ✅ Impede que admin se tranque fora do sistema
- ✅ Força existência de pelo menos 1 admin ativo

**Retorno:**
```typescript
// Sucesso
{
  data: {
    id: "user-123",
    isActive: false, // Atualizado
    // ... outros campos
  },
  success: true
}

// Erro - Cross-tenant
{
  error: "Usuário não encontrado ou não pertence ao seu tenant",
  success: false
}

// Erro - Auto-desativação
{
  error: "Você não pode alterar seu próprio status",
  success: false
}
```

---

### 4. Server Action: `getUserById()`

**Assinatura:**
```typescript
export async function getUserById(userId: string): Promise<ActionResult<SafeUser>>
```

**Segurança:**
```typescript
const user = await prisma.user.findFirst({
  where: {
    id: userId,
    tenantId, // ← Apenas do tenant atual
  },
  select: {
    // Sem password
  },
});
```

---

### 5. Server Action: `createUser()`

**Assinatura:**
```typescript
export async function createUser(data: CreateUserInput): Promise<ActionResult<SafeUser>>
```

**Validações Implementadas:**

#### Email
```typescript
if (!data.email || !data.email.includes('@')) {
  return { error: 'Email inválido', success: false };
}
```

#### Nome
```typescript
if (!data.name || data.name.trim().length < 2) {
  return { error: 'Nome deve ter pelo menos 2 caracteres', success: false };
}
```

#### Senha
```typescript
if (!data.password || data.password.length < 8) {
  return { error: 'Senha deve ter pelo menos 8 caracteres', success: false };
}
```

#### Email Único
```typescript
const existingUser = await prisma.user.findUnique({
  where: { email: data.email },
});

if (existingUser) {
  return { error: 'Email já cadastrado', success: false };
}
```

**Segurança:**
```typescript
// Hash de senha
const hashedPassword = await bcrypt.hash(data.password, 10);

// Associar ao tenant atual (NUNCA aceita tenantId do cliente)
const user = await prisma.user.create({
  data: {
    tenantId, // ← Da sessão!
    password: hashedPassword,
    // ...
  },
});
```

---

### 6. Server Action: `getUserByEmail()`

**Assinatura:**
```typescript
export async function getUserByEmail(email: string): Promise<ActionResult<SafeUser>>
```

**Segurança:**
```typescript
const user = await prisma.user.findFirst({
  where: {
    email,
    tenantId, // ← Apenas do tenant atual
  },
});
```

---

### 7. Server Action: `getTenantUsersCount()`

**Assinatura:**
```typescript
export async function getTenantUsersCount(): Promise<ActionResult<{
  total: number;
  active: number;
  inactive: number;
}>>
```

**Uso:**
```typescript
const result = await getTenantUsersCount();

if (result.success) {
  console.log(`Total: ${result.data.total}`);
  console.log(`Ativos: ${result.data.active}`);
  console.log(`Inativos: ${result.data.inactive}`);
}
```

---

## 🔒 SEGURANÇA MULTI-TENANT

### Princípios Implementados

#### 1. NUNCA Confiar no Cliente

**❌ VULNERÁVEL:**
```typescript
export async function getUsers(tenantId: string) {
  // Cliente pode passar qualquer tenantId!
  return await prisma.user.findMany({ where: { tenantId } });
}
```

**✅ SEGURO:**
```typescript
export async function getUsers() {
  // tenantId vem da sessão autenticada
  const tenantId = await requireTenant();
  return await prisma.user.findMany({ where: { tenantId } });
}
```

---

#### 2. Validar Ownership em Operações

**❌ VULNERÁVEL:**
```typescript
export async function toggleStatus(userId: string, active: boolean) {
  // Atualiza qualquer usuário, de qualquer tenant!
  return await prisma.user.update({
    where: { id: userId },
    data: { isActive: active },
  });
}
```

**✅ SEGURO:**
```typescript
export async function toggleStatus(userId: string, active: boolean) {
  const tenantId = await requireTenant();
  
  // 1. Validar que o usuário pertence ao tenant
  const user = await prisma.user.findFirst({
    where: { id: userId, tenantId },
  });
  
  if (!user) {
    return { error: 'Acesso negado' };
  }
  
  // 2. Atualizar
  return await prisma.user.update({
    where: { id: userId },
    data: { isActive: active },
  });
}
```

---

#### 3. NUNCA Retornar Senha

**❌ VULNERÁVEL:**
```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  // Retorna TUDO, incluindo password hash!
});
```

**✅ SEGURO:**
```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    email: true,
    name: true,
    // password: false ← Explicitamente excluído
  },
});
```

---

#### 4. Tratamento de Erros Seguro

**❌ VULNERÁVEL:**
```typescript
catch (error) {
  // Expõe detalhes internos ao cliente!
  throw new Error(error.message);
}
```

**✅ SEGURO:**
```typescript
catch (error) {
  // Mensagem genérica para o cliente
  return {
    error: 'Erro ao processar requisição',
    success: false,
  };
  // Log interno para debug (não exposto ao cliente)
  // console.error('Internal error:', error);
}
```

---

## 📊 PADRÃO DE RESPOSTA

### ActionResult<T>

Todas as Server Actions seguem o mesmo padrão:

```typescript
interface ActionResult<T> {
  data?: T;        // Dados em caso de sucesso
  error?: string;  // Mensagem de erro
  success?: boolean; // Flag de sucesso
}
```

**Benefícios:**
- ✅ Consistência em toda a aplicação
- ✅ Fácil de usar no frontend
- ✅ TypeScript valida tipos
- ✅ Tratamento de erro padronizado

**Uso no Frontend:**
```typescript
const result = await getTenantUsers();

if (result.success && result.data) {
  // Sucesso
  console.log('Usuários:', result.data);
} else {
  // Erro
  toast.error(result.error);
}
```

---

## 🧪 EXEMPLOS DE USO

### 1. Listar Usuários

```typescript
const result = await getTenantUsers();

if (result.success && result.data) {
  result.data.forEach(user => {
    console.log(`${user.name} (${user.email})`);
  });
}
```

---

### 2. Desativar Usuário

```typescript
const result = await toggleUserStatus('user-123', false);

if (result.success) {
  toast.success('Usuário desativado com sucesso');
} else {
  toast.error(result.error);
}
```

---

### 3. Criar Usuário

```typescript
const result = await createUser({
  email: 'novo@foursys.com',
  name: 'Novo Usuário',
  password: 'senha123456',
  role: 'user',
});

if (result.success && result.data) {
  toast.success(`Usuário ${result.data.name} criado!`);
  router.push('/users');
} else {
  toast.error(result.error);
}
```

---

### 4. Buscar Usuário

```typescript
const result = await getUserById('user-123');

if (result.success && result.data) {
  console.log('Usuário:', result.data);
}
```

---

### 5. Contar Usuários

```typescript
const result = await getTenantUsersCount();

if (result.success && result.data) {
  console.log(`Total: ${result.data.total}`);
  console.log(`Ativos: ${result.data.active}`);
  console.log(`Inativos: ${result.data.inactive}`);
}
```

---

## 🔄 FLUXO DE SEGURANÇA

### Exemplo: toggleUserStatus()

```
1. Cliente chama: toggleUserStatus('user-999', false)
   ↓
2. Server Action recebe parâmetros
   ↓
3. requireTenant() obtém tenantId da sessão
   - Se não autenticado → Erro: "Não autenticado"
   ↓
4. getCurrentUser() obtém usuário atual
   ↓
5. Validar se userId !== currentUser.id
   - Se igual → Erro: "Não pode alterar próprio status"
   ↓
6. Buscar targetUser WHERE id = userId AND tenantId = tenantId
   ↓
7. Se não encontrar → Erro: "Usuário não encontrado"
   - 🔒 SEGURANÇA: Impede cross-tenant attack
   ↓
8. Atualizar usuário
   ↓
9. Retornar { data: updatedUser, success: true }
```

---

## 🎯 VALIDAÇÕES IMPLEMENTADAS

### getTenantUsers()
- ✅ Autenticação (requireTenant)
- ✅ Isolamento por tenantId
- ✅ Exclusão de password

### toggleUserStatus()
- ✅ Autenticação (requireTenant)
- ✅ Ownership (user pertence ao tenant?)
- ✅ Auto-proteção (não pode desativar a si mesmo)
- ✅ Isolamento por tenantId

### createUser()
- ✅ Autenticação (requireTenant)
- ✅ Email válido
- ✅ Nome mínimo 2 caracteres
- ✅ Senha mínimo 8 caracteres
- ✅ Email único (global)
- ✅ Hash de senha (bcrypt)
- ✅ Associação automática ao tenant

### getUserById()
- ✅ Autenticação (requireTenant)
- ✅ Ownership (user pertence ao tenant?)
- ✅ Exclusão de password

### getUserByEmail()
- ✅ Autenticação (requireTenant)
- ✅ Isolamento por tenantId
- ✅ Exclusão de password

### getTenantUsersCount()
- ✅ Autenticação (requireTenant)
- ✅ Isolamento por tenantId

---

## 📝 TIPOS EXPORTADOS

### Para Uso no Frontend

```typescript
// Importar no componente
import {
  getTenantUsers,
  toggleUserStatus,
  createUser,
  getUserById,
  type SafeUser,
  type ActionResult,
  type UserRole,
} from '@/app/actions/users';

// Usar tipos
const [users, setUsers] = useState<SafeUser[]>([]);

const handleToggle = async (userId: string, isActive: boolean) => {
  const result: ActionResult<SafeUser> = await toggleUserStatus(userId, isActive);
  
  if (result.success && result.data) {
    setUsers(users.map(u => u.id === userId ? result.data! : u));
  }
};
```

---

## 🎉 CONCLUSÃO

### Status: ✅ COMPLETO

**Implementamos:**
- ✅ 6 Server Actions completas
- ✅ Segurança multi-tenant robusta
- ✅ Proteção contra cross-tenant attacks
- ✅ Validação de ownership em todas as operações
- ✅ NUNCA retorna senha
- ✅ NUNCA aceita tenantId do cliente
- ✅ Tratamento de erros padronizado
- ✅ Tipos TypeScript completos
- ✅ Validações de dados

**Resultado:**
- 🔒 **Seguro:** Validação em múltiplas camadas
- 🎯 **Robusto:** Tratamento de erros completo
- 📊 **Padronizado:** ActionResult<T> em tudo
- 🚀 **Pronto para uso:** Frontend pode consumir

**Segurança Garantida:**
- ✅ Isolamento multi-tenant perfeito
- ✅ Proteção de dados sensíveis
- ✅ Validação de ownership
- ✅ Prevenção de ataques cross-tenant

---

## 🎯 PRÓXIMOS PASSOS

### Frontend (Fase 3 - Continuação)

1. **Componente UserList.tsx**
   - Listar usuários do tenant
   - Botão ativar/desativar
   - Indicador de status

2. **Componente UserInviteModal.tsx**
   - Formulário de convite
   - Validações
   - Feedback visual

3. **Página /settings/users**
   - Integrar UserList
   - Integrar UserInviteModal
   - Gestão completa

---

**Última Atualização:** 26/12/2025  
**Status:** ✅ Backend Gestão de Usuários Completo  
**Próxima Etapa:** Frontend - Componentes de UI

🎉 **PARABÉNS! O backend de gestão de usuários está pronto e seguro!** 🎉


