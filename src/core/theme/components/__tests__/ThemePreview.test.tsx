import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemePreview } from '../ThemePreview';
import { ThemeConfig, defaultTheme } from '../../theme-persistence';
import { colors, semanticColors, stateColors } from '../../colors';

// Mock the applyTheme function
jest.mock('../../theme-system', () => ({
  applyTheme: jest.fn(),
}));

// Create a mock theme based on defaultTheme
const mockTheme: ThemeConfig = {
  ...defaultTheme,
  id: 'test-theme',
  name: 'Test Theme',
  description: 'A test theme for testing',
  colors: {
    ...defaultTheme.colors,
    // Override specific colors for testing
    primary: {
      ...defaultTheme.colors.primary,
      500: '#3B82F6', // Custom primary color
    },
    secondary: {
      ...defaultTheme.colors.secondary,
      500: '#10B981', // Custom secondary color
    },
  },
  // Other customizations
  isDefault: false,
};

describe('ThemePreview', () => {
  const mockOnClose = jest.fn();
  const mockOnApply = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the theme preview with the theme name', () => {
    render(<ThemePreview theme={mockTheme} onClose={mockOnClose} onApply={mockOnApply} />);
    expect(screen.getByText(`Preview: ${mockTheme.name}`)).toBeInTheDocument();
  });

  it('calls onApply when the Apply Theme button is clicked', () => {
    render(<ThemePreview theme={mockTheme} onClose={mockOnClose} onApply={mockOnApply} />);
    fireEvent.click(screen.getByText('Apply Theme'));
    expect(mockOnApply).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the Cancel button is clicked', () => {
    render(<ThemePreview theme={mockTheme} onClose={mockOnClose} onApply={mockOnApply} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('displays color samples', () => {
    render(<ThemePreview theme={mockTheme} onClose={mockOnClose} onApply={mockOnApply} />);
    expect(screen.getByText('Colors')).toBeInTheDocument();
  });

  it('displays typography samples', () => {
    render(<ThemePreview theme={mockTheme} onClose={mockOnClose} onApply={mockOnApply} />);
    expect(screen.getByText('Typography')).toBeInTheDocument();
  });

  it('displays component samples', () => {
    render(<ThemePreview theme={mockTheme} onClose={mockOnClose} onApply={mockOnApply} />);
    expect(screen.getByText('Components')).toBeInTheDocument();
  });
});
