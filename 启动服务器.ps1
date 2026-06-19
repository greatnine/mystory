# ============================================================
#  Start local HTTP server + open browser automatically
#  Usage: Right-click - Run with PowerShell  OR  ./start-server.ps1
# ============================================================

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

$Port = 8000
$Url  = "http://localhost:$Port/index.html"

# --- Check Python ---
try {
    $pythonExe = Get-Command python -ErrorAction Stop
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "  Python found: $($pythonExe.Source)" -ForegroundColor Gray
    Write-Host "  Home URL  : $Url" -ForegroundColor Green
    Write-Host "  Mobile    : http://[YOUR-PC-IP]:$Port/index.html" -ForegroundColor Yellow
    Write-Host "  Press Enter to stop the server" -ForegroundColor Gray
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host ""
}
catch {
    Write-Host ""
    Write-Host "[ERROR] Python not detected." -ForegroundColor Red
    Write-Host "Install from: https://www.python.org/downloads/" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# --- Start server in background ---
$serverProcess = Start-Process `
    -FilePath "python" `
    -ArgumentList "-m", "http.server", $Port `
    -NoNewWindow `
    -PassThru `
    -WorkingDirectory $ScriptDir

Start-Sleep -Seconds 1.5

if ($serverProcess.HasExited) {
    Write-Host ""
    Write-Host "[ERROR] Failed to start server. Port $Port may be in use." -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# --- Open browser ---
try {
    Start-Process $Url
    Write-Host "[OK] Browser opened: $Url" -ForegroundColor Green
}
catch {
    Write-Host "[INFO] Please open manually: $Url" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Server running... Press Enter to stop." -ForegroundColor Cyan
Read-Host

# --- Stop server ---
try {
    Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
    Write-Host ""
    Write-Host "[OK] Server stopped." -ForegroundColor Green
}
catch {
    Write-Host ""
    Write-Host "[WARN] Please check for remaining python processes." -ForegroundColor Yellow
}

Start-Sleep -Seconds 1
