@echo off
echo ===================================================
echo      INICIANDO SERVIDOR WOLF SISTEMA
echo ===================================================
echo.

echo Navegando para a pasta frontend...
cd frontend

echo.
echo Iniciando o servidor de desenvolvimento...
echo.
echo O servidor estara disponivel em: http://localhost:3000
echo.
echo Aguarde enquanto o servidor inicia...
echo.
echo Para encerrar o servidor, pressione Ctrl+C e depois S para confirmar.
echo.

npm start

echo.
echo O servidor foi encerrado.
echo.
pause
