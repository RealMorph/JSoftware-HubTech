import { Theme } from './types';
import { ThemeCache } from './theme-cache';
import { ThemeConfig } from './consolidated-types';

/**
 * CSSVariablesManager handles the application of CSS variables for themes
 * in a performant way.
 */
export class CSSVariablesManager {
  private static instance: CSSVariablesManager;
  private styleElement: HTMLStyleElement | null = null;
  private themeCache: ThemeCache;
  private currentThemeId: string | null = null;
  private isTransitioning: boolean = false;
  private transitionTimeout: number | null = null;

  private constructor() {
    this.themeCache = ThemeCache.getInstance();
    this.initializeStyleElement();
  }

  public static getInstance(): CSSVariablesManager {
    if (!CSSVariablesManager.instance) {
      CSSVariablesManager.instance = new CSSVariablesManager();
    }
    return CSSVariablesManager.instance;
  }

  /**
   * Initialize the style element for CSS variables
   */
  private initializeStyleElement(): void {
    // Create a style element if it doesn't exist
    if (!this.styleElement) {
      this.styleElement = document.createElement('style');
      this.styleElement.setAttribute('id', 'theme-variables');
      document.head.appendChild(this.styleElement);
    }
  }

  /**
   * Apply a theme to the document
   */
  public applyTheme(theme: Theme): void {
    // If we're already on this theme, do nothing
    if (this.currentThemeId === theme.id) {
      return;
    }

    // Get the CSS for the theme from the cache
    const css = this.themeCache.getThemeCSS(theme);

    // Apply the CSS with a transition if needed
    this.applyCSSWithTransition(css);

    // Update the current theme ID
    this.currentThemeId = theme.id;
  }

  /**
   * Apply CSS with a smooth transition
   */
  private applyCSSWithTransition(css: string): void {
    if (!this.styleElement) {
      this.initializeStyleElement();
    }

    // If we're already transitioning, clear the timeout
    if (this.isTransitioning && this.transitionTimeout !== null) {
      window.clearTimeout(this.transitionTimeout);
    }

    // Add transition class to the document
    document.documentElement.classList.add('theme-transitioning');
    this.isTransitioning = true;

    // Apply the CSS
    if (this.styleElement) {
      this.styleElement.textContent = css;
    }

    // Remove the transition class after the transition is complete
    this.transitionTimeout = window.setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
      this.isTransitioning = false;
    }, 300); // Match this with your CSS transition duration
  }

  /**
   * Add transition styles to the document
   */
  public addTransitionStyles(): void {
    const transitionStyles = `
      .theme-transitioning * {
        transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
      }
    `;

    const styleElement = document.createElement('style');
    styleElement.setAttribute('id', 'theme-transition-styles');
    styleElement.textContent = transitionStyles;
    document.head.appendChild(styleElement);
  }

  /**
   * Remove transition styles from the document
   */
  public removeTransitionStyles(): void {
    const styleElement = document.getElementById('theme-transition-styles');
    if (styleElement) {
      styleElement.remove();
    }
  }

  /**
   * Clear the current theme
   */
  public clearTheme(): void {
    if (this.styleElement) {
      this.styleElement.textContent = '';
    }
    this.currentThemeId = null;
  }
}

/**
 * Generates CSS variables from a theme config and applies them to the document root
 * This makes theme values accessible via CSS variables throughout the application
 * 
 * @param theme The theme configuration
 */
export function generateCssVariables(theme: ThemeConfig): void {
  if (!theme) return;
  
  const root = document.documentElement;
  
  // Colors
  if (theme.colors) {
    // Primary colors
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    
    // Background colors
    if (typeof theme.colors.background === 'string') {
      root.style.setProperty('--color-background', theme.colors.background);
    } else if (typeof theme.colors.background === 'object') {
      const bg = theme.colors.background as any;
      if (bg.primary) root.style.setProperty('--color-background-primary', bg.primary);
      if (bg.secondary) root.style.setProperty('--color-background-secondary', bg.secondary);
      if (bg.tertiary) root.style.setProperty('--color-background-tertiary', bg.tertiary);
    }
    
    // Text colors
    if (typeof theme.colors.text === 'string') {
      root.style.setProperty('--color-text', theme.colors.text);
      root.style.setProperty('--color-text-primary', theme.colors.text);
    } else if (typeof theme.colors.text === 'object') {
      const text = theme.colors.text as any;
      if (text.primary) root.style.setProperty('--color-text-primary', text.primary);
      if (text.secondary) root.style.setProperty('--color-text-secondary', text.secondary);
      if (text.disabled) root.style.setProperty('--color-text-disabled', text.disabled);
    }
    
    // State colors
    if (theme.colors.success) root.style.setProperty('--color-success', theme.colors.success);
    if (theme.colors.warning) root.style.setProperty('--color-warning', theme.colors.warning);
    if (theme.colors.error) root.style.setProperty('--color-error', theme.colors.error);
    if (theme.colors.info) root.style.setProperty('--color-info', theme.colors.info);
  }
  
  // Typography
  if (theme.typography) {
    // Font families
    if (theme.typography.fontFamily) {
      const fontFamily = theme.typography.fontFamily;
      root.style.setProperty('--font-family-base', fontFamily.base);
      root.style.setProperty('--font-family-heading', fontFamily.heading);
      root.style.setProperty('--font-family-monospace', fontFamily.monospace);
    }
    
    // Font sizes
    if (theme.typography.fontSize) {
      Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
        root.style.setProperty(`--font-size-${key}`, value);
      });
    }
    
    // Font weights
    if (theme.typography.fontWeight) {
      Object.entries(theme.typography.fontWeight).forEach(([key, value]) => {
        root.style.setProperty(`--font-weight-${key}`, value);
      });
    }
    
    // Line heights
    if (theme.typography.lineHeight) {
      Object.entries(theme.typography.lineHeight).forEach(([key, value]) => {
        root.style.setProperty(`--line-height-${key}`, value);
      });
    }
    
    // Letter spacing
    if (theme.typography.letterSpacing) {
      Object.entries(theme.typography.letterSpacing).forEach(([key, value]) => {
        root.style.setProperty(`--letter-spacing-${key}`, value);
      });
    }
  }
  
  // Spacing
  if (theme.spacing) {
    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });
  }
  
  // Border radius
  if (theme.borderRadius) {
    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--border-radius-${key}`, value);
    });
  }
  
  // Shadows
  if (theme.shadows) {
    Object.entries(theme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });
  }
  
  // Transitions
  if (theme.transitions) {
    if (theme.transitions.duration) {
      Object.entries(theme.transitions.duration).forEach(([key, value]) => {
        root.style.setProperty(`--transition-duration-${key}`, value);
      });
    }
    
    if (theme.transitions.timing) {
      Object.entries(theme.transitions.timing).forEach(([key, value]) => {
        root.style.setProperty(`--transition-timing-${key}`, value);
      });
    }
  }
}

/**
 * Caches the current theme ID to avoid unnecessary re-generation of CSS variables
 */
export class CssVariablesCache {
  private currentThemeId: string | null = null;
  
  /**
   * Updates CSS variables if the theme has changed
   * 
   * @param theme The theme configuration
   * @returns boolean indicating whether variables were updated
   */
  updateIfNeeded(theme: ThemeConfig & { id?: string }): boolean {
    if (this.currentThemeId === theme.id) {
      return false; // Theme hasn't changed, no need to update
    }
    
    generateCssVariables(theme);
    this.currentThemeId = theme.id || null;
    return true;
  }
}
