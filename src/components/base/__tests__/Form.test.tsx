import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Form, { useForm, FormContextType } from '../Form';
import { renderWithTheme } from '../../../core/theme/test-utils';
import styled from 'styled-components';

// Test Component to access form context
const TestFormField: React.FC<{
  name: string;
  label: string;
  placeholder?: string;
  value?: string;
  validationRules?: any;
}> = ({ name, label, placeholder }) => {
  const formContext = useForm();
  const { values, errors, handleChange, handleBlur, registerField, setFieldValue, setFieldTouched } = formContext;
  const [localValue, setLocalValue] = React.useState('');
  const [localError, setLocalError] = React.useState<string | null>(null);
  
  // Register field on mount
  React.useEffect(() => {
    registerField(name);
  }, [name, registerField]);
  
  // Update local value when form values change
  React.useEffect(() => {
    if (values[name] !== undefined) {
      setLocalValue(values[name]);
    }
  }, [values, name]);

  // Update local error when form errors change
  React.useEffect(() => {
    if (errors[name] !== undefined) {
      setLocalError(errors[name]);
    }
  }, [errors, name]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalValue(value);
    handleChange(name, value);
  };

  const onBlur = () => {
    handleBlur(name);
    setFieldTouched(name);
  };

  return (
    <div data-testid={`field-${name}`}>
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        value={localValue}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        data-testid={`input-${name}`}
      />
      {localError && <span data-testid={`error-${name}`}>{localError}</span>}
    </div>
  );
};

// Test submit button
const SubmitButton = () => (
  <button type="submit" data-testid="submit-button">
    Submit
  </button>
);

// Styled form component (for testing styled-components integration)
const StyledForm = styled(Form)`
  background-color: #f0f0f0;
  padding: 20px;
  border-radius: 8px;
`;

describe('Form component', () => {
  test('renders with children', async () => {
    renderWithTheme(
      <Form children={<div data-testid="form-child">Form content</div>} />
    );
    expect(screen.getByTestId('form-child')).toBeInTheDocument();
  });

  test('validates required fields on submit', async () => {
    const handleSubmit = jest.fn();
    const handleValidationError = jest.fn();

    renderWithTheme(
      <Form
        validationRules={{
          username: { required: true, errorMessage: 'Username is required' }
        }}
        onSubmit={handleSubmit}
        onValidationError={handleValidationError}
        children={
          <>
            <TestFormField name="username" label="Username" />
            <SubmitButton />
          </>
        }
      />
    );

    // Submit the form without filling required fields
    fireEvent.click(screen.getByTestId('submit-button'));

    // Check that validation error was triggered
    await waitFor(() => {
      expect(handleValidationError).toHaveBeenCalled();
      expect(handleSubmit).not.toHaveBeenCalled();
    });
  });

  test('submits valid form data', async () => {
    const handleSubmit = jest.fn();

    renderWithTheme(
      <Form
        validationRules={{
          username: { required: true }
        }}
        onSubmit={handleSubmit}
        children={
          <>
            <TestFormField name="username" label="Username" />
            <SubmitButton />
          </>
        }
      />
    );

    // Fill in the required field
    fireEvent.change(screen.getByTestId('input-username'), { target: { value: 'testuser' } });
    
    // Submit the form
    fireEvent.click(screen.getByTestId('submit-button'));

    // Check that onSubmit was called with the correct data
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ username: 'testuser' }),
        expect.anything()
      );
    });
  });

  test('validates field on blur', async () => {
    const handleValidationError = jest.fn();
    const handleSubmit = jest.fn();
    
    // Render with defaultValues to initialize the field
    const { getByTestId } = renderWithTheme(
      <Form
        defaultValues={{ email: 'invalid-email' }}
        validationRules={{
          email: { 
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
            errorMessage: 'Invalid email format' 
          }
        }}
        onValidationError={handleValidationError}
        onSubmit={handleSubmit}
        children={
          <>
            <TestFormField name="email" label="Email" />
            <SubmitButton />
          </>
        }
      />
    );
    
    // Trigger validation by submitting the form
    fireEvent.click(getByTestId('submit-button'));
    
    // Wait for validation error callback to be called
    await waitFor(() => {
      expect(handleValidationError).toHaveBeenCalled();
      expect(handleValidationError).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'Invalid email format'
        })
      );
      expect(handleSubmit).not.toHaveBeenCalled();
    });
  });

  test('initializes with default values', async () => {
    renderWithTheme(
      <Form
        defaultValues={{
          username: 'default-user',
          email: 'user@example.com'
        }}
        children={
          <>
            <TestFormField name="username" label="Username" />
            <TestFormField name="email" label="Email" />
          </>
        }
      />
    );

    // Check that inputs have default values
    expect(screen.getByTestId('input-username')).toHaveValue('default-user');
    expect(screen.getByTestId('input-email')).toHaveValue('user@example.com');
  });

  test('validates minLength constraint', async () => {
    const handleValidationError = jest.fn();
    const handleSubmit = jest.fn();
    
    // Render with defaultValues to initialize the field
    const { getByTestId } = renderWithTheme(
      <Form
        defaultValues={{ password: 'short' }}
        validationRules={{
          password: { 
            minLength: 8, 
            errorMessage: 'Password must be at least 8 characters' 
          }
        }}
        onValidationError={handleValidationError}
        onSubmit={handleSubmit}
        children={
          <>
            <TestFormField name="password" label="Password" />
            <SubmitButton />
          </>
        }
      />
    );
    
    // Trigger validation by submitting the form
    fireEvent.click(getByTestId('submit-button'));
    
    // Wait for validation error callback to be called
    await waitFor(() => {
      expect(handleValidationError).toHaveBeenCalled();
      expect(handleValidationError).toHaveBeenCalledWith(
        expect.objectContaining({
          password: 'Password must be at least 8 characters'
        })
      );
      expect(handleSubmit).not.toHaveBeenCalled();
    });
  });
}); 