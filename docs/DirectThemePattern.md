# DirectTheme Pattern

The DirectTheme pattern is our standardized approach for consuming theme values in components. It provides type-safe, direct access to theme properties while maintaining a consistent interface across the application.

## Basic Usage

```tsx
import React from 'react';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

interface ThemeStyles {
  colors: {
    background: string;
    text: string;
  };
  spacing: {
    md: string;
  };
  typography: {
    fontSize: string;
  };
}

const StyledComponent = styled.div<{ $themeStyles: ThemeStyles }>`
  background-color: ${({ $themeStyles }) => $themeStyles.colors.background};
  color: ${({ $themeStyles }) => $themeStyles.colors.text};
  padding: ${({ $themeStyles }) => $themeStyles.spacing.md};
  font-size: ${({ $themeStyles }) => $themeStyles.typography.fontSize};
`;

export const MyComponent: React.FC = () => {
  const { getColor, getTypography, getSpacing } = useDirectTheme();
  
  const themeStyles: ThemeStyles = {
    colors: {
      background: getColor('background.main'),
      text: getColor('text.primary'),
    },
    spacing: {
      md: getSpacing('4'),
    },
    typography: {
      fontSize: String(getTypography('size.base')),
    },
  };

  return (
    <StyledComponent $themeStyles={themeStyles}>
      Content
    </StyledComponent>
  );
};
```

## Theme Access Methods

The `useDirectTheme` hook provides several methods for accessing theme values:

```tsx
const {
  getColor,      // Access color values
  getTypography, // Access typography values
  getSpacing,    // Access spacing values
  getBorderRadius, // Access border radius values
  getShadow,     // Access shadow values
  getTransition, // Access transition values
} = useDirectTheme();
```

## Best Practices

1. Always define a `ThemeStyles` interface for your component
2. Use the `$themeStyles` prop for styled components
3. Create theme styles object in your component
4. Use appropriate getter methods from `useDirectTheme`
5. Convert values to appropriate types (e.g., `String()` for typography values that could be numbers)

## Example with Multiple Theme Properties

```tsx
interface ThemeStyles {
  colors: {
    background: {
      primary: string;
      secondary: string;
    };
    text: {
      primary: string;
      secondary: string;
    };
    border: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      base: string;
      small: string;
    };
    fontWeight: {
      normal: number;
      bold: number;
    };
  };
  spacing: {
    sm: string;
    md: string;
    lg: string;
  };
  borders: {
    radius: {
      sm: string;
      md: string;
    };
  };
}

const MyComponent: React.FC = () => {
  const { getColor, getTypography, getSpacing, getBorderRadius } = useDirectTheme();
  
  const themeStyles: ThemeStyles = {
    colors: {
      background: {
        primary: getColor('background.main'),
        secondary: getColor('background.light'),
      },
      text: {
        primary: getColor('text.primary'),
        secondary: getColor('text.secondary'),
      },
      border: getColor('border'),
    },
    typography: {
      fontFamily: String(getTypography('family.base')),
      fontSize: {
        base: String(getTypography('size.base')),
        small: String(getTypography('size.sm')),
      },
      fontWeight: {
        normal: Number(getTypography('weight.normal')),
        bold: Number(getTypography('weight.bold')),
      },
    },
    spacing: {
      sm: getSpacing('2'),
      md: getSpacing('4'),
      lg: getSpacing('6'),
    },
    borders: {
      radius: {
        sm: getBorderRadius('sm'),
        md: getBorderRadius('md'),
      },
    },
  };

  return (
    <StyledComponent $themeStyles={themeStyles}>
      {/* Component content */}
    </StyledComponent>
  );
};
```

## Migration from Old Pattern

If you're migrating from the old theme utilities:

1. Replace imports:
```diff
- import { getThemeValue } from '../../core/theme/theme-utils';
+ import { useDirectTheme } from '../../core/theme/DirectThemeProvider';
```

2. Replace theme access:
```diff
- const color = getThemeValue(theme, 'colors.primary');
+ const { getColor } = useDirectTheme();
+ const color = getColor('primary');
```

3. Update styled components:
```diff
- const StyledComponent = styled.div`
-   color: ${props => getThemeValue(props.theme, 'colors.text')};
- `;
+ interface ThemeStyles {
+   colors: {
+     text: string;
+   };
+ }
+ const StyledComponent = styled.div<{ $themeStyles: ThemeStyles }>`
+   color: ${({ $themeStyles }) => $themeStyles.colors.text};
+ `;
```

## Type Safety

The DirectTheme pattern provides full type safety:

1. Theme values are typed through the `ThemeConfig` interface
2. Component styles are typed through the `ThemeStyles` interface
3. Getter methods from `useDirectTheme` are properly typed
4. The `$themeStyles` prop provides type checking for styled components

## Performance Considerations

1. Define `ThemeStyles` interface outside the component
2. Memoize theme styles object if it's used in multiple places
3. Use appropriate theme getter methods to avoid unnecessary theme traversal

## ESLint Rules

We have ESLint rules to enforce the DirectTheme pattern:

1. Prevent importing from old theme utilities
2. Enforce usage of `$themeStyles` prop
3. Require proper typing of styled components

## Testing

When testing components that use the DirectTheme pattern:

```tsx
import { renderWithTheme } from '../../test-utils';

describe('MyComponent', () => {
  it('renders with theme styles', () => {
    const { container } = renderWithTheme(<MyComponent />);
    expect(container).toMatchSnapshot();
  });
});
```