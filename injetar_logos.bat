@echo off
echo =======================================
echo.   INJETANDO LOGOs NO SISTEMA...         
echo =======================================

echo Copiando imagens resgatadas pelo Antigravity...

copy "C:\Users\p3dri\.gemini\antigravity\brain\e89aaa6b-8ee4-4e8a-8d6a-71cb147a2e0b\media__1775841756871.png" "public\logo-escura.png"
copy "C:\Users\p3dri\.gemini\antigravity\brain\e89aaa6b-8ee4-4e8a-8d6a-71cb147a2e0b\media__1775841756876.png" "public\logo-clara.png"

echo.
echo Logos aplicadas com sucesso na pasta public!
echo Abra seu sistema e teste. Se as cores do claro e escuro estiverem invertidas, 
echo eh so trocar o nome dos arquivos logo-clara e logo-escura la dentro da pasta public!
echo =======================================
pause
