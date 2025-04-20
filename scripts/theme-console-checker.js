/**
 * Theme Console Checker
 * 
 * This script injects itself into the application and monitors 
 * the console for theme-related errors and warnings.
 * 
 * Usage:
 * 1. Include this script in your HTML before your application code:
 *    <script src="/scripts/theme-console-checker.js"></script>
 * 2. Start your application normally
 * 3. Check the console for theme-related issues
 */

(function() {
  // Keywords to identify theme-related issues
  const THEME_KEYWORDS = [
    'theme',
    'color',
    'typography',
    'spacing',
    'DirectTheme',
    'useDirectTheme',
    'DirectThemeProvider',
    'getColor',
    'getTypography',
    'getSpacing',
    'ThemeConfig',
    'ThemeStyles'
  ];

  // Original console methods
  const originalConsole = {
    error: console.error,
    warn: console.warn,
    log: console.log
  };

  // Issue counters
  let stats = {
    errors: 0,
    warnings: 0,
    logs: 0,
    themeRelatedErrors: 0,
    themeRelatedWarnings: 0
  };

  // Storage for theme-related issues
  const themeIssues = {
    errors: [],
    warnings: []
  };

  // Check if a message is theme-related
  function isThemeRelated(args) {
    const message = args.map(arg => {
      if (typeof arg === 'string') return arg;
      if (arg instanceof Error) return arg.message;
      if (typeof arg === 'object') return JSON.stringify(arg);
      return String(arg);
    }).join(' ');

    return THEME_KEYWORDS.some(keyword => message.toLowerCase().includes(keyword.toLowerCase()));
  }

  // Override console methods
  console.error = function(...args) {
    stats.errors++;
    if (isThemeRelated(args)) {
      stats.themeRelatedErrors++;
      themeIssues.errors.push({
        timestamp: new Date().toISOString(),
        message: args
      });
      originalConsole.error('%c[THEME ERROR]', 'color: #FF5252; font-weight: bold', ...args);
    } else {
      originalConsole.error(...args);
    }
  };

  console.warn = function(...args) {
    stats.warnings++;
    if (isThemeRelated(args)) {
      stats.themeRelatedWarnings++;
      themeIssues.warnings.push({
        timestamp: new Date().toISOString(),
        message: args
      });
      originalConsole.warn('%c[THEME WARNING]', 'color: #FFC107; font-weight: bold', ...args);
    } else {
      originalConsole.warn(...args);
    }
  };

  console.log = function(...args) {
    stats.logs++;
    originalConsole.log(...args);
  };

  // Add utility functions to the window object
  window.themeChecker = {
    // Get stats about theme-related issues
    getStats: function() {
      return {
        ...stats,
        themeIssuePercentage: Math.round(((stats.themeRelatedErrors + stats.themeRelatedWarnings) / 
                                         (stats.errors + stats.warnings || 1)) * 100)
      };
    },

    // Get all theme-related issues
    getIssues: function() {
      return themeIssues;
    },

    // Print a summary report
    printReport: function() {
      const summary = this.getStats();
      originalConsole.log('%c=== Theme Console Checker Report ===', 'color: #4CAF50; font-weight: bold');
      originalConsole.log(`Total Errors: ${summary.errors} (${summary.themeRelatedErrors} theme-related)`);
      originalConsole.log(`Total Warnings: ${summary.warnings} (${summary.themeRelatedWarnings} theme-related)`);
      originalConsole.log(`Theme Issue Percentage: ${summary.themeIssuePercentage}%`);
      
      if (themeIssues.errors.length > 0 || themeIssues.warnings.length > 0) {
        originalConsole.log('%c--- Theme-Related Issues ---', 'color: #2196F3; font-weight: bold');
        
        if (themeIssues.errors.length > 0) {
          originalConsole.log('%cErrors:', 'color: #FF5252');
          themeIssues.errors.forEach((issue, index) => {
            originalConsole.log(`${index + 1}. [${issue.timestamp}]`, ...issue.message);
          });
        }
        
        if (themeIssues.warnings.length > 0) {
          originalConsole.log('%cWarnings:', 'color: #FFC107');
          themeIssues.warnings.forEach((issue, index) => {
            originalConsole.log(`${index + 1}. [${issue.timestamp}]`, ...issue.message);
          });
        }
      } else {
        originalConsole.log('%c✓ No theme-related issues detected!', 'color: #4CAF50; font-weight: bold');
      }
      
      originalConsole.log('%c==================================', 'color: #4CAF50; font-weight: bold');
    },

    // Clear all tracked issues
    clearIssues: function() {
      themeIssues.errors = [];
      themeIssues.warnings = [];
      stats.themeRelatedErrors = 0;
      stats.themeRelatedWarnings = 0;
      originalConsole.log('%c✓ Theme issue tracking cleared', 'color: #4CAF50');
    }
  };

  // Auto-print instructions when the script loads
  originalConsole.log('%c[Theme Console Checker]', 'color: #4CAF50; font-weight: bold', 
    'Theme console monitoring active. Type window.themeChecker.printReport() to see results.');

  // Listen for page load to automatically check for issues after load
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (stats.themeRelatedErrors > 0 || stats.themeRelatedWarnings > 0) {
        originalConsole.log('%c[Theme Console Checker]', 'color: #FFC107; font-weight: bold', 
          `${stats.themeRelatedErrors + stats.themeRelatedWarnings} theme-related issues detected. Run window.themeChecker.printReport() for details.`);
      }
    }, 2000); // Wait 2 seconds after load to catch initialization issues
  });
})(); 