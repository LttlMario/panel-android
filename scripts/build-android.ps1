param(
    [ValidateSet('Debug', 'Release')]
    [string]$Configuration = 'Debug'
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$jdkRoot = Get-ChildItem -LiteralPath (Join-Path $projectRoot '.tools\jdk21') -Directory |
    Select-Object -First 1 -ExpandProperty FullName

if (-not $jdkRoot) {
    throw 'JDK 21 lipsește din .tools\jdk21. Instalează JDK 21 sau setează JAVA_HOME.'
}

$env:JAVA_HOME = $jdkRoot
$env:ANDROID_HOME = Join-Path $env:LOCALAPPDATA 'Android\Sdk'
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME

$gradle = Join-Path $projectRoot 'android\gradlew.bat'
$task = if ($Configuration -eq 'Release') { 'bundleRelease' } else { 'assembleDebug' }

& $gradle -p (Join-Path $projectRoot 'android') $task
if ($LASTEXITCODE -ne 0) {
    throw "Compilarea Android a eșuat cu codul $LASTEXITCODE."
}
