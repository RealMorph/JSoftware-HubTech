import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import styled from '@emotion/styled';
import { DirectThemeProvider, useDirectTheme } from '../DirectThemeProvider';
import { ThemeConfig } from '../consolidated-types';
import { createMockTheme } from '../test-theme-validator';

// Create styled components using the DirectTheme pattern
interface ThemeStyles {
  backgroundColor: string;
  color: string;
  padding: string;
  fontSize: string;
}

const createThemeStyles = (theme: ThemeConfig): ThemeStyles => ({
  backgroundColor: theme.colors.background,
  color: typeof theme.colors.text === 'object' ? theme.colors.text.primary : theme.colors.text,
  padding: theme.spacing.md,
  fontSize: theme.typography.fontSize.md,
});

const StyledContainer = styled.div<{ $themeStyles: ThemeStyles }>`
  background-color: ${props => props.$themeStyles.backgroundColor};
  color: ${props => props.$themeStyles.color};
  padding: ${props => props.$themeStyles.padding};
  font-size: ${props => props.$themeStyles.fontSize};
`;

const StyledButton = styled.button<{ $themeStyles: ThemeStyles }>`
  background-color: ${props => props.$themeStyles.backgroundColor};
  color: ${props => props.$themeStyles.color};
  padding: ${props => props.$themeStyles.padding};
  font-size: ${props => props.$themeStyles.fontSize};
  border: none;
  cursor: pointer;
`;

// Test component using styled components with DirectTheme
const TestComponent: React.FC = () => {
  const themeContext = useDirectTheme();
  // Since we're in a test environment and using mockTheme, we know this cast is safe
  const theme = themeContext as unknown as ThemeConfig;
  const themeStyles = createThemeStyles(theme);

  return (
    <div>
      <StyledContainer data-testid="styled-container" $themeStyles={themeStyles}>
        Styled Container
      </StyledContainer>
      <StyledButton data-testid="styled-button" $themeStyles={themeStyles}>
        Styled Button
      </StyledButton>
    </div>
  );
};

describe('DirectTheme with Styled Components', () => {
  // Basic styled component rendering
  it('applies theme styles to styled components', () => {
    const mockTheme = createMockTheme();
    const expectedStyles = createThemeStyles(mockTheme);

    render(
      <DirectThemeProvider initialTheme={mockTheme}>
        <TestComponent />
      </DirectThemeProvider>
    );

    const container = screen.getByTestId('styled-container');
    const button = screen.getByTestId('styled-button');

    // Verify styles are applied correctly
    expect(container).toHaveStyle({
      backgroundColor: expectedStyles.backgroundColor,
      color: expectedStyles.color,
      padding: expectedStyles.padding,
      fontSize: expectedStyles.fontSize,
    });

    expect(button).toHaveStyle({
      backgroundColor: expectedStyles.backgroundColor,
      color: expectedStyles.color,
      padding: expectedStyles.padding,
      fontSize: expectedStyles.fontSize,
    });
  });

  // Theme updates with styled components
  it('updates styled components when theme changes', () => {
    const initialTheme = createMockTheme();
    const updatedColors = {
      ...initialTheme.colors,
      background: '#updated-bg',
      text: typeof initialTheme.colors.text === 'object' 
        ? {
            ...initialTheme.colors.text,
            primary: '#updated-text',
          }
        : initialTheme.colors.text,
    };
    
    const updatedTheme: ThemeConfig = {
      ...initialTheme,
      colors: updatedColors,
    };

    const { rerender } = render(
      <DirectThemeProvider initialTheme={initialTheme}>
        <TestComponent />
      </DirectThemeProvider>
    );

    // Initial styles check
    const container = screen.getByTestId('styled-container');
    expect(container).toHaveStyle({
      backgroundColor: initialTheme.colors.background,
      color: typeof initialTheme.colors.text === 'object' ? initialTheme.colors.text.primary : initialTheme.colors.text,
    });

    // Update theme
    rerender(
      <DirectThemeProvider initialTheme={updatedTheme}>
        <TestComponent />
      </DirectThemeProvider>
    );

    // Verify updated styles
    expect(container).toHaveStyle({
      backgroundColor: updatedTheme.colors.background,
      color: typeof updatedTheme.colors.text === 'object' ? updatedTheme.colors.text.primary : updatedTheme.colors.text,
    });
  });

  // Nested styled components
  it('properly propagates theme to nested styled components', () => {
    const NestedComponent = styled.div<{ $themeStyles: ThemeStyles }>`
      margin: ${props => props.$themeStyles.padding};
    `;

    const ParentComponent: React.FC = () => {
      const themeContext = useDirectTheme();
      // Since we're in a test environment and using mockTheme, we know this cast is safe
      const theme = themeContext as unknown as ThemeConfig;
      const themeStyles = createThemeStyles(theme);

      return (
        <StyledContainer data-testid="parent" $themeStyles={themeStyles}>
          <NestedComponent data-testid="nested" $themeStyles={themeStyles}>
            Nested Content
          </NestedComponent>
        </StyledContainer>
      );
    };

    const mockTheme = createMockTheme();
    render(
      <DirectThemeProvider initialTheme={mockTheme}>
        <ParentComponent />
      </DirectThemeProvider>
    );

    const parent = screen.getByTestId('parent');
    const nested = screen.getByTestId('nested');

    expect(parent).toHaveStyle({
      backgroundColor: mockTheme.colors.background,
    });
    expect(nested).toHaveStyle({
      margin: mockTheme.spacing.md,
    });
  });

  // Dynamic styles based on theme
  it('supports dynamic styles based on theme values', () => {
    const DynamicComponent = styled.div<{ $themeStyles: ThemeStyles; $variant: 'primary' | 'secondary' }>`
      background-color: ${props => props.$variant === 'primary' 
        ? props.$themeStyles.backgroundColor 
        : props.$themeStyles.color};
    `;

    const DynamicTest: React.FC = () => {
      const themeContext = useDirectTheme();
      // Since we're in a test environment and using mockTheme, we know this cast is safe
      const theme = themeContext as unknown as ThemeConfig;
      const themeStyles = createThemeStyles(theme);

      return (
        <>
          <DynamicComponent data-testid="primary" $themeStyles={themeStyles} $variant="primary" />
          <DynamicComponent data-testid="secondary" $themeStyles={themeStyles} $variant="secondary" />
        </>
      );
    };

    const mockTheme = createMockTheme();
    render(
      <DirectThemeProvider initialTheme={mockTheme}>
        <DynamicTest />
      </DirectThemeProvider>
    );

    const primary = screen.getByTestId('primary');
    const secondary = screen.getByTestId('secondary');

    expect(primary).toHaveStyle({
      backgroundColor: mockTheme.colors.background,
    });
    expect(secondary).toHaveStyle({
      backgroundColor: typeof mockTheme.colors.text === 'object' ? mockTheme.colors.text.primary : mockTheme.colors.text,
    });
  });
}); 