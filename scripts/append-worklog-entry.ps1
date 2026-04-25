param(
  [Parameter(Mandatory = $true)]
  [ValidateSet("done", "scope", "decisions", "risks", "next")]
  [string]$Section,

  [Parameter(Mandatory = $true)]
  [string]$Text,

  [string]$Date = (Get-Date -Format "yyyy-MM-dd")
)

function Join-Chars {
  param([int[]]$Codes)
  return (-join ($Codes | ForEach-Object { [char]$_ }))
}

$targetDir = Join-Path $PSScriptRoot "..\docs\worklogs"
$targetFile = Join-Path $targetDir "$Date.md"

if (-not (Test-Path $targetFile)) {
  & (Join-Path $PSScriptRoot "new-worklog.ps1") | Out-Null
}

$content = Get-Content $targetFile -Raw

$header = switch ($Section) {
  "done" { "## " + (Join-Chars @(0x5DF2,0x5B8C,0x6210)) }
  "scope" { "## " + (Join-Chars @(0x5F71,0x54CD,0x8303,0x56F4)) }
  "decisions" { "## " + (Join-Chars @(0x51B3,0x7B56)) }
  "risks" { "## " + (Join-Chars @(0x98CE,0x9669)) }
  "next" { "## " + (Join-Chars @(0x4E0B,0x4E00,0x6B65)) }
}

$insertion = "- $Text"

if ($content -match [regex]::Escape($header)) {
  $content = $content -replace ([regex]::Escape($header) + "\r?\n\r?\n"), ('$0' + $insertion + "`r`n")
  Set-Content -Path $targetFile -Value $content -Encoding UTF8
}

Write-Host $targetFile
