@echo off
chcp 65001 >nul
echo ============================================
echo  SIGMALAB — Inicio en red
echo ============================================
echo.
echo 1) RED LOCAL (misma WiFi):
echo    Comparte: http://IP:5173
echo.
echo 2) REMOTO (ngrok — un solo tunel):
echo    a) Descarga ngrok de https://ngrok.com
echo    b) En otra terminal:  ngrok http 5173
echo    c) Comparte la URL https://XXXX.ngrok-free.app
echo.
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
echo URL local: http://%IP%:5173
echo.

start "Backend SIGMALAB" cmd /c "cd /d %~dp0backend && npm run dev"
timeout /t 3 >nul
start "Frontend SIGMALAB" cmd /c "cd /d %~dp0frontend && npm run dev:network"

echo.
echo Servidores iniciados. Cierra esta ventana para detenerlos.
echo.
pause
