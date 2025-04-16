const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');

// Configuration
const config = {
  outputDir: path.resolve(__dirname, '../dist'),
  statsFile: path.resolve(__dirname, '../dist/stats.html'),
  performanceFile: path.resolve(__dirname, '../dist/build-performance.json'),
  historyFile: path.resolve(__dirname, '../dist/build-history.json'),
  buildTimeFile: path.resolve(__dirname, '../dist/build-time.txt'),
};

// Helper function to measure execution time
function measureExecutionTime(command) {
  const startTime = process.hrtime();

  try {
    execSync(command, { stdio: 'inherit' });
    const [seconds, nanoseconds] = process.hrtime(startTime);
    return seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds
  } catch (error) {
    console.error(chalk.red(`Error executing command: ${command}`), error);
    return -1;
  }
}

// Helper function to get current build metrics
function getCurrentBuildMetrics() {
  try {
    // Read stats.html to get bundle information
    const statsContent = fs.readFileSync(config.statsFile, 'utf8');

    // Extract bundle information using regex
    const bundleRegex = /"name":"([^"]+)","size":(\d+),"type":"([^"]+)"/g;
    const bundles = [];
    let match;

    while ((match = bundleRegex.exec(statsContent)) !== null) {
      const [_, name, size, type] = match;
      bundles.push({
        name,
        size: parseInt(size, 10),
        type,
      });
    }

    // Calculate total size and size by type
    const totalSize = bundles.reduce((sum, bundle) => sum + bundle.size, 0);
    const jsBundles = bundles.filter(b => b.type === 'js');
    const cssBundles = bundles.filter(b => b.type === 'css');
    const imageBundles = bundles.filter(b => b.type === 'image');
    const fontBundles = bundles.filter(b => b.type === 'font');

    const bundlesByType = {
      js: jsBundles.reduce((sum, b) => sum + b.size, 0),
      css: cssBundles.reduce((sum, b) => sum + b.size, 0),
      image: imageBundles.reduce((sum, b) => sum + b.size, 0),
      font: fontBundles.reduce((sum, b) => sum + b.size, 0),
      other: bundles
        .filter(b => !['js', 'css', 'image', 'font'].includes(b.type))
        .reduce((sum, b) => sum + b.size, 0),
    };

    // Get dependency count
    const dependencyTree = execSync('npm list --json', { encoding: 'utf8' });
    const dependencies = JSON.parse(dependencyTree);
    const dependencyCount = Object.keys(dependencies.dependencies || {}).length;

    return {
      timestamp: new Date().toISOString(),
      totalSize,
      bundlesByType,
      bundleCount: bundles.length,
      dependencyCount,
    };
  } catch (error) {
    console.error(chalk.red('Error getting current build metrics:'), error);
    return null;
  }
}

// Helper function to load build history
function loadBuildHistory() {
  try {
    if (fs.existsSync(config.historyFile)) {
      const historyContent = fs.readFileSync(config.historyFile, 'utf8');
      return JSON.parse(historyContent);
    }
    return [];
  } catch (error) {
    console.error(chalk.red('Error loading build history:'), error);
    return [];
  }
}

// Helper function to save build history
function saveBuildHistory(history) {
  try {
    fs.writeFileSync(config.historyFile, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error(chalk.red('Error saving build history:'), error);
  }
}

// Helper function to analyze build performance trends
function analyzeBuildPerformanceTrends(history) {
  if (history.length < 2) {
    return {
      sizeTrend: 'insufficient data',
      buildTimeTrend: 'insufficient data',
      dependencyTrend: 'insufficient data',
    };
  }

  // Sort history by timestamp (newest first)
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Calculate trends
  const latest = sortedHistory[0];
  const previous = sortedHistory[1];

  const sizeDiff = latest.totalSize - previous.totalSize;
  const sizeDiffPercent = (sizeDiff / previous.totalSize) * 100;

  const buildTimeDiff = latest.buildTime - previous.buildTime;
  const buildTimeDiffPercent = (buildTimeDiff / previous.buildTime) * 100;

  const dependencyDiff = latest.dependencyCount - previous.dependencyCount;

  return {
    sizeTrend:
      sizeDiff > 0
        ? `increased by ${sizeDiffPercent.toFixed(2)}%`
        : sizeDiff < 0
          ? `decreased by ${Math.abs(sizeDiffPercent).toFixed(2)}%`
          : 'unchanged',
    buildTimeTrend:
      buildTimeDiff > 0
        ? `increased by ${buildTimeDiffPercent.toFixed(2)}%`
        : buildTimeDiff < 0
          ? `decreased by ${Math.abs(buildTimeDiffPercent).toFixed(2)}%`
          : 'unchanged',
    dependencyTrend:
      dependencyDiff > 0
        ? `increased by ${dependencyDiff}`
        : dependencyDiff < 0
          ? `decreased by ${Math.abs(dependencyDiff)}`
          : 'unchanged',
  };
}

// Helper function to format bytes
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Helper function to format milliseconds
function formatMilliseconds(ms) {
  if (ms < 1000) {
    return `${ms.toFixed(2)} ms`;
  }

  const seconds = Math.floor(ms / 1000);
  const remainingMs = ms % 1000;

  return `${seconds}s ${remainingMs.toFixed(0)}ms`;
}

// Main function to track build performance
function trackBuildPerformance() {
  console.log(chalk.blue('Tracking build performance...'));

  // Measure build time
  const buildTime = measureExecutionTime('npm run build');

  if (buildTime < 0) {
    console.error(chalk.red('Build failed, cannot track performance'));
    return;
  }

  // Get current build metrics
  const currentMetrics = getCurrentBuildMetrics();

  if (!currentMetrics) {
    console.error(chalk.red('Failed to get current build metrics'));
    return;
  }

  // Add build time to metrics
  currentMetrics.buildTime = buildTime;

  // Load build history
  const history = loadBuildHistory();

  // Add current metrics to history
  history.push(currentMetrics);

  // Keep only the last 10 builds
  if (history.length > 10) {
    history.splice(0, history.length - 10);
  }

  // Save updated history
  saveBuildHistory(history);

  // Analyze trends
  const trends = analyzeBuildPerformanceTrends(history);

  // Generate performance report
  let report = 'BUILD PERFORMANCE REPORT\n';
  report += '=======================\n\n';

  // Current build metrics
  report += 'CURRENT BUILD METRICS\n';
  report += '--------------------\n';
  report += `Timestamp: ${currentMetrics.timestamp}\n`;
  report += `Build Time: ${formatMilliseconds(currentMetrics.buildTime)}\n`;
  report += `Total Bundle Size: ${formatBytes(currentMetrics.totalSize)}\n`;
  report += `Bundle Count: ${currentMetrics.bundleCount}\n`;
  report += `Dependency Count: ${currentMetrics.dependencyCount}\n\n`;

  // Bundle size by type
  report += 'Bundle size by type:\n';
  Object.entries(currentMetrics.bundlesByType).forEach(([type, size]) => {
    const percentage = ((size / currentMetrics.totalSize) * 100).toFixed(2);
    report += `- ${type.toUpperCase()}: ${formatBytes(size)} (${percentage}%)\n`;
  });
  report += '\n';

  // Performance trends
  report += 'PERFORMANCE TRENDS\n';
  report += '-----------------\n';
  report += `Bundle Size: ${trends.sizeTrend}\n`;
  report += `Build Time: ${trends.buildTimeTrend}\n`;
  report += `Dependencies: ${trends.dependencyTrend}\n\n`;

  // Write report to file
  fs.writeFileSync(config.buildTimeFile, report);
  console.log(chalk.green(`Build performance report generated: ${config.buildTimeFile}`));

  // Print summary to console
  console.log(chalk.cyan('\nBuild Performance Summary:'));
  console.log(`- Build Time: ${formatMilliseconds(currentMetrics.buildTime)}`);
  console.log(`- Total Bundle Size: ${formatBytes(currentMetrics.totalSize)}`);
  console.log(`- Bundle Count: ${currentMetrics.bundleCount}`);
  console.log(`- Dependency Count: ${currentMetrics.dependencyCount}`);
  console.log(`- Size Trend: ${trends.sizeTrend}`);
  console.log(`- Build Time Trend: ${trends.buildTimeTrend}`);
}

// Run the performance tracking
trackBuildPerformance();
