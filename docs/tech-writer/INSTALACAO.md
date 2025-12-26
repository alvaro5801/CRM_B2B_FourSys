# 🚀 Guia de Instalação - CRM B2B FourSys

**Versão:** 2.0.0  
**Data:** 26/12/2025  
**Autor:** Paige (Senior Technical Writer) 📚

---

## 📋 Visão Geral

Este guia fornece instruções **passo a passo** para instalar e executar o CRM B2B FourSys em sua máquina local. Siga cada etapa na ordem apresentada.

**Tempo estimado:** 15-20 minutos

---

## ✅ Pré-requisitos

Antes de começar, você precisa ter instalado em sua máquina:

### 1. Node.js (versão 18 ou superior)

**Verificar se já está instalado:**

```bash
node --version
```

Se retornar algo como `v18.17.0` ou superior, você já tem o Node.js instalado.

**Se não estiver instalado:**

1. Acesse: https://nodejs.org/
2. Baixe a versão **LTS** (recomendada)
3. Execute o instalador
4. Siga as instruções na tela
5. Reinicie o terminal após a instalação

---

### 2. npm (geralmente vem com o Node.js)

**Verificar se já está instalado:**

```bash
npm --version
```

Se retornar algo como `9.6.0` ou superior, você já tem o npm instalado.

---

### 3. Git (opcional, mas recomendado)

**Verificar se já está instalado:**

```bash
git --version
```

**Se não estiver instalado:**

1. Acesse: https://git-scm.com/downloads
2. Baixe o instalador para seu sistema operacional
3. Execute o instalador
4. Siga as instruções na tela

---

## 📥 Passo 1: Obter o Código do Projeto

### Opção A: Clonar do Repositório Git (Recomendado)

```bash
# Clonar o repositório
git clone <url-do-repositorio>

# Entrar na pasta do projeto
cd CRM_B2B_FourSys
```

### Opção B: Baixar ZIP

1. Baixe o arquivo ZIP do projeto
2. Extraia o conteúdo em uma pasta de sua escolha
3. Abra o terminal/prompt de comando
4. Navegue até a pasta extraída:

```bash
cd caminho/para/CRM_B2B_FourSys
```

---

## 📦 Passo 2: Instalar Dependências

Este comando irá baixar e instalar todas as bibliotecas necessárias para o projeto funcionar.

```bash
npm install
```

**O que esperar:**
- O processo pode levar de 2 a 5 minutos (depende da sua conexão)
- Você verá várias mensagens no terminal
- Ao final, uma pasta `node_modules` será criada

**Se aparecer algum erro:**
- Verifique sua conexão com a internet
- Tente executar novamente: `npm install`
- Se persistir, delete a pasta `node_modules` e tente novamente

---

## 🗄️ Passo 3: Configurar o Banco de Dados

### 3.1 Criar Arquivo de Configuração

Crie um arquivo chamado `.env` na raiz do projeto com o seguinte conteúdo:

**Windows (PowerShell):**

```powershell
New-Item -Path .env -ItemType File
```

**Mac/Linux:**

```bash
touch .env
```

**Ou simplesmente:**
- Abra a pasta do projeto no explorador de arquivos
- Crie um novo arquivo de texto
- Renomeie para `.env` (sem extensão .txt)

### 3.2 Adicionar Configurações

Abra o arquivo `.env` em um editor de texto e adicione:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="seu-secret-super-seguro-aqui-mude-em-producao"
NEXTAUTH_URL="http://localhost:3000"
```

**Importante:**
- O `NEXTAUTH_SECRET` pode ser qualquer texto longo e aleatório
- Para gerar um secret seguro, você pode usar: https://generate-secret.vercel.app/32
- Em produção, **sempre** use um secret diferente e seguro

---

### 3.3 Gerar o Prisma Client

Este comando prepara o ORM (Object-Relational Mapping) para trabalhar com o banco de dados:

```bash
npx prisma generate
```

**O que esperar:**
- Mensagem: `✔ Generated Prisma Client`
- Processo rápido (5-10 segundos)

---

### 3.4 Criar o Banco de Dados

Este comando cria o arquivo do banco de dados SQLite:

```bash
npm run db:push
```

**O que esperar:**
- Mensagem: `🚀 Your database is now in sync with your Prisma schema.`
- Um arquivo `dev.db` será criado na pasta `prisma/`

---

### 3.5 Popular o Banco com Dados Iniciais

Este comando adiciona dados de exemplo (tenants, usuários e leads) para você testar o sistema:

```bash
npm run db:seed
```

**O que esperar:**

```
🌱 Iniciando seed do banco de dados (Multi-tenancy)...

🗑️  Limpando dados antigos...
✅ Dados antigos removidos

🏢 Criando Tenants...
   ✅ Tenant criado: FourSys Tecnologia (foursys)
   ✅ Tenant criado: TechCorp Brasil (techcorp)
   ✅ Tenant criado: Inovação Digital (inovacao)

✅ 3 tenants criados!

👤 Criando Usuários...
   ✅ Usuário criado: admin@foursys.com (FourSys Tecnologia)
   ✅ Usuário criado: admin@techcorp.com (TechCorp Brasil)
   ✅ Usuário criado: admin@inovacao.com (Inovação Digital)

✅ 3 usuários criados!

📊 Criando Leads...
   [... lista de leads criados ...]

✅ 15 leads criados!

🎉 Seed concluído com sucesso!

📝 Credenciais de Acesso:
   FourSys Tecnologia: admin@foursys.com / senha123
   TechCorp Brasil: admin@techcorp.com / senha123
   Inovação Digital: admin@inovacao.com / senha123
```

**Importante:** Anote as credenciais de acesso! Você precisará delas para fazer login.

---

## 🚀 Passo 4: Iniciar o Servidor de Desenvolvimento

Agora vamos iniciar a aplicação:

```bash
npm run dev
```

**O que esperar:**

```
▲ Next.js 14.2.0
- Local:        http://localhost:3000
- Environments: .env

✓ Ready in 2.5s
```

**O servidor está rodando!** 🎉

---

## 🌐 Passo 5: Acessar a Aplicação

1. Abra seu navegador (Chrome, Firefox, Edge, Safari)
2. Digite na barra de endereços: **http://localhost:3000**
3. Pressione Enter

Você verá a página de login do CRM FourSys!

---

## 🔐 Passo 6: Fazer Login

Use uma das credenciais criadas no seed:

### Tenant 1: FourSys Tecnologia
- **Email:** `admin@foursys.com`
- **Senha:** `senha123`

### Tenant 2: TechCorp Brasil
- **Email:** `admin@techcorp.com`
- **Senha:** `senha123`

### Tenant 3: Inovação Digital
- **Email:** `admin@inovacao.com`
- **Senha:** `senha123`

**Após o login:**
- Você será redirecionado para o Dashboard
- Verá as métricas do pipeline
- Poderá acessar o Kanban Board
- Todos os dados são isolados por tenant (cada usuário vê apenas seus próprios leads)

---

## ✅ Verificar se Está Funcionando

### 1. Dashboard

Na página inicial (`http://localhost:3000`), você deve ver:

- ✅ 3 cards de métricas (Pipeline Total, Leads Ativos, Taxa de Conversão)
- ✅ Gráfico de vendas dos últimos 30 dias
- ✅ Sidebar com navegação

### 2. Kanban Board

Clique em "Pipeline" na sidebar (`http://localhost:3000/kanban`):

- ✅ 4 colunas: Prospect, Qualificado, Proposta, Fechado
- ✅ Cards de leads distribuídos nas colunas
- ✅ Possibilidade de arrastar cards entre colunas
- ✅ Botão "Novo Lead" no topo

### 3. Criar um Lead

1. Clique no botão "Novo Lead"
2. Preencha o formulário
3. Clique em "Criar Lead"
4. Você verá um toast verde de sucesso
5. O lead aparecerá no Kanban

**Se tudo isso funcionar, a instalação foi bem-sucedida!** 🎉

---

## 🛠️ Comandos Úteis

### Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar servidor de produção (após build)
npm run start

# Verificar erros de código
npm run lint
```

### Banco de Dados

```bash
# Aplicar mudanças no schema ao banco
npm run db:push

# Popular banco com dados iniciais
npm run db:seed

# Abrir Prisma Studio (interface visual do banco)
npm run db:studio

# Resetar banco (CUIDADO: apaga todos os dados)
npm run db:reset
```

### Visualizar o Banco de Dados

Para ver os dados no banco de forma visual:

```bash
npm run db:studio
```

Isso abrirá uma interface web em `http://localhost:5555` onde você pode:
- Ver todos os tenants, usuários e leads
- Editar dados manualmente
- Executar queries

---

## 🔄 Parar o Servidor

Para parar o servidor de desenvolvimento:

1. Vá até o terminal onde o servidor está rodando
2. Pressione `Ctrl + C` (Windows/Linux) ou `Cmd + C` (Mac)
3. Confirme se necessário

Para iniciar novamente:

```bash
npm run dev
```

---

## ❌ Problemas Comuns e Soluções

### Problema 1: Porta 3000 já está em uso

**Erro:**

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solução:**

**Opção A:** Usar outra porta

```bash
PORT=3001 npm run dev
```

**Opção B:** Matar o processo na porta 3000

**Windows:**

```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Mac/Linux:**

```bash
lsof -ti:3000 | xargs kill -9
```

---

### Problema 2: Erro ao instalar dependências

**Erro:**

```
npm ERR! code ENOENT
```

**Solução:**

```bash
# Limpar cache do npm
npm cache clean --force

# Deletar node_modules e package-lock.json
rm -rf node_modules package-lock.json  # Mac/Linux
rmdir /s node_modules & del package-lock.json  # Windows

# Reinstalar
npm install
```

---

### Problema 3: Prisma Client não encontrado

**Erro:**

```
Error: @prisma/client did not initialize yet
```

**Solução:**

```bash
# Regenerar Prisma Client
npx prisma generate

# Se persistir, reinstalar
npm uninstall @prisma/client
npm install @prisma/client
npx prisma generate
```

---

### Problema 4: Banco de dados corrompido

**Erro:**

```
Error: database disk image is malformed
```

**Solução:**

```bash
# Deletar banco e recriar
rm prisma/dev.db  # Mac/Linux
del prisma\dev.db  # Windows

# Recriar
npm run db:push
npm run db:seed
```

---

### Problema 5: Erro de autenticação

**Erro:** Não consegue fazer login

**Solução:**

1. Verifique se o arquivo `.env` existe e tem o `NEXTAUTH_SECRET`
2. Verifique se o banco foi populado com `npm run db:seed`
3. Tente resetar o banco:

```bash
npm run db:reset
npm run db:seed
```

---

### Problema 6: Página em branco ou erro 404

**Solução:**

1. Verifique se o servidor está rodando (`npm run dev`)
2. Verifique se está acessando `http://localhost:3000` (não `https`)
3. Limpe o cache do navegador (Ctrl + Shift + Delete)
4. Tente em modo anônimo/privado

---

## 🎓 Próximos Passos

Após a instalação bem-sucedida, você pode:

1. **Explorar o Sistema:**
   - Navegar entre Dashboard e Kanban
   - Criar, editar e excluir leads
   - Arrastar leads entre colunas
   - Testar com diferentes usuários/tenants

2. **Ler a Documentação:**
   - [`tech-writer/INDEX.md`](tech-writer/INDEX.md) - Documentação técnica completa
   - [`README.md`](README.md) - Visão geral do projeto
   - [`docs/archer/tech-spec.md`](docs/archer/tech-spec.md) - Especificação técnica

3. **Desenvolver:**
   - Modificar componentes em `src/components/`
   - Criar novas Server Actions em `src/app/actions/`
   - Adicionar novos campos ao schema em `prisma/schema.prisma`

---

## 📞 Suporte

Se encontrar problemas não listados aqui:

1. Verifique a seção de troubleshooting acima
2. Consulte a documentação em [`tech-writer/`](tech-writer/)
3. Verifique os logs no terminal para mensagens de erro
4. Entre em contato com a equipe de desenvolvimento

---

## 🎉 Conclusão

Parabéns! Você instalou e configurou com sucesso o CRM B2B FourSys em sua máquina local.

**Checklist Final:**

- [x] Node.js instalado
- [x] Dependências instaladas (`npm install`)
- [x] Arquivo `.env` criado
- [x] Banco de dados criado (`npm run db:push`)
- [x] Dados iniciais carregados (`npm run db:seed`)
- [x] Servidor rodando (`npm run dev`)
- [x] Aplicação acessível em `http://localhost:3000`
- [x] Login funcionando

**Aproveite o sistema!** 🚀

---

## 📊 Resumo dos Comandos

```bash
# 1. Instalar dependências
npm install

# 2. Criar arquivo .env (manualmente)
# Adicionar DATABASE_URL e NEXTAUTH_SECRET

# 3. Configurar banco
npx prisma generate
npm run db:push
npm run db:seed

# 4. Iniciar aplicação
npm run dev

# 5. Acessar no navegador
# http://localhost:3000

# 6. Login
# Email: admin@foursys.com
# Senha: senha123
```

---

**Documentado por:** Paige (Senior Technical Writer) 📚  
**Versão:** 2.0.0  
**Data:** 26/12/2025  
**Status:** ✅ Completo e Testado

---

## 📝 Notas Adicionais

### Requisitos de Sistema

- **Sistema Operacional:** Windows 10+, macOS 10.15+, ou Linux
- **RAM:** Mínimo 4GB (recomendado 8GB)
- **Espaço em Disco:** 500MB livres
- **Navegador:** Chrome, Firefox, Edge, ou Safari (versões recentes)

### Tecnologias Utilizadas

- **Frontend:** Next.js 14, React 18, TypeScript
- **Backend:** Next.js Server Actions, NextAuth
- **Banco de Dados:** SQLite (desenvolvimento), Prisma ORM
- **UI:** Tailwind CSS, Shadcn/ui, Lucide Icons
- **Validação:** Zod, React Hook Form

### Estrutura de Pastas

```
CRM_B2B_FourSys/
├── prisma/              # Banco de dados
│   ├── schema.prisma    # Schema do banco
│   ├── seed.ts          # Dados iniciais
│   └── dev.db           # Arquivo SQLite (gerado)
├── src/
│   ├── app/             # Páginas e rotas
│   ├── components/      # Componentes React
│   └── lib/             # Utilitários
├── tech-writer/         # Documentação técnica
├── .env                 # Configurações (criar)
├── package.json         # Dependências
└── INSTALACAO.md        # Este arquivo
```

---

**Boa sorte com o desenvolvimento!** 💻✨

