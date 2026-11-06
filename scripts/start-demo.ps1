param([switch]$Build, [switch]$NoBrowser, [int]$ApiPort = 8000)
$ErrorActionPreference = 'Stop'
$workspacePath = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$runtimePath = Join-Path $workspacePath '.runtime'
$frontendPath = Join-Path $workspacePath 'frontend'
# O build embute a URL da API: porta diferente de 8000 exige recompilar.
if ($ApiPort -ne 8000) { $Build = $true; $env:VITE_API_URL = "http://127.0.0.1:$ApiPort" }
$pythonPath = Join-Path $workspacePath '.venv/Scripts/python.exe'
if (-not (Test-Path -LiteralPath $pythonPath)) { throw 'Execute ./scripts/setup-demo.ps1 primeiro.' }
New-Item -ItemType Directory -Path $runtimePath -Force | Out-Null
if ($Build -or -not (Test-Path -LiteralPath (Join-Path $frontendPath 'dist/index.html'))) {
    Push-Location $frontendPath
    try {
        npm run build
        if ($LASTEXITCODE -ne 0) { throw 'Falha no build. Servicos nao alterados.' }
    } finally { Pop-Location }
}
if (-not (Get-NetTCPConnection -LocalPort $ApiPort -State Listen -ErrorAction SilentlyContinue)) {
    if (-not (Test-Path -LiteralPath (Join-Path $workspacePath 'backend/.env'))) {
        $env:DEMO_MODE = 'true'
        $env:JWT_SECRET = & $pythonPath -c 'import secrets; print(secrets.token_urlsafe(48))'
    }
    $apiProcess = Start-Process -FilePath $pythonPath -ArgumentList '-m','uvicorn','app.main:app','--host','127.0.0.1','--port',"$ApiPort" -WorkingDirectory (Join-Path $workspacePath 'backend') -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $runtimePath 'api.stdout.log') -RedirectStandardError (Join-Path $runtimePath 'api.stderr.log')
    Write-Output ('API iniciada, processo ' + $apiProcess.Id)
}
if (-not (Get-NetTCPConnection -LocalPort 5174 -State Listen -ErrorAction SilentlyContinue)) {
    $vitePath = Join-Path $frontendPath 'node_modules/vite/bin/vite.js'
    if (-not (Test-Path -LiteralPath $vitePath)) { throw 'Dependencias ausentes. Execute ./scripts/setup-demo.ps1.' }
    $frontendProcess = Start-Process -FilePath (Get-Command node).Source -ArgumentList ('"' + $vitePath + '"'),'preview','--host','127.0.0.1','--port','5174','--strictPort' -WorkingDirectory $frontendPath -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $runtimePath 'frontend.stdout.log') -RedirectStandardError (Join-Path $runtimePath 'frontend.stderr.log')
    Write-Output ('Interface iniciada, processo ' + $frontendProcess.Id)
}
$ready = $false
for ($attempt = 0; $attempt -lt 20; $attempt++) {
    try {
        $health = Invoke-RestMethod -Uri "http://127.0.0.1:$ApiPort/api/health" -TimeoutSec 2
        $page = Invoke-WebRequest -Uri 'http://127.0.0.1:5174' -UseBasicParsing -TimeoutSec 2
        if ($health.status -eq 'ok' -and $page.StatusCode -eq 200) { $ready = $true; break }
    } catch { Start-Sleep -Milliseconds 300 }
}
if (-not $ready) { throw 'Servicos ainda nao responderam. Consulte os logs em .runtime/.' }
Write-Output 'Pendi: http://127.0.0.1:5174'
Write-Output "API: http://127.0.0.1:$ApiPort/docs"
if (-not $NoBrowser) { Start-Process 'http://127.0.0.1:5174' }
