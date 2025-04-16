#!/usr/bin/env node

/**
 * CI Theme Validation Script
 * 
 * This script runs theme validation in CI environments and reports results
 * in a format appropriate for CI systems.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');

// Configuration
const config = {
  strict: process.env.THEME_VALIDATION_STRICT === 'true',
  reportDir: process.env.REPORT_DIR || 'reports',
  failOnError: process.env.FAIL_ON_ERROR !== 'false', // Default to true
  githubOutput: process.env.GITHUB_OUTPUT // GitHub Actions output file
};

// Create reports directory if it doesn't exist
if (!fs.existsSync(config.reportDir)) {
  fs.mkdirSync(config.reportDir, { recursive: true });
}

console.log(chalk.blue('🔍 Starting CI theme validation...'));

// Run theme validation and capture output
try {
  // Build the validation command
  const validateCmd = [
    'node',
    'scripts/validate-themes.js',
    '--format=json',
    config.strict ? '--strict' : ''
  ].filter(Boolean).join(' ');
  
  console.log(chalk.gray(`Executing: ${validateCmd}`));
  
  // Run the validation command
  const output = execSync(validateCmd, { encoding: 'utf8' });
  
  // Save the raw JSON output
  const reportPath = path.join(config.reportDir, 'theme-validation.json');
  fs.writeFileSync(reportPath, output, 'utf8');
  
  console.log(chalk.green(`✅ Theme validation report saved to ${reportPath}`));
  
  // Parse the validation results
  const results = JSON.parse(output);
  const { total, valid, invalid } = results.summary;
  
  // Create a markdown summary
  const summaryPath = path.join(config.reportDir, 'theme-validation-summary.md');
  const summary = [
    '# Theme Validation Results',
    '',
    `- **Total themes analyzed:** ${total}`,
    `- **Valid themes:** ${valid}`,
    `- **Invalid themes:** ${invalid}`,
  ];
  
  if (invalid > 0) {
    summary.push('', '## Validation Errors');
    
    results.errors.forEach((error, index) => {
      summary.push(
        '',
        `### ${index + 1}. ${path.basename(error.file)} (${error.theme})`,
        ''
      );
      
      error.errors.forEach(err => {
        summary.push(`- ${err}`);
      });
    });
    
    summary.push(
      '',
      '## How to Fix',
      '',
      'See the [Theme Validation Guide](docs/theme-validation-guide.md) for details on fixing these issues.'
    );
  } else {
    summary.push('', '✅ All themes are valid!');
  }
  
  fs.writeFileSync(summaryPath, summary.join('\n'), 'utf8');
  console.log(chalk.green(`✅ Summary report saved to ${summaryPath}`));
  
  // Write to GitHub output if available
  if (config.githubOutput) {
    fs.appendFileSync(
      config.githubOutput,
      `error_count=${invalid}\n`,
      'utf8'
    );
    
    fs.appendFileSync(
      config.githubOutput,
      `valid_count=${valid}\n`,
      'utf8'
    );
    
    fs.appendFileSync(
      config.githubOutput,
      `total_count=${total}\n`,
      'utf8'
    );
  }
  
  // Generate a file with annotations for GitHub
  const annotationsPath = path.join(config.reportDir, 'github-annotations.txt');
  const annotations = [];
  
  if (invalid > 0) {
    results.errors.forEach(error => {
      const file = error.file.replace(process.cwd(), '');
      
      // First error as the main error
      annotations.push(`::error file=${file},title=Theme Validation Error::${error.theme}: ${error.errors[0]}`);
      
      // Additional errors as warnings
      if (error.errors.length > 1) {
        error.errors.slice(1).forEach(err => {
          annotations.push(`::warning file=${file},title=Additional Validation Error::${error.theme}: ${err}`);
        });
      }
    });
    
    fs.writeFileSync(annotationsPath, annotations.join('\n'), 'utf8');
    console.log(chalk.green(`✅ GitHub annotations saved to ${annotationsPath}`));
  }
  
  // Determine exit code
  if (config.failOnError && invalid > 0) {
    console.error(chalk.red(`❌ Found ${invalid} theme validation errors.`));
    process.exit(1);
  } else {
    console.log(chalk.green('✅ Theme validation completed successfully.'));
    process.exit(0);
  }
} catch (error) {
  console.error(chalk.red(`❌ Error during validation: ${error.message}`));
  console.error(error.stack);
  process.exit(1);
} 