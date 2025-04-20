#!/usr/bin/env node

/**
 * Theme Console Error Check Script
 * 
 * This script helps identify theme-related console errors by launching
 * a dev server with special monitoring and opening a browser with the console
 * monitor enabled.
 */

const { execSync, spawn } = require('child_process');
const chalk = require('chalk');
const open = require('open');
const path = require('path');
const readline = require('readline');

// Configuration
const DEV_SERVER_PORT = 3000;
const THEME_TEST_PAGE = 'theme-test.html';
const APP_PAGE = '/';
const THEME_DEBUG_PARAM = 'theme-debug=true';

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Print banner
console.log(chalk.blue('='.repeat(80)));
console.log(chalk.bold.blue('Theme Console Error Check Tool'));
console.log(chalk.blue('='.repeat(80)));
console.log('');
console.log(chalk.gray('This tool helps identify theme-related console errors in your application.'));
console.log(chalk.gray('It will launch a development server and open your browser with console monitoring.'));
console.log('');

// Check if vite is installed
try {
  execSync('npx vite --version', { stdio: 'ignore' });
} catch (error) {
  console.error(chalk.red('❌ Vite is required but not installed.'));
  console.error(chalk.red('Please install it with: npm install -D vite'));
  process.exit(1);
}

// Ask user which mode to run
console.log(chalk.yellow('Select a mode to run:'));
console.log(chalk.white('1. Theme Test Page (recommended for quick checks)'));
console.log(chalk.white('2. Main Application (for testing with real data/state)'));
console.log(chalk.white('3. Custom Route (specify a route to test)'));

rl.question(chalk.cyan('\nEnter your choice (1-3): '), (choice) => {
  let url;
  
  switch (choice.trim()) {
    case '1':
      url = `http://localhost:${DEV_SERVER_PORT}/${THEME_TEST_PAGE}`;
      startChecking(url);
      break;
    case '2':
      url = `http://localhost:${DEV_SERVER_PORT}${APP_PAGE}?${THEME_DEBUG_PARAM}`;
      startChecking(url);
      break;
    case '3':
      rl.question(chalk.cyan('Enter the route to test (e.g., /demo/button): '), (route) => {
        url = `http://localhost:${DEV_SERVER_PORT}${route}?${THEME_DEBUG_PARAM}`;
        startChecking(url);
      });
      break;
    default:
      console.log(chalk.red('Invalid choice. Exiting.'));
      rl.close();
      process.exit(1);
  }
});

/**
 * Start the checking process
 */
function startChecking(url) {
  console.log('');
  console.log(chalk.blue('Starting theme console error check...'));
  console.log(chalk.gray('Press Ctrl+C to stop'));
  console.log('');
  
  // Start development server with theme checking enabled
  const server = spawn('npx', ['vite', '--port', DEV_SERVER_PORT, '--mode', 'development'], {
    stdio: 'pipe',
    shell: true
  });

  let serverStarted = false;
  let browserOpened = false;
  
  // Handle server output
  server.stdout.on('data', (data) => {
    const output = data.toString();
    
    // Look for server start message
    if (output.includes('Local:') && !serverStarted) {
      serverStarted = true;
      console.log(chalk.green('✅ Dev server started successfully'));
      
      // Wait a bit before opening browser to ensure server is ready
      setTimeout(() => {
        openBrowser(url);
      }, 1000);
    }
    
    // Check for warnings or errors in server output
    if (output.includes('ERROR') || output.includes('Error:')) {
      console.error(chalk.red(output));
    } else if (output.includes('WARN') || output.includes('Warning:')) {
      console.warn(chalk.yellow(output));
    } else if (output.includes('theme') || output.includes('Theme')) {
      // Highlight theme-related messages
      console.log(chalk.cyan(output));
    } else {
      console.log(chalk.gray(output));
    }
  });
  
  // Handle server errors
  server.stderr.on('data', (data) => {
    console.error(chalk.red(data.toString()));
  });
  
  // Handle server exit
  server.on('close', (code) => {
    console.log(chalk.blue(`\nDev server exited with code ${code}`));
    rl.close();
    process.exit(0);
  });
  
  // Handle script termination
  process.on('SIGINT', () => {
    console.log(chalk.blue('\nShutting down...'));
    
    // Kill server process
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', server.pid, '/f', '/t'], { stdio: 'ignore' });
    } else {
      server.kill('SIGINT');
    }
    
    // Display final instructions
    console.log(chalk.green('\nTheme console check completed!'));
    console.log(chalk.yellow('\nRemember to:'));
    console.log(chalk.white('1. Check browser console for any theme-related errors'));
    console.log(chalk.white('2. Update the verification checklist with your findings'));
    console.log(chalk.white('3. Fix any identified issues'));
    
    rl.close();
    process.exit(0);
  });
}

/**
 * Open browser with the specified URL
 */
async function openBrowser(url) {
  try {
    console.log(chalk.blue(`Opening browser: ${url}`));
    await open(url);
    console.log(chalk.green('✅ Browser opened successfully'));
    
    console.log('');
    console.log(chalk.yellow('📋 Instructions:'));
    console.log(chalk.white('1. Interact with the application to trigger different theme behaviors'));
    console.log(chalk.white('2. Check the browser console for theme-related errors'));
    console.log(chalk.white('3. Use the theme monitor exposed as window.__themeConsoleMonitor in browser console'));
    console.log(chalk.white('4. Press Ctrl+C in this terminal when finished'));
    console.log('');
    
    // Display available console commands
    console.log(chalk.yellow('📋 Available Browser Console Commands:'));
    console.log(chalk.gray('window.__themeConsoleMonitor.getMessages()    // Get all theme-related messages'));
    console.log(chalk.gray('window.__themeConsoleMonitor.generateReport() // Generate a summary report'));
    console.log(chalk.gray('window.__themeConsoleMonitor.clear()          // Clear collected messages'));
    console.log('');
  } catch (error) {
    console.error(chalk.red(`❌ Failed to open browser: ${error.message}`));
  }
} 