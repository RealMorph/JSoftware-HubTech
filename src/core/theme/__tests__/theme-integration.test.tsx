import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { DirectThemeProvider } from '../DirectThemeProvider';
import { useDirectTheme } from '../hooks/useDirectTheme';
import { themeDefaults } from '../theme-defaults';
import styled from 'styled-components';
import { ThemeConfig, ThemeColors } from '../consolidated-types';

// Test components
const StyledComponent = styled.div<{ $themeStyles: ThemeConfig }>`
  color: ${props => {
    const textColor = props.$themeStyles.colors.text;
    return typeof textColor === 'string' ? textColor : textColor.primary;
  }};
  background: ${props => props.$themeStyles.colors.background};
  padding: ${props => props.$themeStyles.spacing.md};
`;

const TestComponent = () => {
  const { theme } = useDirectTheme();
  return (
    <StyledComponent $themeStyles={theme} data-testid="test-component">
      Test Content
    </StyledComponent>
  );
};

const NestedThemeComponent = () => {
  const { theme } = useDirectTheme();
  const textColor = themeDefaults.colors.text;
  const nestedTheme: ThemeConfig = {
    ...themeDefaults,
    colors: {
      ...themeDefaults.colors,
      text: typeof textColor === 'string' ? {
        primary: '#FF0000',
        secondary: '#3C3C43',
        disabled: '#999999'
      } : {
        ...textColor,
        primary: '#FF0000'
      }
    }
  };
  return (
    <DirectThemeProvider initialTheme={nestedTheme}>
      <TestComponent />
    </DirectThemeProvider>
  );
};

// Mock third-party component
const MockThirdPartyComponent = ({ theme }: { theme: ThemeConfig }) => (
  <div style={{ color: theme.colors.primary }} data-testid="third-party">
    Third Party Content
  </div>
);

const ThirdPartyWrapper = () => {
  const { theme } = useDirectTheme();
  return <MockThirdPartyComponent theme={theme} />;
};

describe('Theme Integration Tests', () => {
  describe('Basic Theme Integration', () => {
    it('correctly applies theme to styled components', () => {
      render(
        <DirectThemeProvider initialTheme={themeDefaults}>
          <TestComponent />
        </DirectThemeProvider>
      );
      
      const component = screen.getByTestId('test-component');
      const styles = window.getComputedStyle(component);
      
      const textColor = themeDefaults.colors.text;
      const expectedColor = typeof textColor === 'string' ? textColor : textColor.primary;
      
      expect(styles.color).toBe(expectedColor);
      expect(styles.backgroundColor).toBe(themeDefaults.colors.background);
      expect(styles.padding).toBe(themeDefaults.spacing.md);
    });

    it('updates components when theme changes', () => {
      const { rerender } = render(
        <DirectThemeProvider initialTheme={themeDefaults}>
          <TestComponent />
        </DirectThemeProvider>
      );

      const textColor = themeDefaults.colors.text;
      const updatedTheme: ThemeConfig = {
        ...themeDefaults,
        colors: {
          ...themeDefaults.colors,
          text: typeof textColor === 'string' ? {
            primary: '#FF0000',
            secondary: '#3C3C43',
            disabled: '#999999'
          } : {
            ...textColor,
            primary: '#FF0000'
          }
        }
      };

      rerender(
        <DirectThemeProvider initialTheme={updatedTheme}>
          <TestComponent />
        </DirectThemeProvider>
      );

      const component = screen.getByTestId('test-component');
      const styles = window.getComputedStyle(component);
      expect(styles.color).toBe('#FF0000');
    });
  });

  describe('Theme Context Nesting', () => {
    it('allows theme overrides in nested providers', () => {
      render(
        <DirectThemeProvider initialTheme={themeDefaults}>
          <NestedThemeComponent />
        </DirectThemeProvider>
      );

      const component = screen.getByTestId('test-component');
      const styles = window.getComputedStyle(component);
      expect(styles.color).toBe('#FF0000');
    });

    it('maintains theme inheritance for non-overridden values', () => {
      render(
        <DirectThemeProvider initialTheme={themeDefaults}>
          <NestedThemeComponent />
        </DirectThemeProvider>
      );

      const component = screen.getByTestId('test-component');
      const styles = window.getComputedStyle(component);
      expect(styles.backgroundColor).toBe(themeDefaults.colors.background);
    });
  });

  describe('Third-party Component Integration', () => {
    it('successfully provides theme to third-party components', () => {
      render(
        <DirectThemeProvider initialTheme={themeDefaults}>
          <ThirdPartyWrapper />
        </DirectThemeProvider>
      );

      const thirdPartyComponent = screen.getByTestId('third-party');
      const styles = window.getComputedStyle(thirdPartyComponent);
      expect(styles.color).toBe(themeDefaults.colors.primary);
    });

    it('updates third-party components on theme changes', () => {
      const { rerender } = render(
        <DirectThemeProvider initialTheme={themeDefaults}>
          <ThirdPartyWrapper />
        </DirectThemeProvider>
      );

      const updatedTheme: ThemeConfig = {
        ...themeDefaults,
        colors: {
          ...themeDefaults.colors,
          primary: '#FF0000'
        }
      };

      rerender(
        <DirectThemeProvider initialTheme={updatedTheme}>
          <ThirdPartyWrapper />
        </DirectThemeProvider>
      );

      const component = screen.getByTestId('third-party');
      const styles = window.getComputedStyle(component);
      expect(styles.color).toBe('#FF0000');
    });
  });

  describe('Theme Performance', () => {
    it('memoizes theme values to prevent unnecessary rerenders', () => {
      const renderCount = { count: 0 };
      
      const MemoTestComponent = React.memo(() => {
        renderCount.count++;
        const { theme } = useDirectTheme();
        return <div data-testid="memo-test">{theme.colors.primary}</div>;
      });

      const { rerender } = render(
        <DirectThemeProvider initialTheme={themeDefaults}>
          <MemoTestComponent />
        </DirectThemeProvider>
      );

      const initialRenderCount = renderCount.count;

      // Rerender with same theme
      rerender(
        <DirectThemeProvider initialTheme={themeDefaults}>
          <MemoTestComponent />
        </DirectThemeProvider>
      );

      expect(renderCount.count).toBe(initialRenderCount);
    });
  });

  describe('SSR Compatibility', () => {
    it('hydrates without warnings', () => {
      const consoleSpy = jest.spyOn(console, 'error');
      
      const ssrMarkup = (
        <DirectThemeProvider initialTheme={themeDefaults}>
          <TestComponent />
        </DirectThemeProvider>
      );

      const container = document.createElement('div');
      container.innerHTML = '<div data-testid="test-component">Test Content</div>';
      
      act(() => {
        render(ssrMarkup, { container, hydrate: true });
      });

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
}); 