/**
 * Theme Console Monitor
 * 
 * This module provides functionality to monitor and report theme-related
 * console messages in the browser. It can be used during development and testing
 * to identify potential theme issues.
 */

// Theme-related keywords to watch for
const THEME_KEYWORDS = [
  'theme', 'color', 'typography', 'spacing', 'shadow', 'border', 
  'breakpoint', 'zIndex', 'transition', 'ThemeContext', 'useTheme',
  'ThemeProvider', 'DirectTheme', 'getColor', 'getTypography', 'getSpacing',
  'styled', 'css', 'inMemoryThemeService', 'ThemeSwitch'
];

// Regular expressions for theme-related issues
const THEME_ISSUE_PATTERNS = [
  /cannot\s+read\s+properties\s+of\s+undefined.*theme/i,
  /theme.*is\s+not\s+defined/i,
  /theme.*is\s+null/i,
  /property\s+['"].*['"]\s+does\s+not\s+exist\s+on\s+type/i,
  /invalid\s+value\s+for\s+property/i,
  /expected\s+.*\s+to\s+be\s+.*\s+received/i,
  /undefined\s+is\s+not\s+an\s+object/i
];

// Console message storage
interface ConsoleMessage {
  timestamp: Date;
  content: string;
  type: 'log' | 'warn' | 'error' | 'info';
  isThemeRelated: boolean;
  source?: string;
}

// Console monitor state
interface ConsoleMonitorState {
  isMonitoring: boolean;
  messages: ConsoleMessage[];
  originalConsole: {
    log: typeof console.log;
    warn: typeof console.warn;
    error: typeof console.error;
    info: typeof console.info;
  };
}

// Store for console messages
const state: ConsoleMonitorState = {
  isMonitoring: false,
  messages: [],
  originalConsole: {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info
  }
};

/**
 * Determine if a message is theme-related based on content
 */
function isThemeRelated(content: string): boolean {
  // Check for theme keywords
  const hasThemeKeyword = THEME_KEYWORDS.some(keyword => 
    content.toLowerCase().includes(keyword.toLowerCase())
  );
  
  // Check for known issue patterns
  const matchesPattern = THEME_ISSUE_PATTERNS.some(pattern => 
    pattern.test(content)
  );
  
  return hasThemeKeyword || matchesPattern;
}

/**
 * Format console arguments to string
 */
function formatArgs(args: any[]): string {
  return args.map(arg => {
    if (arg === null) return 'null';
    if (arg === undefined) return 'undefined';
    
    if (typeof arg === 'object') {
      try {
        return JSON.stringify(arg);
      } catch (e) {
        return String(arg);
      }
    }
    
    return String(arg);
  }).join(' ');
}

/**
 * Try to extract the source component or file from an error
 */
function extractSource(error?: Error): string | undefined {
  if (!error || !error.stack) return undefined;
  
  const stackLines = error.stack.split('\n');
  
  // Look for component name or file in stack trace
  for (const line of stackLines) {
    // Skip the Error constructor line
    if (line.includes('at new Error') || line.includes('at Error')) continue;
    
    // Look for component name (usually PascalCase)
    const componentMatch = line.match(/at\s+([A-Z][a-zA-Z0-9_]+)/);
    if (componentMatch) return componentMatch[1];
    
    // Look for file name
    const fileMatch = line.match(/([a-zA-Z0-9_-]+\.(jsx|tsx|js|ts))/);
    if (fileMatch) return fileMatch[1];
  }
  
  return undefined;
}

/**
 * Start monitoring console for theme-related messages
 */
export function startMonitoring(): void {
  if (state.isMonitoring) return;
  
  // Override console.log
  console.log = function(...args: any[]) {
    const content = formatArgs(args);
    const themeRelated = isThemeRelated(content);
    
    if (themeRelated) {
      state.messages.push({
        timestamp: new Date(),
        content,
        type: 'log',
        isThemeRelated: true
      });
    }
    
    state.originalConsole.log.apply(console, args);
  };
  
  // Override console.warn
  console.warn = function(...args: any[]) {
    const content = formatArgs(args);
    const themeRelated = isThemeRelated(content);
    
    if (themeRelated) {
      state.messages.push({
        timestamp: new Date(),
        content,
        type: 'warn',
        isThemeRelated: true
      });
    }
    
    state.originalConsole.warn.apply(console, args);
  };
  
  // Override console.error
  console.error = function(...args: any[]) {
    const content = formatArgs(args);
    const themeRelated = isThemeRelated(content);
    const error = args.find(arg => arg instanceof Error) as Error | undefined;
    
    if (themeRelated) {
      state.messages.push({
        timestamp: new Date(),
        content,
        type: 'error',
        isThemeRelated: true,
        source: extractSource(error)
      });
    }
    
    state.originalConsole.error.apply(console, args);
  };
  
  // Override console.info
  console.info = function(...args: any[]) {
    const content = formatArgs(args);
    const themeRelated = isThemeRelated(content);
    
    if (themeRelated) {
      state.messages.push({
        timestamp: new Date(),
        content,
        type: 'info',
        isThemeRelated: true
      });
    }
    
    state.originalConsole.info.apply(console, args);
  };
  
  // Listen for unhandled errors
  window.addEventListener('error', (event) => {
    const content = `Unhandled error: ${event.message}`;
    
    if (isThemeRelated(content) || isThemeRelated(String(event.error))) {
      state.messages.push({
        timestamp: new Date(),
        content,
        type: 'error',
        isThemeRelated: true,
        source: event.filename || extractSource(event.error)
      });
    }
  });
  
  // Listen for unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const content = `Unhandled promise rejection: ${event.reason}`;
    
    if (isThemeRelated(content) || isThemeRelated(String(event.reason))) {
      state.messages.push({
        timestamp: new Date(),
        content,
        type: 'error',
        isThemeRelated: true,
        source: extractSource(event.reason instanceof Error ? event.reason : undefined)
      });
    }
  });
  
  state.isMonitoring = true;
  
  // Log that monitoring has started
  state.originalConsole.log('[ThemeConsoleMonitor] Started monitoring for theme-related console messages');
}

/**
 * Stop monitoring console
 */
export function stopMonitoring(): void {
  if (!state.isMonitoring) return;
  
  // Restore original console methods
  console.log = state.originalConsole.log;
  console.warn = state.originalConsole.warn;
  console.error = state.originalConsole.error;
  console.info = state.originalConsole.info;
  
  state.isMonitoring = false;
  
  // Log that monitoring has stopped
  state.originalConsole.log('[ThemeConsoleMonitor] Stopped monitoring for theme-related console messages');
}

/**
 * Clear all collected messages
 */
export function clearMessages(): void {
  state.messages = [];
}

/**
 * Get all collected theme-related messages
 */
export function getMessages(): ConsoleMessage[] {
  return [...state.messages];
}

/**
 * Generate a summary report of theme-related console messages
 */
export function generateReport(): { 
  summary: { 
    total: number;
    byType: Record<string, number>;
    bySource: Record<string, number>;
  };
  messages: ConsoleMessage[];
} {
  const messagesByType = {
    error: 0,
    warn: 0,
    log: 0,
    info: 0
  };
  
  const messagesBySource: Record<string, number> = {};
  
  // Count messages by type and source
  state.messages.forEach(msg => {
    // Count by type
    messagesByType[msg.type] += 1;
    
    // Count by source
    const source = msg.source || 'unknown';
    messagesBySource[source] = (messagesBySource[source] || 0) + 1;
  });
  
  return {
    summary: {
      total: state.messages.length,
      byType: messagesByType,
      bySource: messagesBySource
    },
    messages: state.messages
  };
}

// Create a global access point for debugging
(window as any).__themeConsoleMonitor = {
  start: startMonitoring,
  stop: stopMonitoring,
  clear: clearMessages,
  getMessages,
  generateReport
};

// Auto-start in development mode if enabled via URL flag
if (typeof window !== 'undefined' && window.location.search.includes('theme-debug=true')) {
  startMonitoring();
  console.log('[ThemeConsoleMonitor] Automatically started due to theme-debug URL parameter');
}

export default {
  startMonitoring,
  stopMonitoring,
  clearMessages,
  getMessages,
  generateReport
}; 