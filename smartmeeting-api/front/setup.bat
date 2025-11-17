@echo off
REM Script de setup automatizado para SmartMeeting Dashboard
REM Execute com: setup.bat

echo ========================================
echo SmartMeeting Dashboard - Setup
echo ========================================
echo.

REM Verificar Node.js
echo Verificando Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Node.js nao encontrado!
    echo Por favor, instale Node.js 16+ primeiro.
    echo Download: https://nodejs.org/
    pause
    exit /b 1
)

node -v
echo Node.js encontrado!
echo.

REM Verificar npm
echo Verificando npm...
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] npm nao encontrado!
    pause
    exit /b 1
)

npm -v
echo npm encontrado!
echo.

REM Instalar dependencias
echo Instalando dependencias...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao instalar dependencias
    pause
    exit /b 1
)

echo Dependencias instaladas com sucesso!
echo.

REM Criar arquivo .env
if not exist .env (
    echo Criando arquivo .env...
    copy .env.example .env
    echo Arquivo .env criado!
    echo IMPORTANTE: Configure a URL da API no arquivo .env
) else (
    echo Arquivo .env ja existe
)
echo.

echo ========================================
echo Setup concluido com sucesso!
echo ========================================
echo.
echo Proximos passos:
echo.
echo 1. Configure a URL da API no arquivo .env
echo    VITE_API_BASE_URL=http://localhost:8080/api
echo.
echo 2. Inicie o servidor:
echo    npm run dev
echo.
echo 3. Acesse: http://localhost:3000
echo.
echo ========================================
echo.
pause
