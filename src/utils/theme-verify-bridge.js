/**
 * Theme Verification Bridge
 * 
 * Connects the theme verification utility with UI components and testing interfaces
 */

(function() {
  // Check if required modules are loaded
  if (!window.ThemeVerification) {
    console.error('ThemeVerification not loaded! Please include theme-verification.js before this script.');
    return;
  }

  if (!window.ThemeConsoleMonitor) {
    console.error('ThemeConsoleMonitor not loaded! Please include theme-console-monitor.js before this script.');
    return;
  }

  // Store references to UI elements
  let reportContainer;
  let runButton;
  let statusIndicator;
  let themeSelector;
  let tabButtons;
  let tabContents;
  
  // Start monitoring console on load
  window.ThemeConsoleMonitor.startMonitoring();
  
  // Initialize bridge when DOM is ready
  document.addEventListener('DOMContentLoaded', initBridge);
  
  /**
   * Initialize the verification bridge
   */
  function initBridge() {
    // Find UI elements
    reportContainer = document.getElementById('verification-report');
    runButton = document.getElementById('run-verification');
    statusIndicator = document.getElementById('status-indicator');
    themeSelector = document.getElementById('theme-selector');
    tabButtons = document.querySelectorAll('.tab-button');
    tabContents = document.querySelectorAll('.tab-content');
    
    // Set up event listeners
    if (runButton) {
      runButton.addEventListener('click', runVerification);
    }
    
    if (themeSelector) {
      themeSelector.addEventListener('change', handleThemeChange);
    }
    
    if (tabButtons.length > 0) {
      tabButtons.forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
      });
    }
    
    // Initialize UI
    updateStatus('Ready');
    
    // Auto-run verification if auto parameter is present
    if (window.location.search.includes('auto=true')) {
      setTimeout(runVerification, 1000);
    }
  }
  
  /**
   * Run verification with the current theme
   */
  function runVerification() {
    updateStatus('Running...');
    
    try {
      // Get current theme context
      const themeContext = getCurrentTheme();
      
      // Run verification
      const results = window.ThemeVerification.runVerification(themeContext);
      
      // Update UI with results
      updateStatus(results.pass ? 'PASS' : 'FAIL');
      displayReport(results);
      
    } catch (error) {
      console.error('Verification error:', error);
      updateStatus('ERROR');
      if (reportContainer) {
        reportContainer.innerHTML = `<div class="error-message">
          <h3>Verification Error</h3>
          <p>${error.message}</p>
          <pre>${error.stack}</pre>
        </div>`;
      }
    }
  }
  
  /**
   * Get current theme context from the application
   */
  function getCurrentTheme() {
    // Try to get theme from global context (if exposed)
    if (window.__DIRECT_THEME_CURRENT) {
      return window.__DIRECT_THEME_CURRENT;
    }
    
    // Try to get theme from context (if available)
    if (window.__DIRECT_THEME_CONTEXT && window.__DIRECT_THEME_CONTEXT._currentValue) {
      return window.__DIRECT_THEME_CONTEXT._currentValue;
    }
    
    // Try to get from localStorage (for theme testing page)
    const storedTheme = localStorage.getItem('current-theme');
    if (storedTheme) {
      try {
        return JSON.parse(storedTheme);
      } catch (e) {
        console.error('Failed to parse stored theme:', e);
      }
    }
    
    // If we have a theme selector, use its value
    if (themeSelector && window.themePresets) {
      const selectedTheme = themeSelector.value;
      if (window.themePresets[selectedTheme]) {
        return window.themePresets[selectedTheme];
      }
    }
    
    // Fall back to default theme if available
    if (window.defaultTheme) {
      return window.defaultTheme;
    }
    
    throw new Error('Could not get current theme context');
  }
  
  /**
   * Display verification report in the report container
   */
  function displayReport() {
    if (!reportContainer) return;
    
    // Generate HTML report
    const reportHtml = window.ThemeVerification.generateReport();
    reportContainer.innerHTML = reportHtml;
    
    // Switch to report tab
    switchTab('report');
  }
  
  /**
   * Update status indicator
   */
  function updateStatus(status) {
    if (!statusIndicator) return;
    
    statusIndicator.textContent = status;
    statusIndicator.className = ''; // Reset classes
    
    // Add appropriate class based on status
    switch (status.toLowerCase()) {
      case 'pass':
        statusIndicator.classList.add('status-pass');
        break;
      case 'fail':
        statusIndicator.classList.add('status-fail');
        break;
      case 'error':
        statusIndicator.classList.add('status-error');
        break;
      case 'running...':
        statusIndicator.classList.add('status-running');
        break;
      default:
        statusIndicator.classList.add('status-ready');
    }
  }
  
  /**
   * Handle theme change from selector
   */
  function handleThemeChange(event) {
    if (!window.themePresets) return;
    
    const selectedTheme = event.target.value;
    const themeData = window.themePresets[selectedTheme];
    
    if (!themeData) return;
    
    // Store selected theme
    localStorage.setItem('current-theme', JSON.stringify(themeData));
    
    // Apply theme to page for preview
    applyThemeToPage(themeData);
    
    // Update status
    updateStatus('Theme changed - Run verification');
  }
  
  /**
   * Apply theme to page for preview
   */
  function applyThemeToPage(theme) {
    if (!theme || !theme.colors) return;
    
    // Set CSS variables for preview
    const root = document.documentElement;
    
    // Colors
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // Typography
    if (theme.typography) {
      if (theme.typography.fontFamily) {
        root.style.setProperty('--font-family', theme.typography.fontFamily);
      }
      
      if (theme.typography.fontSize) {
        Object.entries(theme.typography.fontSize).forEach(([size, value]) => {
          root.style.setProperty(`--font-size-${size}`, value);
        });
      }
    }
    
    // Apply dark/light mode
    if (theme.colors.background.startsWith('#f') || 
        theme.colors.background.startsWith('#e') ||
        theme.colors.background.startsWith('#d')) {
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
      document.body.classList.add('dark-mode');
    }
  }
  
  /**
   * Switch between tabs
   */
  function switchTab(tabId) {
    // Hide all tabs
    tabContents.forEach(tab => {
      tab.style.display = 'none';
    });
    
    // Remove active class from all buttons
    tabButtons.forEach(button => {
      button.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(`tab-${tabId}`);
    if (selectedTab) {
      selectedTab.style.display = 'block';
    }
    
    // Set active class on button
    const selectedButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
    if (selectedButton) {
      selectedButton.classList.add('active');
    }
  }
  
  // Expose API
  window.ThemeVerifyBridge = {
    runVerification,
    getCurrentTheme,
    applyThemeToPage,
    switchTab
  };
  
  console.log('[ThemeVerifyBridge] Module loaded and ready for use.');
})(); 