@echo off
echo ========================================================
echo   Instalando Servicos de Seguranca (Login/Cadastro)...
echo ========================================================
echo.

cd backend
echo [1/3] Instalando criptografia (bcrypt) e tokens (jwt)...
call npm install bcryptjs jsonwebtoken
call npm install -D @types/bcryptjs @types/jsonwebtoken

echo.
echo [2/3] Enviando nova coluna de 'Senha' pro Supabase...
call npx prisma generate
call npx prisma db push

echo.
echo ========================================================
echo   PRONTINHO! PODE FECHAR ESTA JANELA E ME AVISAR.
echo ========================================================
pause
