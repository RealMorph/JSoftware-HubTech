#!/usr/bin/env ts-node

/**
 * Migrate All Themes Script
 * 
 * This script scans the codebase for theme files and migrates them all to the new ThemeConfig format.
 * Usage: npm run theme:migrate:all -- [--output-dir=<dir>] [--no-defaults] [--force]
 */

import fs from 'fs';
import path from 'path';
import glob from 'glob';
import { execSync } from 'child_process';

// Parse command line arguments
const args = process.argv.slice(2);
const outputDirArg = args.find(arg => arg.startsWith('--output-dir='));
const outputDir = outputDirArg ? outputDirArg.split('=')[1] : 'migrated-themes';
const dryRun = args.includes('--dry-run');
const noDefaults = args.includes('--no-defaults');
const force = args.includes('--force');
const verbose = args.includes('--verbose');

console.log('🔍 Scanning for theme files...');

// Create output directory if it doesn't exist and not in dry run mode
if (!dryRun && !fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Find all potential theme files
const themeFiles = glob.sync('src/**/*theme*.{ts,tsx,js,jsx}', {
  ignore: ['**/node_modules/**', '**/*.test.{ts,tsx,js,jsx}', '**/*.d.ts']
});

console.log(`Found ${themeFiles.length} potential theme files.`);

// Track migration results
const migrationResults = {
  total: themeFiles.length,
  success: 0,
  failed: 0,
  skipped: 0,
  results: []
};

// Process each theme file
themeFiles.forEach((file, index) => {
  console.log(`\n[${index + 1}/${themeFiles.length}] Processing ${file}...`);
  
  try {
    // Check if file contains a theme export
    const fileContent = fs.readFileSync(file, 'utf8');
    
    // Simple check for theme object export
    const themeMatch = fileContent.match(/export\s+const\s+(\w+)(?::\s*ThemeConfig)?\s*=/);
    
    if (!themeMatch) {
      console.log(`⏭️ Skipping ${file} - no theme export found.`);
      migrationResults.skipped++;
      migrationResults.results.push({ file, status: 'skipped', reason: 'No theme export found' });
      return;
    }
    
    const themeName = themeMatch[1];
    
    // Check if it has any theme-related properties
    const hasThemeProperties = [
      'colors',
      'typography',
      'spacing',
      'shadows',
      'borderRadius'
    ].some(prop => fileContent.includes(`${prop}:`));
    
    if (!hasThemeProperties) {
      console.log(`⏭️ Skipping ${file} - doesn't look like a theme object.`);
      migrationResults.skipped++;
      migrationResults.results.push({ file, status: 'skipped', reason: 'Not a theme object' });
      return;
    }
    
    if (dryRun) {
      console.log(`🔍 Would migrate theme '${themeName}' in ${file}`);
      migrationResults.success++;
      migrationResults.results.push({ file, status: 'would_migrate', themeName });
      return;
    }
    
    // Determine output path
    const relativePath = path.relative(process.cwd(), file);
    const fileBasename = path.basename(file);
    const outputPath = path.join(outputDir, fileBasename.replace(/\.\w+$/, '.migrated$&'));
    
    // Build migration command
    const migrateCmd = [
      'ts-node',
      'scripts/migrate-theme.ts',
      file,
      `--output=${outputPath}`,
      noDefaults ? '--no-defaults' : '',
      force ? '--force' : '',
      verbose ? '--verbose' : ''
    ].filter(Boolean).join(' ');
    
    if (verbose) {
      console.log(`Executing: ${migrateCmd}`);
    }
    
    // Execute migration
    execSync(migrateCmd, { stdio: 'inherit' });
    
    migrationResults.success++;
    migrationResults.results.push({ file, status: 'success', outputPath });
  } catch (error) {
    console.error(`❌ Failed to migrate ${file}: ${error.message}`);
    
    migrationResults.failed++;
    migrationResults.results.push({ file, status: 'failed', error: error.message });
  }
});

// Print summary
console.log('\n📊 Migration Summary:');
console.log(`Total theme files found: ${migrationResults.total}`);
console.log(`Successfully migrated: ${migrationResults.success}`);
console.log(`Failed: ${migrationResults.failed}`);
console.log(`Skipped: ${migrationResults.skipped}`);

if (dryRun) {
  console.log('\nThis was a dry run. No files were actually migrated.');
  console.log('Use the command without --dry-run to perform the actual migration.');
} else if (migrationResults.success > 0) {
  console.log(`\nMigrated themes saved to: ${path.resolve(process.cwd(), outputDir)}`);
}

// Write report to file if not in dry run mode
if (!dryRun) {
  const reportPath = path.join(outputDir, 'migration-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(migrationResults, null, 2));
  console.log(`\nDetailed migration report saved to: ${reportPath}`);
}

// Exit with error code if any migrations failed
process.exit(migrationResults.failed > 0 ? 1 : 0); 