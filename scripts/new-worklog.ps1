function Join-Chars {
  param([int[]]$Codes)
  return (-join ($Codes | ForEach-Object { [char]$_ }))
}

$date = Get-Date -Format "yyyy-MM-dd"
$targetDir = Join-Path $PSScriptRoot "..\docs\worklogs"
$targetFile = Join-Path $targetDir "$date.md"

$done = Join-Chars @(0x5DF2,0x5B8C,0x6210)
$scope = Join-Chars @(0x5F71,0x54CD,0x8303,0x56F4)
$decisions = Join-Chars @(0x51B3,0x7B56)
$risks = Join-Chars @(0x98CE,0x9669)
$next = Join-Chars @(0x4E0B,0x4E00,0x6B65)

if (-not (Test-Path $targetDir)) {
  New-Item -ItemType Directory -Path $targetDir | Out-Null
}

if (-not (Test-Path $targetFile)) {
  $template = @(
    "# $date",
    "",
    "## $done",
    "",
    "- ",
    "",
    "## $scope",
    "",
    "- ",
    "",
    "## $decisions",
    "",
    "- ",
    "",
    "## $risks",
    "",
    "- ",
    "",
    "## $next",
    "",
    "- "
  ) -join "`r`n"

  Set-Content -Path $targetFile -Value $template -Encoding UTF8
}

Write-Host $targetFile
