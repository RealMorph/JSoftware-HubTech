#!/usr/bin/env node

/**
 * Build Analytics Main Script
 * 
 * This script orchestrates all the build analytics tools to provide a comprehensive
 * analysis of the project's build process, including bundle size, dependencies,
 * unused code, and performance metrics.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Configuration
const config = {
  outputDir: path.resolve(__dirname, '../../dist'),
  reportFile: path.resolve(__dirname, '../../dist/build-analytics-report.html'),
  scriptDir: path.resolve(__dirname, '../build-analytics'),
};

// Banner
console.log(chalk.blue.bold('================================='));
console.log(chalk.blue.bold('  BUILD ANALYTICS SUITE'));
console.log(chalk.blue.bold('================================='));
console.log('');

/**
 * Execute build with analytics
 */
function executeBuild() {
  console.log(chalk.cyan('Step 1: Running build with analytics enabled...'));
  try {
    execSync('npm run build', { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(chalk.red('Build failed:'), error.message);
    return false;
  }
}

/**
 * Run bundle size analysis
 */
function analyzeBundleSize() {
  console.log(chalk.cyan('\nStep 2: Analyzing bundle size...'));
  try {
    execSync('node scripts/analyze-chunks.js', { stdio: 'inherit' });
    execSync('node scripts/analyze-assets.js', { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(chalk.red('Bundle size analysis failed:'), error.message);
    return false;
  }
}

/**
 * Run dependency analysis
 */
function analyzeDependencies() {
  console.log(chalk.cyan('\nStep 3: Analyzing dependencies...'));
  try {
    execSync('node scripts/analyze-dependencies.js', { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(chalk.red('Dependency analysis failed:'), error.message);
    return false;
  }
}

/**
 * Run dependency graph visualization
 */
function generateDependencyGraph() {
  console.log(chalk.cyan('\nStep 4: Generating dependency graph...'));
  try {
    execSync(`node ${path.join(config.scriptDir, 'dependency-graph.js')}`, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(chalk.red('Dependency graph generation failed:'), error.message);
    return false;
  }
}

/**
 * Run unused code analysis
 */
function analyzeUnusedCode() {
  console.log(chalk.cyan('\nStep 5: Detecting unused code...'));
  try {
    execSync(`node ${path.join(config.scriptDir, 'unused-code-detector.js')}`, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(chalk.red('Unused code detection failed:'), error.message);
    return false;
  }
}

/**
 * Track build performance metrics
 */
function trackBuildPerformance() {
  console.log(chalk.cyan('\nStep 6: Tracking build performance...'));
  try {
    execSync('node scripts/track-build-performance.js', { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(chalk.red('Build performance tracking failed:'), error.message);
    return false;
  }
}

/**
 * Generate comprehensive HTML report
 */
function generateReport(results) {
  console.log(chalk.cyan('\nStep 7: Generating comprehensive report...'));
  
  try {
    // Make sure output directory exists
    if (!fs.existsSync(config.outputDir)) {
      fs.mkdirSync(config.outputDir, { recursive: true });
    }
    
    // Read individual reports
    const reports = {
      buildAnalysis: fs.existsSync(path.resolve(config.outputDir, 'build-analysis.txt')) 
        ? fs.readFileSync(path.resolve(config.outputDir, 'build-analysis.txt'), 'utf8') 
        : null,
      chunkAnalysis: fs.existsSync(path.resolve(config.outputDir, 'chunk-analysis.txt')) 
        ? fs.readFileSync(path.resolve(config.outputDir, 'chunk-analysis.txt'), 'utf8') 
        : null,
      assetAnalysis: fs.existsSync(path.resolve(config.outputDir, 'asset-analysis.txt')) 
        ? fs.readFileSync(path.resolve(config.outputDir, 'asset-analysis.txt'), 'utf8') 
        : null,
      dependencyAnalysis: fs.existsSync(path.resolve(config.outputDir, 'dependency-analysis.txt')) 
        ? fs.readFileSync(path.resolve(config.outputDir, 'dependency-analysis.txt'), 'utf8') 
        : null,
      buildPerformance: fs.existsSync(path.resolve(config.outputDir, 'build-time.txt')) 
        ? fs.readFileSync(path.resolve(config.outputDir, 'build-time.txt'), 'utf8') 
        : null,
      unusedCode: fs.existsSync(path.resolve(config.outputDir, 'unused-code-report.txt')) 
        ? fs.readFileSync(path.resolve(config.outputDir, 'unused-code-report.txt'), 'utf8') 
        : null,
    };
    
    // Create HTML report
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Build Analytics Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      padding: 30px;
      margin-bottom: 30px;
    }
    h1, h2, h3 {
      color: #2c3e50;
    }
    h1 {
      text-align: center;
      border-bottom: 2px solid #eee;
      padding-bottom: 15px;
      margin-bottom: 30px;
    }
    .dashboard {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      grid-gap: 20px;
      margin-bottom: 30px;
    }
    .metric-card {
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
      transition: transform 0.3s;
    }
    .metric-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    .metric-value {
      font-size: 2em;
      font-weight: bold;
      margin: 10px 0;
      color: #3498db;
    }
    .metric-label {
      font-size: 0.9em;
      text-transform: uppercase;
      color: #7f8c8d;
    }
    .section {
      margin-bottom: 40px;
    }
    .tabs {
      display: flex;
      border-bottom: 1px solid #ddd;
      margin-bottom: 20px;
    }
    .tab {
      padding: 10px 20px;
      cursor: pointer;
      border-bottom: 2px solid transparent;
    }
    .tab.active {
      border-bottom: 2px solid #3498db;
      font-weight: bold;
    }
    .tab-content {
      display: none;
    }
    .tab-content.active {
      display: block;
    }
    pre {
      background-color: #f8f8f8;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 15px;
      overflow-x: auto;
      white-space: pre-wrap;
      font-family: monospace;
      font-size: 14px;
    }
    .summary {
      background-color: #e8f4fc;
      border-left: 4px solid #3498db;
      padding: 15px;
      margin-bottom: 20px;
      border-radius: 0 4px 4px 0;
    }
    .error {
      color: #e74c3c;
      background-color: #fadbd8;
      border-radius: 4px;
      padding: 10px;
    }
    .success {
      color: #27ae60;
    }
    .links {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 20px;
    }
    .link-btn {
      display: inline-block;
      padding: 8px 16px;
      background-color: #3498db;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      transition: background-color 0.3s;
    }
    .link-btn:hover {
      background-color: #2980b9;
    }
    .status-summary {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
    }
    .status-icon {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      margin-right: 10px;
    }
    .status-success {
      background-color: #2ecc71;
    }
    .status-warning {
      background-color: #f39c12;
    }
    .status-error {
      background-color: #e74c3c;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Build Analytics Report</h1>
    
    <div class="status-summary">
      <div class="status-icon ${
        Object.values(results).every(r => r) ? 'status-success' : 
        Object.values(results).some(r => r) ? 'status-warning' : 'status-error'
      }"></div>
      <div>
        <strong>Analysis Completed: ${new Date().toLocaleString()}</strong><br>
        Status: ${
          Object.values(results).every(r => r) ? '<span class="success">All analyses completed successfully</span>' : 
          Object.values(results).some(r => r) ? '<span>Some analyses completed with warnings</span>' :
          '<span class="error">Analysis failed</span>'
        }
      </div>
    </div>
    
    <div class="links">
      <a href="stats.html" class="link-btn" target="_blank">Bundle Visualization</a>
      <a href="dependency-graph.html" class="link-btn" target="_blank">Dependency Graph</a>
    </div>
    
    <div class="section">
      <h2>Analysis Results</h2>
      
      <div class="tabs">
        <div class="tab active" data-tab="bundle">Bundle Analysis</div>
        <div class="tab" data-tab="asset">Asset Analysis</div>
        <div class="tab" data-tab="dependency">Dependency Analysis</div>
        <div class="tab" data-tab="performance">Performance</div>
        <div class="tab" data-tab="unused">Unused Code</div>
      </div>
      
      <div class="tab-content active" id="bundle-tab">
        <div class="summary">
          <h3>Bundle Analysis Summary</h3>
          <p>Analysis of JavaScript bundles, chunks, and code splitting efficiency.</p>
        </div>
        ${reports.buildAnalysis ? `<pre>${reports.buildAnalysis}</pre>` : 
          `<div class="error">Bundle analysis report not available</div>`}
        ${reports.chunkAnalysis ? `<pre>${reports.chunkAnalysis}</pre>` : ''}
      </div>
      
      <div class="tab-content" id="asset-tab">
        <div class="summary">
          <h3>Asset Analysis Summary</h3>
          <p>Analysis of all assets including images, fonts, and other resources.</p>
        </div>
        ${reports.assetAnalysis ? `<pre>${reports.assetAnalysis}</pre>` : 
          `<div class="error">Asset analysis report not available</div>`}
      </div>
      
      <div class="tab-content" id="dependency-tab">
        <div class="summary">
          <h3>Dependency Analysis Summary</h3>
          <p>Analysis of project dependencies and their impact on bundle size.</p>
        </div>
        ${reports.dependencyAnalysis ? `<pre>${reports.dependencyAnalysis}</pre>` : 
          `<div class="error">Dependency analysis report not available</div>`}
      </div>
      
      <div class="tab-content" id="performance-tab">
        <div class="summary">
          <h3>Build Performance Summary</h3>
          <p>Analysis of build times and performance metrics over time.</p>
        </div>
        ${reports.buildPerformance ? `<pre>${reports.buildPerformance}</pre>` : 
          `<div class="error">Build performance report not available</div>`}
      </div>
      
      <div class="tab-content" id="unused-tab">
        <div class="summary">
          <h3>Unused Code Analysis</h3>
          <p>Detection of potentially unused code that could be removed.</p>
        </div>
        ${reports.unusedCode ? `<pre>${reports.unusedCode}</pre>` : 
          `<div class="error">Unused code report not available</div>`}
      </div>
    </div>
  </div>

  <script>
    // Tab switching functionality
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab
        tab.classList.add('active');
        
        // Show corresponding content
        const tabId = tab.dataset.tab;
        document.getElementById(tabId + '-tab').classList.add('active');
      });
    });
  </script>
</body>
</html>
    `;
    
    // Write HTML report
    fs.writeFileSync(config.reportFile, html);
    
    console.log(chalk.green(`Comprehensive report generated: ${config.reportFile}`));
    return true;
  } catch (error) {
    console.error(chalk.red('Report generation failed:'), error.message);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  const results = {
    build: false,
    bundleSize: false,
    dependencies: false,
    dependencyGraph: false,
    unusedCode: false,
    performance: false,
    report: false,
  };
  
  // Step 1: Execute build
  results.build = executeBuild();
  if (!results.build) {
    console.error(chalk.red('\nBuild failed. Cannot continue with analytics.'));
    return;
  }
  
  // Step 2: Analyze bundle size
  results.bundleSize = analyzeBundleSize();
  
  // Step 3: Analyze dependencies
  results.dependencies = analyzeDependencies();
  
  // Step 4: Generate dependency graph
  results.dependencyGraph = generateDependencyGraph();
  
  // Step 5: Analyze unused code
  results.unusedCode = analyzeUnusedCode();
  
  // Step 6: Track build performance
  results.performance = trackBuildPerformance();
  
  // Step 7: Generate comprehensive report
  results.report = generateReport(results);
  
  // Print summary
  console.log(chalk.blue.bold('\n================================='));
  console.log(chalk.blue.bold('  BUILD ANALYTICS SUMMARY'));
  console.log(chalk.blue.bold('================================='));
  
  console.log(`Build: ${results.build ? chalk.green('✓') : chalk.red('✗')}`);
  console.log(`Bundle Size Analysis: ${results.bundleSize ? chalk.green('✓') : chalk.red('✗')}`);
  console.log(`Dependency Analysis: ${results.dependencies ? chalk.green('✓') : chalk.red('✗')}`);
  console.log(`Dependency Graph: ${results.dependencyGraph ? chalk.green('✓') : chalk.red('✗')}`);
  console.log(`Unused Code Detection: ${results.unusedCode ? chalk.green('✓') : chalk.red('✗')}`);
  console.log(`Performance Tracking: ${results.performance ? chalk.green('✓') : chalk.red('✗')}`);
  console.log(`Report Generation: ${results.report ? chalk.green('✓') : chalk.red('✗')}`);
  
  if (results.report) {
    console.log(chalk.green(`\nAnalysis complete! Open ${config.reportFile} in your browser to view the report.`));
  } else {
    console.log(chalk.yellow('\nAnalysis completed with some failures. Check the logs for details.'));
  }
}

// Run the main function
main(); 