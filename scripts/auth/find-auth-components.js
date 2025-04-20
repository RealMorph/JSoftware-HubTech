/**
 * Script to identify components that might need to be updated to use the useAuth hook
 * Helps with the implementation of the authentication system
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Patterns to search for that indicate a component might need authentication
const patterns = [
  // Direct localStorage access for auth
  'localStorage.getItem\\([\'"]token[\'"]\\)',
  'localStorage.getItem\\([\'"]accessToken[\'"]\\)',
  'localStorage.getItem\\([\'"]refreshToken[\'"]\\)',
  'localStorage.getItem\\([\'"]auth[\'"]\\)',
  
  // Auth-related checks
  'isAuthenticated\\(\\)',
  'isLoggedIn',
  'user\\s*===\\s*null',
  'user\\s*!==\\s*null',
  'user\\s*==\\s*null',
  'user\\s*!=\\s*null',
  '!user',
  
  // Auth redirects
  'navigate\\([\'"]\\/*login[\'"]',
  'history.push\\([\'"]\\/*login[\'"]',
  'Navigate to=[\'"]\\/*login[\'"]',
  'redirect.*login',
  
  // User profile access
  'user\\.profile',
  'user\\.permissions',
  'user\\.role',
  
  // Direct authService usage
  'authService\\.',
  'new AuthService\\(\\)',
  
  // Already using useAuth (to filter out)
  'useAuth\\(\\)'
];

// Directories to exclude
const excludeDirs = [
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.git',
  'scripts/auth',
];

// Files to exclude
const excludeFiles = [
  'auth-service.ts',
  'token-service.ts',
  'AuthProvider.tsx',
  'ProtectedRoute.tsx'
];

// Function to format the results
function formatResults(results, componentsUsingAuth) {
  console.log('\n===== COMPONENTS THAT MIGHT NEED USEAUTH HOOK =====\n');
  
  if (results.length === 0) {
    console.log('✅ No components found that might need the useAuth hook.');
    return;
  }
  
  console.log(`📋 Found ${results.length} components that might need authentication:\n`);
  
  const fileGroups = {};
  
  // Group results by file
  results.forEach(result => {
    const { file, line, pattern, context } = result;
    if (!fileGroups[file]) {
      fileGroups[file] = [];
    }
    fileGroups[file].push({ line, pattern, context });
  });
  
  // Print results grouped by file
  Object.keys(fileGroups).forEach(file => {
    // Check if the file already uses useAuth
    const alreadyUsesAuth = componentsUsingAuth.includes(file);
    
    console.log(`📄 ${file}${alreadyUsesAuth ? ' (already uses useAuth)' : ''}:`);
    fileGroups[file].forEach(item => {
      console.log(`   Line ${item.line}: ${item.context.trim()}`);
    });
    console.log('');
  });
  
  console.log('\n===== RECOMMENDATIONS =====\n');
  console.log('Update components to use the useAuth hook:');
  console.log('```tsx');
  console.log('import { useAuth } from "../core/auth/AuthProvider";');
  console.log('');
  console.log('const MyComponent = () => {');
  console.log('  const { isAuthenticated, user, login, logout } = useAuth();');
  console.log('  ');
  console.log('  // Use isAuthenticated instead of direct localStorage checks');
  console.log('  // Use user object for accessing user data');
  console.log('  // Use login/logout functions instead of direct authService calls');
  console.log('  ');
  console.log('  // Example:');
  console.log('  return isAuthenticated ? (');
  console.log('    <div>Welcome, {user?.username}!</div>');
  console.log('  ) : (');
  console.log('    <div>Please log in</div>');
  console.log('  );');
  console.log('};');
  console.log('```');
}

// Main function
async function findComponentsNeedingAuth() {
  const results = [];
  let componentsUsingAuth = [];
  
  // Create exclude pattern for directories
  const excludePattern = excludeDirs.map(dir => `--exclude-dir="${dir}"`).join(' ');
  const excludeFilesPattern = excludeFiles.map(file => `--exclude="${file}"`).join(' ');
  
  try {
    // First, find components already using useAuth
    const useAuthCmd = `grep -r "useAuth()" --include="*.{js,jsx,ts,tsx}" ${excludePattern} .`;
    const { stdout: useAuthOutput } = await executeCommand(useAuthCmd);
    
    if (useAuthOutput) {
      componentsUsingAuth = useAuthOutput
        .split('\n')
        .filter(Boolean)
        .map(line => {
          const match = line.match(/^\.\/(.+?):/);
          return match ? match[1] : null;
        })
        .filter(Boolean);
    }
    
    // Then search for all auth-related patterns
    for (const pattern of patterns) {
      if (pattern === 'useAuth\\(\\)') continue; // Skip this pattern since we already checked
      
      try {
        const cmd = `grep -r "${pattern}" --include="*.{js,jsx,ts,tsx}" ${excludePattern} ${excludeFilesPattern} .`;
        const { stdout } = await executeCommand(cmd);
        
        if (stdout) {
          const lines = stdout.split('\n').filter(Boolean);
          
          for (const line of lines) {
            const match = line.match(/^\.\/(.+?):(\d+):(.*)/);
            if (match) {
              const [, file, lineNum, content] = match;
              
              // Skip auth-related utility files
              if (file.includes('/auth/') && excludeFiles.some(ef => file.endsWith(ef))) {
                continue;
              }
              
              // Skip test files
              if (file.includes('.test.') || file.includes('.spec.')) {
                continue;
              }
              
              results.push({
                file,
                line: lineNum,
                pattern,
                context: content,
              });
            }
          }
        }
      } catch (error) {
        // Grep returns non-zero exit code when no matches are found, which throws an error
        // We can safely ignore this specific error
        if (!error.message.includes('No such file or directory') && 
            !error.stderr) {
          console.error(`Error searching for pattern ${pattern}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error('Error running script:', error);
  }
  
  // Sort results by file
  results.sort((a, b) => a.file.localeCompare(b.file) || parseInt(a.line) - parseInt(b.line));
  
  // Remove duplicates (same file+line)
  const uniqueResults = [];
  const seen = new Set();
  
  results.forEach(result => {
    const key = `${result.file}:${result.line}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueResults.push(result);
    }
  });
  
  formatResults(uniqueResults, componentsUsingAuth);
  
  // Write results to file for easier reference
  fs.writeFileSync(
    path.join(__dirname, 'components-needing-auth.json'), 
    JSON.stringify(uniqueResults, null, 2)
  );
  
  console.log('\nReport also saved to scripts/auth/components-needing-auth.json');
}

// Helper function to execute commands
function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      if (error && stderr) {
        reject({ error, stderr });
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

// Run the script
findComponentsNeedingAuth(); 