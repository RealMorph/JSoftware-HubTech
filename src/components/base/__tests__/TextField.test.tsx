import React, { act } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TextField } from '../TextField';
import { DirectThemeProvider } from '../../../core/theme/DirectThemeProvider';
import { extendedMockTheme } from '../../../core/theme/__mocks__/mockTheme';

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<DirectThemeProvider initialTheme={extendedMockTheme}>{ui}</DirectThemeProvider>);
};

describe('TextField component', () => {
  test('renders with a label', () => {
    renderWithTheme(<TextField label="Username" />);
    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  test('renders with a placeholder', () => {
    renderWithTheme(<TextField placeholder="Enter your name" />);
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
  });

  test('renders with helper text', () => {
    renderWithTheme(<TextField helperText="Please enter your full name" />);
    expect(screen.getByText('Please enter your full name')).toBeInTheDocument();
  });

  test('renders as required', () => {
    renderWithTheme(<TextField label="Email" required />);
    const input = screen.getByRole('textbox');
    expect(input).toBeRequired();
  });

  test('handles value changes', () => {
    const handleChange = jest.fn();
    renderWithTheme(<TextField onChange={handleChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(handleChange).toHaveBeenCalledWith('test');
  });

  test('renders in error state', () => {
    renderWithTheme(<TextField error helperText="This field is required" />);
    const errorMessage = screen.getByText('This field is required');
    expect(errorMessage).toBeInTheDocument();
  });

  test('renders with disabled state', () => {
    renderWithTheme(<TextField disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  test('renders with different sizes', () => {
    renderWithTheme(<TextField size="small" data-testid="text-field-input" />);
    expect(screen.getByTestId('text-field-input')).toBeInTheDocument();
  });

  test('renders with start adornment', () => {
    renderWithTheme(<TextField startAdornment={<span>$</span>} />);
    expect(screen.getByText('$')).toBeInTheDocument();
  });

  test('renders with end adornment', () => {
    renderWithTheme(<TextField endAdornment={<span>kg</span>} />);
    expect(screen.getByText('kg')).toBeInTheDocument();
  });

  test('renders with full width', () => {
    const { container } = renderWithTheme(<TextField fullWidth data-testid="text-field-input" />);
    expect(screen.getByTestId('text-field-input')).toBeInTheDocument();
  });
});
