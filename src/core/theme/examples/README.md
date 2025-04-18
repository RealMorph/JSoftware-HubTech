# Theme Usage in Routes

This guide demonstrates how to effectively use themes in route components using the DirectTheme pattern.

## Basic Usage

The most straightforward way to use themes in routes is through the `useDirectTheme` hook:

```tsx
import { useDirectTheme } from '../DirectThemeProvider';

const RoutePage = () => {
  const { theme } = useDirectTheme();
  
  return (
    <StyledComponent $themeStyles={theme}>
      {/* Component content */}
    </StyledComponent>
  );
};
```

## Route-Specific Theme Customization

You can customize theme values for specific routes:

```tsx
const CustomThemedRoute = () => {
  const { theme } = useDirectTheme();
  const location = useLocation();
  
  const routeTheme = {
    ...theme,
    colors: {
      ...theme.colors,
      primary: location.pathname === '/settings' 
        ? '#9c27b0' // Purple for settings
        : '#2196f3', // Blue for home
    },
  };
  
  return <YourComponent $themeStyles={routeTheme} />;
};
```

## Theme Transitions

When implementing theme transitions between routes:

1. Use CSS transitions for smooth theme changes:
```tsx
const PageContainer = styled.div<{ $themeStyles: ThemeConfig }>`
  transition: all ${({ $themeStyles }) => 
    $themeStyles.transitions.duration.normal} ${({ $themeStyles }) => 
    $themeStyles.transitions.timing.easeInOut};
`;
```

2. Consider using React's transition components for route changes:
```tsx
import { CSSTransition, TransitionGroup } from 'react-transition-group';

const ThemedRoutes = () => {
  const location = useLocation();
  const { theme } = useDirectTheme();
  
  return (
    <TransitionGroup>
      <CSSTransition key={location.key} timeout={300} classNames="page">
        <Routes location={location}>
          {/* Your routes */}
        </Routes>
      </CSSTransition>
    </TransitionGroup>
  );
};
```

## Best Practices

1. **Theme Consistency**: Maintain consistent theme structure across routes
2. **Performance**: Memoize theme modifications when needed
3. **Accessibility**: Ensure sufficient color contrast in all theme variations
4. **Responsive Design**: Test theme appearance across different screen sizes
5. **State Management**: Consider using route state for theme preferences

## Examples

Check `RouteThemeExample.tsx` for a complete implementation showing:
- Basic theme usage in routes
- Route-specific theme customization
- Theme transitions
- Responsive design
- Accessibility considerations

## Testing

When testing themed routes:

```tsx
import { render } from '@testing-library/react';
import { DirectThemeProvider } from '../DirectThemeProvider';
import { MemoryRouter } from 'react-router-dom';

describe('ThemedRoute', () => {
  it('applies correct theme based on route', () => {
    render(
      <DirectThemeProvider initialTheme={defaultTheme}>
        <MemoryRouter initialEntries={['/settings']}>
          <ThemedRoute />
        </MemoryRouter>
      </DirectThemeProvider>
    );
    
    // Add your assertions
  });
});
```

## Common Patterns

1. **Theme Switching**:
```tsx
const ThemeSwitcher = () => {
  const { toggleDarkMode } = useDirectTheme();
  return <button onClick={toggleDarkMode}>Toggle Theme</button>;
};
```

2. **Route-Based Theme Loading**:
```tsx
const ThemedRoute = () => {
  const { setTheme } = useDirectTheme();
  const { themeId } = useParams();
  
  useEffect(() => {
    if (themeId) {
      loadTheme(themeId).then(setTheme);
    }
  }, [themeId, setTheme]);
  
  return <YourComponent />;
};
```

3. **Theme Persistence**:
```tsx
const PersistentThemedRoute = () => {
  const { theme, setTheme } = useDirectTheme();
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('route-theme');
    if (savedTheme) {
      setTheme(JSON.parse(savedTheme));
    }
  }, []);
  
  return <YourComponent $themeStyles={theme} />;
};
``` 