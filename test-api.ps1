param(
  [string]$BaseUrl = "http://localhost:4000/api",
  [string]$Email = "admin@test.com",
  [string]$Password = "123456"
)

Write-Host "=== LOGIN ===" -ForegroundColor Cyan
$login = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method Post -ContentType "application/json" -Body "{`"identifier`":`"$Email`",`"password`":`"$Password`"}"
$token = $login.token
Write-Host "Token: $($token.Substring(0,20))..." -ForegroundColor Green

$headers = @{ Authorization = "Bearer $token" }
$contentType = "application/json"

Write-Host "`n=== HEALTH ===" -ForegroundColor Cyan
Invoke-RestMethod -Uri "$BaseUrl/health" | ConvertTo-Json

Write-Host "`n=== PROFILE ===" -ForegroundColor Cyan
Invoke-RestMethod -Uri "$BaseUrl/auth/profile" -Headers $headers | ConvertTo-Json

Write-Host "`n=== LABORATORIOS ===" -ForegroundColor Cyan
Invoke-RestMethod -Uri "$BaseUrl/laboratorios/" -Headers $headers | ConvertTo-Json

Write-Host "`n=== EQUIPOS ===" -ForegroundColor Cyan
Invoke-RestMethod -Uri "$BaseUrl/equipos/" -Headers $headers | ConvertTo-Json

Write-Host "`n=== INCIDENCIAS ===" -ForegroundColor Cyan
Invoke-RestMethod -Uri "$BaseUrl/incidencias/" -Headers $headers | ConvertTo-Json

Write-Host "`n=== ASIGNACIONES ===" -ForegroundColor Cyan
Invoke-RestMethod -Uri "$BaseUrl/asignaciones/" -Headers $headers | ConvertTo-Json

Write-Host "`n=== REPORTES ===" -ForegroundColor Cyan
Invoke-RestMethod -Uri "$BaseUrl/reportes/" -Headers $headers | ConvertTo-Json

Write-Host "`n=== LOGS ===" -ForegroundColor Cyan
Invoke-RestMethod -Uri "$BaseUrl/logs/" -Headers $headers | ConvertTo-Json

Write-Host "`n=== MANTENIMIENTOS ===" -ForegroundColor Cyan
Invoke-RestMethod -Uri "$BaseUrl/mantenimientos/" -Headers $headers | ConvertTo-Json

Write-Host "`n=== INSUMOS ===" -ForegroundColor Cyan
Invoke-RestMethod -Uri "$BaseUrl/insumos/" -Headers $headers | ConvertTo-Json

Write-Host "`n=== INVENTARIO ===" -ForegroundColor Cyan
Invoke-RestMethod -Uri "$BaseUrl/inventario/" -Headers $headers | ConvertTo-Json

Write-Host "`n=== PERIFERICOS ===" -ForegroundColor Cyan
Invoke-RestMethod -Uri "$BaseUrl/perifericos/" -Headers $headers | ConvertTo-Json

Write-Host "`n=== USUARIOS ===" -ForegroundColor Cyan
Invoke-RestMethod -Uri "$BaseUrl/auth/" -Headers $headers | ConvertTo-Json

Write-Host "`nTodos los endpoints respondieron OK!" -ForegroundColor Green
