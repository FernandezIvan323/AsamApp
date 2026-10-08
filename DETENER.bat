@echo off
echo Deteniendo AsamApp...
taskkill /f /t /fi "WINDOWTITLE eq AsamApp*" >nul 2>&1
echo Servidor detenido.
timeout /t 2 /nobreak >nul
