import React from 'react';
import { Modal, ModalProps } from './Modal';
import { Button } from '../base/Button';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

export type ConfirmationType = 'info' | 'warning' | 'danger';

export interface ConfirmationDialogProps extends Omit<ModalProps, 'footer' | 'children'> {
  /**
   * The message to display in the dialog
   */
  message: React.ReactNode;
  
  /**
   * The confirm button text
   * @default 'Confirm'
   */
  confirmText?: string;
  
  /**
   * The cancel button text
   * @default 'Cancel'
   */
  cancelText?: string;
  
  /**
   * Function called when the confirm button is clicked
   */
  onConfirm: () => void;
  
  /**
   * Function called when the cancel button is clicked
   * Default behavior is to close the dialog
   */
  onCancel?: () => void;
  
  /**
   * The type of confirmation dialog
   * @default 'info'
   */
  confirmationType?: ConfirmationType;
  
  /**
   * Whether the dialog is in a loading state (e.g., during async operations)
   * @default false
   */
  loading?: boolean;
}

const StyledMessage = styled.div`
  margin-bottom: 1rem;
  white-space: pre-line;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
`;

/**
 * A specialized dialog for confirming user actions
 */
export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  onClose,
  confirmationType = 'info',
  loading = false,
  title = 'Confirm Action',
  ...modalProps
}) => {
  const theme = useDirectTheme();
  
  // Handle the cancel action
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };
  
  // Map confirmation type to button variant and title
  const getConfirmationTypeStyles = () => {
    switch (confirmationType) {
      case 'warning':
        return {
          buttonVariant: 'secondary' as const,
          title: title || 'Warning',
        };
      case 'danger':
        return {
          buttonVariant: 'accent' as const, // Using accent for danger (assuming accent is red/danger)
          title: title || 'Caution',
        };
      case 'info':
      default:
        return {
          buttonVariant: 'primary' as const,
          title: title || 'Confirm Action',
        };
    }
  };
  
  const { buttonVariant, title: derivedTitle } = getConfirmationTypeStyles();
  
  // Create the dialog footer with action buttons
  const footer = (
    <ButtonContainer>
      <Button variant="ghost" onClick={handleCancel} disabled={loading}>
        {cancelText}
      </Button>
      <Button 
        variant={buttonVariant} 
        onClick={onConfirm} 
        disabled={loading}
        loading={loading}
      >
        {confirmText}
      </Button>
    </ButtonContainer>
  );
  
  return (
    <Modal
      title={title || derivedTitle}
      footer={footer}
      onClose={onClose}
      size="small"
      closeOnEsc={!loading}
      closeOnBackdropClick={!loading}
      {...modalProps}
    >
      <StyledMessage>{message}</StyledMessage>
    </Modal>
  );
};

// Custom hook for managing confirmation dialog state
export const useConfirmationDialog = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [config, setConfig] = React.useState<Omit<ConfirmationDialogProps, 'isOpen' | 'onClose'>>({
    message: '',
    onConfirm: () => {},
  });
  
  const openConfirmationDialog = (props: Omit<ConfirmationDialogProps, 'isOpen' | 'onClose'>) => {
    setConfig(props);
    setIsOpen(true);
  };
  
  const closeConfirmationDialog = () => {
    setIsOpen(false);
  };
  
  const ConfirmationDialogComponent = () => (
    <ConfirmationDialog
      {...config}
      isOpen={isOpen}
      onClose={closeConfirmationDialog}
    />
  );
  
  return {
    openConfirmationDialog,
    closeConfirmationDialog,
    ConfirmationDialog: ConfirmationDialogComponent,
  };
}; 