@echo off
title WOLF Sistema - Servidor com Navegador
color 0A

echo ===================================================
echo    INICIANDO SERVIDOR WOLF SISTEMA COM NAVEGADOR
echo ===================================================
echo.

REM Navegar para a pasta frontend
echo Navegando para a pasta frontend...
cd frontend

echo.
echo Iniciando o servidor e abrindo o navegador...
echo.
echo O servidor estara disponivel em: http://localhost:3000
echo.
echo Para encerrar o servidor, pressione Ctrl+C e depois S para confirmar.
echo.

REM Iniciar o navegador após 5 segundos
start "" cmd /c "timeout /t 5 /nobreak && start http://localhost:3000"

REM Iniciar o servidor
npm start

echo.
echo O servidor foi encerrado.
echo.
pause
