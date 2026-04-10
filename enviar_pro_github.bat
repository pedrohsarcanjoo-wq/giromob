@echo off
echo =======================================
echo.   ENVIANDO NOVO FIX DO NETLIFY...         
echo =======================================

git add .
git commit -m "Netlify Fix: Injetando node_env development no Toml para baixar Vite corretamente"
git push -u origin main --force

echo.
echo Processo finalizado!
pause
