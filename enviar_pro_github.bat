@echo off
echo =======================================
echo.   ENVIANDO FIX DO NETLIFY...         
echo =======================================

git add .
git commit -m "Netlify: Removendo PNPM config e forcando Vite nativo"
git push -u origin main --force

echo.
echo Processo finalizado! O codigo subiu.
pause
