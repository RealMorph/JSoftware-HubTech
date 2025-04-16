const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');
const puppeteer = require('puppeteer');
const pixelmatch = require('pixelmatch');
const { PNG } = require('pngjs');

// Configuration
const config = {
  outputDir: path.resolve(__dirname, '../dist'),
  screenshotsDir: path.resolve(__dirname, '../dist/screenshots'),
  baselineDir: path.resolve(__dirname, '../dist/screenshots/baseline'),
  diffDir: path.resolve(__dirname, '../dist/screenshots/diff'),
  reportFile: path.resolve(__dirname, '../dist/visual-regression-report.txt'),
  components: [
    { name: 'Button', path: '/components/button' },
    { name: 'TextField', path: '/components/textfield' },
    { name: 'ButtonDemo', path: '/components/button-demo' },
    { name: 'TextFieldDemo', path: '/components/textfield-demo' },
    { name: 'ThemeManager', path: '/theme/manager' },
  ],
  themes: ['light', 'dark'],
  viewport: { width: 1280, height: 800 },
  threshold: 0.1, // 10% difference threshold
};

// Helper function to ensure directories exist
function ensureDirectories() {
  const dirs = [config.screenshotsDir, config.baselineDir, config.diffDir];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Helper function to capture screenshot
async function captureScreenshot(page, component, theme) {
  const filename = `${component.name.toLowerCase()}-${theme}.png`;
  const filepath = path.join(config.screenshotsDir, filename);

  // Set theme
  await page.evaluate(themeName => {
    window.localStorage.setItem('theme', themeName);
    document.documentElement.setAttribute('data-theme', themeName);
  }, theme);

  // Wait for theme to apply
  await page.waitForTimeout(500);

  // Capture screenshot
  await page.screenshot({ path: filepath, fullPage: true });

  return filepath;
}

// Helper function to compare images
function compareImages(img1Path, img2Path, diffPath) {
  const img1 = PNG.sync.read(fs.readFileSync(img1Path));
  const img2 = PNG.sync.read(fs.readFileSync(img2Path));
  const { width, height } = img1;
  const diff = new PNG({ width, height });

  const numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, {
    threshold: 0.1,
  });

  fs.writeFileSync(diffPath, PNG.sync.write(diff));

  return {
    totalPixels: width * height,
    diffPixels: numDiffPixels,
    diffPercentage: (numDiffPixels / (width * height)) * 100,
  };
}

// Helper function to generate report
function generateReport(results) {
  let report = 'VISUAL REGRESSION TEST REPORT\n';
  report += '============================\n\n';

  // Summary
  report += 'SUMMARY\n';
  report += '-------\n';
  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  const failedTests = totalTests - passedTests;

  report += `Total Tests: ${totalTests}\n`;
  report += `Passed: ${passedTests}\n`;
  report += `Failed: ${failedTests}\n\n`;

  // Detailed results
  report += 'DETAILED RESULTS\n';
  report += '----------------\n';

  results.forEach(result => {
    report += `${result.component} (${result.theme}):\n`;
    report += `  Status: ${result.passed ? 'PASSED' : 'FAILED'}\n`;
    if (!result.passed) {
      report += `  Difference: ${result.diffPercentage.toFixed(2)}%\n`;
      report += `  Diff Image: ${path.relative(config.outputDir, result.diffPath)}\n`;
    }
    report += '\n';
  });

  // Write report to file
  fs.writeFileSync(config.reportFile, report);
  console.log(chalk.green(`Visual regression report generated: ${config.reportFile}`));

  // Print summary to console
  console.log(chalk.cyan('\nVisual Regression Test Summary:'));
  console.log(`- Total Tests: ${totalTests}`);
  console.log(`- Passed: ${passedTests}`);
  console.log(`- Failed: ${failedTests}`);

  if (failedTests > 0) {
    console.log(chalk.yellow('\nFailed Tests:'));
    results
      .filter(r => !r.passed)
      .forEach(result => {
        console.log(
          `- ${result.component} (${result.theme}): ${result.diffPercentage.toFixed(2)}% difference`
        );
      });
  }
}

// Main function to run visual regression tests
async function runVisualRegressionTests() {
  console.log(chalk.blue('Running visual regression tests...'));

  // Ensure directories exist
  ensureDirectories();

  // Start development server
  console.log(chalk.blue('Starting development server...'));
  const server = execSync('npm run dev', { stdio: 'inherit' });

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Launch browser
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport(config.viewport);

  // Navigate to app
  await page.goto('http://localhost:3000');

  // Test results
  const results = [];

  // Test each component with each theme
  for (const component of config.components) {
    for (const theme of config.themes) {
      console.log(chalk.blue(`Testing ${component.name} with ${theme} theme...`));

      // Navigate to component
      await page.goto(`http://localhost:3000${component.path}`);

      // Capture current screenshot
      const currentPath = await captureScreenshot(page, component, theme);

      // Baseline path
      const baselinePath = path.join(
        config.baselineDir,
        `${component.name.toLowerCase()}-${theme}.png`
      );

      // Check if baseline exists
      if (fs.existsSync(baselinePath)) {
        // Compare with baseline
        const diffPath = path.join(
          config.diffDir,
          `${component.name.toLowerCase()}-${theme}-diff.png`
        );
        const comparison = compareImages(baselinePath, currentPath, diffPath);

        // Check if difference is within threshold
        const passed = comparison.diffPercentage <= config.threshold;

        results.push({
          component: component.name,
          theme,
          passed,
          diffPercentage: comparison.diffPercentage,
          diffPath: passed ? null : diffPath,
        });
      } else {
        // Create baseline
        fs.copyFileSync(currentPath, baselinePath);
        console.log(chalk.yellow(`Created baseline for ${component.name} (${theme})`));

        results.push({
          component: component.name,
          theme,
          passed: true,
          diffPercentage: 0,
          diffPath: null,
        });
      }
    }
  }

  // Close browser
  await browser.close();

  // Generate report
  generateReport(results);

  // Kill development server
  process.kill(server.pid);

  // Return test results
  return results.every(r => r.passed);
}

// Run the tests
runVisualRegressionTests()
  .then(success => {
    if (success) {
      console.log(chalk.green('All visual regression tests passed!'));
      process.exit(0);
    } else {
      console.log(chalk.red('Some visual regression tests failed. Check the report for details.'));
      process.exit(1);
    }
  })
  .catch(error => {
    console.error(chalk.red('Error running visual regression tests:'), error);
    process.exit(1);
  });
