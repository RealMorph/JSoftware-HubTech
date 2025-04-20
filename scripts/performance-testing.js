/**
 * Performance testing script for component rendering
 * Measures render time and interaction time for core components
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');

// Configuration
const config = {
  outputDir: path.resolve(__dirname, '../dist'),
  reportFile: path.resolve(__dirname, '../dist/performance-report.json'),
  summaryFile: path.resolve(__dirname, '../dist/performance-summary.txt'),
  components: [
    { name: 'Button', path: '/components/button' },
    { name: 'TextField', path: '/components/textfield' },
    { name: 'Card', path: '/components/card' },
    { name: 'List', path: '/components/list' },
    { name: 'Table', path: '/components/table' },
    { name: 'DataGrid', path: '/components/datagrid' },
  ],
  metrics: {
    FCP: 'First Contentful Paint',
    LCP: 'Largest Contentful Paint',
    CLS: 'Cumulative Layout Shift',
    FID: 'First Input Delay',
    TTI: 'Time to Interactive',
  },
  thresholds: {
    FCP: 1000, // 1 second
    LCP: 2500, // 2.5 seconds
    CLS: 0.1,  // 0.1 score
    FID: 100,  // 100ms
    TTI: 3500, // 3.5 seconds
    renderTime: 50, // 50ms for component render
    interactionTime: 100, // 100ms for interaction response
  },
  iterations: 5, // Number of times to run each test for averaging
};

// Ensure output directory exists
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

/**
 * Run performance tests for all components
 */
async function runPerformanceTests() {
  console.log(chalk.blue('Running performance tests...'));

  // Start development server
  console.log(chalk.blue('Starting development server...'));
  try {
    execSync('npm run dev', { stdio: 'ignore' });
  } catch (error) {
    console.error(chalk.red('Failed to start development server'), error);
    return;
  }

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Launch browser
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1280, height: 800 },
  });

  // Results array
  const results = [];

  try {
    // Test each component
    for (const component of config.components) {
      console.log(chalk.blue(`Testing ${component.name}...`));
      
      const componentResults = [];
      
      // Run multiple iterations for consistent results
      for (let i = 0; i < config.iterations; i++) {
        // Create a new page for each iteration
        const page = await browser.newPage();
        
        // Collect performance metrics
        await page.evaluateOnNewDocument(() => {
          window.performanceMetrics = {
            renderStart: 0,
            renderEnd: 0,
            interactionStart: 0,
            interactionEnd: 0,
          };
          
          // Override performance.mark to capture render and interaction times
          const originalMark = performance.mark;
          performance.mark = function(name) {
            if (name === 'component-render-start') {
              window.performanceMetrics.renderStart = performance.now();
            } else if (name === 'component-render-end') {
              window.performanceMetrics.renderEnd = performance.now();
            } else if (name === 'component-interaction-start') {
              window.performanceMetrics.interactionStart = performance.now();
            } else if (name === 'component-interaction-end') {
              window.performanceMetrics.interactionEnd = performance.now();
            }
            return originalMark.apply(this, arguments);
          };
        });
        
        // Navigate to component
        const response = await page.goto(`http://localhost:3000${component.path}`, {
          waitUntil: 'networkidle0',
        });
        
        if (!response || response.status() !== 200) {
          console.error(chalk.red(`Failed to load ${component.name}`));
          continue;
        }
        
        // Get core web vitals
        const webVitals = await page.evaluate(() => {
          return {
            FCP: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
            LCP: window.largestContentfulPaint || 0,
            CLS: window.cumulativeLayoutShift || 0,
            FID: window.firstInputDelay || 0,
            TTI: window.timeToInteractive || 0,
          };
        });
        
        // Get component-specific metrics
        const componentMetrics = await page.evaluate(() => {
          return {
            renderTime: window.performanceMetrics.renderEnd - window.performanceMetrics.renderStart,
            interactionTime: window.performanceMetrics.interactionEnd - window.performanceMetrics.interactionStart,
          };
        });
        
        // Combine all metrics
        const metrics = {
          ...webVitals,
          ...componentMetrics,
        };
        
        componentResults.push(metrics);
        
        // Close page
        await page.close();
      }
      
      // Calculate average metrics
      const averageMetrics = {};
      
      Object.keys(componentResults[0]).forEach(metric => {
        const sum = componentResults.reduce((acc, result) => acc + result[metric], 0);
        averageMetrics[metric] = sum / config.iterations;
      });
      
      // Add to results
      results.push({
        component: component.name,
        metrics: averageMetrics,
        passes: {
          FCP: averageMetrics.FCP <= config.thresholds.FCP,
          LCP: averageMetrics.LCP <= config.thresholds.LCP,
          CLS: averageMetrics.CLS <= config.thresholds.CLS,
          FID: averageMetrics.FID <= config.thresholds.FID,
          TTI: averageMetrics.TTI <= config.thresholds.TTI,
          renderTime: averageMetrics.renderTime <= config.thresholds.renderTime,
          interactionTime: averageMetrics.interactionTime <= config.thresholds.interactionTime,
        },
      });
    }
  } catch (error) {
    console.error(chalk.red('Error running performance tests:'), error);
  } finally {
    // Close browser
    await browser.close();
    
    // Stop development server
    try {
      execSync('taskkill /F /IM node.exe', { stdio: 'ignore' });
    } catch (error) {
      console.error(chalk.red('Failed to stop development server'), error);
    }
  }
  
  // Write results to file
  fs.writeFileSync(config.reportFile, JSON.stringify(results, null, 2));
  
  // Generate summary
  generateSummary(results);
  
  return results;
}

/**
 * Generate a readable summary of performance results
 * @param {Array} results The performance test results
 */
function generateSummary(results) {
  let summary = 'COMPONENT PERFORMANCE SUMMARY\n';
  summary += '============================\n\n';
  
  // Overall statistics
  const totalTests = results.length * 7; // 7 metrics per component
  const passedTests = results.reduce((acc, result) => {
    return acc + Object.values(result.passes).filter(Boolean).length;
  }, 0);
  
  summary += `Pass rate: ${Math.round((passedTests / totalTests) * 100)}% (${passedTests}/${totalTests})\n\n`;
  
  // Component results
  results.forEach(result => {
    summary += `${result.component}:\n`;
    
    // Core web vitals
    Object.keys(config.metrics).forEach(metric => {
      const pass = result.passes[metric];
      summary += `  ${config.metrics[metric]}: ${Math.round(result.metrics[metric])}ms ${pass ? '✓' : '✗'}\n`;
    });
    
    // Component-specific metrics
    summary += `  Render Time: ${Math.round(result.metrics.renderTime)}ms ${result.passes.renderTime ? '✓' : '✗'}\n`;
    summary += `  Interaction Time: ${Math.round(result.metrics.interactionTime)}ms ${result.passes.interactionTime ? '✓' : '✗'}\n`;
    
    summary += '\n';
  });
  
  // Write summary to file
  fs.writeFileSync(config.summaryFile, summary);
  
  // Log summary to console
  console.log(chalk.cyan('\nPerformance Test Summary:'));
  console.log(`Pass rate: ${Math.round((passedTests / totalTests) * 100)}% (${passedTests}/${totalTests})`);
  
  // Log failed tests
  const failedComponents = results.filter(result => 
    Object.values(result.passes).some(pass => !pass)
  );
  
  if (failedComponents.length > 0) {
    console.log(chalk.yellow('\nComponents that failed performance thresholds:'));
    
    failedComponents.forEach(result => {
      const failedMetrics = Object.entries(result.passes)
        .filter(([_, pass]) => !pass)
        .map(([metric, _]) => metric);
      
      console.log(`- ${result.component}: ${failedMetrics.join(', ')}`);
    });
  }
}

// Run tests
runPerformanceTests()
  .then(() => {
    console.log(chalk.green('Performance tests completed!'));
    console.log(`Full report: ${config.reportFile}`);
    console.log(`Summary: ${config.summaryFile}`);
  })
  .catch(error => {
    console.error(chalk.red('Failed to run performance tests:'), error);
    process.exit(1);
  }); 