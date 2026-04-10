@echo off
echo.
echo =======================================
echo.   AMARRANDO O PROJETO COM O GITHUB!     
echo =======================================
echo.

git init
git remote add origin https://github.com/pedrohsarcanjoo-wq/giromob.git
git remote set-url origin https://github.com/pedrohsarcanjoo-wq/giromob.git
git branch -M main

echo.
echo Salvando e Empacotando arquivos do projeto...
git add .
git commit -m "Arquitetura Giromob: Dashboard Frontend Premium e Isolamento MultiUsuario Backend"

echo.
echo Enviando codigos diretos para a Web (Repositório Principal)...
git push -u origin main --force

echo.
echo =======================================
echo Sucesso! Leia a mensagem acima. Se aparecer "branch 'main' set up to track", seu codigo esta na nuvem!
echo =======================================
pause
