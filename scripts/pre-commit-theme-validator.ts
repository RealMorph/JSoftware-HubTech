#!/usr/bin/env ts-node

/**
 * Pre-commit Theme Validator
 * 
 * This script validates themes in files that are staged for commit.
 * It can be used as a Git pre-commit hook to ensure themes are valid.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { validateTheme } from '../src/core/theme/theme-validation';

// Configuration
const config = {
  exitOnError: process.env.THEME_VALIDATION_EXIT !== 'false', // Default to true
  showWarnings: process.env.THEME_VALIDATION_WARNINGS === 'true' // Default to false
};

console.log('🔍 Checking for theme objects in staged files...');

try {
  // Get list of staged files
  const stagedFilesOutput = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf8' });
  const stagedFiles = stagedFilesOutput.split('\n').filter(Boolean);
  
  // Filter to only include TypeScript/JavaScript files
  const tsFiles = stagedFiles.filter(file => /\.(ts|tsx|js|jsx)$/.test(file));
  
  if (tsFiles.length === 0) {
    console.log('✅ No TypeScript/JavaScript files staged for commit.');
    process.exit(0);
  }
  
  console.log(`Found ${tsFiles.length} TypeScript/JavaScript files staged for commit.`);
  
  let invalidThemes = 0;
  let allErrors: { file: string; theme: string; errors: string[] }[] = [];
  
  // Check each file for theme objects
  for (const file of tsFiles) {
    try {
      // Get file content
      const filePath = path.resolve(process.cwd(), file);
      if (!fs.existsSync(filePath)) {
        continue;
      }
      
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      // Look for theme object exports
      const themeRegex = /export\s+const\s+(\w+)(?::\s*ThemeConfig)?\s*=\s*({[\s\S]*?}(?:;|,\s*\/\/|\n\s*\/\/|\n\s*\/\*|$))/g;
      
      let match;
      while ((match = themeRegex.exec(fileContent)) !== null) {
        const themeName = match[1];
        
        // Skip if it doesn't look like a theme object
        if (!match[2].includes('colors') && !match[2].includes('typography')) {
          continue;
        }
        
        console.log(`Found theme '${themeName}' in ${file}`);
        
        // Create a temporary file to evaluate the theme object
        const tempFile = `
          const fs = require('fs');
          const path = require('path');

          try {
            // Load the file
            const themeModule = require('${filePath.replace(/\\/g, '\\\\')}');
            
            // Extract the theme object
            const themeObj = themeModule.${themeName};
            
            // Write the theme object to a JSON file
            fs.writeFileSync('temp-theme-precommit.json', JSON.stringify(themeObj, null, 2));
          } catch (error) {
            console.error('Error extracting theme:', error);
            process.exit(1);
          }
        `;
        
        // Write temporary file
        fs.writeFileSync('temp-theme-extractor.js', tempFile);
        
        try {
          // Execute the temporary file to extract the theme object
          execSync('node temp-theme-extractor.js', { stdio: 'ignore' });
          
          // Read the theme object from the JSON file
          const themeJson = JSON.parse(fs.readFileSync('temp-theme-precommit.json', 'utf8'));
          
          // Validate the theme
          const validationErrors = validateTheme(themeJson);
          
          if (validationErrors.length > 0) {
            invalidThemes++;
            
            allErrors.push({
              file,
              theme: themeName,
              errors: validationErrors
            });
            
            console.error(`❌ Theme '${themeName}' in ${file} has validation errors:`);
            validationErrors.forEach(error => {
              console.error(`   - ${error}`);
            });
          } else {
            console.log(`✅ Theme '${themeName}' in ${file} is valid.`);
          }
        } catch (error) {
          console.error(`❌ Error validating theme '${themeName}' in ${file}:`, error.message);
          invalidThemes++;
        } finally {
          // Clean up temporary files
          if (fs.existsSync('temp-theme-extractor.js')) {
            fs.unlinkSync('temp-theme-extractor.js');
          }
          if (fs.existsSync('temp-theme-precommit.json')) {
            fs.unlinkSync('temp-theme-precommit.json');
          }
        }
      }
    } catch (error) {
      console.error(`❌ Error processing file ${file}:`, error.message);
    }
  }
  
  // Output validation results
  if (invalidThemes > 0) {
    console.error(`\n❌ Found ${invalidThemes} invalid theme(s) in staged files.`);
    console.error('\nPlease fix the theme validation errors before committing.');
    console.error('You can use the theme migration script to help fix the issues:');
    console.error('\n  npm run theme:migrate -- <file-path>');
    console.error('\nOr see the documentation for more details:');
    console.error('  docs/theme-validation-guide.md');
    
    if (config.exitOnError) {
      process.exit(1);
    }
  } else {
    console.log('\n✅ All themes in staged files are valid!');
  }
} catch (error) {
  console.error('❌ Error running pre-commit validation:', error.message);
  
  if (config.exitOnError) {
    process.exit(1);
  }
} 