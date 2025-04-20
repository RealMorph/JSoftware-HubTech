// @ts-nocheck
// @typescript-eslint/ban-ts-comment
// @typescript-eslint/no-unused-vars
/**
 * Accessibility Testing Runner
 * 
 * This script runs automated accessibility tests using axe-core.
 * It can test individual components or scan the entire application.
 */

const puppeteer = require('puppeteer');
const { AxePuppeteer } = require('@axe-core/puppeteer');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const express = require('express');
const open = require('open');

/**
 * Helper function to create HTML strings without TypeScript parsing issues
 * @param {Array<string>} strings
 * @param {...any} values
 * @return {string}
 */
function createHtml(strings, ...values) {
  return String.raw({ raw: strings }, ...values);
}

// Configuration
const CONFIG = {
  outputDir: path.join(__dirname, '../test-results/a11y'),
  reportFile: path.join(__dirname, '../test-results/a11y/a11y-report.json'),
  port: 3791,
  baseUrl: 'http://localhost:3000',
  componentsToTest: [
    { name: 'Button', route: '/components/button-demo', selector: '[data-testid="button-demo"]' },
    { name: 'TextField', route: '/components/textfield-demo', selector: '[data-testid="textfield-demo"]' },
    { name: 'DataGrid', route: '/components/datagrid-demo', selector: '[data-testid="datagrid-demo"]' },
    { name: 'Form', route: '/components/form-demo', selector: '[data-testid="form-demo"]' },
    { name: 'Modal', route: '/components/modal-demo', selector: '[data-testid="modal-demo"]' },
    { name: 'Chart', route: '/components/charts-demo', selector: '[data-testid="charts-demo"]' },
  ],
  standardPages: [
    { name: 'Home', route: '/' },
    { name: 'Dashboard', route: '/dashboard' },
    { name: 'Login', route: '/login' },
    { name: 'Profile', route: '/profile' },
  ],
  axeConfig: {
    // See: https://github.com/dequelabs/axe-core/blob/master/doc/API.md#options-parameter
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'],
    },
  },
  browser: {
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
    ],
  },
};

// Ensure output directory exists
if (!fs.existsSync(CONFIG.outputDir)) {
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });
}

// Check if dev server is running
const checkDevServer = async () => {
  try {
    console.log(chalk.blue('Checking if dev server is running...'));
    await fetch(CONFIG.baseUrl);
    console.log(chalk.green('Dev server is running'));
    return true;
  } catch (e) {
    console.error(chalk.red('Dev server is not running. Please start it with `npm run dev` before running a11y tests.'));
    return false;
  }
};

// Run accessibility test on a page
const runA11yTest = async (browser, pageConfig) => {
  console.log(chalk.blue(`Testing ${pageConfig.name}...`));
  
  const page = await browser.newPage();
  
  // Set viewport size
  await page.setViewport({ width: 1280, height: 800 });
  
  try {
    // Navigate to page
    const url = `${CONFIG.baseUrl}${pageConfig.route}`;
    const response = await page.goto(url, { waitUntil: 'networkidle0' });
    
    if (!response.ok()) {
      console.error(chalk.red(`Failed to load ${url}: ${response.status()} ${response.statusText()}`));
      await page.close();
      return {
        name: pageConfig.name,
        url,
        error: `Failed to load page: ${response.status()} ${response.statusText()}`,
        results: null,
      };
    }
    
    // Wait for specific selector if provided
    if (pageConfig.selector) {
      try {
        await page.waitForSelector(pageConfig.selector, { timeout: 5000 });
      } catch (e) {
        console.error(chalk.yellow(`Warning: Selector "${pageConfig.selector}" not found on ${url}`));
        // Continue with the test anyway
      }
    }
    
    // Take screenshot
    await page.screenshot({
      path: path.join(CONFIG.outputDir, `${pageConfig.name.toLowerCase()}.png`),
      fullPage: true,
    });
    
    // Run axe analysis
    const axe = new AxePuppeteer(page);
    
    // Configure axe
    axe.options(CONFIG.axeConfig);
    
    // Run axe on specific element if selector is provided
    if (pageConfig.selector) {
      try {
        const element = await page.$(pageConfig.selector);
        if (element) {
          axe.include(pageConfig.selector);
        }
      } catch (e) {
        // If selector not found, run on whole page
        console.error(chalk.yellow(`Warning: Couldn't find selector "${pageConfig.selector}" for axe test`));
      }
    }
    
    // Run the analysis
    const results = await axe.analyze();
    
    // Log violations summary
    if (results.violations.length > 0) {
      console.log(chalk.yellow(`Found ${results.violations.length} accessibility issues on ${pageConfig.name}:`));
      
      results.violations.forEach((violation, index) => {
        console.log(chalk.yellow(`${index + 1}. ${violation.id} - ${violation.impact} impact - ${violation.nodes.length} occurrences`));
        console.log(chalk.gray(`   ${violation.help} - ${violation.helpUrl}`));
      });
    } else {
      console.log(chalk.green(`✓ No accessibility issues found on ${pageConfig.name}`));
    }
    
    await page.close();
    
    return {
      name: pageConfig.name,
      url,
      timestamp: new Date().toISOString(),
      results,
    };
  } catch (error) {
    console.error(chalk.red(`Error testing ${pageConfig.name}:`), error);
    await page.close();
    
    return {
      name: pageConfig.name,
      url: `${CONFIG.baseUrl}${pageConfig.route}`,
      error: error.message,
      results: null,
    };
  }
};

// Create a report server to display results
const createReportServer = (reportData) => {
  const app = express();
  
  // Serve static files
  app.use(express.static(CONFIG.outputDir));
  
  // API endpoint for report data
  app.get('/api/report-data', (req, res) => {
    res.json(reportData);
  });
  
  // Main HTML page
  app.get('/', (req, res) => {
    /** @type {string} */
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Accessibility Test Report</title>
        <style>
          :root {
            --bg-color: #f8f9fa;
            --text-color: #212529;
            --primary-color: #0d6efd;
            --secondary-color: #6c757d;
            --border-color: #dee2e6;
            --hover-color: #e9ecef;
            --success-color: #198754;
            --warning-color: #ffc107;
            --danger-color: #dc3545;
            --info-color: #0dcaf0;
            --card-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }

          @media (prefers-color-scheme: dark) {
            :root {
              --bg-color: #212529;
              --text-color: #f8f9fa;
              --primary-color: #0d6efd;
              --secondary-color: #adb5bd;
              --border-color: #495057;
              --hover-color: #343a40;
              --card-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
            }
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: var(--bg-color);
            color: var(--text-color);
          }

          header {
            background-color: var(--primary-color);
            color: white;
            padding: 1rem;
            box-shadow: var(--card-shadow);
          }

          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 1rem;
          }

          .report-summary {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            margin-bottom: 1rem;
          }

          .summary-card {
            flex: 1;
            min-width: 200px;
            padding: 1rem;
            border-radius: 4px;
            background-color: var(--hover-color);
            box-shadow: var(--card-shadow);
          }

          .page-selector {
            margin-bottom: 1rem;
          }

          .page-selector select {
            padding: 0.5rem;
            border: 1px solid var(--border-color);
            border-radius: 4px;
            background-color: var(--bg-color);
            color: var(--text-color);
          }

          .impact-filter {
            display: flex;
            gap: 1rem;
            margin-bottom: 1rem;
          }

          .impact-filter label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .impact-badge {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.875rem;
            font-weight: bold;
          }

          .impact-critical {
            background-color: var(--danger-color);
            color: white;
          }

          .impact-serious {
            background-color: var(--warning-color);
            color: black;
          }

          .impact-moderate {
            background-color: var(--info-color);
            color: black;
          }

          .impact-minor {
            background-color: var(--secondary-color);
            color: white;
          }

          .violation-card {
            margin-bottom: 1rem;
            padding: 1rem;
            border-radius: 4px;
            background-color: var(--bg-color);
            box-shadow: var(--card-shadow);
            border-left: 4px solid;
          }

          .violation-card.critical {
            border-left-color: var(--danger-color);
          }

          .violation-card.serious {
            border-left-color: var(--warning-color);
          }

          .violation-card.moderate {
            border-left-color: var(--info-color);
          }

          .violation-card.minor {
            border-left-color: var(--secondary-color);
          }

          .violation-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
          }

          .violation-title {
            font-weight: bold;
            font-size: 1.1rem;
          }

          .violation-description {
            margin-bottom: 0.5rem;
          }

          .violation-help-url {
            display: inline-block;
            margin-bottom: 0.5rem;
            color: var(--primary-color);
          }

          .violation-nodes {
            margin-top: 1rem;
          }

          .node-item {
            margin-bottom: 0.5rem;
            padding: 0.5rem;
            background-color: var(--hover-color);
            border-radius: 4px;
          }

          .html-snippet {
            font-family: monospace;
            white-space: pre-wrap;
            padding: 0.5rem;
            background-color: rgba(0, 0, 0, 0.05);
            border-radius: 4px;
            overflow-x: auto;
          }

          .tabs {
            display: flex;
            border-bottom: 1px solid var(--border-color);
            margin-bottom: 1rem;
          }

          .tab {
            padding: 0.5rem 1rem;
            cursor: pointer;
            border-bottom: 2px solid transparent;
          }

          .tab.active {
            border-bottom: 2px solid var(--primary-color);
            font-weight: bold;
          }

          .tab-content {
            display: none;
          }

          .tab-content.active {
            display: block;
          }

          .passes-list,
          .incomplete-list {
            list-style: none;
            padding: 0;
          }

          .pass-item,
          .incomplete-item {
            margin-bottom: 0.5rem;
            padding: 0.5rem;
            background-color: var(--hover-color);
            border-radius: 4px;
          }

          .screenshot {
            max-width: 100%;
            height: auto;
            border: 1px solid var(--border-color);
            border-radius: 4px;
            margin-top: 1rem;
          }

          .toggle-theme {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            float: right;
          }

          .pagination {
            display: flex;
            justify-content: center;
            gap: 0.5rem;
            margin-top: 1rem;
          }

          .pagination-item {
            padding: 0.5rem 1rem;
            border: 1px solid var(--border-color);
            border-radius: 4px;
            cursor: pointer;
          }

          .pagination-item.active {
            background-color: var(--primary-color);
            color: white;
          }

          @media (max-width: 768px) {
            .report-summary {
              flex-direction: column;
            }
          }
        </style>
      </head>
      <body>
        <header>
          <div class="container">
            <h1>Accessibility Test Report</h1>
            <button id="toggle-dark-mode" class="toggle-theme">Toggle Dark Mode</button>
          </div>
        </header>
        
        <div class="container">
          <div class="report-summary" id="report-summary">
            <div class="summary-card">
              <h3>Total Pages</h3>
              <p class="big-stat" id="total-pages">0</p>
            </div>
            <div class="summary-card">
              <h3>Total Violations</h3>
              <p class="big-stat" id="total-violations">0</p>
            </div>
            <div class="summary-card">
              <h3>Critical Issues</h3>
              <p class="big-stat" id="critical-issues">0</p>
            </div>
            <div class="summary-card">
              <h3>Serious Issues</h3>
              <p class="big-stat" id="serious-issues">0</p>
            </div>
          </div>
          
          <div class="page-selector">
            <label for="page-select">Select Page:</label>
            <select id="page-select"></select>
          </div>
          
          <div class="impact-filter">
            <label>
              <input type="checkbox" id="filter-critical" checked>
              <span class="impact-badge impact-critical">Critical</span>
            </label>
            <label>
              <input type="checkbox" id="filter-serious" checked>
              <span class="impact-badge impact-serious">Serious</span>
            </label>
            <label>
              <input type="checkbox" id="filter-moderate" checked>
              <span class="impact-badge impact-moderate">Moderate</span>
            </label>
            <label>
              <input type="checkbox" id="filter-minor" checked>
              <span class="impact-badge impact-minor">Minor</span>
            </label>
          </div>
          
          <div class="tabs">
            <div class="tab active" data-tab="violations">Violations</div>
            <div class="tab" data-tab="passes">Passes</div>
            <div class="tab" data-tab="incomplete">Incomplete</div>
            <div class="tab" data-tab="screenshot">Screenshot</div>
          </div>
          
          <div id="violations" class="tab-content active">
            <div id="violations-container"></div>
            <div id="violations-pagination" class="pagination"></div>
          </div>
          
          <div id="passes" class="tab-content">
            <ul id="passes-list" class="passes-list"></ul>
          </div>
          
          <div id="incomplete" class="tab-content">
            <ul id="incomplete-list" class="incomplete-list"></ul>
          </div>
          
          <div id="screenshot" class="tab-content">
            <div id="screenshot-container"></div>
          </div>
        </div>
        
        <script>
          // Accessibility Report App
          (function() {
            // State
            let reportData = null;
            let selectedPage = '';
            let filters = {
              critical: true,
              serious: true,
              moderate: true,
              minor: true
            };
            let activeTab = 'violations';
            let isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            let currentPage = 1;
            let itemsPerPage = 10;
            
            // DOM Elements
            const pageSelect = document.getElementById('page-select');
            const totalPages = document.getElementById('total-pages');
            const totalViolations = document.getElementById('total-violations');
            const criticalIssues = document.getElementById('critical-issues');
            const seriousIssues = document.getElementById('serious-issues');
            const violationsContainer = document.getElementById('violations-container');
            const passesContainer = document.getElementById('passes-list');
            const incompleteContainer = document.getElementById('incomplete-list');
            const screenshotContainer = document.getElementById('screenshot-container');
            const violationsPagination = document.getElementById('violations-pagination');
            const filterCritical = document.getElementById('filter-critical');
            const filterSerious = document.getElementById('filter-serious');
            const filterModerate = document.getElementById('filter-moderate');
            const filterMinor = document.getElementById('filter-minor');
            const tabs = document.querySelectorAll('.tab');
            const tabContents = document.querySelectorAll('.tab-content');
            const toggleDarkMode = document.getElementById('toggle-dark-mode');
            
            // Fetch report data
            async function fetchReportData() {
              try {
                const response = await fetch('/api/report-data');
                reportData = await response.json();
                
                initializeUI();
              } catch (error) {
                console.error('Error fetching report data:', error);
              }
            }
            
            // Initialize UI
            function initializeUI() {
              // Update summary
              totalPages.textContent = reportData.length;
              
              let violationsCount = 0;
              let criticalCount = 0;
              let seriousCount = 0;
              
              reportData.forEach(page => {
                if (page.results && page.results.violations) {
                  violationsCount += page.results.violations.length;
                  
                  page.results.violations.forEach(violation => {
                    if (violation.impact === 'critical') {
                      criticalCount++;
                    } else if (violation.impact === 'serious') {
                      seriousCount++;
                    }
                  });
                }
              });
              
              totalViolations.textContent = violationsCount;
              criticalIssues.textContent = criticalCount;
              seriousIssues.textContent = seriousCount;
              
              // Populate page selector
              reportData.forEach(page => {
                const option = document.createElement('option');
                option.value = page.name;
                option.textContent = page.name;
                pageSelect.appendChild(option);
              });
              
              // Set up event listeners
              pageSelect.addEventListener('change', handlePageChange);
              filterCritical.addEventListener('change', handleFilterChange);
              filterSerious.addEventListener('change', handleFilterChange);
              filterModerate.addEventListener('change', handleFilterChange);
              filterMinor.addEventListener('change', handleFilterChange);
              tabs.forEach(tab => tab.addEventListener('click', handleTabClick));
              toggleDarkMode.addEventListener('click', handleToggleDarkMode);
              
              // Initial render
              if (reportData.length > 0) {
                selectedPage = reportData[0].name;
                pageSelect.value = selectedPage;
                renderPageData();
              }
            }
            
            // Handle page change
            function handlePageChange(event) {
              selectedPage = event.target.value;
              currentPage = 1; // Reset pagination
              renderPageData();
            }
            
            // Handle filter change
            function handleFilterChange() {
              filters.critical = filterCritical.checked;
              filters.serious = filterSerious.checked;
              filters.moderate = filterModerate.checked;
              filters.minor = filterMinor.checked;
              
              currentPage = 1; // Reset pagination
              renderViolations();
              updatePagination();
            }
            
            // Handle tab click
            function handleTabClick(event) {
              activeTab = event.target.getAttribute('data-tab');
              
              // Update tabs
              tabs.forEach(tab => {
                if (tab.getAttribute('data-tab') === activeTab) {
                  tab.classList.add('active');
                } else {
                  tab.classList.remove('active');
                }
              });
              
              // Update content
              tabContents.forEach(content => {
                if (content.id === activeTab) {
                  content.classList.add('active');
                } else {
                  content.classList.remove('active');
                }
              });
              
              renderPageData();
            }
            
            // Render page data
            function renderPageData() {
              const pageData = reportData.find(page => page.name === selectedPage);
              
              if (!pageData || !pageData.results) {
                violationsContainer.innerHTML = '<p>No data available for this page.</p>';
                passesContainer.innerHTML = '<p>No data available for this page.</p>';
                incompleteContainer.innerHTML = '<p>No data available for this page.</p>';
                screenshotContainer.innerHTML = '<p>No screenshot available.</p>';
                return;
              }
              
              renderViolations();
              renderPasses();
              renderIncomplete();
              renderScreenshot();
              updatePagination();
            }
            
            // Filter violations by impact
            function filterViolations(violations) {
              return violations.filter(violation => {
                switch (violation.impact) {
                  case 'critical':
                    return filters.critical;
                  case 'serious':
                    return filters.serious;
                  case 'moderate':
                    return filters.moderate;
                  case 'minor':
                    return filters.minor;
                  default:
                    return true;
                }
              });
            }
            
            // Render violations
            function renderViolations() {
              const pageData = reportData.find(page => page.name === selectedPage);
              
              if (!pageData || !pageData.results || !pageData.results.violations) {
                violationsContainer.innerHTML = '<p>No violations found for this page.</p>';
                return;
              }
              
              const filteredViolations = filterViolations(pageData.results.violations);
              
              if (filteredViolations.length === 0) {
                violationsContainer.innerHTML = '<p>No violations match the current filters.</p>';
                return;
              }
              
              // Paginate violations
              const start = (currentPage - 1) * itemsPerPage;
              const end = start + itemsPerPage;
              const paginatedViolations = filteredViolations.slice(start, end);
              
              violationsContainer.innerHTML = paginatedViolations.map(violation => renderViolation(violation)).join('');
            }
            
            // Render violation
            function renderViolation(violation) {
              const nodes = violation.nodes.slice(0, 3);
              
              // Avoid template literal that causes TypeScript parsing issues
              let html = '<div class="violation-card ' + violation.impact + '">';
              html += '<div class="violation-header">';
              html += '<div class="violation-title">' + violation.id + '</div>';
              html += '<span class="impact-badge impact-' + violation.impact + '">' + violation.impact + '</span>';
              html += '</div>';
              html += '<p class="violation-description">' + violation.description + '</p>';
              html += '<a href="' + violation.helpUrl + '" class="violation-help-url" target="_blank">' + violation.help + '</a>';
              html += '<p>Affected elements: ' + violation.nodes.length + '</p>';
              html += '<div class="violation-nodes">';
              
              // Process nodes
              for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                html += '<div class="node-item">';
                html += '<div class="html-snippet">' + escapeHtml(node.html) + '</div>';
                if (node.failureSummary) {
                  html += '<p>' + node.failureSummary + '</p>';
                }
                html += '</div>';
              }
              
              // Show ellipsis if there are more nodes
              if (violation.nodes.length > 3) {
                html += '<p>...and ' + (violation.nodes.length - 3) + ' more</p>';
              }
              
              html += '</div></div>';
              
              return html;
            }
            
            // Update pagination
            function updatePagination() {
              const pageData = reportData.find(page => page.name === selectedPage);
              
              if (!pageData || !pageData.results || !pageData.results.violations) {
                violationsPagination.innerHTML = '';
                return;
              }
              
              const filteredViolations = filterViolations(pageData.results.violations);
              const totalPages = Math.ceil(filteredViolations.length / itemsPerPage);
              
              if (totalPages <= 1) {
                violationsPagination.innerHTML = '';
                return;
              }
              
              // Generate pagination links
              let paginationHtml = '';
              
              for (let i = 1; i <= totalPages; i++) {
                // Use string concatenation instead of template literals
                let pageHtml = '<div class="pagination-item ';
                if (i === currentPage) {
                  pageHtml += 'active';
                }
                pageHtml += '" data-page="' + i + '">';
                pageHtml += i;
                pageHtml += '</div>';
                
                paginationHtml += pageHtml;
              }
              
              violationsPagination.innerHTML = paginationHtml;
              
              // Add event listeners
              document.querySelectorAll('.pagination-item').forEach(item => {
                item.addEventListener('click', event => {
                  currentPage = parseInt(event.target.getAttribute('data-page'));
                  renderViolations();
                  updatePagination();
                });
              });
            }
            
            // Render passes
            function renderPasses() {
              const pageData = reportData.find(page => page.name === selectedPage);
              
              if (!pageData || !pageData.results || !pageData.results.passes) {
                passesContainer.innerHTML = '<p>No passes found for this page.</p>';
                return;
              }
              
              // Convert from template literal to string concatenation
              let passesHtml = '';
              
              pageData.results.passes.forEach(pass => {
                passesHtml += '<li class="pass-item">';
                passesHtml += '<strong>' + pass.id + '</strong>: ' + pass.description;
                passesHtml += '<p>Elements passed: ' + pass.nodes.length + '</p>';
                passesHtml += '</li>';
              });
              
              passesContainer.innerHTML = passesHtml;
            }
            
            // Render incomplete
            function renderIncomplete() {
              const pageData = reportData.find(page => page.name === selectedPage);
              
              if (!pageData || !pageData.results || !pageData.results.incomplete) {
                incompleteContainer.innerHTML = '<p>No incomplete tests found for this page.</p>';
                return;
              }
              
              // Convert from template literal to string concatenation
              let incompleteHtml = '';
              
              pageData.results.incomplete.forEach(item => {
                incompleteHtml += '<li class="incomplete-item">';
                incompleteHtml += '<strong>' + item.id + '</strong>: ' + item.description;
                incompleteHtml += '<p>Elements: ' + item.nodes.length + '</p>';
                incompleteHtml += '</li>';
              });
              
              incompleteContainer.innerHTML = incompleteHtml;
            }
            
            // Render screenshot
            function renderScreenshot() {
              const pageData = reportData.find(page => page.name === selectedPage);
              
              if (!pageData) {
                screenshotContainer.innerHTML = '<p>No screenshot available.</p>';
                return;
              }
              
              // Convert from template literal to string concatenation
              const screenshotFile = pageData.name.toLowerCase() + '.png';
              
              // Create HTML with string concatenation
              const screenshotHtml = '<img src="/' + screenshotFile + '" alt="Screenshot of ' + pageData.name + '" class="screenshot">';
              
              screenshotContainer.innerHTML = screenshotHtml;
            }
            
            // Handle toggle dark mode
            function handleToggleDarkMode() {
              isDarkMode = !isDarkMode;
              document.body.classList.toggle('dark-mode', isDarkMode);
              
              // Update CSS custom properties
              if (isDarkMode) {
                document.documentElement.style.setProperty('--bg-color', '#212529');
                document.documentElement.style.setProperty('--text-color', '#f8f9fa');
                document.documentElement.style.setProperty('--hover-color', '#343a40');
                document.documentElement.style.setProperty('--border-color', '#495057');
              } else {
                document.documentElement.style.setProperty('--bg-color', '#f8f9fa');
                document.documentElement.style.setProperty('--text-color', '#212529');
                document.documentElement.style.setProperty('--hover-color', '#e9ecef');
                document.documentElement.style.setProperty('--border-color', '#dee2e6');
              }
            }
            
            // Helper function to escape HTML
            function escapeHtml(html) {
              const div = document.createElement('div');
              div.textContent = html;
              return div.innerHTML;
            }
            
            // Initialize
            fetchReportData();
          })();
        </script>
      </body>
      </html>
    `;
    
    res.send(html);
  });
  
  // Start server
  const server = app.listen(CONFIG.port, () => {
    const url = 'http://localhost:' + CONFIG.port;
    console.log(chalk.green('Accessibility Report available at ' + url));
    
    // Open in browser
    try {
      open(url);
    } catch (error) {
      console.log(chalk.yellow('Could not open browser automatically. Please visit ' + url + ' manually.'));
    }
  });
  
  return server;
};

// Main function
const runA11yTests = async () => {
  console.log(chalk.blue('Starting accessibility tests...'));
  
  // Check if dev server is running
  const serverRunning = await checkDevServer();
  
  if (!serverRunning) {
    process.exit(1);
  }
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: CONFIG.browser.args,
  });
  
  try {
    // Run tests on components
    console.log(chalk.blue('\nTesting components...\n'));
    const componentResults = [];
    
    for (const component of CONFIG.componentsToTest) {
      const result = await runA11yTest(browser, component);
      componentResults.push(result);
    }
    
    // Run tests on standard pages
    console.log(chalk.blue('\nTesting standard pages...\n'));
    const pageResults = [];
    
    for (const page of CONFIG.standardPages) {
      const result = await runA11yTest(browser, page);
      pageResults.push(result);
    }
    
    // Combine results
    const allResults = [...componentResults, ...pageResults];
    
    // Save results
    fs.writeFileSync(CONFIG.reportFile, JSON.stringify(allResults, null, 2));
    console.log(chalk.green('\nResults saved to ' + CONFIG.reportFile));
    
    // Generate summary
    const totalViolations = allResults.reduce((sum, result) => {
      if (result.results && result.results.violations) {
        return sum + result.results.violations.length;
      }
      return sum;
    }, 0);
    
    console.log(chalk.blue('\nAccessibility Test Summary:'));
    console.log(chalk.blue('---------------------------'));
    console.log('Pages tested: ' + allResults.length);
    console.log('Total violations: ' + totalViolations);
    
    // Start report server
    createReportServer(allResults);
    
    return allResults;
  } finally {
    await browser.close();
  }
};

// Run tests if executed directly
if (require.main === module) {
  runA11yTests()
    .catch(error => {
      console.error(chalk.red('Error running accessibility tests:'), error);
      process.exit(1);
    });
} else {
  // Export for use in other scripts
  module.exports = { runA11yTests };
} 