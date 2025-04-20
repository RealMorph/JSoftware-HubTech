/**
 * Component Performance Testing
 * 
 * This script measures and reports on component render performance.
 * It uses Puppeteer to run performance tests in a headless browser.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  outputDir: path.join(__dirname, '../test-results/performance'),
  reportFile: path.join(__dirname, '../test-results/performance/component-performance.json'),
  historyFile: path.join(__dirname, '../test-results/performance/history.json'),
  componentsToTest: [
    { name: 'Button', route: '/components/button-demo', selector: '[data-testid="button-demo"]' },
    { name: 'TextField', route: '/components/textfield-demo', selector: '[data-testid="textfield-demo"]' },
    { name: 'DataGrid', route: '/components/datagrid-demo', selector: '[data-testid="datagrid-demo"]' },
    { name: 'Form', route: '/components/form-demo', selector: '[data-testid="form-demo"]' },
    { name: 'Chart', route: '/components/charts-demo', selector: '[data-testid="charts-demo"]' },
    { name: 'Modal', route: '/components/modal-demo', selector: '[data-testid="modal-demo"]', action: 'click' },
  ],
  thresholds: {
    firstPaint: 50, // ms
    firstContentfulPaint: 100, // ms
    domComplete: 200, // ms
    renderTime: 16.67, // ms (60fps)
    reRenderTime: 10, // ms
    memoryDelta: 5 * 1024 * 1024, // 5MB
  },
  iterations: 5,
  warmupIterations: 2,
  port: 3000,
  baseUrl: 'http://localhost:3000',
  browserArgs: [
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--no-sandbox',
    '--js-flags=--expose-gc',
  ]
};

// Ensure output directory exists
if (!fs.existsSync(CONFIG.outputDir)) {
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });
}

// Start dev server if not already running
const startDevServer = async () => {
  try {
    console.log(chalk.blue('Checking if dev server is running...'));
    await fetch(CONFIG.baseUrl);
    console.log(chalk.green('Dev server is already running'));
    return null; // Server is already running
  } catch (e) {
    console.log(chalk.blue('Starting dev server...'));
    const process = execSync('npm run dev', { stdio: 'inherit' });
    
    // Wait for server to start
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      try {
        await new Promise(r => setTimeout(r, 1000));
        await fetch(CONFIG.baseUrl);
        console.log(chalk.green('Dev server started'));
        return process;
      } catch (e) {
        attempts++;
        console.log(chalk.yellow(`Waiting for server to start (${attempts}/${maxAttempts})...`));
      }
    }
    
    throw new Error('Failed to start dev server');
  }
};

// Measure component performance
const measureComponentPerformance = async (browser, component) => {
  console.log(chalk.blue(`Testing ${component.name} component...`));
  const page = await browser.newPage();
  
  // Set up performance observers
  await page.evaluateOnNewDocument(() => {
    window.renderMetrics = [];
    window.memoryMetrics = [];
    
    // Track render performance
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure' && entry.name.startsWith('render-')) {
          window.renderMetrics.push({
            name: entry.name,
            duration: entry.duration,
            timestamp: entry.startTime,
          });
        }
      }
    });
    
    observer.observe({ entryTypes: ['measure'] });
    
    // Custom React render tracking
    if (window.React) {
      const originalRender = window.React.Component.prototype.render;
      
      window.React.Component.prototype.render = function() {
        const componentName = this.constructor.name;
        performance.mark(`render-start-${componentName}`);
        const result = originalRender.apply(this, arguments);
        performance.mark(`render-end-${componentName}`);
        performance.measure(
          `render-${componentName}`,
          `render-start-${componentName}`,
          `render-end-${componentName}`
        );
        return result;
      };
    }
    
    // Track memory usage
    if (window.performance && window.performance.memory) {
      setInterval(() => {
        window.memoryMetrics.push({
          timestamp: performance.now(),
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
        });
      }, 1000);
    }
  });
  
  // Navigate to component
  const url = `${CONFIG.baseUrl}${component.route}`;
  const response = await page.goto(url, { waitUntil: 'networkidle0' });
  
  if (!response.ok()) {
    console.error(chalk.red(`Failed to load ${url}: ${response.status()} ${response.statusText()}`));
    await page.close();
    return null;
  }
  
  // Wait for component to be visible
  try {
    await page.waitForSelector(component.selector, { timeout: 5000 });
  } catch (e) {
    console.error(chalk.red(`Failed to find component selector "${component.selector}"`));
    await page.close();
    return null;
  }
  
  // Performance measurements
  const results = [];
  
  // Warmup iterations (not included in results)
  for (let i = 0; i < CONFIG.warmupIterations; i++) {
    await page.reload({ waitUntil: 'networkidle0' });
    await page.waitForSelector(component.selector);
    console.log(chalk.yellow(`  Warmup iteration ${i + 1}/${CONFIG.warmupIterations}`));
  }
  
  // Test iterations
  for (let i = 0; i < CONFIG.iterations; i++) {
    console.log(chalk.blue(`  Iteration ${i + 1}/${CONFIG.iterations}`));
    
    // Clear cache and reload
    await page.evaluate(() => {
      window.renderMetrics = [];
      window.memoryMetrics = [];
      performance.clearMarks();
      performance.clearMeasures();
      
      // Force garbage collection if available
      if (window.gc) window.gc();
    });
    
    await page.reload({ waitUntil: 'networkidle0' });
    await page.waitForSelector(component.selector);
    
    // Measure initial render
    const initialRenderMetrics = await page.evaluate(() => {
      const paintEntries = performance.getEntriesByType('paint');
      const navigationEntries = performance.getEntriesByType('navigation');
      
      return {
        firstPaint: paintEntries.find(e => e.name === 'first-paint')?.startTime,
        firstContentfulPaint: paintEntries.find(e => e.name === 'first-contentful-paint')?.startTime,
        domComplete: navigationEntries[0]?.domComplete,
        loadTime: navigationEntries[0]?.loadEventEnd,
        renderMetrics: window.renderMetrics,
        memoryBefore: window.performance.memory 
          ? {
              usedJSHeapSize: window.performance.memory.usedJSHeapSize,
              totalJSHeapSize: window.performance.memory.totalJSHeapSize,
            } 
          : null,
      };
    });
    
    // Trigger component action (if any)
    if (component.action === 'click') {
      await page.click(component.selector);
      await page.waitForTimeout(1000); // Wait for any animations to complete
    }
    
    // Measure re-render (triggered by state changes)
    await page.evaluate(() => {
      // Dispatch a window resize event to trigger re-renders
      window.dispatchEvent(new Event('resize'));
    });
    
    await page.waitForTimeout(1000); // Wait for any re-renders to complete
    
    // Collect final metrics
    const finalMetrics = await page.evaluate(() => {
      return {
        renderMetrics: window.renderMetrics,
        memoryAfter: window.performance.memory 
          ? {
              usedJSHeapSize: window.performance.memory.usedJSHeapSize,
              totalJSHeapSize: window.performance.memory.totalJSHeapSize,
            } 
          : null,
      };
    });
    
    // Calculate re-render times
    const componentRenderTimes = finalMetrics.renderMetrics
      .filter(m => m.name.startsWith('render-'))
      .reduce((acc, metric) => {
        const componentName = metric.name.replace('render-', '');
        if (!acc[componentName]) {
          acc[componentName] = [];
        }
        acc[componentName].push(metric.duration);
        return acc;
      }, {});
    
    // Calculate memory usage delta
    const memoryDelta = finalMetrics.memoryAfter && initialRenderMetrics.memoryBefore
      ? finalMetrics.memoryAfter.usedJSHeapSize - initialRenderMetrics.memoryBefore.usedJSHeapSize
      : null;
    
    results.push({
      iteration: i + 1,
      firstPaint: initialRenderMetrics.firstPaint,
      firstContentfulPaint: initialRenderMetrics.firstContentfulPaint,
      domComplete: initialRenderMetrics.domComplete,
      loadTime: initialRenderMetrics.loadTime,
      componentRenderTimes,
      avgRenderTime: Object.values(componentRenderTimes)
        .flat()
        .reduce((sum, time) => sum + time, 0) / finalMetrics.renderMetrics.length,
      memoryDelta,
    });
  }
  
  // Take a screenshot
  await page.screenshot({ 
    path: path.join(CONFIG.outputDir, `${component.name.toLowerCase()}.png`),
    fullPage: true
  });
  
  await page.close();
  
  // Compute averages
  const averages = {
    firstPaint: results.reduce((sum, r) => sum + r.firstPaint, 0) / results.length,
    firstContentfulPaint: results.reduce((sum, r) => sum + r.firstContentfulPaint, 0) / results.length,
    domComplete: results.reduce((sum, r) => sum + r.domComplete, 0) / results.length,
    loadTime: results.reduce((sum, r) => sum + r.loadTime, 0) / results.length,
    avgRenderTime: results.reduce((sum, r) => sum + r.avgRenderTime, 0) / results.length,
    memoryDelta: results.reduce((sum, r) => sum + (r.memoryDelta || 0), 0) / results.length,
  };
  
  // Compare against thresholds
  const thresholdResults = {
    firstPaint: averages.firstPaint <= CONFIG.thresholds.firstPaint,
    firstContentfulPaint: averages.firstContentfulPaint <= CONFIG.thresholds.firstContentfulPaint,
    domComplete: averages.domComplete <= CONFIG.thresholds.domComplete,
    renderTime: averages.avgRenderTime <= CONFIG.thresholds.renderTime,
    memoryDelta: !averages.memoryDelta || averages.memoryDelta <= CONFIG.thresholds.memoryDelta,
  };
  
  const passed = Object.values(thresholdResults).every(Boolean);
  
  return {
    component: component.name,
    passed,
    iterations: results,
    averages,
    thresholdResults,
    timestamp: new Date().toISOString(),
  };
};

// Save results to history
const saveResultsToHistory = (results) => {
  let history = [];
  
  if (fs.existsSync(CONFIG.historyFile)) {
    try {
      history = JSON.parse(fs.readFileSync(CONFIG.historyFile, 'utf8'));
    } catch (e) {
      console.warn(chalk.yellow(`Could not read history file: ${e.message}`));
    }
  }
  
  // Add new results
  history.push({
    timestamp: new Date().toISOString(),
    results: results.map(r => ({
      component: r.component,
      passed: r.passed,
      averages: r.averages,
    })),
  });
  
  // Keep only the last 20 entries
  history = history.slice(-20);
  
  fs.writeFileSync(CONFIG.historyFile, JSON.stringify(history, null, 2));
  console.log(chalk.green(`Performance history updated at ${CONFIG.historyFile}`));
};

// Generate trends from history
const generateTrends = (results) => {
  if (!fs.existsSync(CONFIG.historyFile)) {
    return {};
  }
  
  try {
    const history = JSON.parse(fs.readFileSync(CONFIG.historyFile, 'utf8'));
    
    if (history.length <= 1) {
      return {};
    }
    
    const trends = {};
    
    results.forEach(result => {
      const componentHistory = history
        .map(h => h.results.find(r => r.component === result.component))
        .filter(Boolean)
        .slice(-5); // Last 5 entries
      
      if (componentHistory.length >= 2) {
        const previousAvg = componentHistory[componentHistory.length - 2].averages;
        const currentAvg = result.averages;
        
        trends[result.component] = {
          firstPaint: (currentAvg.firstPaint - previousAvg.firstPaint) / previousAvg.firstPaint * 100,
          firstContentfulPaint: (currentAvg.firstContentfulPaint - previousAvg.firstContentfulPaint) / previousAvg.firstContentfulPaint * 100,
          domComplete: (currentAvg.domComplete - previousAvg.domComplete) / previousAvg.domComplete * 100,
          avgRenderTime: (currentAvg.avgRenderTime - previousAvg.avgRenderTime) / previousAvg.avgRenderTime * 100,
          memoryDelta: previousAvg.memoryDelta ? (currentAvg.memoryDelta - previousAvg.memoryDelta) / previousAvg.memoryDelta * 100 : 0,
        };
      }
    });
    
    return trends;
  } catch (e) {
    console.warn(chalk.yellow(`Could not generate trends: ${e.message}`));
    return {};
  }
};

// Main function
const runPerformanceTests = async () => {
  console.log(chalk.blue('Starting component performance tests...'));
  
  // Start dev server if needed
  const serverProcess = await startDevServer();
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: CONFIG.browserArgs,
  });
  
  try {
    // Run tests for each component
    const results = [];
    
    for (const component of CONFIG.componentsToTest) {
      const componentResults = await measureComponentPerformance(browser, component);
      if (componentResults) {
        results.push(componentResults);
      }
    }
    
    // Generate trends
    const trends = generateTrends(results);
    
    // Save results
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: results.length,
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length,
      },
      results,
      trends,
      thresholds: CONFIG.thresholds,
    };
    
    fs.writeFileSync(CONFIG.reportFile, JSON.stringify(report, null, 2));
    console.log(chalk.green(`Performance report saved to ${CONFIG.reportFile}`));
    
    // Update history
    saveResultsToHistory(results);
    
    // Print summary
    console.log(chalk.blue('\nPerformance Test Summary:'));
    console.log(chalk.blue('------------------------'));
    console.log(`Total components tested: ${report.summary.total}`);
    console.log(`Passed: ${chalk.green(report.summary.passed)}`);
    console.log(`Failed: ${chalk.red(report.summary.failed)}`);
    console.log(chalk.blue('------------------------'));
    
    // Print individual results
    results.forEach(result => {
      const status = result.passed ? chalk.green('PASS') : chalk.red('FAIL');
      console.log(`${status} ${result.component}`);
      console.log(`  First Paint: ${result.averages.firstPaint.toFixed(2)}ms ${getTrendIndicator(trends[result.component]?.firstPaint)}`);
      console.log(`  First Contentful Paint: ${result.averages.firstContentfulPaint.toFixed(2)}ms ${getTrendIndicator(trends[result.component]?.firstContentfulPaint)}`);
      console.log(`  DOM Complete: ${result.averages.domComplete.toFixed(2)}ms ${getTrendIndicator(trends[result.component]?.domComplete)}`);
      console.log(`  Avg Render Time: ${result.averages.avgRenderTime.toFixed(2)}ms ${getTrendIndicator(trends[result.component]?.avgRenderTime)}`);
      
      if (result.averages.memoryDelta) {
        const memoryMB = (result.averages.memoryDelta / (1024 * 1024)).toFixed(2);
        console.log(`  Memory Delta: ${memoryMB}MB ${getTrendIndicator(trends[result.component]?.memoryDelta)}`);
      }
      
      console.log('');
    });
    
    return report;
  } finally {
    // Clean up
    await browser.close();
    
    if (serverProcess) {
      console.log(chalk.blue('Stopping dev server...'));
      process.kill(serverProcess.pid);
    }
  }
};

// Helper function to get trend indicator
function getTrendIndicator(trend) {
  if (!trend) return '';
  if (trend <= -5) return chalk.green('▼'); // Improved by 5% or more
  if (trend >= 5) return chalk.red('▲');    // Worsened by 5% or more
  return chalk.yellow('●');                // Roughly the same
}

// Run tests if executed directly
if (require.main === module) {
  runPerformanceTests()
    .then(() => {
      console.log(chalk.green('Performance tests completed'));
      process.exit(0);
    })
    .catch(err => {
      console.error(chalk.red('Error running performance tests:'), err);
      process.exit(1);
    });
} else {
  // Export for use in other scripts
  module.exports = { runPerformanceTests };
} 