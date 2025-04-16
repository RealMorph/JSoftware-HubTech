#!/usr/bin/env node

const { execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Configuration
const REPORT_FILE = path.resolve(__dirname, '../../dist/typescript-errors-report.html');
const TS_CONFIG = path.resolve(__dirname, '../../tsconfig.json');
const SRC_DIR = path.resolve(__dirname, '../../src');
const DIST_DIR = path.resolve(__dirname, '../../dist');

// Ensure dist directory exists
if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

console.log(chalk.blue('🔍 TypeScript Error Analyzer'));
console.log(chalk.gray('Scanning project for TypeScript errors...\n'));

/**
 * Run TypeScript compiler in noEmit mode to get errors
 * @returns {string} The raw TypeScript error output
 */
function runTypeScriptCheck() {
  try {
    console.log(chalk.gray('Running TypeScript compiler check...'));
    // Run tsc with noEmit flag to check for errors without generating output files
    const tscOutput = execSync('npx tsc --noEmit', { encoding: 'utf8' });
    return tscOutput;
  } catch (error) {
    // tsc will exit with non-zero code if there are errors, which throws in execSync
    // We want to capture this output for analysis
    return error.stdout;
  }
}

/**
 * Parse the TypeScript error output into structured data
 * @param {string} tscOutput - The raw TypeScript error output
 * @returns {Array<Object>} Structured error objects
 */
function parseErrors(tscOutput) {
  const errorRegex = /(.+)\((\d+),(\d+)\): error TS(\d+): (.+)/g;
  const errors = [];
  let match;

  while ((match = errorRegex.exec(tscOutput)) !== null) {
    const [, filePath, line, column, code, message] = match;
    errors.push({
      filePath: filePath.trim(),
      line: parseInt(line, 10),
      column: parseInt(column, 10),
      code: `TS${code}`,
      message: message.trim(),
      category: categorizeError(code, message)
    });
  }

  return errors;
}

/**
 * Categorize errors based on code and message
 * @param {string} code - The TypeScript error code
 * @param {string} message - The error message
 * @returns {string} Error category
 */
function categorizeError(code, message) {
  const codeNum = parseInt(code, 10);
  
  // Type mismatch errors
  if (codeNum === 2322 || codeNum === 2345) {
    return 'Type Mismatch';
  }
  
  // Missing properties or arguments
  if (codeNum === 2554 || codeNum === 2339 || codeNum === 2345) {
    return 'Missing Property/Argument';
  }
  
  // Import errors
  if (codeNum === 2307 || codeNum === 1192) {
    return 'Import Error';
  }
  
  // Configuration errors
  if (codeNum === 2688 || codeNum === 5012) {
    return 'Configuration Error';
  }
  
  // Library/Definition errors
  if (codeNum === 7016 || codeNum === 7017) {
    return 'Library Definition Error';
  }
  
  // React/JSX specific errors
  if (message.includes('JSX') || message.includes('React')) {
    return 'React/JSX Error';
  }
  
  return 'Other';
}

/**
 * Group errors by file path
 * @param {Array<Object>} errors - Structured error objects
 * @returns {Object} Errors grouped by file
 */
function groupErrorsByFile(errors) {
  return errors.reduce((groups, error) => {
    const key = error.filePath;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(error);
    return groups;
  }, {});
}

/**
 * Group errors by category
 * @param {Array<Object>} errors - Structured error objects
 * @returns {Object} Errors grouped by category
 */
function groupErrorsByCategory(errors) {
  return errors.reduce((groups, error) => {
    const key = error.category;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(error);
    return groups;
  }, {});
}

/**
 * Generate error statistics
 * @param {Array<Object>} errors - Structured error objects
 * @returns {Object} Statistics about the errors
 */
function generateStatistics(errors) {
  const byCategory = groupErrorsByCategory(errors);
  const byFile = groupErrorsByFile(errors);
  
  // Find the most problematic files (those with most errors)
  const filesSorted = Object.entries(byFile)
    .sort(([, a], [, b]) => b.length - a.length)
    .slice(0, 10)
    .map(([filePath, fileErrors]) => ({
      filePath: filePath.replace(/\\/g, '/'), // Normalize path for display
      count: fileErrors.length,
      categories: [...new Set(fileErrors.map(e => e.category))].join(', ')
    }));
  
  // Generate category statistics
  const categories = Object.entries(byCategory)
    .map(([category, categoryErrors]) => ({
      name: category,
      count: categoryErrors.length,
      percentage: (categoryErrors.length / errors.length * 100).toFixed(1)
    }))
    .sort((a, b) => b.count - a.count);
  
  return {
    totalErrors: errors.length,
    totalFilesWithErrors: Object.keys(byFile).length,
    categories,
    topProblematicFiles: filesSorted
  };
}

/**
 * Generate error fixing recommendations
 * @param {Array<Object>} errors - Structured error objects
 * @param {Object} statistics - Error statistics
 * @returns {Object} Recommendations for fixing errors
 */
function generateRecommendations(errors, statistics) {
  const recommendations = {
    highPriority: [],
    mediumPriority: [],
    lowPriority: []
  };
  
  // Add category-specific recommendations
  statistics.categories.forEach(category => {
    switch(category.name) {
      case 'Type Mismatch':
        recommendations.highPriority.push('Review and fix type mismatches in component props');
        recommendations.mediumPriority.push('Create more specific interfaces for complex data structures');
        break;
        
      case 'Missing Property/Argument':
        recommendations.highPriority.push('Add missing required props to component calls');
        recommendations.mediumPriority.push('Review function argument usage across the codebase');
        break;
        
      case 'Import Error':
        recommendations.mediumPriority.push('Fix incorrect import paths and module references');
        recommendations.lowPriority.push('Restructure imports for better organization');
        break;
        
      case 'Configuration Error':
        recommendations.highPriority.push('Update tsconfig.json settings to resolve configuration conflicts');
        recommendations.mediumPriority.push('Review build configuration for TypeScript compatibility');
        break;
        
      case 'React/JSX Error':
        recommendations.highPriority.push('Fix React component issues (props, refs, etc.)');
        recommendations.mediumPriority.push('Update JSX usage to follow current React patterns');
        break;
        
      case 'Other':
        recommendations.lowPriority.push('Address miscellaneous TypeScript errors');
        break;
    }
  });
  
  // Add file-specific recommendations if there are highly problematic files
  if (statistics.topProblematicFiles.length > 0) {
    recommendations.highPriority.push(`Focus first on fixing errors in ${statistics.topProblematicFiles[0].filePath} (${statistics.topProblematicFiles[0].count} errors)`);
    
    if (statistics.topProblematicFiles.length > 1) {
      recommendations.mediumPriority.push(`Address issues in the next 3 most problematic files: ${statistics.topProblematicFiles.slice(1, 4).map(f => path.basename(f.filePath)).join(', ')}`);
    }
  }
  
  // De-duplicate recommendations
  return {
    highPriority: [...new Set(recommendations.highPriority)],
    mediumPriority: [...new Set(recommendations.mediumPriority)],
    lowPriority: [...new Set(recommendations.lowPriority)]
  };
}

/**
 * Generate HTML report
 * @param {Array<Object>} errors - Structured error objects
 * @param {Object} statistics - Error statistics
 * @param {Object} recommendations - Recommendations for fixing errors
 * @returns {string} HTML report content
 */
function generateHTMLReport(errors, statistics, recommendations) {
  const errorsByFile = groupErrorsByFile(errors);
  const errorsByCategory = groupErrorsByCategory(errors);
  
  const fileRows = statistics.topProblematicFiles.map(file => `
    <tr>
      <td>${file.filePath}</td>
      <td>${file.count}</td>
      <td>${file.categories}</td>
    </tr>
  `).join('');
  
  const categoryRows = statistics.categories.map(category => `
    <tr>
      <td>${category.name}</td>
      <td>${category.count}</td>
      <td>${category.percentage}%</td>
    </tr>
  `).join('');
  
  const highPriorityItems = recommendations.highPriority.map(rec => `<li>${rec}</li>`).join('');
  const mediumPriorityItems = recommendations.mediumPriority.map(rec => `<li>${rec}</li>`).join('');
  const lowPriorityItems = recommendations.lowPriority.map(rec => `<li>${rec}</li>`).join('');
  
  // Generate detailed error listings by file
  const errorDetails = Object.entries(errorsByFile).map(([filePath, fileErrors]) => {
    const normalizedPath = filePath.replace(/\\/g, '/');
    const errorItems = fileErrors.map(error => `
      <li>
        <strong>Line ${error.line}:${error.column}</strong> - 
        <span class="error-code">${error.code}</span>: 
        <span class="error-message">${error.message}</span>
        <span class="error-category">(${error.category})</span>
      </li>
    `).join('');
    
    return `
      <div class="file-errors">
        <h4>${normalizedPath} (${fileErrors.length} errors)</h4>
        <ul class="error-list">
          ${errorItems}
        </ul>
      </div>
    `;
  }).join('');
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>TypeScript Error Analysis Report</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        h1, h2, h3, h4 {
          color: #0066cc;
        }
        .summary {
          background-color: #f5f5f5;
          padding: 20px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px 12px;
          text-align: left;
        }
        th {
          background-color: #0066cc;
          color: white;
        }
        tr:nth-child(even) {
          background-color: #f2f2f2;
        }
        .recommendations {
          background-color: #e6f7ff;
          padding: 20px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        .high-priority {
          color: #d50000;
          font-weight: bold;
        }
        .medium-priority {
          color: #ff6d00;
        }
        .low-priority {
          color: #2962ff;
        }
        .error-code {
          color: #d50000;
          font-family: monospace;
        }
        .error-message {
          font-family: monospace;
        }
        .error-category {
          font-size: 0.9em;
          color: #666;
          margin-left: 8px;
        }
        .file-errors {
          margin-bottom: 30px;
          border-left: 3px solid #0066cc;
          padding-left: 15px;
        }
        .error-list {
          list-style-type: none;
          padding-left: 10px;
        }
        .error-list li {
          margin-bottom: 10px;
          border-bottom: 1px dashed #ccc;
          padding-bottom: 10px;
        }
      </style>
    </head>
    <body>
      <h1>TypeScript Error Analysis Report</h1>
      <p>Generated on: ${new Date().toLocaleString()}</p>
      
      <div class="summary">
        <h2>Summary</h2>
        <p>Found <strong>${statistics.totalErrors}</strong> TypeScript errors across <strong>${statistics.totalFilesWithErrors}</strong> files.</p>
      </div>
      
      <h2>Error Categories</h2>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Count</th>
            <th>Percentage</th>
          </tr>
        </thead>
        <tbody>
          ${categoryRows}
        </tbody>
      </table>
      
      <h2>Top Problematic Files</h2>
      <table>
        <thead>
          <tr>
            <th>File</th>
            <th>Errors</th>
            <th>Categories</th>
          </tr>
        </thead>
        <tbody>
          ${fileRows}
        </tbody>
      </table>
      
      <div class="recommendations">
        <h2>Recommendations</h2>
        
        <h3 class="high-priority">High Priority</h3>
        <ul>
          ${highPriorityItems}
        </ul>
        
        <h3 class="medium-priority">Medium Priority</h3>
        <ul>
          ${mediumPriorityItems}
        </ul>
        
        <h3 class="low-priority">Low Priority</h3>
        <ul>
          ${lowPriorityItems}
        </ul>
      </div>
      
      <h2>Detailed Error Listing</h2>
      <div class="error-details">
        ${errorDetails}
      </div>
    </body>
    </html>
  `;
}

/**
 * Write report to file
 * @param {string} reportContent - The HTML report content
 */
function writeReport(reportContent) {
  fs.writeFileSync(REPORT_FILE, reportContent);
  console.log(chalk.green(`✅ TypeScript error report saved to: ${REPORT_FILE}`));
}

/**
 * Main function
 */
function main() {
  try {
    // Run TypeScript check
    const tscOutput = runTypeScriptCheck();
    
    // Parse errors
    const errors = parseErrors(tscOutput);
    
    if (errors.length === 0) {
      console.log(chalk.green('✅ No TypeScript errors found!'));
      
      // Generate empty report
      const emptyReport = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>TypeScript Error Analysis Report</title>
          <style>
            body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #0066cc; }
            .success { color: green; font-size: 1.2em; }
          </style>
        </head>
        <body>
          <h1>TypeScript Error Analysis Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <p class="success">✅ No TypeScript errors found! The codebase is clean.</p>
        </body>
        </html>
      `;
      
      writeReport(emptyReport);
      return;
    }
    
    console.log(chalk.yellow(`Found ${errors.length} TypeScript errors in ${Object.keys(groupErrorsByFile(errors)).length} files`));
    
    // Generate statistics
    const statistics = generateStatistics(errors);
    
    // Generate recommendations
    const recommendations = generateRecommendations(errors, statistics);
    
    // Generate report
    const reportContent = generateHTMLReport(errors, statistics, recommendations);
    
    // Write report to file
    writeReport(reportContent);
    
    // Print summary
    console.log('\nError Categories:');
    statistics.categories.forEach(category => {
      console.log(chalk.yellow(`- ${category.name}: ${category.count} (${category.percentage}%)`));
    });
    
    console.log('\nTop 3 problematic files:');
    statistics.topProblematicFiles.slice(0, 3).forEach(file => {
      console.log(chalk.yellow(`- ${file.filePath}: ${file.count} errors`));
    });
    
    console.log('\nHigh Priority Recommendations:');
    recommendations.highPriority.forEach(rec => {
      console.log(chalk.red(`- ${rec}`));
    });
    
    console.log(chalk.green('\nDone! View the full report for more details.'));
    
  } catch (error) {
    console.error(chalk.red('Error analyzing TypeScript errors:'), error);
    process.exit(1);
  }
}

// Run the analysis
main(); 