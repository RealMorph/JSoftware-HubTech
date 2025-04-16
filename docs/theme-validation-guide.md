# Theme Validation Guide

This guide provides information on theme validation in our project, including how to fix common validation errors and best practices for theme development.

## Theme Validation Process

Our project uses automated theme validation to ensure all themes adhere to our `ThemeConfig` interface requirements. Validation occurs:

- During development via the `npm run validate:themes` command
- In CI/CD pipelines for pull requests and merges to main branches
- In build processes for production deployments

## Theme Requirements

All theme objects must conform to the `ThemeConfig` interface, which requires:

### Required Top-Level Properties

- `id`: Unique theme identifier (string)
- `colors`: Color palette configuration
- `typography`: Typography scale and settings
- `spacing`: Spacing scale
- `borderRadius`: Border radius scale
- `shadows`: Shadow definitions
- `transitions`: Transition definitions

### Colors Requirements

The `colors` object must include:

- Primary color scale (`primary`)
- Secondary color scale (`secondary`) 
- Accent color scale (`accent`)
- Error color scale (`error`)
- Warning color scale (`warning`)
- Success color scale (`success`)
- Info color scale (`info`)
- Background colors (`background`)
- Text colors (`text`)

Each color scale must define standard values: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900.

Example:
```typescript
colors: {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    // ... other scale values
    900: '#0c4a6e'
  },
  // ... other color scales
}
```

### Typography Requirements

The `typography` object must include:

- `fontFamily`: Font family definitions for headings and body text
- `fontSize`: Font size scale
- `fontWeight`: Font weight definitions
- `lineHeight`: Line height scale
- `letterSpacing`: Letter spacing options

Example:
```typescript
typography: {
  fontFamily: {
    heading: '"Roboto", "Helvetica Neue", sans-serif',
    body: '"Open Sans", "Helvetica", sans-serif'
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
    '7xl': '4.5rem',
    '8xl': '6rem',
    '9xl': '8rem'
  },
  fontWeight: {
    hairline: 100,
    thin: 200, 
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900
  },
  // ... other typography properties
}
```

### Spacing Requirements

The `spacing` object must define a consistent spacing scale with named values:

```typescript
spacing: {
  '0': '0',
  '0.5': '0.125rem',
  '1': '0.25rem',
  '1.5': '0.375rem',
  '2': '0.5rem',
  '2.5': '0.625rem',
  '3': '0.75rem',
  '3.5': '0.875rem',
  '4': '1rem',
  // ... other spacing values
}
```

### BorderRadius Requirements

The `borderRadius` object must define different border radius options:

```typescript
borderRadius: {
  none: '0',
  sm: '0.125rem',
  md: '0.25rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px'
}
```

### Shadows Requirements

The `shadows` object must include standard shadow definitions:

```typescript
shadows: {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
}
```

### Transitions Requirements

The `transitions` object must define various transition presets:

```typescript
transitions: {
  default: 'all 0.2s ease',
  slow: 'all 0.5s ease',
  fast: 'all 0.1s ease',
  easeIn: 'all 0.2s ease-in',
  easeOut: 'all 0.2s ease-out',
  easeInOut: 'all 0.2s ease-in-out',
  // ... other transition definitions
}
```

## Common Validation Errors and Solutions

### Missing Required Properties

**Error**: `Missing required property: [property name]`

**Solution**: Add the missing property to your theme object according to the requirements above.

### Invalid Color Scale

**Error**: `Color scale [scale name] is missing required value: [scale value]`

**Solution**: Ensure all color scales include all required values (50-900).

### Invalid Typography Configuration

**Error**: `Typography configuration missing required property: [property name]`

**Solution**: Add the missing typography property. Check the Typography Requirements section.

### Incorrect Property Type

**Error**: `Property [property name] has incorrect type`

**Solution**: Ensure the property has the correct type. For example, `fontSize` values should be strings with rem/em/px units.

## Best Practices for Theme Development

1. **Extend Base Themes**: Create new themes by extending existing base themes to ensure all required properties are included:

    ```typescript
    import { baseTheme } from '../base-theme';
    import { merge } from 'lodash';

    export const customTheme: ThemeConfig = merge({}, baseTheme, {
      // Override only what you need to change
      colors: {
        primary: {
          // Custom primary color scale
        }
      }
    });
    ```

2. **Use Our Theme Utilities**:

    ```typescript
    import { validateTheme, isValidTheme } from '../core/theme/theme-utils';

    // Check if a theme is valid
    if (!isValidTheme(myTheme)) {
      const errors = validateTheme(myTheme);
      console.error('Theme validation errors:', errors);
    }
    ```

3. **Type Safety**: Always add the `ThemeConfig` type to your theme objects:

    ```typescript
    import { ThemeConfig } from '../core/theme/consolidated-types';

    export const myTheme: ThemeConfig = {
      // Theme properties
    };
    ```

4. **Testing Themes**: Create test files for your themes to ensure they pass validation:

    ```typescript
    import { myTheme } from './my-theme';
    import { validateTheme } from '../core/theme/theme-utils';

    describe('My Theme', () => {
      it('should be valid', () => {
        const validationErrors = validateTheme(myTheme);
        expect(validationErrors).toHaveLength(0);
      });
    });
    ```

## Running Theme Validation Locally

To validate themes in your local development environment:

```bash
# Basic validation
npm run validate:themes

# With verbose output
npm run validate:themes -- --verbose

# In strict mode (additional checks)
npm run validate:themes -- --strict

# With custom file pattern
npm run validate:themes -- --pattern="src/themes/**/*.ts"

# Generate JSON report
npm run validate:themes -- --format=json > theme-report.json
```

## Theme Migration Guide

When migrating from legacy theme formats:

1. Ensure all required properties exist
2. Convert color values to the required scale format
3. Add any missing typography properties
4. Define all required spacing values
5. Add borderRadius, shadows, and transitions definitions

For detailed migration assistance, use the theme migration utilities:

```typescript
import { migrateFromLegacyTheme } from '../core/theme/theme-migration';

const migratedTheme = migrateFromLegacyTheme(legacyThemeObject);
```

## Additional Resources

- [Theme System Architecture](./theme/theme-architecture.md)
- [Component Theming Guide](./components/theming.md)
- [Theme Customization](./theme/customization.md)
- [Visual Regression Testing](./testing/visual-regression.md) 