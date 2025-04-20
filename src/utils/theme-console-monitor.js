/**
 * Theme Console Monitor
 * 
 * This utility captures console output and filters it for theme-related messages.
 * It's used for theme system verification to identify potential theme issues.
 */

// Define a namespace to avoid global conflicts
window.ThemeConsoleMonitor = (function() {
  // Storage for captured messages
  const messages = {
    errors: [],
    warnings: [],
    logs: []
  };

  // Theme-related keywords to filter for
  const themeKeywords = [
    'theme',
    'color',
    'typography',
    'spacing',
    'border',
    'shadow',
    'transition',
    'breakpoint',
    'z-index',
    'zIndex',
    'style',
    'css'
  ];

  // Original console methods
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error
  };

  // Flag to track monitoring state
  let isMonitoring = false;

  /**
   * Checks if a message is theme-related
   * @param {string} message - Console message to check
   * @returns {boolean} True if theme-related
   */
  function isThemeRelated(message) {
    if (!message) return false;
    
    // Convert to string if not already
    const messageStr = typeof message === 'string' 
      ? message 
      : JSON.stringify(message);
    
    // Check if message contains any theme keywords
    return themeKeywords.some(keyword => 
      messageStr.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * Captures a console message
   * @param {string} type - Message type (log, warn, error)
   * @param {any[]} args - Console message arguments
   */
  function captureMessage(type, args) {
    // Create a message object
    const message = {
      timestamp: new Date().getTime(),
      message: Array.from(args).map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : arg
      ).join(' '),
      arguments: args
    };

    // Check if message is theme-related
    if (isThemeRelated(message.message)) {
      // Add to appropriate message collection
      messages[type].push(message);
    }

    // Call original console method
    originalConsole[type].apply(console, args);
  }

  /**
   * Starts console monitoring
   */
  function startMonitoring() {
    if (isMonitoring) return;
    
    // Override console methods
    console.log = function() {
      captureMessage('logs', arguments);
    };
    
    console.warn = function() {
      captureMessage('warnings', arguments);
    };
    
    console.error = function() {
      captureMessage('errors', arguments);
    };
    
    isMonitoring = true;
    console.log('[ThemeConsoleMonitor] Started monitoring console for theme-related messages.');
  }

  /**
   * Stops console monitoring
   */
  function stopMonitoring() {
    if (!isMonitoring) return;
    
    // Restore original console methods
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    
    isMonitoring = false;
    originalConsole.log('[ThemeConsoleMonitor] Stopped monitoring console.');
  }

  /**
   * Clears captured messages
   */
  function clearMessages() {
    messages.errors = [];
    messages.warnings = [];
    messages.logs = [];
    
    if (isMonitoring) {
      console.log('[ThemeConsoleMonitor] Cleared message history.');
    } else {
      originalConsole.log('[ThemeConsoleMonitor] Cleared message history.');
    }
  }

  /**
   * Gets a copy of all captured messages
   * @returns {Object} Captured messages
   */
  function getMessages() {
    return {
      errors: [...messages.errors],
      warnings: [...messages.warnings],
      logs: [...messages.logs]
    };
  }

  /**
   * Generates a report of captured messages
   * @returns {Object} Report of captured messages
   */
  function generateReport() {
    return {
      timestamp: new Date().getTime(),
      hasErrors: messages.errors.length > 0,
      hasWarnings: messages.warnings.length > 0,
      errorCount: messages.errors.length,
      warningCount: messages.warnings.length,
      logCount: messages.logs.length,
      errors: [...messages.errors],
      warnings: [...messages.warnings],
      logs: [...messages.logs]
    };
  }

  // Return public API
  return {
    startMonitoring,
    stopMonitoring,
    clearMessages,
    getMessages,
    generateReport,
    isMonitoring: () => isMonitoring
  };
})();

// Log that the module has loaded
console.log('[ThemeConsoleMonitor] Module loaded and ready for use.'); 