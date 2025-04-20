/**
 * Performance Budget System
 * 
 * This script creates and enforces performance budgets for the application.
 * It can be used in both development and CI/CD environments to prevent
 * performance regressions.
 * 
 * Features:
 * - Define performance budgets for different pages/routes
 * - Set budgets for various metrics (file size, load time, Core Web Vitals)
 * - Compare actual performance against budgets
 * - Generate reports and warnings for budget breaches
 * - Support for CI/CD integration
 */

// Configuration
const config = {
  // Enable/disable performance budget enforcement
  enabled: true,
  
  // Reporting options
  reporting: {
    // Log to console
    console: true,
    // Save to file (for CI/CD integration)
    file: process.env.NODE_ENV === 'production',
    // Report path (relative to project root)
    reportPath: './performance-reports',
    // Send to webhook
    webhook: false,
    // Webhook URL (if webhook is enabled)
    webhookUrl: '',
  },
  
  // CI/CD options
  ci: {
    // Fail build when budget is exceeded in CI environment
    failBuild: process.env.CI === 'true' && process.env.NODE_ENV === 'production',
    // Warn but don't fail for development or staging
    warnOnly: process.env.NODE_ENV !== 'production',
    // Tolerance percentage before failing (e.g., 10% over budget still passes)
    tolerance: 5,
  },
  
  // Global budgets (applied to all pages)
  globalBudgets: {
    // Maximum total bundle size
    totalBundleSize: 300 * 1024, // 300KB
    
    // Core Web Vitals budgets
    LCP: 2500,  // 2.5s
    FID: 100,   // 100ms
    CLS: 0.1,   // 0.1
    FCP: 1800,  // 1.8s
    TTFB: 800,  // 800ms
    
    // Resource counts
    maxJsRequests: 10,
    maxCssRequests: 3,
    maxImageRequests: 15,
    maxFontRequests: 3,
    
    // Resource sizes
    maxJsSize: 200 * 1024,     // 200KB
    maxCssSize: 50 * 1024,     // 50KB
    maxImageSize: 250 * 1024,  // 250KB
    maxFontSize: 100 * 1024,   // 100KB
    
    // Custom timing metrics
    timeToInteractive: 3500,   // 3.5s
    domContentLoaded: 2000,    // 2s
    load: 3000,               // 3s
  },
  
  // Page-specific budgets (overrides global budgets)
  pageBudgets: {
    // Homepage
    '/': {
      LCP: 2000,               // 2s
      maxJsSize: 180 * 1024,   // 180KB
      maxImageSize: 200 * 1024 // 200KB
    },
    
    // Product listing page
    '/products': {
      LCP: 2500,               // 2.5s
      maxJsSize: 220 * 1024,   // 220KB
      maxImageSize: 300 * 1024 // 300KB
    },
    
    // Product detail page
    '/product/*': {
      LCP: 2500,              // 2.5s
      maxImageSize: 350 * 1024 // 350KB
    },
    
    // Contact page (lighter page)
    '/contact': {
      LCP: 1800,               // 1.8s
      maxJsSize: 150 * 1024,   // 150KB
    },
    
    // Blog post pages
    '/blog/*': {
      LCP: 2500,               // 2.5s
      maxJsSize: 200 * 1024,   // 200KB
      maxImageSize: 400 * 1024 // 400KB
    },
  },
  
  // Custom metrics to track against budget
  customMetrics: {
    // App-specific metrics
    appLoaded: 3000,          // 3s
    firstMeaningfulPaint: 2000, // 2s
    timeToFirstInteraction: 2500, // 2.5s
  }
};

/**
 * Compare current performance metrics against budget
 * @param {Object} metrics - Current performance metrics
 * @param {string} path - Current page path
 * @returns {Object} - Budget comparison results
 */
function compareWithBudget(metrics, path) {
  // Get the appropriate budget for this path
  const budget = getBudgetForPath(path);
  
  // Track all budget violations
  const violations = [];
  const warnings = [];
  let performanceScore = 100; // Start with perfect score
  
  // Loop through all the metrics and compare against budget
  for (const [metricName, metricValue] of Object.entries(metrics)) {
    // Check if we have a budget for this metric
    if (budget[metricName] !== undefined) {
      const budgetValue = budget[metricName];
      const percentageOver = ((metricValue - budgetValue) / budgetValue) * 100;
      
      // Check if metric exceeds budget
      if (metricValue > budgetValue) {
        const violation = {
          metric: metricName,
          actual: metricValue,
          budget: budgetValue,
          percentageOver: percentageOver.toFixed(2),
          path: path
        };
        
        // Determine if this is a violation or warning based on tolerance
        if (percentageOver > config.ci.tolerance) {
          violations.push(violation);
          // Deduct points based on how much it exceeds the budget
          // Capped at 25 points per violation
          performanceScore -= Math.min(25, Math.ceil(percentageOver));
        } else {
          warnings.push(violation);
          // Minor deduction for warnings
          performanceScore -= Math.min(5, Math.ceil(percentageOver / 2));
        }
      }
    }
  }
  
  // Ensure score doesn't go below 0
  performanceScore = Math.max(0, performanceScore);
  
  return {
    violations,
    warnings,
    performanceScore,
    path,
    timestamp: new Date().toISOString(),
    metrics: metrics,
    budget: budget,
    passesCI: violations.length === 0 || config.ci.warnOnly
  };
}

/**
 * Get the appropriate budget for a specific path
 * @param {string} path - The current page path
 * @returns {Object} - Combined budget (global + page-specific)
 */
function getBudgetForPath(path) {
  // Start with the global budget
  const budget = { ...config.globalBudgets };
  
  // Find the most specific matching page budget
  const pagePaths = Object.keys(config.pageBudgets);
  
  for (const pagePath of pagePaths) {
    // Check for exact match
    if (pagePath === path) {
      return { ...budget, ...config.pageBudgets[pagePath] };
    }
    
    // Check for wildcard match (e.g., '/blog/*')
    if (pagePath.endsWith('*')) {
      const basePathPattern = pagePath.replace('*', '');
      if (path.startsWith(basePathPattern)) {
        return { ...budget, ...config.pageBudgets[pagePath] };
      }
    }
  }
  
  // Return global budget if no page-specific budget is found
  return budget;
}

/**
 * Extract performance metrics from the browser
 * @returns {Object} - Collection of performance metrics
 */
function collectPerformanceMetrics() {
  const metrics = {};
  
  // Get navigation timing metrics
  if (window.performance && window.performance.timing) {
    const timing = window.performance.timing;
    
    // Basic timing metrics
    metrics.TTFB = timing.responseStart - timing.navigationStart;
    metrics.domContentLoaded = timing.domContentLoaded - timing.navigationStart;
    metrics.load = timing.loadEventEnd - timing.navigationStart;
    
    // Approximation of TTI (this is a simplified version)
    metrics.timeToInteractive = timing.domInteractive - timing.navigationStart + 200;
  }
  
  // Get Core Web Vitals from localStorage if available
  try {
    const webVitals = JSON.parse(localStorage.getItem('web-vitals') || '{}');
    
    // Add each web vital to our metrics
    for (const [vital, data] of Object.entries(webVitals)) {
      if (data && typeof data.value !== 'undefined') {
        metrics[vital] = data.value;
      }
    }
  } catch (e) {
    console.error('Error parsing web vitals from localStorage:', e);
  }
  
  // Get resource metrics
  if (window.performance && window.performance.getEntriesByType) {
    const resources = window.performance.getEntriesByType('resource');
    
    // Resource counts
    metrics.jsRequests = resources.filter(r => r.initiatorType === 'script').length;
    metrics.cssRequests = resources.filter(r => r.initiatorType === 'css' || r.initiatorType === 'link' && r.name.endsWith('.css')).length;
    metrics.imageRequests = resources.filter(r => r.initiatorType === 'img' || r.initiatorType === 'image').length;
    metrics.fontRequests = resources.filter(r => r.name.match(/\.(woff2?|ttf|otf|eot)/i)).length;
    
    // Resource sizes
    metrics.jsSize = resources
      .filter(r => r.initiatorType === 'script')
      .reduce((total, r) => total + (r.transferSize || 0), 0);
      
    metrics.cssSize = resources
      .filter(r => r.initiatorType === 'css' || r.initiatorType === 'link' && r.name.endsWith('.css'))
      .reduce((total, r) => total + (r.transferSize || 0), 0);
      
    metrics.imageSize = resources
      .filter(r => r.initiatorType === 'img' || r.initiatorType === 'image')
      .reduce((total, r) => total + (r.transferSize || 0), 0);
      
    metrics.fontSize = resources
      .filter(r => r.name.match(/\.(woff2?|ttf|otf|eot)/i))
      .reduce((total, r) => total + (r.transferSize || 0), 0);
      
    // Total bundle size
    metrics.totalBundleSize = resources.reduce((total, r) => total + (r.transferSize || 0), 0);
  }
  
  // Get custom metrics if available
  try {
    const customMetrics = JSON.parse(localStorage.getItem('custom-metrics') || '{}');
    
    for (const [metricName, data] of Object.entries(customMetrics)) {
      if (data && typeof data.value !== 'undefined') {
        // Add custom metric with a prefix to avoid name collisions
        metrics[`custom_${metricName}`] = data.value;
      }
    }
  } catch (e) {
    console.error('Error parsing custom metrics from localStorage:', e);
  }
  
  return metrics;
}

/**
 * Format and output budget comparison results
 * @param {Object} results - Budget comparison results
 */
function reportBudgetResults(results) {
  // Console reporting
  if (config.reporting.console) {
    // Report header
    console.group(`%cPerformance Budget Report for ${results.path}`, 'font-weight: bold; font-size: 14px');
    
    // Performance score
    const scoreColor = 
      results.performanceScore >= 90 ? 'color: #0cce6b' :
      results.performanceScore >= 70 ? 'color: #ffa400' : 'color: #ff4e42';
      
    console.log(
      `%cPerformance Score: ${results.performanceScore}/100`,
      `font-weight: bold; font-size: 16px; ${scoreColor}`
    );
    
    // Budget violations (severe)
    if (results.violations.length > 0) {
      console.group('%cBudget Violations (Exceeded Tolerance)', 'color: #ff4e42; font-weight: bold');
      
      results.violations.forEach(violation => {
        console.log(
          `%c${violation.metric}: %c${formatMetricValue(violation.metric, violation.actual)} %c(exceeds budget by ${violation.percentageOver}%)`,
          'font-weight: bold',
          'color: #ff4e42; font-weight: bold',
          'color: #777'
        );
        console.log(
          `Budget: ${formatMetricValue(violation.metric, violation.budget)}`
        );
      });
      
      console.groupEnd();
    }
    
    // Budget warnings (within tolerance)
    if (results.warnings.length > 0) {
      console.group('%cBudget Warnings (Within Tolerance)', 'color: #ffa400; font-weight: bold');
      
      results.warnings.forEach(warning => {
        console.log(
          `%c${warning.metric}: %c${formatMetricValue(warning.metric, warning.actual)} %c(exceeds budget by ${warning.percentageOver}%)`,
          'font-weight: bold',
          'color: #ffa400; font-weight: bold',
          'color: #777'
        );
        console.log(
          `Budget: ${formatMetricValue(warning.metric, warning.budget)}`
        );
      });
      
      console.groupEnd();
    }
    
    // Passing metrics
    console.group('%cPassing Metrics', 'color: #0cce6b; font-weight: bold');
    
    // Get names of all metrics that aren't violations or warnings
    const violationMetrics = [...results.violations, ...results.warnings].map(v => v.metric);
    const passingMetrics = Object.keys(results.metrics).filter(
      metric => !violationMetrics.includes(metric) && results.budget[metric] !== undefined
    );
    
    if (passingMetrics.length > 0) {
      passingMetrics.forEach(metric => {
        const value = results.metrics[metric];
        const budget = results.budget[metric];
        const percentage = ((budget - value) / budget * 100).toFixed(0);
        
        console.log(
          `%c${metric}: %c${formatMetricValue(metric, value)} %c(${percentage}% under budget)`,
          'font-weight: bold',
          'color: #0cce6b',
          'color: #777'
        );
      });
    } else {
      console.log('No metrics passing budget');
    }
    
    console.groupEnd();
    
    // CI/CD status
    if (results.passesCI) {
      console.log(
        '%cCI/CD Status: PASS',
        'background-color: #0cce6b; color: white; padding: 2px 5px; border-radius: 3px'
      );
    } else {
      console.log(
        '%cCI/CD Status: FAIL',
        'background-color: #ff4e42; color: white; padding: 2px 5px; border-radius: 3px'
      );
    }
    
    console.groupEnd();
  }
  
  // Save to file (for CI/CD)
  if (config.reporting.file) {
    // In a real implementation, this would write to a file
    // For client-side, we could use localStorage or send to an API endpoint
    saveReportToLocalStorage(results);
  }
  
  // Send to webhook
  if (config.reporting.webhook && config.reporting.webhookUrl) {
    fetch(config.reporting.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(results)
    }).catch(err => {
      console.error('Error sending performance budget report to webhook:', err);
    });
  }
  
  // Return results for potential further processing
  return results;
}

/**
 * Format metric values with appropriate units
 * @param {string} metric - Metric name
 * @param {number} value - Metric value
 * @returns {string} - Formatted metric value with units
 */
function formatMetricValue(metric, value) {
  // Size metrics (in bytes)
  if (metric.includes('Size') || metric.endsWith('Size')) {
    return formatBytes(value);
  }
  
  // Time metrics (in ms)
  if (['LCP', 'FID', 'FCP', 'TTFB', 'timeToInteractive', 'domContentLoaded', 'load'].includes(metric) ||
      metric.includes('time') || metric.includes('Time') || metric.includes('duration')) {
    return `${Math.round(value)}ms`;
  }
  
  // CLS (unitless)
  if (metric === 'CLS') {
    return value.toFixed(3);
  }
  
  // Count metrics
  if (metric.includes('Requests') || metric.includes('Count')) {
    return Math.round(value);
  }
  
  // Default format
  return value;
}

/**
 * Format bytes to human-readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted size (e.g., "1.5 KB")
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Save performance report to localStorage for later retrieval
 * @param {Object} results - Budget comparison results
 */
function saveReportToLocalStorage(results) {
  try {
    // Get existing reports
    const storedReports = JSON.parse(localStorage.getItem('perf-budget-reports') || '[]');
    
    // Add new report
    storedReports.push({
      path: results.path,
      timestamp: results.timestamp,
      performanceScore: results.performanceScore,
      violations: results.violations.length,
      warnings: results.warnings.length,
      passesCI: results.passesCI
    });
    
    // Limit to last 50 reports
    while (storedReports.length > 50) {
      storedReports.shift();
    }
    
    // Save back to localStorage
    localStorage.setItem('perf-budget-reports', JSON.stringify(storedReports));
    
    // Save detailed report for this path and timestamp
    const reportKey = `perf-budget-report-${results.path.replace(/[^a-z0-9]/gi, '-')}-${Date.now()}`;
    localStorage.setItem(reportKey, JSON.stringify(results));
  } catch (e) {
    console.error('Error saving performance budget report to localStorage:', e);
  }
}

/**
 * Run performance budget check
 * @param {string} path - Current page path (defaults to current location)
 */
function checkPerformanceBudget(path = window.location.pathname) {
  if (!config.enabled) return;
  
  // Wait for page to be fully loaded
  if (document.readyState !== 'complete') {
    window.addEventListener('load', () => {
      // Add a small delay to ensure all metrics are collected
      setTimeout(() => checkPerformanceBudget(path), 1000);
    });
    return;
  }
  
  // Collect performance metrics
  const metrics = collectPerformanceMetrics();
  
  // Compare with budget
  const results = compareWithBudget(metrics, path);
  
  // Report results
  reportBudgetResults(results);
  
  // If CI is enabled and we're failing, we could trigger an alert or callback
  if (!results.passesCI && config.ci.failBuild) {
    // In a real CI environment, this would fail the build
    // For client-side, we just log an error
    console.error('Performance budget check failed! This would fail CI build.');
  }
  
  return results;
}

/**
 * Get stored performance reports
 * @returns {Array} - List of stored performance reports
 */
function getPerformanceReports() {
  try {
    return JSON.parse(localStorage.getItem('perf-budget-reports') || '[]');
  } catch (e) {
    console.error('Error reading performance budget reports:', e);
    return [];
  }
}

/**
 * Get a detailed report by path and timestamp
 * @param {string} path - Page path
 * @param {string} timestamp - Report timestamp
 * @returns {Object|null} - Detailed report or null if not found
 */
function getDetailedReport(path, timestamp) {
  try {
    // Try to find the report key in localStorage
    const prefix = `perf-budget-report-${path.replace(/[^a-z0-9]/gi, '-')}`;
    
    // If timestamp is provided, look for exact report
    if (timestamp) {
      const reportKey = `${prefix}-${new Date(timestamp).getTime()}`;
      const report = localStorage.getItem(reportKey);
      return report ? JSON.parse(report) : null;
    }
    
    // Otherwise find the most recent report for this path
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keys.push(key);
      }
    }
    
    // Sort keys by timestamp (descending)
    keys.sort().reverse();
    
    // Return the most recent report
    if (keys.length > 0) {
      return JSON.parse(localStorage.getItem(keys[0]));
    }
    
    return null;
  } catch (e) {
    console.error('Error retrieving detailed performance report:', e);
    return null;
  }
}

// Initialize performance budget checking
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Wait for page to be fully loaded before checking
    window.addEventListener('load', () => {
      // Add a small delay to ensure all metrics are collected
      setTimeout(checkPerformanceBudget, 1000);
    });
  });
} else {
  // If document already loaded, attach to load event
  window.addEventListener('load', () => {
    setTimeout(checkPerformanceBudget, 1000);
  });
}

// Export functionality for use in other scripts
export default {
  checkPerformanceBudget,
  getPerformanceReports,
  getDetailedReport,
  config
}; 