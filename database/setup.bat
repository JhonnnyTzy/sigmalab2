@echo off
echo ============================================
echo  SIGMALAB — Configuracion de Base de Datos
echo  Carrera de Informatica - UMSA
echo ============================================
echo.

REM Verificar que PostgreSQL esta instalado
where psql >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] PostgreSQL no encontrado. Instala PostgreSQL primero.
    exit /b 1
)

echo [1/5] Creando base de datos sigmalab...
psql -U postgres -c "CREATE DATABASE sigmalab;" 2>nul
if %ERRORLEVEL% equ 0 (
    echo   Base de datos creada.
) else (
    echo   La base de datos ya existe o hubo un error.
)

echo [2/5] Ejecutando schema SQL...
psql -U postgres -d sigmalab -f sigmalab-umsa.sql
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Fallo la ejecucion del schema.
    exit /b 1
)
echo   Schema creado exitosamente.

echo [3/5] Verificando tablas...
psql -U postgres -d sigmalab -c "\dt"
echo.

echo [4/5] Verificando datos insertados...
psql -U postgres -d sigmalab -c "SELECT 'personas: ' || COUNT(*)::text FROM personas; SELECT 'usuarios: ' || COUNT(*)::text FROM usuarios; SELECT 'equipos: ' || COUNT(*)::text FROM equipos; SELECT 'mantenimientos: ' || COUNT(*)::text FROM mantenimientos; SELECT 'incidencias: ' || COUNT(*)::text FROM incidencias;"
echo.

echo [5/5] Configurando backend...
cd /d "%~dp0..\backend"
copy .env.example .env 2>nul || echo   .env ya existe.
echo.

echo ============================================
echo  SETUP COMPLETADO
echo ============================================
echo.
echo Para iniciar el backend:
echo   cd backend
echo   npm install
echo   npx prisma generate
echo   npm run dev
echo.
echo Para iniciar el frontend:
echo   cd frontend
echo   npm install
echo   npm run dev
echo.
echo Credenciales de prueba:
echo   - Admin: admin@test.com / 123456
echo   - Preventivo: 20250001 / 123456
echo   - Correctivo: 20250003 / 123456
echo   - Docente: jcmamani@umsa.bo / 123456
echo   - Estudiante: 20250005 / 123456
echo.
pause
