import { Theme, ThemeVisualConfig } from './types';

/**
 * ThemeCache provides a caching mechanism for themes to improve performance
 * during theme switching operations.
 */
export class ThemeCache {
  private static instance: ThemeCache;
  private themeCache: Map<string, ThemeVisualConfig> = new Map();
  private cssCache: Map<string, string> = new Map();
  private lastAccessed: Map<string, number> = new Map();
  private maxCacheSize: number = 10; // Maximum number of themes to cache

  private constructor() {}

  public static getInstance(): ThemeCache {
    if (!ThemeCache.instance) {
      ThemeCache.instance = new ThemeCache();
    }
    return ThemeCache.instance;
  }

  /**
   * Get a theme from the cache or compute it if not available
   */
  public getTheme(theme: Theme): ThemeVisualConfig {
    const cacheKey = this.getCacheKey(theme);

    // Update last accessed time
    this.lastAccessed.set(cacheKey, Date.now());

    // Return from cache if available
    if (this.themeCache.has(cacheKey)) {
      return this.themeCache.get(cacheKey)!;
    }

    // Compute and cache the theme
    const computedTheme = this.computeTheme(theme);
    this.cacheTheme(cacheKey, computedTheme);

    return computedTheme;
  }

  /**
   * Get CSS variables for a theme from the cache or compute them if not available
   */
  public getThemeCSS(theme: Theme): string {
    const cacheKey = this.getCacheKey(theme);

    // Update last accessed time
    this.lastAccessed.set(cacheKey, Date.now());

    // Return from cache if available
    if (this.cssCache.has(cacheKey)) {
      return this.cssCache.get(cacheKey)!;
    }

    // Compute and cache the CSS
    const css = this.computeThemeCSS(theme);
    this.cssCache.set(cacheKey, css);

    return css;
  }

  /**
   * Clear the cache for a specific theme
   */
  public invalidateTheme(themeId: string): void {
    const cacheKey = `theme-${themeId}`;
    this.themeCache.delete(cacheKey);
    this.cssCache.delete(cacheKey);
    this.lastAccessed.delete(cacheKey);
  }

  /**
   * Clear the entire cache
   */
  public clearCache(): void {
    this.themeCache.clear();
    this.cssCache.clear();
    this.lastAccessed.clear();
  }

  /**
   * Generate a cache key for a theme
   */
  private getCacheKey(theme: Theme): string {
    return `theme-${theme.id}-${theme.updatedAt.getTime()}`;
  }

  /**
   * Cache a theme and manage cache size
   */
  private cacheTheme(cacheKey: string, theme: ThemeVisualConfig): void {
    // Check if we need to evict items from the cache
    if (this.themeCache.size >= this.maxCacheSize) {
      this.evictLeastRecentlyUsed();
    }

    this.themeCache.set(cacheKey, theme);
  }

  /**
   * Evict the least recently used item from the cache
   */
  private evictLeastRecentlyUsed(): void {
    let oldestTime = Date.now();
    let oldestKey = '';

    // Find the least recently used item
    for (const [key, time] of this.lastAccessed.entries()) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }

    // Remove the least recently used item
    if (oldestKey) {
      this.themeCache.delete(oldestKey);
      this.cssCache.delete(oldestKey);
      this.lastAccessed.delete(oldestKey);
    }
  }

  /**
   * Compute a theme from a Theme object
   * This is a placeholder - in a real implementation, this would
   * transform the Theme into a ThemeConfig
   */
  private computeTheme(theme: Theme): ThemeVisualConfig {
    // In a real implementation, this would transform the Theme into a ThemeConfig
    // For now, we'll just return the theme as is
    return theme as unknown as ThemeVisualConfig;
  }

  /**
   * Compute CSS variables for a theme
   */
  private computeThemeCSS(theme: Theme): string {
    const { config } = theme;
    const { colors, typography, spacing, breakpoints, borderRadius, shadows, transitions } = config;

    // Generate CSS variables for the theme
    return `
      :root {
        /* Colors */
        --color-primary: ${colors.primary};
        --color-secondary: ${colors.secondary};
        --color-background-primary: ${colors.background.primary};
        --color-background-secondary: ${colors.background.secondary};
        --color-background-tertiary: ${colors.background.tertiary};
        --color-text-primary: ${colors.text.primary};
        --color-text-secondary: ${colors.text.secondary};
        --color-text-disabled: ${colors.text.disabled};
        --color-border-primary: ${colors.border.primary};
        --color-border-secondary: ${colors.border.secondary};
        --color-success: ${colors.success};
        --color-warning: ${colors.warning};
        --color-error: ${colors.error};
        
        /* Typography */
        --font-size-xs: ${typography.scale.xs};
        --font-size-sm: ${typography.scale.sm};
        --font-size-base: ${typography.scale.base};
        --font-size-lg: ${typography.scale.lg};
        --font-size-xl: ${typography.scale.xl};
        --font-size-2xl: ${typography.scale['2xl']};
        --font-size-3xl: ${typography.scale['3xl']};
        --font-size-4xl: ${typography.scale['4xl']};
        --font-weight-normal: ${typography.weights.normal};
        --font-weight-medium: ${typography.weights.medium};
        --font-weight-semibold: ${typography.weights.semibold};
        --font-weight-bold: ${typography.weights.bold};
        --line-height-none: ${typography.lineHeights.none};
        --line-height-tight: ${typography.lineHeights.tight};
        --line-height-snug: ${typography.lineHeights.snug};
        --line-height-normal: ${typography.lineHeights.normal};
        --line-height-relaxed: ${typography.lineHeights.relaxed};
        --line-height-loose: ${typography.lineHeights.loose};
        
        /* Spacing */
        --spacing-xs: ${spacing.xs};
        --spacing-sm: ${spacing.sm};
        --spacing-base: ${spacing.base};
        --spacing-lg: ${spacing.lg};
        --spacing-xl: ${spacing.xl};
        --spacing-2xl: ${spacing['2xl']};
        --spacing-3xl: ${spacing['3xl']};
        --spacing-4xl: ${spacing['4xl']};
        
        /* Breakpoints */
        --breakpoint-xs: ${breakpoints.xs};
        --breakpoint-sm: ${breakpoints.sm};
        --breakpoint-md: ${breakpoints.md};
        --breakpoint-lg: ${breakpoints.lg};
        --breakpoint-xl: ${breakpoints.xl};
        --breakpoint-2xl: ${breakpoints['2xl']};
        
        /* Border Radius */
        --border-radius-none: ${borderRadius.none};
        --border-radius-sm: ${borderRadius.sm};
        --border-radius-base: ${borderRadius.base};
        --border-radius-lg: ${borderRadius.lg};
        --border-radius-full: ${borderRadius.full};
        
        /* Shadows */
        --shadow-sm: ${shadows.sm};
        --shadow-base: ${shadows.base};
        --shadow-lg: ${shadows.lg};
        --shadow-xl: ${shadows.xl};
        
        /* Transitions */
        --transition-fast: ${transitions.fast};
        --transition-normal: ${transitions.normal};
        --transition-slow: ${transitions.slow};
      }
    `;
  }
}
