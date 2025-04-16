const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');

// Configuration
const config = {
  outputDir: path.resolve(__dirname, '../dist'),
  statsFile: path.resolve(__dirname, '../dist/stats.html'),
  reportFile: path.resolve(__dirname, '../dist/build-analysis.txt'),
  bundleSizeLimit: 500 * 1024, // 500KB
  dependencySizeLimit: 100 * 1024, // 100KB
  imageSizeLimit: 200 * 1024, // 200KB
};

// Helper function to format bytes
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Helper function to extract bundle information from stats.html
function extractBundleInfo() {
  try {
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

    return bundles;
  } catch (error) {
    console.error(chalk.red('Error extracting bundle information:'), error);
    return [];
  }
}

// Helper function to analyze bundles
function analyzeBundles(bundles) {
  const totalSize = bundles.reduce((sum, bundle) => sum + bundle.size, 0);
  const jsBundles = bundles.filter(b => b.type === 'js');
  const cssBundles = bundles.filter(b => b.type === 'css');
  const imageBundles = bundles.filter(b => b.type === 'image');
  const fontBundles = bundles.filter(b => b.type === 'font');

  // Sort bundles by size (descending)
  const sortedBundles = [...bundles].sort((a, b) => b.size - a.size);

  // Find large bundles
  const largeBundles = sortedBundles.filter(b => b.size > config.bundleSizeLimit);

  // Group bundles by type
  const bundlesByType = {
    js: jsBundles.reduce((sum, b) => sum + b.size, 0),
    css: cssBundles.reduce((sum, b) => sum + b.size, 0),
    image: imageBundles.reduce((sum, b) => sum + b.size, 0),
    font: fontBundles.reduce((sum, b) => sum + b.size, 0),
    other: bundles
      .filter(b => !['js', 'css', 'image', 'font'].includes(b.type))
      .reduce((sum, b) => sum + b.size, 0),
  };

  return {
    totalSize,
    bundlesByType,
    largeBundles,
    sortedBundles: sortedBundles.slice(0, 10), // Top 10 largest bundles
  };
}

// Helper function to analyze dependencies
function analyzeDependencies() {
  try {
    // Run npm list to get dependency tree
    const dependencyTree = execSync('npm list --json', { encoding: 'utf8' });
    const dependencies = JSON.parse(dependencyTree);

    // Extract direct dependencies
    const directDeps = Object.entries(dependencies.dependencies || {}).map(([name, info]) => ({
      name,
      version: info.version,
      size: 0, // We don't have size info from npm list
    }));

    return {
      directDependencies: directDeps,
      totalDependencies: Object.keys(dependencies.dependencies || {}).length,
    };
  } catch (error) {
    console.error(chalk.red('Error analyzing dependencies:'), error);
    return {
      directDependencies: [],
      totalDependencies: 0,
    };
  }
}

// Helper function to generate recommendations
function generateRecommendations(analysis) {
  const recommendations = [];

  // Bundle size recommendations
  if (analysis.bundles.largeBundles.length > 0) {
    recommendations.push({
      category: 'Bundle Size',
      issues: analysis.bundles.largeBundles.map(
        b => `Large bundle: ${b.name} (${formatBytes(b.size)})`
      ),
      suggestions: [
        'Consider code splitting to reduce initial bundle size',
        'Use dynamic imports for large dependencies',
        'Analyze and remove unused code',
      ],
    });
  }

  // Dependency recommendations
  if (analysis.dependencies.totalDependencies > 50) {
    recommendations.push({
      category: 'Dependencies',
      issues: [`Large number of dependencies: ${analysis.dependencies.totalDependencies}`],
      suggestions: [
        'Audit dependencies for unused packages',
        'Consider using lighter alternatives for heavy dependencies',
        'Use bundle analysis to identify large dependencies',
      ],
    });
  }

  // Asset recommendations
  if (analysis.bundles.bundlesByType.image > 500 * 1024) {
    recommendations.push({
      category: 'Assets',
      issues: [`Large image assets: ${formatBytes(analysis.bundles.bundlesByType.image)}`],
      suggestions: [
        'Optimize images using tools like imagemin',
        'Consider using WebP format for better compression',
        'Implement lazy loading for images',
      ],
    });
  }

  return recommendations;
}

// Main function to generate the report
function generateReport() {
  console.log(chalk.blue('Generating build analysis report...'));

  // Extract bundle information
  const bundles = extractBundleInfo();
  const bundleAnalysis = analyzeBundles(bundles);

  // Analyze dependencies
  const dependencyAnalysis = analyzeDependencies();

  // Generate recommendations
  const recommendations = generateRecommendations({
    bundles: bundleAnalysis,
    dependencies: dependencyAnalysis,
  });

  // Generate report
  let report = 'BUILD ANALYSIS REPORT\n';
  report += '=====================\n\n';

  // Bundle size summary
  report += 'BUNDLE SIZE SUMMARY\n';
  report += '------------------\n';
  report += `Total bundle size: ${formatBytes(bundleAnalysis.totalSize)}\n\n`;

  // Bundle size by type
  report += 'Bundle size by type:\n';
  Object.entries(bundleAnalysis.bundlesByType).forEach(([type, size]) => {
    const percentage = ((size / bundleAnalysis.totalSize) * 100).toFixed(2);
    report += `- ${type.toUpperCase()}: ${formatBytes(size)} (${percentage}%)\n`;
  });
  report += '\n';

  // Largest bundles
  report += 'LARGEST BUNDLES\n';
  report += '---------------\n';
  bundleAnalysis.sortedBundles.forEach((bundle, index) => {
    report += `${index + 1}. ${bundle.name}: ${formatBytes(bundle.size)}\n`;
  });
  report += '\n';

  // Dependencies
  report += 'DEPENDENCIES\n';
  report += '------------\n';
  report += `Total dependencies: ${dependencyAnalysis.totalDependencies}\n\n`;

  // Direct dependencies
  report += 'Direct dependencies:\n';
  dependencyAnalysis.directDependencies.forEach(dep => {
    report += `- ${dep.name}@${dep.version}\n`;
  });
  report += '\n';

  // Recommendations
  report += 'RECOMMENDATIONS\n';
  report += '---------------\n';
  recommendations.forEach(rec => {
    report += `${rec.category}:\n`;
    rec.issues.forEach(issue => {
      report += `- Issue: ${issue}\n`;
    });
    rec.suggestions.forEach(suggestion => {
      report += `- Suggestion: ${suggestion}\n`;
    });
    report += '\n';
  });

  // Write report to file
  fs.writeFileSync(config.reportFile, report);
  console.log(chalk.green(`Build analysis report generated: ${config.reportFile}`));

  // Print summary to console
  console.log(chalk.cyan('\nBuild Analysis Summary:'));
  console.log(`- Total bundle size: ${formatBytes(bundleAnalysis.totalSize)}`);
  console.log(`- Number of bundles: ${bundles.length}`);
  console.log(`- Number of dependencies: ${dependencyAnalysis.totalDependencies}`);
  console.log(`- Large bundles: ${bundleAnalysis.largeBundles.length}`);
  console.log(`- Recommendations: ${recommendations.length} categories`);
}

// Run the analysis
generateReport();
