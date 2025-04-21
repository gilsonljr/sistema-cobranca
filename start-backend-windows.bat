@echo off
echo ===================================================
echo      INICIANDO BACKEND WOLF SISTEMA
echo ===================================================
echo.

echo Navegando para a pasta backend...
cd backend

echo.
echo Verificando se o Python esta instalado...
python --version
if %ERRORLEVEL% neq 0 (
    echo ERRO: Python nao encontrado!
    echo.
    echo Por favor, instale o Python antes de continuar.
    echo Voce pode baixa-lo em: https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

echo.
echo Instalando dependencias...
pip install -r requirements.txt

echo.
echo Configurando variaveis de ambiente...
set POSTGRES_SERVER=localhost
set POSTGRES_USER=postgres
set POSTGRES_PASSWORD=postgres
set POSTGRES_DB=billing_system
set SECRET_KEY=your-secret-key-here-change-in-production
set WEBHOOK_SECRET=your-webhook-secret-change-in-production
set CORS_ORIGINS=["http://localhost:3001", "http://localhost:80"]
set ENVIRONMENT=development

echo.
echo Iniciando o servidor de backend...
echo.
echo O servidor estara disponivel em: http://localhost:8000
echo A documentacao da API estara disponivel em: http://localhost:8000/docs
echo.
echo Aguarde enquanto o servidor inicia...
echo.
echo Para encerrar o servidor, pressione Ctrl+C.
echo.

python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

echo.
echo O servidor foi encerrado.
echo.
pause
