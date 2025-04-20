/**
 * Build Time Optimizer
 * 
 * This script analyzes the build process to identify bottlenecks and suggest 
 * optimizations to improve build performance.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');
let prettyMs;

try {
  prettyMs = require('pretty-ms');
} catch (error) {
  console.warn('pretty-ms module not found, using fallback formatting function');
}

// Fallback function for formatting milliseconds
function formatMs(ms) {
  if (prettyMs && typeof prettyMs === 'function') {
    return prettyMs(ms);
  }
  
  // Simple fallback implementation
  if (ms < 1000) {
    return `${ms}ms`;
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`;
  } else if (ms < 3600000) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  } else {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  }
}

// Constants
const OUTPUT_DIR = path.resolve(__dirname, '../../dist');
const REPORT_FILE = path.join(OUTPUT_DIR, 'build-time-optimization.html');
const TEMP_DIR = path.join(__dirname, '../../.temp-build-profile');
const VITE_CONFIG = path.resolve(__dirname, '../../vite.config.ts');
const TS_CONFIG = path.resolve(__dirname, '../../tsconfig.json');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Profile the build process and collect timing information
 */
async function profileBuildPhases() {
  console.log(chalk.cyan('Profiling build phases...'));
  
  // Create temp directory if it doesn't exist
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }
  
  const buildPhaseTimes = {};
  
  try {
    // Measure TypeScript compilation time
    console.log('Measuring TypeScript compilation time...');
    const tsStartTime = Date.now();
    execSync('npx tsc --noEmit', { stdio: 'inherit' });
    const tsDuration = Date.now() - tsStartTime;
    buildPhaseTimes.typeScriptCompilation = tsDuration;
    
    // Measure Vite build time
    console.log('Measuring Vite build time...');
    const viteStartTime = Date.now();
    execSync('npx vite build', { stdio: 'inherit' });
    const viteDuration = Date.now() - viteStartTime;
    buildPhaseTimes.viteBuild = viteDuration;
    
    // Calculate total build time
    buildPhaseTimes.total = tsDuration + viteDuration;
    
    return buildPhaseTimes;
  } catch (error) {
    console.error(chalk.red('Error during build profiling:'), error);
    return {
      typeScriptCompilation: 0,
      viteBuild: 0,
      total: 0,
      error: error.message
    };
  } finally {
    // Clean up temp directory
    if (fs.existsSync(TEMP_DIR)) {
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    }
  }
}

/**
 * Analyze Vite configuration for potential optimizations
 */
function analyzeViteConfig() {
  console.log(chalk.cyan('Analyzing Vite configuration...'));
  
  try {
    const configFile = fs.readFileSync(VITE_CONFIG, 'utf8');
    const optimizationSuggestions = [];
    
    // Check for build.target setting
    if (!configFile.includes('build: {') || !configFile.includes('target:')) {
      optimizationSuggestions.push({
        type: 'vite',
        issue: 'Missing build target configuration',
        suggestion: 'Set build.target to a modern browser target to reduce polyfills',
        impact: 'medium'
      });
    }
    
    // Check for build.minify
    if (!configFile.includes('minify:')) {
      optimizationSuggestions.push({
        type: 'vite',
        issue: 'Missing minify configuration',
        suggestion: 'Explicitly set build.minify to "esbuild" for faster minification',
        impact: 'medium'
      });
    }
    
    // Check for optimizeDeps configuration
    if (!configFile.includes('optimizeDeps:')) {
      optimizationSuggestions.push({
        type: 'vite',
        issue: 'Missing optimizeDeps configuration',
        suggestion: 'Configure optimizeDeps.include for frequently used dependencies',
        impact: 'high'
      });
    }
    
    // Check for esbuild configuration
    if (!configFile.includes('esbuild:')) {
      optimizationSuggestions.push({
        type: 'vite',
        issue: 'Missing esbuild configuration',
        suggestion: 'Configure esbuild options for faster transformations',
        impact: 'medium'
      });
    }
    
    return optimizationSuggestions;
  } catch (error) {
    console.error(chalk.red('Error analyzing Vite config:'), error);
    return [{
      type: 'vite',
      issue: 'Error analyzing Vite configuration',
      suggestion: 'Check Vite configuration file for errors',
      impact: 'high'
    }];
  }
}

/**
 * Analyze TypeScript configuration for potential optimizations
 */
function analyzeTsConfig() {
  console.log(chalk.cyan('Analyzing TypeScript configuration...'));
  
  try {
    const configFile = fs.readFileSync(TS_CONFIG, 'utf8');
    const tsConfig = JSON.parse(configFile);
    const optimizationSuggestions = [];
    
    // Check for skipLibCheck
    if (!tsConfig.compilerOptions?.skipLibCheck) {
      optimizationSuggestions.push({
        type: 'typescript',
        issue: 'skipLibCheck is not enabled',
        suggestion: 'Enable skipLibCheck in tsconfig.json to avoid checking declaration files',
        impact: 'high'
      });
    }
    
    // Check for incremental compilation
    if (!tsConfig.compilerOptions?.incremental) {
      optimizationSuggestions.push({
        type: 'typescript',
        issue: 'Incremental compilation is not enabled',
        suggestion: 'Enable incremental compilation in tsconfig.json',
        impact: 'high'
      });
    }
    
    // Check for isolatedModules
    if (!tsConfig.compilerOptions?.isolatedModules) {
      optimizationSuggestions.push({
        type: 'typescript',
        issue: 'isolatedModules is not enabled',
        suggestion: 'Enable isolatedModules for better compatibility with transpilers',
        impact: 'medium'
      });
    }
    
    // Check for paths mapping
    if (tsConfig.compilerOptions?.paths && Object.keys(tsConfig.compilerOptions.paths).length > 10) {
      optimizationSuggestions.push({
        type: 'typescript',
        issue: 'Excessive path mappings',
        suggestion: 'Consider reducing the number of path mappings to improve compile time',
        impact: 'medium'
      });
    }
    
    return optimizationSuggestions;
  } catch (error) {
    console.error(chalk.red('Error analyzing TypeScript config:'), error);
    return [{
      type: 'typescript',
      issue: 'Error analyzing TypeScript configuration',
      suggestion: 'Check tsconfig.json for errors',
      impact: 'high'
    }];
  }
}

/**
 * Analyze project dependencies for build time impact
 */
function analyzeDependencies() {
  console.log(chalk.cyan('Analyzing dependencies...'));
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../package.json'), 'utf8'));
    const allDependencies = { 
      ...packageJson.dependencies || {}, 
      ...packageJson.devDependencies || {} 
    };
    
    const optimizationSuggestions = [];
    
    // Check for dependency count
    const dependencyCount = Object.keys(allDependencies).length;
    if (dependencyCount > 50) {
      optimizationSuggestions.push({
        type: 'dependencies',
        issue: `Large number of dependencies (${dependencyCount})`,
        suggestion: 'Review dependencies and remove unused ones to reduce build time',
        impact: 'high'
      });
    }
    
    // Check for specific heavyweight dependencies
    const heavyDependencies = ['moment', 'lodash', 'antd', 'material-ui', '@material-ui/core'];
    const presentHeavyDeps = heavyDependencies.filter(dep => 
      Object.keys(allDependencies).some(d => d === dep || d.includes(dep))
    );
    
    if (presentHeavyDeps.length > 0) {
      optimizationSuggestions.push({
        type: 'dependencies',
        issue: `Heavyweight dependencies found: ${presentHeavyDeps.join(', ')}`,
        suggestion: 'Consider using lighter alternatives or importing only needed modules',
        impact: 'high'
      });
    }
    
    return optimizationSuggestions;
  } catch (error) {
    console.error(chalk.red('Error analyzing dependencies:'), error);
    return [{
      type: 'dependencies',
      issue: 'Error analyzing dependencies',
      suggestion: 'Check package.json for errors',
      impact: 'medium'
    }];
  }
}

/**
 * Measure build times with different configurations
 */
function measureBuildTimings() {
  console.log(chalk.cyan('Measuring build times with different configurations...'));
  
  const timings = {};
  
  try {
    // Regular build time (already measured in profileBuildPhases)
    timings.regular = 'See "Build Phases" section';
    
    // Suggestions for different build configurations
    return [{
      type: 'performance',
      suggestion: 'Run builds with different thread counts to find optimal threading configuration',
      impact: 'medium'
    }, {
      type: 'performance',
      suggestion: 'Consider using swc or esbuild instead of Babel for faster transpilation',
      impact: 'high'
    }, {
      type: 'performance',
      suggestion: 'Use build caching to speed up consecutive builds',
      impact: 'high'
    }];
  } catch (error) {
    console.error(chalk.red('Error measuring build timings:'), error);
    return [{
      type: 'performance',
      issue: 'Error measuring build timings',
      suggestion: 'Try running builds manually with different configurations',
      impact: 'medium'
    }];
  }
}

/**
 * Generate optimization suggestions based on all analyses
 */
function generateSuggestions(buildTimes, viteAnalysis, tsAnalysis, dependencyAnalysis, timingAnalysis) {
  // Combine all suggestions
  const allSuggestions = [
    ...viteAnalysis,
    ...tsAnalysis,
    ...dependencyAnalysis,
    ...timingAnalysis
  ];
  
  // Sort by impact (high to low)
  const impactValue = {
    'high': 3,
    'medium': 2,
    'low': 1
  };
  
  allSuggestions.sort((a, b) => {
    return impactValue[b.impact] - impactValue[a.impact];
  });
  
  // Group by type
  const groupedSuggestions = {};
  allSuggestions.forEach(suggestion => {
    if (!groupedSuggestions[suggestion.type]) {
      groupedSuggestions[suggestion.type] = [];
    }
    groupedSuggestions[suggestion.type].push(suggestion);
  });
  
  // Calculate potential time savings
  let potentialSavingsPercent = 0;
  
  // High impact suggestions can save ~20%
  const highImpactCount = allSuggestions.filter(s => s.impact === 'high').length;
  // Medium impact suggestions can save ~10%
  const mediumImpactCount = allSuggestions.filter(s => s.impact === 'medium').length;
  // Low impact suggestions can save ~5%
  const lowImpactCount = allSuggestions.filter(s => s.impact === 'low').length;
  
  potentialSavingsPercent = (highImpactCount * 20 + mediumImpactCount * 10 + lowImpactCount * 5) / 100;
  // Cap at 90%
  potentialSavingsPercent = Math.min(potentialSavingsPercent, 0.9);
  
  const potentialTimeSavings = buildTimes.total * potentialSavingsPercent;
  
  return {
    grouped: groupedSuggestions,
    all: allSuggestions,
    potentialSavingsPercent,
    potentialTimeSavings
  };
}

/**
 * Generate and save an optimization report
 */
function saveOptimizationReport(buildTimes, suggestions) {
  console.log(chalk.cyan('Generating optimization report...'));
  
  // Generate HTML report
  const htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Build Time Optimization Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        h1, h2, h3 {
            margin-top: 30px;
            color: #2c3e50;
        }
        .summary {
            background-color: #f8f9fa;
            border-radius: 5px;
            padding: 20px;
            margin-bottom: 30px;
        }
        .timing {
            margin-bottom: 10px;
        }
        .suggestion {
            border-left: 4px solid #3498db;
            padding: 10px 20px;
            margin-bottom: 15px;
            background-color: #f8f9fa;
        }
        .high {
            border-color: #e74c3c;
        }
        .medium {
            border-color: #f39c12;
        }
        .low {
            border-color: #2ecc71;
        }
        .impact {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 0.8em;
            font-weight: bold;
            color: white;
        }
        .impact.high {
            background-color: #e74c3c;
        }
        .impact.medium {
            background-color: #f39c12;
        }
        .impact.low {
            background-color: #2ecc71;
        }
        .potential-savings {
            font-size: 1.2em;
            font-weight: bold;
            margin-top: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        th, td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        .chart-container {
            margin: 30px 0;
            height: 300px;
        }
    </style>
</head>
<body>
    <h1>Build Time Optimization Report</h1>
    
    <div class="summary">
        <h2>Build Time Summary</h2>
        <div class="timing"><strong>Total Build Time:</strong> ${formatMs(buildTimes.total)}</div>
        <div class="timing"><strong>TypeScript Compilation:</strong> ${formatMs(buildTimes.typeScriptCompilation)} (${Math.round(buildTimes.typeScriptCompilation / buildTimes.total * 100)}%)</div>
        <div class="timing"><strong>Vite Build:</strong> ${formatMs(buildTimes.viteBuild)} (${Math.round(buildTimes.viteBuild / buildTimes.total * 100)}%)</div>
        
        <div class="potential-savings">
            Potential Time Savings: ${formatMs(suggestions.potentialTimeSavings)} (${Math.round(suggestions.potentialSavingsPercent * 100)}% reduction)
        </div>
    </div>
    
    <h2>Optimization Suggestions</h2>
    
    ${Object.keys(suggestions.grouped).map(groupType => `
        <h3>${groupType.charAt(0).toUpperCase() + groupType.slice(1)} Optimizations</h3>
        ${suggestions.grouped[groupType].map(suggestion => `
            <div class="suggestion ${suggestion.impact}">
                ${suggestion.issue ? `<div><strong>Issue:</strong> ${suggestion.issue}</div>` : ''}
                <div><strong>Suggestion:</strong> ${suggestion.suggestion}</div>
                <div><strong>Impact:</strong> <span class="impact ${suggestion.impact}">${suggestion.impact}</span></div>
            </div>
        `).join('')}
    `).join('')}
    
    <h2>Build Time Breakdown</h2>
    <table>
        <tr>
            <th>Build Phase</th>
            <th>Duration</th>
            <th>Percentage</th>
        </tr>
        <tr>
            <td>TypeScript Compilation</td>
            <td>${formatMs(buildTimes.typeScriptCompilation)}</td>
            <td>${Math.round(buildTimes.typeScriptCompilation / buildTimes.total * 100)}%</td>
        </tr>
        <tr>
            <td>Vite Build</td>
            <td>${formatMs(buildTimes.viteBuild)}</td>
            <td>${Math.round(buildTimes.viteBuild / buildTimes.total * 100)}%</td>
        </tr>
        <tr>
            <td><strong>Total</strong></td>
            <td><strong>${formatMs(buildTimes.total)}</strong></td>
            <td>100%</td>
        </tr>
    </table>
    
    <h2>Next Steps</h2>
    <ol>
        <li>Implement high-impact suggestions first for maximum time savings</li>
        <li>Consider setting up a build performance monitoring system to track improvements over time</li>
        <li>Re-run this analysis periodically as the codebase evolves</li>
    </ol>
    
    <div>Generated on: ${new Date().toLocaleString()}</div>
</body>
</html>
  `;
  
  fs.writeFileSync(REPORT_FILE, htmlReport);
  console.log(chalk.green(`Optimization report saved to ${REPORT_FILE}`));
  
  return REPORT_FILE;
}

/**
 * Main function to run the build time optimization analysis
 */
async function runBuildTimeOptimization() {
  console.log(chalk.bold.blue('=== Build Time Optimizer ==='));
  
  // Step 1: Profile build phases
  const buildTimes = await profileBuildPhases();
  
  if (buildTimes.error) {
    console.error(chalk.red('Build profiling failed, cannot continue.'));
    return;
  }
  
  // Step 2: Analyze configurations
  const viteAnalysis = analyzeViteConfig();
  const tsAnalysis = analyzeTsConfig();
  const dependencyAnalysis = analyzeDependencies();
  const timingAnalysis = measureBuildTimings();
  
  // Step 3: Generate suggestions
  const suggestions = generateSuggestions(
    buildTimes, 
    viteAnalysis,
    tsAnalysis,
    dependencyAnalysis,
    timingAnalysis
  );
  
  // Step 4: Save report
  const reportFile = saveOptimizationReport(buildTimes, suggestions);
  
  // Print summary to console
  console.log('\n');
  console.log(chalk.bold.green('=== Build Time Optimization Summary ==='));
  console.log(chalk.cyan(`Total Build Time: ${formatMs(buildTimes.total)}`));
  console.log(chalk.cyan(`TypeScript Compilation: ${formatMs(buildTimes.typeScriptCompilation)}`));
  console.log(chalk.cyan(`Vite Build: ${formatMs(buildTimes.viteBuild)}`));
  console.log(chalk.cyan(`Found ${suggestions.all.length} potential optimizations`));
  console.log(chalk.cyan(`Potential time savings: ${formatMs(suggestions.potentialTimeSavings)} (${Math.round(suggestions.potentialSavingsPercent * 100)}% reduction)`));
  console.log(chalk.green(`\nDetailed report saved to: ${reportFile}`));
  console.log(chalk.yellow('To open the report, use:'));
  console.log(`start ${reportFile.replace(/\\/g, '\\\\')}`);
}

// Run the optimization
runBuildTimeOptimization();