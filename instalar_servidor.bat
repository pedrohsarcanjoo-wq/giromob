@echo off
echo ========================================================
echo   Instalando dependencias e configurando o Supabase...
echo ========================================================
echo.

cd backend
echo [1/3] Instalando modulos do Node...
call npm install

echo.
echo [2/3] Gerando tipos do Prisma...
call npx prisma generate

echo.
echo [3/3] Enviando estrutura pro Supabase...
call npx prisma db push

echo.
echo ========================================================
echo   TUDO PRONTO! SEU BANCO DE DADOS ESTA CONFIGURADO.
echo   Pode fechar essa janela.
echo ========================================================
pause
