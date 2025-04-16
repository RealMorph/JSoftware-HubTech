const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { spawn } = require('child_process');
const puppeteer = require('puppeteer');
const pixelmatch = require('pixelmatch');
const { PNG } = require('pngjs');
const fetch = require('node-fetch');

// Configuration
const config = {
  outputDir: path.resolve(__dirname, '../dist'),
  screenshotsDir: path.resolve(__dirname, '../dist/screenshots'),
  baselineDir: path.resolve(__dirname, '../dist/screenshots/baseline'),
  diffDir: path.resolve(__dirname, '../dist/screenshots/diff'),
  reportFile: path.resolve(__dirname, '../dist/theme-visual-regression-report.txt'),
  components: [
    { name: 'Button', path: '/components/button' },
    { name: 'TextField', path: '/components/textfield' },
    { name: 'ButtonDemo', path: '/components/button-demo' },
    { name: 'TextFieldDemo', path: '/components/textfield-demo' },
    { name: 'ThemeManager', path: '/theme/manager' },
  ],
  themes: [
    { name: 'light', id: 'default-light' },
    { name: 'dark', id: 'default-dark' },
    { name: 'custom-blue', id: 'custom-blue-theme' },
    { name: 'custom-green', id: 'custom-green-theme' },
  ],
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

// Helper function to wait for server to be ready
async function waitForServer(port, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`http://localhost:${port}`);
      if (response.ok || response.status === 404) {
        return true;
      }
    } catch (e) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return false;
}

// Helper function to find available port
async function findAvailablePort(startPort = 3000, endPort = 3010) {
  for (let port = startPort; port <= endPort; port++) {
    try {
      await fetch(`http://localhost:${port}`);
    } catch (e) {
      // Port is available if connection fails
      return port;
    }
  }
  throw new Error('No available ports found');
}

// Helper function to start dev server
async function startDevServer() {
  const server = spawn('npm', ['run', 'dev'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
  });

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Server startup timeout'));
    }, 30000);

    let buffer = '';
    const portRegex = /➜\s+Local:\s+http:\/\/localhost:(\d+)/;

    server.stdout.on('data', async data => {
      const output = data.toString();
      console.log(chalk.gray(output));

      buffer += output;
      const match = buffer.match(portRegex);

      if (match) {
        const port = parseInt(match[1]);
        // Wait for server to be ready
        try {
          const isReady = await waitForServer(port);
          if (isReady) {
            clearTimeout(timeout);
            resolve({ server, port });
          }
        } catch (e) {
          // Continue waiting
        }
      }
    });

    server.stderr.on('data', data => {
      const output = data.toString();
      if (!output.includes('CJS build of Vite')) {
        console.error(chalk.red(output));
      }
    });

    server.on('error', error => {
      clearTimeout(timeout);
      reject(error);
    });

    server.on('exit', code => {
      if (code !== 0) {
        clearTimeout(timeout);
        reject(new Error(`Server exited with code ${code}`));
      }
    });
  });
}

// Helper function to capture screenshot
async function captureScreenshot(page, component, theme) {
  const filename = `${component.name.toLowerCase()}-${theme.name}.png`;
  const filepath = path.join(config.screenshotsDir, filename);

  // Set theme
  await page.evaluate(themeId => {
    window.localStorage.setItem('theme', themeId);
    document.documentElement.setAttribute('data-theme', themeId);
  }, theme.id);

  // Wait for theme to apply and any animations to complete
  await page.waitForTimeout(1000);

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
  let report = 'THEME VISUAL REGRESSION TEST REPORT\n';
  report += '==================================\n\n';

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
  console.log(chalk.green(`Theme visual regression report generated: ${config.reportFile}`));

  // Print summary to console
  console.log(chalk.cyan('\nTheme Visual Regression Test Summary:'));
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
async function runThemeVisualRegressionTests() {
  console.log(chalk.blue('Running theme visual regression tests...'));

  // Ensure directories exist
  ensureDirectories();

  // Start development server
  console.log(chalk.blue('Starting development server...'));
  const { server, port } = await startDevServer();
  console.log(chalk.blue(`Server running on port ${port}`));

  // Launch browser
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport(config.viewport);

  // Navigate to app
  await page.goto(`http://localhost:${port}`);

  // Test results
  const results = [];

  try {
    // Test each component with each theme
    for (const component of config.components) {
      for (const theme of config.themes) {
        console.log(chalk.blue(`Testing ${component.name} with ${theme.name} theme...`));

        // Navigate to component
        await page.goto(`http://localhost:${port}${component.path}`);

        // Capture current screenshot
        const currentPath = await captureScreenshot(page, component, theme);

        // Baseline path
        const baselinePath = path.join(
          config.baselineDir,
          `${component.name.toLowerCase()}-${theme.name}.png`
        );

        // Check if baseline exists
        if (fs.existsSync(baselinePath)) {
          // Compare with baseline
          const diffPath = path.join(
            config.diffDir,
            `${component.name.toLowerCase()}-${theme.name}-diff.png`
          );
          const comparison = compareImages(baselinePath, currentPath, diffPath);

          // Check if difference is within threshold
          const passed = comparison.diffPercentage <= config.threshold;

          results.push({
            component: component.name,
            theme: theme.name,
            passed,
            diffPercentage: comparison.diffPercentage,
            diffPath: passed ? null : diffPath,
          });
        } else {
          // Create baseline
          fs.copyFileSync(currentPath, baselinePath);
          console.log(chalk.yellow(`Created baseline for ${component.name} (${theme.name})`));

          results.push({
            component: component.name,
            theme: theme.name,
            passed: true,
            diffPercentage: 0,
            diffPath: null,
          });
        }
      }
    }
  } finally {
    // Generate report
    generateReport(results);

    // Close browser
    await browser.close();

    // Kill development server
    server.kill();

    // Return exit code
    process.exit(results.every(r => r.passed) ? 0 : 1);
  }
}

// Check if we're updating baselines
const updateBaseline = process.argv.includes('--update-baseline');

// Run tests
runThemeVisualRegressionTests().catch(error => {
  console.error(chalk.red('Error running theme visual regression tests:'), error);
  process.exit(1);
});
