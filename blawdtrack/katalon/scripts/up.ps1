<#
.SYNOPSIS
  Levanta el entorno de pruebas de extremo a extremo y lo deja listo para correr Katalon.

.DESCRIPTION
  Construye y levanta MySQL, Mailpit, el backend y el frontend (docker-compose.e2e.yml), espera a que el backend
  responda y ejecuta prepare-data.ps1. Si pasas -Fresh, antes borra la base de pruebas para empezar de cero.

  Requiere Docker Desktop encendido. No toca tu entorno de desarrollo: usa los puertos 5174, 8081, 8025 y 3307.
#>
param(
    [switch]$Fresh,
    [int]$TimeoutSeconds = 240
)

$ErrorActionPreference = 'Stop'
$compose = Join-Path $PSScriptRoot '..\environment\docker-compose.e2e.yml'
$accounts = Get-Content -Raw -Encoding UTF8 -Path (Join-Path $PSScriptRoot '..\environment\test-accounts.json') | ConvertFrom-Json

docker info *> $null
if ($LASTEXITCODE -ne 0) { throw 'Docker no responde. Enciende Docker Desktop y vuelve a intentarlo.' }

if ($Fresh) {
    Write-Host 'Borrando el entorno anterior...'
    & (Join-Path $PSScriptRoot 'down.ps1')
}

# El secreto del JWT se genera en cada arranque y no se guarda en ningun archivo.
$bytes = New-Object 'byte[]' 48
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$env:JWT_SECRET = [Convert]::ToBase64String($bytes)

Write-Host 'Levantando el entorno (la primera vez tarda varios minutos mientras se construyen las imagenes)...'
docker compose -f $compose up -d --build
if ($LASTEXITCODE -ne 0) { throw 'docker compose up fallo.' }

Write-Host 'Esperando a que el backend responda...'
$body = @{ email = $accounts.superUser.email; password = $accounts.superUser.password } | ConvertTo-Json
$deadline = (Get-Date).AddSeconds($TimeoutSeconds)
$ready = $false
while ((Get-Date) -lt $deadline) {
    try {
        $response = Invoke-WebRequest -Uri 'http://localhost:8081/api/v1/auth/login' -Method Post -Body $body `
            -ContentType 'application/json' -UseBasicParsing
        if ($response.StatusCode -eq 200) { $ready = $true; break }
    } catch {
        Start-Sleep -Seconds 3
    }
}
if (-not $ready) { throw "El backend no respondio en $TimeoutSeconds segundos. Revisa: docker logs blawdtrack-e2e-backend" }

& (Join-Path $PSScriptRoot 'prepare-data.ps1')

Write-Host ''
Write-Host 'Entorno listo:'
Write-Host '  Frontend  http://localhost:5174'
Write-Host '  Backend   http://localhost:8081'
Write-Host '  Correos   http://localhost:8025'
