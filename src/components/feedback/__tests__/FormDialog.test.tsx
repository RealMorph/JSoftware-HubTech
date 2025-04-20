import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormDialog, useFormDialog, FormDialogProps } from '../FormDialog';
import { DirectThemeProvider } from '../../../core/theme/DirectThemeProvider';

// Mock theme configuration that matches the expected structure
const mockTheme = {
  colors: {
    background: '#ffffff',
    text: {
      primary: '#333333',
      secondary: '#666666',
      disabled: '#999999',
    },
    primary: '#3366CC',
    secondary: '#6B7280',
    error: {
      main: '#DC2626',
      light: '#FEE2E2',
      dark: '#B91C1C',
    },
    accent: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',
    border: '#e0e0e0',
    white: '#FFFFFF',
    surface: '#F9FAFB',
  },
  typography: {
    family: {
      base: 'Arial, sans-serif',
      heading: 'Arial, sans-serif',
      mono: 'Courier New, monospace',
    },
    scale: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      xxl: '1.5rem',
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  spacing: function(size: string, fallback: string) {
    return fallback;
  },
  shadows: function(size: string, fallback: string) {
    return fallback;
  },
  borderRadius: function(size: string, fallback: string) {
    return fallback;
  },
  getColor: function(path: string, fallback: string) {
    // Simple implementation for testing
    if (path === 'error.main') return '#DC2626';
    if (path === 'error.light') return '#FEE2E2';
    if (path === 'error.dark') return '#B91C1C';
    return fallback;
  },
  getTypography: function(path: string, fallback: string) {
    return fallback;
  },
  getSpacing: function(size: string, fallback: string) {
    return fallback;
  },
  getShadow: function(size: string, fallback: string) {
    return fallback;
  },
  getBorderRadius: function(size: string, fallback: string) {
    return fallback;
  },
  getTransition: function(path: string, fallback: string) {
    return fallback;
  },
};

// Mock Focus Trap component for testing
jest.mock('../../../components/utils/FocusTrap', () => ({
  FocusTrap: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Custom render function with theme provider
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<DirectThemeProvider initialTheme={mockTheme as any}>{ui}</DirectThemeProvider>);
};

// Simple test form component
const TestForm = () => (
  <>
    <div>
      <label htmlFor="name">Name</label>
      <input id="name" name="name" data-testid="name-input" />
    </div>
    <div>
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" data-testid="email-input" />
    </div>
  </>
);

describe('FormDialog Component', () => {
  // Basic Rendering Tests
  describe('Rendering', () => {
    it('renders correctly when open', () => {
      const onClose = jest.fn();
      const onSubmit = jest.fn();
      
      renderWithTheme(
        <FormDialog
          isOpen={true}
          title="Test Form"
          onClose={onClose}
          onSubmit={onSubmit}
        >
          <TestForm />
        </FormDialog>
      );
      
      expect(screen.getByText('Test Form')).toBeInTheDocument();
      expect(screen.getByText('Submit')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });
    
    it('does not render when closed', () => {
      const onClose = jest.fn();
      const onSubmit = jest.fn();
      
      renderWithTheme(
        <FormDialog
          isOpen={false}
          title="Test Form"
          onClose={onClose}
          onSubmit={onSubmit}
        >
          <TestForm />
        </FormDialog>
      );
      
      expect(screen.queryByText('Test Form')).not.toBeInTheDocument();
      expect(screen.queryByText('Submit')).not.toBeInTheDocument();
    });
    
    it('renders with custom button text', () => {
      const onClose = jest.fn();
      const onSubmit = jest.fn();
      
      renderWithTheme(
        <FormDialog
          isOpen={true}
          title="Test Form"
          submitText="Save Changes"
          cancelText="Discard"
          onClose={onClose}
          onSubmit={onSubmit}
        >
          <TestForm />
        </FormDialog>
      );
      
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
      expect(screen.getByText('Discard')).toBeInTheDocument();
    });
  });
  
  // Form Submission Tests
  describe('Form Submission', () => {
    it('calls onSubmit when form is submitted', () => {
      const onClose = jest.fn();
      const onSubmit = jest.fn();
      
      renderWithTheme(
        <FormDialog
          isOpen={true}
          title="Test Form"
          onClose={onClose}
          onSubmit={onSubmit}
        >
          <TestForm />
        </FormDialog>
      );
      
      // Fill in form fields
      userEvent.type(screen.getByLabelText('Name'), 'John Doe');
      userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
      
      // Submit form
      fireEvent.click(screen.getByText('Submit'));
      
      // Check if onSubmit was called
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    
    it('prevents default form submission behavior', () => {
      const onClose = jest.fn();
      const onSubmit = jest.fn((e: React.FormEvent) => {
        // Check if preventDefault was called
        expect(e.preventDefault).toHaveBeenCalled();
      });
      
      renderWithTheme(
        <FormDialog
          isOpen={true}
          title="Test Form"
          onClose={onClose}
          onSubmit={onSubmit}
        >
          <TestForm />
        </FormDialog>
      );
      
      // Create a mock event with preventDefault
      const mockEvent = {
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent;
      
      // Get the form and simulate submission
      const form = screen.getByRole('form');
      fireEvent.submit(form, mockEvent);
      
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    
    it('shows loading state during async submission', async () => {
      const onClose = jest.fn();
      const onSubmit = jest.fn(() => new Promise<void>((resolve) => setTimeout(resolve, 100)));
      
      renderWithTheme(
        <FormDialog
          isOpen={true}
          title="Test Form"
          onClose={onClose}
          onSubmit={onSubmit}
        >
          <TestForm />
        </FormDialog>
      );
      
      // Submit form
      fireEvent.click(screen.getByText('Submit'));
      
      // Check if loading state is shown
      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });
      
      // Buttons should be disabled
      const submitButton = screen.getByText('Loading...');
      const cancelButton = screen.getByText('Cancel');
      expect(submitButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
      
      // Wait for submission to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      }, { timeout: 200 });
    });
    
    it('closes dialog after successful submission', async () => {
      const onClose = jest.fn();
      const onSubmit = jest.fn((): Promise<void> => Promise.resolve());
      
      renderWithTheme(
        <FormDialog
          isOpen={true}
          title="Test Form"
          onClose={onClose}
          onSubmit={onSubmit}
        >
          <TestForm />
        </FormDialog>
      );
      
      // Submit form
      fireEvent.click(screen.getByText('Submit'));
      
      // Wait for submission to complete
      await waitFor(() => {
        expect(onClose).toHaveBeenCalledTimes(1);
      });
    });
  });
  
  // Error Handling Tests
  describe('Error Handling', () => {
    it('displays error message when submission fails', async () => {
      const onClose = jest.fn();
      const onSubmit = jest.fn((): Promise<void> => Promise.reject(new Error('Validation failed')));
      
      renderWithTheme(
        <FormDialog
          isOpen={true}
          title="Test Form"
          onClose={onClose}
          onSubmit={onSubmit}
        >
          <TestForm />
        </FormDialog>
      );
      
      // Submit form
      fireEvent.click(screen.getByText('Submit'));
      
      // Wait for error message to appear
      await waitFor(() => {
        expect(screen.getByText('Validation failed')).toBeInTheDocument();
      });
      
      // Dialog should not be closed on error
      expect(onClose).not.toHaveBeenCalled();
    });
    
    it('displays external error message from props', () => {
      const onClose = jest.fn();
      const onSubmit = jest.fn();
      
      renderWithTheme(
        <FormDialog
          isOpen={true}
          title="Test Form"
          errorMessage="Server is not responding"
          onClose={onClose}
          onSubmit={onSubmit}
        >
          <TestForm />
        </FormDialog>
      );
      
      expect(screen.getByText('Server is not responding')).toBeInTheDocument();
    });
    
    it('does not display error when showError is false', async () => {
      const onClose = jest.fn();
      const onSubmit = jest.fn((): Promise<void> => Promise.reject(new Error('Validation failed')));
      
      renderWithTheme(
        <FormDialog
          isOpen={true}
          title="Test Form"
          onClose={onClose}
          onSubmit={onSubmit}
          showError={false}
        >
          <TestForm />
        </FormDialog>
      );
      
      // Submit form
      fireEvent.click(screen.getByText('Submit'));
      
      // Wait for submission to complete
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(1);
      });
      
      // Error message should not be displayed
      expect(screen.queryByText('Validation failed')).not.toBeInTheDocument();
    });
  });
  
  // Loading State Tests
  describe('Loading State', () => {
    it('shows loading state when isSubmitting is true', () => {
      const onClose = jest.fn();
      const onSubmit = jest.fn();
      
      renderWithTheme(
        <FormDialog
          isOpen={true}
          title="Test Form"
          onClose={onClose}
          onSubmit={onSubmit}
          isSubmitting={true}
        >
          <TestForm />
        </FormDialog>
      );
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      
      const submitButton = screen.getByText('Loading...');
      const cancelButton = screen.getByText('Cancel');
      expect(submitButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });
    
    it('prevents closing via backdrop when loading', () => {
      const onClose = jest.fn();
      const onSubmit = jest.fn();
      
      renderWithTheme(
        <FormDialog
          isOpen={true}
          title="Test Form"
          onClose={onClose}
          onSubmit={onSubmit}
          isSubmitting={true}
        >
          <TestForm />
        </FormDialog>
      );
      
      // Find the overlay backdrop and click it
      const overlays = document.querySelectorAll('div');
      const overlay = Array.from(overlays).find(el => 
        el.getAttribute('role') !== 'dialog' && 
        el.contains(screen.getByText('Test Form'))
      );
      
      if (overlay) {
        fireEvent.click(overlay);
        expect(onClose).not.toHaveBeenCalled();
      } else {
        throw new Error("Couldn't find overlay element");
      }
    });
  });
  
  // Cancellation Tests
  describe('Cancellation', () => {
    it('calls onClose when cancel button is clicked', () => {
      const onClose = jest.fn();
      const onSubmit = jest.fn();
      
      renderWithTheme(
        <FormDialog
          isOpen={true}
          title="Test Form"
          onClose={onClose}
          onSubmit={onSubmit}
        >
          <TestForm />
        </FormDialog>
      );
      
      fireEvent.click(screen.getByText('Cancel'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
    
    it('calls onCancel and onClose when cancel button is clicked', () => {
      const onClose = jest.fn();
      const onSubmit = jest.fn();
      const onCancel = jest.fn();
      
      renderWithTheme(
        <FormDialog
          isOpen={true}
          title="Test Form"
          onClose={onClose}
          onSubmit={onSubmit}
          onCancel={onCancel}
        >
          <TestForm />
        </FormDialog>
      );
      
      fireEvent.click(screen.getByText('Cancel'));
      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
  
  // Hook Tests
  describe('useFormDialog Hook', () => {
    // Test wrapper component that uses the hook
    const TestComponent = () => {
      const { openFormDialog, closeFormDialog, FormDialog: FormDialogComponent } = useFormDialog();
      
      const handleOpenDialog = () => {
        openFormDialog({
          title: 'Hook Test Form',
          children: <TestForm />,
          onSubmit: (e) => {
            e.preventDefault();
          },
        });
      };
      
      return (
        <div>
          <button onClick={handleOpenDialog}>Open Form</button>
          <button onClick={closeFormDialog}>Close Form</button>
          <FormDialogComponent />
        </div>
      );
    };
    
    it('opens dialog when openFormDialog is called', async () => {
      renderWithTheme(<TestComponent />);
      
      // Initially dialog should not be visible
      expect(screen.queryByText('Hook Test Form')).not.toBeInTheDocument();
      
      // Open the dialog
      fireEvent.click(screen.getByText('Open Form'));
      
      // Now dialog should be visible
      expect(screen.getByText('Hook Test Form')).toBeInTheDocument();
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });
    
    it('closes dialog when closeFormDialog is called', async () => {
      renderWithTheme(<TestComponent />);
      
      // Open the dialog
      fireEvent.click(screen.getByText('Open Form'));
      expect(screen.getByText('Hook Test Form')).toBeInTheDocument();
      
      // Close the dialog
      fireEvent.click(screen.getByText('Close Form'));
      
      // Wait for dialog to close
      await waitFor(() => {
        expect(screen.queryByText('Hook Test Form')).not.toBeInTheDocument();
      });
    });
  });
}); 