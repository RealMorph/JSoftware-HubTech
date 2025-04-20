/**
 * Test Dashboard Script
 * 
 * This script creates a local server to display test results and code coverage metrics.
 * It reads test results from the test-results directory and coverage reports from the coverage directory.
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const open = require('open');
let prettyMs;

try {
  prettyMs = require('pretty-ms');
} catch (error) {
  console.warn('pretty-ms module not found, using fallback formatting function');
}

// Fallback function in case pretty-ms is not available
function formatMs(ms) {
  if (prettyMs && typeof prettyMs === 'function') {
    return prettyMs(ms);
  }
  
  // Simple fallback implementation
  if (ms < 1000) {
    return `${ms}ms`;
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`;
  } else if (ms < 3600000) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  } else {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  }
}

// Create express app
const app = express();
const port = process.env.PORT || 3456;

// Try alternative ports if the default is in use
function startServer(portToUse) {
  const server = app.listen(portToUse, () => {
    console.log(chalk.green(`\n✅ Test Dashboard running at http://localhost:${portToUse}\n`));
    
    // Check if we have test results and coverage
    const testResults = getLatestTestResults();
    const coverageSummary = getCoverageSummary();
    
    if (!testResults) {
      console.log(chalk.yellow('⚠️  No test results found.'));
      console.log(chalk.white(`   Run ${chalk.cyan('npm test')} to generate test results.\n`));
    }
    
    if (!coverageSummary) {
      console.log(chalk.yellow('⚠️  No coverage data found.'));
      console.log(chalk.white(`   Run ${chalk.cyan('npm test -- --coverage')} to generate coverage data.\n`));
    }
    
    // Try to open the dashboard in the browser if the open module is available
    try {
      if (typeof open === 'function') {
        open(`http://localhost:${portToUse}`);
      } else {
        console.log(chalk.cyan(`\nOpen your browser and navigate to: http://localhost:${portToUse}\n`));
      }
    } catch (error) {
      console.log(chalk.cyan(`\nOpen your browser and navigate to: http://localhost:${portToUse}\n`));
    }
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(chalk.yellow(`Port ${portToUse} is already in use. Trying port ${portToUse + 1}...`));
      startServer(portToUse + 1);
    } else {
      console.error(chalk.red('Server error:'), err);
    }
  });
}

// Set up static file serving
app.use('/coverage', express.static(path.join(__dirname, '../coverage/lcov-report')));
app.use('/assets', express.static(path.join(__dirname, 'dashboard-assets')));

// Ensure the dashboard assets directory exists
const assetsDir = path.join(__dirname, 'dashboard-assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Create CSS file for dashboard if it doesn't exist
const cssFile = path.join(assetsDir, 'dashboard.css');
if (!fs.existsSync(cssFile)) {
  fs.writeFileSync(cssFile, `
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; margin: 0; padding: 0; }
    .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    header { background-color: #2c3e50; color: white; padding: 1rem; }
    h1, h2, h3 { margin-top: 0; }
    .stats { display: flex; flex-wrap: wrap; gap: 1rem; margin: 1rem 0; }
    .stat-card { background-color: #f8f9fa; border-radius: 4px; padding: 1rem; flex: 1; min-width: 200px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .good { color: #27ae60; }
    .warning { color: #f39c12; }
    .error { color: #e74c3c; }
    .test-details { margin-top: 2rem; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    th, td { padding: 0.5rem; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f0f0f0; }
    tr:hover { background-color: #f5f5f5; }
    .tabs { display: flex; border-bottom: 1px solid #ddd; margin-top: 2rem; }
    .tab { padding: 0.5rem 1rem; cursor: pointer; }
    .tab.active { border-bottom: 2px solid #3498db; font-weight: bold; }
    .tab-content { padding: 1rem 0; }
    .hidden { display: none; }
    .progress-bar { background-color: #ecf0f1; height: 10px; border-radius: 5px; margin-top: 0.5rem; }
    .progress-bar-inner { height: 100%; border-radius: 5px; }
    footer { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #ddd; color: #7f8c8d; font-size: 0.9rem; }
  `);
}

// Read the latest test results
function getLatestTestResults() {
  const resultsPath = path.join(__dirname, '../test-results/latest-results.json');
  if (fs.existsSync(resultsPath)) {
    return JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
  }
  return null;
}

// Read the coverage summary
function getCoverageSummary() {
  const coveragePath = path.join(__dirname, '../coverage/coverage-summary.json');
  if (fs.existsSync(coveragePath)) {
    return JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
  }
  return null;
}

// Read the visual regression test results
function getVisualRegressionResults() {
  const visualPath = path.join(__dirname, '../test-results/visual-regression-results.json');
  if (fs.existsSync(visualPath)) {
    return JSON.parse(fs.readFileSync(visualPath, 'utf8'));
  }
  return null;
}

// Main dashboard route
app.get('/', (req, res) => {
  const testResults = getLatestTestResults();
  const coverageSummary = getCoverageSummary();
  const visualResults = getVisualRegressionResults();
  
  let testResultsHtml = '<p>No test results found. Run tests with <code>npm test</code> first.</p>';
  let coverageHtml = '<p>No coverage data found. Run tests with <code>npm test -- --coverage</code> first.</p>';
  let visualHtml = '<p>No visual regression test results found. Run tests with <code>npm run test:chromatic</code> first.</p>';
  
  if (testResults) {
    const { summary, testResults: tests } = testResults;
    const passRate = (summary.numPassedTests / summary.numTotalTests) * 100;
    const passRateClass = passRate >= 90 ? 'good' : passRate >= 70 ? 'warning' : 'error';
    
    testResultsHtml = `
      <div class="stats">
        <div class="stat-card">
          <h3>Tests</h3>
          <p class="big-stat">${summary.numTotalTests}</p>
        </div>
        <div class="stat-card">
          <h3>Passed</h3>
          <p class="big-stat ${passRateClass}">${summary.numPassedTests} (${passRate.toFixed(1)}%)</p>
        </div>
        <div class="stat-card">
          <h3>Failed</h3>
          <p class="big-stat ${summary.numFailedTests > 0 ? 'error' : 'good'}">${summary.numFailedTests}</p>
        </div>
        <div class="stat-card">
          <h3>Pending</h3>
          <p class="big-stat">${summary.numPendingTests}</p>
        </div>
        <div class="stat-card">
          <h3>Execution Time</h3>
          <p class="big-stat">${formatMs(summary.executionTime)}</p>
        </div>
      </div>
      
      <div class="test-details">
        <h3>Test Details</h3>
        <table>
          <thead>
            <tr>
              <th>Test File</th>
              <th>Passed</th>
              <th>Failed</th>
              <th>Pending</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${tests.map(test => `
              <tr>
                <td>${test.testFilePath}</td>
                <td class="${test.numFailingTests === 0 ? 'good' : ''}">${test.numPassingTests}</td>
                <td class="${test.numFailingTests > 0 ? 'error' : ''}">${test.numFailingTests}</td>
                <td>${test.numPendingTests}</td>
                <td>${test.numPassingTests + test.numFailingTests + test.numPendingTests}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
  
  if (coverageSummary) {
    const total = coverageSummary.total;
    
    function getColorClass(value, threshold) {
      return value >= threshold.statements ? 'good' : value >= threshold.statements - 10 ? 'warning' : 'error';
    }
    
    function renderProgressBar(value, type) {
      const thresholds = {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80
      };
      
      const colorClass = value >= thresholds[type] ? 'good' : value >= thresholds[type] - 10 ? 'warning' : 'error';
      
      return `
        <div class="progress-bar">
          <div class="progress-bar-inner ${colorClass}" style="width: ${value}%; background-color: ${value >= thresholds[type] ? '#27ae60' : value >= thresholds[type] - 10 ? '#f39c12' : '#e74c3c'}"></div>
        </div>
      `;
    }
    
    coverageHtml = `
      <div class="stats">
        <div class="stat-card">
          <h3>Statement Coverage</h3>
          <p class="big-stat ${getColorClass(total.statements.pct, { statements: 80 })}">${total.statements.pct}%</p>
          ${renderProgressBar(total.statements.pct, 'statements')}
          <p class="small-stat">${total.statements.covered}/${total.statements.total}</p>
        </div>
        <div class="stat-card">
          <h3>Branch Coverage</h3>
          <p class="big-stat ${getColorClass(total.branches.pct, { statements: 75 })}">${total.branches.pct}%</p>
          ${renderProgressBar(total.branches.pct, 'branches')}
          <p class="small-stat">${total.branches.covered}/${total.branches.total}</p>
        </div>
        <div class="stat-card">
          <h3>Function Coverage</h3>
          <p class="big-stat ${getColorClass(total.functions.pct, { statements: 80 })}">${total.functions.pct}%</p>
          ${renderProgressBar(total.functions.pct, 'functions')}
          <p class="small-stat">${total.functions.covered}/${total.functions.total}</p>
        </div>
        <div class="stat-card">
          <h3>Line Coverage</h3>
          <p class="big-stat ${getColorClass(total.lines.pct, { statements: 80 })}">${total.lines.pct}%</p>
          ${renderProgressBar(total.lines.pct, 'lines')}
          <p class="small-stat">${total.lines.covered}/${total.lines.total}</p>
        </div>
      </div>
      
      <p><a href="/coverage" target="_blank">View detailed coverage report</a></p>
    `;
  }
  
  if (visualResults) {
    const statusClass = visualResults.passed ? 'good' : 'error';
    const statusLabel = visualResults.passed ? 'PASSED' : 'FAILED';
    
    visualHtml = `
      <div class="stats">
        <div class="stat-card">
          <h3>Status</h3>
          <p class="big-stat ${statusClass}">${statusLabel}</p>
          <p class="small-stat">Build #${visualResults.buildNumber}</p>
        </div>
        <div class="stat-card">
          <h3>Components</h3>
          <p class="big-stat">${visualResults.components.total}</p>
          <p class="small-stat ${visualResults.components.changed > 0 ? 'warning' : 'good'}">
            ${visualResults.components.changed} changed
          </p>
        </div>
        <div class="stat-card">
          <h3>Snapshots</h3>
          <p class="big-stat">${visualResults.totalSnapshots}</p>
          <p class="small-stat ${visualResults.changedSnapshots > 0 ? 'warning' : 'good'}">
            ${visualResults.changedSnapshots} changed / ${visualResults.addedSnapshots} added / ${visualResults.removedSnapshots} removed
          </p>
        </div>
        <div class="stat-card">
          <h3>Last Run</h3>
          <p class="big-stat">${new Date(visualResults.timestamp).toLocaleString()}</p>
        </div>
      </div>
      
      <h3>Browsers</h3>
      <div class="stats">
        ${visualResults.browsers.map(browser => `
          <div class="stat-card">
            <h4>${browser.name}</h4>
            <p class="big-stat">${browser.snapshots}</p>
            <p class="small-stat ${browser.changed > 0 ? 'warning' : 'good'}">
              ${browser.changed} changed
            </p>
          </div>
        `).join('')}
      </div>
      
      <h3>Viewports</h3>
      <div class="stats">
        ${visualResults.viewports.map(viewport => `
          <div class="stat-card">
            <h4>${viewport.name} (${viewport.width}px)</h4>
            <p class="big-stat">${viewport.snapshots}</p>
            <p class="small-stat ${viewport.changed > 0 ? 'warning' : 'good'}">
              ${viewport.changed} changed
            </p>
          </div>
        `).join('')}
      </div>
      
      <p><a href="${visualResults.url}" target="_blank">View detailed visual regression report on Chromatic</a></p>
    `;
  }
  
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Dashboard</title>
    <link rel="stylesheet" href="/assets/dashboard.css">
  </head>
  <body>
    <header>
      <div class="container">
        <h1>Test Dashboard</h1>
        <p>Last updated: ${new Date().toLocaleString()}</p>
      </div>
    </header>
    
    <div class="container">
      <div class="tabs">
        <div class="tab active" data-tab="test-results">Test Results</div>
        <div class="tab" data-tab="coverage">Coverage</div>
        <div class="tab" data-tab="visual">Visual Regression</div>
      </div>
      
      <div class="tab-content" id="test-results">
        <h2>Test Results</h2>
        ${testResultsHtml}
      </div>
      
      <div class="tab-content hidden" id="coverage">
        <h2>Code Coverage</h2>
        ${coverageHtml}
      </div>
      
      <div class="tab-content hidden" id="visual">
        <h2>Visual Regression Tests</h2>
        ${visualHtml}
      </div>
      
      <footer>
        <p>Test Dashboard - Generated ${new Date().toISOString()}</p>
      </footer>
    </div>
    
    <script>
      // Simple tab navigation
      document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
          // Hide all tab contents
          document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
          });
          
          // Deactivate all tabs
          document.querySelectorAll('.tab').forEach(t => {
            t.classList.remove('active');
          });
          
          // Show selected tab content
          const tabId = tab.getAttribute('data-tab');
          document.getElementById(tabId).classList.remove('hidden');
          tab.classList.add('active');
        });
      });
    </script>
  </body>
  </html>
  `;
  
  res.send(html);
});

// Start the server
startServer(port); 