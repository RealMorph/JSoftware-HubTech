#!/usr/bin/env node

/**
 * Theme Verification Script
 * 
 * This script is used to verify theme configurations against expected structure
 * and check for common theme-related issues.
 * 
 * Usage:
 *   node verify-theme.js [--theme=<theme-name>] [--all] [--json] [--silent]
 * 
 * Options:
 *   --theme=<theme-name>  Verify a specific theme (default, dark, etc.)
 *   --all                 Verify all available themes
 *   --json                Output results in JSON format
 *   --silent              Don't output to console (useful with --json)
 */

const fs = require('fs');
const path = require('path');
const { ThemeVerifier } = require('../src/utils/theme-verification');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  theme: null,
  all: false,
  json: false,
  silent: false
};

args.forEach(arg => {
  if (arg.startsWith('--theme=')) {
    options.theme = arg.split('=')[1];
  } else if (arg === '--all') {
    options.all = true;
  } else if (arg === '--json') {
    options.json = true;
  } else if (arg === '--silent') {
    options.silent = true;
  }
});

// Define paths to theme files
const themeDir = path.join(__dirname, '../src/core/theme');
const themeDefaultsPath = path.join(themeDir, 'theme-defaults.ts');

// Function to log messages
const log = (message, type = 'log') => {
  if (!options.silent) {
    console[type](message);
  }
};

// Function to extract theme configurations from a file
const extractThemeConfigs = (filePath) => {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // This is a simple extraction method and might need adjustment
    // for complex theme files with imports, etc.
    const themeConfigRegex = /export\s+const\s+(\w+)Theme\s*=\s*({[\s\S]*?}\s*);/g;
    
    const themes = {};
    let match;
    
    while ((match = themeConfigRegex.exec(fileContent)) !== null) {
      try {
        // Dangerous but simple for demo - in production use a proper TS/JS parser
        // or export themes as JSON for verification
        const themeName = match[1].toLowerCase();
        const themeString = match[2]
          .replace(/\/\/.*$/gm, '') // Remove comments
          .replace(/,\s*}/g, '}')   // Fix trailing commas
          .replace(/(\w+):/g, '"$1":') // Make keys JSON-compatible
          .replace(/(['"])([^'"]*)\1/g, (m, q, content) => {
            return `"${content}"`;  // Normalize quotes
          });
        
        // Eval is risky but used here for simplicity
        // eslint-disable-next-line no-eval
        themes[themeName] = eval(`(${themeString})`);
      } catch (evalError) {
        log(`Error parsing theme from ${filePath}: ${evalError.message}`, 'error');
      }
    }
    
    return themes;
  } catch (error) {
    log(`Error reading theme file ${filePath}: ${error.message}`, 'error');
    return {};
  }
};

// Main verification function
const verifyThemes = () => {
  log('\n🔍 Theme Verification Script\n');
  
  // Extract themes
  const themes = extractThemeConfigs(themeDefaultsPath);
  const themeNames = Object.keys(themes);
  
  if (themeNames.length === 0) {
    log('❌ No themes found in the theme files.', 'error');
    process.exit(1);
  }
  
  log(`Found ${themeNames.length} themes: ${themeNames.join(', ')}\n`);
  
  // Determine which themes to verify
  let themesToVerify = [];
  
  if (options.all) {
    themesToVerify = themeNames;
  } else if (options.theme) {
    if (themes[options.theme.toLowerCase()]) {
      themesToVerify = [options.theme.toLowerCase()];
    } else {
      log(`❌ Theme "${options.theme}" not found.`, 'error');
      log(`Available themes: ${themeNames.join(', ')}`);
      process.exit(1);
    }
  } else {
    // Default to verifying all themes
    themesToVerify = themeNames;
  }
  
  // Create the verifier
  const verifier = new ThemeVerifier({
    logResults: !options.json && !options.silent,
    throwOnError: false
  });
  
  // Verify each theme
  const results = {};
  let allPassed = true;
  
  themesToVerify.forEach(themeName => {
    log(`\n🔍 Verifying theme: ${themeName}`);
    
    // Verify the theme
    const themeResult = verifier.verify(themes[themeName]);
    results[themeName] = themeResult;
    
    if (!themeResult.passed) {
      allPassed = false;
    }
    
    if (!options.json && !options.silent) {
      const status = themeResult.passed ? '✅ PASSED' : '❌ FAILED';
      log(`\nTheme "${themeName}" verification: ${status}`);
      
      if (themeResult.errors.length > 0) {
        log(`\nErrors (${themeResult.errors.length}):`, 'error');
        themeResult.errors.forEach(error => {
          log(`  [${error.type}] ${error.message}`, 'error');
        });
      }
      
      if (themeResult.warnings.length > 0) {
        log(`\nWarnings (${themeResult.warnings.length}):`, 'warn');
        themeResult.warnings.forEach(warning => {
          log(`  [${warning.type}] ${warning.message}`, 'warn');
        });
      }
      
      if (themeResult.missingProperties.length > 0) {
        log(`\nMissing Properties (${themeResult.missingProperties.length}):`, 'error');
        themeResult.missingProperties.forEach(prop => {
          log(`  ${prop}`, 'error');
        });
      }
      
      if (themeResult.invalidValues.length > 0) {
        log(`\nInvalid Values (${themeResult.invalidValues.length}):`, 'error');
        themeResult.invalidValues.forEach(item => {
          log(`  ${item.path}: "${item.value}" (Expected: ${item.expected})`, 'error');
        });
      }
    }
  });
  
  // Output final results
  if (options.json) {
    // Output results as JSON
    console.log(JSON.stringify(results, null, 2));
  } else if (!options.silent) {
    log('\n==================================================');
    log(`🏁 Final Result: ${allPassed ? '✅ ALL THEMES PASSED' : '❌ SOME THEMES FAILED'}`);
    log('==================================================\n');
  }
  
  // Return exit code based on results
  process.exit(allPassed ? 0 : 1);
};

// Run the verification
verifyThemes(); 