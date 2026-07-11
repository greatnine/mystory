<#
.SYNOPSIS
    自动扫描 dist/stories/ 目录，生成 dist/data.js

.DESCRIPTION
    扫描 stories/ 下的子目录，检测：
      - 是否存在 index.html
      - 是否存在 images/cover.*
    并将结果以全局变量形式写入 data.js，
    使 index.html 在 GitHub Pages / http.server / file:// 均可使用。

.PARAMETER DryRun
    仅打印清单，不写入 data.js

.PARAMETER StoriesDir
    故事根目录路径（默认：脚本所在目录/stories）

.PARAMETER OutputJs
    输出的 JS 文件路径（默认：脚本所在目录/data.js）

.EXAMPLE
    .\stories-manifest.ps1
    .\stories-manifest.ps1 -DryRun
#>

[CmdletBinding()]
param(
    [switch]$DryRun,
    [string]$StoriesDir,
    [string]$OutputJs
)

# ===== 基础路径 =====
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
if (-not $StoriesDir) {
    $StoriesDir = Join-Path $ScriptDir 'stories'
}
if (-not $OutputJs) {
    $OutputJs = Join-Path $ScriptDir 'data.js'
}

$StoriesDir = Convert-Path -Path $StoriesDir -ErrorAction SilentlyContinue
$CoverExts = @('webp', 'jpg', 'jpeg', 'png')

# ===== 扫描函数 =====
function Discover-Stories {
    param ([string]$Path)

    if (-not (Test-Path $Path -PathType Container)) {
        Write-Warning "stories/ 目录未找到: $Path"
        return @()
    }

    $results = @()

    Get-ChildItem -Path $Path -Directory | Where-Object { $_.Name -notlike '.*' } | Sort-Object Name | ForEach-Object {
        $story = $_
        $info = @{
            name     = $story.Name
            hasIndex = Test-Path (Join-Path $story.FullName 'index.html') -PathType Leaf
            cover    = $null
        }

        $imagesDir = Join-Path $story.FullName 'images'
        if (Test-Path $imagesDir -PathType Container) {
            foreach ($ext in $CoverExts) {
                $candidate = Join-Path $imagesDir "cover.$ext"
                if (Test-Path $candidate -PathType Leaf) {
                    $info['cover'] = "stories/$($story.Name)/images/cover.$ext"
                    break
                }
            }
        }

        $results += $info
    }

    return $results
}

# ===== 写入 JS =====
function Write-JsManifest {
    param (
        [array]$Stories,
        [string]$Path
    )

    $payload = @{ stories = $Stories }

    # 转 JSON（保留中文）
    $json = $payload | ConvertTo-Json -Depth 5


    $jsContent = @"
// 由 stories-manifest.ps1 自动生成 —— 请不要手动编辑。
// 此文件使 index.html 在任何环境下都能拿到故事目录清单（GitHub Pages / http.server / file://）。
if (typeof window !== "undefined") {
    window.STORIES_MANIFEST = $json;
}
"@

    # 确保目录存在
    $outDir = Split-Path $Path
    if ($outDir -and -not (Test-Path $outDir)) {
        New-Item -ItemType Directory -Path $outDir | Out-Null
    }

    Set-Content -Path $Path -Value $jsContent -Encoding UTF8
}

# ===== 主流程 =====
$stories = Discover-Stories -Path $StoriesDir

$nHasIndex = ($stories | Where-Object { $_.hasIndex }).Count
$nHasCover = ($stories | Where-Object { $_.cover }).Count

Write-Host "[OK] 在 $StoriesDir 下发现 $($stories.Count) 个故事目录"
Write-Host "     - 含 index.html: $nHasIndex"
Write-Host "     - 含封面图:      $nHasCover"
Write-Host ""

foreach ($s in $stories) {
    $flags = @()
    if ($s.hasIndex) {
        $flags += 'index.html'
    } else {
        $flags += '无故事'
    }
    if ($s.cover) {
        $flags += '封面'
    }
    Write-Host "  - $($s.name)    ($($flags -join ', '))"
}

if ($DryRun) {
    Write-Host "`n[DRY RUN] 未写入文件。"
    exit 0
}

Write-JsManifest -Stories $stories -Path $OutputJs
Write-Host "`n[OK] 清单已写入: $OutputJs"

Read-Host "按任意键退出......"