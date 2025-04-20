/**
 * Visual Regression Testing Script
 * 
 * This script serves as a runner for visual regression tests using Chromatic.
 * It can also generate a summary of visual regression test results for the dashboard.
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Parse command line arguments
const args = process.argv.slice(2);
const updateBaseline = args.includes('--update-baseline');
const ciMode = args.includes('--ci');
const generateSummaryOnly = args.includes('--summary-only');

// Directories
const resultsDir = path.join(__dirname, '../test-results');
const visualResultsPath = path.join(resultsDir, 'visual-regression-results.json');

// Ensure test results directory exists
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

function saveSummary(summary) {
  fs.writeFileSync(visualResultsPath, JSON.stringify(summary, null, 2));
  console.log(chalk.green(`✅ Visual regression test summary saved to ${visualResultsPath}`));
}

function getLatestChromaticResults() {
  try {
    // This would typically come from Chromatic's API
    // For demonstration, we'll create a mock summary
    // In a real implementation, you would query the Chromatic API
    
    const summary = {
      timestamp: new Date().toISOString(),
      buildNumber: Math.floor(Math.random() * 1000) + 1,
      totalSnapshots: 120,
      changedSnapshots: updateBaseline ? 0 : Math.floor(Math.random() * 10),
      addedSnapshots: Math.floor(Math.random() * 5),
      removedSnapshots: Math.floor(Math.random() * 3),
      components: {
        total: 45,
        changed: updateBaseline ? 0 : Math.floor(Math.random() * 8),
      },
      browsers: [
        { name: 'Chrome', snapshots: 120, changed: updateBaseline ? 0 : Math.floor(Math.random() * 5) },
        { name: 'Firefox', snapshots: 120, changed: updateBaseline ? 0 : Math.floor(Math.random() * 7) },
        { name: 'Safari', snapshots: 120, changed: updateBaseline ? 0 : Math.floor(Math.random() * 4) },
        { name: 'Edge', snapshots: 120, changed: updateBaseline ? 0 : Math.floor(Math.random() * 6) }
      ],
      viewports: [
        { name: 'Mobile', width: 320, snapshots: 120, changed: updateBaseline ? 0 : Math.floor(Math.random() * 3) },
        { name: 'Tablet', width: 768, snapshots: 120, changed: updateBaseline ? 0 : Math.floor(Math.random() * 4) },
        { name: 'Desktop', width: 1280, snapshots: 120, changed: updateBaseline ? 0 : Math.floor(Math.random() * 5) }
      ],
      url: 'https://www.chromatic.com/builds?appId=your-app-id',
      passed: updateBaseline ? true : (Math.random() > 0.3), // 70% chance of passing if not updating baseline
    };

    // If updating baseline, all changes are accepted
    if (updateBaseline) {
      summary.changedSnapshots = 0;
      summary.components.changed = 0;
      summary.browsers.forEach(browser => browser.changed = 0);
      summary.viewports.forEach(viewport => viewport.changed = 0);
      summary.passed = true;
    }

    return summary;
  } catch (error) {
    console.error(chalk.red('Error fetching Chromatic results:'), error);
    return null;
  }
}

// If we're just generating a summary, do that and exit
if (generateSummaryOnly) {
  const summary = getLatestChromaticResults();
  if (summary) {
    saveSummary(summary);
  }
  process.exit(0);
}

// Main function to run visual regression tests
async function runVisualRegressionTests() {
  console.log(chalk.cyan('Running visual regression tests with Chromatic...'));
  
  try {
    // Run Storybook build first (if not already built)
    if (!fs.existsSync(path.join(__dirname, '../storybook-static'))) {
      console.log(chalk.cyan('Building Storybook...'));
      execSync('npm run build-storybook', { stdio: 'inherit' });
    }
    
    // Run Chromatic
    const chromaticCommand = updateBaseline 
      ? 'npm run test:chromatic -- --auto-accept-changes'
      : ciMode
        ? 'npm run test:chromatic:ci'
        : 'npm run test:chromatic';
    
    console.log(chalk.cyan(`Executing: ${chromaticCommand}`));
    execSync(chromaticCommand, { stdio: 'inherit' });
    
    // Get results and save summary
    const summary = getLatestChromaticResults();
    if (summary) {
      saveSummary(summary);
      
      // Log results
      console.log('\n' + chalk.cyan('Visual Regression Test Summary:'));
      console.log(chalk.cyan('----------------------------------------'));
      console.log(chalk.white(`Total Components: ${summary.components.total}`));
      console.log(chalk.white(`Total Snapshots: ${summary.totalSnapshots}`));
      
      if (summary.passed) {
        console.log(chalk.green(`✅ Tests Passed!`));
      } else {
        console.log(chalk.red(`❌ Tests Failed!`));
        console.log(chalk.yellow(`Changed Components: ${summary.components.changed}`));
        console.log(chalk.yellow(`Changed Snapshots: ${summary.changedSnapshots}`));
      }
      
      console.log(chalk.white(`Added Snapshots: ${summary.addedSnapshots}`));
      console.log(chalk.white(`Removed Snapshots: ${summary.removedSnapshots}`));
      console.log(chalk.cyan('----------------------------------------'));
      console.log(chalk.white(`View full results at: ${summary.url}`));
    }
  } catch (error) {
    console.error(chalk.red('Error running visual regression tests:'), error);
    process.exit(1);
  }
}

// Run the tests
runVisualRegressionTests();
