$ErrorActionPreference = "Stop"

$ProjectDir = Split-Path -Parent $PSScriptRoot

Set-Location "$ProjectDir\frontend"
npm ci
npm run build

Set-Location $ProjectDir
python -m pip install -r backend\requirements.txt
python -m PyInstaller --clean --noconfirm packaging\CalenDo.spec

Write-Host "Windows app: $ProjectDir\dist\CalenDo.exe"
