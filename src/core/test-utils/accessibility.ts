import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { axe, JestAxeConfigureOptions, toHaveNoViolations } from 'jest-axe';
import React, { ReactElement } from 'react';
import { renderWithTheme } from '../theme/test-utils';

// Extend Jest's expect with accessibility matchers
expect.extend(toHaveNoViolations);

/**
 * Options for rendering a component with accessibility testing
 */
export interface RenderForA11yOptions extends RenderOptions {
  /**
   * Options to pass to axe
   */
  axeOptions?: JestAxeConfigureOptions;
}

/**
 * Renders a component and runs accessibility tests on it
 * @param ui The component to render
 * @param options Options for rendering and accessibility testing
 * @returns The render result and a function to run accessibility tests
 */
export function renderForA11y(
  ui: ReactElement,
  options: RenderForA11yOptions = {}
): RenderResult & { runA11yTests: () => Promise<void> } {
  const { axeOptions, ...renderOptions } = options;
  
  // Render the component
  const renderResult = render(ui, renderOptions);
  
  // Return the render result with a function to run accessibility tests
  return {
    ...renderResult,
    runA11yTests: async () => {
      const results = await axe(renderResult.container, axeOptions);
      expect(results).toHaveNoViolations();
    },
  };
}

/**
 * Renders a component with theme and runs accessibility tests on it
 * @param ui The component to render
 * @param options Options for rendering and accessibility testing
 * @returns The render result and a function to run accessibility tests
 */
export async function renderWithThemeForA11y(
  ui: ReactElement,
  options: RenderForA11yOptions & { theme?: any } = {}
) {
  const { axeOptions, theme, ...renderOptions } = options;
  
  // Render the component with theme
  const renderResult = await renderWithTheme(ui, { theme, ...renderOptions });
  
  // Return the render result with a function to run accessibility tests
  return {
    ...renderResult,
    runA11yTests: async () => {
      const results = await axe(renderResult.container, axeOptions);
      expect(results).toHaveNoViolations();
    },
  };
} 