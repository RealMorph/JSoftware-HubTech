import React, { useCallback, useEffect, useState, useRef } from 'react';
import styled from '@emotion/styled';
import { keyframes, css } from '@emotion/react';
import { Theme } from '@emotion/react';
import { getThemeValue } from '../../core/theme/styled';
import { FocusTrap } from '../utils/FocusTrap';

// Types for modal props
export type ModalSize = 'small' | 'medium' | 'large' | 'full';
export type ModalPosition = 'center' | 'top' | 'right' | 'bottom' | 'left';
export type ModalAnimation = 'fade' | 'slide' | 'scale' | 'none';

export interface ModalProps {
  /**
   * Whether the modal is visible
   */
  isOpen: boolean;
  
  /**
   * Function to call when the modal should close
   */
  onClose: () => void;
  
  /**
   * Title of the modal
   */
  title?: React.ReactNode;
  
  /**
   * Content of the modal
   */
  children: React.ReactNode;
  
  /**
   * Footer content, typically action buttons
   */
  footer?: React.ReactNode;
  
  /**
   * Size of the modal
   * @default 'medium'
   */
  size?: ModalSize;
  
  /**
   * Position of the modal
   * @default 'center'
   */
  position?: ModalPosition;
  
  /**
   * Animation style for the modal
   * @default 'fade'
   */
  animation?: ModalAnimation;
  
  /**
   * Whether to close the modal when clicking the backdrop
   * @default true
   */
  closeOnBackdropClick?: boolean;
  
  /**
   * Whether to close the modal when pressing the Escape key
   * @default true
   */
  closeOnEsc?: boolean;
  
  /**
   * Additional class name for the modal
   */
  className?: string;
  
  /**
   * ID for the modal (used for accessibility)
   */
  id?: string;
  
  /**
   * ARIA label for the modal (used for accessibility when title is not provided)
   */
  ariaLabel?: string;
  
  /**
   * ARIA description for the modal (used for accessibility)
   */
  ariaDescription?: string;
}

// Utility for size-based widths
const getModalWidth = (size: ModalSize): string => {
  switch (size) {
    case 'small': return '400px';
    case 'medium': return '600px';
    case 'large': return '800px';
    case 'full': return '95%';
    default: return '600px';
  }
};

// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const slideIn = keyframes`
  from { transform: translateY(-50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const slideOut = keyframes`
  from { transform: translateY(0); opacity: 1; }
  to { transform: translateY(-50px); opacity: 0; }
`;

const scaleIn = keyframes`
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`;

const scaleOut = keyframes`
  from { transform: scale(1); opacity: 1; }
  to { transform: scale(0.9); opacity: 0; }
`;

// Helper for theme values
const themeValue = (path: string, defaultValue?: string) => {
  return (props: { theme: Theme }) => {
    const value = getThemeValue(props.theme, path);
    return value || defaultValue || '';
  };
};

// Styled components
interface ModalOverlayProps {
  isOpen: boolean;
  isClosing: boolean;
}

const ModalOverlay = styled.div<ModalOverlayProps>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${props => (props.isOpen ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: ${props => props.isClosing ? css`${fadeOut} 0.2s ease-in-out` : css`${fadeIn} 0.2s ease-in-out`};
`;

interface ModalContainerProps {
  size: ModalSize;
  position: ModalPosition;
  animation: ModalAnimation;
  isClosing: boolean;
}

const ModalContainer = styled.div<ModalContainerProps>`
  background-color: ${themeValue('colors.background.default', '#ffffff')};
  border-radius: ${themeValue('borders.radius.medium', '4px')};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: ${props => getModalWidth(props.size)};
  max-width: 95%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  
  ${props => {
    // Position styling
    switch (props.position) {
      case 'top':
        return 'margin-top: 5vh; align-self: flex-start;';
      case 'bottom':
        return 'margin-bottom: 5vh; align-self: flex-end;';
      case 'left':
        return 'margin-left: 5vw; align-self: flex-start; height: 80vh;';
      case 'right':
        return 'margin-right: 5vw; align-self: flex-end; height: 80vh;';
      default:
        return '';
    }
  }}
  
  ${props => {
    // Animation styling
    if (props.animation === 'none') return '';
    
    const getAnimation = () => {
      switch (props.animation) {
        case 'fade':
          return props.isClosing ? fadeOut : fadeIn;
        case 'slide':
          return props.isClosing ? slideOut : slideIn;
        case 'scale':
          return props.isClosing ? scaleOut : scaleIn;
        default:
          return fadeIn;
      }
    };
    
    return css`animation: ${getAnimation()} 0.2s ease-in-out;`;
  }}
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid ${themeValue('colors.border.light', '#e0e0e0')};
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: ${themeValue('typography.scale.lg', '18px')};
  font-weight: ${themeValue('typography.weights.medium', '500')};
  color: ${themeValue('colors.text.primary', '#333333')};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${themeValue('colors.text.secondary', '#666666')};
  transition: color 0.2s;
  
  &:hover {
    color: ${themeValue('colors.text.primary', '#333333')};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${themeValue('colors.primary.main', '#0066cc')};
    border-radius: 4px;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
  overflow-y: auto;
  flex: 1;
  color: ${themeValue('colors.text.primary', '#333333')};
`;

const ModalFooter = styled.div`
  padding: 16px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid ${themeValue('colors.border.light', '#e0e0e0')};
`;

/**
 * Modal/Dialog component for displaying content in an overlay with various sizes, positions, and animations.
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'medium',
  position = 'center',
  animation = 'fade',
  closeOnBackdropClick = true,
  closeOnEsc = true,
  className,
  id,
  ariaLabel,
  ariaDescription,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(isOpen);
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Handle modal closing with animation
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setIsVisible(false);
      onClose();
    }, 200); // Match animation duration
  }, [onClose]);
  
  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      handleClose();
    }
  }, [closeOnBackdropClick, handleClose]);
  
  // Handle Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (closeOnEsc && e.key === 'Escape' && isVisible) {
        handleClose();
      }
    };
    
    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeOnEsc, isVisible, handleClose]);
  
  // Handle body scroll locking
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // If the modal is not visible at all, don't render anything
  if (!isOpen && !isVisible) {
    return null;
  }
  
  return (
    <ModalOverlay 
      isOpen={isVisible} 
      isClosing={isClosing}
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? `modal-title-${id}` : undefined}
      aria-describedby={ariaDescription ? `modal-desc-${id}` : undefined}
      aria-label={!title ? ariaLabel : undefined}
    >
      <FocusTrap active={isVisible}>
        <ModalContainer
          ref={modalRef}
          size={size}
          position={position}
          animation={animation}
          isClosing={isClosing}
          className={className}
          id={id}
        >
          {title && (
            <ModalHeader>
              <ModalTitle id={id ? `modal-title-${id}` : undefined}>
                {title}
              </ModalTitle>
              <CloseButton 
                onClick={handleClose}
                aria-label="Close modal"
              >
                ✕
              </CloseButton>
            </ModalHeader>
          )}
          
          <ModalBody id={ariaDescription ? `modal-desc-${id}` : undefined}>
            {children}
          </ModalBody>
          
          {footer && (
            <ModalFooter>
              {footer}
            </ModalFooter>
          )}
        </ModalContainer>
      </FocusTrap>
    </ModalOverlay>
  );
};

export default Modal; 