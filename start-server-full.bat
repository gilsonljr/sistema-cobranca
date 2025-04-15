@echo off
title WOLF Sistema - Servidor de Desenvolvimento
color 0B

echo ===================================================
echo      INICIANDO SERVIDOR WOLF SISTEMA
echo ===================================================
echo.

REM Verificar se o Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERRO: Node.js nao encontrado!
    echo.
    echo Por favor, instale o Node.js antes de continuar.
    echo Voce pode baixa-lo em: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Node.js encontrado: 
node -v
echo.

REM Navegar para a pasta frontend
echo Navegando para a pasta frontend...
cd frontend

REM Verificar se as dependências estão instaladas
if not exist "node_modules\" (
    echo Dependencias nao encontradas. Instalando...
    echo.
    npm install
    if %ERRORLEVEL% neq 0 (
        echo.
        echo ERRO: Falha ao instalar dependencias!
        echo.
        pause
        exit /b 1
    )
    echo.
    echo Dependencias instaladas com sucesso!
) else (
    echo Dependencias ja instaladas.
)

echo.
echo ===================================================
echo      INICIANDO SERVIDOR DE DESENVOLVIMENTO
echo ===================================================
echo.
echo O servidor estara disponivel em: http://localhost:3000
echo.
echo Aguarde enquanto o servidor inicia...
echo.
echo Para encerrar o servidor, pressione Ctrl+C e depois S para confirmar.
echo.

REM Iniciar o servidor
npm start

echo.
echo O servidor foi encerrado.
echo.
pause
