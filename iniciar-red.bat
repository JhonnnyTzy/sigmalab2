@echo off
chcp 65001 >nul
echo ============================================
echo  SIGMALAB — Inicio en red local
echo ============================================
echo.

REM Obtener IP local
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP: =%

echo Tu IP local: %IP%
echo.
echo Comparte esta URL con tu compañera:
echo   http://%IP%:5173
echo.
echo ============================================
echo.

start "Backend SIGMALAB" cmd /c "cd /d %~dp0backend && npm run dev"
timeout /t 3 >nul
start "Frontend SIGMALAB" cmd /c "cd /d %~dp0frontend && npm run dev:network"

echo.
echo Servidores iniciados. Cierra esta ventana para detenerlos.
echo.
pause
