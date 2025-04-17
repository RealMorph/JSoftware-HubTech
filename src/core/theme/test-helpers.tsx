import React, { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { ThemeConfig } from './consolidated-types';
import { mockTheme } from '../test-utils';
import merge from 'lodash/merge';
import set from 'lodash/set';
import get from 'lodash/get';

export interface RenderWithThemeOptions extends Omit<RenderOptions, 'wrapper'> {
  theme?: Partial<ThemeConfig>;
}

/**
 * Renders a component with ThemeProvider for testing
 *
 * @param ui - The React component to render
 * @param options - Optional render options including a partial theme to merge with mockTheme
 * @returns The render result with additional theme utilities
 */
export function renderWithTheme(
  ui: ReactElement,
  { theme, ...options }: RenderWithThemeOptions = {}
): RenderResult & { theme: ThemeConfig } {
  const mergedTheme = theme ? merge({}, mockTheme, theme) : mockTheme;

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ThemeProvider theme={mergedTheme}>{children}</ThemeProvider>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    theme: mergedTheme,
  };
}

/**
 * Create a mock theme with specific overrides for testing
 * @param overrides Properties to override in the base mock theme
 */
export function createMockTheme(overrides?: Partial<ThemeConfig>): ThemeConfig {
  return merge({}, mockTheme, overrides || {});
}

/**
 * Set a nested property in the theme for testing
 * @param path The dot notation path to set (e.g. 'colors.primary')
 * @param value The value to set
 */
export function createThemeWithValue(path: string, value: any): ThemeConfig {
  const theme = createMockTheme();
  return set(theme, path, value);
}

/**
 * Compare a rendered component's style with expected theme values
 * @param element The rendered element to test
 * @param cssProperty The CSS property to check
 * @param themeValue The expected value from the theme
 */
export function expectElementStyleToMatchTheme(
  element: HTMLElement,
  cssProperty: string,
  themeValue: string
) {
  const computedStyle = window.getComputedStyle(element);
  expect(computedStyle[cssProperty as any]).toBe(themeValue);
}

/**
 * Helper for testing theme-dependent styles
 * Tests that a component applies a theme value correctly to a specific CSS property
 */
export function testThemePropertyApplication(
  Component: React.ComponentType<any>,
  props: any,
  themePath: string,
  cssProperty: string,
  expectedValue: string,
  selector: string = '[data-testid]'
) {
  // Create theme with test value
  const testTheme = createThemeWithValue(themePath, expectedValue);

  // Render with test theme
  const { container } = renderWithTheme(<Component {...props} />, { theme: testTheme });

  // Find element (either by selector or first child)
  const element = selector ? container.querySelector(selector) : container.firstChild;

  // If element found, check its style
  if (element instanceof HTMLElement) {
    expectElementStyleToMatchTheme(element, cssProperty, expectedValue);
  } else {
    throw new Error(`Element not found with selector: ${selector}`);
  }
}

/**
 * Creates a series of theme variation tests for a component
 * Generates snapshots with different theme values applied
 */
export function createThemeVariationTests(
  Component: React.ComponentType<any>,
  props: any,
  themeVariations: Array<{ path: string; value: any }>
) {
  themeVariations.forEach(({ path, value }) => {
    const testTheme = createThemeWithValue(path, value);
    const { container } = renderWithTheme(<Component {...props} />, { theme: testTheme });
    expect(container).toMatchSnapshot(
      `${Component.displayName || 'Component'} with ${path}=${value}`
    );
  });
}

/**
 * Verify a theme has all required properties for a component
 * Checks that all required theme paths exist
 */
export function verifyThemeRequirements(
  theme: ThemeConfig,
  requiredPaths: string[]
): { valid: boolean; missingPaths: string[] } {
  const missingPaths = requiredPaths.filter(path => get(theme, path) === undefined);
  return {
    valid: missingPaths.length === 0,
    missingPaths,
  };
}

/**
 * Creates a test provider component with the specified theme
 *
 * @param theme - Optional partial theme to merge with mockTheme
 * @returns A ThemeProvider component with the specified theme
 */
export function createTestThemeProvider(theme?: Partial<ThemeConfig>) {
  const mergedTheme = theme ? merge({}, mockTheme, theme) : mockTheme;

  return ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider theme={mergedTheme}>{children}</ThemeProvider>
  );
}
