@echo off
echo ========================================================
echo   Iniciando o Sistema Financeiro Giromob...
echo ========================================================
echo.

echo [1/2] Ligando o Servidor Backend (Porta 3333)...
start cmd /k "title Backend Server && cd backend && npm run dev"

echo [2/2] Ligando a Interface do Site Vite...
start cmd /k "title Frontend Site && npm run dev"

echo.
echo ========================================================
echo   SUCESSO! DUAS JANELAS FORAM ABERTAS.
echo   Por favor, aguarde alguns segundos e acesse:
echo   http://localhost:5173 no seu navegador.
echo ========================================================
pause
