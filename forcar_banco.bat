@echo off
echo ========================================================
echo   Forcando a atualizacao do banco do Supabase...
echo ========================================================
echo.
cd backend
echo Enviando nova coluna exigindo confirmacao...
call npx prisma db push --accept-data-loss
echo.
echo ========================================================
echo   FEITO! PODE FECHAR! (Reinicie seu ligar_sistema.bat)
echo ========================================================
pause
