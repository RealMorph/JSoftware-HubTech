/**
 * Theme Regression Test Script
 * 
 * This script runs targeted tests for components that have been migrated to DirectTheme
 * to ensure there are no regressions. It also tracks key metrics for comparison.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Component categories to test
const COMPONENT_CATEGORIES = [
  'base',
  'data-display',
  'data-visualization',
  'feedback',
  'layout',
  'navigation',
];

// Results storage
const results = {
  testResults: {},
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  skippedTests: 0,
  regressions: [],
  performanceMetrics: {},
};

/**
 * Run tests for a specific component or category
 */
function runTestsForComponent(component) {
  console.log(`\nRunning tests for ${component}...`);
  
  try {
    // Use Jest with specific pattern to run tests for this component
    const testCommand = `npm test -- ${component}`;
    const startTime = Date.now();
    const output = execSync(testCommand, { encoding: 'utf8' });
    const duration = Date.now() - startTime;
    
    // Parse test results from output
    const testResults = parseTestResults(output);
    results.testResults[component] = {
      passed: testResults.passedTests,
      failed: testResults.failedTests,
      skipped: testResults.skippedTests,
      duration,
      output: output.substring(0, 500) + (output.length > 500 ? '...' : ''),
    };
    
    // Aggregate results
    results.totalTests += testResults.totalTests;
    results.passedTests += testResults.passedTests;
    results.failedTests += testResults.failedTests;
    results.skippedTests += testResults.skippedTests;
    
    // Check for regressions
    if (testResults.failedTests > 0) {
      results.regressions.push({
        component,
        failures: testResults.failedTests,
      });
    }
    
    console.log(`Tests completed for ${component}: ${testResults.passedTests} passed, ${testResults.failedTests} failed, ${testResults.skippedTests} skipped`);
    return true;
  } catch (error) {
    results.testResults[component] = {
      passed: 0,
      failed: 1,
      skipped: 0,
      duration: 0,
      error: error.message.substring(0, 500) + (error.message.length > 500 ? '...' : ''),
    };
    
    // Mark as regression
    results.regressions.push({
      component,
      failures: 1,
      error: error.message,
    });
    
    results.failedTests++;
    console.error(`Error running tests for ${component}:`, error.message);
    return false;
  }
}

/**
 * Parse test results from Jest output
 */
function parseTestResults(output) {
  // Simple regex to extract test counts
  const totalMatch = output.match(/Tests:\s+(\d+)\s+passed/i);
  const failedMatch = output.match(/(\d+)\s+failed/i);
  const skippedMatch = output.match(/(\d+)\s+skipped/i);
  
  return {
    totalTests: totalMatch ? parseInt(totalMatch[1], 10) : 0,
    passedTests: totalMatch ? parseInt(totalMatch[1], 10) : 0,
    failedTests: failedMatch ? parseInt(failedMatch[1], 10) : 0,
    skippedTests: skippedMatch ? parseInt(skippedMatch[1], 10) : 0,
  };
}

/**
 * Collect performance metrics for theme operations
 */
function collectPerformanceMetrics() {
  console.log('\nCollecting performance metrics...');
  
  try {
    // Run performance tests specific to theme operations
    const output = execSync('npm run test:perf', { encoding: 'utf8' });
    
    // Parse performance metrics
    // This would depend on the format of your performance test output
    const renderTimeMatch = output.match(/Average render time: (\d+\.?\d*)ms/i);
    const themeAccessMatch = output.match(/Theme access time: (\d+\.?\d*)ms/i);
    
    results.performanceMetrics = {
      averageRenderTime: renderTimeMatch ? parseFloat(renderTimeMatch[1]) : 0,
      themeAccessTime: themeAccessMatch ? parseFloat(themeAccessMatch[1]) : 0,
      rawOutput: output.substring(0, 300) + (output.length > 300 ? '...' : ''),
    };
    
    console.log('Performance metrics collected');
    return true;
  } catch (error) {
    console.error('Error collecting performance metrics:', error.message);
    results.performanceMetrics = {
      error: error.message,
    };
    return false;
  }
}

/**
 * Generate the regression test report
 */
function generateReport() {
  console.log('\n=== Theme Regression Test Report ===\n');
  console.log(`Total tests run: ${results.totalTests}`);
  console.log(`Passed: ${results.passedTests}`);
  console.log(`Failed: ${results.failedTests}`);
  console.log(`Skipped: ${results.skippedTests}`);
  
  if (results.regressions.length > 0) {
    console.log('\nRegressions Detected:');
    for (const regression of results.regressions) {
      console.log(`- ${regression.component}: ${regression.failures} failures`);
    }
  } else {
    console.log('\n✅ No regressions detected!');
  }
  
  // Performance metrics
  if (results.performanceMetrics.averageRenderTime) {
    console.log('\nPerformance Metrics:');
    console.log(`- Average render time: ${results.performanceMetrics.averageRenderTime}ms`);
    console.log(`- Theme access time: ${results.performanceMetrics.themeAccessTime}ms`);
  }
  
  // Save report to file
  const reportPath = 'theme-regression-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\nDetailed report saved to ${reportPath}`);
  
  if (results.failedTests === 0) {
    console.log('\n✅ All tests passed! Safe to proceed with theme utility removal.');
  } else {
    console.log(`\n⚠️ ${results.failedTests} tests failed. Fix regressions before proceeding.`);
  }
}

/**
 * Main function
 */
function main() {
  console.log('Starting theme regression tests...');
  
  // First run all tests to ensure overall coverage
  console.log('\nRunning full test suite...');
  try {
    execSync('npm test', { stdio: 'inherit' });
    console.log('✅ Full test suite passed!');
  } catch (error) {
    console.error('❌ Full test suite failed!');
    console.log('Running targeted component tests to identify specific failures...');
  }
  
  // Run tests for each component category
  for (const category of COMPONENT_CATEGORIES) {
    runTestsForComponent(category);
  }
  
  // Collect performance metrics
  collectPerformanceMetrics();
  
  // Generate report
  generateReport();
}

// Run the script
main(); 
 * Theme Regression Test Script
 * 
 * This script runs targeted tests for components that have been migrated to DirectTheme
 * to ensure there are no regressions. It also tracks key metrics for comparison.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Component categories to test
const COMPONENT_CATEGORIES = [
  'base',
  'data-display',
  'data-visualization',
  'feedback',
  'layout',
  'navigation',
];

// Results storage
const results = {
  testResults: {},
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  skippedTests: 0,
  regressions: [],
  performanceMetrics: {},
};

/**
 * Run tests for a specific component or category
 */
function runTestsForComponent(component) {
  console.log(`\nRunning tests for ${component}...`);
  
  try {
    // Use Jest with specific pattern to run tests for this component
    const testCommand = `npm test -- ${component}`;
    const startTime = Date.now();
    const output = execSync(testCommand, { encoding: 'utf8' });
    const duration = Date.now() - startTime;
    
    // Parse test results from output
    const testResults = parseTestResults(output);
    results.testResults[component] = {
      passed: testResults.passedTests,
      failed: testResults.failedTests,
      skipped: testResults.skippedTests,
      duration,
      output: output.substring(0, 500) + (output.length > 500 ? '...' : ''),
    };
    
    // Aggregate results
    results.totalTests += testResults.totalTests;
    results.passedTests += testResults.passedTests;
    results.failedTests += testResults.failedTests;
    results.skippedTests += testResults.skippedTests;
    
    // Check for regressions
    if (testResults.failedTests > 0) {
      results.regressions.push({
        component,
        failures: testResults.failedTests,
      });
    }
    
    console.log(`Tests completed for ${component}: ${testResults.passedTests} passed, ${testResults.failedTests} failed, ${testResults.skippedTests} skipped`);
    return true;
  } catch (error) {
    results.testResults[component] = {
      passed: 0,
      failed: 1,
      skipped: 0,
      duration: 0,
      error: error.message.substring(0, 500) + (error.message.length > 500 ? '...' : ''),
    };
    
    // Mark as regression
    results.regressions.push({
      component,
      failures: 1,
      error: error.message,
    });
    
    results.failedTests++;
    console.error(`Error running tests for ${component}:`, error.message);
    return false;
  }
}

/**
 * Parse test results from Jest output
 */
function parseTestResults(output) {
  // Simple regex to extract test counts
  const totalMatch = output.match(/Tests:\s+(\d+)\s+passed/i);
  const failedMatch = output.match(/(\d+)\s+failed/i);
  const skippedMatch = output.match(/(\d+)\s+skipped/i);
  
  return {
    totalTests: totalMatch ? parseInt(totalMatch[1], 10) : 0,
    passedTests: totalMatch ? parseInt(totalMatch[1], 10) : 0,
    failedTests: failedMatch ? parseInt(failedMatch[1], 10) : 0,
    skippedTests: skippedMatch ? parseInt(skippedMatch[1], 10) : 0,
  };
}

/**
 * Collect performance metrics for theme operations
 */
function collectPerformanceMetrics() {
  console.log('\nCollecting performance metrics...');
  
  try {
    // Run performance tests specific to theme operations
    const output = execSync('npm run test:perf', { encoding: 'utf8' });
    
    // Parse performance metrics
    // This would depend on the format of your performance test output
    const renderTimeMatch = output.match(/Average render time: (\d+\.?\d*)ms/i);
    const themeAccessMatch = output.match(/Theme access time: (\d+\.?\d*)ms/i);
    
    results.performanceMetrics = {
      averageRenderTime: renderTimeMatch ? parseFloat(renderTimeMatch[1]) : 0,
      themeAccessTime: themeAccessMatch ? parseFloat(themeAccessMatch[1]) : 0,
      rawOutput: output.substring(0, 300) + (output.length > 300 ? '...' : ''),
    };
    
    console.log('Performance metrics collected');
    return true;
  } catch (error) {
    console.error('Error collecting performance metrics:', error.message);
    results.performanceMetrics = {
      error: error.message,
    };
    return false;
  }
}

/**
 * Generate the regression test report
 */
function generateReport() {
  console.log('\n=== Theme Regression Test Report ===\n');
  console.log(`Total tests run: ${results.totalTests}`);
  console.log(`Passed: ${results.passedTests}`);
  console.log(`Failed: ${results.failedTests}`);
  console.log(`Skipped: ${results.skippedTests}`);
  
  if (results.regressions.length > 0) {
    console.log('\nRegressions Detected:');
    for (const regression of results.regressions) {
      console.log(`- ${regression.component}: ${regression.failures} failures`);
    }
  } else {
    console.log('\n✅ No regressions detected!');
  }
  
  // Performance metrics
  if (results.performanceMetrics.averageRenderTime) {
    console.log('\nPerformance Metrics:');
    console.log(`- Average render time: ${results.performanceMetrics.averageRenderTime}ms`);
    console.log(`- Theme access time: ${results.performanceMetrics.themeAccessTime}ms`);
  }
  
  // Save report to file
  const reportPath = 'theme-regression-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\nDetailed report saved to ${reportPath}`);
  
  if (results.failedTests === 0) {
    console.log('\n✅ All tests passed! Safe to proceed with theme utility removal.');
  } else {
    console.log(`\n⚠️ ${results.failedTests} tests failed. Fix regressions before proceeding.`);
  }
}

/**
 * Main function
 */
function main() {
  console.log('Starting theme regression tests...');
  
  // First run all tests to ensure overall coverage
  console.log('\nRunning full test suite...');
  try {
    execSync('npm test', { stdio: 'inherit' });
    console.log('✅ Full test suite passed!');
  } catch (error) {
    console.error('❌ Full test suite failed!');
    console.log('Running targeted component tests to identify specific failures...');
  }
  
  // Run tests for each component category
  for (const category of COMPONENT_CATEGORIES) {
    runTestsForComponent(category);
  }
  
  // Collect performance metrics
  collectPerformanceMetrics();
  
  // Generate report
  generateReport();
}

// Run the script
main(); 