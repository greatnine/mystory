@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo ============================================
echo   Local server starting...
echo   Browser: http://localhost:8000/index.html
echo   Mobile : http://[YOUR-PC-IP]:8000/index.html
echo   Press Ctrl+C to stop
echo ============================================
echo.

start "" "http://localhost:8000/index.html"

python -m http.server 8000
if errorlevel 1 (
    echo.
    echo [ERROR] Python not detected.
    echo         Please install Python from:
    echo         https://www.python.org/downloads/
    echo.
    pause
)
