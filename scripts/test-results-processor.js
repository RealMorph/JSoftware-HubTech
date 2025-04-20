/**
 * Custom test results processor for Jest
 * Formats test results for dashboard integration
 */

const fs = require('fs');
const path = require('path');

module.exports = function processor(results) {
  // Ensure the results directory exists
  const resultsDir = path.join(__dirname, '../test-results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  // Format results for dashboard
  const dashboardResults = {
    timestamp: new Date().toISOString(),
    summary: {
      numPassedTests: results.numPassedTests,
      numFailedTests: results.numFailedTests,
      numPendingTests: results.numPendingTests,
      numTotalTests: results.numTotalTests,
      success: results.success,
      startTime: results.startTime,
      endTime: new Date().getTime(),
      executionTime: new Date().getTime() - results.startTime,
    },
    testResults: results.testResults.map(testResult => ({
      testFilePath: path.relative(process.cwd(), testResult.testFilePath),
      testResults: testResult.testResults.map(test => ({
        ancestorTitles: test.ancestorTitles,
        fullName: test.fullName,
        status: test.status,
        title: test.title,
        duration: test.duration,
      })),
      numFailingTests: testResult.numFailingTests,
      numPassingTests: testResult.numPassingTests,
      numPendingTests: testResult.numPendingTests,
    })),
  };

  // Write formatted results to file
  fs.writeFileSync(
    path.join(resultsDir, `test-results-${new Date().toISOString().replace(/:/g, '-')}.json`),
    JSON.stringify(dashboardResults, null, 2)
  );

  // Write latest results for dashboard to read
  fs.writeFileSync(
    path.join(resultsDir, 'latest-results.json'),
    JSON.stringify(dashboardResults, null, 2)
  );

  // Return original results to not interfere with Jest's normal operation
  return results;
}; 