@echo off
echo ===================================================
echo      INICIANDO FRONTEND WOLF SISTEMA
echo ===================================================
echo.

echo Navegando para a pasta frontend...
cd frontend

echo.
echo Configurando variaveis de ambiente...
set PORT=3001
set REACT_APP_API_URL=http://localhost:8000
set REACT_APP_MOCK_API=true

echo.
echo Iniciando o servidor de desenvolvimento...
echo.
echo O servidor estara disponivel em: http://localhost:3001
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
