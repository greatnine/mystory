# build-and-show.ps1
# 1. Scan dist/stories/ and generate stories-data.js
# 2. Open dist/index.html in the default browser
# --------------------------------------------------
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host ""
Write-Host "========================================"
Write-Host "  Build : generate stories-data.js"
Write-Host "  Show  : open dist/index.html"
Write-Host "========================================"
Write-Host ""

# ---- 1. Check Python ----
$pythonOk = $false
try {
    $py = Get-Command python -ErrorAction SilentlyContinue
    if ($py) { $pythonOk = $true }
} catch {
    $pythonOk = $false
}
if (-not $pythonOk) {
    Write-Host "[ERROR] Python not detected." -ForegroundColor Red
    Write-Host "        Install from: https://www.python.org/downloads/"
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# ---- 2. Check directories ----
$distDir    = Join-Path $scriptDir "dist"
$storiesDir = Join-Path $distDir    "stories"
$manifestPy = Join-Path $scriptDir  "stories-manifest.py"
$indexHtml  = Join-Path $distDir    "index.html"

if (-not (Test-Path $distDir)) {
    Write-Host "[ERROR] dist/ directory not found: $distDir" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
if (-not (Test-Path $storiesDir)) {
    Write-Host "[ERROR] dist/stories/ directory not found: $storiesDir" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
if (-not (Test-Path $manifestPy)) {
    Write-Host "[ERROR] stories-manifest.py not found: $manifestPy" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
if (-not (Test-Path $indexHtml)) {
    Write-Host "[ERROR] dist/index.html not found: $indexHtml" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# ---- 3. Build manifest ----
Write-Host "[1/2] Scanning $storiesDir ..."
& python $manifestPy
$exitCode = $LASTEXITCODE

if ($exitCode -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] stories-manifest.py failed (exit=$exitCode)" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# ---- 4. Open browser ----
Write-Host ""
Write-Host "[2/2] Opening $indexHtml ..."
try {
    Start-Process $indexHtml
} catch {
    try {
        Start-Process -FilePath "explorer.exe" -ArgumentList $indexHtml
    } catch {
        Write-Host "[WARNING] Could not auto-open browser." -ForegroundColor Yellow
        Write-Host "          Please open manually: $indexHtml"
    }
}

Write-Host ""
Write-Host "[OK] Done!" -ForegroundColor Green
Write-Host ""
Start-Sleep -Seconds 1
