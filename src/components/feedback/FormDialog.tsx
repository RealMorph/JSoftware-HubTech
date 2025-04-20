import React, { useState, ReactNode } from 'react';
import { Modal, ModalProps } from './Modal';
import { Button } from '../base/Button';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

export interface FormDialogProps extends Omit<ModalProps, 'footer'> {
  /**
   * Submit button text
   * @default 'Submit'
   */
  submitText?: string;
  
  /**
   * Cancel button text
   * @default 'Cancel'
   */
  cancelText?: string;
  
  /**
   * Function called when the form is submitted
   * If it returns a promise, the dialog will show a loading state until the promise resolves
   */
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  
  /**
   * Function called when the form is cancelled
   * Default behavior is to close the dialog
   */
  onCancel?: () => void;
  
  /**
   * Whether the form is in a loading state (e.g., during async operations)
   * @default false
   */
  isSubmitting?: boolean;
  
  /**
   * Whether to disable form fields during submission
   * @default true
   */
  disableOnSubmit?: boolean;

  /**
   * Error message to display if form submission fails
   */
  errorMessage?: string;
  
  /**
   * Whether to show the form error (if any)
   * @default true
   */
  showError?: boolean;
  
  /**
   * Children content
   */
  children: ReactNode;
}

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const ErrorMessage = styled.div<{ $themeStyles: any }>`
  margin-top: 0.5rem;
  padding: 0.5rem;
  color: ${props => props.$themeStyles.errorColor};
  background-color: ${props => props.$themeStyles.errorBackgroundColor};
  border-radius: ${props => props.$themeStyles.borderRadius};
  font-size: 0.875rem;
  border-left: 3px solid ${props => props.$themeStyles.errorBorderColor};
`;

/**
 * A specialized dialog for handling forms
 */
export const FormDialog: React.FC<FormDialogProps> = ({
  children,
  submitText = 'Submit',
  cancelText = 'Cancel',
  onSubmit,
  onCancel,
  onClose,
  isSubmitting = false,
  disableOnSubmit = true,
  errorMessage,
  showError = true,
  ...modalProps
}) => {
  const theme = useDirectTheme();
  const [internalSubmitting, setInternalSubmitting] = useState(false);
  const [internalError, setInternalError] = useState<string | undefined>(undefined);
  
  // Combine external and internal loading states
  const isLoading = isSubmitting || internalSubmitting;
  
  // Combine external and internal error states
  const error = errorMessage || internalError;
  
  // Handle the cancel action
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setInternalError(undefined);
    
    try {
      setInternalSubmitting(true);
      const result = onSubmit(e);
      
      // If onSubmit returns a promise, wait for it to resolve
      if (result instanceof Promise) {
        await result;
      }
      
      // Close the dialog on successful submission
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        setInternalError(error.message);
      } else {
        setInternalError('An unknown error occurred');
      }
    } finally {
      setInternalSubmitting(false);
    }
  };
  
  // Error message styles from theme
  const errorStyles = {
    errorColor: theme.getColor('error.main', '#DC2626'),
    errorBackgroundColor: theme.getColor('error.light', '#FEE2E2'),
    errorBorderColor: theme.getColor('error.dark', '#B91C1C'),
    borderRadius: theme.getBorderRadius('sm', '0.25rem'),
  };
  
  // Create the dialog footer with action buttons
  const footer = (
    <ButtonContainer>
      <Button 
        variant="ghost" 
        onClick={handleCancel} 
        disabled={isLoading}
        type="button"
      >
        {cancelText}
      </Button>
      <Button 
        variant="primary" 
        type="submit"
        form={modalProps.id ? `form-${modalProps.id}` : undefined}
        disabled={isLoading}
        loading={isLoading}
      >
        {submitText}
      </Button>
    </ButtonContainer>
  );
  
  return (
    <Modal
      footer={footer}
      onClose={!isLoading ? onClose : () => {}}
      closeOnEsc={!isLoading}
      closeOnBackdropClick={!isLoading}
      {...modalProps}
    >
      <FormContainer 
        id={modalProps.id ? `form-${modalProps.id}` : undefined} 
        onSubmit={handleSubmit}
      >
        {/* Form content */}
        {children}
        
        {/* Error message */}
        {showError && error && (
          <ErrorMessage $themeStyles={errorStyles}>
            {error}
          </ErrorMessage>
        )}
      </FormContainer>
    </Modal>
  );
};

// Custom hook for managing form dialog state
export const useFormDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<Partial<Omit<FormDialogProps, 'isOpen' | 'onClose'>>>({
    onSubmit: () => {},
  });
  
  const openFormDialog = (props: Omit<FormDialogProps, 'isOpen' | 'onClose'>) => {
    setConfig(props);
    setIsOpen(true);
  };
  
  const closeFormDialog = () => {
    setIsOpen(false);
  };
  
  const FormDialogComponent = () => (
    config.children ? (
      <FormDialog
        {...(config as Omit<FormDialogProps, 'isOpen' | 'onClose'>)}
        isOpen={isOpen}
        onClose={closeFormDialog}
      />
    ) : null
  );
  
  return {
    openFormDialog,
    closeFormDialog,
    FormDialog: FormDialogComponent,
  };
}; 