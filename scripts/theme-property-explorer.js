/**
 * Theme Property Explorer
 * 
 * This script creates a web interface for exploring and visualizing theme properties.
 * It extracts theme values from theme files and presents them in an interactive UI.
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const open = require('open');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  port: 3789,
  themesDir: path.join(__dirname, '../src/theme'),
  outputDir: path.join(__dirname, '../theme-explorer'),
  cacheFile: path.join(__dirname, '../theme-explorer/theme-cache.json'),
};

// Ensure output directory exists
if (!fs.existsSync(CONFIG.outputDir)) {
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });
}

// Extract theme data from theme files
const extractThemeData = () => {
  console.log(chalk.blue('Extracting theme data...'));
  
  // Get a list of theme files
  const themeFiles = fs.readdirSync(CONFIG.themesDir)
    .filter(file => file.endsWith('.ts') && (
      file.includes('theme') || 
      file.includes('palette') || 
      file.includes('color') || 
      file.includes('typography')
    ));
  
  // Create temporary script to extract theme data
  const tempScriptPath = path.join(CONFIG.outputDir, 'extract-theme.js');
  
  fs.writeFileSync(tempScriptPath, `
    // Temporary script to extract theme data
    const fs = require('fs');
    const path = require('path');
    
    // Import theme files
    const themeData = {};
    
    ${themeFiles.map(file => {
      const name = path.basename(file, '.ts');
      return `try {
        const ${name} = require('../src/theme/${file}');
        themeData.${name} = ${name};
      } catch (e) {
        console.error('Error importing ${file}:', e.message);
      }`;
    }).join('\n\n')}
    
    // Save theme data to cache file
    fs.writeFileSync(path.join(__dirname, 'theme-cache.json'), JSON.stringify(themeData, null, 2));
  `);
  
  try {
    // Run the temporary script to extract theme data
    execSync(`node ${tempScriptPath}`, { stdio: 'inherit' });
    console.log(chalk.green('Theme data extracted successfully'));
    
    // Clean up temporary script
    fs.unlinkSync(tempScriptPath);
    
    // Return the extracted theme data
    return JSON.parse(fs.readFileSync(CONFIG.cacheFile, 'utf8'));
  } catch (error) {
    console.error(chalk.red('Error extracting theme data:'), error.message);
    
    // Fallback: return empty theme data
    return {};
  }
};

// Process theme data into a more usable format
const processThemeData = (themeData) => {
  const processed = {
    themes: {},
    categories: [],
    properties: {},
  };
  
  // Extract themes
  Object.keys(themeData).forEach(key => {
    const data = themeData[key];
    
    if (typeof data === 'object' && data !== null) {
      // Check if this looks like a theme object
      if (data.palette || data.typography || data.spacing || data.colors) {
        processed.themes[key] = data;
      }
      
      // Extract categories and properties
      Object.keys(data).forEach(category => {
        if (typeof data[category] === 'object' && data[category] !== null) {
          if (!processed.categories.includes(category)) {
            processed.categories.push(category);
          }
          
          processed.properties[category] = processed.properties[category] || [];
          
          // Extract properties
          Object.keys(data[category]).forEach(prop => {
            if (!processed.properties[category].includes(prop)) {
              processed.properties[category].push(prop);
            }
          });
        }
      });
    }
  });
  
  return processed;
};

// Create a web server to browse theme data
const createThemeExplorerServer = (themeData) => {
  const app = express();
  const processed = processThemeData(themeData);
  
  // Serve static files
  app.use(express.static(CONFIG.outputDir));
  
  // API endpoint for theme data
  app.get('/api/theme-data', (req, res) => {
    res.json(processed);
  });
  
  // Main HTML page
  app.get('/', (req, res) => {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Theme Property Explorer</title>
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

          .theme-explorer {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
          }

          .sidebar {
            width: 250px;
            border-right: 1px solid var(--border-color);
            padding-right: 1rem;
          }

          .main-content {
            flex: 1;
          }

          .theme-selector {
            margin-bottom: 1rem;
          }

          .theme-selector select {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid var(--border-color);
            border-radius: 4px;
            background-color: var(--bg-color);
            color: var(--text-color);
          }

          .category-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }

          .category-item {
            padding: 0.5rem;
            cursor: pointer;
            border-radius: 4px;
          }

          .category-item:hover {
            background-color: var(--hover-color);
          }

          .category-item.active {
            background-color: var(--primary-color);
            color: white;
          }

          .property-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 1rem;
          }

          .property-card {
            border: 1px solid var(--border-color);
            border-radius: 4px;
            padding: 1rem;
            background-color: var(--bg-color);
            box-shadow: var(--card-shadow);
          }

          .property-name {
            font-weight: bold;
            margin-bottom: 0.5rem;
          }

          .property-value {
            font-family: monospace;
            padding: 0.5rem;
            background-color: var(--hover-color);
            border-radius: 4px;
            overflow-wrap: break-word;
          }

          .color-preview {
            width: 100%;
            height: 50px;
            border-radius: 4px;
            margin-bottom: 0.5rem;
            border: 1px solid var(--border-color);
          }

          .loading {
            text-align: center;
            padding: 2rem;
            font-style: italic;
            color: var(--secondary-color);
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

          @media (max-width: 768px) {
            .theme-explorer {
              flex-direction: column;
            }

            .sidebar {
              width: 100%;
              border-right: none;
              border-bottom: 1px solid var(--border-color);
              padding-right: 0;
              padding-bottom: 1rem;
              margin-bottom: 1rem;
            }
          }
        </style>
      </head>
      <body>
        <header>
          <div class="container">
            <h1>Theme Property Explorer</h1>
            <button id="toggle-dark-mode" class="toggle-theme">Toggle Dark Mode</button>
          </div>
        </header>
        
        <div class="container">
          <div class="theme-explorer">
            <div class="sidebar">
              <div class="theme-selector">
                <label for="theme-select">Select Theme:</label>
                <select id="theme-select"></select>
              </div>
              
              <div class="search-container">
                <input type="text" id="search-input" class="search-bar" placeholder="Search properties...">
              </div>
              
              <h3>Categories</h3>
              <ul id="category-list" class="category-list"></ul>
            </div>
            
            <div class="main-content">
              <h2 id="category-title">Select a category</h2>
              <div id="property-grid" class="property-grid">
                <div class="loading">Loading theme data...</div>
              </div>
            </div>
          </div>
        </div>
        
        <script>
          // Theme Explorer App
          (function() {
            // State
            let themeData = null;
            let selectedTheme = '';
            let selectedCategory = '';
            let searchQuery = '';
            let isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            
            // DOM Elements
            const themeSelect = document.getElementById('theme-select');
            const categoryList = document.getElementById('category-list');
            const categoryTitle = document.getElementById('category-title');
            const propertyGrid = document.getElementById('property-grid');
            const searchInput = document.getElementById('search-input');
            const toggleDarkMode = document.getElementById('toggle-dark-mode');
            
            // Fetch theme data
            async function fetchThemeData() {
              try {
                const response = await fetch('/api/theme-data');
                themeData = await response.json();
                
                // Initialize UI
                initializeUI();
              } catch (error) {
                console.error('Error fetching theme data:', error);
                propertyGrid.innerHTML = '<div class="no-results">Error loading theme data. Please try again.</div>';
              }
            }
            
            // Initialize UI
            function initializeUI() {
              // Populate theme selector
              const themeOptions = Object.keys(themeData.themes);
              if (themeOptions.length > 0) {
                selectedTheme = themeOptions[0];
                
                themeOptions.forEach(theme => {
                  const option = document.createElement('option');
                  option.value = theme;
                  option.textContent = theme;
                  themeSelect.appendChild(option);
                });
              }
              
              // Populate category list
              themeData.categories.forEach(category => {
                const li = document.createElement('li');
                li.className = 'category-item';
                li.textContent = category;
                li.setAttribute('data-category', category);
                categoryList.appendChild(li);
              });
              
              // Set up event listeners
              themeSelect.addEventListener('change', handleThemeChange);
              categoryList.addEventListener('click', handleCategoryClick);
              searchInput.addEventListener('input', handleSearch);
              toggleDarkMode.addEventListener('click', handleToggleDarkMode);
              
              // Initial render
              if (themeData.categories.length > 0) {
                selectedCategory = themeData.categories[0];
                updateActiveCategory();
                renderProperties();
              }
            }
            
            // Handle theme change
            function handleThemeChange(event) {
              selectedTheme = event.target.value;
              renderProperties();
            }
            
            // Handle category click
            function handleCategoryClick(event) {
              if (event.target.classList.contains('category-item')) {
                selectedCategory = event.target.getAttribute('data-category');
                updateActiveCategory();
                renderProperties();
              }
            }
            
            // Update active category
            function updateActiveCategory() {
              document.querySelectorAll('.category-item').forEach(item => {
                if (item.getAttribute('data-category') === selectedCategory) {
                  item.classList.add('active');
                } else {
                  item.classList.remove('active');
                }
              });
              
              categoryTitle.textContent = selectedCategory;
            }
            
            // Handle search
            function handleSearch(event) {
              searchQuery = event.target.value.toLowerCase();
              renderProperties();
            }
            
            // Handle toggle dark mode
            function handleToggleDarkMode() {
              isDarkMode = !isDarkMode;
              document.body.classList.toggle('dark-mode', isDarkMode);
              
              // You could also update CSS custom properties here
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
            
            // Render properties
            function renderProperties() {
              if (!selectedTheme || !selectedCategory) {
                propertyGrid.innerHTML = '<div class="no-results">Select a theme and category to view properties</div>';
                return;
              }
              
              const theme = themeData.themes[selectedTheme];
              const categoryData = theme[selectedCategory];
              
              if (!categoryData) {
                propertyGrid.innerHTML = '<div class="no-results">No properties found for this category</div>';
                return;
              }
              
              const properties = themeData.properties[selectedCategory] || [];
              
              // Filter properties by search query
              const filteredProperties = searchQuery 
                ? properties.filter(prop => prop.toLowerCase().includes(searchQuery) || 
                    String(categoryData[prop]).toLowerCase().includes(searchQuery))
                : properties;
              
              if (filteredProperties.length === 0) {
                propertyGrid.innerHTML = '<div class="no-results">No properties match your search</div>';
                return;
              }
              
              // Generate property cards
              propertyGrid.innerHTML = filteredProperties.map(prop => {
                const value = categoryData[prop];
                const isColor = (typeof value === 'string' && 
                  (value.startsWith('#') || value.startsWith('rgb') || value.startsWith('hsl')));
                
                return `
                  <div class="property-card">
                    ${isColor ? `<div class="color-preview" style="background-color: ${value}"></div>` : ''}
                    <div class="property-name">${prop}</div>
                    <div class="property-value">${JSON.stringify(value)}</div>
                  </div>
                `;
              }).join('');
            }
            
            // Initialize
            fetchThemeData();
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
    console.log(chalk.green(`Theme Property Explorer running at ${url}`));
    
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
const startThemeExplorer = () => {
  console.log(chalk.blue('Starting Theme Property Explorer...'));
  
  // Extract theme data
  const themeData = extractThemeData();
  
  // Create server
  const server = createThemeExplorerServer(themeData);
  
  // Handle server shutdown
  process.on('SIGINT', () => {
    console.log(chalk.yellow('\nShutting down Theme Property Explorer...'));
    server.close();
    process.exit(0);
  });
};

// Run if executed directly
if (require.main === module) {
  startThemeExplorer();
} else {
  // Export for use in other scripts
  module.exports = { startThemeExplorer };
} 