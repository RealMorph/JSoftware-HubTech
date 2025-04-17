import React from 'react';
import { render, screen } from '@testing-library/react';
import { Flex, FlexItem } from '../Flex';
import { DirectThemeProvider } from '../../../core/theme/DirectThemeProvider';

const mockTheme = {
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
  },
  colors: {
    primary: '#0070f3',
    secondary: '#6c757d',
    tertiary: '#6610f2',
    success: '#28a745',
    warning: '#ffc107',
    error: '#dc3545',
    info: '#17a2b8',
    text: {
      primary: '#000000',
      secondary: '#6c757d',
      disabled: '#adb5bd',
    },
    background: '#ffffff',
    border: '#dee2e6',
    white: '#ffffff',
    surface: '#f8f9fa',
  },
  typography: {
    fontFamily: {
      base: 'system-ui, sans-serif',
      heading: 'system-ui, sans-serif',
      monospace: 'monospace',
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
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },
  breakpoints: {
    xs: '0px',
    sm: '600px',
    md: '960px',
    lg: '1280px',
    xl: '1920px',
    '2xl': '2560px',
  },
  borderRadius: {
    none: '0',
    sm: '2px',
    base: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    full: '9999px',
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px rgba(0, 0, 0, 0.1)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
  },
  transitions: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    timing: {
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      linear: 'linear',
    },
  },
};

describe('Flex Component', () => {
  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<DirectThemeProvider initialTheme={mockTheme}>{ui}</DirectThemeProvider>);
  };

  test('renders children correctly', () => {
    renderWithTheme(<Flex testId="flex-container">Child Content</Flex>);
    const flexContainer = screen.getByTestId('flex-container');
    expect(flexContainer).toBeInTheDocument();
    expect(flexContainer).toHaveTextContent('Child Content');
  });

  test('applies correct default styles', () => {
    renderWithTheme(<Flex testId="flex-container">Content</Flex>);
    const flexContainer = screen.getByTestId('flex-container');
    expect(flexContainer).toHaveStyle({
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'nowrap',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      gap: '1rem',
    });
  });

  test('applies custom styles correctly', () => {
    renderWithTheme(
      <Flex
        testId="flex-container"
        direction="column"
        wrap="wrap"
        justifyContent="center"
        alignItems="flex-end"
        alignContent="space-between"
        gap="2rem"
        fullWidth
        fullHeight
        inline
      >
        Content
      </Flex>
    );

    const flexContainer = screen.getByTestId('flex-container');
    expect(flexContainer).toHaveStyle({
      display: 'inline-flex',
      flexDirection: 'column',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'flex-end',
      alignContent: 'space-between',
      gap: '2rem',
      width: '100%',
      height: '100%',
    });
  });

  test('renders FlexItem correctly', () => {
    renderWithTheme(
      <Flex>
        <FlexItem testId="flex-item">Item Content</FlexItem>
      </Flex>
    );

    const flexItem = screen.getByTestId('flex-item');
    expect(flexItem).toBeInTheDocument();
    expect(flexItem).toHaveTextContent('Item Content');
  });

  test('applies custom FlexItem styles correctly', () => {
    renderWithTheme(
      <Flex>
        <FlexItem
          testId="flex-item"
          flex="1 0 auto"
          grow={1}
          shrink={0}
          basis="50%"
          alignSelf="center"
          order={2}
        >
          Item Content
        </FlexItem>
      </Flex>
    );

    const flexItem = screen.getByTestId('flex-item');
    expect(flexItem).toHaveStyle({
      flex: '1 0 auto',
      flexGrow: 1,
      flexShrink: 0,
      flexBasis: '50%',
      alignSelf: 'center',
      order: 2,
    });
  });

  test('applies numeric gap correctly', () => {
    renderWithTheme(
      <Flex testId="flex-container" gap={16}>
        Content
      </Flex>
    );
    const flexContainer = screen.getByTestId('flex-container');
    expect(flexContainer).toHaveStyle({
      gap: '16px',
    });
  });
});
