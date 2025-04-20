# Component Documentation Guide

This guide outlines our approach to documenting components in the codebase using Storybook. Following these guidelines ensures consistent, comprehensive documentation that helps developers understand, use, and contribute to our component library.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Documentation Structure](#documentation-structure)
3. [Component API Documentation](#component-api-documentation)
4. [Usage Examples](#usage-examples)
5. [Accessibility Documentation](#accessibility-documentation)
6. [Theme Integration](#theme-integration)
7. [Testing with Storybook](#testing-with-storybook)
8. [Documentation Checklist](#documentation-checklist)

## Getting Started

To document a component, you can either:

1. Use our documentation generator:
   ```
   npm run generate-docs
   ```

2. Manually create a `.stories.tsx` or `.stories.mdx` file in the `src/stories` directory.

## Documentation Structure

Each component should be documented with:

1. **Component Overview**: A description of what the component does and when to use it
2. **Props/API Documentation**: All props and their usage
3. **Example Variants**: Visual examples of all component variants
4. **Design Guidelines**: Best practices for using the component
5. **Accessibility**: Accessibility features and considerations 
6. **Theme Integration**: How the component works with the theme system

## Component API Documentation

Document all props using the `argTypes` configuration:

```tsx
argTypes: {
  size: {
    description: 'The size of the component',
    control: 'select',
    options: ['sm', 'md', 'lg'],
    table: {
      type: { summary: 'string' },
      defaultValue: { summary: 'md' },
    },
  },
  // Document other props...
}
```

## Usage Examples

Create examples for all component variants and states:

```tsx
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};
```

For complex examples, use the `render` function:

```tsx
export const ComplexExample: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <Component prop1="value1" />
      <Component prop1="value2" />
    </div>
  ),
};
```

## Accessibility Documentation

Include details about:

- ARIA attributes used
- Keyboard interaction support
- Screen reader compatibility
- Focus management
- Color contrast considerations

```tsx
/**
 * ## Accessibility
 * 
 * - Uses aria-pressed for toggle buttons
 * - Supports keyboard navigation with Tab and Enter
 * - Maintains 4.5:1 contrast ratio in all themes
 * - Visible focus states that meet WCAG 2.1 AA standards
 */
```

## Theme Integration

Document how the component uses theme tokens:

```tsx
/**
 * ## Theme Integration
 * 
 * The Button component uses these theme tokens:
 * 
 * - colors.primary: Button background
 * - colors.primaryDark: Button hover state
 * - typography.fontSize.md: Default text size
 * - spacing.4: Default padding
 * - borderRadius.md: Border radius
 */
```

Include examples of theme customization if applicable:

```tsx
/**
 * To customize the Button appearance in your theme:
 * 
 * ```tsx
 * const theme = {
 *   colors: {
 *     primary: '#0062CC', // Custom primary color
 *   }
 * }
 * ```
 */
```

## Testing with Storybook

Storybook stories should be designed to facilitate testing:

1. **Visual Testing**: Include all visual states
2. **Interaction Testing**: Show interactive elements
3. **Accessibility Testing**: Enable a11y testing for all stories

Add interaction tests with the Storybook test addon:

```tsx
export const WithInteraction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button'));
    // Add assertions...
  }
};
```

## Documentation Checklist

Before considering a component documentation complete, ensure you have:

- [ ] Component overview and purpose
- [ ] Documented all props with descriptions, types, and defaults
- [ ] Created examples for all variants and states
- [ ] Included design guidelines and best practices
- [ ] Documented accessibility features
- [ ] Explained theme integration
- [ ] Added interaction tests if applicable
- [ ] Verified with the Storybook a11y addon

## Running Storybook

To view the documentation:

```
npm run storybook
```

To build a static version:

```
npm run build-storybook
```

## Resources

- [Storybook Writing Docs](https://storybook.js.org/docs/react/writing-docs/introduction)
- [Component Driven Development](https://www.componentdriven.org/)
- [Storybook Accessibility Testing](https://storybook.js.org/addons/@storybook/addon-a11y) 