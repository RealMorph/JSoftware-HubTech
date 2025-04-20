# Simple PowerShell script to find localStorage usage related to authentication
# This script helps identify places where TokenService should be used instead

# Find the src directory
$rootDir = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$srcDir = Join-Path $rootDir "src"

Write-Host "Searching for direct localStorage access in: $srcDir"

# Patterns to search for
$patterns = @(
    'localStorage.getItem\([''"]token[''"]'
    'localStorage.getItem\([''"]accessToken[''"]'
    'localStorage.getItem\([''"]refreshToken[''"]'
    'localStorage.getItem\([''"]auth[''"]'
    'localStorage.setItem\([''"]token[''"]'
    'localStorage.setItem\([''"]accessToken[''"]'
    'localStorage.setItem\([''"]refreshToken[''"]'
    'localStorage.setItem\([''"]auth[''"]'
    'localStorage.removeItem\([''"]token[''"]'
    'localStorage.removeItem\([''"]accessToken[''"]'
    'localStorage.removeItem\([''"]refreshToken[''"]'
    'localStorage.removeItem\([''"]auth[''"]'
)

# Files to exclude
$excludeFiles = @(
    "token-service.ts"
)

# Search for patterns
$results = @()

if (Test-Path $srcDir) {
    $files = Get-ChildItem -Path $srcDir -Recurse -Include "*.ts","*.tsx","*.js","*.jsx"
    
    foreach ($file in $files) {
        # Skip excluded files
        $skipFile = $false
        foreach ($excludeFile in $excludeFiles) {
            if ($file.Name -eq $excludeFile) {
                $skipFile = $true
                break
            }
        }
        
        if ($skipFile) { continue }
        
        $content = Get-Content $file.FullName -Raw
        
        foreach ($pattern in $patterns) {
            if ($content -match $pattern) {
                $relativePath = $file.FullName.Replace($rootDir, "").TrimStart("\")
                $results += @{
                    file = $relativePath
                    pattern = $pattern
                }
                break  # Only count each file once per pattern
            }
        }
    }
}

Write-Host ""
Write-Host "===== DIRECT LOCALSTORAGE ACCESS REPORT ====="
Write-Host ""

if ($results.Count -eq 0) {
    Write-Host "✅ No direct localStorage access found for authentication tokens."
} else {
    Write-Host "📋 Found $($results.Count) files with direct localStorage access for authentication:"
    Write-Host ""
    
    $filesByPattern = @{}
    
    foreach ($result in $results) {
        $patternName = $result.pattern
        if (-not $filesByPattern.ContainsKey($patternName)) {
            $filesByPattern[$patternName] = @()
        }
        $filesByPattern[$patternName] += $result.file
    }
    
    foreach ($pattern in $filesByPattern.Keys) {
        Write-Host "Pattern: $pattern"
        foreach ($file in $filesByPattern[$pattern]) {
            Write-Host "  - $file"
        }
        Write-Host ""
    }
    
    Write-Host "===== RECOMMENDATIONS ====="
    Write-Host ""
    Write-Host "Replace direct localStorage access with TokenService methods:"
    Write-Host "• localStorage.getItem('token') should be changed to TokenService.getAccessToken()"
    Write-Host "• localStorage.getItem('refreshToken') should be changed to TokenService.getRefreshToken()"
    Write-Host "• localStorage.setItem('token', value) should be changed to TokenService.setTokens({accessToken: value, ...})"
    Write-Host "• localStorage.removeItem('token') should be changed to TokenService.clearTokens()"
}

# Write results to a file
$outputFile = Join-Path $PSScriptRoot "localstorage-access-report.json"
$results | ConvertTo-Json -Depth 3 | Out-File -FilePath $outputFile
Write-Host ""
Write-Host "Report saved to $outputFile" 