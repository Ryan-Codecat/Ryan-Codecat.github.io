param(
  [string]$Owner = $env:GITHUB_USERNAME,
  [string]$Repo
)

$ErrorActionPreference = "Stop"

if (-not $env:GITHUB_TOKEN) {
  throw "Set GITHUB_TOKEN in this PowerShell session before running this script."
}

$headers = @{
  Authorization = "Bearer $env:GITHUB_TOKEN"
  Accept = "application/vnd.github+json"
  "X-GitHub-Api-Version" = "2022-11-28"
}

if (-not $Owner) {
  $user = Invoke-RestMethod -Uri "https://api.github.com/user" -Headers $headers
  $Owner = $user.login
}

if (-not $Repo) {
  $Repo = "$Owner.github.io"
}

$repoUri = "https://api.github.com/repos/$Owner/$Repo"
$repoExists = $true
try {
  Invoke-RestMethod -Uri $repoUri -Headers $headers | Out-Null
} catch {
  if ($_.Exception.Response.StatusCode.value__ -eq 404) {
    $repoExists = $false
  } else {
    throw
  }
}

if (-not $repoExists) {
  $body = @{
    name = $Repo
    private = $false
    description = "Personal homepage for Ryan You"
    auto_init = $false
  } | ConvertTo-Json
  Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Headers $headers -Method Post -Body $body -ContentType "application/json" | Out-Null
}

$remote = "https://github.com/$Owner/$Repo.git"
if (git remote | Select-String -Quiet "^origin$") {
  git remote set-url origin $remote
} else {
  git remote add origin $remote
}

$askPass = Join-Path $env:TEMP "github-pages-askpass-$PID.ps1"
@'
if ($args[0] -match "Username") {
  "x-access-token"
} else {
  $env:GITHUB_TOKEN
}
'@ | Set-Content -LiteralPath $askPass -Encoding UTF8

try {
  $env:GIT_ASKPASS = $askPass
  $env:GIT_TERMINAL_PROMPT = "0"
  git push -u origin main
} finally {
  Remove-Item -LiteralPath $askPass -Force -ErrorAction SilentlyContinue
  Remove-Item Env:\GIT_ASKPASS -ErrorAction SilentlyContinue
  Remove-Item Env:\GIT_TERMINAL_PROMPT -ErrorAction SilentlyContinue
}

$pagesBody = @{
  source = @{
    branch = "main"
    path = "/"
  }
} | ConvertTo-Json -Depth 4

try {
  Invoke-RestMethod -Uri "https://api.github.com/repos/$Owner/$Repo/pages" -Headers $headers -Method Post -Body $pagesBody -ContentType "application/json" | Out-Null
} catch {
  $statusCode = $_.Exception.Response.StatusCode.value__
  if ($statusCode -eq 409 -or $statusCode -eq 422) {
    Invoke-RestMethod -Uri "https://api.github.com/repos/$Owner/$Repo/pages" -Headers $headers -Method Put -Body $pagesBody -ContentType "application/json" | Out-Null
  } else {
    throw
  }
}

Write-Output "Repository: https://github.com/$Owner/$Repo"
Write-Output "Homepage: https://$Owner.github.io/"
