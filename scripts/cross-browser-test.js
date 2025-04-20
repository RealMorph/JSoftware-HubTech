#!/usr/bin/env node

/**
 * Cross-Browser Theme Testing Utility
 * 
 * Tests theme rendering across different browsers using Playwright.
 * 
 * Features:
 * - Tests multiple browsers (Chromium, Firefox, WebKit)
 * - Tests light and dark theme modes
 * - Captures screenshots of key components
 * - Generates comparison report
 * 
 * Usage: node scripts/cross-browser-test.js [options]
 */

const path = require('path');
const fs = require('fs');
const express = require('express');
const { chromium, firefox, webkit } = require('playwright');
const pixelmatch = require('pixelmatch');
const { PNG } = require('pngjs');
const mkdirp = require('mkdirp');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  components: ['ThemeSwitch', 'Button', 'Card', 'Typography'],
  browsers: ['chromium', 'firefox', 'webkit'],
  themes: ['light', 'dark'],
  port: 8080,
  verbose: false
};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--components' && args[i + 1]) {
    options.components = args[i + 1].split(',');
    i++;
  } else if (args[i] === '--browsers' && args[i + 1]) {
    options.browsers = args[i + 1].split(',').filter(b => 
      ['chromium', 'firefox', 'webkit'].includes(b)
    );
    i++;
  } else if (args[i] === '--themes' && args[i + 1]) {
    options.themes = args[i + 1].split(',');
    i++;
  } else if (args[i] === '--port' && args[i + 1]) {
    options.port = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === '--verbose') {
    options.verbose = true;
  }
}

// Setup directories
const RESULTS_DIR = path.join(process.cwd(), 'theme-test-results');
const SCREENSHOT_DIR = path.join(RESULTS_DIR, 'screenshots');
const REPORT_DIR = path.join(RESULTS_DIR, 'report');

// Component selectors for testing
const componentSelectors = {
  ThemeSwitch: '.theme-switch',
  Button: 'button.primary-button',
  Card: '.card-component',
  Typography: '.typography-demo'
};

// Browser configurations
const browsers = {
  chromium: { name: 'Chrome', launch: () => chromium.launch() },
  firefox: { name: 'Firefox', launch: () => firefox.launch() },
  webkit: { name: 'Safari', launch: () => webkit.launch() }
};

// Theme configurations
const themes = {
  light: { name: 'Light Theme', class: 'light-theme' },
  dark: { name: 'Dark Theme', class: 'dark-theme' }
};

// Test results storage
const testResults = {
  components: {},
  comparisons: [],
  issuesFound: 0
};

// Start a server to serve the application
async function startServer() {
  const app = express();
  
  // Serve static files from build or dist directory
  const buildDir = fs.existsSync(path.join(process.cwd(), 'build'))
    ? path.join(process.cwd(), 'build')
    : path.join(process.cwd(), 'dist');
    
  if (!fs.existsSync(buildDir)) {
    console.error('No build or dist directory found. Please build the application first.');
    process.exit(1);
  }
  
  app.use(express.static(buildDir));
  
  // SPA fallback - serve index.html for all routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildDir, 'index.html'));
  });
  
  return new Promise((resolve) => {
    const server = app.listen(options.port, () => {
      console.log(`Test server started at http://localhost:${options.port}`);
      resolve(server);
    });
  });
}

// Log with optional verbose check
function log(message, isVerbose = false) {
  if (!isVerbose || options.verbose) {
    console.log(message);
  }
}

// Capture screenshots for all components in all themes and browsers
async function captureScreenshots() {
  log('\n=== Capturing screenshots ===');
  
  // Create screenshot directory
  await mkdirp(SCREENSHOT_DIR);
  
  // Test with each browser
  for (const browserType of options.browsers) {
    const browserConfig = browsers[browserType];
    log(`\n-- Testing with ${browserConfig.name} --`);
    
    // Launch browser
    const browser = await browserConfig.launch();
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 }
    });
    const page = await context.newPage();
    
    // Navigate to app
    await page.goto(`http://localhost:${options.port}/`);
    await page.waitForLoadState('networkidle');
    
    // Test with each theme
    for (const themeType of options.themes) {
      const themeConfig = themes[themeType];
      log(`Testing ${themeConfig.name}...`, true);
      
      // Set theme
      await page.evaluate((themeClass) => {
        // Try to use theme switch button if available
        const themeSwitch = document.querySelector('.theme-switch');
        if (themeSwitch) {
          const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
          const targetTheme = themeClass === 'dark-theme' ? 'dark' : 'light';
          
          if (currentTheme !== targetTheme) {
            themeSwitch.click();
          }
        } 
        // Direct class manipulation
        else {
          document.body.classList.remove('light-theme', 'dark-theme');
          document.body.classList.add(themeClass);
        }
      }, themeConfig.class);
      
      // Wait for theme to apply
      await page.waitForTimeout(500);
      
      // Capture each component
      for (const component of options.components) {
        const selector = componentSelectors[component];
        if (!selector) {
          log(`No selector defined for component: ${component}`, true);
          continue;
        }
        
        try {
          // Wait for component to appear
          const elementHandle = await page.waitForSelector(selector, { 
            state: 'visible', 
            timeout: 5000 
          });
          
          if (elementHandle) {
            // Create component directory
            const componentDir = path.join(SCREENSHOT_DIR, component);
            await mkdirp(componentDir);
            
            // Save screenshot
            const screenshotPath = path.join(
              componentDir, 
              `${component}_${themeType}_${browserType}.png`
            );
            
            await elementHandle.screenshot({ path: screenshotPath });
            log(`  ✓ Captured ${component} in ${themeType} theme`, true);
            
            // Store reference to screenshot
            if (!testResults.components[component]) {
              testResults.components[component] = [];
            }
            
            testResults.components[component].push({
              browser: browserType,
              theme: themeType,
              path: screenshotPath
            });
          }
        } catch (error) {
          log(`  ✗ Failed to capture ${component}: ${error.message}`);
          continue;
        }
      }
    }
    
    // Close browser
    await browser.close();
  }
}

// Compare screenshots across browsers
async function compareScreenshots() {
  log('\n=== Comparing screenshots ===');
  
  for (const component in testResults.components) {
    log(`\n-- Comparing ${component} --`);
    
    const screenshots = testResults.components[component];
    
    // Group by theme
    const themeGroups = {};
    screenshots.forEach(screenshot => {
      if (!themeGroups[screenshot.theme]) {
        themeGroups[screenshot.theme] = [];
      }
      themeGroups[screenshot.theme].push(screenshot);
    });
    
    // Compare within each theme
    for (const theme in themeGroups) {
      const browserScreenshots = themeGroups[theme];
      
      // Need at least 2 browsers to compare
      if (browserScreenshots.length < 2) {
        continue;
      }
      
      // Use first browser as reference
      const reference = browserScreenshots[0];
      
      // Compare with each other browser
      for (let i = 1; i < browserScreenshots.length; i++) {
        const comparison = browserScreenshots[i];
        
        // Read images
        const refImg = PNG.sync.read(fs.readFileSync(reference.path));
        const compImg = PNG.sync.read(fs.readFileSync(comparison.path));
        
        // Check image dimensions
        if (refImg.width !== compImg.width || refImg.height !== compImg.height) {
          log(`  ⚠️ Size mismatch for ${component} in ${theme} theme:`);
          log(`     ${reference.browser}: ${refImg.width}x${refImg.height}`);
          log(`     ${comparison.browser}: ${compImg.width}x${compImg.height}`);
          
          testResults.issuesFound++;
          continue;
        }
        
        // Create diff image
        const { width, height } = refImg;
        const diffImg = new PNG({ width, height });
        
        // Compare pixels
        const diffPixels = pixelmatch(
          refImg.data, 
          compImg.data, 
          diffImg.data, 
          width, 
          height, 
          { threshold: 0.1 }
        );
        
        // Calculate difference percentage
        const diffPercentage = (diffPixels / (width * height)) * 100;
        
        // Save diff image
        const diffPath = path.join(
          SCREENSHOT_DIR,
          component,
          `${component}_${theme}_diff_${reference.browser}_vs_${comparison.browser}.png`
        );
        
        fs.writeFileSync(diffPath, PNG.sync.write(diffImg));
        
        // Store comparison result
        testResults.comparisons.push({
          component,
          theme,
          reference: reference.browser,
          comparison: comparison.browser,
          diffPixels,
          diffPercentage,
          diffPath,
          hasIssues: diffPercentage > 1.0
        });
        
        // Log result
        const status = diffPercentage > 1.0 ? '✗' : '✓';
        log(`  ${status} ${reference.browser} vs ${comparison.browser}: ${diffPercentage.toFixed(2)}% different`);
        
        if (diffPercentage > 1.0) {
          testResults.issuesFound++;
        }
      }
    }
  }
}

// Generate HTML report
async function generateReport() {
  log('\n=== Generating report ===');
  
  // Create report directory
  await mkdirp(REPORT_DIR);
  
  // HTML report template
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Theme Cross-Browser Test Report</title>
  <style>
    body { 
      font-family: system-ui, -apple-system, sans-serif; 
      line-height: 1.5;
      margin: 0;
      padding: 20px;
      color: #333;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .header {
      background-color: #2c3e50;
      color: white;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 4px;
    }
    .summary {
      background-color: white;
      padding: 20px;
      border-radius: 4px;
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .component-card {
      background-color: white;
      border-radius: 4px;
      margin-bottom: 20px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .component-header {
      background-color: #34495e;
      color: white;
      padding: 15px 20px;
    }
    .component-body {
      padding: 20px;
    }
    .comparison {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 15px;
    }
    .comparison-images {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      margin-top: 15px;
    }
    .image-container {
      flex: 1 1 30%;
      min-width: 300px;
      text-align: center;
    }
    .image-container img {
      max-width: 100%;
      border: 1px solid #ddd;
      border-radius: 2px;
    }
    .success { color: #27ae60; }
    .warning { color: #f39c12; }
    .error { color: #e74c3c; }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 3px;
      font-size: 12px;
      font-weight: bold;
      margin-left: 8px;
    }
    .badge-success { background-color: #e6f7ef; color: #27ae60; }
    .badge-warning { background-color: #fef5e7; color: #f39c12; }
    .badge-error { background-color: #fdedeb; color: #e74c3c; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Theme Cross-Browser Test Report</h1>
      <p>Generated on ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="summary">
      <h2>Summary</h2>
      <p>
        <strong>Components tested:</strong> ${Object.keys(testResults.components).length}<br>
        <strong>Browsers tested:</strong> ${options.browsers.map(b => browsers[b].name).join(', ')}<br>
        <strong>Themes tested:</strong> ${options.themes.map(t => themes[t].name).join(', ')}
      </p>
      <p>
        <strong class="${testResults.issuesFound > 0 ? 'error' : 'success'}">
          ${testResults.issuesFound} rendering inconsistencies found
        </strong>
      </p>
    </div>`;
  
  // Group comparisons by component
  const componentGroups = {};
  testResults.comparisons.forEach(comparison => {
    if (!componentGroups[comparison.component]) {
      componentGroups[comparison.component] = [];
    }
    componentGroups[comparison.component].push(comparison);
  });
  
  // Add component sections
  for (const component in componentGroups) {
    const comparisons = componentGroups[component];
    
    html += `
    <div class="component-card">
      <div class="component-header">
        <h2>${component}</h2>
      </div>
      <div class="component-body">`;
    
    // Group by theme
    const themeGroups = {};
    comparisons.forEach(comp => {
      if (!themeGroups[comp.theme]) {
        themeGroups[comp.theme] = [];
      }
      themeGroups[comp.theme].push(comp);
    });
    
    // Add theme sections
    for (const theme in themeGroups) {
      const themeComparisons = themeGroups[theme];
      
      html += `
        <h3>${themes[theme].name}</h3>`;
      
      // Add comparisons
      themeComparisons.forEach(comp => {
        // Determine severity class
        const badgeClass = comp.diffPercentage > 5.0 ? 'badge-error' : 
                           comp.diffPercentage > 1.0 ? 'badge-warning' : 'badge-success';
        
        // Get relative paths for images
        const relativeRefPath = path.relative(REPORT_DIR, testResults.components[component]
          .find(s => s.browser === comp.reference && s.theme === comp.theme).path)
          .replace(/\\/g, '/');
        
        const relativeCompPath = path.relative(REPORT_DIR, testResults.components[component]
          .find(s => s.browser === comp.comparison && s.theme === comp.theme).path)
          .replace(/\\/g, '/');
        
        const relativeDiffPath = path.relative(REPORT_DIR, comp.diffPath)
          .replace(/\\/g, '/');
        
        html += `
        <div class="comparison">
          <div>
            <strong>${browsers[comp.reference].name} vs ${browsers[comp.comparison].name}</strong>
            <span class="badge ${badgeClass}">
              ${comp.diffPercentage.toFixed(2)}% different
            </span>
          </div>
          <div class="comparison-images">
            <div class="image-container">
              <img src="../${relativeRefPath}" alt="${comp.reference} screenshot">
              <p>${browsers[comp.reference].name}</p>
            </div>
            <div class="image-container">
              <img src="../${relativeCompPath}" alt="${comp.comparison} screenshot">
              <p>${browsers[comp.comparison].name}</p>
            </div>
            <div class="image-container">
              <img src="../${relativeDiffPath}" alt="Difference visualization">
              <p>Difference</p>
            </div>
          </div>
        </div>`;
      });
    }
    
    html += `
      </div>
    </div>`;
  }
  
  // Close HTML
  html += `
  </div>
</body>
</html>`;
  
  // Write report file
  const reportPath = path.join(REPORT_DIR, 'index.html');
  fs.writeFileSync(reportPath, html);
  
  return reportPath;
}

// Main function
async function main() {
  console.log('===== Theme Cross-Browser Testing =====');
  console.log(`Testing with: ${options.browsers.map(b => browsers[b].name).join(', ')}`);
  console.log(`Testing themes: ${options.themes.join(', ')}`);
  console.log(`Testing components: ${options.components.join(', ')}`);
  
  let server;
  
  try {
    // Create results directory
    await mkdirp(RESULTS_DIR);
    
    // Start server
    server = await startServer();
    
    // Capture screenshots
    await captureScreenshots();
    
    // Compare screenshots
    await compareScreenshots();
    
    // Generate report
    const reportPath = await generateReport();
    
    // Print summary
    console.log('\n===== Test Complete =====');
    if (testResults.issuesFound > 0) {
      console.log(`⚠️ ${testResults.issuesFound} rendering inconsistencies found`);
    } else {
      console.log('✅ No rendering inconsistencies found');
    }
    console.log(`Report available at: ${reportPath}`);
    
    // Exit with appropriate code
    process.exit(testResults.issuesFound > 0 ? 1 : 0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    // Close server
    if (server) {
      server.close();
    }
  }
}

// Run the script
main(); 