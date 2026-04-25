function Join-Chars {
  param([int[]]$Codes)
  return (-join ($Codes | ForEach-Object { [char]$_ }))
}

$worklogDir = Join-Path $PSScriptRoot "..\docs\worklogs"
$summaryFile = Join-Path $PSScriptRoot "..\docs\context-summary.md"

if (-not (Test-Path $worklogDir) -or -not (Test-Path $summaryFile)) {
  Write-Error "Required files are missing."
  exit 1
}

$hDone = "## " + (Join-Chars @(0x5DF2,0x5B8C,0x6210))
$hDecisions = "## " + (Join-Chars @(0x51B3,0x7B56))
$hNext = "## " + (Join-Chars @(0x4E0B,0x4E00,0x6B65))

$lRecent = "## " + (Join-Chars @(0x6700,0x8FD1,0x5DE5,0x4F5C,0x65E5,0x5FD7,0x6458,0x8981))
$lDone = (Join-Chars @(0x5DF2,0x5B8C,0x6210,0xFF1A))
$lDecisions = (Join-Chars @(0x51B3,0x7B56,0xFF1A))
$lNext = (Join-Chars @(0x4E0B,0x4E00,0x6B65,0xFF1A))

$recentLogs = Get-ChildItem $worklogDir -Filter "*.md" |
  Where-Object { $_.Name -ne "README.md" } |
  Sort-Object Name -Descending |
  Select-Object -First 7

$lines = @()
$lines += $lRecent
$lines += ""

foreach ($log in $recentLogs) {
  $content = Get-Content $log.FullName -Raw
  $done = [regex]::Match($content, [regex]::Escape($hDone) + '\s+(?<body>.*?)(?=\s+## |\s*$)', 'Singleline').Groups['body'].Value.Trim()
  $decisions = [regex]::Match($content, [regex]::Escape($hDecisions) + '\s+(?<body>.*?)(?=\s+## |\s*$)', 'Singleline').Groups['body'].Value.Trim()
  $next = [regex]::Match($content, [regex]::Escape($hNext) + '\s+(?<body>.*?)(?=\s+## |\s*$)', 'Singleline').Groups['body'].Value.Trim()

  $lines += "### $($log.BaseName)"
  $lines += ""

  if ($done) {
    $lines += $lDone
    $lines += $done -split "`r?`n"
    $lines += ""
  }

  if ($decisions) {
    $lines += $lDecisions
    $lines += $decisions -split "`r?`n"
    $lines += ""
  }

  if ($next) {
    $lines += $lNext
    $lines += $next -split "`r?`n"
    $lines += ""
  }
}

$generatedBlock = @(
  "<!-- GENERATED:RECENT-WORKLOGS:START -->",
  ($lines -join "`r`n"),
  "<!-- GENERATED:RECENT-WORKLOGS:END -->"
) -join "`r`n"

$summary = Get-Content $summaryFile -Raw

if ($summary -match '<!-- GENERATED:RECENT-WORKLOGS:START -->(.|\r|\n)*<!-- GENERATED:RECENT-WORKLOGS:END -->') {
  $summary = [regex]::Replace(
    $summary,
    '<!-- GENERATED:RECENT-WORKLOGS:START -->(.|\r|\n)*<!-- GENERATED:RECENT-WORKLOGS:END -->',
    [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $generatedBlock }
  )
} else {
  $summary = $summary.TrimEnd() + "`r`n`r`n" + $generatedBlock + "`r`n"
}

Set-Content -Path $summaryFile -Value $summary -Encoding UTF8
Write-Host $summaryFile
