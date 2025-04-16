#!/usr/bin/env node

/**
 * Theme Validation Script
 * 
 * This script validates theme objects against the ThemeConfig interface
 * to ensure they conform to expected structures before deployment.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');
const minimist = require('minimist');
const { execSync } = require('child_process');

// Parse command line arguments
const argv = minimist(process.argv.slice(2), {
  boolean: ['strict', 'verbose', 'fix'],
  string: ['format', 'pattern', 'ignore'],
  default: {
    strict: false,
    verbose: false,
    fix: false,
    format: 'console',
    pattern: 'src/**/*.{ts,tsx}',
    ignore: 'node_modules,**/*.d.ts,**/*.test.{ts,tsx}'
  }
});

// Configuration
const config = {
  strict: argv.strict,
  verbose: argv.verbose,
  fix: argv.fix,
  format: argv.format,
  pattern: argv.pattern,
  ignore: argv.ignore ? argv.ignore.split(',') : []
};

// Counters for reporting
let totalThemes = 0;
let validThemes = 0;
let invalidThemes = 0;
let errors = [];
let warnings = [];

// Main validation function
async function validateThemes() {
  console.log(chalk.blue('🔍 Starting theme validation...'));
  
  try {
    // Check if ts-node is installed for running the validator
    try {
      execSync('npx ts-node --version', { stdio: 'ignore' });
    } catch (e) {
      console.error(chalk.red('❌ ts-node is required but not installed. Please install it with: npm install -D ts-node'));
      process.exit(1);
    }
    
    // Dynamically generate a temporary script to run the validator using ts-node
    const validateScriptPath = path.resolve(process.cwd(), 'temp-validate-script.js');
    const tsValidatorPath = path.resolve(process.cwd(), 'src/core/theme/theme-utils.ts');
    
    if (!fs.existsSync(tsValidatorPath)) {
      console.error(chalk.red(`❌ Theme validator not found at: ${tsValidatorPath}`));
      process.exit(1);
    }
    
    // Create a temporary script that imports and exposes the validator
    const tempScriptContent = `
      // This is a temporary script to import the TypeScript validator and expose it to Node.js
      const path = require('path');
      
      // We need to register ts-node to handle TypeScript files
      require('ts-node').register({
        transpileOnly: true,
        compilerOptions: {
          module: 'commonjs',
          target: 'es2018',
          esModuleInterop: true
        }
      });
      
      // Import the validator
      const { validateTheme, isValidTheme } = require('${tsValidatorPath.replace(/\\/g, '\\\\')}');
      
      // Export the validators as methods that can be called from this script
      module.exports = {
        validateTheme: (theme) => {
          try {
            return validateTheme(theme);
          } catch (error) {
            return [error.message];
          }
        },
        isValidTheme: (theme) => {
          try {
            return isValidTheme(theme);
          } catch (error) {
            return false;
          }
        }
      };
    `;
    
    fs.writeFileSync(validateScriptPath, tempScriptContent, 'utf8');
    
    // Require the temporary validator script
    let validator;
    try {
      validator = require(validateScriptPath);
    } catch (error) {
      console.error(chalk.red(`❌ Failed to load theme validator: ${error.message}`));
      console.error(error.stack);
      fs.unlinkSync(validateScriptPath);
      process.exit(1);
    }
    
    // Find all files matching the pattern
    const files = glob.sync(config.pattern, {
      ignore: config.ignore
    });
    
    console.log(chalk.green(`📁 Found ${files.length} files to scan for theme objects`));
    
    // Process each file
    for (const file of files) {
      if (config.verbose) {
        console.log(chalk.gray(`📄 Processing ${file}...`));
      }
      
      const content = fs.readFileSync(file, 'utf8');
      const themes = extractThemesFromFile(content, file);
      
      if (themes.length > 0) {
        totalThemes += themes.length;
        
        if (config.verbose) {
          console.log(chalk.cyan(`🎨 Found ${themes.length} potential theme objects in ${file}`));
        }
        
        for (const theme of themes) {
          validateThemeObject(theme, file, validator);
        }
      }
    }
    
    // Clean up the temporary script
    fs.unlinkSync(validateScriptPath);
    
    // Output results
    outputResults();
    
    // Return exit code based on validation results
    return invalidThemes > 0 ? 1 : 0;
  } catch (error) {
    console.error(chalk.red(`❌ Error during validation: ${error.message}`));
    console.error(error.stack);
    return 1;
  }
}

// Extract potential theme objects from file content
function extractThemesFromFile(content, file) {
  const themes = [];
  
  // Advanced regex that can handle more complex theme object declarations
  // Matches theme objects with TypeScript types and multiline definitions
  const themeRegex = /(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*(?::\s*ThemeConfig)?\s*=\s*({[\s\S]*?}(?:;|,\s*\/\/|\n\s*\/\/|\n\s*\/\*|$))/g;
  
  let match;
  while ((match = themeRegex.exec(content)) !== null) {
    const themeName = match[1];
    const themeContent = match[2];

    // Skip if it doesn't look like a theme object
    if (!themeContent.includes('colors') && !themeContent.includes('typography')) {
      continue;
    }
    
    // Extract the theme object and convert to a real JavaScript object
    let themeObject;
    try {
      // Clean up the theme content - replace anything that would cause eval to fail
      let cleanThemeContent = themeContent
        .replace(/\/\/.*$/gm, '') // Remove single-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
        .replace(/,\s*(?=})/g, '') // Remove trailing commas
        .replace(/(\w+):/g, '"$1":') // Convert property names to strings
        .replace(/\${[^}]*}/g, '"TEMPLATE_LITERAL"') // Replace template literals
        .replace(/`[^`]*`/g, '"TEMPLATE_STRING"') // Replace template strings
        .replace(/(\w+)\(\)/g, '"FUNCTION_CALL"') // Replace function calls
        .replace(/\.\.\.[^,}\s]+/g, '"SPREAD_OPERATOR": {}'); // Replace spread operators
      
      // Wrap in braces if not already a complete object
      if (!cleanThemeContent.trim().startsWith('{')) {
        cleanThemeContent = `{${cleanThemeContent}}`;
      }
      
      // Advanced approach - instead of eval, we could use a more robust parser
      // For a production script, consider using a dedicated parser like `acorn` or `esprima`
      // This is a simplified approach for demonstration
      
      // Attempt to parse the object using JSON.parse with some preprocessing
      try {
        themeObject = JSON.parse(cleanThemeContent);
      } catch (e) {
        // Fallback: if the JSON.parse fails, we can make a simpler object with just key existence
        themeObject = {
          __parsing_failed: true,
          id: themeName,
          has_colors: themeContent.includes('colors'),
          has_typography: themeContent.includes('typography'),
          has_spacing: themeContent.includes('spacing'),
          has_shadows: themeContent.includes('shadows'),
          has_transitions: themeContent.includes('transitions')
        };
        
        if (config.verbose) {
          console.log(chalk.yellow(`⚠️ Couldn't fully parse theme object ${themeName} in ${file}. Using property detection fallback.`));
        }
      }
    } catch (error) {
      if (config.verbose) {
        console.log(chalk.yellow(`⚠️ Couldn't evaluate theme object ${themeName} in ${file}: ${error.message}`));
      }
      
      // Create a minimal representation for validation
      themeObject = {
        __parsing_failed: true,
        id: themeName
      };
    }
    
    themes.push({
      name: themeName,
      content: themeContent,
      object: themeObject,
      file: file,
    });
  }
  
  return themes;
}

// Validate a theme against expected structure using the actual validator
function validateThemeObject(theme, file, validator) {
  try {
    // Use the actual theme validator
    const validationErrors = validator.validateTheme(theme.object);
    const isValid = validationErrors.length === 0;
    
    if (!isValid) {
      invalidThemes++;
      
      const error = {
        file: theme.file,
        theme: theme.name,
        errors: validationErrors
      };
      
      errors.push(error);
      
      if (config.format === 'console') {
        console.error(chalk.red(`❌ Invalid theme '${theme.name}' in ${theme.file}:`));
        validationErrors.forEach(err => {
          console.error(chalk.red(`   - ${err}`));
        });
      }
    } else {
      validThemes++;
      
      if (config.verbose && config.format === 'console') {
        console.log(chalk.green(`✅ Valid theme '${theme.name}' in ${theme.file}`));
      }
    }
  } catch (error) {
    invalidThemes++;
    const errorMessage = error.message || 'Unknown validation error';
    
    errors.push({
      file: theme.file,
      theme: theme.name,
      errors: [errorMessage]
    });
    
    if (config.format === 'console') {
      console.error(chalk.red(`❌ Error validating theme '${theme.name}' in ${theme.file}: ${errorMessage}`));
    }
  }
}

// Output validation results
function outputResults() {
  if (config.format === 'console') {
    console.log(chalk.blue('\n📊 Theme Validation Results:'));
    console.log(chalk.white(`Total themes found: ${totalThemes}`));
    console.log(chalk.green(`Valid themes: ${validThemes}`));
    
    if (invalidThemes > 0) {
      console.log(chalk.red(`Invalid themes: ${invalidThemes}`));
      
      console.log(chalk.yellow('\n🔍 Validation Errors:'));
      errors.forEach((error, index) => {
        console.log(chalk.red(`\n  ${index + 1}. ${error.file} (${error.theme}):`));
        error.errors.forEach(err => {
          console.log(chalk.red(`     - ${err}`));
        });
      });
      
      console.log(chalk.yellow('\n💡 To fix these issues:'));
      console.log(chalk.white('  1. Ensure all required theme properties are defined'));
      console.log(chalk.white('  2. Check that color scales include all required values'));
      console.log(chalk.white('  3. Verify typography settings have all required properties'));
      console.log(chalk.white('  4. Add any missing spacing, shadow, or transition values'));
      console.log(chalk.white('  5. Run with --fix flag to attempt automatic fixes (experimental)'));
    } else {
      console.log(chalk.green('\n✅ All themes are valid!'));
    }
  } else if (config.format === 'github') {
    // GitHub Actions format
    if (invalidThemes > 0) {
      console.log(`::set-output name=error_count::${invalidThemes}`);
      
      errors.forEach(error => {
        const file = error.file.replace(process.cwd(), '');
        console.log(`::error file=${file},title=Theme Validation Error::${error.theme}: ${error.message}`);
      });
    } else {
      console.log('::set-output name=error_count::0');
    }
  } else if (config.format === 'json') {
    // JSON format for machine-readable output
    const result = {
      summary: {
        total: totalThemes,
        valid: validThemes,
        invalid: invalidThemes
      },
      errors: errors,
      warnings: warnings
    };
    
    console.log(JSON.stringify(result, null, 2));
  }
}

// Run validation if script is executed directly
if (require.main === module) {
  validateThemes().then(exitCode => {
    process.exit(exitCode);
  });
}

module.exports = {
  validateThemes
}; 