/**
 * Theme Cleanup Utility
 * 
 * This script helps identify and fix theme-related issues in your codebase:
 * - Finds deprecated theme utility usages
 * - Identifies legacy theme patterns that should be updated
 * - Provides guidance on migrating to the DirectTheme pattern
 * 
 * Usage:
 * - Run with Node.js: node scripts/theme-cleanup.js [options]
 * 
 * Options:
 *   --path    Specify source directory (default: "src")
 *   --fix     Attempt to automatically fix simple issues
 *   --report  Generate HTML report of findings
 */

const fs = require('fs');
const path = require('path');
const util = require('util');
const { exec } = require('child_process');
const execPromise = util.promisify(exec);

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  path: "src",
  fix: false,
  report: false
};

// Process command line arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--path' && args[i + 1]) {
    options.path = args[i + 1];
    i++;
  } else if (args[i] === '--fix') {
    options.fix = true;
  } else if (args[i] === '--report') {
    options.report = true;
  }
}

// Define patterns to search for
const PATTERNS = {
  // Deprecated utility functions
  DEPRECATED_UTILS: [
    { pattern: /getThemeColor\(/g, suggestion: "Use theme.colors directly" },
    { pattern: /useTheme\(\)/g, suggestion: "Replace with useDirectTheme()" },
    { pattern: /withTheme\(/g, suggestion: "Use styled components with DirectTheme" },
    { pattern: /ThemeProvider /g, suggestion: "Replace with DirectThemeProvider" },
    { pattern: /theme\.get\(['"](.*?)['"].*?\)/g, suggestion: "Use direct access via theme.colors, theme.spacing, etc." }
  ],
  
  // Legacy inline style patterns
  LEGACY_INLINE: [
    { pattern: /style={{.*?color:.*?theme\./g, suggestion: "Replace with styled component using $themeStyles" },
    { pattern: /style={{.*?margin:.*?theme\./g, suggestion: "Replace with styled component using $themeStyles" },
    { pattern: /style={{.*?padding:.*?theme\./g, suggestion: "Replace with styled component using $themeStyles" },
    { pattern: /style={{.*?background:.*?theme\./g, suggestion: "Replace with styled component using $themeStyles" }
  ],
  
  // CSS-in-JS without $themeStyles
  CSS_WITHOUT_THEME_STYLES: [
    { pattern: /styled\.[a-z]+`[^`]*?theme\.[^`]*?`/g, suggestion: "Add proper $themeStyles typing" },
    { pattern: /css`[^`]*?theme\.[^`]*?`/g, suggestion: "Use $themeStyles with styled components instead" }
  ],
  
  // Recommended fixes
  FIXES: {
    'useTheme()': 'useDirectTheme()',
    'withTheme(': 'withDirectTheme(',
    'theme.get(': (match, p1) => {
      // Try to determine the right property
      if (p1.includes('color')) return `theme.colors.${p1.replace('colors.', '')}`;
      if (p1.includes('spacing')) return `theme.spacing.${p1.replace('spacing.', '')}`;
      if (p1.includes('typography')) return `theme.typography.${p1.replace('typography.', '')}`;
      return `theme.${p1}`; // Default fallback
    }
  }
};

// Track issues found
const issues = {
  deprecatedUtils: [],
  legacyInline: [],
  cssWithoutThemeStyles: [],
  total: 0
};

// Process a single file
async function processFile(filePath) {
  const fileIssues = {
    path: filePath,
    issues: []
  };
  
  // Skip non-JS/TS/TSX files
  if (!['.js', '.jsx', '.ts', '.tsx'].includes(path.extname(filePath))) {
    return null;
  }
  
  try {
    const content = await fs.promises.readFile(filePath, 'utf8');
    let modifiedContent = content;
    let lines = content.split('\n');
    let hasChanges = false;
    
    // Check for deprecated utilities
    PATTERNS.DEPRECATED_UTILS.forEach(pattern => {
      const matches = [...content.matchAll(pattern.pattern)];
      matches.forEach(match => {
        // Find line number
        let lineCount = 0;
        let position = 0;
        while (position < match.index && lineCount < lines.length) {
          position += lines[lineCount].length + 1; // +1 for newline
          lineCount++;
        }
        
        fileIssues.issues.push({
          type: 'deprecated',
          line: lineCount,
          match: match[0],
          suggestion: pattern.suggestion
        });
        
        // Try to fix if requested
        if (options.fix && PATTERNS.FIXES[match[0]]) {
          const replacement = typeof PATTERNS.FIXES[match[0]] === 'function' 
            ? PATTERNS.FIXES[match[0]](match[0], match[1]) 
            : PATTERNS.FIXES[match[0]];
          
          modifiedContent = modifiedContent.replace(match[0], replacement);
          hasChanges = true;
        }
      });
    });
    
    // Check for legacy inline styles
    PATTERNS.LEGACY_INLINE.forEach(pattern => {
      const matches = [...content.matchAll(pattern.pattern)];
      matches.forEach(match => {
        // Find line number
        let lineCount = 0;
        let position = 0;
        while (position < match.index && lineCount < lines.length) {
          position += lines[lineCount].length + 1;
          lineCount++;
        }
        
        fileIssues.issues.push({
          type: 'inline',
          line: lineCount,
          match: match[0],
          suggestion: pattern.suggestion
        });
      });
    });
    
    // Check for CSS-in-JS without proper $themeStyles
    PATTERNS.CSS_WITHOUT_THEME_STYLES.forEach(pattern => {
      const matches = [...content.matchAll(pattern.pattern)];
      matches.forEach(match => {
        // Find line number
        let lineCount = 0;
        let position = 0;
        while (position < match.index && lineCount < lines.length) {
          position += lines[lineCount].length + 1;
          lineCount++;
        }
        
        fileIssues.issues.push({
          type: 'css',
          line: lineCount,
          match: match[0],
          suggestion: pattern.suggestion
        });
      });
    });
    
    // Save fixed file if changes were made
    if (options.fix && hasChanges) {
      await fs.promises.writeFile(filePath, modifiedContent, 'utf8');
      console.log(`Fixed issues in: ${filePath}`);
    }
    
    return fileIssues.issues.length > 0 ? fileIssues : null;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return null;
  }
}

// Find all files to process
async function findFiles(dir) {
  let results = [];
  const files = await fs.promises.readdir(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.promises.stat(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and dist directories
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
        results = results.concat(await findFiles(filePath));
      }
    } else {
      results.push(filePath);
    }
  }
  
  return results;
}

// Generate HTML report
async function generateReport(allIssues) {
  const reportPath = path.join(process.cwd(), 'theme-cleanup-report.html');
  
  // Group issues by file
  const fileGroups = {};
  allIssues.forEach(file => {
    if (!file) return;
    
    fileGroups[file.path] = file.issues;
  });
  
  // Create HTML report
  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Theme Cleanup Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      border-bottom: 2px solid #eaecef;
      padding-bottom: 10px;
    }
    .summary {
      background: #f6f8fa;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 20px;
    }
    .file-section {
      margin-bottom: 30px;
      padding: 15px;
      background: #fff;
      border: 1px solid #e1e4e8;
      border-radius: 6px;
    }
    .file-path {
      font-weight: bold;
      color: #0366d6;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .issues-container {
      margin-top: 10px;
      display: none;
    }
    .issue {
      padding: 10px;
      margin-bottom: 5px;
      background: #f8f9fa;
      border-left: 4px solid #e36209;
      font-family: monospace;
    }
    .deprecated { border-left-color: #d73a49; }
    .inline { border-left-color: #6f42c1; }
    .css { border-left-color: #2188ff; }
    .suggestion {
      background: #dcffe4;
      color: #22863a;
      padding: 5px 10px;
      border-radius: 3px;
      margin-top: 5px;
      font-family: system-ui;
    }
    .issue-count {
      background: #0366d6;
      color: white;
      border-radius: 20px;
      padding: 3px 10px;
      font-size: 12px;
      min-width: 20px;
      text-align: center;
    }
    .progress-bar {
      height: 8px;
      width: 100%;
      background: #eaecef;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 20px;
    }
    .progress-fill {
      height: 100%;
      background: #2cbe4e;
    }
  </style>
</head>
<body>
  <h1>Theme Cleanup Report</h1>
  
  <div class="summary">
    <h3>Summary</h3>
    <p>Found <strong>${issues.total}</strong> theme-related issues across <strong>${Object.keys(fileGroups).length}</strong> files.</p>
    <ul>
      <li>Deprecated utility functions: <strong>${issues.deprecatedUtils.length}</strong></li>
      <li>Legacy inline styles with theme: <strong>${issues.legacyInline.length}</strong></li>
      <li>CSS-in-JS without $themeStyles: <strong>${issues.cssWithoutThemeStyles.length}</strong></li>
    </ul>
    
    <div class="progress-bar">
      <div class="progress-fill" style="width: ${Math.min(100, (1 - issues.total / (issues.total + 100)) * 100)}%"></div>
    </div>
  </div>
  
  <div class="files">
  `;
  
  // Add file sections
  Object.entries(fileGroups).forEach(([filePath, fileIssues]) => {
    const relPath = filePath.replace(process.cwd(), '').replace(/\\/g, '/');
    
    html += `
    <div class="file-section">
      <div class="file-path" onclick="toggleIssues(this)">
        <span>${relPath}</span>
        <span class="issue-count">${fileIssues.length}</span>
      </div>
      <div class="issues-container">
    `;
    
    // Add issues
    fileIssues.forEach(issue => {
      html += `
        <div class="issue ${issue.type}">
          <div>Line ${issue.line}: <code>${issue.match}</code></div>
          <div class="suggestion">✓ ${issue.suggestion}</div>
        </div>
      `;
    });
    
    html += `
      </div>
    </div>
    `;
  });
  
  html += `
  </div>
  
  <script>
    function toggleIssues(element) {
      const container = element.nextElementSibling;
      container.style.display = container.style.display === 'block' ? 'none' : 'block';
    }
  </script>
</body>
</html>
  `;
  
  await fs.promises.writeFile(reportPath, html, 'utf8');
  console.log(`Report generated: ${reportPath}`);
}

// Main function
async function main() {
  console.log(`\n===== Theme Cleanup Utility =====`);
  console.log(`Scanning directory: ${options.path}`);
  console.log(`Auto-fix: ${options.fix ? 'Enabled' : 'Disabled'}`);
  console.log(`Report: ${options.report ? 'Enabled' : 'Disabled'}`);
  console.log('==============================\n');
  
  try {
    // Find all files
    const files = await findFiles(path.resolve(process.cwd(), options.path));
    console.log(`Found ${files.length} files to scan.`);
    
    // Process files
    const results = [];
    for (const file of files) {
      const result = await processFile(file);
      if (result) results.push(result);
      
      // Update counts
      if (result) {
        result.issues.forEach(issue => {
          issues.total++;
          if (issue.type === 'deprecated') issues.deprecatedUtils.push(issue);
          if (issue.type === 'inline') issues.legacyInline.push(issue);
          if (issue.type === 'css') issues.cssWithoutThemeStyles.push(issue);
        });
      }
    }
    
    // Print summary
    console.log('\n===== Results =====');
    console.log(`Found ${issues.total} theme-related issues across ${results.filter(Boolean).length} files.`);
    console.log(`Deprecated utility functions: ${issues.deprecatedUtils.length}`);
    console.log(`Legacy inline styles with theme: ${issues.legacyInline.length}`);
    console.log(`CSS-in-JS without $themeStyles: ${issues.cssWithoutThemeStyles.length}`);
    
    // Generate report if requested
    if (options.report) {
      await generateReport(results);
    }
    
    // Provide next steps
    console.log('\n===== Next Steps =====');
    if (issues.total === 0) {
      console.log('✓ No theme-related issues found! Your codebase is using the DirectTheme pattern correctly.');
    } else {
      console.log('1. Review the issues found and update your code to use the DirectTheme pattern.');
      console.log('2. Run with --fix flag to automatically fix simple issues.');
      console.log('3. Run with --report flag to generate a detailed HTML report.');
      console.log('\nExample fixes:');
      console.log('• Replace useTheme() with useDirectTheme()');
      console.log('• Replace inline styles using theme with styled components using $themeStyles');
      console.log('• Add proper typing to CSS-in-JS with $themeStyles');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
main(); 