import './setup-dom';
import { Theme } from './types';
import { CSSVariablesManager } from './css-variables';
import { ThemeCache } from './theme-cache';
import { ThemeManager } from './theme-manager';
import { defaultTheme } from './default-theme';
import * as fs from 'fs';

interface BenchmarkStats {
  min: number;
  max: number;
  average: number;
  median: number;
  p95: number;
}

interface BenchmarkResults {
  coldStart: BenchmarkStats;
  themeSwitch: BenchmarkStats;
  memoryUsage: BenchmarkStats;
  recommendations: string[];
}

/**
 * ThemeBenchmark provides utilities to measure and report on theme switching performance.
 */
export class ThemeBenchmark {
  private static instance: ThemeBenchmark;
  private cssVariablesManager: CSSVariablesManager;
  private themeCache: ThemeCache;
  private themeManager: ThemeManager;
  private iterations: number;
  private results: {
    coldStart: number[];
    themeSwitch: number[];
    memoryUsage: number[];
  };
  private isBenchmarking: boolean = false;
  private coldStartMeasurements: number[] = [];
  private switchMeasurements: number[] = [];
  private memoryMeasurements: number[] = [];

  private constructor(iterations: number) {
    if (ThemeBenchmark.instance) {
      throw new Error('ThemeBenchmark is a singleton. Use getInstance() instead.');
    }
    this.cssVariablesManager = CSSVariablesManager.getInstance();
    this.themeCache = ThemeCache.getInstance();
    this.themeManager = new ThemeManager(defaultTheme);
    this.iterations = iterations;
    this.results = {
      coldStart: [],
      themeSwitch: [],
      memoryUsage: [],
    };
  }

  public static getInstance(iterations: number = 20): ThemeBenchmark {
    if (!ThemeBenchmark.instance) {
      ThemeBenchmark.instance = new ThemeBenchmark(iterations);
    }
    return ThemeBenchmark.instance;
  }

  /**
   * Run a benchmark on theme switching performance
   */
  public async runBenchmark(
    themes: Theme[] = [defaultTheme],
    iterations: number = 10
  ): Promise<BenchmarkResults> {
    if (this.isBenchmarking) {
      throw new Error('Benchmark already in progress');
    }

    this.isBenchmarking = true;
    console.log('Starting theme performance benchmark...');

    // Clear the cache to ensure a fresh start
    this.themeCache.clearCache();

    // Measure cold start performance
    console.log('Measuring cold start performance...');
    const coldStartTime = await this.measureColdStart(themes[0]);
    this.coldStartMeasurements.push(coldStartTime);
    this.results.coldStart.push(coldStartTime);

    // Measure theme switching performance
    console.log('Measuring theme switching performance...');
    for (let i = 0; i < iterations; i++) {
      const switchResults = await this.measureThemeSwitching(themes, 1);
      const switchTime = switchResults[0];
      this.switchMeasurements.push(switchTime);
      this.results.themeSwitch.push(switchTime);
    }

    // Measure memory usage
    console.log('Measuring memory usage...');
    for (let i = 0; i < iterations; i++) {
      const memoryUsage = await this.measureMemoryUsage();
      this.memoryMeasurements.push(memoryUsage);
      this.results.memoryUsage.push(memoryUsage);
    }

    // Generate reports
    await this.generateReports();

    console.log('Benchmark completed!');
    this.isBenchmarking = false;

    return this.generateReport();
  }

  /**
   * Measure cold start performance (first theme load)
   */
  private async measureColdStart(theme: Theme): Promise<number> {
    const start = performance.now();
    this.cssVariablesManager.applyTheme(theme);
    const end = performance.now();
    return end - start;
  }

  /**
   * Measure theme switching performance
   */
  private async measureThemeSwitching(themes: Theme[], iterations: number): Promise<number[]> {
    const results: number[] = [];

    for (let i = 0; i < iterations; i++) {
      // Switch between themes
      for (let j = 0; j < themes.length; j++) {
        const start = performance.now();
        this.cssVariablesManager.applyTheme(themes[j]);
        const end = performance.now();
        results.push(end - start);
      }
    }

    return results;
  }

  /**
   * Measure CSS variable application performance
   */
  private async measureCSSVariableApplication(theme: Theme): Promise<number> {
    const start = performance.now();
    const css = this.themeCache.getThemeCSS(theme);
    const end = performance.now();
    return end - start;
  }

  /**
   * Generate a report from the benchmark results
   */
  private generateReport(): BenchmarkResults {
    const report: BenchmarkResults = {
      coldStart: this.calculateStats(this.results.coldStart),
      themeSwitch: this.calculateStats(this.results.themeSwitch),
      memoryUsage: this.calculateStats(this.results.memoryUsage),
      recommendations: [],
    };

    // Generate recommendations based on the results
    if (report.coldStart.average > 100) {
      report.recommendations.push(
        'Cold start time is high. Consider optimizing initial theme loading.'
      );
    }

    if (report.themeSwitch.average > 50) {
      report.recommendations.push(
        'Theme switching time is high. Consider using CSS variables more extensively.'
      );
    }

    if (report.memoryUsage.average > 10) {
      report.recommendations.push(
        'Memory usage is high. Consider reducing the number of CSS variables.'
      );
    }

    return report;
  }

  /**
   * Calculate statistics for a set of measurements
   */
  private calculateStats(measurements: number[]): BenchmarkStats {
    if (measurements.length === 0) {
      return {
        min: 0,
        max: 0,
        average: 0,
        median: 0,
        p95: 0,
      };
    }

    const sorted = [...measurements].sort((a, b) => Number(a - b));
    const sum = sorted.reduce((a, b) => a + Number(b), 0);
    const average = sum / sorted.length;
    const median =
      sorted.length % 2 === 0
        ? (Number(sorted[sorted.length / 2 - 1]) + Number(sorted[sorted.length / 2])) / 2
        : Number(sorted[Math.floor(sorted.length / 2)]);
    const p95Index = Math.floor(sorted.length * 0.95);

    return {
      min: Number(sorted[0]),
      max: Number(sorted[sorted.length - 1]),
      average,
      median,
      p95: Number(sorted[p95Index]),
    };
  }

  /**
   * Export the benchmark results as JSON
   */
  public exportResults(): string {
    return JSON.stringify(this.generateReport(), null, 2);
  }

  private async measureMemoryUsage(): Promise<number> {
    const startMemory = process.memoryUsage().heapUsed;

    // Create a large number of theme elements to stress memory
    const container = document.createElement('div');
    container.style.display = 'none';
    document.body.appendChild(container);

    // Create multiple elements with theme variables
    for (let i = 0; i < 1000; i++) {
      const element = document.createElement('div');
      element.style.cssText = `
        color: var(--color-primary);
        background: var(--color-background);
        border: 1px solid var(--color-border);
        padding: var(--spacing-md);
        margin: var(--spacing-sm);
      `;
      container.appendChild(element);
    }

    // Force a theme switch to measure memory impact
    this.cssVariablesManager.applyTheme(defaultTheme);
    this.cssVariablesManager.applyTheme(defaultTheme);

    const endMemory = process.memoryUsage().heapUsed;
    const memoryDiff = endMemory - startMemory;

    // Cleanup
    document.body.removeChild(container);

    return memoryDiff;
  }

  private async generateReports(): Promise<void> {
    const stats = {
      coldStart: this.calculateStats(this.coldStartMeasurements),
      themeSwitch: this.calculateStats(this.switchMeasurements),
      memoryUsage: this.calculateStats(this.memoryMeasurements),
    };

    // Generate human-readable report
    const textReport = this.generateTextReport(stats);
    await fs.promises.writeFile('dist/theme-performance-report.txt', textReport, 'utf8');

    // Generate JSON report
    const jsonReport = this.generateJSONReport(stats);
    await fs.promises.writeFile('dist/theme-performance-report.json', jsonReport, 'utf8');
  }

  private generateTextReport(stats: any): string {
    const recommendations = this.generateRecommendations(stats);

    return `
Theme Performance Benchmark Report
=================================

Cold Start Performance:
- Average: ${stats.coldStart.average.toFixed(2)}ms
- Median: ${stats.coldStart.median.toFixed(2)}ms
- P95: ${stats.coldStart.p95.toFixed(2)}ms

Theme Switching Performance:
- Average: ${stats.themeSwitch.average.toFixed(2)}ms
- Median: ${stats.themeSwitch.median.toFixed(2)}ms
- P95: ${stats.themeSwitch.p95.toFixed(2)}ms

Memory Usage Performance:
- Average: ${(stats.memoryUsage.average / 1024 / 1024).toFixed(2)}MB
- Median: ${(stats.memoryUsage.median / 1024 / 1024).toFixed(2)}MB
- P95: ${(stats.memoryUsage.p95 / 1024 / 1024).toFixed(2)}MB

Recommendations:
${recommendations.map(r => `- ${r}`).join('\n')}
`;
  }

  private generateJSONReport(stats: any): string {
    const report = {
      timestamp: new Date().toISOString(),
      stats: {
        coldStart: {
          ...stats.coldStart,
          average: Number(stats.coldStart.average.toFixed(2)),
          median: Number(stats.coldStart.median.toFixed(2)),
          p95: Number(stats.coldStart.p95.toFixed(2)),
        },
        themeSwitch: {
          ...stats.themeSwitch,
          average: Number(stats.themeSwitch.average.toFixed(2)),
          median: Number(stats.themeSwitch.median.toFixed(2)),
          p95: Number(stats.themeSwitch.p95.toFixed(2)),
        },
        memoryUsage: {
          ...stats.memoryUsage,
          average: Number((stats.memoryUsage.average / 1024 / 1024).toFixed(2)),
          median: Number((stats.memoryUsage.median / 1024 / 1024).toFixed(2)),
          p95: Number((stats.memoryUsage.p95 / 1024 / 1024).toFixed(2)),
        },
      },
      recommendations: this.generateRecommendations(stats),
    };

    return JSON.stringify(report, null, 2);
  }

  private generateRecommendations(stats: any): string[] {
    const recommendations: string[] = [];

    // Cold start recommendations
    if (stats.coldStart.average > 100) {
      recommendations.push('Cold start time is high. Consider lazy loading theme styles.');
    }

    // Theme switching recommendations
    if (stats.themeSwitch.average > 50) {
      recommendations.push('Theme switching is slow. Consider optimizing CSS variable updates.');
    }

    // Memory usage recommendations
    if (stats.memoryUsage.average > 50 * 1024 * 1024) {
      // 50MB
      recommendations.push(
        'Memory usage is high. Consider reducing the number of themed elements.'
      );
    }

    return recommendations.length > 0
      ? recommendations
      : ['Performance is good. No recommendations.'];
  }
}
