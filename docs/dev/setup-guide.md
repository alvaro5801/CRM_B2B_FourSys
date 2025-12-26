# Guia de Setup - CRM B2B FourSys

**Versão:** 1.0.0  
**Data:** 25/12/2025  
**Público:** Desenvolvedores

---

## Visão Geral

Este guia fornece instruções detalhadas para configurar o ambiente de desenvolvimento do CRM B2B FourSys, desde a instalação de pré-requisitos até a execução do projeto.

---

## Pré-requisitos

### Software Necessário

| Software | Versão Mínima | Versão Recomendada | Download |
|----------|---------------|-------------------|----------|
| Node.js | 18.0.0 | 18.17.0+ | https://nodejs.org |
| npm | 9.0.0 | 9.6.0+ | Incluído com Node.js |
| Git | 2.30.0 | 2.40.0+ | https://git-scm.com |
| VS Code | 1.70.0 | Última | https://code.visualstudio.com |

### Verificar Instalações

```bash
# Verificar Node.js
node --version
# Saída esperada: v18.17.0 ou superior

# Verificar npm
npm --version
# Saída esperada: 9.6.0 ou superior

# Verificar Git
git --version
# Saída esperada: git version 2.40.0 ou superior
```

---

## Instalação do Projeto

### Opção 1: Clonar do Repositório

```bash
# 1. Clonar o repositório
git clone <url-do-repositorio>

# 2. Entrar no diretório
cd CRM_B2B_FourSys

# 3. Instalar dependências
npm install
```

### Opção 2: Extrair de ZIP

```bash
# 1. Extrair o arquivo ZIP
unzip CRM_B2B_FourSys.zip

# 2. Entrar no diretório
cd CRM_B2B_FourSys

# 3. Instalar dependências
npm install
```

### Tempo de Instalação

- Primeira instalação: 2-5 minutos (depende da conexão)
- Reinstalação (com cache): 30-60 segundos

---

## Configuração do Banco de Dados

### 1. Criar Arquivo .env

O projeto usa SQLite por padrão. Crie um arquivo `.env` na raiz do projeto:

```bash
# Criar arquivo .env
touch .env
```

Adicione o seguinte conteúdo:

```env
# Database
DATABASE_URL="file:./dev.db"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Gerar Prisma Client

```bash
npx prisma generate
```

**Saída esperada:**

```
✔ Generated Prisma Client (5.19.0) to ./node_modules/@prisma/client
```

### 3. Criar Banco de Dados

```bash
npm run db:push
```

**Saída esperada:**

```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": SQLite database "dev.db" at "file:./dev.db"

SQLite database dev.db created at file:./dev.db

🚀  Your database is now in sync with your Prisma schema.
```

### 4. Popular com Dados Iniciais

```bash
npm run db:seed
```

**Saída esperada:**

```
🌱 Iniciando seed do banco de dados...
🗑️  Dados antigos removidos
✅ 15 leads criados com sucesso!

📊 Distribuição por Status:
   Prospect: 4
   Qualificado: 3
   Proposta: 5
   Fechado: 3

💰 Valor Total do Pipeline: R$ 245.000
```

### 5. Verificar Banco (Opcional)

```bash
npm run db:studio
```

Isso abre o Prisma Studio em `http://localhost:5555` onde você pode visualizar e editar os dados.

---

## Executar o Projeto

### Modo Desenvolvimento

```bash
npm run dev
```

**Saída esperada:**

```
▲ Next.js 14.2.0
- Local:        http://localhost:3000
- Environments: .env

✓ Ready in 2.5s
```

Acesse: **http://localhost:3000**

### Modo Produção

```bash
# 1. Build
npm run build

# 2. Start
npm run start
```

**Build - Saída esperada:**

```
▲ Next.js 14.2.0

Creating an optimized production build ...
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (4/4)
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    107 kB         194 kB
├ ○ /kanban                              89.2 kB        185 kB
└ ○ /test-ui                             136 B          87.5 kB

○  (Static)  automatically rendered as static HTML
```

---

## Extensões do VS Code Recomendadas

### Essenciais

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### Instalação Rápida

1. Abra o VS Code
2. Pressione `Ctrl+Shift+P` (Windows/Linux) ou `Cmd+Shift+P` (Mac)
3. Digite: `Extensions: Show Recommended Extensions`
4. Clique em "Install All"

### Configurações Recomendadas

Crie `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

---

## Estrutura de Pastas

Após a instalação, você terá:

```
CRM_B2B_FourSys/
├── .next/                  # Build do Next.js (gerado)
├── node_modules/           # Dependências (gerado)
├── prisma/
│   ├── dev.db             # Banco SQLite (gerado)
│   ├── schema.prisma      # Schema do banco
│   └── seed.ts            # Script de seed
├── src/
│   ├── app/               # Páginas e rotas
│   ├── components/        # Componentes React
│   └── lib/               # Utilitários e configurações
├── docs/                  # Documentação
├── .env                   # Variáveis de ambiente (criar)
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

---

## Comandos Disponíveis

### Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar servidor de produção
npm run start

# Linting
npm run lint
```

### Banco de Dados

```bash
# Aplicar schema ao banco
npm run db:push

# Popular banco com dados iniciais
npm run db:seed

# Abrir Prisma Studio (GUI do banco)
npm run db:studio

# Resetar banco de dados (CUIDADO: apaga todos os dados)
npm run db:reset
```

### Utilitários

```bash
# Instalar nova dependência
npm install <package-name>

# Instalar dependência de desenvolvimento
npm install -D <package-name>

# Atualizar dependências
npm update

# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

---

## Troubleshooting

### Problema 1: Porta 3000 em Uso

**Erro:**

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solução:**

```bash
# Opção 1: Usar outra porta
PORT=3001 npm run dev

# Opção 2: Matar processo na porta 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Opção 2: Matar processo na porta 3000 (Mac/Linux)
lsof -ti:3000 | xargs kill -9
```

---

### Problema 2: Erro ao Instalar Dependências

**Erro:**

```
npm ERR! code ENOENT
npm ERR! syscall open
```

**Solução:**

```bash
# Limpar cache do npm
npm cache clean --force

# Deletar node_modules e package-lock.json
rm -rf node_modules package-lock.json

# Reinstalar
npm install
```

---

### Problema 3: Prisma Client Não Encontrado

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

### Problema 4: Banco de Dados Corrompido

**Erro:**

```
Error: database disk image is malformed
```

**Solução:**

```bash
# Deletar banco e recriar
rm prisma/dev.db
npm run db:push
npm run db:seed
```

---

### Problema 5: TypeScript Errors

**Erro:**

```
Type error: Cannot find module '@/components/...'
```

**Solução:**

```bash
# Verificar tsconfig.json
# Deve conter:
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

# Reiniciar TypeScript Server no VS Code
# Ctrl+Shift+P > TypeScript: Restart TS Server
```

---

### Problema 6: Tailwind CSS Não Funciona

**Erro:** Estilos não aplicados

**Solução:**

```bash
# Verificar tailwind.config.ts
# Deve conter:
{
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ]
}

# Reiniciar servidor
npm run dev
```

---

## Variáveis de Ambiente

### Desenvolvimento

```env
# .env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### Produção

```env
# .env.production
DATABASE_URL="postgresql://user:password@host:5432/database"
NEXT_PUBLIC_APP_URL="https://seu-dominio.com"
NODE_ENV="production"
```

### Segurança

- ✅ Nunca commitar `.env` no Git
- ✅ Usar `.env.local` para variáveis locais
- ✅ Usar `.env.example` como template
- ✅ Documentar variáveis necessárias

---

## Workflows de Desenvolvimento

### Feature Branch Workflow

```bash
# 1. Criar branch
git checkout -b feature/nova-funcionalidade

# 2. Fazer mudanças
# ... código ...

# 3. Commit
git add .
git commit -m "feat: adiciona nova funcionalidade"

# 4. Push
git push origin feature/nova-funcionalidade

# 5. Criar Pull Request no GitHub
```

### Commits Semânticos

```bash
feat: nova funcionalidade
fix: correção de bug
docs: atualização de documentação
style: formatação de código
refactor: refatoração
test: adição de testes
chore: tarefas de manutenção
```

---

## Testes Locais

### Checklist Antes de Commitar

```bash
# 1. Linting
npm run lint
# Deve retornar: ✓ No ESLint warnings or errors

# 2. Build
npm run build
# Deve compilar sem erros

# 3. Testar build localmente
npm run start
# Acessar http://localhost:3000 e testar funcionalidades

# 4. Verificar TypeScript
npx tsc --noEmit
# Deve retornar sem erros
```

---

## Performance

### Otimizações Aplicadas

- ✅ Server Components por padrão
- ✅ Static Generation quando possível
- ✅ Code Splitting automático
- ✅ Optimistic Updates
- ✅ Image Optimization (next/image)

### Monitorar Performance

```bash
# Build com análise de bundle
npm run build

# Verificar tamanhos
# Saída mostra First Load JS de cada rota
```

---

## Próximos Passos

Após completar o setup:

1. ✅ Explorar o Dashboard em `/`
2. ✅ Testar Kanban Board em `/kanban`
3. ✅ Criar um lead de teste
4. ✅ Arrastar lead entre colunas
5. ✅ Ler a [documentação completa](../archer/INDEX.md)
6. ✅ Consultar [API Reference](api-reference.md)
7. ✅ Explorar [Components Guide](components-guide.md)

---

## Recursos Adicionais

### Documentação

- [README.md](../../README.md) - Visão geral do projeto
- [Product Brief](../pm/product-brief.md) - Requisitos do produto
- [Tech Spec](../archer/tech-spec.md) - Especificação técnica
- [API Reference](api-reference.md) - Documentação das Server Actions
- [Components Guide](components-guide.md) - Guia de componentes UI

### Links Externos

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn/ui](https://ui.shadcn.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## Suporte

Para dúvidas ou problemas:

1. Consulte a seção [Troubleshooting](#troubleshooting) deste guia
2. Verifique a [documentação completa](../archer/INDEX.md)
3. Entre em contato com a equipe de desenvolvimento

---

**Documentado por:** Paige (Technical Writer) 📚  
**Data:** 25/12/2025  
**Versão:** 1.0.0



