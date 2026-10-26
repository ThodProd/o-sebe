param([Parameter(Mandatory=$true)][string]$HubRoot,[string]$OutputDirectory='artifacts/hub-release')
$ErrorActionPreference='Stop'
$HubRoot=[IO.Path]::GetFullPath($HubRoot)
Push-Location (Split-Path $PSScriptRoot -Parent)
try {
    $stage=Join-Path (Get-Location).Path ('artifacts/hub-'+[guid]::NewGuid().ToString('N'))
    New-Item -ItemType Directory -Path $stage -Force | Out-Null
    npm ci
    if ($LASTEXITCODE) { throw "Install failed" }
    npx tsc --noEmit
    if ($LASTEXITCODE) { throw "Type check failed" }
    npm run build
    if ($LASTEXITCODE) { throw "Build failed" }
    node node_modules/electron-builder/cli.js --win --dir --config hub/electron-builder.json
    if ($LASTEXITCODE) { throw "Electron build failed" }
    Copy-Item artifacts/build/win-unpacked (Join-Path $stage "app") -Recurse
    Copy-Item hub/manifest.json (Join-Path $stage 'manifest.json')
    & (Join-Path $HubRoot 'scripts/package-module.ps1') -PackageDirectory $stage -Repository 'ThodProd/o-sebe' -OutputDirectory $OutputDirectory -Notes 'Самостоятельное окно, резюме и черновики в ThodHUB. Electron 45, обновлены зависимости.'
} finally { Pop-Location }
