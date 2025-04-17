import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TextFieldDemo } from '../TextFieldDemo';
import { DirectThemeProvider } from '../../../core/theme/DirectThemeProvider';
import { extendedMockTheme } from '../../../core/theme/__mocks__/mockTheme';

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<DirectThemeProvider initialTheme={extendedMockTheme}>{ui}</DirectThemeProvider>);
};

describe('TextFieldDemo component', () => {
  test('renders all sections', () => {
    renderWithTheme(<TextFieldDemo />);
    expect(screen.getByText('TextField Component Demo')).toBeInTheDocument();
  });

  test('renders all variants', () => {
    renderWithTheme(<TextFieldDemo />);
    expect(screen.getByText('Variants')).toBeInTheDocument();
    expect(screen.getByText('Standard')).toBeInTheDocument();
    expect(screen.getByText('Outlined')).toBeInTheDocument();
    expect(screen.getByText('Filled')).toBeInTheDocument();
  });

  test('renders all states', () => {
    renderWithTheme(<TextFieldDemo />);
    expect(screen.getByText('States')).toBeInTheDocument();
    expect(screen.getByText('Error State')).toBeInTheDocument();
    expect(screen.getByText('Required Field')).toBeInTheDocument();
    expect(screen.getByText('Disabled Field')).toBeInTheDocument();
  });

  test('renders all sizes', () => {
    renderWithTheme(<TextFieldDemo />);
    expect(screen.getByText('Sizes')).toBeInTheDocument();
    expect(screen.getByText('Small')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Large')).toBeInTheDocument();
  });

  test('renders fields with adornments', () => {
    renderWithTheme(<TextFieldDemo />);
    expect(screen.getByText('With Adornments')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
  });

  test('handles input changes', () => {
    renderWithTheme(<TextFieldDemo />);
    const standardInput = screen.getAllByRole('textbox')[0];
    fireEvent.change(standardInput, { target: { value: 'Hello World' } });
  });

  test('renders helper text', () => {
    renderWithTheme(<TextFieldDemo />);
    expect(screen.getByText('This is a helper text')).toBeInTheDocument();
  });

  test('renders required field indicator', () => {
    renderWithTheme(<TextFieldDemo />);
    const requiredField = screen.getByText('Required Field');
    expect(requiredField).toBeInTheDocument();
  });

  test('renders disabled field', () => {
    renderWithTheme(<TextFieldDemo />);
    // Find the disabled field by its label
    const disabledField = screen.getByText('Disabled Field');
    expect(disabledField).toBeInTheDocument();
  });
});
