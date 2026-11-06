param([switch]$WithBrowserTests, [switch]$WithSpeech)
$ErrorActionPreference = 'Stop'
$workspacePath = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
Push-Location $workspacePath
try {
    if (-not (Test-Path -LiteralPath '.venv/Scripts/python.exe')) {
        python -m venv .venv
        if ($LASTEXITCODE -ne 0) { throw 'Falha ao criar ambiente Python.' }
    }
    $requirementsPath = if ($WithBrowserTests) { 'backend/requirements-dev.txt' } else { 'backend/requirements.lock.txt' }
    & .venv/Scripts/python -m pip install -r $requirementsPath
    if ($LASTEXITCODE -ne 0) { throw 'Falha na instalacao Python.' }
    if ($WithSpeech) {
        & .venv/Scripts/python -m pip install -r backend/requirements-speech.txt
        if ($LASTEXITCODE -ne 0) { throw 'Falha ao instalar a transcricao local.' }
        & .venv/Scripts/python scripts/setup_speech.py
        if ($LASTEXITCODE -ne 0) { throw 'Falha ao preparar o modelo de voz.' }
    }
    $backendEnvPath = Join-Path $workspacePath 'backend/.env'
    if (-not (Test-Path -LiteralPath $backendEnvPath)) {
        $demoSecret = & .venv/Scripts/python -c 'import secrets; print(secrets.token_urlsafe(48))'
        $example = [System.IO.File]::ReadAllText((Join-Path $workspacePath 'backend/.env.example'))
        $example = $example.Replace('SUBSTITUA_POR_UM_SEGREDO_ALEATORIO_COM_32_CARACTERES_OU_MAIS', $demoSecret)
        [System.IO.File]::WriteAllText($backendEnvPath, $example, [System.Text.UTF8Encoding]::new($false))
    }
    Push-Location 'frontend'
    try {
        if (-not (Test-Path -LiteralPath '.env.local')) { Copy-Item -LiteralPath '.env.example' -Destination '.env.local' }
        npm ci --registry=https://registry.yarnpkg.com --no-audit --no-fund
        if ($LASTEXITCODE -ne 0) { throw 'Falha na instalacao npm.' }
        npm run build
        if ($LASTEXITCODE -ne 0) { throw 'Falha no build frontend.' }
    } finally { Pop-Location }
    Write-Output 'Demo preparada. Inicie com: ./scripts/start-demo.ps1'
} finally { Pop-Location }
