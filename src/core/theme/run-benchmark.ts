import { ThemeBenchmark } from './theme-benchmark';
import { defaultTheme } from './default-theme';
import { darkTheme } from './dark-theme';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Run the theme switching benchmark and save the results to a file
 */
export async function runBenchmark() {
  console.log('Starting theme switching benchmark...');

  // Create a benchmark instance
  const benchmark = ThemeBenchmark.getInstance();

  // Define themes to benchmark
  const themes = [defaultTheme, darkTheme];

  // Run the benchmark
  const results = await benchmark.runBenchmark(themes, 20);

  // Log the results
  console.log('Benchmark results:');
  console.log(JSON.stringify(results, null, 2));

  // Save the results to a file
  const outputDir = path.resolve(process.cwd(), 'dist');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'theme-performance-report.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  // Generate a human-readable report
  const reportPath = path.join(outputDir, 'theme-performance-report.txt');
  const report = generateReport(results);
  fs.writeFileSync(reportPath, report);

  console.log(`Benchmark results saved to ${outputPath}`);
  console.log(`Human-readable report saved to ${reportPath}`);

  return results;
}

/**
 * Generate a human-readable report from the benchmark results
 */
function generateReport(results: any): string {
  const { coldStart, themeSwitch, memoryUsage, recommendations } = results;

  let report = 'Theme Switching Performance Report\n';
  report += '==================================\n\n';

  report += 'Cold Start Performance:\n';
  report += `  Average: ${coldStart.average.toFixed(2)}ms\n`;
  report += `  Median: ${coldStart.median.toFixed(2)}ms\n`;
  report += `  P95: ${coldStart.p95.toFixed(2)}ms\n\n`;

  report += 'Theme Switching Performance:\n';
  report += `  Average: ${themeSwitch.average.toFixed(2)}ms\n`;
  report += `  Median: ${themeSwitch.median.toFixed(2)}ms\n`;
  report += `  P95: ${themeSwitch.p95.toFixed(2)}ms\n\n`;

  report += 'Memory Usage Performance:\n';
  report += `  Average: ${memoryUsage.average.toFixed(2)}ms\n`;
  report += `  Median: ${memoryUsage.median.toFixed(2)}ms\n`;
  report += `  P95: ${memoryUsage.p95.toFixed(2)}ms\n\n`;

  report += 'Recommendations:\n';
  if (recommendations.length === 0) {
    report += '  No recommendations. Performance is good.\n';
  } else {
    recommendations.forEach((recommendation: string) => {
      report += `  - ${recommendation}\n`;
    });
  }

  return report;
}
