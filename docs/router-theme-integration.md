# Router Theme Integration

This document outlines how theming is integrated with the router in our application.

## Overview

The application uses the DirectThemeProvider to manage themes across all routes. This ensures consistent theme application and smooth theme transitions throughout the application.

## Implementation

### Basic Setup

```tsx
import { DirectThemeProvider } from './core/theme/DirectThemeProvider';
import { defaultTheme, ThemeService } from './core/theme/theme-persistence';

const AppRouter = () => {
  return (
    <DirectThemeProvider initialTheme={defaultTheme} themeService={themeService}>
      <BrowserRouter>
        {/* Routes */}
      </BrowserRouter>
    </DirectThemeProvider>
  );
};
```

### Theme Service

The theme service provides methods for theme management:

```typescript
interface ThemeService {
  getDefaultTheme(): ThemeConfig;
  getLightTheme(): ThemeConfig;
  getDarkTheme(): ThemeConfig;
  getAllThemes(): ThemeConfig[];
  getThemeById(id: string): ThemeConfig;
  createTheme(theme: ThemeConfig): ThemeConfig;
  updateTheme(id: string, theme: Partial<ThemeConfig>): ThemeConfig;
  deleteTheme(id: string): boolean;
  setDefaultTheme(id: string): boolean;
}
```

## Usage in Components

### Accessing Theme Values

```tsx
import { useDirectTheme } from './core/theme/DirectThemeProvider';

const MyComponent = () => {
  const { theme } = useDirectTheme();
  
  return (
    <div style={{ color: theme.colors.text.primary }}>
      Themed Content
    </div>
  );
};
```

### Theme Switching

```tsx
import { useDirectTheme } from './core/theme/DirectThemeProvider';

const ThemeToggle = () => {
  const { toggleDarkMode } = useDirectTheme();
  
  return (
    <button onClick={toggleDarkMode}>
      Toggle Theme
    </button>
  );
};
```

## Testing

Theme integration tests ensure proper theme application and persistence:

```tsx
describe('Router Theme Integration', () => {
  it('applies theme correctly across routes', () => {
    render(
      <DirectThemeProvider initialTheme={defaultTheme}>
        <MemoryRouter>
          <AppRouter />
        </MemoryRouter>
      </DirectThemeProvider>
    );
    
    // Verify theme application
  });
  
  it('maintains theme when navigating', () => {
    // Test theme persistence during navigation
  });
});
```

## Best Practices

1. Always wrap the router with DirectThemeProvider
2. Use the useDirectTheme hook for theme access
3. Avoid direct theme manipulation outside the theme service
4. Test theme integration when adding new routes
5. Use theme tokens instead of hard-coded values

## Migration from Legacy System

If migrating from the old theme system:

1. Replace UnifiedThemeProvider with DirectThemeProvider
2. Update theme service implementation
3. Remove legacy theme context dependencies
4. Update component theme access to use useDirectTheme
5. Test theme persistence and switching

## Troubleshooting

Common issues and solutions:

1. Theme not applying:
   - Verify DirectThemeProvider is at the root level
   - Check theme service initialization
   - Ensure proper theme object structure

2. Theme inconsistencies:
   - Verify theme tokens are being used
   - Check for hard-coded values
   - Validate theme object structure

3. Theme switching issues:
   - Verify theme service implementation
   - Check dark/light theme configurations
   - Validate local storage integration 