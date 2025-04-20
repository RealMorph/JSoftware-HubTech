import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmationDialog, useConfirmationDialog } from '../ConfirmationDialog';
import { DirectThemeProvider } from '../../../core/theme/DirectThemeProvider';
import { ThemeConfig } from '../../../core/theme/consolidated-types';

// Mock theme for testing
const mockTheme: ThemeConfig = {
  colors: {
    background: '#ffffff',
    text: {
      primary: '#333333',
      secondary: '#666666',
      disabled: '#999999',
    },
    primary: '#3366CC',
    secondary: '#6B7280',
    tertiary: '#8B5CF6',
    accent: '#DC2626', // Using accent for danger color
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    border: '#e0e0e0',
    white: '#FFFFFF',
    surface: '#F9FAFB',
  },
  typography: {
    fontFamily: {
      base: 'Arial, sans-serif',
      heading: 'Arial, sans-serif',
      monospace: 'Courier New, monospace',
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
      relaxed: 1.625,
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
  breakpoints: {
    xs: '0px',
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
    '2xl': '1536px',
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
    base: '0 2px 4px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
  },
  transitions: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    timing: {
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      linear: 'linear',
    },
  },
};

// Mock Focus Trap component to make testing easier
jest.mock('../../../components/utils/FocusTrap', () => ({
  FocusTrap: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Custom render function that wraps components in DirectThemeProvider
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<DirectThemeProvider initialTheme={mockTheme}>{ui}</DirectThemeProvider>);
};

describe('ConfirmationDialog Component', () => {
  // Basic Rendering Tests
  describe('Rendering', () => {
    it('renders correctly when open', () => {
      const onClose = jest.fn();
      const onConfirm = jest.fn();
      
      renderWithTheme(
        <ConfirmationDialog
          isOpen={true}
          message="Are you sure you want to proceed?"
          onClose={onClose}
          onConfirm={onConfirm}
        />
      );
      
      expect(screen.getByText('Confirm Action')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Confirm')).toBeInTheDocument();
    });
    
    it('does not render when closed', () => {
      const onClose = jest.fn();
      const onConfirm = jest.fn();
      
      renderWithTheme(
        <ConfirmationDialog
          isOpen={false}
          message="Are you sure you want to proceed?"
          onClose={onClose}
          onConfirm={onConfirm}
        />
      );
      
      expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument();
      expect(screen.queryByText('Are you sure you want to proceed?')).not.toBeInTheDocument();
    });
    
    it('renders with custom title', () => {
      const onClose = jest.fn();
      const onConfirm = jest.fn();
      
      renderWithTheme(
        <ConfirmationDialog
          isOpen={true}
          title="Custom Title"
          message="Are you sure you want to proceed?"
          onClose={onClose}
          onConfirm={onConfirm}
        />
      );
      
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });
    
    it('renders with custom button text', () => {
      const onClose = jest.fn();
      const onConfirm = jest.fn();
      
      renderWithTheme(
        <ConfirmationDialog
          isOpen={true}
          message="Are you sure you want to proceed?"
          confirmText="Yes, do it"
          cancelText="No, go back"
          onClose={onClose}
          onConfirm={onConfirm}
        />
      );
      
      expect(screen.getByText('Yes, do it')).toBeInTheDocument();
      expect(screen.getByText('No, go back')).toBeInTheDocument();
    });
  });
  
  // Confirmation Type Tests
  describe('Confirmation Types', () => {
    it('renders info confirmation with correct styling', () => {
      const onClose = jest.fn();
      const onConfirm = jest.fn();
      
      renderWithTheme(
        <ConfirmationDialog
          isOpen={true}
          message="This is an info message"
          confirmationType="info"
          onClose={onClose}
          onConfirm={onConfirm}
        />
      );
      
      expect(screen.getByText('Confirm Action')).toBeInTheDocument();
      const confirmButton = screen.getByText('Confirm');
      // Info uses primary button
      expect(confirmButton).toBeInTheDocument();
    });
    
    it('renders warning confirmation with correct styling', () => {
      const onClose = jest.fn();
      const onConfirm = jest.fn();
      
      renderWithTheme(
        <ConfirmationDialog
          isOpen={true}
          message="This is a warning message"
          confirmationType="warning"
          onClose={onClose}
          onConfirm={onConfirm}
        />
      );
      
      expect(screen.getByText('Warning')).toBeInTheDocument();
      const confirmButton = screen.getByText('Confirm');
      // Warning uses secondary button
      expect(confirmButton).toBeInTheDocument();
    });
    
    it('renders danger confirmation with correct styling', () => {
      const onClose = jest.fn();
      const onConfirm = jest.fn();
      
      renderWithTheme(
        <ConfirmationDialog
          isOpen={true}
          message="This is a danger message"
          confirmationType="danger"
          onClose={onClose}
          onConfirm={onConfirm}
        />
      );
      
      expect(screen.getByText('Caution')).toBeInTheDocument();
      const confirmButton = screen.getByText('Confirm');
      // Danger uses accent button
      expect(confirmButton).toBeInTheDocument();
    });
  });
  
  // Interaction Tests
  describe('Interactions', () => {
    it('calls onConfirm when confirm button is clicked', () => {
      const onClose = jest.fn();
      const onConfirm = jest.fn();
      
      renderWithTheme(
        <ConfirmationDialog
          isOpen={true}
          message="Are you sure you want to proceed?"
          onClose={onClose}
          onConfirm={onConfirm}
        />
      );
      
      fireEvent.click(screen.getByText('Confirm'));
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
    
    it('calls onClose when cancel button is clicked', () => {
      const onClose = jest.fn();
      const onConfirm = jest.fn();
      
      renderWithTheme(
        <ConfirmationDialog
          isOpen={true}
          message="Are you sure you want to proceed?"
          onClose={onClose}
          onConfirm={onConfirm}
        />
      );
      
      fireEvent.click(screen.getByText('Cancel'));
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onConfirm).not.toHaveBeenCalled();
    });
    
    it('calls onCancel and onClose when cancel button is clicked', () => {
      const onClose = jest.fn();
      const onConfirm = jest.fn();
      const onCancel = jest.fn();
      
      renderWithTheme(
        <ConfirmationDialog
          isOpen={true}
          message="Are you sure you want to proceed?"
          onClose={onClose}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );
      
      fireEvent.click(screen.getByText('Cancel'));
      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onConfirm).not.toHaveBeenCalled();
    });
    
    it('calls onClose when clicking outside the modal if closeOnBackdropClick is true', () => {
      const onClose = jest.fn();
      const onConfirm = jest.fn();
      
      renderWithTheme(
        <ConfirmationDialog
          isOpen={true}
          message="Are you sure you want to proceed?"
          onClose={onClose}
          onConfirm={onConfirm}
          closeOnBackdropClick={true}
        />
      );
      
      // Find the overlay backdrop and click it
      const overlays = document.querySelectorAll('div');
      const overlay = Array.from(overlays).find(el => 
        el.getAttribute('role') !== 'dialog' && 
        el.contains(screen.getByText('Confirm Action'))
      );
      
      if (overlay) {
        fireEvent.click(overlay);
        expect(onClose).toHaveBeenCalledTimes(1);
      } else {
        throw new Error("Couldn't find overlay element");
      }
    });
    
    it('does not call onClose when clicking outside if closeOnBackdropClick is false', () => {
      const onClose = jest.fn();
      const onConfirm = jest.fn();
      
      renderWithTheme(
        <ConfirmationDialog
          isOpen={true}
          message="Are you sure you want to proceed?"
          onClose={onClose}
          onConfirm={onConfirm}
          closeOnBackdropClick={false}
        />
      );
      
      // Find the overlay backdrop and click it
      const overlays = document.querySelectorAll('div');
      const overlay = Array.from(overlays).find(el => 
        el.getAttribute('role') !== 'dialog' && 
        el.contains(screen.getByText('Confirm Action'))
      );
      
      if (overlay) {
        fireEvent.click(overlay);
        expect(onClose).not.toHaveBeenCalled();
      } else {
        throw new Error("Couldn't find overlay element");
      }
    });
  });
  
  // Loading State Tests
  describe('Loading State', () => {
    it('disables buttons when in loading state', () => {
      const onClose = jest.fn();
      const onConfirm = jest.fn();
      
      renderWithTheme(
        <ConfirmationDialog
          isOpen={true}
          message="Are you sure you want to proceed?"
          onClose={onClose}
          onConfirm={onConfirm}
          loading={true}
        />
      );
      
      const confirmButton = screen.getByText('Confirm');
      const cancelButton = screen.getByText('Cancel');
      
      expect(confirmButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });
    
    it('shows loading indicator when in loading state', () => {
      const onClose = jest.fn();
      const onConfirm = jest.fn();
      
      renderWithTheme(
        <ConfirmationDialog
          isOpen={true}
          message="Are you sure you want to proceed?"
          onClose={onClose}
          onConfirm={onConfirm}
          loading={true}
        />
      );
      
      // The Button component shows "Loading..." when in loading state
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
    
    it('prevents closing via backdrop when loading', () => {
      const onClose = jest.fn();
      const onConfirm = jest.fn();
      
      renderWithTheme(
        <ConfirmationDialog
          isOpen={true}
          message="Are you sure you want to proceed?"
          onClose={onClose}
          onConfirm={onConfirm}
          loading={true}
        />
      );
      
      // Find the overlay backdrop and click it
      const overlays = document.querySelectorAll('div');
      const overlay = Array.from(overlays).find(el => 
        el.getAttribute('role') !== 'dialog' && 
        el.contains(screen.getByText('Confirm Action'))
      );
      
      if (overlay) {
        fireEvent.click(overlay);
        expect(onClose).not.toHaveBeenCalled();
      } else {
        throw new Error("Couldn't find overlay element");
      }
    });
  });
  
  // Hook Tests
  describe('useConfirmationDialog Hook', () => {
    // Test wrapper component that uses the hook
    const TestComponent = () => {
      const { openConfirmationDialog, closeConfirmationDialog, ConfirmationDialog: ConfirmationDialogComponent } = useConfirmationDialog();
      
      const handleOpenDialog = () => {
        openConfirmationDialog({
          title: 'Hook Test',
          message: 'This dialog was opened using the hook',
          onConfirm: () => {},
        });
      };
      
      return (
        <div>
          <button onClick={handleOpenDialog}>Open Dialog</button>
          <button onClick={closeConfirmationDialog}>Close Dialog</button>
          <ConfirmationDialogComponent />
        </div>
      );
    };
    
    it('opens dialog when openConfirmationDialog is called', async () => {
      renderWithTheme(<TestComponent />);
      
      // Initially dialog should not be visible
      expect(screen.queryByText('Hook Test')).not.toBeInTheDocument();
      
      // Open the dialog
      fireEvent.click(screen.getByText('Open Dialog'));
      
      // Now dialog should be visible
      expect(screen.getByText('Hook Test')).toBeInTheDocument();
      expect(screen.getByText('This dialog was opened using the hook')).toBeInTheDocument();
    });
    
    it('closes dialog when closeConfirmationDialog is called', async () => {
      renderWithTheme(<TestComponent />);
      
      // Open the dialog
      fireEvent.click(screen.getByText('Open Dialog'));
      expect(screen.getByText('Hook Test')).toBeInTheDocument();
      
      // Close the dialog
      fireEvent.click(screen.getByText('Close Dialog'));
      
      // Wait for dialog to close
      await waitFor(() => {
        expect(screen.queryByText('Hook Test')).not.toBeInTheDocument();
      });
    });
  });
}); 