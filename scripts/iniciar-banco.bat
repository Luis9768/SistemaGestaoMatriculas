@echo off
echo ========================================================
echo   Iniciando PostgreSQL 16 - Sistema Gestao de Matriculas
echo ========================================================
echo.
docker compose up -d postgres
if %errorlevel% neq 0 (
    echo.
    echo [AVISO] Nao foi possivel iniciar o container Docker.
    echo Verifique se o Docker Desktop esta aberto e em execucao no Windows.
    echo.
) else (
    echo.
    echo [SUCESSO] Container PostgreSQL ativo na porta 5432!
    echo   Banco:   gestao_matriculas
    echo   Usuario: matriculas_user
    echo   Senha:   matriculas_pass
    echo.
)
pause
