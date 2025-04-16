# Custom Theme Creation Guide

## Overview

This guide will walk you through creating custom themes for the application. The theme system is built to be flexible and extensible, allowing you to create unique visual styles while maintaining consistency and accessibility.

## Prerequisites

- Basic understanding of CSS and design tokens
- Familiarity with the [Theme System Documentation](./theme-system.md)
- Access to a color palette tool (recommended: [Coolors](https://coolors.co) or [Adobe Color](https://color.adobe.com))

## Creating a Custom Theme

### 1. Define Your Color Palette

Start by defining your color palette using the following structure:

```typescript
const customTheme: ThemeConfig = {
  id: 'custom-theme-1',
  name: 'My Custom Theme',
  description: 'A custom theme with unique colors',
  colors: {
    primary: {
      '50': '#f0f9ff',
      '100': '#e0f2fe',
      '200': '#bae6fd',
      '300': '#7dd3fc',
      '400': '#38bdf8',
      '500': '#0ea5e9',
      '600': '#0284c7',
      '700': '#0369a1',
      '800': '#075985',
      '900': '#0c4a6e',
    },
    // Add other color categories (secondary, accent, etc.)
  },
  // ... other theme properties
};
```

### 2. Define Typography

Customize the typography scale:

```typescript
typography: {
  scale: {
    'h1': '2.5rem',
    'h2': '2rem',
    'h3': '1.75rem',
    'h4': '1.5rem',
    'h5': '1.25rem',
    'h6': '1rem',
    'body': '1rem',
    'small': '0.875rem',
  },
  weights: {
    'light': '300',
    'regular': '400',
    'medium': '500',
    'bold': '700',
  },
  lineHeights: {
    'tight': '1.25',
    'normal': '1.5',
    'relaxed': '1.75',
  },
  letterSpacing: {
    'tight': '-0.025em',
    'normal': '0',
    'wide': '0.025em',
  },
}
```

### 3. Define Spacing

Customize the spacing scale:

```typescript
spacing: {
  '0': '0',
  '1': '0.25rem',
  '2': '0.5rem',
  '3': '0.75rem',
  '4': '1rem',
  '5': '1.25rem',
  '6': '1.5rem',
  '8': '2rem',
  '10': '2.5rem',
  '12': '3rem',
  '16': '4rem',
  '20': '5rem',
  '24': '6rem',
  '32': '8rem',
}
```

### 4. Define Breakpoints

Customize the breakpoint system:

```typescript
breakpoints: {
  'xs': 0,
  'sm': 640,
  'md': 768,
  'lg': 1024,
  'xl': 1280,
  '2xl': 1536,
  '3xl': 1800,
  '4xl': 2000,
  containers: {
    'sm': '640px',
    'md': '768px',
    'lg': '1024px',
    'xl': '1280px',
    '2xl': '1536px',
  }
}
```

## Best Practices

1. **Color Contrast**
   - Ensure sufficient contrast between text and background colors
   - Use tools like [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
   - Maintain WCAG 2.1 AA compliance (minimum 4.5:1 for normal text)

2. **Typography**
   - Keep font sizes within readable ranges (12px - 24px for body text)
   - Maintain consistent scale ratios
   - Consider mobile readability

3. **Spacing**
   - Use consistent spacing increments
   - Consider component padding and margins
   - Account for different screen sizes

4. **Testing**
   - Test your theme across different devices and browsers
   - Verify color contrast ratios
   - Check typography readability
   - Test with different content lengths

## Example: Complete Theme

```typescript
const completeTheme: ThemeConfig = {
  id: 'complete-theme-1',
  name: 'Complete Custom Theme',
  description: 'A fully customized theme with all properties defined',
  colors: {
    primary: {
      '50': '#f0f9ff',
      // ... other shades
    },
    secondary: {
      '50': '#f5f3ff',
      // ... other shades
    },
    // ... other color categories
  },
  typography: {
    scale: {
      'h1': '2.5rem',
      // ... other sizes
    },
    weights: {
      'light': '300',
      // ... other weights
    },
    lineHeights: {
      'tight': '1.25',
      // ... other line heights
    },
    letterSpacing: {
      'tight': '-0.025em',
      // ... other letter spacing
    },
  },
  spacing: {
    '0': '0',
    // ... other spacing values
  },
  breakpoints: {
    'xs': 0,
    // ... other breakpoints
    containers: {
      'sm': '640px',
      // ... other container sizes
    },
  },
  isDefault: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

## Applying Your Theme

1. Save your theme configuration
2. Use the ThemeService to apply it:

```typescript
import { ThemeService } from '../core/theme/theme-persistence';

const themeService = new ThemeService(yourDatabaseImplementation);
await themeService.createTheme(completeTheme);
```

## Troubleshooting

Common issues and solutions:

1. **Colors not applying**
   - Check color format (must be valid CSS color values)
   - Verify color object structure
   - Ensure all required shades are defined

2. **Typography issues**
   - Verify font family availability
   - Check font size units (rem/px)
   - Ensure scale values are consistent

3. **Spacing problems**
   - Verify spacing units
   - Check for missing values
   - Ensure consistent increments

4. **Breakpoint issues**
   - Verify breakpoint values are numbers
   - Check container width units
   - Ensure breakpoints are in ascending order

## Resources

- [Theme System Documentation](./theme-system.md)
- [Color Palette Documentation](./color-palette.md)
- [Database Schema Documentation](./database-schema.md)
- [Implementation Notes](./implementation-notes.md) 