# PowerShell script to update all localhost:3001 URLs to use centralized config
# Run this from the frontend directory

Write-Host "🔧 Updating API URLs in frontend files..." -ForegroundColor Green

# Files to update
$files = @(
    "src/pages/DashboardPage.js",
    "src/pages/LeaderboardPage.js", 
    "src/pages/BookmarksPage.js",
    "src/pages/UsersPage.js",
    "src/pages/ProgressPage.js",
    "src/pages/HomePage.js",
    "src/pages/QuestionsPage.js",
    "src/pages/AdminDashboard.js"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "📝 Updating $file..." -ForegroundColor Yellow
        
        # Read file content
        $content = Get-Content $file -Raw
        
        # Replace hardcoded localhost URLs with config import
        $content = $content -replace "const API_BASE_URL = 'http://localhost:3001';", "import { API_BASE_URL } from '../config/config';"
        $content = $content -replace "const API_BASE_URL = `"http://localhost:3001`";", "import { API_BASE_URL } from '../config/config';"
        
        # Replace direct localhost:3001 URLs with API_BASE_URL
        $content = $content -replace "http://localhost:3001", "`${API_BASE_URL}"
        
        # Write updated content back
        Set-Content $file $content -NoNewline
        
        Write-Host "✅ Updated $file" -ForegroundColor Green
    } else {
        Write-Host "❌ File not found: $file" -ForegroundColor Red
    }
}

Write-Host "🎉 API URL update complete!" -ForegroundColor Green
Write-Host "📋 Don't forget to:" -ForegroundColor Cyan
Write-Host "   1. Add 'import { API_BASE_URL } from '../config/config';' to files that need it" -ForegroundColor Cyan
Write-Host "   2. Test the login functionality" -ForegroundColor Cyan
