/**
 * Script to find direct localStorage access related to authentication
 * Helps identify places where TokenService should be used instead
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Patterns to search for
const patterns = [
  'localStorage.getItem\\([\'"]token[\'"]\\)',
  'localStorage.getItem\\([\'"]accessToken[\'"]\\)',
  'localStorage.getItem\\([\'"]refreshToken[\'"]\\)',
  'localStorage.getItem\\([\'"]auth[\'"]\\)',
  'localStorage.setItem\\([\'"]token[\'"]',
  'localStorage.setItem\\([\'"]accessToken[\'"]',
  'localStorage.setItem\\([\'"]refreshToken[\'"]',
  'localStorage.setItem\\([\'"]auth[\'"]',
  'localStorage.removeItem\\([\'"]token[\'"]\\)',
  'localStorage.removeItem\\([\'"]accessToken[\'"]\\)',
  'localStorage.removeItem\\([\'"]refreshToken[\'"]\\)',
  'localStorage.removeItem\\([\'"]auth[\'"]\\)',
];

// Directories to exclude
const excludeDirs = [
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.git',
  'scripts/auth', // Exclude this script
];

// Function to format the results
function formatResults(results) {
  console.log('\n===== DIRECT LOCALSTORAGE ACCESS REPORT =====\n');
  
  if (results.length === 0) {
    console.log('✅ No direct localStorage access found for authentication tokens.');
    return;
  }
  
  console.log(`📋 Found ${results.length} instances of direct localStorage access for authentication:\n`);
  
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
    console.log(`📄 ${file}:`);
    fileGroups[file].forEach(item => {
      console.log(`   Line ${item.line}: ${item.pattern}`);
      console.log(`   ${item.context}`);
      console.log('');
    });
  });
  
  console.log('\n===== RECOMMENDATIONS =====\n');
  console.log('Replace direct localStorage access with TokenService methods:');
  console.log('• localStorage.getItem("token") → TokenService.getAccessToken()');
  console.log('• localStorage.getItem("refreshToken") → TokenService.getRefreshToken()');
  console.log('• localStorage.setItem("token", value) → TokenService.setTokens({accessToken: value, ...})');
  console.log('• localStorage.removeItem("token") → TokenService.clearTokens()');
}

// Main function to search for patterns
async function searchForDirectLocalStorageAccess() {
  const results = [];
  
  // Create exclude pattern for directories
  const excludePattern = excludeDirs.map(dir => `--exclude-dir="${dir}"`).join(' ');
  
  for (const pattern of patterns) {
    try {
      // Execute grep command to search for the pattern
      const cmd = `grep -r "${pattern}" --include="*.{js,jsx,ts,tsx}" ${excludePattern} .`;
      const { stdout } = await executeCommand(cmd);
      
      if (stdout) {
        // Parse grep output
        const lines = stdout.split('\n').filter(Boolean);
        
        for (const line of lines) {
          const match = line.match(/^\.\/(.+?):(\d+):(.*)/);
          if (match) {
            const [, file, lineNum, content] = match;
            
            // Get context (a few lines before and after)
            const context = await getFileContext(file, parseInt(lineNum, 10));
            
            results.push({
              file,
              line: lineNum,
              pattern,
              context,
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
  
  formatResults(results);
  
  // Write results to file for easier reference
  fs.writeFileSync(
    path.join(__dirname, 'localstorage-access-report.json'), 
    JSON.stringify(results, null, 2)
  );
  
  console.log('\nReport also saved to scripts/auth/localstorage-access-report.json');
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

// Helper function to get context around the found line
async function getFileContext(file, lineNum) {
  const { stdout } = await executeCommand(`sed -n "${Math.max(1, lineNum - 2)},${lineNum + 2}p" "${file}"`);
  return stdout.trimEnd();
}

// Run the script
searchForDirectLocalStorageAccess().catch(error => {
  console.error('Error running script:', error);
}); 