<#
.SYNOPSIS
  Apaga el entorno de pruebas y borra su base de datos (el proximo up.ps1 empieza de cero).
#>
$ErrorActionPreference = 'Stop'
$compose = Join-Path $PSScriptRoot '..\environment\docker-compose.e2e.yml'

# El compose exige JWT_SECRET para interpolar el archivo; para apagar basta con un valor cualquiera.
if (-not $env:JWT_SECRET) { $env:JWT_SECRET = 'solo-para-apagar' }

docker compose -f $compose down -v --remove-orphans
if ($LASTEXITCODE -ne 0) { throw 'docker compose down fallo.' }
