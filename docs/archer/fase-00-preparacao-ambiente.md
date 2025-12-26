# Fase 0: Preparação do Ambiente

**Duração Estimada:** 30 minutos  
**Responsável:** Developer  
**Pré-requisitos:** Node.js 18+, npm/yarn, VS Code  
**Status:** 🟡 Pendente

---

## Objetivo

Preparar o ambiente de desenvolvimento com todas as ferramentas necessárias para iniciar o projeto CRM B2B FourSys MVP.

---

## 0.1 Ferramentas Necessárias

### Node.js e npm
- [ ] Node.js 18+ instalado
- [ ] npm ou yarn atualizado

### Editor de Código
- [ ] VS Code instalado

### Extensões VS Code Obrigatórias
- [ ] **Prisma** - Syntax highlighting para Prisma schema
- [ ] **Tailwind CSS IntelliSense** - Autocomplete para classes Tailwind
- [ ] **ES7+ React/Redux/React-Native snippets** - Snippets para React
- [ ] **Error Lens** - Visualização inline de erros

### Extensões VS Code Recomendadas (Opcional)
- [ ] **Pretty TypeScript Errors** - Erros TypeScript mais legíveis
- [ ] **Auto Rename Tag** - Renomear tags HTML automaticamente
- [ ] **GitLens** - Melhor integração com Git

---

## 0.2 Verificação do Ambiente

### Comandos de Verificação

```bash
# Verificar versão do Node.js (deve ser >= 18.0.0)
node --version

# Verificar versão do npm (deve ser >= 9.0.0)
npm --version

# Verificar se Git está instalado
git --version
```

### Resultados Esperados

```bash
# Exemplo de saída esperada:
v20.10.0  # Node.js
10.2.3    # npm
git version 2.42.0  # Git
```

---

## 0.3 Estrutura de Pastas Inicial

### Verificar Estrutura Existente

```bash
# Navegar para a pasta do projeto
cd CRM_B2B_FourSys

# Listar estrutura atual
ls -la
```

### Estrutura Esperada

```
CRM_B2B_FourSys/
├── docs/
│   ├── pm/
│   │   └── product-brief.md          ✅ Já existe
│   ├── design/
│   │   ├── tech-spec.md              ✅ Já existe
│   │   ├── development-roadmap.md    ✅ Já existe
│   │   └── fase-00-preparacao-ambiente.md  ✅ Este documento
│   └── analysis/
│       └── mvp-requirements.md       ✅ Já existe
├── src/                               ⏳ Criar na Fase 1
├── prisma/                            ⏳ Criar na Fase 2
└── public/                            ⏳ Criar na Fase 1
```

---

## 0.4 Configuração Inicial do Git (Se Necessário)

### Inicializar Repositório (se ainda não existe)

```bash
# Inicializar Git
git init

# Configurar usuário (se ainda não configurado)
git config user.name "Seu Nome"
git config user.email "seu@email.com"

# Criar primeiro commit
git add .
git commit -m "docs: adicionar documentação inicial do projeto"
```

---

## 0.5 Criar .gitignore Básico (Temporário)

**Arquivo:** `.gitignore`

```
# Node
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment
.env
.env.local
.env*.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Temporary
*.tmp
*.temp
```

**Nota:** Este `.gitignore` será expandido na Fase 12.

---

## 0.6 Verificar Conexão com Internet

### Testar Acesso aos Registros npm

```bash
# Testar conexão com npm registry
npm ping

# Verificar se pode baixar pacotes
npm view next version
```

---

## Checklist de Conclusão

### Ferramentas
- [ ] Node.js 18+ instalado e verificado
- [ ] npm 9+ instalado e verificado
- [ ] VS Code instalado
- [ ] Extensões obrigatórias instaladas
- [ ] Git instalado e configurado

### Ambiente
- [ ] Pasta do projeto criada/verificada
- [ ] Estrutura de documentação existe
- [ ] Conexão com npm registry funcionando
- [ ] .gitignore básico criado

### Pronto para Próxima Fase
- [ ] Todas as verificações passaram
- [ ] Ambiente pronto para criar projeto Next.js

---

## Troubleshooting

### Problema: Node.js versão antiga

```bash
# Instalar nvm (Node Version Manager)
# Windows: baixar de https://github.com/coreybutler/nvm-windows
# Mac/Linux: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Instalar Node.js 20 LTS
nvm install 20
nvm use 20
```

### Problema: npm lento

```bash
# Configurar registry mais rápido (opcional)
npm config set registry https://registry.npmjs.org/

# Limpar cache do npm
npm cache clean --force
```

### Problema: Permissões no Windows

```bash
# Executar PowerShell como Administrador
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

---

## Próxima Fase

➡️ **Fase 1: Setup do Projeto**
- Criar projeto Next.js 14
- Instalar dependências
- Configurar Tailwind CSS e Shadcn/ui

**Arquivo:** `docs/design/fase-01-setup-projeto.md`

---

**Preparado por:** Winston (Architect) 🏗️  
**Data:** 25/12/2025  
**Status:** ✅ Pronto para Execução

