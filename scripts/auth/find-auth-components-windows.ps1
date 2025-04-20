# PowerShell script to identify components that might need to be updated to use the useAuth hook
# This is a Windows-compatible version of the find-auth-components.js script

# Create output directory if it doesn't exist
$outputDir = $PSScriptRoot
if (!(Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
}

# Set up the output file path
$outputFile = Join-Path $outputDir "components-needing-auth.json"

# Patterns to search for that indicate a component might need authentication
$patterns = @(
    # Direct localStorage access for auth
    'localStorage\.getItem\([''"]token[''"]'
    'localStorage\.getItem\([''"]accessToken[''"]'
    'localStorage\.getItem\([''"]refreshToken[''"]'
    'localStorage\.getItem\([''"]auth[''"]'
    
    # Auth-related checks
    'isAuthenticated\(\)'
    'isLoggedIn'
    'user\s*===\s*null'
    'user\s*!==\s*null'
    'user\s*==\s*null'
    'user\s*!=\s*null'
    '!user'
    
    # Auth redirects
    'navigate\([''"]\/login[''"]'
    'history\.push\([''"]\/login[''"]'
    'Navigate to=[''"]\/login[''"]'
    'redirect.*login'
    
    # User profile access
    'user\.profile'
    'user\.permissions'
    'user\.role'
    
    # Direct authService usage
    'authService\.'
    'new AuthService\(\)'
)

# Directories to exclude
$excludeDirs = @(
    "node_modules",
    "dist",
    "build",
    "coverage",
    ".git",
    "scripts\auth"
)

# Files to exclude
$excludeFiles = @(
    "auth-service.ts",
    "token-service.ts",
    "AuthProvider.tsx",
    "ProtectedRoute.tsx"
)

# Get components already using useAuth
function Get-ComponentsUsingAuth {
    $componentsUsingAuth = @()
    
    # Find the src directory by moving up from the script location
    $srcDir = Join-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) "src"
    
    if (Test-Path $srcDir) {
        $files = Get-ChildItem -Path $srcDir -Recurse -Include "*.tsx","*.jsx","*.js","*.ts" | 
            Where-Object { 
                $fullPath = $_.FullName
                # Check that the file is not in any excluded directory
                $excludeDirs | ForEach-Object {
                    if ($fullPath -like "*\$_\*") {
                        return $false
                    }
                }
                return $true
            }
        
        foreach ($file in $files) {
            $content = Get-Content $file.FullName -Raw
            if ($content -match 'useAuth\(\)') {
                $componentsUsingAuth += $file.FullName
            }
        }
    }
    
    return $componentsUsingAuth
}

# Find components that might need authentication
function Find-ComponentsNeedingAuth {
    $results = @()
    
    # Find the src directory
    $srcDir = Join-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) "src"
    
    if (!(Test-Path $srcDir)) {
        Write-Host "Could not find src directory. Make sure you're running this script from the project root."
        return @()
    }
    
    # Find all TypeScript/JavaScript files
    $files = Get-ChildItem -Path $srcDir -Recurse -Include "*.tsx","*.jsx","*.js","*.ts" | 
        Where-Object { 
            $fullPath = $_.FullName
            # Check that the file is not in any excluded directory
            $excludeDir = $false
            foreach ($dir in $excludeDirs) {
                if ($fullPath -like "*\$dir\*") {
                    $excludeDir = $true
                    break
                }
            }
            
            # Check that the file is not in the exclude files list
            $excludeFile = $false
            foreach ($file in $excludeFiles) {
                if ($fullPath -like "*\$file") {
                    $excludeFile = $true
                    break
                }
            }
            
            return (-not $excludeDir) -and (-not $excludeFile)
        }
    
    foreach ($file in $files) {
        $fileContent = Get-Content $file.FullName -Raw
        
        foreach ($pattern in $patterns) {
            if ($fileContent -match $pattern) {
                # Get line number and context
                $lineNumber = 0
                $lines = Get-Content $file.FullName
                
                for ($i = 0; $i -lt $lines.Length; $i++) {
                    if ($lines[$i] -match $pattern) {
                        $lineNumber = $i + 1
                        $context = $lines[$i].Trim()
                        
                        $results += @{
                            file = $file.FullName
                            line = $lineNumber
                            pattern = $pattern
                            context = $context
                        }
                    }
                }
            }
        }
    }
    
    return $results
}

# Format and display results
function Format-Results {
    param (
        [PSCustomObject[]]$results,
        [string[]]$componentsUsingAuth
    )
    
    Write-Host "`n===== COMPONENTS THAT MIGHT NEED USEAUTH HOOK =====`n"
    
    if ($results.Count -eq 0) {
        Write-Host "✅ No components found that might need the useAuth hook."
        return
    }
    
    Write-Host "📋 Found $($results.Count) components that might need authentication:`n"
    
    # Group results by file
    $fileGroups = @{}
    
    foreach ($result in $results) {
        $relativeFile = $result.file -replace [regex]::Escape((Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) + "\"), ""
        
        if (-not $fileGroups.ContainsKey($relativeFile)) {
            $fileGroups[$relativeFile] = @()
        }
        
        $fileGroups[$relativeFile] += @{
            line = $result.line
            pattern = $result.pattern
            context = $result.context
        }
    }
    
    # Print results grouped by file
    foreach ($file in $fileGroups.Keys) {
        $alreadyUsesAuth = $componentsUsingAuth -contains $file
        
        Write-Host "📄 $file$(if ($alreadyUsesAuth) { ' (already uses useAuth)' } else { '' }):"
        
        foreach ($item in $fileGroups[$file]) {
            Write-Host "   Line $($item.line): $($item.context)"
        }
        
        Write-Host ""
    }
    
    Write-Host "`n===== RECOMMENDATIONS =====`n"
    Write-Host "Update components to use the useAuth hook:"
    Write-Host '```tsx'
    Write-Host 'import { useAuth } from "../core/auth/AuthProvider";'
    Write-Host ''
    Write-Host 'const MyComponent = () => {'
    Write-Host '  const { isAuthenticated, user, login, logout } = useAuth();'
    Write-Host '  '
    Write-Host '  // Use isAuthenticated instead of direct localStorage checks'
    Write-Host '  // Use user object for accessing user data'
    Write-Host '  // Use login/logout functions instead of direct authService calls'
    Write-Host '  '
    Write-Host '  // Example:'
    Write-Host '  return isAuthenticated ? ('
    Write-Host '    <div>Welcome, {user?.username}!</div>'
    Write-Host '  ) : ('
    Write-Host '    <div>Please log in</div>'
    Write-Host '  );'
    Write-Host '};'
    Write-Host '```'
}

# Main execution
Write-Host "Searching for components that might need authentication..."
$componentsUsingAuth = Get-ComponentsUsingAuth
$results = Find-ComponentsNeedingAuth

# Remove duplicates (same file+line)
$uniqueResults = @()
$seen = @{}

foreach ($result in $results) {
    $key = "$($result.file):$($result.line)"
    if (-not $seen.ContainsKey($key)) {
        $seen[$key] = $true
        $uniqueResults += $result
    }
}

# Format and display results
Format-Results -results $uniqueResults -componentsUsingAuth $componentsUsingAuth

# Write results to file for easier reference
$uniqueResults | ConvertTo-Json -Depth 5 | Out-File -FilePath $outputFile

Write-Host "`nReport also saved to $outputFile" 