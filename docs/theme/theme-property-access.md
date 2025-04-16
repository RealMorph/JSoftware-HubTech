# Theme Property Access Guide

This guide explains the correct way to access theme properties in our component library. Following these guidelines ensures consistent theme usage and helps avoid common errors.

## Theme Structure

Our theme follows a structured organization with top-level categories for different types of design tokens:

```
theme
├── colors
│   ├── primary
│   ├── secondary
│   ├── background
│   │   ├── primary
│   │   ├── secondary
│   │   └── ...
│   └── ...
├── typography
│   ├── family
│   │   ├── primary
│   │   └── ...
│   ├── scale
│   │   ├── xs
│   │   ├── sm
│   │   └── ...
│   └── ...
├── spacing
│   ├── 1
│   ├── 2
│   └── ...
├── borderRadius  // NOTE: This is at root level, not under colors
│   ├── sm
│   ├── md
│   └── ...
└── shadows       // NOTE: This is at root level, not under colors
    ├── sm
    ├── md
    └── ...
```

## Correct Property Access Patterns

### Using the `getThemeValue` Helper Function

The recommended way to access theme properties is using the `getThemeValue` function from `src/core/theme/styled.js`:

```js
import { getThemeValue } from '../../core/theme/styled';

// In your component
const borderRadius = getThemeValue(theme, 'borderRadius.md');
const shadow = getThemeValue(theme, 'shadows.sm');
const primaryColor = getThemeValue(theme, 'colors.primary');
```

This helper includes fallback handling and path normalization to prevent errors.

### Common Mistakes to Avoid

❌ **Incorrect**:
```js
const borderRadius = theme.colors.borderRadius.md;
const shadow = theme.colors.shadows.sm;
```

✅ **Correct**:
```js
const borderRadius = theme.borderRadius.md;
const shadow = theme.shadows.sm;
```

❌ **Incorrect**:
```js
const fontFamily = theme.typography.fontFamily.primary;
const fontSize = theme.typography.fontSize.sm;
```

✅ **Correct**:
```js
const fontFamily = theme.typography.family.primary;
const fontSize = theme.typography.scale.sm;
```

## Styled Components Usage

When using Emotion styled components, access theme values like this:

```jsx
const StyledButton = styled.button`
  border-radius: ${props => getThemeValue(props.theme, 'borderRadius.md')};
  box-shadow: ${props => getThemeValue(props.theme, 'shadows.sm')};
  padding: ${props => getThemeValue(props.theme, 'spacing.4')};
  font-family: ${props => getThemeValue(props.theme, 'typography.family.primary')};
  font-size: ${props => getThemeValue(props.theme, 'typography.scale.base')};
`;
```

## Using Default Values

Always provide sensible default values as fallbacks when accessing theme properties:

```js
const getBackgroundColor = () => {
  return getThemeValue(theme, 'colors.background.primary') || '#FFFFFF';
};
```

## Handling Nested Theme Values

For deeply nested values, use consistent dot notation:

```js
const getPrimaryBackgroundColor = () => {
  return getThemeValue(theme, 'colors.background.primary');
};
```

## Running the Theme Path Audit Tool

We've created a tool to help identify incorrect theme property access patterns in your code:

```bash
node scripts/theme-path-audit.js
```

This will scan the codebase and generate a report of components that need to be updated to use the correct theme property paths.

## Benefits of Correct Theme Access

Following these patterns provides several benefits:

1. **Consistency**: All components access theme values in the same way
2. **Resilience**: Components will gracefully handle missing theme values
3. **Maintainability**: The theme structure can evolve without breaking components
4. **Performance**: Fewer warnings and errors in the console

By following these guidelines, you'll help ensure a consistent, maintainable theming system throughout the application. 