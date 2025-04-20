/**
 * Performance Metrics Dashboard
 * 
 * This script creates a real-time performance dashboard for monitoring 
 * application performance metrics including Core Web Vitals.
 * 
 * Features:
 * - Visual display of Core Web Vitals
 * - Historical performance tracking
 * - Real-time updates
 * - Performance budgets visualization
 * - Page-specific metrics
 * - User experience scoring
 */

// Dashboard configuration
const config = {
  // Element ID where dashboard will be mounted
  containerId: 'performance-dashboard',
  // Control visibility
  visible: true,
  // Dashboard position
  position: 'bottom-right', // 'top-right', 'top-left', 'bottom-left'
  // Update interval in milliseconds
  updateInterval: 5000,
  // Max entries to keep in history
  maxHistoryEntries: 100,
  // Performance thresholds (same as in core-vitals-tracker.js)
  thresholds: {
    LCP: {
      good: 2500,      // 2.5s
      needsImprovement: 4000,  // 4s
    },
    FID: {
      good: 100,       // 100ms
      needsImprovement: 300,   // 300ms
    },
    CLS: {
      good: 0.1,       // 0.1
      needsImprovement: 0.25,  // 0.25
    },
    FCP: {
      good: 1800,      // 1.8s
      needsImprovement: 3000,  // 3s
    },
    TTFB: {
      good: 800,       // 800ms
      needsImprovement: 1800,  // 1.8s
    },
  },
};

// CSS styles for the dashboard
const styles = `
  .perf-dashboard {
    position: fixed;
    z-index: 10000;
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    overflow: hidden;
    width: 350px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, sans-serif;
    transition: all 0.3s ease;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
  }
  
  .perf-dashboard.top-right {
    top: 20px;
    right: 20px;
  }
  
  .perf-dashboard.top-left {
    top: 20px;
    left: 20px;
  }
  
  .perf-dashboard.bottom-right {
    bottom: 20px;
    right: 20px;
  }
  
  .perf-dashboard.bottom-left {
    bottom: 20px;
    left: 20px;
  }
  
  .perf-dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background-color: #f5f7fa;
    border-bottom: 1px solid #e4e9f0;
  }
  
  .perf-dashboard-title {
    font-weight: 600;
    font-size: 14px;
    color: #333;
    margin: 0;
  }
  
  .perf-dashboard-controls {
    display: flex;
    gap: 8px;
  }
  
  .perf-dashboard-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #666;
    padding: 2px;
    font-size: 14px;
  }
  
  .perf-dashboard-btn:hover {
    color: #333;
  }
  
  .perf-dashboard-content {
    padding: 16px;
    overflow-y: auto;
  }
  
  .perf-metrics-section {
    margin-bottom: 20px;
  }
  
  .perf-metrics-title {
    font-size: 13px;
    color: #666;
    margin: 0 0 12px 0;
    font-weight: 600;
  }
  
  .perf-metric-item {
    margin-bottom: 12px;
  }
  
  .perf-metric-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }
  
  .perf-metric-name {
    font-size: 12px;
    font-weight: 500;
    color: #333;
  }
  
  .perf-metric-value {
    font-size: 12px;
    font-weight: 600;
  }
  
  .perf-metric-value.good {
    color: #0cce6b;
  }
  
  .perf-metric-value.needs-improvement {
    color: #ffa400;
  }
  
  .perf-metric-value.poor {
    color: #ff4e42;
  }
  
  .perf-metric-bar {
    height: 6px;
    width: 100%;
    background-color: #eee;
    border-radius: 3px;
    overflow: hidden;
    position: relative;
  }
  
  .perf-metric-progress {
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    border-radius: 3px;
  }
  
  .perf-metric-progress.good {
    background-color: #0cce6b;
  }
  
  .perf-metric-progress.needs-improvement {
    background-color: #ffa400;
  }
  
  .perf-metric-progress.poor {
    background-color: #ff4e42;
  }
  
  .perf-metric-threshold {
    position: absolute;
    width: 2px;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.2);
  }
  
  .perf-tabs {
    display: flex;
    border-bottom: 1px solid #e4e9f0;
  }
  
  .perf-tab {
    padding: 8px 16px;
    font-size: 12px;
    background: none;
    border: none;
    cursor: pointer;
    color: #666;
    border-bottom: 2px solid transparent;
  }
  
  .perf-tab.active {
    color: #0073ea;
    border-bottom-color: #0073ea;
    font-weight: 500;
  }
  
  .perf-tab-content {
    display: none;
  }
  
  .perf-tab-content.active {
    display: block;
  }
  
  .perf-page-selector {
    margin-bottom: 16px;
    width: 100%;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #e4e9f0;
    font-size: 12px;
  }
  
  .perf-chart-container {
    height: 200px;
    width: 100%;
    margin-top: 20px;
  }
  
  .perf-summary {
    background-color: #f5f7fa;
    padding: 12px 16px;
    border-radius: 6px;
    margin-bottom: 16px;
  }
  
  .perf-summary-item {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    margin-bottom: 8px;
  }
  
  .perf-summary-label {
    color: #666;
  }
  
  .perf-summary-value {
    font-weight: 500;
    color: #333;
  }
`;

/**
 * Create or get dashboard container
 */
function createDashboard() {
  // Check if dashboard already exists
  let dashboard = document.getElementById(config.containerId);
  
  if (!dashboard) {
    // Add styles to head
    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
    
    // Create dashboard container
    dashboard = document.createElement('div');
    dashboard.id = config.containerId;
    dashboard.className = `perf-dashboard ${config.position}`;
    
    // Create dashboard header
    const header = document.createElement('div');
    header.className = 'perf-dashboard-header';
    
    const title = document.createElement('h2');
    title.className = 'perf-dashboard-title';
    title.textContent = 'Performance Dashboard';
    
    const controls = document.createElement('div');
    controls.className = 'perf-dashboard-controls';
    
    const refreshBtn = document.createElement('button');
    refreshBtn.className = 'perf-dashboard-btn';
    refreshBtn.innerHTML = '🔄';
    refreshBtn.title = 'Refresh metrics';
    refreshBtn.addEventListener('click', updateDashboard);
    
    const minimizeBtn = document.createElement('button');
    minimizeBtn.className = 'perf-dashboard-btn';
    minimizeBtn.innerHTML = '−';
    minimizeBtn.title = 'Minimize dashboard';
    minimizeBtn.addEventListener('click', toggleDashboard);
    
    controls.appendChild(refreshBtn);
    controls.appendChild(minimizeBtn);
    
    header.appendChild(title);
    header.appendChild(controls);
    
    // Create tabs
    const tabs = document.createElement('div');
    tabs.className = 'perf-tabs';
    
    const overviewTab = document.createElement('button');
    overviewTab.className = 'perf-tab active';
    overviewTab.textContent = 'Overview';
    overviewTab.dataset.tab = 'overview';
    
    const historyTab = document.createElement('button');
    historyTab.className = 'perf-tab';
    historyTab.textContent = 'History';
    historyTab.dataset.tab = 'history';
    
    const budgetsTab = document.createElement('button');
    budgetsTab.className = 'perf-tab';
    budgetsTab.textContent = 'Budgets';
    budgetsTab.dataset.tab = 'budgets';
    
    [overviewTab, historyTab, budgetsTab].forEach(tab => {
      tab.addEventListener('click', switchTab);
      tabs.appendChild(tab);
    });
    
    // Create content
    const content = document.createElement('div');
    content.className = 'perf-dashboard-content';
    
    // Create tab contents
    const overviewContent = document.createElement('div');
    overviewContent.className = 'perf-tab-content active';
    overviewContent.id = 'overview-tab';
    
    const historyContent = document.createElement('div');
    historyContent.className = 'perf-tab-content';
    historyContent.id = 'history-tab';
    
    const budgetsContent = document.createElement('div');
    budgetsContent.className = 'perf-tab-content';
    budgetsContent.id = 'budgets-tab';
    
    content.appendChild(overviewContent);
    content.appendChild(historyContent);
    content.appendChild(budgetsContent);
    
    // Assemble dashboard
    dashboard.appendChild(header);
    dashboard.appendChild(tabs);
    dashboard.appendChild(content);
    
    document.body.appendChild(dashboard);
  }
  
  return dashboard;
}

/**
 * Switch between dashboard tabs
 */
function switchTab(e) {
  // Get all tabs and tab contents
  const tabs = document.querySelectorAll('.perf-tab');
  const tabContents = document.querySelectorAll('.perf-tab-content');
  
  // Remove active class from all tabs and contents
  tabs.forEach(tab => tab.classList.remove('active'));
  tabContents.forEach(content => content.classList.remove('active'));
  
  // Add active class to clicked tab and corresponding content
  e.target.classList.add('active');
  const tabId = e.target.dataset.tab + '-tab';
  document.getElementById(tabId).classList.add('active');
  
  // Update content based on the active tab
  updateTabContent(e.target.dataset.tab);
}

/**
 * Update tab content based on the active tab
 */
function updateTabContent(tabName) {
  switch (tabName) {
    case 'overview':
      updateOverviewTab();
      break;
    case 'history':
      updateHistoryTab();
      break;
    case 'budgets':
      updateBudgetsTab();
      break;
  }
}

/**
 * Toggle dashboard visibility
 */
function toggleDashboard() {
  const dashboard = document.getElementById(config.containerId);
  
  if (dashboard.style.height === '40px') {
    // Expand dashboard
    dashboard.style.height = '';
    dashboard.querySelector('.perf-dashboard-btn:last-child').innerHTML = '−';
  } else {
    // Minimize dashboard
    dashboard.style.height = '40px';
    dashboard.querySelector('.perf-dashboard-btn:last-child').innerHTML = '+';
  }
}

/**
 * Get Web Vitals metrics from localStorage
 */
function getWebVitalsMetrics() {
  const vitals = JSON.parse(localStorage.getItem('web-vitals') || '{}');
  return vitals;
}

/**
 * Get custom metrics from localStorage
 */
function getCustomMetrics() {
  const metrics = JSON.parse(localStorage.getItem('custom-metrics') || '{}');
  return metrics;
}

/**
 * Get performance entries
 */
function getPerformanceEntries() {
  if (!window.performance || !window.performance.getEntriesByType) {
    return [];
  }
  
  return {
    navigation: window.performance.getEntriesByType('navigation')[0],
    resource: window.performance.getEntriesByType('resource'),
    paint: window.performance.getEntriesByType('paint'),
    marks: window.performance.getEntriesByType('mark'),
    measures: window.performance.getEntriesByType('measure'),
  };
}

/**
 * Get performance score (0-100)
 */
function calculatePerformanceScore(metrics) {
  // Core Web Vitals weights
  const weights = {
    LCP: 0.25, // 25%
    FID: 0.25, // 25%
    CLS: 0.25, // 25%
    FCP: 0.15, // 15%
    TTFB: 0.10, // 10%
  };
  
  let weightSum = 0;
  let scoreSum = 0;
  
  for (const [name, data] of Object.entries(metrics)) {
    const weight = weights[name] || 0;
    if (weight === 0) continue;
    
    let metricScore = 0;
    const threshold = config.thresholds[name];
    
    if (!threshold) continue;
    
    if (data.value <= threshold.good) {
      metricScore = 100; // Perfect score
    } else if (data.value <= threshold.needsImprovement) {
      // Linear score between good and needs improvement
      const range = threshold.needsImprovement - threshold.good;
      const position = data.value - threshold.good;
      metricScore = 100 - (position / range) * 50; // 100 to 50
    } else {
      // Linear score for poor values
      const baseline = threshold.needsImprovement * 2;
      metricScore = Math.max(0, 50 - (data.value - threshold.needsImprovement) / (baseline - threshold.needsImprovement) * 50); // 50 to 0
    }
    
    scoreSum += metricScore * weight;
    weightSum += weight;
  }
  
  return weightSum > 0 ? Math.round(scoreSum / weightSum) : 0;
}

/**
 * Update overview tab content
 */
function updateOverviewTab() {
  const overviewTab = document.getElementById('overview-tab');
  const webVitals = getWebVitalsMetrics();
  const customMetrics = getCustomMetrics();
  const score = calculatePerformanceScore(webVitals);
  
  let html = `
    <div class="perf-summary">
      <div class="perf-summary-item">
        <span class="perf-summary-label">Performance Score</span>
        <span class="perf-summary-value">${score}/100</span>
      </div>
      <div class="perf-summary-item">
        <span class="perf-summary-label">Page URL</span>
        <span class="perf-summary-value">${window.location.pathname}</span>
      </div>
      <div class="perf-summary-item">
        <span class="perf-summary-label">Last Updated</span>
        <span class="perf-summary-value">${new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  `;
  
  // Core Web Vitals Section
  html += `
    <div class="perf-metrics-section">
      <h3 class="perf-metrics-title">Core Web Vitals</h3>
  `;
  
  for (const [name, data] of Object.entries(webVitals)) {
    const threshold = config.thresholds[name];
    if (!threshold) continue;
    
    // Calculate progress percentage and rating
    let progressPercentage = 0;
    let rating = 'unknown';
    
    if (data.value <= threshold.good) {
      progressPercentage = (data.value / threshold.good) * 40; // Max 40% for good values
      rating = 'good';
    } else if (data.value <= threshold.needsImprovement) {
      progressPercentage = 40 + ((data.value - threshold.good) / (threshold.needsImprovement - threshold.good)) * 30; // 40-70% for needs improvement
      rating = 'needs-improvement';
    } else {
      progressPercentage = 70 + ((data.value - threshold.needsImprovement) / threshold.needsImprovement) * 30; // 70-100% for poor
      progressPercentage = Math.min(100, progressPercentage); // Cap at 100%
      rating = 'poor';
    }
    
    // Create metric bar
    const goodThresholdPosition = (threshold.good / (threshold.needsImprovement * 2)) * 100;
    const needsImprovementThresholdPosition = (threshold.needsImprovement / (threshold.needsImprovement * 2)) * 100;
    
    html += `
      <div class="perf-metric-item">
        <div class="perf-metric-header">
          <span class="perf-metric-name">${name}</span>
          <span class="perf-metric-value ${rating}">
            ${name === 'CLS' ? data.value.toFixed(3) : Math.round(data.value)}${name === 'CLS' ? '' : 'ms'}
          </span>
        </div>
        <div class="perf-metric-bar">
          <div class="perf-metric-progress ${rating}" style="width: ${progressPercentage}%"></div>
          <div class="perf-metric-threshold" style="left: ${goodThresholdPosition}%"></div>
          <div class="perf-metric-threshold" style="left: ${needsImprovementThresholdPosition}%"></div>
        </div>
      </div>
    `;
  }
  
  html += `</div>`;
  
  // Custom Metrics Section
  if (Object.keys(customMetrics).length > 0) {
    html += `
      <div class="perf-metrics-section">
        <h3 class="perf-metrics-title">Custom Metrics</h3>
    `;
    
    for (const [name, data] of Object.entries(customMetrics)) {
      html += `
        <div class="perf-metric-item">
          <div class="perf-metric-header">
            <span class="perf-metric-name">${name.replace('measure_', '')}</span>
            <span class="perf-metric-value">${Math.round(data.value)}ms</span>
          </div>
        </div>
      `;
    }
    
    html += `</div>`;
  }
  
  overviewTab.innerHTML = html;
}

/**
 * Update history tab content
 */
function updateHistoryTab() {
  const historyTab = document.getElementById('history-tab');
  
  // Get metric history from localStorage
  const historyKey = 'perf-metrics-history';
  let metricsHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
  
  // Add current metrics to history if available
  const currentMetrics = getWebVitalsMetrics();
  if (Object.keys(currentMetrics).length > 0) {
    metricsHistory.push({
      timestamp: new Date().toISOString(),
      metrics: currentMetrics,
      url: window.location.pathname,
    });
    
    // Keep only the most recent entries
    if (metricsHistory.length > config.maxHistoryEntries) {
      metricsHistory = metricsHistory.slice(metricsHistory.length - config.maxHistoryEntries);
    }
    
    // Save updated history
    localStorage.setItem(historyKey, JSON.stringify(metricsHistory));
  }
  
  // Create page selector
  const pages = [...new Set(metricsHistory.map(entry => entry.url))];
  
  let html = `
    <select class="perf-page-selector">
      <option value="all">All Pages</option>
      ${pages.map(page => `<option value="${page}">${page}</option>`).join('')}
    </select>
  `;
  
  // Create history table
  html += `
    <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
      <thead>
        <tr style="border-bottom: 1px solid #e4e9f0;">
          <th style="text-align: left; padding: 8px 4px;">Time</th>
          <th style="text-align: right; padding: 8px 4px;">LCP</th>
          <th style="text-align: right; padding: 8px 4px;">FID</th>
          <th style="text-align: right; padding: 8px 4px;">CLS</th>
          <th style="text-align: right; padding: 8px 4px;">Score</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  // Only show the most recent 10 entries in the table
  const recentEntries = metricsHistory.slice(-10).reverse();
  
  recentEntries.forEach(entry => {
    const metrics = entry.metrics;
    const score = calculatePerformanceScore(metrics);
    const time = new Date(entry.timestamp).toLocaleTimeString();
    
    html += `
      <tr style="border-bottom: 1px solid #f5f7fa;">
        <td style="padding: 8px 4px;">${time}</td>
        <td style="text-align: right; padding: 8px 4px;">
          ${metrics.LCP ? `<span class="perf-metric-value ${metrics.LCP.rating}">${Math.round(metrics.LCP.value)}ms</span>` : '-'}
        </td>
        <td style="text-align: right; padding: 8px 4px;">
          ${metrics.FID ? `<span class="perf-metric-value ${metrics.FID.rating}">${Math.round(metrics.FID.value)}ms</span>` : '-'}
        </td>
        <td style="text-align: right; padding: 8px 4px;">
          ${metrics.CLS ? `<span class="perf-metric-value ${metrics.CLS.rating}">${metrics.CLS.value.toFixed(3)}</span>` : '-'}
        </td>
        <td style="text-align: right; padding: 8px 4px; font-weight: 600;">${score}</td>
      </tr>
    `;
  });
  
  html += `
      </tbody>
    </table>
  `;
  
  historyTab.innerHTML = html;
  
  // Add event listener to page selector
  const pageSelector = historyTab.querySelector('.perf-page-selector');
  if (pageSelector) {
    pageSelector.addEventListener('change', (e) => {
      updateHistoryTabForPage(e.target.value);
    });
  }
}

/**
 * Update history tab for a specific page
 */
function updateHistoryTabForPage(page) {
  const historyTab = document.getElementById('history-tab');
  const tableBody = historyTab.querySelector('tbody');
  
  // Get metric history from localStorage
  const historyKey = 'perf-metrics-history';
  const metricsHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
  
  // Filter history by page if needed
  let filteredHistory = metricsHistory;
  if (page !== 'all') {
    filteredHistory = metricsHistory.filter(entry => entry.url === page);
  }
  
  // Only show the most recent 10 entries in the table
  const recentEntries = filteredHistory.slice(-10).reverse();
  
  let html = '';
  
  recentEntries.forEach(entry => {
    const metrics = entry.metrics;
    const score = calculatePerformanceScore(metrics);
    const time = new Date(entry.timestamp).toLocaleTimeString();
    
    html += `
      <tr style="border-bottom: 1px solid #f5f7fa;">
        <td style="padding: 8px 4px;">${time}</td>
        <td style="text-align: right; padding: 8px 4px;">
          ${metrics.LCP ? `<span class="perf-metric-value ${metrics.LCP.rating}">${Math.round(metrics.LCP.value)}ms</span>` : '-'}
        </td>
        <td style="text-align: right; padding: 8px 4px;">
          ${metrics.FID ? `<span class="perf-metric-value ${metrics.FID.rating}">${Math.round(metrics.FID.value)}ms</span>` : '-'}
        </td>
        <td style="text-align: right; padding: 8px 4px;">
          ${metrics.CLS ? `<span class="perf-metric-value ${metrics.CLS.rating}">${metrics.CLS.value.toFixed(3)}</span>` : '-'}
        </td>
        <td style="text-align: right; padding: 8px 4px; font-weight: 600;">${score}</td>
      </tr>
    `;
  });
  
  tableBody.innerHTML = html;
}

/**
 * Update budgets tab content
 */
function updateBudgetsTab() {
  const budgetsTab = document.getElementById('budgets-tab');
  const webVitals = getWebVitalsMetrics();
  
  let html = `
    <div class="perf-metrics-section">
      <h3 class="perf-metrics-title">Performance Budgets</h3>
      <p style="font-size: 12px; color: #666; margin-bottom: 16px;">
        Track current metrics against performance budget thresholds.
      </p>
  `;
  
  for (const [name, threshold] of Object.entries(config.thresholds)) {
    const metric = webVitals[name];
    const value = metric ? metric.value : 0;
    
    // Calculate budget usage percentage
    const budgetUsagePercentage = (value / threshold.needsImprovement) * 100;
    
    // Determine color based on rating
    let color = '#ccc';
    if (metric) {
      color = metric.rating === 'good' ? '#0cce6b' : 
              metric.rating === 'needs-improvement' ? '#ffa400' : '#ff4e42';
    }
    
    html += `
      <div class="perf-metric-item">
        <div class="perf-metric-header">
          <span class="perf-metric-name">${name}</span>
          <span class="perf-metric-value" style="color: ${color};">
            ${name === 'CLS' ? value.toFixed(3) : Math.round(value)}${name === 'CLS' ? '' : 'ms'} 
            / ${name === 'CLS' ? threshold.needsImprovement : threshold.needsImprovement + 'ms'}
          </span>
        </div>
        <div class="perf-metric-bar">
          <div class="perf-metric-progress" style="width: ${Math.min(100, budgetUsagePercentage)}%; background-color: ${color};"></div>
        </div>
      </div>
    `;
  }
  
  html += `</div>`;
  
  // Resource budgets section
  html += `
    <div class="perf-metrics-section">
      <h3 class="perf-metrics-title">Resource Budgets</h3>
  `;
  
  // Get resource entries
  const resources = getPerformanceEntries().resource || [];
  
  // Group resources by type
  const resourceTypes = {};
  resources.forEach(resource => {
    const type = resource.initiatorType;
    if (!resourceTypes[type]) {
      resourceTypes[type] = {
        count: 0,
        size: 0,
      };
    }
    
    resourceTypes[type].count++;
    resourceTypes[type].size += resource.transferSize || 0;
  });
  
  // Resource budgets
  const resourceBudgets = {
    'script': 500 * 1024, // 500KB
    'css': 100 * 1024,    // 100KB
    'img': 1000 * 1024,   // 1MB
    'font': 200 * 1024,   // 200KB
    'xhr': 300 * 1024,    // 300KB
    'fetch': 300 * 1024,  // 300KB
  };
  
  for (const [type, data] of Object.entries(resourceTypes)) {
    const budget = resourceBudgets[type] || 500 * 1024; // Default 500KB budget
    const budgetUsagePercentage = (data.size / budget) * 100;
    
    // Determine color based on budget usage
    const color = budgetUsagePercentage <= 70 ? '#0cce6b' : 
                 budgetUsagePercentage <= 100 ? '#ffa400' : '#ff4e42';
    
    html += `
      <div class="perf-metric-item">
        <div class="perf-metric-header">
          <span class="perf-metric-name">${type} (${data.count})</span>
          <span class="perf-metric-value" style="color: ${color};">
            ${formatBytes(data.size)} / ${formatBytes(budget)}
          </span>
        </div>
        <div class="perf-metric-bar">
          <div class="perf-metric-progress" style="width: ${Math.min(100, budgetUsagePercentage)}%; background-color: ${color};"></div>
        </div>
      </div>
    `;
  }
  
  html += `</div>`;
  
  budgetsTab.innerHTML = html;
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes, decimals = 1) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Update dashboard with latest metrics
 */
function updateDashboard() {
  updateTabContent(document.querySelector('.perf-tab.active').dataset.tab);
}

/**
 * Initialize the dashboard
 */
function initDashboard() {
  // Create dashboard when DOM is ready
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    createDashboard();
    updateDashboard();
    
    // Set up periodic updates
    setInterval(updateDashboard, config.updateInterval);
  } else {
    window.addEventListener('DOMContentLoaded', () => {
      createDashboard();
      updateDashboard();
      
      // Set up periodic updates
      setInterval(updateDashboard, config.updateInterval);
    });
  }
}

// Initialize if in browser environment
if (typeof window !== 'undefined') {
  // Only initialize if enabled in config
  if (config.visible) {
    initDashboard();
  }
}

export { initDashboard, updateDashboard, toggleDashboard }; 