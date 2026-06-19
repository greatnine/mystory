@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo ========================================
echo   Build : generate stories-data.js
echo   Show  : open dist\index.html
echo ========================================
echo.

where python >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not detected.
    echo         Install from: https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

if not exist "dist\stories\" (
    echo [ERROR] dist\stories\ directory not found.
    pause
    exit /b 1
)

if not exist "stories-manifest.py" (
    echo [ERROR] stories-manifest.py not found.
    pause
    exit /b 1
)

if not exist "dist\index.html" (
    echo [ERROR] dist\index.html not found.
    pause
    exit /b 1
)

echo [1/2] Scanning dist\stories\ ...
python "%~dp0stories-manifest.py"
if errorlevel 1 (
    echo.
    echo [ERROR] Failed to generate stories-data.js.
    pause
    exit /b 1
)

echo.
echo [2/2] Opening dist\index.html ...
start "" "%~dp0dist\index.html"

echo.
echo [OK] Done!
echo.
timeout /t 1 >nul
