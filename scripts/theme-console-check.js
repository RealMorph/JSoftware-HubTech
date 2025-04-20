/**
 * Theme Console Check Script
 * 
 * This script monitors console output for theme-related issues and warnings.
 * It helps identify any theme property access errors, undefined theme values,
 * or other theme-related console messages during application execution.
 */

// Original console methods
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info
};

// Theme-related keywords to watch for
const themeKeywords = [
  'theme',
  'color',
  'typography',
  'spacing',
  'shadow',
  'border',
  'radius',
  'breakpoint',
  'z-index',
  'transition',
  'DirectTheme',
  'ThemeContext',
  'useDirectTheme',
  'getColor',
  'getTypography',
  'getSpacing'
];

// Regular expressions for detecting common theme-related issues
const themeIssuePatterns = [
  /cannot read property .* of undefined/i,
  /undefined is not an object/i,
  /null is not an object/i,
  /property .* does not exist/i,
  /cannot find .*theme/i,
  /missing .* property/i,
  /invalid theme value/i,
  /deprecat(ed|ion)/i,
  /not found in theme/i
];

// Statistics tracking
const stats = {
  errors: 0,
  warnings: 0,
  logs: 0,
  infos: 0,
  themeRelated: 0,
  messages: []
};

// Function to check if a message is theme-related
function isThemeRelated(args) {
  const message = args.map(arg => 
    typeof arg === 'string' ? arg : JSON.stringify(arg)
  ).join(' ');
  
  // Check for theme keywords
  const hasThemeKeyword = themeKeywords.some(keyword => 
    message.toLowerCase().includes(keyword.toLowerCase())
  );
  
  // Check for common theme issue patterns
  const matchesIssuePattern = themeIssuePatterns.some(pattern => 
    pattern.test(message)
  );
  
  return hasThemeKeyword || matchesIssuePattern;
}

// Function to log theme-related messages
function logThemeMessage(type, args) {
  if (isThemeRelated(args)) {
    stats.themeRelated++;
    stats.messages.push({
      type,
      timestamp: new Date().toISOString(),
      message: args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ')
    });
  }
  return args;
}

// Override console methods to monitor theme-related messages
console.log = function(...args) {
  stats.logs++;
  logThemeMessage('log', args);
  originalConsole.log.apply(console, args);
};

console.warn = function(...args) {
  stats.warnings++;
  logThemeMessage('warn', args);
  originalConsole.warn.apply(console, args);
};

console.error = function(...args) {
  stats.errors++;
  logThemeMessage('error', args);
  originalConsole.error.apply(console, args);
};

console.info = function(...args) {
  stats.infos++;
  logThemeMessage('info', args);
  originalConsole.info.apply(console, args);
};

// Function to generate a report of theme-related issues
function generateThemeReport() {
  originalConsole.log('=== Theme Console Check Report ===');
  originalConsole.log(`Total console messages: ${stats.logs + stats.warnings + stats.errors + stats.infos}`);
  originalConsole.log(`Theme-related messages: ${stats.themeRelated}`);
  originalConsole.log(`Breakdown: ${stats.errors} errors, ${stats.warnings} warnings`);
  
  if (stats.themeRelated > 0) {
    originalConsole.log('\nTheme-related issues:');
    stats.messages.forEach((msg, index) => {
      const color = msg.type === 'error' ? 'color: red' : 
                    msg.type === 'warn' ? 'color: orange' : 'color: gray';
      originalConsole.log(`%c[${msg.type.toUpperCase()}] ${msg.message}`, color);
    });
  } else {
    originalConsole.log('\nNo theme-related issues detected! 👍');
  }
}

// Auto-generate report when the page is about to unload
window.addEventListener('beforeunload', function() {
  generateThemeReport();
});

// Add a global function to generate the report on demand
window.generateThemeReport = generateThemeReport;

// Notify that the theme console check is active
originalConsole.log('Theme Console Check: Active - Monitoring for theme-related issues');
originalConsole.log('Use window.generateThemeReport() to view the current report');

// Export for potential module usage
if (typeof module !== 'undefined') {
  module.exports = {
    stats,
    generateThemeReport,
    isThemeRelated
  };
} 