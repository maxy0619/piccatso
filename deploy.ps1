# Piccatso Theme Automated Deployment Script
# Usage: .\deploy.ps1 "Your commit message"

param(
    [string]$CommitMessage = "Theme updates and optimizations"
)

Write-Host "Starting Piccatso Theme Deployment..." -ForegroundColor Cyan

# Check if there are any changes
$changes = git status --porcelain
if (-not $changes) {
    Write-Host "No changes detected. Repository is up to date." -ForegroundColor Green
    exit 0
}

Write-Host "Staging all changes..." -ForegroundColor Yellow
git add .

Write-Host "Committing changes..." -ForegroundColor Yellow
git commit -m $CommitMessage

Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
$pushResult = git push origin main 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Successfully pushed to GitHub!" -ForegroundColor Green
} else {
    Write-Host "Failed to push to GitHub: $pushResult" -ForegroundColor Red
    exit 1
}

Write-Host "Creating deployment ZIP..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$zipName = "piccatso-theme-$timestamp.zip"

# Remove old ZIP files
Remove-Item -Path "piccatso-theme-*.zip" -Force -ErrorAction SilentlyContinue

# Create new ZIP with timestamp
Compress-Archive -Path 'assets', 'config', 'layout', 'locales', 'sections', 'snippets', 'templates' -DestinationPath $zipName -Force

if (Test-Path $zipName) {
    Write-Host "Deployment ZIP created: $zipName" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Go to Shopify Admin -> Online Store -> Themes" -ForegroundColor White
    Write-Host "2. Click 'Add theme' -> 'Upload ZIP file'" -ForegroundColor White
    Write-Host "3. Upload: $zipName" -ForegroundColor Yellow
    Write-Host "4. Preview and Publish when ready!" -ForegroundColor White
    Write-Host ""
    Write-Host "Deployment package ready!" -ForegroundColor Green
    
    # Auto-open file explorer to show the ZIP file
    explorer.exe .
} else {
    Write-Host "Failed to create deployment ZIP" -ForegroundColor Red
    exit 1
}