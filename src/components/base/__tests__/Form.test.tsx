import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Form, { useForm, FormContextType, ValidationRule } from '../Form';
import { renderWithTheme } from '../../../core/theme/test-utils';
import styled from '@emotion/styled';

// Test Component to access form context
const TestFormField: React.FC<{
  name: string;
  label: string;
  placeholder?: string;
  value?: string;
  validationRules?: ValidationRule[];
}> = ({ name, label, placeholder, validationRules = [] }) => {
  const formContext = useForm();
  const {
    values,
    errors,
    handleChange,
    handleBlur,
    registerField,
    setFieldValue,
    setFieldTouched,
  } = formContext;

  // Register field on mount
  React.useEffect(() => {
    const rules = [...validationRules]; // Use validation rules from props first

    // Add default validators if no validation rules were provided
    if (rules.length === 0) {
      // Add email validator
      if (name === 'email') {
        rules.push({
          validator: (value: any) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
          message: 'Invalid email format',
        });
      }

      // Add password length validator
      if (name === 'password') {
        rules.push({
          validator: (value: any) => !value || value.length >= 8,
          message: 'Password must be at least 8 characters',
        });
      }
    }

    // Register the field with rules
    registerField(name, rules);
  }, [name, registerField, validationRules]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    handleChange(name, value);
  };

  const onBlur = () => {
    handleBlur(name);
  };

  return (
    <div data-testid={`field-${name}`}>
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        value={values[name] || ''}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        data-testid={`input-${name}`}
      />
      {errors[name] && <span data-testid={`error-${name}`}>{errors[name]}</span>}
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
    renderWithTheme(<Form children={<div data-testid="form-child">Form content</div>} />);
    expect(screen.getByTestId('form-child')).toBeInTheDocument();
  });

  test('validates required fields on submit', async () => {
    const handleSubmit = jest.fn();
    const handleValidationError = jest.fn();

    renderWithTheme(
      <Form onSubmit={handleSubmit} onValidationError={handleValidationError}>
        <TestFormField
          name="username"
          label="Username"
          validationRules={[
            {
              validator: (value: any) => Boolean(value && value.trim() !== ''),
              message: 'Username is required',
            },
          ]}
        />
        <SubmitButton />
      </Form>
    );

    // Leave the username field empty
    fireEvent.change(screen.getByTestId('input-username'), { target: { value: '' } });

    // Force blur to trigger validation
    const usernameInput = screen.getByTestId('input-username');
    fireEvent.blur(usernameInput);

    // Submit the form - this should now validate and catch the error
    fireEvent.click(screen.getByTestId('submit-button'));

    // Check that onSubmit was NOT called and validation error was triggered
    await waitFor(() => {
      expect(handleSubmit).not.toHaveBeenCalled();
    });
  });

  test('submits valid form data', async () => {
    const handleSubmit = jest.fn();

    renderWithTheme(
      <Form onSubmit={handleSubmit}>
        <TestFormField name="username" label="Username" />
        <SubmitButton />
      </Form>
    );

    // Fill in the required field
    fireEvent.change(screen.getByTestId('input-username'), { target: { value: 'testuser' } });

    // Submit the form
    fireEvent.click(screen.getByTestId('submit-button'));

    // Check that onSubmit was called with the correct data
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'testuser',
        })
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
        onValidationError={handleValidationError}
        onSubmit={handleSubmit}
      >
        <TestFormField name="email" label="Email" />
        <SubmitButton />
      </Form>
    );

    // Force blur to trigger validation
    const emailInput = getByTestId('input-email');
    fireEvent.blur(emailInput);

    // Submit the form to check validation
    fireEvent.click(getByTestId('submit-button'));

    // Check that handleSubmit was not called (validation failed)
    await waitFor(() => {
      expect(handleSubmit).not.toHaveBeenCalled();
    });
  });

  test('initializes with default values', async () => {
    renderWithTheme(
      <Form
        defaultValues={{
          username: 'default-user',
          email: 'user@example.com',
        }}
      >
        <TestFormField name="username" label="Username" />
        <TestFormField name="email" label="Email" />
      </Form>
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
        onValidationError={handleValidationError}
        onSubmit={handleSubmit}
      >
        <TestFormField name="password" label="Password" />
        <SubmitButton />
      </Form>
    );

    // Force blur to trigger validation
    const passwordInput = getByTestId('input-password');
    fireEvent.blur(passwordInput);

    // Submit the form to check validation
    fireEvent.click(getByTestId('submit-button'));

    // Check that handleSubmit was not called (validation failed)
    await waitFor(() => {
      expect(handleSubmit).not.toHaveBeenCalled();
    });
  });
});
