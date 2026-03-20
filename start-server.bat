@echo off
REM Запуск локального веб-сервера для тестування PWA
REM Вимоги: Python 3 встановлен

echo.
echo ========================================
echo  Локальний веб-сервер для Ганtt Про PWA
echo ========================================
echo.

REM Перевіримо Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ПОМИЛКА: Python не встановлен або не додан до PATH
    echo.
    echo Завантажте Python з: https://www.python.org/downloads/
    echo .
    pause
    exit /b 1
)

echo ✓ Python знайдений
echo.
echo Запуск сервера на http://localhost:8000
echo Натисніть Ctrl+C для зупинки
echo.

cd /d "%~dp0"

REM Try Python 3
python -m http.server 8000

if %errorlevel% neq 0 (
    REM Try Python 2
    python -m SimpleHTTPServer 8000
)

if %errorlevel% neq 0 (
    echo ПОМИЛКА: Не вдалося запустити сервер
    pause
    exit /b 1
)
