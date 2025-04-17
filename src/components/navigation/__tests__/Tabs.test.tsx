import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DirectThemeProvider } from '../../../core/theme/DirectThemeProvider';
import { Tabs } from '../Tabs';

// Mock theme for testing
const mockTheme = {
  name: 'Test Theme',
  colors: {
    primary: '#3366CC',
    secondary: '#6633CC',
    tertiary: '#CC3366',
    error: '#FF0000',
    warning: '#FFA500',
    info: '#0088FF',
    success: '#00CC00',
    background: '#f5f5f5',
    foreground: '#ffffff',
    text: {
      primary: '#333333',
      secondary: '#666666',
      disabled: '#999999',
    },
    border: {
      primary: '#e0e0e0',
    },
  },
  typography: {
    fontFamily: {
      base: 'system-ui, sans-serif',
      heading: 'system-ui, sans-serif',
      mono: 'monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.25rem',
      xl: '1.5rem',
      '2xl': '2rem',
      '3xl': '2.5rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      none: '1',
      tight: '1.25',
      normal: '1.5',
      loose: '2',
    },
  },
  spacing: {
    '0': '0',
    '1': '0.25rem',
    '2': '0.5rem',
    '3': '0.75rem',
    '4': '1rem',
    '6': '1.5rem',
    '8': '2rem',
    '12': '3rem',
    '16': '4rem',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  },
  shadows: {
    none: 'none',
    base: '0 1px 2px rgba(0,0,0,0.1)',
    sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    md: '0 4px 6px rgba(0,0,0,0.1)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
    xl: '0 20px 25px rgba(0,0,0,0.1)',
    '2xl': '0 25px 50px rgba(0,0,0,0.25)',
  },
  transitions: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
};

// Test data
const tabsData = [
  {
    id: 'tab1',
    label: 'Tab 1',
    content: <div data-testid="tab1-content">Tab 1 Content</div>,
  },
  {
    id: 'tab2',
    label: 'Tab 2',
    content: <div data-testid="tab2-content">Tab 2 Content</div>,
  },
  {
    id: 'tab3',
    label: 'Tab 3',
    content: <div data-testid="tab3-content">Tab 3 Content</div>,
    disabled: true,
  },
];

// Helper to render tabs with DirectThemeProvider
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<DirectThemeProvider initialTheme={mockTheme as any}>{ui}</DirectThemeProvider>);
};

describe('Tabs Component', () => {
  it('renders tabs correctly with DirectThemeProvider', () => {
    renderWithTheme(<Tabs tabs={tabsData} />);

    // Check if all tab labels are rendered
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
    expect(screen.getByText('Tab 3')).toBeInTheDocument();

    // Check if first tab content is visible
    expect(screen.getByTestId('tab1-content')).toBeVisible();

    // Check if other tab contents are hidden
    expect(screen.queryByTestId('tab2-content')).not.toBeVisible();
    expect(screen.queryByTestId('tab3-content')).not.toBeVisible();
  });

  it('changes tab when clicked', () => {
    renderWithTheme(<Tabs tabs={tabsData} />);

    // Initially first tab should be active
    expect(screen.getByTestId('tab1-content')).toBeVisible();

    // Click on second tab
    fireEvent.click(screen.getByText('Tab 2'));

    // Now second tab content should be visible
    expect(screen.getByTestId('tab2-content')).toBeVisible();
    expect(screen.queryByTestId('tab1-content')).not.toBeVisible();
  });

  it('respects disabled tabs', () => {
    renderWithTheme(<Tabs tabs={tabsData} />);

    // Initially first tab should be active
    expect(screen.getByTestId('tab1-content')).toBeVisible();

    // Click on disabled third tab
    fireEvent.click(screen.getByText('Tab 3'));

    // It should not change, first tab content should still be visible
    expect(screen.getByTestId('tab1-content')).toBeVisible();
    expect(screen.queryByTestId('tab3-content')).not.toBeVisible();
  });

  it('renders with different variants', () => {
    const { rerender } = renderWithTheme(<Tabs tabs={tabsData} variant="default" />);

    // Check default variant
    const defaultTabList = screen.getByRole('tab', { name: 'Tab 1' }).parentElement;
    expect(defaultTabList).toHaveStyle({ borderBottom: 'none' });

    // Update to underline variant
    rerender(
      <DirectThemeProvider initialTheme={mockTheme as any}>
        <Tabs tabs={tabsData} variant="underline" />
      </DirectThemeProvider>
    );

    // Check underline variant
    const underlineTabList = screen.getByRole('tab', { name: 'Tab 1' }).parentElement;
    expect(underlineTabList).toHaveStyle({ borderBottom: '1px solid #e0e0e0' });
  });

  it('calls onChange callback when tab changes', () => {
    const handleChange = jest.fn();
    renderWithTheme(<Tabs tabs={tabsData} onChange={handleChange} />);

    // Click on second tab
    fireEvent.click(screen.getByText('Tab 2'));

    // Check if callback was called with correct tab id
    expect(handleChange).toHaveBeenCalledWith('tab2');
  });
});
