/**
 * Console Output Check Utility
 * 
 * This script helps detect and analyze console warnings and errors
 * related to the theme system during application startup and interaction.
 * 
 * It sets up a test server, launches a headless browser, and checks for:
 * - Theme-related console warnings
 * - Theme-related console errors
 * - Theme property access errors
 * - Missing theme values
 * 
 * Usage:
 * - Run with Node.js: node scripts/console-check.js [options]
 * 
 * Options:
 *   --headful    Run in non-headless mode to see the browser
 *   --verbose    Show all console output (not just errors/warnings)
 *   --pages      Comma-separated list of routes to test (default: '/')
 */

const puppeteer = require('puppeteer');
const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  headless: true,
  verbose: false,
  pages: ['/'],
  port: 8000
};

// Process command line arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--headful') {
    options.headless = false;
  } else if (args[i] === '--verbose') {
    options.verbose = true;
  } else if (args[i] === '--pages' && args[i + 1]) {
    options.pages = args[i + 1].split(',');
    i++;
  } else if (args[i] === '--port' && args[i + 1]) {
    options.port = parseInt(args[i + 1], 10);
    i++;
  }
}

// Keywords to identify theme-related console messages
const THEME_KEYWORDS = [
  'theme',
  'DirectTheme',
  'ThemeProvider',
  'useTheme',
  'getColor',
  'getTypography',
  'getSpacing',
  'styles',
  'css',
  'styled',
  'undefined is not an object',
  'Cannot read property',
  'colors',
  'typography',
  'spacing',
  'borderRadius',
  'shadows',
  'zIndex',
  'transitions',
  'breakpoints'
];

// Categories of issues
const issueCategories = {
  errors: [],
  warnings: [],
  missingProps: [],
  typeErrors: [],
  total: 0
};

// Start a simple express server to serve the build files
async function startServer() {
  const app = express();
  
  // Static files from the build directory
  if (fs.existsSync(path.join(process.cwd(), 'build'))) {
    app.use(express.static(path.join(process.cwd(), 'build')));
  } else if (fs.existsSync(path.join(process.cwd(), 'dist'))) {
    app.use(express.static(path.join(process.cwd(), 'dist')));
  } else {
    console.error('No build or dist directory found. Please run the build command first.');
    process.exit(1);
  }
  
  // For any routes, return index.html (SPA fallback)
  app.get('*', (req, res) => {
    let indexPath;
    if (fs.existsSync(path.join(process.cwd(), 'build', 'index.html'))) {
      indexPath = path.join(process.cwd(), 'build', 'index.html');
    } else if (fs.existsSync(path.join(process.cwd(), 'dist', 'index.html'))) {
      indexPath = path.join(process.cwd(), 'dist', 'index.html');
    } else {
      return res.status(404).send('No index.html found');
    }
    
    res.sendFile(indexPath);
  });
  
  return new Promise((resolve) => {
    const server = app.listen(options.port, () => {
      console.log(`Test server started at http://localhost:${options.port}`);
      resolve(server);
    });
  });
}

// Analyze console message
function analyzeConsoleMessage(message) {
  const text = message.text();
  const type = message.type();
  
  // Skip non-theme-related messages if not in verbose mode
  const isThemeRelated = THEME_KEYWORDS.some(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase())
  );
  
  if (!options.verbose && !isThemeRelated) {
    return false;
  }
  
  // Log message based on type
  let prefix = '';
  let isLogged = false;
  
  if (type === 'error') {
    prefix = '🔴 ERROR:';
    console.error(`${prefix} ${text}`);
    
    if (isThemeRelated) {
      issueCategories.total++;
      issueCategories.errors.push(text);
      
      // Categorize errors
      if (text.includes('undefined is not an object') || 
          text.includes('Cannot read property') ||
          text.includes('is not defined')) {
        issueCategories.missingProps.push(text);
      } else if (text.includes('type') || text.includes('expected')) {
        issueCategories.typeErrors.push(text);
      }
    }
    
    isLogged = true;
  } else if (type === 'warning') {
    prefix = '🟠 WARNING:';
    console.warn(`${prefix} ${text}`);
    
    if (isThemeRelated) {
      issueCategories.total++;
      issueCategories.warnings.push(text);
    }
    
    isLogged = true;
  } else if (options.verbose) {
    prefix = '🔵 INFO:';
    console.log(`${prefix} ${text}`);
    isLogged = true;
  }
  
  return isLogged;
}

// Run theme console checks
async function runConsoleChecks() {
  let server;
  let browser;
  
  try {
    // Start server
    server = await startServer();
    
    // Start browser
    browser = await puppeteer.launch({
      headless: options.headless ? 'new' : false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Collect console messages
    page.on('console', message => {
      analyzeConsoleMessage(message);
    });
    
    // Handle page errors
    page.on('pageerror', error => {
      const text = error.message;
      console.error(`🔴 PAGE ERROR: ${text}`);
      
      const isThemeRelated = THEME_KEYWORDS.some(keyword => 
        text.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (isThemeRelated) {
        issueCategories.total++;
        issueCategories.errors.push(text);
      }
    });
    
    // Check each page
    for (const route of options.pages) {
      console.log(`\n=== Testing route: ${route} ===`);
      
      // Navigate to the page
      await page.goto(`http://localhost:${options.port}${route}`, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });
      
      // Wait a bit to catch any delayed console messages
      await page.waitForTimeout(2000);
      
      // Perform some interactions to trigger potential theme-related issues
      await page.evaluate(() => {
        // Resize window to trigger responsive behavior
        window.dispatchEvent(new Event('resize'));
        
        // Find and click theme-related elements if they exist
        const themeButtons = Array.from(document.querySelectorAll('button')).filter(b => 
          b.textContent?.toLowerCase().includes('theme') || 
          b.className?.toLowerCase().includes('theme')
        );
        
        themeButtons.forEach(button => button.click());
        
        // Try to simulate hover effects
        const elements = document.querySelectorAll('*');
        for (let i = 0; i < Math.min(elements.length, 50); i++) {
          const elem = elements[i];
          const event = new MouseEvent('mouseover', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          elem.dispatchEvent(event);
        }
      });
      
      // Wait again for potential delayed console messages
      await page.waitForTimeout(1000);
    }
    
    // Summarize findings
    console.log('\n=== Theme Console Check Summary ===');
    
    if (issueCategories.total === 0) {
      console.log('✅ No theme-related console issues detected!');
    } else {
      console.log(`❌ Found ${issueCategories.total} theme-related console issues:`);
      console.log(`   - Errors: ${issueCategories.errors.length}`);
      console.log(`   - Warnings: ${issueCategories.warnings.length}`);
      console.log(`   - Missing props: ${issueCategories.missingProps.length}`);
      console.log(`   - Type errors: ${issueCategories.typeErrors.length}`);
      
      // Provide advice for fixing issues
      console.log('\n=== Recommendations ===');
      
      if (issueCategories.missingProps.length > 0) {
        console.log('1. Check for missing theme properties:');
        console.log('   - Ensure all theme properties are defined in theme-defaults.ts');
        console.log('   - Verify that components accessing theme properties use proper fallbacks');
      }
      
      if (issueCategories.typeErrors.length > 0) {
        console.log('2. Fix type-related issues:');
        console.log('   - Ensure ThemeStyles interface is properly implemented');
        console.log('   - Check that components use correct type casting when needed');
      }
      
      if (issueCategories.warnings.length > 0) {
        console.log('3. Address theme warnings:');
        console.log('   - Review theme configuration for inconsistencies');
        console.log('   - Check for deprecated theme usage patterns');
      }
    }
    
  } catch (error) {
    console.error('Error running console checks:', error);
  } finally {
    // Cleanup
    if (browser) {
      await browser.close();
    }
    
    if (server) {
      server.close();
    }
  }
}

// Main function
async function main() {
  console.log('===== Theme Console Output Check =====');
  console.log(`Mode: ${options.headless ? 'Headless' : 'Visible browser'}`);
  console.log(`Verbose: ${options.verbose ? 'Yes' : 'No'}`);
  console.log(`Pages to test: ${options.pages.join(', ')}`);
  console.log('===================================\n');
  
  try {
    await runConsoleChecks();
    
    console.log('\n===== Check Complete =====');
    process.exit(issueCategories.total > 0 ? 1 : 0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the script
main(); 