#requires -Version 5.1
<#
.SYNOPSIS
  Builds a local Android release APK for Campus Conectado without paid services.
.DESCRIPTION
  Does not install anything and never contacts Expo Build. It requires an existing
  JDK 17, Android SDK and installed node_modules. The resulting APK must pass
  apksigner verification before it is copied to dist/android/CampusConectado.apk,
  so unsigned output is reported as failure instead of a false success.
#>
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

function Find-Java {
  if ($env:JAVA_HOME) {
    $candidate = Join-Path $env:JAVA_HOME 'bin\java.exe'
    if (Test-Path $candidate) { return $candidate }
    throw "JAVA_HOME aponta para '$env:JAVA_HOME', mas bin\java.exe nao existe. Corrija ou remova JAVA_HOME."
  }

  $command = Get-Command java -ErrorAction SilentlyContinue
  if ($command) { return $command.Source }
  return $null
}

function Find-AndroidSdk {
  $candidates = @(
    $env:ANDROID_HOME,
    $env:ANDROID_SDK_ROOT,
    (Join-Path $env:LOCALAPPDATA 'Android\Sdk'),
    (Join-Path $env:USERPROFILE 'AppData\Local\Android\Sdk')
  )

  foreach ($candidate in $candidates) {
    if ($candidate -and (Test-Path $candidate)) { return $candidate }
  }
  return $null
}

function Find-ApkSigner([string]$Sdk) {
  $buildTools = Join-Path $Sdk 'build-tools'
  if (-not (Test-Path $buildTools)) { return $null }

  $versions = Get-ChildItem $buildTools -Directory | Sort-Object Name -Descending
  foreach ($version in $versions) {
    $candidate = Join-Path $version.FullName 'apksigner.bat'
    if (Test-Path $candidate) { return $candidate }
  }
  return $null
}

$java = Find-Java
if (-not $java) {
  Write-Host 'Java nao encontrado. Instale um JDK 17 e defina JAVA_HOME.' -ForegroundColor Red
  Write-Host 'Sem JDK/Android SDK nao e possivel gerar APK localmente; use o perfil EAS preview.' -ForegroundColor Yellow
  exit 2
}

$sdk = Find-AndroidSdk
if (-not $sdk) {
  Write-Host 'Android SDK nao encontrado. Defina ANDROID_HOME ou ANDROID_SDK_ROOT.' -ForegroundColor Red
  Write-Host 'Sem SDK nao e possivel gerar APK localmente; use o perfil EAS preview.' -ForegroundColor Yellow
  exit 2
}

if (-not (Test-Path (Join-Path $root 'node_modules'))) {
  Write-Host 'node_modules ausente. Rode: npm install --ignore-scripts' -ForegroundColor Red
  exit 2
}

$versionOutput = (& $java -version 2>&1 | Out-String).Trim()
Write-Host "Java em uso: $java"
if ($env:JAVA_HOME) { Write-Host "JAVA_HOME: $env:JAVA_HOME" } else { Write-Host 'JAVA_HOME: nao definido (Gradle usa o java do PATH)' }
Write-Host $versionOutput

$majorMatch = [regex]::Match($versionOutput, 'version\s+"(\d+)')
if (-not $majorMatch.Success) {
  throw 'Nao foi possivel identificar a versao do Java.'
}
if ([int]$majorMatch.Groups[1].Value -lt 17) {
  throw 'O build exige JDK 17 ou superior.'
}

Write-Host "Android SDK: $sdk"

$apksigner = Find-ApkSigner $sdk
if (-not $apksigner) {
  throw 'apksigner nao encontrado em android-sdk/build-tools. Instale Android Build-Tools.'
}
Write-Host "apksigner: $apksigner"

& npx expo prebuild --platform android --no-install
if ($LASTEXITCODE -ne 0) { throw "expo prebuild falhou com codigo $LASTEXITCODE." }

Push-Location (Join-Path $root 'android')
try {
  Write-Host 'Gradle/JVM efetivamente usado:'
  & .\gradlew.bat -version
  if ($LASTEXITCODE -ne 0) { throw "gradlew -version falhou com codigo $LASTEXITCODE." }

  & .\gradlew.bat assembleRelease
  if ($LASTEXITCODE -ne 0) { throw "gradlew assembleRelease falhou com codigo $LASTEXITCODE." }
}
finally {
  Pop-Location
}

$releaseDir = Join-Path $root 'android\app\build\outputs\apk\release'
$signedApk = Get-ChildItem $releaseDir -Filter '*.apk' -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -notlike '*unsigned*' } |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if (-not $signedApk) {
  $unsigned = Get-ChildItem $releaseDir -Filter '*unsigned*.apk' -ErrorAction SilentlyContinue |
    Select-Object -First 1
  if ($unsigned) {
    throw "Somente APK sem assinatura foi gerado em $($unsigned.FullName). Nao e instalavel; use o perfil EAS preview."
  }
  throw "Nenhum APK encontrado em $releaseDir."
}

$verifyOutput = (& $apksigner verify --print-certs $signedApk.FullName 2>&1 | Out-String)
if ($LASTEXITCODE -ne 0) {
  throw "APK reprovado pelo apksigner e nao sera entregue:`n$verifyOutput"
}
Write-Host 'Assinatura verificada pelo apksigner:'
Write-Host $verifyOutput.Trim()

$artifactDir = Join-Path $root 'dist\android'
New-Item -ItemType Directory -Force -Path $artifactDir | Out-Null
$artifact = Join-Path $artifactDir 'CampusConectado.apk'
Copy-Item $signedApk.FullName $artifact -Force

$hash = (Get-FileHash $artifact -Algorithm SHA256).Hash
Write-Host ''
Write-Host "APK assinado: $artifact"
Write-Host "SHA256: $hash"
Write-Host "Origem Gradle: $($signedApk.FullName)"
