/**
 * Ensure Test Directories Script
 * 
 * This script ensures that directories required for testing exist.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Directories to ensure exist
const directories = [
  path.join(__dirname, '../test-results'),
  path.join(__dirname, '../coverage'),
  path.join(__dirname, '../cypress/screenshots'),
  path.join(__dirname, '../cypress/videos'),
  path.join(__dirname, '../cypress/fixtures'),
  path.join(__dirname, '../cypress/downloads'),
  path.join(__dirname, '../scripts/dashboard-assets'),
];

// Create directories if they don't exist
directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(chalk.green(`Created directory: ${dir}`));
  } else {
    console.log(chalk.blue(`Directory already exists: ${dir}`));
  }
});

console.log(chalk.green('\n✅ All test directories are ready!\n')); 