#!/usr/bin/env node

/**
 * Unused Code Detector
 * 
 * This script analyzes the project to detect unused code, including:
 * - Unused imports
 * - Unused components
 * - Unused functions
 * - Unused files
 * 
 * It integrates with Vite's build process to provide insights about unused code in your project.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Configuration
const config = {
  outputDir: path.resolve(__dirname, '../../dist'),
  outputFile: path.resolve(__dirname, '../../dist/unused-code-report.txt'),
  srcDir: path.resolve(__dirname, '../../src'),
  ignorePatterns: [
    '**/*.test.ts',
    '**/*.test.tsx',
    '**/*.spec.ts',
    '**/*.spec.tsx',
    '**/node_modules/**',
    '**/dist/**',
  ],
  eslintConfig: path.resolve(__dirname, '../../.eslintrc.js'),
};

/**
 * Run ESLint to detect unused imports and variables
 */
function detectUnusedImportsAndVariables() {
  console.log(chalk.blue('Detecting unused imports and variables...'));
  
  try {
    // Run ESLint with no-unused-vars and no-unused-imports rules
    const eslintCommand = `npx eslint "${config.srcDir}/**/*.{ts,tsx}" --no-eslintrc --config ${config.eslintConfig} --rule "no-unused-vars: error" --rule "import/no-unused-modules: error" --format json`;
    
    const result = execSync(eslintCommand, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    const eslintResults = JSON.parse(result);
    
    const unusedItems = [];
    
    eslintResults.forEach(file => {
      file.messages.forEach(message => {
        if (message.ruleId === 'no-unused-vars' || message.ruleId === 'import/no-unused-modules') {
          unusedItems.push({
            file: file.filePath,
            line: message.line,
            column: message.column,
            type: message.ruleId === 'no-unused-vars' ? 'Unused Variable' : 'Unused Import',
            message: message.message,
          });
        }
      });
    });
    
    return unusedItems;
  } catch (error) {
    console.error(chalk.red('Error detecting unused imports and variables:'), error.message);
    return [];
  }
}

/**
 * Detect unused components by analyzing imports across the codebase
 */
function detectUnusedComponents() {
  console.log(chalk.blue('Detecting unused components...'));
  
  try {
    // First, find all component definitions
    const componentFiles = findFiles(config.srcDir, ['**/*.tsx', '**/components/**/*.ts']);
    const components = [];
    
    componentFiles.forEach(filePath => {
      const content = fs.readFileSync(filePath, 'utf8');
      // Match component definitions - both function and class components
      const componentMatches = content.match(/export\s+(default\s+)?((function|class)\s+(\w+)|const\s+(\w+)\s*=\s*(React\.)?memo\()/g) || [];
      
      componentMatches.forEach(match => {
        const componentName = match.match(/\b\w+$/)[0];
        components.push({
          name: componentName,
          file: filePath,
        });
      });
    });
    
    // Then, check which components are imported
    const allFiles = findFiles(config.srcDir, ['**/*.ts', '**/*.tsx']);
    const importedComponents = new Set();
    
    allFiles.forEach(filePath => {
      const content = fs.readFileSync(filePath, 'utf8');
      components.forEach(component => {
        const regex = new RegExp(`import[^;]*\\b${component.name}\\b|\\bconst\\s+[^=]*=\\s*[^;]*\\b${component.name}\\b`, 'g');
        if (regex.test(content) && filePath !== component.file) {
          importedComponents.add(component.name);
        }
      });
    });
    
    // Find components that are not imported
    const unusedComponents = components.filter(component => !importedComponents.has(component.name));
    
    return unusedComponents.map(component => ({
      file: component.file,
      type: 'Unused Component',
      message: `Component '${component.name}' is not used in other files`,
    }));
  } catch (error) {
    console.error(chalk.red('Error detecting unused components:'), error.message);
    return [];
  }
}

/**
 * Detect potentially unused files
 */
function detectUnusedFiles() {
  console.log(chalk.blue('Detecting potentially unused files...'));
  
  try {
    // Get all project files
    const allFiles = findFiles(config.srcDir, ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx']);
    
    // Find files that are not imported anywhere
    const unusedFiles = [];
    
    allFiles.forEach(filePath => {
      const fileName = path.basename(filePath);
      const fileNameWithoutExt = fileName.split('.').slice(0, -1).join('.');
      
      // Skip index files, type definitions, and test files
      if (
        fileName === 'index.ts' || 
        fileName === 'index.tsx' || 
        fileName === 'types.ts' || 
        fileName.includes('.test.') || 
        fileName.includes('.spec.')
      ) {
        return;
      }
      
      // Check if this file is imported somewhere
      let isImported = false;
      
      for (const otherFile of allFiles) {
        if (otherFile === filePath) continue;
        
        const content = fs.readFileSync(otherFile, 'utf8');
        const relativeImport = path.relative(path.dirname(otherFile), filePath);
        const normalizedRelativeImport = relativeImport.startsWith('.') ? relativeImport : './' + relativeImport;
        
        // Check for various import patterns
        if (
          content.includes(`import`) && (
            content.includes(`'${fileNameWithoutExt}'`) || 
            content.includes(`"${fileNameWithoutExt}"`) ||
            content.includes(`'${normalizedRelativeImport.replace(/\.(t|j)sx?$/, '')}'`) ||
            content.includes(`"${normalizedRelativeImport.replace(/\.(t|j)sx?$/, '')}"`)
          )
        ) {
          isImported = true;
          break;
        }
      }
      
      if (!isImported) {
        unusedFiles.push({
          file: filePath,
          type: 'Potentially Unused File',
          message: `File '${fileName}' is not imported in any other file`,
        });
      }
    });
    
    return unusedFiles;
  } catch (error) {
    console.error(chalk.red('Error detecting unused files:'), error.message);
    return [];
  }
}

/**
 * Helper function to find files matching patterns
 */
function findFiles(dir, patterns) {
  const command = `npx glob "${patterns.join('" "')}" --cwd "${dir}" --absolute`;
  try {
    const result = execSync(command, { encoding: 'utf8' });
    return result.trim().split('\n').filter(Boolean);
  } catch (error) {
    console.error(chalk.red('Error finding files:'), error.message);
    return [];
  }
}

/**
 * Generate the report
 */
function generateReport() {
  console.log(chalk.blue('Generating unused code report...'));
  
  // Run analyses
  const unusedImportsAndVars = detectUnusedImportsAndVariables();
  const unusedComponents = detectUnusedComponents();
  const unusedFiles = detectUnusedFiles();
  
  // Combine results
  const allUnusedItems = [
    ...unusedImportsAndVars,
    ...unusedComponents,
    ...unusedFiles,
  ];
  
  // Group by file
  const unusedByFile = {};
  allUnusedItems.forEach(item => {
    if (!unusedByFile[item.file]) {
      unusedByFile[item.file] = [];
    }
    unusedByFile[item.file].push(item);
  });
  
  // Generate report
  let report = 'UNUSED CODE REPORT\n';
  report += '=================\n\n';
  
  report += `Total Issues Found: ${allUnusedItems.length}\n`;
  report += `- Unused Imports/Variables: ${unusedImportsAndVars.length}\n`;
  report += `- Unused Components: ${unusedComponents.length}\n`;
  report += `- Potentially Unused Files: ${unusedFiles.length}\n\n`;
  
  // Details by file
  report += 'DETAILS BY FILE\n';
  report += '==============\n\n';
  
  Object.entries(unusedByFile).forEach(([file, items]) => {
    const relativePath = path.relative(path.resolve(__dirname, '../..'), file);
    report += `${relativePath}:\n`;
    
    items.forEach(item => {
      if (item.line && item.column) {
        report += `- [Line ${item.line}:${item.column}] ${item.type}: ${item.message}\n`;
      } else {
        report += `- ${item.type}: ${item.message}\n`;
      }
    });
    
    report += '\n';
  });
  
  // Recommendations
  report += 'RECOMMENDATIONS\n';
  report += '==============\n\n';
  
  if (allUnusedItems.length > 0) {
    report += '1. Analyze usage of imports, components, and files to eliminate dead code\n';
    report += '2. Consider implementing tree shaking if not already done\n';
    report += '3. Review your entry points and ensure all components are properly used\n';
  } else {
    report += 'No unused code detected. Good job keeping the codebase clean!\n';
  }
  
  // Write report to file
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }
  
  fs.writeFileSync(config.outputFile, report);
  console.log(chalk.green(`Unused code report generated: ${config.outputFile}`));
  
  // Print summary to console
  console.log(chalk.cyan('\nUnused Code Summary:'));
  console.log(`- Total Issues: ${allUnusedItems.length}`);
  console.log(`- Unused Imports/Variables: ${unusedImportsAndVars.length}`);
  console.log(`- Unused Components: ${unusedComponents.length}`);
  console.log(`- Potentially Unused Files: ${unusedFiles.length}`);
}

// Run the analysis
generateReport(); 