# Script para regenerar Prisma Client
# Resolve o problema de arquivo travado pelo servidor dev

Write-Host "🔄 Regenerando Prisma Client..." -ForegroundColor Cyan
Write-Host ""

# 1. Encontrar e parar processos Node que estão usando o arquivo
Write-Host "🔍 Procurando processos Node.js..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    Write-Host "⚠️  Encontrados $($nodeProcesses.Count) processo(s) Node.js rodando" -ForegroundColor Yellow
    Write-Host "🛑 Parando processos..." -ForegroundColor Yellow
    
    foreach ($proc in $nodeProcesses) {
        try {
            Stop-Process -Id $proc.Id -Force
            Write-Host "   ✅ Processo $($proc.Id) parado" -ForegroundColor Green
        } catch {
            Write-Host "   ❌ Erro ao parar processo $($proc.Id): $_" -ForegroundColor Red
        }
    }
    
    # Aguardar processos finalizarem
    Start-Sleep -Seconds 2
} else {
    Write-Host "✅ Nenhum processo Node.js rodando" -ForegroundColor Green
}

Write-Host ""

# 2. Limpar pasta .prisma/client (opcional, mas ajuda)
Write-Host "🗑️  Limpando cache do Prisma..." -ForegroundColor Yellow
$prismaClientPath = "node_modules\.prisma\client"

if (Test-Path $prismaClientPath) {
    try {
        Remove-Item -Path $prismaClientPath -Recurse -Force -ErrorAction Stop
        Write-Host "✅ Cache limpo com sucesso" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Não foi possível limpar cache (não é crítico)" -ForegroundColor Yellow
    }
} else {
    Write-Host "ℹ️  Cache não existe (primeira vez)" -ForegroundColor Cyan
}

Write-Host ""

# 3. Gerar Prisma Client
Write-Host "⚙️  Gerando Prisma Client..." -ForegroundColor Cyan
try {
    npx prisma generate
    Write-Host ""
    Write-Host "✅ Prisma Client gerado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "❌ Erro ao gerar Prisma Client: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 4. Executar seed
Write-Host "🌱 Executando seed..." -ForegroundColor Cyan
try {
    npm run db:seed
    Write-Host ""
    Write-Host "✅ Seed executado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "❌ Erro ao executar seed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Processo concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Próximos passos:" -ForegroundColor Cyan
Write-Host "   1. Reiniciar servidor dev: npm run dev" -ForegroundColor White
Write-Host "   2. Verificar dados no Prisma Studio: npm run db:studio" -ForegroundColor White
Write-Host ""



