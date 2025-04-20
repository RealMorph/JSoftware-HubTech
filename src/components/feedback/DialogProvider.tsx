import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useConfirmationDialog, ConfirmationDialogProps } from './ConfirmationDialog';
import { useFormDialog, FormDialogProps } from './FormDialog';

// Interface for the DialogContext
interface DialogContextValue {
  /**
   * Open a confirmation dialog
   */
  confirm: (props: Omit<ConfirmationDialogProps, 'isOpen' | 'onClose'>) => void;
  
  /**
   * Open a form dialog
   */
  form: (props: Omit<FormDialogProps, 'isOpen' | 'onClose'>) => void;
  
  /**
   * Close all dialogs
   */
  closeAll: () => void;
}

// Create the context
const DialogContext = createContext<DialogContextValue | undefined>(undefined);

/**
 * Props for the DialogProvider component
 */
interface DialogProviderProps {
  children: ReactNode;
}

/**
 * Provider component that manages all dialog instances
 */
export const DialogProvider: React.FC<DialogProviderProps> = ({ children }) => {
  // Use the hooks for individual dialog types
  const {
    openConfirmationDialog,
    closeConfirmationDialog,
    ConfirmationDialog,
  } = useConfirmationDialog();
  
  const {
    openFormDialog,
    closeFormDialog,
    FormDialog,
  } = useFormDialog();
  
  // Track open dialogs with a counter
  const [openDialogCount, setOpenDialogCount] = useState(0);
  
  /**
   * Open a confirmation dialog
   */
  const confirm = (props: Omit<ConfirmationDialogProps, 'isOpen' | 'onClose'>) => {
    // Wrap the onConfirm function to update the open dialog count
    const wrappedOnConfirm = () => {
      props.onConfirm();
      setOpenDialogCount(prev => Math.max(0, prev - 1));
    };
    
    // Wrap the onCancel function if it exists
    const wrappedOnCancel = props.onCancel 
      ? () => {
          props.onCancel?.();
          setOpenDialogCount(prev => Math.max(0, prev - 1));
        }
      : undefined;
    
    setOpenDialogCount(prev => prev + 1);
    openConfirmationDialog({
      ...props,
      onConfirm: wrappedOnConfirm,
      onCancel: wrappedOnCancel,
    });
  };
  
  /**
   * Open a form dialog
   */
  const form = (props: Omit<FormDialogProps, 'isOpen' | 'onClose'>) => {
    // Wrap the onSubmit function to update the open dialog count
    const wrappedOnSubmit = (e: React.FormEvent) => {
      const result = props.onSubmit(e);
      if (result instanceof Promise) {
        return result.finally(() => {
          setOpenDialogCount(prev => Math.max(0, prev - 1));
        });
      } else {
        setOpenDialogCount(prev => Math.max(0, prev - 1));
        return result;
      }
    };
    
    // Wrap the onCancel function if it exists
    const wrappedOnCancel = props.onCancel 
      ? () => {
          props.onCancel?.();
          setOpenDialogCount(prev => Math.max(0, prev - 1));
        }
      : undefined;
    
    setOpenDialogCount(prev => prev + 1);
    openFormDialog({
      ...props,
      onSubmit: wrappedOnSubmit,
      onCancel: wrappedOnCancel,
    });
  };
  
  /**
   * Close all open dialogs
   */
  const closeAll = () => {
    closeConfirmationDialog();
    closeFormDialog();
    setOpenDialogCount(0);
  };
  
  // Create the context value
  const contextValue: DialogContextValue = {
    confirm,
    form,
    closeAll,
  };
  
  return (
    <DialogContext.Provider value={contextValue}>
      {children}
      <ConfirmationDialog />
      <FormDialog />
    </DialogContext.Provider>
  );
};

/**
 * Hook to use the dialog context
 */
export const useDialog = (): DialogContextValue => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};

/**
 * Utility function for quick confirmation dialogs
 */
export const showConfirmation = (
  message: string,
  onConfirm: () => void,
  options?: Partial<Omit<ConfirmationDialogProps, 'isOpen' | 'onClose' | 'message' | 'onConfirm'>>,
) => {
  const { confirm } = useDialog();
  confirm({
    message,
    onConfirm,
    ...options,
  });
};

/**
 * Utility function for quick form dialogs
 */
export const showFormDialog = (
  title: string,
  children: ReactNode,
  onSubmit: (e: React.FormEvent) => void | Promise<void>,
  options?: Partial<Omit<FormDialogProps, 'isOpen' | 'onClose' | 'children' | 'onSubmit' | 'title'>>,
) => {
  const { form } = useDialog();
  form({
    title,
    children,
    onSubmit,
    ...options,
  });
}; 