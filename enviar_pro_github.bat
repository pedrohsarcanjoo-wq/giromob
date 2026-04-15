@echo off
chcp 65001 > nul
echo.
echo =========================================
echo        GIROMOB - ENVIAR PARA GITHUB
echo =========================================
echo.

:: Verifica se ja tem repositorio git
if not exist ".git" (
  echo Repositorio Git nao encontrado. Inicializando...
  git init
  git branch -M main
  git config user.name "GiroMob Admin"
  git config user.email "admin@giromob.com"
  git remote add origin https://github.com/pedrohsarcanjoo-wq/giromob.git
  echo Repositorio configurado!
  echo.
) else (
  git config user.name "GiroMob Admin"
  git config user.email "admin@giromob.com"
  git remote set-url origin https://github.com/pedrohsarcanjoo-wq/giromob.git
)

echo Status atual dos arquivos:
git status
echo.

set /p mensagem="Digite a mensagem do commit: "

if "%mensagem%"=="" (
  set mensagem=Atualizacao do sistema
)

echo.
echo [1/4] Adicionando arquivos...
git add .

echo [2/4] Fazendo commit: %mensagem%
git commit -m "%mensagem%"

echo [3/4] Sincronizando de forma segura (Sem --force)...
git pull origin main --allow-unrelated-histories --no-edit -s recursive -X ours

echo [4/4] Enviando para o GitHub...
git push -u origin main

echo.
if %errorlevel% == 0 (
  echo =========================================
  echo  Sucesso! Atualizacoes enviadas.
  echo  github.com/pedrohsarcanjoo-wq/giromob
  echo =========================================
) else (
  echo =========================================
  echo  ERRO no envio. Veja a mensagem acima.
  echo =========================================
)
echo.
pause
