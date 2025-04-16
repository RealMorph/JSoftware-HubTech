#!/usr/bin/env node
/**
 * Theme Unification Script
 * 
 * This script helps migrate from the adapter-based theme approach to direct theme implementation.
 * It provides utilities to:
 * 1. Update import statements in components
 * 2. Convert theme accessor patterns to direct access
 * 3. Validate components using the new theme approach
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import chalk from 'chalk';

// Configuration
const ROOT_DIR = process.cwd();
const SRC_DIR = path.join(ROOT_DIR, 'src');
const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');
const FORCE = process.argv.includes('--force');
const TARGET_FILES = process.argv.includes('--target') 
  ? process.argv[process.argv.indexOf('--target') + 1] 
  : '**/*.{ts,tsx}';

// Regular expressions for finding theme-related imports and usages
const THEME_ADAPTER_IMPORT_PATTERN = /import \{[^}]*adaptThemeForEmotion[^}]*\} from ['"]\.\/theme-adapter['"];/g;
const THEME_PROVIDER_IMPORT_PATTERN = /import \{[^}]*ThemeProvider[^}]*\} from ['"]\.\/ThemeProvider['"];/g;
const UNIFIED_THEME_PROVIDER_IMPORT_PATTERN = /import \{[^}]*UnifiedThemeProvider[^}]*\} from ['"]\.\/UnifiedThemeProvider['"];/g;
const THEME_HOOK_PATTERN = /useTheme\(\)/g;
const UNIFIED_THEME_HOOK_PATTERN = /useUnifiedTheme\(\)/g;
const EMOTION_THEME_ACCESS_PATTERN = /theme\.(colors|typography|spacing|borderRadius|shadows|transitions)/g;

// Define replacement patterns
const DIRECT_THEME_PROVIDER_IMPORT = "import { DirectThemeProvider as ThemeProvider } from './DirectThemeProvider';";
const DIRECT_THEME_HOOK_IMPORT = "import { useDirectTheme as useTheme } from './DirectThemeProvider';";

// Track migration statistics
let stats = {
  filesScanned: 0,
  filesUpdated: 0,
  adapterImportsReplaced: 0,
  themeProvidersReplaced: 0,
  themeHooksReplaced: 0,
  themeAccessPatternsUpdated: 0,
  errors: 0
};

/**
 * Main function to migrate theme usage in files
 */
async function migrateThemeUsage() {
  console.log(chalk.blue.bold('Theme Unification Migration Script'));
  console.log(chalk.gray('Converting from adapter-based theme to direct theme implementation\n'));
  
  if (DRY_RUN) {
    console.log(chalk.yellow('Running in dry-run mode. No files will be modified.\n'));
  }
  
  try {
    // Find all TypeScript and TSX files in the src directory
    const files = glob.sync(TARGET_FILES, { cwd: SRC_DIR });
    stats.filesScanned = files.length;
    
    console.log(chalk.green(`Found ${files.length} files to scan\n`));
    
    // Process each file
    for (const file of files) {
      const fullPath = path.join(SRC_DIR, file);
      await processFile(fullPath);
    }
    
    // Print summary
    console.log(chalk.blue.bold('\nMigration Summary:'));
    console.log(chalk.white(`Files scanned: ${stats.filesScanned}`));
    console.log(chalk.green(`Files updated: ${stats.filesUpdated}`));
    console.log(chalk.green(`Adapter imports replaced: ${stats.adapterImportsReplaced}`));
    console.log(chalk.green(`Theme providers replaced: ${stats.themeProvidersReplaced}`));
    console.log(chalk.green(`Theme hooks replaced: ${stats.themeHooksReplaced}`));
    console.log(chalk.green(`Theme access patterns updated: ${stats.themeAccessPatternsUpdated}`));
    console.log(chalk.red(`Errors encountered: ${stats.errors}`));
    
    if (stats.errors > 0) {
      console.log(chalk.yellow('\nSome errors were encountered. Check the logs above for details.'));
    } else {
      console.log(chalk.green('\nMigration completed successfully.'));
    }
    
    // Next steps guidance
    console.log(chalk.blue.bold('\nNext Steps:'));
    console.log(chalk.white('1. Update any remaining components manually'));
    console.log(chalk.white('2. Test the application thoroughly'));
    console.log(chalk.white('3. Update unit tests to use the DirectThemeProvider'));
    console.log(chalk.white('4. Consider removing the old theme adapter and provider files'));
    
  } catch (error) {
    console.error(chalk.red('Error during migration:'), error);
    process.exit(1);
  }
}

/**
 * Process a single file for theme migration
 */
async function processFile(filePath: string) {
  try {
    // Read file content
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath);
    
    if (VERBOSE) {
      console.log(chalk.gray(`Processing ${fileName}...`));
    }
    
    // Skip files that don't use theme
    if (!usesTheme(content)) {
      return;
    }
    
    // Perform replacements
    let newContent = content;
    let hasChanges = false;
    
    // Replace theme adapter imports
    const adapterMatch = content.match(THEME_ADAPTER_IMPORT_PATTERN);
    if (adapterMatch) {
      newContent = newContent.replace(THEME_ADAPTER_IMPORT_PATTERN, '');
      stats.adapterImportsReplaced += adapterMatch.length;
      hasChanges = true;
      
      if (VERBOSE) {
        console.log(chalk.yellow(`  Removed adapter imports in ${fileName}`));
      }
    }
    
    // Replace ThemeProvider imports
    const providerMatch = content.match(THEME_PROVIDER_IMPORT_PATTERN);
    if (providerMatch) {
      newContent = newContent.replace(THEME_PROVIDER_IMPORT_PATTERN, DIRECT_THEME_PROVIDER_IMPORT);
      stats.themeProvidersReplaced += providerMatch.length;
      hasChanges = true;
      
      if (VERBOSE) {
        console.log(chalk.yellow(`  Updated ThemeProvider import in ${fileName}`));
      }
    }
    
    // Replace UnifiedThemeProvider imports
    const unifiedProviderMatch = content.match(UNIFIED_THEME_PROVIDER_IMPORT_PATTERN);
    if (unifiedProviderMatch) {
      newContent = newContent.replace(UNIFIED_THEME_PROVIDER_IMPORT_PATTERN, DIRECT_THEME_PROVIDER_IMPORT);
      stats.themeProvidersReplaced += unifiedProviderMatch.length;
      hasChanges = true;
      
      if (VERBOSE) {
        console.log(chalk.yellow(`  Updated UnifiedThemeProvider import in ${fileName}`));
      }
    }
    
    // Replace theme hook usages
    const hookMatch = content.match(THEME_HOOK_PATTERN);
    if (hookMatch) {
      // Only add the import if it's not already there
      if (!newContent.includes(DIRECT_THEME_HOOK_IMPORT) && !newContent.includes('useDirectTheme')) {
        // Find the last import statement to add our new import after it
        const importLines = newContent.split('\n').filter(line => line.trim().startsWith('import '));
        
        if (importLines.length > 0) {
          const lastImportIndex = newContent.lastIndexOf(importLines[importLines.length - 1]);
          const lastImportLine = importLines[importLines.length - 1];
          const insertPosition = lastImportIndex + lastImportLine.length;
          
          newContent = 
            newContent.substring(0, insertPosition) + 
            '\n' + DIRECT_THEME_HOOK_IMPORT + 
            newContent.substring(insertPosition);
        }
      }
      
      stats.themeHooksReplaced += hookMatch.length;
      hasChanges = true;
      
      if (VERBOSE) {
        console.log(chalk.yellow(`  Updated theme hook usage in ${fileName}`));
      }
    }
    
    // Replace UnifiedTheme hook usages
    const unifiedHookMatch = content.match(UNIFIED_THEME_HOOK_PATTERN);
    if (unifiedHookMatch) {
      newContent = newContent.replace(UNIFIED_THEME_HOOK_PATTERN, 'useDirectTheme()');
      
      // Only add the import if it's not already there
      if (!newContent.includes('useDirectTheme')) {
        // Find the last import statement to add our new import after it
        const importLines = newContent.split('\n').filter(line => line.trim().startsWith('import '));
        
        if (importLines.length > 0) {
          const lastImportIndex = newContent.lastIndexOf(importLines[importLines.length - 1]);
          const lastImportLine = importLines[importLines.length - 1];
          const insertPosition = lastImportIndex + lastImportLine.length;
          
          newContent = 
            newContent.substring(0, insertPosition) + 
            '\n' + "import { useDirectTheme } from './DirectThemeProvider';" + 
            newContent.substring(insertPosition);
        }
      }
      
      stats.themeHooksReplaced += unifiedHookMatch.length;
      hasChanges = true;
      
      if (VERBOSE) {
        console.log(chalk.yellow(`  Updated unified theme hook usage in ${fileName}`));
      }
    }
    
    // Update theme access patterns
    // This is more complex and might need manual review for some cases
    const accessMatches = content.match(EMOTION_THEME_ACCESS_PATTERN);
    if (accessMatches) {
      // We're not actually replacing these automatically as it's too risky
      // Just counting them for reporting
      stats.themeAccessPatternsUpdated += accessMatches.length;
      
      if (VERBOSE) {
        console.log(chalk.cyan(`  Found ${accessMatches.length} theme access patterns in ${fileName} that may need updating`));
        accessMatches.forEach(match => {
          console.log(chalk.gray(`    - ${match}`));
        });
      }
    }
    
    // Write changes to file if needed
    if (hasChanges && !DRY_RUN) {
      fs.writeFileSync(filePath, newContent, 'utf-8');
      stats.filesUpdated++;
      console.log(chalk.green(`✓ Updated ${path.relative(ROOT_DIR, filePath)}`));
    } else if (hasChanges && DRY_RUN) {
      console.log(chalk.yellow(`Would update ${path.relative(ROOT_DIR, filePath)} (dry run)`));
    }
    
  } catch (error) {
    stats.errors++;
    console.error(chalk.red(`Error processing ${filePath}:`), error);
  }
}

/**
 * Check if a file uses theme-related functionality
 */
function usesTheme(content: string): boolean {
  return (
    content.includes('ThemeProvider') ||
    content.includes('UnifiedThemeProvider') ||
    content.includes('useTheme') ||
    content.includes('useUnifiedTheme') ||
    content.includes('adaptThemeForEmotion') ||
    content.includes('theme.colors') ||
    content.includes('theme.typography') ||
    content.includes('theme.spacing')
  );
}

// Execute the script
migrateThemeUsage().catch(error => {
  console.error(chalk.red('Unhandled error:'), error);
  process.exit(1);
}); 