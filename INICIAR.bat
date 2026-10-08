@echo off
cd /d "%~dp0"
echo Iniciando AsamApp (modo produccion local)...

if not exist backend\.env (
  echo ERROR: falta backend\.env
  echo Copia backend\.env.example, edita AUTH_SECRET y renombralo a .env
  pause
  exit /b 1
)

if not exist frontend\dist\index.html (
  echo Compilando el frontend por primera vez...
  pushd frontend
  call npm run build
  popd
)

start "AsamApp" cmd /k "cd backend && node server.js"
timeout /t 3 /nobreak >nul

echo.
echo AsamApp iniciado correctamente:
echo   App:   http://localhost:3000/
echo   API:   http://localhost:3000/api/health
echo.
echo Para desarrollo con recarga en vivo usá dos terminales:
echo   cd backend  ^&^& npm run dev    (puerto 3000)
echo   cd frontend ^&^& npm run dev    (http://localhost:5173)
echo.
echo Cerrá la ventana "AsamApp" (o usá DETENER.bat) para apagar el servidor.
pause
