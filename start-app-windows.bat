@echo off
echo ===================================================
echo      INICIANDO SISTEMA DE COBRANCA
echo ===================================================
echo.

echo Este script vai iniciar o backend e o frontend em janelas separadas.
echo.
echo Pressione qualquer tecla para continuar ou Ctrl+C para cancelar...
pause > nul

echo.
echo Iniciando o backend...
start cmd /k "start-backend-windows.bat"

echo.
echo Aguardando 10 segundos para o backend iniciar...
timeout /t 10 /nobreak > nul

echo.
echo Iniciando o frontend...
start cmd /k "start-frontend-windows.bat"

echo.
echo Servidores iniciados em janelas separadas.
echo.
echo Frontend: http://localhost:3001
echo Backend API: http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo.
echo Usuarios padrao:
echo   Admin: admin@sistema.com / admin123
echo   Supervisor: supervisor@sistema.com / supervisor123
echo   Operador: operador@sistema.com / operador123
echo   Vendedor: vendedor@sistema.com / vendedor123
echo.
echo Pressione qualquer tecla para sair...
pause > nul
