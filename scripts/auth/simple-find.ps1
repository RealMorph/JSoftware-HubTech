# Very simple PowerShell script to find localStorage usage
$rootDir = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$srcDir = Join-Path $rootDir "src"

Write-Host "Searching for direct localStorage access in: $srcDir"

# Simplified search
$results = @()

$files = Get-ChildItem -Path $srcDir -Recurse -Include "*.ts","*.tsx","*.js","*.jsx" -Exclude "token-service.ts"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    if ($content -match 'localStorage\.') {
        $relativePath = $file.FullName.Replace($rootDir, "").TrimStart("\")
        $results += $relativePath
    }
}

Write-Host ""
Write-Host "===== FILES WITH LOCALSTORAGE USAGE ====="
Write-Host ""

if ($results.Count -eq 0) {
    Write-Host "No files found using localStorage."
} else {
    Write-Host "Found $($results.Count) files with localStorage usage:"
    Write-Host ""
    
    foreach ($file in $results) {
        Write-Host "- $file"
    }
}

Write-Host ""
Write-Host "Remember to replace any authentication-related localStorage usage with TokenService methods." 