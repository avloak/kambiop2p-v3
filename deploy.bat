@echo off
REM Script de deployment para Windows
REM KambioP2P v3 - Deployment Automatizado

echo =========================================
echo KambioP2P v3 - Deployment Automatizado
echo =========================================
echo.

REM Verificar prerequisitos
echo Verificando prerequisitos...

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js no esta instalado
    exit /b 1
)

where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: npm no esta instalado
    exit /b 1
)

where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Python no esta instalado
    exit /b 1
)

where serverless >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Serverless Framework no esta instalado
    echo Ejecuta: npm install -g serverless
    exit /b 1
)

where aws >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: AWS CLI no esta instalado
    exit /b 1
)

echo [OK] Todos los prerequisitos estan instalados
echo.

REM Obtener stage (dev por defecto)
set STAGE=%1
if "%STAGE%"=="" set STAGE=dev

echo Desplegando en stage: %STAGE%
echo.

REM Deploy Backend Microservices
echo =========================================
echo Desplegando Microservicios del Backend
echo =========================================
echo.

REM Microservicio de Usuarios
echo 1. Desplegando Microservicio de Usuarios...
cd backend\usuarios
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error instalando dependencias de usuarios
    exit /b 1
)
call serverless deploy --stage %STAGE%
if %ERRORLEVEL% NEQ 0 (
    echo Error desplegando microservicio de usuarios
    exit /b 1
)
echo [OK] Microservicio de Usuarios desplegado
cd ..\..
echo.

REM Microservicio de Mercado
echo 2. Desplegando Microservicio de Mercado...
cd backend\mercado
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error instalando dependencias de mercado
    exit /b 1
)
call serverless deploy --stage %STAGE%
if %ERRORLEVEL% NEQ 0 (
    echo Error desplegando microservicio de mercado
    exit /b 1
)
echo [OK] Microservicio de Mercado desplegado
cd ..\..
echo.

REM Microservicio de Transacciones
echo 3. Desplegando Microservicio de Transacciones...
cd backend\transacciones
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error instalando dependencias de transacciones
    exit /b 1
)
call serverless deploy --stage %STAGE%
if %ERRORLEVEL% NEQ 0 (
    echo Error desplegando microservicio de transacciones
    exit /b 1
)
echo [OK] Microservicio de Transacciones desplegado
cd ..\..
echo.

REM Microservicio de Disputas
echo 4. Desplegando Microservicio de Disputas...
cd backend\disputas
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error instalando dependencias de disputas
    exit /b 1
)
call serverless deploy --stage %STAGE%
if %ERRORLEVEL% NEQ 0 (
    echo Error desplegando microservicio de disputas
    exit /b 1
)
echo [OK] Microservicio de Disputas desplegado
cd ..\..
echo.

echo [OK] Todos los microservicios del backend desplegados exitosamente
echo.

REM Deploy Frontend
echo =========================================
echo Desplegando Frontend
echo =========================================
echo.

cd frontend

REM Instalar dependencias
echo Instalando dependencias del frontend...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error instalando dependencias del frontend
    exit /b 1
)
echo [OK] Dependencias instaladas

REM Build
echo Construyendo aplicacion Next.js...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo Error construyendo frontend
    exit /b 1
)
echo [OK] Build completado

REM Deploy a S3
echo Desplegando a S3...
call npm install --save-dev serverless serverless-s3-sync
call serverless deploy --stage %STAGE%
if %ERRORLEVEL% NEQ 0 (
    echo Error desplegando frontend
    exit /b 1
)
echo [OK] Frontend desplegado a S3

cd ..
echo.

REM Resumen
echo =========================================
echo Deployment Completado
echo =========================================
echo.
echo [OK] Deployment completado exitosamente!
echo.
echo Proximos pasos:
echo 1. Revisa la salida anterior para obtener las URLs de los servicios
echo 2. Abre el sitio web en tu navegador
echo 3. Registra un usuario de prueba
echo 4. Explora el marketplace
echo.
echo NOTA: Este es un entorno de desarrollo.
echo Para produccion, implementa las mejoras de seguridad recomendadas.
echo.

pause
