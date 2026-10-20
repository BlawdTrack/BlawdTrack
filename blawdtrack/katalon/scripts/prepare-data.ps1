<#
.SYNOPSIS
  Deja listos los datos del entorno de pruebas: las cuentas conocidas y los paquetes de prueba.

.DESCRIPTION
  1. Inicia sesion como Super Usuario (lo siembra el DataSeeder del backend).
  2. Crea el Administrador de Ventas y el Mensajero de test-accounts.json y les fija una contrasena conocida
     (la contrasena temporal que genera el sistema llega por correo y no se puede predecir).
  3. Aplica fixtures/e2e-packages.sql en la base de pruebas.

  Se puede ejecutar las veces que haga falta: las cuentas se reutilizan y los paquetes E2E-* se recrean.
#>
param(
    [string]$ApiUrl = 'http://localhost:8081',
    [string]$MySqlContainer = 'blawdtrack-e2e-mysql',
    [string]$DbPassword = 'e2e-root',
    [string]$AccountsFile = (Join-Path $PSScriptRoot '..\environment\test-accounts.json'),
    [string]$FixtureFile = (Join-Path $PSScriptRoot '..\environment\fixtures\e2e-packages.sql'),
    [switch]$SkipFixtures
)

$ErrorActionPreference = 'Stop'
$accounts = Get-Content -Raw -Encoding UTF8 -Path $AccountsFile | ConvertFrom-Json

# Llama a la API y devuelve el estado HTTP y el cuerpo, sin lanzar excepcion por un 4xx esperado (por ejemplo, un 409).
function Invoke-Api {
    param([string]$Method, [string]$Path, $Body, [string]$Token)

    $headers = @{}
    if ($Token) { $headers['Authorization'] = "Bearer $Token" }
    $arguments = @{ Uri = "$ApiUrl$Path"; Method = $Method; Headers = $headers; UseBasicParsing = $true }
    if ($null -ne $Body) {
        $arguments['Body'] = ($Body | ConvertTo-Json -Depth 5)
        $arguments['ContentType'] = 'application/json; charset=utf-8'
    }

    try {
        $response = Invoke-WebRequest @arguments
        $content = $null
        if ($response.Content) { $content = $response.Content | ConvertFrom-Json }
        return [pscustomobject]@{ Status = [int]$response.StatusCode; Body = $content }
    } catch {
        if ($null -eq $_.Exception.Response) { throw }
        return [pscustomobject]@{ Status = [int]$_.Exception.Response.StatusCode; Body = $null }
    }
}

function Assert-Status {
    param($Result, [int[]]$Expected, [string]$What)
    if ($Expected -notcontains $Result.Status) {
        throw "$What devolvio HTTP $($Result.Status); se esperaba $($Expected -join ' o ')."
    }
}

Write-Host '1/3 Iniciando sesion como Super Usuario...'
$login = Invoke-Api -Method 'POST' -Path '/api/v1/auth/login' -Body @{
    email = $accounts.superUser.email; password = $accounts.superUser.password }
Assert-Status $login @(200) 'El inicio de sesion del Super Usuario'
$token = $login.Body.token

Write-Host '2/3 Preparando las cuentas conocidas...'
$admin = $accounts.salesAdmin
$created = Invoke-Api -Method 'POST' -Path '/api/v1/admins' -Token $token -Body @{
    nombreCompleto = $admin.fullName; numeroTelefono = $admin.phone; correoElectronico = $admin.email
    documentType = $admin.documentType; documentNumber = $admin.documentNumber }
Assert-Status $created @(201, 409) 'Crear el Administrador de Ventas'
$passwordSet = Invoke-Api -Method 'PATCH' -Path "/api/v1/admins/$($admin.documentType)/$($admin.documentNumber)" `
    -Token $token -Body @{ password = $admin.password }
Assert-Status $passwordSet @(200) 'Fijar la contrasena del Administrador de Ventas'

$courier = $accounts.courier
$created = Invoke-Api -Method 'POST' -Path '/api/v1/couriers' -Token $token -Body @{
    documentType = $courier.documentType; documentNumber = $courier.documentNumber; fullName = $courier.fullName
    email = $courier.email; phone = $courier.phone; schedule = $courier.schedule
    maxPackageWeightKg = $courier.maxPackageWeightKg }
Assert-Status $created @(201, 409) 'Crear el Mensajero'
if ($created.Status -eq 201) {
    $courierId = $created.Body.id
} else {
    # Ya existia: se busca por correo. No sirve el numero de documento, porque un documento solo de digitos la
    # API lo interpreta primero como id.
    $list = Invoke-Api -Method 'GET' -Path '/api/v1/couriers' -Token $token
    Assert-Status $list @(200) 'Listar los mensajeros'
    $existing = @($list.Body) | Where-Object { $_.email -eq $courier.email } | Select-Object -First 1
    if ($null -eq $existing) { throw "El mensajero $($courier.email) existe pero no aparece en la lista." }
    $courierId = $existing.id
}
$passwordSet = Invoke-Api -Method 'PATCH' -Path "/api/v1/couriers/$courierId/password" `
    -Token $token -Body @{ password = $courier.password }
Assert-Status $passwordSet @(204) 'Fijar la contrasena del Mensajero'

if ($SkipFixtures) {
    Write-Host '3/3 Paquetes de prueba omitidos (-SkipFixtures).'
    return
}

Write-Host '3/3 Cargando los paquetes de prueba...'
$header = "SET @admin_email = '$($admin.email)'; SET @courier_email = '$($courier.email)';`n"
$sql = $header + (Get-Content -Raw -Encoding UTF8 -Path $FixtureFile)
# MYSQL_PWD evita el aviso de "contrasena en la linea de comandos", que Windows PowerShell 5.1 trata como error.
$sql | docker exec -i -e "MYSQL_PWD=$DbPassword" $MySqlContainer mysql -uroot --default-character-set=utf8mb4 blawdtrack
if ($LASTEXITCODE -ne 0) { throw "No se pudieron cargar los paquetes de prueba (mysql salio con $LASTEXITCODE)." }

Write-Host 'Listo. Cuentas y paquetes de prueba preparados.'
