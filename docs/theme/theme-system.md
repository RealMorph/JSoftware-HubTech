# Theme System Documentation

## Overview

The theme system provides a comprehensive set of design tokens and utilities for creating consistent, responsive, and customizable user interfaces. It consists of four core components:

1. **Color Palette System** - A flexible color system with semantic naming
2. **Typography Scale** - A responsive typography system with consistent scaling
3. **Spacing System** - A modular spacing system for layout and components
4. **Breakpoint System** - A responsive breakpoint system for media queries

## Color Palette System

The color palette system provides a comprehensive set of colors with semantic naming conventions. It includes:

- Base colors with multiple shades (50-900)
- Semantic color tokens (primary, secondary, accent, etc.)
- State colors (success, warning, error, info)
- Utility functions for color manipulation and CSS variable generation

### Usage

```typescript
import { getColor, generateColorVariables } from '../core/theme/colors';

// Get a specific color
const primaryColor = getColor('primary.500');

// Generate CSS variables
const cssVariables = generateColorVariables();
```

## Typography Scale

The typography scale provides a consistent and responsive typography system with:

- A modular scale based on a 1.25 ratio
- Responsive font sizes that adjust based on viewport size
- Font weight definitions
- Line height calculations
- Letter spacing values
- Utility functions for typography manipulation

### Usage

```typescript
import { getFontSize, getFontWeight, generateTypographyVariables } from '../core/theme/typography';

// Get a specific font size
const headingSize = getFontSize('h1');

// Get a font weight
const boldWeight = getFontWeight('bold');

// Generate CSS variables
const cssVariables = generateTypographyVariables();
```

## Spacing System

The spacing system provides a modular approach to spacing with:

- A base unit of 4px
- A comprehensive scale from 0 to 96 (384px)
- Semantic spacing definitions for various use cases
- Utility functions for spacing manipulation

### Usage

```typescript
import { getSpacing, generateSpacingVariables } from '../core/theme/spacing';

// Get a specific spacing value
const padding = getSpacing('md');

// Generate CSS variables
const cssVariables = generateSpacingVariables();
```

## Breakpoint System

The breakpoint system provides a comprehensive set of breakpoints for responsive design:

- 8 standard breakpoints from xs (0px) to 4xl (1800px)
- Media query utilities for min-width, max-width, and between breakpoints
- Container max widths for each breakpoint
- Utility functions for breakpoint manipulation

### Usage

```typescript
import { 
  getBreakpoint, 
  getMediaQuery, 
  getContainerMaxWidth,
  generateBreakpointVariables 
} from '../core/theme/breakpoints';

// Get a specific breakpoint value
const mdBreakpoint = getBreakpoint('md');

// Get a media query
const mdMediaQuery = getMediaQuery('md');

// Get a container max width
const mdContainerWidth = getContainerMaxWidth('md');

// Generate CSS variables
const cssVariables = generateBreakpointVariables();
```

## Integration with Database

The theme system uses a database-agnostic approach through interfaces, allowing for flexible implementation with any database technology.

### Database Interface

```typescript
interface ThemeDatabase {
  findThemeById(id: string): Promise<ThemeConfig | null>;
  findAllThemes(): Promise<ThemeConfig[]>;
  findDefaultTheme(): Promise<ThemeConfig | null>;
  createTheme(theme: ThemeConfig): Promise<ThemeConfig>;
  updateTheme(id: string, theme: Partial<ThemeConfig>): Promise<ThemeConfig | null>;
  deleteTheme(id: string): Promise<boolean>;
  setDefaultTheme(id: string): Promise<boolean>;
}

interface ThemeConfig {
  id: string;
  name: string;
  description?: string;
  colors: {
    [key: string]: {
      [shade: string]: string;
    };
  };
  typography: {
    scale: {
      [key: string]: string;
    };
    weights: {
      [key: string]: string;
    };
    lineHeights: {
      [key: string]: string;
    };
    letterSpacing: {
      [key: string]: string;
    };
  };
  spacing: {
    [key: string]: string;
  };
  breakpoints: {
    [key: string]: number;
    containers: {
      [key: string]: string;
    };
  };
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Using the Theme Service

```typescript
import { ThemeService } from '../core/theme/theme-persistence';

// Create a service instance with your database implementation
const themeService = new ThemeService(yourDatabaseImplementation);

// Load and apply a theme
async function loadTheme(themeId: string) {
  const theme = await themeService.getThemeById(themeId);
  if (theme) {
    // Apply the theme configuration
    applyTheme(theme);
  }
}
```

## Testing

The theme system includes comprehensive test suites for each component. Tests are located in `src/core/theme/__tests__/`.

### Running Theme Tests

To run only theme-related tests:

```bash
# Run all theme tests
npm test src/core/theme/__tests__

# Run specific theme component tests
npm test src/core/theme/__tests__/colorPalette.test.ts
npm test src/core/theme/__tests__/typography.test.ts
npm test src/core/theme/__tests__/spacing.test.ts
npm test src/core/theme/__tests__/breakpoints.test.ts
npm test src/core/theme/__tests__/theme-persistence.test.ts
```

### Test Coverage

The test suite covers:

1. **Color Palette Tests** (`colorPalette.test.ts`)
   - Color generation for light/dark modes
   - Color retrieval by name and shade
   - CSS variable generation

2. **Typography Tests** (`typography.test.ts`)
   - Typography scale validation
   - Font weight definitions
   - Line height calculations
   - Letter spacing values
   - CSS variable generation

3. **Spacing Tests** (`spacing.test.ts`)
   - Base unit validation
   - Scale completeness
   - Semantic spacing values
   - CSS variable generation

4. **Breakpoint Tests** (`breakpoints.test.ts`)
   - Breakpoint value validation
   - Media query generation
   - Container width calculations
   - CSS variable generation

5. **Theme Persistence Tests** (`theme-persistence.test.ts`)
   - Theme creation and retrieval
   - Theme updates and deletion
   - Default theme management
   - Database operations validation

### Writing Theme Tests

Example of writing a theme test:

```typescript
import { describe, expect, it } from '@jest/globals';
import { getColor, generateColorVariables } from '../colors';

describe('Color System', () => {
  it('should return correct color value', () => {
    expect(getColor('primary.500')).toBe('#3b82f6');
  });

  it('should generate CSS variables', () => {
    const variables = generateColorVariables();
    expect(variables).toContain('--color-primary-500');
  });
});
```

## Next Steps

- [x] Create base theme configuration
- [x] Implement theme persistence interface
- [ ] Create ThemeProvider component
- [ ] Set up theme switching mechanism
- [ ] Create CSS-in-JS setup
- [ ] Implement theme hooks
- [ ] Build theme composition utilities 