Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Iniciando PostgreSQL 16 - Sistema Gestão de Matrículas" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

try {
    docker compose up -d postgres
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "[SUCESSO] Container PostgreSQL ativo na porta 5432!" -ForegroundColor Green
        Write-Host "  Host:    localhost"
        Write-Host "  Porta:   5432"
        Write-Host "  Banco:   gestao_matriculas"
        Write-Host "  Usuário: matriculas_user"
        Write-Host "  Senha:   matriculas_pass"
    } else {
        Write-Host ""
        Write-Host "[AVISO] Falha ao iniciar container. Verifique se o Docker Desktop está aberto e ativo." -ForegroundColor Yellow
    }
} catch {
    Write-Host "[ERRO] Erro ao executar docker compose: $_" -ForegroundColor Red
}
