# Tests PUT by numeric GTX id: PUT /api/v1/packages/:gtxPkgId
# Requires: backend on PORT (default 4000), DB with at least one package.
param([int]$Port = 4000)

$ErrorActionPreference = "Stop"
$base = "http://127.0.0.1:$Port/api/v1/packages"

Write-Host "GET $base/?limit=1"
$list = Invoke-RestMethod -Uri "$base/?limit=1" -Method Get
if (-not $list.data -or $list.data.Count -lt 1) {
  Write-Error "No packages in DB. Seed or POST a package first."
  exit 1
}

$p = $list.data[0]
$gtx = $p.gtxPkgId
$orig = $p.name
$stamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$testName = "$orig [GTX-PUT test $stamp]"

Write-Host "PUT $base/$gtx  (name -> test label)"
$body = @{ name = $testName } | ConvertTo-Json
$put = Invoke-RestMethod -Uri "$base/$gtx" -Method Put -Body $body -ContentType "application/json; charset=utf-8"

if (-not $put.success) { Write-Error "PUT failed: $($put | ConvertTo-Json)"; exit 1 }
Write-Host "OK: $($put.message)"

Write-Host "GET $base/$gtx (verify name)"
$g = Invoke-RestMethod -Uri "$base/$gtx" -Method Get
if ($g.data.name -ne $testName) {
  Write-Error "Name mismatch. Expected: $testName Got: $($g.data.name)"
  exit 1
}
Write-Host "Verified name in DB: $($g.data.name)"

Write-Host "POST $base/upsert (restore same gtxPkgId, original name)"
$upBody = @{ gtxPkgId = $gtx; name = $orig } | ConvertTo-Json
$up = Invoke-RestMethod -Uri "$base/upsert" -Method Post -Body $upBody -ContentType "application/json; charset=utf-8"
if (-not $up.success) { Write-Error "Upsert failed: $($up | ConvertTo-Json)"; exit 1 }
Write-Host "Upsert OK: $($up.message) - name: $($up.data.name)"

Write-Host "All checks passed."
