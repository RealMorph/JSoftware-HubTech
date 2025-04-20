/**
 * Theme Verification Utility
 * 
 * A comprehensive utility for validating theme configurations against expected structure
 * and checking for common theme-related issues.
 */

// Define the expected theme structure with required properties
const expectedThemeStructure = {
  colors: {
    required: [
      'primary', 'secondary', 'background', 'surface', 
      'text', 'textSecondary', 'border', 
      'error', 'warning', 'success', 'info'
    ]
  },
  typography: {
    required: ['fontFamily'],
    nested: {
      fontSize: {
        required: ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
      },
      fontWeight: {
        required: ['normal', 'medium', 'bold']
      },
      lineHeight: {
        required: ['none', 'tight', 'normal', 'relaxed']
      }
    }
  },
  spacing: {
    required: ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
  },
  borderRadius: {
    required: ['none', 'sm', 'md', 'lg', 'full']
  },
  shadows: {
    required: ['none', 'sm', 'md', 'lg', 'xl']
  },
  transitions: {
    required: ['fastest', 'faster', 'fast', 'normal', 'slow', 'slower', 'slowest']
  },
  zIndex: {
    required: [
      'hide', 'auto', 'base', 'docked', 'dropdown', 
      'sticky', 'banner', 'overlay', 'modal', 
      'popover', 'toast', 'tooltip'
    ]
  },
  breakpoints: {
    required: ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
  }
};

// Theme verification class
class ThemeVerifier {
  constructor(options = {}) {
    this.options = {
      logResults: true,
      throwOnError: false,
      testMode: false,
      ...options
    };
    
    this.results = {
      passed: false,
      timestamp: null,
      errors: [],
      warnings: [],
      success: [],
      missingProperties: [],
      invalidValues: [],
      themeData: null
    };
  }
  
  /**
   * Main verification method
   * @param {Object} theme - The theme object to verify
   * @returns {Object} - Verification results
   */
  verify(theme) {
    this.results = {
      passed: true,
      timestamp: new Date().toISOString(),
      errors: [],
      warnings: [],
      success: [],
      missingProperties: [],
      invalidValues: [],
      themeData: theme
    };
    
    try {
      // Structure validation
      this._verifyStructure(theme);
      
      // Value validation
      this._verifyValues(theme);
      
      // Check for common issues
      this._checkForCommonIssues(theme);
      
      // Log results if enabled
      if (this.options.logResults && !this.options.testMode) {
        this._logResults();
      }
      
      // Throw on error if enabled
      if (this.options.throwOnError && this.results.errors.length > 0) {
        throw new Error(`Theme verification failed with ${this.results.errors.length} errors`);
      }
      
      return this.results;
    } catch (error) {
      this.results.passed = false;
      this.results.errors.push({
        type: 'unexpected',
        message: `Unexpected error during theme verification: ${error.message}`
      });
      
      if (this.options.logResults && !this.options.testMode) {
        console.error('Theme verification failed with unexpected error:', error);
      }
      
      if (this.options.throwOnError) {
        throw error;
      }
      
      return this.results;
    }
  }
  
  /**
   * Verify the structure of the theme object
   * @param {Object} theme - The theme object
   * @private
   */
  _verifyStructure(theme) {
    if (!theme || typeof theme !== 'object') {
      this.results.passed = false;
      this.results.errors.push({
        type: 'structure',
        message: 'Theme is not a valid object'
      });
      return;
    }
    
    // Check top-level sections
    Object.keys(expectedThemeStructure).forEach(section => {
      if (!theme[section]) {
        this.results.passed = false;
        this.results.errors.push({
          type: 'structure',
          message: `Missing required theme section: ${section}`
        });
        this.results.missingProperties.push(section);
        return;
      }
      
      // Check required properties in each section
      if (Array.isArray(expectedThemeStructure[section].required)) {
        expectedThemeStructure[section].required.forEach(prop => {
          if (theme[section][prop] === undefined) {
            this.results.passed = false;
            this.results.errors.push({
              type: 'property',
              message: `Missing required property: ${section}.${prop}`
            });
            this.results.missingProperties.push(`${section}.${prop}`);
          }
        });
      }
      
      // Check nested structures
      if (expectedThemeStructure[section].nested) {
        Object.keys(expectedThemeStructure[section].nested).forEach(nestedSection => {
          if (!theme[section][nestedSection]) {
            this.results.passed = false;
            this.results.errors.push({
              type: 'structure',
              message: `Missing required nested section: ${section}.${nestedSection}`
            });
            this.results.missingProperties.push(`${section}.${nestedSection}`);
            return;
          }
          
          // Check required properties in nested section
          if (Array.isArray(expectedThemeStructure[section].nested[nestedSection].required)) {
            expectedThemeStructure[section].nested[nestedSection].required.forEach(prop => {
              if (theme[section][nestedSection][prop] === undefined) {
                this.results.passed = false;
                this.results.errors.push({
                  type: 'property',
                  message: `Missing required nested property: ${section}.${nestedSection}.${prop}`
                });
                this.results.missingProperties.push(`${section}.${nestedSection}.${prop}`);
              }
            });
          }
        });
      }
    });
    
    this.results.success.push({
      type: 'structure',
      message: 'Theme structure verification completed'
    });
  }
  
  /**
   * Verify the values in the theme object
   * @param {Object} theme - The theme object
   * @private
   */
  _verifyValues(theme) {
    // Check color values
    if (theme.colors) {
      Object.entries(theme.colors).forEach(([key, value]) => {
        if (!this._isValidColor(value)) {
          this.results.passed = false;
          this.results.errors.push({
            type: 'value',
            message: `Invalid color value for colors.${key}: ${value}`
          });
          this.results.invalidValues.push({
            path: `colors.${key}`,
            value,
            expected: 'Valid CSS color'
          });
        }
      });
    }
    
    // Check font sizes (must be valid CSS units)
    if (theme.typography && theme.typography.fontSize) {
      Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
        if (!this._isValidCSSUnit(value)) {
          this.results.passed = false;
          this.results.errors.push({
            type: 'value',
            message: `Invalid font size value for typography.fontSize.${key}: ${value}`
          });
          this.results.invalidValues.push({
            path: `typography.fontSize.${key}`,
            value,
            expected: 'Valid CSS unit'
          });
        }
      });
    }
    
    // Check spacing (must be valid CSS units)
    if (theme.spacing) {
      Object.entries(theme.spacing).forEach(([key, value]) => {
        if (!this._isValidCSSUnit(value)) {
          this.results.passed = false;
          this.results.errors.push({
            type: 'value',
            message: `Invalid spacing value for spacing.${key}: ${value}`
          });
          this.results.invalidValues.push({
            path: `spacing.${key}`,
            value,
            expected: 'Valid CSS unit'
          });
        }
      });
    }
    
    // Check breakpoints (must be valid CSS units)
    if (theme.breakpoints) {
      Object.entries(theme.breakpoints).forEach(([key, value]) => {
        if (!this._isValidCSSUnit(value)) {
          this.results.passed = false;
          this.results.errors.push({
            type: 'value',
            message: `Invalid breakpoint value for breakpoints.${key}: ${value}`
          });
          this.results.invalidValues.push({
            path: `breakpoints.${key}`,
            value,
            expected: 'Valid CSS unit'
          });
        }
      });
    }
    
    // Check transitions (must be valid time units)
    if (theme.transitions) {
      Object.entries(theme.transitions).forEach(([key, value]) => {
        if (!this._isValidTimeUnit(value)) {
          this.results.passed = false;
          this.results.errors.push({
            type: 'value',
            message: `Invalid transition value for transitions.${key}: ${value}`
          });
          this.results.invalidValues.push({
            path: `transitions.${key}`,
            value,
            expected: 'Valid CSS time unit'
          });
        }
      });
    }
    
    this.results.success.push({
      type: 'values',
      message: 'Theme value verification completed'
    });
  }
  
  /**
   * Check for common theme-related issues
   * @param {Object} theme - The theme object
   * @private
   */
  _checkForCommonIssues(theme) {
    // Check for color contrast issues
    if (theme.colors && theme.colors.text && theme.colors.background) {
      const textColor = theme.colors.text;
      const bgColor = theme.colors.background;
      
      if (!this._hasGoodContrast(textColor, bgColor)) {
        this.results.warnings.push({
          type: 'contrast',
          message: `Low contrast between text color (${textColor}) and background color (${bgColor})`
        });
      }
    }
    
    // Check for primary and secondary color contrast
    if (theme.colors && theme.colors.primary && theme.colors.secondary) {
      if (this._areColorsTooSimilar(theme.colors.primary, theme.colors.secondary)) {
        this.results.warnings.push({
          type: 'distinctiveness',
          message: `Primary color (${theme.colors.primary}) and secondary color (${theme.colors.secondary}) are too similar`
        });
      }
    }
    
    // Check for incomplete color scales
    if (theme.colors) {
      const hasError = !!theme.colors.error;
      const hasWarning = !!theme.colors.warning;
      const hasSuccess = !!theme.colors.success;
      const hasInfo = !!theme.colors.info;
      
      if (!hasError || !hasWarning || !hasSuccess || !hasInfo) {
        this.results.warnings.push({
          type: 'completeness',
          message: 'Incomplete feedback color set (error, warning, success, info)'
        });
      }
    }
    
    // Check for font size scale consistency
    if (theme.typography && theme.typography.fontSize) {
      const fontSizes = Object.values(theme.typography.fontSize)
        .map(size => this._extractNumericValue(size))
        .filter(size => size !== null);
      
      if (fontSizes.length > 0) {
        const isAscending = this._isAscendingOrder(fontSizes);
        if (!isAscending) {
          this.results.warnings.push({
            type: 'consistency',
            message: 'Font sizes are not in consistent ascending order'
          });
        }
      }
    }
    
    // Check for spacing scale consistency
    if (theme.spacing) {
      const spacingValues = Object.values(theme.spacing)
        .map(size => this._extractNumericValue(size))
        .filter(size => size !== null);
      
      if (spacingValues.length > 0) {
        const isAscending = this._isAscendingOrder(spacingValues);
        if (!isAscending) {
          this.results.warnings.push({
            type: 'consistency',
            message: 'Spacing values are not in consistent ascending order'
          });
        }
      }
    }
    
    this.results.success.push({
      type: 'issues',
      message: 'Common issues check completed'
    });
  }
  
  /**
   * Check if a value is a valid CSS color
   * @param {string} color - The color value to check
   * @returns {boolean} - True if valid
   * @private
   */
  _isValidColor(color) {
    if (typeof color !== 'string') return false;
    
    // Test for hex colors
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(color)) return true;
    
    // Test for rgb/rgba colors
    if (/^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/.test(color)) return true;
    if (/^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/.test(color)) return true;
    
    // Test for hsl/hsla colors
    if (/^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/.test(color)) return true;
    if (/^hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d.]+\s*\)$/.test(color)) return true;
    
    // Test for named colors (limited check)
    const namedColors = [
      'transparent', 'currentColor', 'inherit',
      'black', 'white', 'red', 'green', 'blue', 'yellow', 'purple',
      'gray', 'grey', 'silver', 'maroon', 'olive', 'lime', 'aqua',
      'teal', 'navy', 'fuchsia'
    ];
    
    return namedColors.includes(color.toLowerCase());
  }
  
  /**
   * Check if a value is a valid CSS unit
   * @param {string} value - The value to check
   * @returns {boolean} - True if valid
   * @private
   */
  _isValidCSSUnit(value) {
    if (typeof value !== 'string') return false;
    
    // Test for common CSS units
    return /^(\d*\.?\d+)(px|rem|em|%|vh|vw|vmin|vmax|ch|ex|cm|mm|in|pt|pc)$/.test(value) ||
           value === '0' ||
           value === 'auto' ||
           value === 'inherit' ||
           value === 'initial' ||
           value === 'unset';
  }
  
  /**
   * Check if a value is a valid CSS time unit
   * @param {string} value - The value to check
   * @returns {boolean} - True if valid
   * @private
   */
  _isValidTimeUnit(value) {
    if (typeof value !== 'string') return false;
    
    // Test for time units (s, ms)
    return /^(\d*\.?\d+)(s|ms)$/.test(value) ||
           value === '0' ||
           value === 'inherit' ||
           value === 'initial' ||
           value === 'unset';
  }
  
  /**
   * Check if two colors have good contrast
   * @param {string} color1 - First color
   * @param {string} color2 - Second color
   * @returns {boolean} - True if good contrast
   * @private
   */
  _hasGoodContrast(color1, color2) {
    // Simple implementation - this should ideally use WCAG contrast ratio calculation
    const rgb1 = this._hexToRgb(color1);
    const rgb2 = this._hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return true; // Skip check if colors can't be parsed
    
    const brightness1 = (rgb1.r * 299 + rgb1.g * 587 + rgb1.b * 114) / 1000;
    const brightness2 = (rgb2.r * 299 + rgb2.g * 587 + rgb2.b * 114) / 1000;
    
    return Math.abs(brightness1 - brightness2) > 125;
  }
  
  /**
   * Check if two colors are too similar
   * @param {string} color1 - First color
   * @param {string} color2 - Second color
   * @returns {boolean} - True if too similar
   * @private
   */
  _areColorsTooSimilar(color1, color2) {
    const rgb1 = this._hexToRgb(color1);
    const rgb2 = this._hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return false; // Skip check if colors can't be parsed
    
    // Calculate Euclidean distance in RGB space
    const distance = Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
    );
    
    return distance < 50; // Threshold for similarity
  }
  
  /**
   * Convert hex color to RGB object
   * @param {string} hex - Hex color string
   * @returns {Object|null} - RGB object or null if invalid
   * @private
   */
  _hexToRgb(hex) {
    // Only handling hex colors for simplicity
    if (typeof hex !== 'string' || !hex.startsWith('#')) return null;
    
    let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
  
  /**
   * Extract numeric value from CSS value
   * @param {string} value - CSS value
   * @returns {number|null} - Numeric value or null
   * @private
   */
  _extractNumericValue(value) {
    if (typeof value !== 'string') return null;
    
    const matches = value.match(/^(\d*\.?\d+)/);
    return matches ? parseFloat(matches[1]) : null;
  }
  
  /**
   * Check if array is in ascending order
   * @param {Array<number>} arr - Array of numbers
   * @returns {boolean} - True if ascending
   * @private
   */
  _isAscendingOrder(arr) {
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] <= arr[i - 1]) return false;
    }
    return true;
  }
  
  /**
   * Log verification results to console
   * @private
   */
  _logResults() {
    console.group('Theme Verification Results');
    
    console.log(`Overall result: ${this.results.passed ? 'PASSED ✅' : 'FAILED ❌'}`);
    console.log(`Timestamp: ${this.results.timestamp}`);
    
    if (this.results.errors.length > 0) {
      console.group(`Errors (${this.results.errors.length})`);
      this.results.errors.forEach(error => {
        console.error(`[${error.type}] ${error.message}`);
      });
      console.groupEnd();
    }
    
    if (this.results.warnings.length > 0) {
      console.group(`Warnings (${this.results.warnings.length})`);
      this.results.warnings.forEach(warning => {
        console.warn(`[${warning.type}] ${warning.message}`);
      });
      console.groupEnd();
    }
    
    if (this.results.success.length > 0) {
      console.group(`Success (${this.results.success.length})`);
      this.results.success.forEach(success => {
        console.log(`[${success.type}] ${success.message}`);
      });
      console.groupEnd();
    }
    
    console.groupEnd();
  }
  
  /**
   * Generate a human-readable verification report
   * @returns {string} - HTML formatted report
   */
  generateReport() {
    const statusEmoji = this.results.passed ? '✅' : '❌';
    const statusClass = this.results.passed ? 'pass' : 'fail';
    
    let report = `
      <div class="report-section">
        <div class="report-header">
          <h3>Theme Verification Report</h3>
          <span class="report-status ${statusClass}">
            ${this.results.passed ? 'PASSED' : 'FAILED'}
          </span>
        </div>
        <p>Verification completed at: ${new Date(this.results.timestamp).toLocaleString()}</p>
    `;
    
    if (this.results.errors.length > 0) {
      report += `
        <div class="report-section">
          <h4>Errors (${this.results.errors.length})</h4>
          <ul>
            ${this.results.errors.map(error => `
              <li>
                <strong>${error.type}:</strong> ${error.message}
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }
    
    if (this.results.warnings.length > 0) {
      report += `
        <div class="report-section">
          <h4>Warnings (${this.results.warnings.length})</h4>
          <ul>
            ${this.results.warnings.map(warning => `
              <li>
                <strong>${warning.type}:</strong> ${warning.message}
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }
    
    if (this.results.missingProperties.length > 0) {
      report += `
        <div class="report-section">
          <h4>Missing Properties (${this.results.missingProperties.length})</h4>
          <ul>
            ${this.results.missingProperties.map(prop => `
              <li>${prop}</li>
            `).join('')}
          </ul>
        </div>
      `;
    }
    
    if (this.results.invalidValues.length > 0) {
      report += `
        <div class="report-section">
          <h4>Invalid Values (${this.results.invalidValues.length})</h4>
          <ul>
            ${this.results.invalidValues.map(item => `
              <li>
                <strong>${item.path}:</strong> "${item.value}" 
                (Expected: ${item.expected})
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }
    
    report += `
      </div>
    `;
    
    return report;
  }
}

// Export the verifier
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ThemeVerifier,
    expectedThemeStructure
  };
}

// Set up global for browser environments
if (typeof window !== 'undefined') {
  window.ThemeVerifier = ThemeVerifier;
  window.expectedThemeStructure = expectedThemeStructure;
} 