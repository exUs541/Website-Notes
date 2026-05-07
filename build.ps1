# build.ps1 - Package WebNote for Chrome Web Store

$manifest = Get-Content -Raw -Path manifest.json | ConvertFrom-Json
$version = $manifest.version
$zipFile = "WebNote-v$version.zip"

if (Test-Path $zipFile) {
    Remove-Item $zipFile
}

Write-Host "Verpacke WebNote Version $version..." -ForegroundColor Cyan

# Define the files and folders to include
$includeList = @(
    "icons",
    "background.js",
    "check.js",
    "content.css",
    "content.js",
    "dashboard.css",
    "dashboard.html",
    "dashboard.js",
    "manifest.json",
    "popup.html",
    "popup.js"
)

# Use Compress-Archive to create the ZIP
Compress-Archive -Path $includeList -DestinationPath $zipFile -Force

Write-Host "Fertig! $zipFile wurde im Projektordner erstellt." -ForegroundColor Green
Write-Host "Lade diese ZIP-Datei im Google Chrome Developer Dashboard hoch." -ForegroundColor Yellow
