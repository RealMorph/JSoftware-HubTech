import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeConfig } from '../../../core/theme/consolidated-types';
import { DirectThemeProvider } from '../../../core/theme/DirectThemeProvider';
import { List, ListItem } from '../List';

// Create a mock theme for testing that matches ThemeConfig interface
const mockTheme: ThemeConfig = {
  id: 'test-theme',
  name: 'Test Theme',
  colors: {
    primary: '#1976d2',
    secondary: '#dc004e',
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
    background: '#ffffff',
    text: {
      primary: '#000000',
      secondary: '#222222',
      disabled: '#666666'
    },
    border: '#e0e0e0',
    white: '#ffffff',
    surface: '#f5f5f5',
    // Add color scales as any to avoid type errors
    // For nested colors like primary.50 we access them via getColor utility
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    } as any
  } as any, // Cast entire colors object as any to handle nested color objects
  typography: {
    fontFamily: {
      base: 'Roboto, sans-serif',
      heading: 'Roboto, sans-serif',
      monospace: 'monospace'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '2.5rem',
    '3xl': '3rem',
    '4xl': '4rem',
    // Add numeric keys as any to avoid type errors since they're used by List component
    '0': '0' as any,
    '1': '0.25rem' as any,
    '2': '0.5rem' as any,
    '3': '0.75rem' as any,
    '4': '1rem' as any,
    '5': '1.25rem' as any,
    '6': '1.5rem' as any,
    '8': '2rem' as any
  },
  breakpoints: {
    xs: '0px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px'
  },
  shadows: {
    none: 'none',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
  },
  transitions: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    timing: {
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      linear: 'linear'
    }
  }
};

// Add primary color nested object for testing
// This is outside the main definition to avoid TypeScript duplicate property error
(mockTheme.colors as any).primary = {
  50: '#eff6ff',
  100: '#dbeafe',
  700: '#1d4ed8'
};

// Wrapper component that provides the theme
const ThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <DirectThemeProvider initialTheme={mockTheme}>
      {children}
    </DirectThemeProvider>
  );
};

describe('List Component', () => {
  test('renders list with children', () => {
    render(
      <ThemeWrapper>
        <List data-testid="list">
          <ListItem data-testid="list-item">List item 1</ListItem>
        </List>
      </ThemeWrapper>
    );

    const list = screen.getByTestId('list');
    const listItem = screen.getByTestId('list-item');
    
    expect(list).toBeInTheDocument();
    expect(listItem).toBeInTheDocument();
    expect(listItem).toHaveTextContent('List item 1');
  });

  test('renders list with different variants', () => {
    const { rerender } = render(
      <ThemeWrapper>
        <List data-testid="list" variant="default">
          <ListItem>List item 1</ListItem>
        </List>
      </ThemeWrapper>
    );

    let list = screen.getByTestId('list');
    expect(list).toHaveStyle({ border: 'none' });

    rerender(
      <ThemeWrapper>
        <List data-testid="list" variant="bordered">
          <ListItem>List item 1</ListItem>
        </List>
      </ThemeWrapper>
    );

    list = screen.getByTestId('list');
    expect(list).toHaveStyle({ border: `1px solid ${(mockTheme.colors as any).gray[200]}` });
    expect(list).toHaveStyle({ borderRadius: mockTheme.borderRadius.md });

    rerender(
      <ThemeWrapper>
        <List data-testid="list" variant="divided">
          <ListItem data-testid="list-item">List item 1</ListItem>
        </List>
      </ThemeWrapper>
    );

    list = screen.getByTestId('list');
    const listItem = screen.getByTestId('list-item');
    expect(list).toHaveStyle({ border: 'none' });
    expect(listItem).toHaveStyle({ borderBottom: `1px solid ${(mockTheme.colors as any).gray[200]}` });
  });

  test('renders list with different sizes', () => {
    const { rerender } = render(
      <ThemeWrapper>
        <List data-testid="list" size="small">
          <ListItem data-testid="list-item">List item 1</ListItem>
        </List>
      </ThemeWrapper>
    );

    let listItem = screen.getByTestId('list-item');
    expect(listItem).toHaveStyle({ padding: `${(mockTheme.spacing as any)['1']} ${(mockTheme.spacing as any)['2']}` });

    rerender(
      <ThemeWrapper>
        <List data-testid="list" size="medium">
          <ListItem data-testid="list-item">List item 1</ListItem>
        </List>
      </ThemeWrapper>
    );

    listItem = screen.getByTestId('list-item');
    expect(listItem).toHaveStyle({ padding: `${(mockTheme.spacing as any)['2']} ${(mockTheme.spacing as any)['3']}` });

    rerender(
      <ThemeWrapper>
        <List data-testid="list" size="large">
          <ListItem data-testid="list-item">List item 1</ListItem>
        </List>
      </ThemeWrapper>
    );

    listItem = screen.getByTestId('list-item');
    expect(listItem).toHaveStyle({ padding: `${(mockTheme.spacing as any)['3']} ${(mockTheme.spacing as any)['4']}` });
  });

  test('handles interactive list items', () => {
    render(
      <ThemeWrapper>
        <List data-testid="list" interactive>
          <ListItem data-testid="list-item">List item 1</ListItem>
        </List>
      </ThemeWrapper>
    );

    const listItem = screen.getByTestId('list-item');
    expect(listItem).toHaveStyle({ cursor: 'pointer' });
    
    // Hover state
    fireEvent.mouseOver(listItem);
    expect(listItem).toHaveStyle({ backgroundColor: (mockTheme.colors as any).gray[50] });
    
    // Return to initial state
    fireEvent.mouseOut(listItem);
    expect(listItem).toHaveStyle({ backgroundColor: 'transparent' });
  });

  test('renders selected list item', () => {
    render(
      <ThemeWrapper>
        <List data-testid="list">
          <ListItem data-testid="list-item" selected>List item 1</ListItem>
        </List>
      </ThemeWrapper>
    );

    const listItem = screen.getByTestId('list-item');
    expect(listItem).toHaveStyle({ 
      backgroundColor: (mockTheme.colors as any).primary[50],
      color: (mockTheme.colors as any).primary[700]
    });
    expect(listItem).toHaveAttribute('aria-selected', 'true');
  });

  test('renders disabled list item', () => {
    render(
      <ThemeWrapper>
        <List data-testid="list">
          <ListItem data-testid="list-item" disabled>List item 1</ListItem>
        </List>
      </ThemeWrapper>
    );

    const listItem = screen.getByTestId('list-item');
    expect(listItem).toHaveStyle({ 
      backgroundColor: (mockTheme.colors as any).gray[50],
      color: (mockTheme.colors as any).gray[400],
      cursor: 'not-allowed',
      opacity: 0.7
    });
    expect(listItem).toHaveAttribute('aria-disabled', 'true');
  });

  test('renders list item with start and end content', () => {
    render(
      <ThemeWrapper>
        <List data-testid="list">
          <ListItem 
            data-testid="list-item"
            startContent={<span data-testid="start-content">Start</span>}
            endContent={<span data-testid="end-content">End</span>}
          >
            List item 1
          </ListItem>
        </List>
      </ThemeWrapper>
    );

    expect(screen.getByTestId('start-content')).toBeInTheDocument();
    expect(screen.getByTestId('start-content')).toHaveTextContent('Start');
    
    expect(screen.getByTestId('end-content')).toBeInTheDocument();
    expect(screen.getByTestId('end-content')).toHaveTextContent('End');
    
    expect(screen.getByTestId('list-item')).toHaveTextContent('List item 1');
  });
}); 