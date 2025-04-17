import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { DirectThemeProvider } from '../../../core/theme/DirectThemeProvider';
import { Breadcrumbs } from '../Breadcrumbs';

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

const breadcrumbItems = [
  {
    id: 'home',
    label: 'Home',
    path: '/',
  },
  {
    id: 'products',
    label: 'Products',
    path: '/products',
  },
  {
    id: 'category',
    label: 'Category',
    path: '/products/category',
  },
  {
    id: 'item',
    label: 'Item',
    path: '/products/category/item',
    active: true,
  },
];

// Wrapper component with MemoryRouter and DirectThemeProvider
const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <DirectThemeProvider initialTheme={mockTheme as any}>{ui}</DirectThemeProvider>
    </MemoryRouter>
  );
};

describe('Breadcrumbs Component', () => {
  it('renders breadcrumbs with provided items', () => {
    renderWithRouter(<Breadcrumbs items={breadcrumbItems} />);

    // Check if all breadcrumb items are rendered
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Item')).toBeInTheDocument();

    // Check if the last item has active styling
    const itemElement = screen.getByText('Item');
    expect(itemElement).toHaveStyle({ fontWeight: 'bold' });
  });

  it('generates breadcrumbs from current route', () => {
    // Set up routes for testing auto-generated breadcrumbs
    const TestRoutes = () => (
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/products" element={<div>Products</div>} />
        <Route path="/products/:category" element={<div>Category</div>} />
        <Route path="/products/:category/:item" element={<div>Item</div>} />
      </Routes>
    );

    // Render with autoGenerate enabled
    render(
      <MemoryRouter initialEntries={['/products/electronics/laptop']}>
        <DirectThemeProvider initialTheme={mockTheme as any}>
          <>
            <Breadcrumbs autoGenerate={true} />
            <TestRoutes />
          </>
        </DirectThemeProvider>
      </MemoryRouter>
    );

    // Check auto-generated breadcrumbs
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument(); // Formatted from 'electronics'
    expect(screen.getByText('Laptop')).toBeInTheDocument(); // Formatted from 'laptop'
  });

  it('collapses items when maxItems is exceeded', () => {
    renderWithRouter(
      <Breadcrumbs
        items={breadcrumbItems}
        maxItems={3}
        itemsBeforeCollapse={1}
        itemsAfterCollapse={1}
      />
    );

    // Check if first and last items are visible
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Item')).toBeInTheDocument();

    // Check if middle items are collapsed with ellipsis
    expect(screen.getByText('...')).toBeInTheDocument();
    expect(screen.queryByText('Products')).not.toBeInTheDocument();
    expect(screen.queryByText('Category')).not.toBeInTheDocument();

    // Click on ellipsis to expand
    fireEvent.click(screen.getByText('...'));

    // Now all items should be visible
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Item')).toBeInTheDocument();
    expect(screen.queryByText('...')).not.toBeInTheDocument();
  });

  it('renders custom separator', () => {
    renderWithRouter(<Breadcrumbs items={breadcrumbItems} separator=">" />);

    // Check if custom separator is rendered
    const separators = screen.getAllByText('>');
    expect(separators.length).toBe(3); // 3 separators for 4 items
  });

  it('applies theme styles correctly', () => {
    renderWithRouter(<Breadcrumbs items={breadcrumbItems} />);

    // Check if theme styles are applied to the breadcrumb container
    const container = screen.getByRole('navigation');
    expect(container).toHaveStyle({
      fontFamily: 'system-ui, sans-serif',
      fontSize: '0.875rem',
      color: '#666666',
    });

    // Check if active item has primary color
    const activeItem = screen.getByText('Item');
    expect(activeItem).toHaveStyle({
      color: '#3366CC',
      fontWeight: 'bold',
    });
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { DirectThemeProvider } from '../../../core/theme/DirectThemeProvider';
import { Breadcrumbs } from '../Breadcrumbs';

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

const breadcrumbItems = [
  {
    id: 'home',
    label: 'Home',
    path: '/',
  },
  {
    id: 'products',
    label: 'Products',
    path: '/products',
  },
  {
    id: 'category',
    label: 'Category',
    path: '/products/category',
  },
  {
    id: 'item',
    label: 'Item',
    path: '/products/category/item',
    active: true,
  },
];

// Wrapper component with MemoryRouter and DirectThemeProvider
const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <DirectThemeProvider initialTheme={mockTheme as any}>{ui}</DirectThemeProvider>
    </MemoryRouter>
  );
};

describe('Breadcrumbs Component', () => {
  it('renders breadcrumbs with provided items', () => {
    renderWithRouter(<Breadcrumbs items={breadcrumbItems} />);

    // Check if all breadcrumb items are rendered
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Item')).toBeInTheDocument();

    // Check if the last item has active styling
    const itemElement = screen.getByText('Item');
    expect(itemElement).toHaveStyle({ fontWeight: 'bold' });
  });

  it('generates breadcrumbs from current route', () => {
    // Set up routes for testing auto-generated breadcrumbs
    const TestRoutes = () => (
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/products" element={<div>Products</div>} />
        <Route path="/products/:category" element={<div>Category</div>} />
        <Route path="/products/:category/:item" element={<div>Item</div>} />
      </Routes>
    );

    // Render with autoGenerate enabled
    render(
      <MemoryRouter initialEntries={['/products/electronics/laptop']}>
        <DirectThemeProvider initialTheme={mockTheme as any}>
          <>
            <Breadcrumbs autoGenerate={true} />
            <TestRoutes />
          </>
        </DirectThemeProvider>
      </MemoryRouter>
    );

    // Check auto-generated breadcrumbs
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument(); // Formatted from 'electronics'
    expect(screen.getByText('Laptop')).toBeInTheDocument(); // Formatted from 'laptop'
  });

  it('collapses items when maxItems is exceeded', () => {
    renderWithRouter(
      <Breadcrumbs
        items={breadcrumbItems}
        maxItems={3}
        itemsBeforeCollapse={1}
        itemsAfterCollapse={1}
      />
    );

    // Check if first and last items are visible
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Item')).toBeInTheDocument();

    // Check if middle items are collapsed with ellipsis
    expect(screen.getByText('...')).toBeInTheDocument();
    expect(screen.queryByText('Products')).not.toBeInTheDocument();
    expect(screen.queryByText('Category')).not.toBeInTheDocument();

    // Click on ellipsis to expand
    fireEvent.click(screen.getByText('...'));

    // Now all items should be visible
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Item')).toBeInTheDocument();
    expect(screen.queryByText('...')).not.toBeInTheDocument();
  });

  it('renders custom separator', () => {
    renderWithRouter(<Breadcrumbs items={breadcrumbItems} separator=">" />);

    // Check if custom separator is rendered
    const separators = screen.getAllByText('>');
    expect(separators.length).toBe(3); // 3 separators for 4 items
  });

  it('applies theme styles correctly', () => {
    renderWithRouter(<Breadcrumbs items={breadcrumbItems} />);

    // Check if theme styles are applied to the breadcrumb container
    const container = screen.getByRole('navigation');
    expect(container).toHaveStyle({
      fontFamily: 'system-ui, sans-serif',
      fontSize: '0.875rem',
      color: '#666666',
    });

    // Check if active item has primary color
    const activeItem = screen.getByText('Item');
    expect(activeItem).toHaveStyle({
      color: '#3366CC',
      fontWeight: 'bold',
    });
  });
});
