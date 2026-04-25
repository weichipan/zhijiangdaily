$workspace = Split-Path -Parent $PSScriptRoot
$gitCmd = Join-Path $workspace "tools\git\cmd"
$gitBin = Join-Path $workspace "tools\git\bin"
$gitExe = Join-Path $gitCmd "git.exe"

if (-not (Test-Path $gitExe)) {
  Write-Error "Workspace git not found: $gitExe"
  exit 1
}

$prefixes = @($gitCmd, $gitBin)
$pathParts = $env:PATH -split ';' | Where-Object { $_ }

$env:PATH = (($prefixes + $pathParts) | Select-Object -Unique) -join ';'
$env:GIT = $gitExe

Write-Host "Workspace git enabled:" $gitExe
& $gitExe --version
