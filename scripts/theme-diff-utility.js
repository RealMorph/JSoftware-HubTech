//@ts-nocheck
/**
 * Theme Diff Utility
 * 
 * This script compares two theme files and generates a visual diff
 * to highlight changes between them.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const deepDiff = require('deep-diff');
const express = require('express');
const open = require('open');

// Configuration
const CONFIG = {
  themesDir: path.join(__dirname, '../src/theme'),
  outputDir: path.join(__dirname, '../theme-explorer'),
  port: 3790
};

// Ensure output directory exists
if (!fs.existsSync(CONFIG.outputDir)) {
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });
}

// Extract theme data from a theme file
const extractThemeData = (themePath) => {
  try {
    // Create a temporary script to extract the theme
    const tempFilePath = path.join(CONFIG.outputDir, 'temp-extract.js');
    const relativeThemePath = path.relative(CONFIG.outputDir, themePath).replace(/\\/g, '/');
    
    fs.writeFileSync(tempFilePath, `
      const fs = require('fs');
      const theme = require('../${relativeThemePath}');
      fs.writeFileSync('./extracted-theme.json', JSON.stringify(theme, null, 2));
    `);
    
    // Execute the script
    require('child_process').execSync(`node ${tempFilePath}`, { cwd: CONFIG.outputDir });
    
    // Read the extracted theme
    const extractedThemePath = path.join(CONFIG.outputDir, 'extracted-theme.json');
    const themeData = JSON.parse(fs.readFileSync(extractedThemePath, 'utf8'));
    
    // Clean up
    fs.unlinkSync(tempFilePath);
    fs.unlinkSync(extractedThemePath);
    
    return themeData;
  } catch (error) {
    console.error(chalk.red(`Error extracting theme from ${themePath}:`), error.message);
    return null;
  }
};

// Compare two themes and generate diff
const compareThemes = (theme1, theme2) => {
  if (!theme1 || !theme2) {
    return null;
  }
  
  try {
    return deepDiff.diff(theme1, theme2);
  } catch (error) {
    console.error(chalk.red('Error comparing themes:'), error.message);
    return null;
  }
};

// Flatten theme structure for easier visualization
const flattenTheme = (theme, prefix = '') => {
  const result = {};
  
  Object.keys(theme).forEach(key => {
    const value = theme[key];
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenTheme(value, newKey));
    } else {
      result[newKey] = value;
    }
  });
  
  return result;
};

// Create web server to display theme diff
const createDiffServer = (theme1Name, theme2Name, theme1Data, theme2Data, diffResult) => {
  const app = express();
  
  // Serve static files
  app.use(express.static(CONFIG.outputDir));
  
  // API endpoint for diff data
  app.get('/api/diff-data', (req, res) => {
    res.json({
      theme1: {
        name: theme1Name,
        data: theme1Data
      },
      theme2: {
        name: theme2Name,
        data: theme2Data
      },
      diff: diffResult,
      flattened: {
        theme1: flattenTheme(theme1Data),
        theme2: flattenTheme(theme2Data)
      }
    });
  });
  
  // Main HTML page
  app.get('/', (req, res) => {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Theme Diff Utility</title>
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
            --added-color: #d4edda;
            --removed-color: #f8d7da;
            --changed-color: #fff3cd;
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
              --added-color: #0f5132;
              --removed-color: #842029;
              --changed-color: #664d03;
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

          .themes-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 1rem;
            padding: 1rem;
            background-color: var(--hover-color);
            border-radius: 4px;
          }

          .theme-info {
            flex: 1;
            padding: 0.5rem;
          }

          .theme-info h3 {
            margin-top: 0;
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

          .diff-summary {
            margin-bottom: 1rem;
            padding: 1rem;
            background-color: var(--hover-color);
            border-radius: 4px;
          }

          .property-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1rem;
          }

          .property-card {
            border: 1px solid var(--border-color);
            border-radius: 4px;
            padding: 1rem;
            background-color: var(--bg-color);
            box-shadow: var(--card-shadow);
          }

          .property-card.added {
            background-color: var(--added-color);
          }

          .property-card.removed {
            background-color: var(--removed-color);
          }

          .property-card.changed {
            background-color: var(--changed-color);
          }

          .property-name {
            font-weight: bold;
            margin-bottom: 0.5rem;
          }

          .property-value {
            font-family: monospace;
            padding: 0.5rem;
            background-color: rgba(0, 0, 0, 0.05);
            border-radius: 4px;
            overflow-wrap: break-word;
          }

          .color-preview {
            display: flex;
            margin-bottom: 0.5rem;
          }

          .color-box {
            width: 50%;
            height: 40px;
            border-radius: 4px;
            border: 1px solid var(--border-color);
          }

          .color-label {
            font-size: 0.8rem;
            text-align: center;
            margin-top: 0.25rem;
          }

          .diff-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 1rem;
          }

          .diff-table th,
          .diff-table td {
            padding: 0.5rem;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
          }

          .diff-table th {
            background-color: var(--hover-color);
          }

          .diff-type {
            font-weight: bold;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            display: inline-block;
          }

          .diff-type.added {
            background-color: var(--added-color);
          }

          .diff-type.removed {
            background-color: var(--removed-color);
          }

          .diff-type.changed {
            background-color: var(--changed-color);
          }

          .search-bar {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid var(--border-color);
            border-radius: 4px;
            margin-bottom: 1rem;
            background-color: var(--bg-color);
            color: var(--text-color);
          }

          .toggle-theme {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            float: right;
          }

          .no-results {
            text-align: center;
            padding: 2rem;
            color: var(--secondary-color);
          }

          .filter-options {
            display: flex;
            gap: 1rem;
            margin-bottom: 1rem;
          }

          .filter-label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
        </style>
      </head>
      <body>
        <header>
          <div class="container">
            <h1>Theme Diff Utility</h1>
            <button id="toggle-dark-mode" class="toggle-theme">Toggle Dark Mode</button>
          </div>
        </header>
        
        <div class="container">
          <div class="themes-info">
            <div class="theme-info">
              <h3>Theme 1: <span id="theme1-name">${theme1Name}</span></h3>
            </div>
            <div class="theme-info">
              <h3>Theme 2: <span id="theme2-name">${theme2Name}</span></h3>
            </div>
          </div>
          
          <div class="search-container">
            <input type="text" id="search-input" class="search-bar" placeholder="Search properties...">
          </div>
          
          <div class="filter-options">
            <label class="filter-label">
              <input type="checkbox" id="filter-added" checked>
              <span class="diff-type added">Added</span>
            </label>
            <label class="filter-label">
              <input type="checkbox" id="filter-removed" checked>
              <span class="diff-type removed">Removed</span>
            </label>
            <label class="filter-label">
              <input type="checkbox" id="filter-changed" checked>
              <span class="diff-type changed">Changed</span>
            </label>
          </div>
          
          <div class="tabs">
            <div class="tab active" data-tab="visual-diff">Visual Diff</div>
            <div class="tab" data-tab="detailed-diff">Detailed Diff</div>
            <div class="tab" data-tab="raw-diff">Raw Diff</div>
          </div>
          
          <div id="diff-summary" class="diff-summary">
            <h3>Summary</h3>
            <p>Loading diff data...</p>
          </div>
          
          <div id="visual-diff" class="tab-content active">
            <div id="property-grid" class="property-grid">
              <div class="loading">Loading diff data...</div>
            </div>
          </div>
          
          <div id="detailed-diff" class="tab-content">
            <table id="diff-table" class="diff-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Path</th>
                  <th>Theme 1 Value</th>
                  <th>Theme 2 Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colspan="4">Loading diff data...</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div id="raw-diff" class="tab-content">
            <pre id="raw-diff-content"></pre>
          </div>
        </div>
        
        <script>
          // Theme Diff App
          (function() {
            // State
            let diffData = null;
            let searchQuery = '';
            let filters = {
              added: true,
              removed: true,
              changed: true
            };
            let isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            
            // DOM Elements
            const theme1Name = document.getElementById('theme1-name');
            const theme2Name = document.getElementById('theme2-name');
            const diffSummary = document.getElementById('diff-summary');
            const propertyGrid = document.getElementById('property-grid');
            const diffTable = document.getElementById('diff-table').querySelector('tbody');
            const rawDiffContent = document.getElementById('raw-diff-content');
            const searchInput = document.getElementById('search-input');
            const tabs = document.querySelectorAll('.tab');
            const tabContents = document.querySelectorAll('.tab-content');
            const toggleDarkMode = document.getElementById('toggle-dark-mode');
            const filterAdded = document.getElementById('filter-added');
            const filterRemoved = document.getElementById('filter-removed');
            const filterChanged = document.getElementById('filter-changed');
            
            // Fetch diff data
            async function fetchDiffData() {
              try {
                const response = await fetch('/api/diff-data');
                diffData = await response.json();
                
                // Update UI
                theme1Name.textContent = diffData.theme1.name;
                theme2Name.textContent = diffData.theme2.name;
                
                renderDiffSummary();
                renderVisualDiff();
                renderDetailedDiff();
                renderRawDiff();
              } catch (error) {
                console.error('Error fetching diff data:', error);
                propertyGrid.innerHTML = '<div class="no-results">Error loading diff data. Please try again.</div>';
              }
            }
            
            // Render diff summary
            function renderDiffSummary() {
              if (!diffData || !diffData.diff) {
                diffSummary.innerHTML = '<h3>Summary</h3><p>No differences found.</p>';
                return;
              }
              
              const changes = {
                added: 0,
                removed: 0,
                changed: 0
              };
              
              diffData.diff.forEach(diff => {
                switch (diff.kind) {
                  case 'N': // New (added)
                    changes.added++;
                    break;
                  case 'D': // Deleted (removed)
                    changes.removed++;
                    break;
                  case 'E': // Edited (changed)
                  case 'A': // Array change
                    changes.changed++;
                    break;
                }
              });
              
              const totalChanges = changes.added + changes.removed + changes.changed;
              
              diffSummary.innerHTML = 
                '<h3>Summary</h3>' +
                '<p>Found ' + totalChanges + ' differences between themes:</p>' +
                '<ul>' +
                  '<li><span class="diff-type added">Added</span>: ' + changes.added + ' properties</li>' +
                  '<li><span class="diff-type removed">Removed</span>: ' + changes.removed + ' properties</li>' +
                  '<li><span class="diff-type changed">Changed</span>: ' + changes.changed + ' properties</li>' +
                '</ul>';
            }
            
            // Render visual diff
            function renderVisualDiff() {
              if (!diffData || !diffData.diff) {
                propertyGrid.innerHTML = '<div class="no-results">No differences found between the themes.</div>';
                return;
              }
              
              const flattened1 = diffData.flattened.theme1;
              const flattened2 = diffData.flattened.theme2;
              
              // Group by kind
              const changes = {
                added: [],
                removed: [],
                changed: []
              };
              
              // Process diff
              diffData.diff.forEach(diff => {
                const path = diff.path.join('.');
                
                // Skip if filtered by search
                if (searchQuery && !path.toLowerCase().includes(searchQuery.toLowerCase())) {
                  return;
                }
                
                switch (diff.kind) {
                  case 'N': // New (added)
                    if (filters.added) {
                      changes.added.push({
                        path,
                        value: diff.rhs
                      });
                    }
                    break;
                  case 'D': // Deleted (removed)
                    if (filters.removed) {
                      changes.removed.push({
                        path,
                        value: diff.lhs
                      });
                    }
                    break;
                  case 'E': // Edited (changed)
                  case 'A': // Array change
                    if (filters.changed) {
                      changes.changed.push({
                        path,
                        oldValue: diff.lhs,
                        newValue: diff.rhs
                      });
                    }
                    break;
                }
              });
              
              // Generate cards
              const allChanges = [
                ...changes.added.map(change => renderPropertyCard(change, 'added')),
                ...changes.removed.map(change => renderPropertyCard(change, 'removed')),
                ...changes.changed.map(change => renderPropertyCard(change, 'changed'))
              ];
              
              if (allChanges.length === 0) {
                propertyGrid.innerHTML = '<div class="no-results">No differences match your filters.</div>';
              } else {
                propertyGrid.innerHTML = allChanges.join('');
              }
            }
            
            // Render property card
            function renderPropertyCard(change, type) {
              // Check if it's a color value
              const isOldColor = type !== 'added' && typeof change.oldValue === 'string' && 
                (change.oldValue.startsWith('#') || change.oldValue.startsWith('rgb') || change.oldValue.startsWith('hsl'));
              
              const isNewColor = type !== 'removed' && typeof change.newValue === 'string' && 
                (change.newValue.startsWith('#') || change.newValue.startsWith('rgb') || change.newValue.startsWith('hsl'));
              
              const showColorPreview = isOldColor || isNewColor;
              
              let colorPreview = '';
              
              if (showColorPreview) {
                if (type === 'changed') {
                  colorPreview = 
                    '<div class="color-preview">' +
                      '<div>' +
                        '<div class="color-box" style="background-color: ' + change.oldValue + '"></div>' +
                        '<div class="color-label">Theme 1</div>' +
                      '</div>' +
                      '<div>' +
                        '<div class="color-box" style="background-color: ' + change.newValue + '"></div>' +
                        '<div class="color-label">Theme 2</div>' +
                      '</div>' +
                    '</div>';
                } else if (type === 'added') {
                  colorPreview = 
                    '<div class="color-preview">' +
                      '<div>' +
                        '<div class="color-box" style="background-color: transparent"></div>' +
                        '<div class="color-label">Not present</div>' +
                      '</div>' +
                      '<div>' +
                        '<div class="color-box" style="background-color: ' + change.value + '"></div>' +
                        '<div class="color-label">Theme 2</div>' +
                      '</div>' +
                    '</div>';
                } else { // removed
                  colorPreview = 
                    '<div class="color-preview">' +
                      '<div>' +
                        '<div class="color-box" style="background-color: ' + change.value + '"></div>' +
                        '<div class="color-label">Theme 1</div>' +
                      '</div>' +
                      '<div>' +
                        '<div class="color-box" style="background-color: transparent"></div>' +
                        '<div class="color-label">Not present</div>' +
                      '</div>' +
                    '</div>';
                }
              }
              
              let valueDisplay = '';
              
              if (type === 'changed') {
                valueDisplay = 
                  '<div class="property-value">' +
                    '<div><strong>Theme 1:</strong> ' + JSON.stringify(change.oldValue) + '</div>' +
                    '<div><strong>Theme 2:</strong> ' + JSON.stringify(change.newValue) + '</div>' +
                  '</div>';
              } else {
                valueDisplay = 
                  '<div class="property-value">' +
                    JSON.stringify(change.value) +
                  '</div>';
              }
              
              return '<div class="property-card ' + type + '">' +
                '<div class="diff-type ' + type + '">' + type.charAt(0).toUpperCase() + type.slice(1) + '</div>' +
                colorPreview +
                '<div class="property-name">' + change.path + '</div>' +
                valueDisplay +
              '</div>';
            }
            
            // Render detailed diff
            function renderDetailedDiff() {
              if (!diffData || !diffData.diff) {
                diffTable.innerHTML = '<tr><td colspan="4">No differences found between the themes.</td></tr>';
                return;
              }
              
              const rows = [];
              
              diffData.diff.forEach(diff => {
                const path = diff.path.join('.');
                
                // Skip if filtered by search
                if (searchQuery && !path.toLowerCase().includes(searchQuery.toLowerCase())) {
                  return;
                }
                
                let type = '';
                let theme1Value = '';
                let theme2Value = '';
                
                switch (diff.kind) {
                  case 'N': // New (added)
                    if (!filters.added) return;
                    type = '<span class="diff-type added">Added</span>';
                    theme1Value = '-';
                    theme2Value = JSON.stringify(diff.rhs);
                    break;
                  case 'D': // Deleted (removed)
                    if (!filters.removed) return;
                    type = '<span class="diff-type removed">Removed</span>';
                    theme1Value = JSON.stringify(diff.lhs);
                    theme2Value = '-';
                    break;
                  case 'E': // Edited (changed)
                  case 'A': // Array change
                    if (!filters.changed) return;
                    type = '<span class="diff-type changed">Changed</span>';
                    theme1Value = JSON.stringify(diff.lhs);
                    theme2Value = JSON.stringify(diff.rhs);
                    break;
                }
                
                rows.push(
                  '<tr>' +
                    '<td>' + type + '</td>' +
                    '<td>' + path + '</td>' +
                    '<td>' + theme1Value + '</td>' +
                    '<td>' + theme2Value + '</td>' +
                  '</tr>'
                );
              });
              
              if (rows.length === 0) {
                diffTable.innerHTML = '<tr><td colspan="4">No differences match your filters.</td></tr>';
              } else {
                diffTable.innerHTML = rows.join('');
              }
            }
            
            // Render raw diff
            function renderRawDiff() {
              if (!diffData || !diffData.diff) {
                rawDiffContent.textContent = 'No differences found between the themes.';
                return;
              }
              
              rawDiffContent.textContent = JSON.stringify(diffData.diff, null, 2);
            }
            
            // Handle tab click
            function handleTabClick(event) {
              const tabId = event.target.getAttribute('data-tab');
              
              // Update tabs
              tabs.forEach(tab => {
                if (tab.getAttribute('data-tab') === tabId) {
                  tab.classList.add('active');
                } else {
                  tab.classList.remove('active');
                }
              });
              
              // Update content
              tabContents.forEach(content => {
                if (content.id === tabId) {
                  content.classList.add('active');
                } else {
                  content.classList.remove('active');
                }
              });
            }
            
            // Handle search
            function handleSearch() {
              searchQuery = searchInput.value.toLowerCase();
              renderVisualDiff();
              renderDetailedDiff();
            }
            
            // Handle filter change
            function handleFilterChange() {
              filters.added = filterAdded.checked;
              filters.removed = filterRemoved.checked;
              filters.changed = filterChanged.checked;
              
              renderVisualDiff();
              renderDetailedDiff();
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
                document.documentElement.style.setProperty('--added-color', '#0f5132');
                document.documentElement.style.setProperty('--removed-color', '#842029');
                document.documentElement.style.setProperty('--changed-color', '#664d03');
              } else {
                document.documentElement.style.setProperty('--bg-color', '#f8f9fa');
                document.documentElement.style.setProperty('--text-color', '#212529');
                document.documentElement.style.setProperty('--hover-color', '#e9ecef');
                document.documentElement.style.setProperty('--border-color', '#dee2e6');
                document.documentElement.style.setProperty('--added-color', '#d4edda');
                document.documentElement.style.setProperty('--removed-color', '#f8d7da');
                document.documentElement.style.setProperty('--changed-color', '#fff3cd');
              }
            }
            
            // Set up event listeners
            tabs.forEach(tab => tab.addEventListener('click', handleTabClick));
            searchInput.addEventListener('input', handleSearch);
            toggleDarkMode.addEventListener('click', handleToggleDarkMode);
            filterAdded.addEventListener('change', handleFilterChange);
            filterRemoved.addEventListener('change', handleFilterChange);
            filterChanged.addEventListener('change', handleFilterChange);
            
            // Initialize
            fetchDiffData();
          })();
        </script>
      </body>
      </html>
    `;
    
    res.send(html);
  });
  
  // Start server
  const server = app.listen(CONFIG.port, () => {
    const url = `http://localhost:${CONFIG.port}`;
    console.log(chalk.green(`Theme Diff Utility running at ${url}`));
    
    // Open in browser
    try {
      open(url);
    } catch (error) {
      console.log(chalk.yellow(`Could not open browser automatically. Please visit ${url} manually.`));
    }
  });
  
  return server;
};

// Main function
const runThemeDiff = (theme1Path, theme2Path) => {
  console.log(chalk.blue('Starting Theme Diff Utility...'));
  
  if (!theme1Path || !theme2Path) {
    console.error(chalk.red('Please provide two theme files to compare'));
    console.log(chalk.yellow('Usage: node theme-diff-utility.js <theme1-path> <theme2-path>'));
    process.exit(1);
  }
  
  // Resolve paths
  const resolvedTheme1Path = path.resolve(theme1Path);
  const resolvedTheme2Path = path.resolve(theme2Path);
  
  // Check if files exist
  if (!fs.existsSync(resolvedTheme1Path)) {
    console.error(chalk.red(`Theme file not found: ${theme1Path}`));
    process.exit(1);
  }
  
  if (!fs.existsSync(resolvedTheme2Path)) {
    console.error(chalk.red(`Theme file not found: ${theme2Path}`));
    process.exit(1);
  }
  
  // Extract theme data
  console.log(chalk.blue(`Extracting theme data from ${theme1Path}...`));
  const theme1Data = extractThemeData(resolvedTheme1Path);
  
  console.log(chalk.blue(`Extracting theme data from ${theme2Path}...`));
  const theme2Data = extractThemeData(resolvedTheme2Path);
  
  if (!theme1Data || !theme2Data) {
    console.error(chalk.red('Failed to extract theme data'));
    process.exit(1);
  }
  
  // Compare themes
  console.log(chalk.blue('Comparing themes...'));
  const diffResult = compareThemes(theme1Data, theme2Data);
  
  if (!diffResult || diffResult.length === 0) {
    console.log(chalk.green('No differences found between the themes'));
    process.exit(0);
  }
  
  console.log(chalk.green(`Found ${diffResult.length} differences between themes`));
  
  // Get theme names from file paths
  const theme1Name = path.basename(theme1Path, path.extname(theme1Path));
  const theme2Name = path.basename(theme2Path, path.extname(theme2Path));
  
  // Create server to display diff
  const server = createDiffServer(theme1Name, theme2Name, theme1Data, theme2Data, diffResult);
  
  // Handle server shutdown
  process.on('SIGINT', () => {
    console.log(chalk.yellow('\nShutting down Theme Diff Utility...'));
    server.close();
    process.exit(0);
  });
};

// Run if executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  runThemeDiff(args[0], args[1]);
} else {
  // Export for use in other scripts
  module.exports = { runThemeDiff };
} 