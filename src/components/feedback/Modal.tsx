import React, { useCallback, useEffect, useState, useRef } from 'react';
import styled from '@emotion/styled';
import { keyframes, css } from '@emotion/react';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';
import { FocusTrap } from '../utils/FocusTrap';

// Types for modal props
export type ModalSize = 'small' | 'medium' | 'large' | 'full';
export type ModalPosition = 'center' | 'top' | 'right' | 'bottom' | 'left';
export type ModalAnimation = 'fade' | 'slide' | 'scale' | 'none';

// Theme styles interface
interface ThemeStyles {
  colors: {
    background: {
      default: string;
    };
    text: {
      primary: string;
      secondary: string;
    };
    border: {
      primary: string;
    };
  };
  borders: {
    radius: {
      medium: string;
    };
  };
  spacing: {
    2: string;
    3: string;
    4: string;
    5: string;
  };
  typography: {
    scale: {
      xl: string;
    };
    weights: {
      semibold: string;
    };
  };
}

// Function to create theme styles from theme context
const createThemeStyles = (themeContext: ReturnType<typeof useDirectTheme>): ThemeStyles => {
  return {
    colors: {
      background: {
        default: themeContext.getColor('background.default', '#ffffff'),
      },
      text: {
        primary: themeContext.getColor('text.primary', '#374151'),
        secondary: themeContext.getColor('text.secondary', '#6b7280'),
      },
      border: {
        primary: themeContext.getColor('border.primary', '#e5e7eb'),
      },
    },
    borders: {
      radius: {
        medium: themeContext.getBorderRadius('medium', '4px'),
      },
    },
    spacing: {
      2: themeContext.getSpacing('2', '0.5rem'),
      3: themeContext.getSpacing('3', '0.75rem'),
      4: themeContext.getSpacing('4', '1rem'),
      5: themeContext.getSpacing('5', '1.25rem'),
    },
    typography: {
      scale: {
        xl: String(themeContext.getTypography('scale.xl', '1.25rem')),
      },
      weights: {
        semibold: String(themeContext.getTypography('weights.semibold', '600')),
      },
    },
  };
};

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
    case 'small':
      return '400px';
    case 'medium':
      return '600px';
    case 'large':
      return '800px';
    case 'full':
      return '95%';
    default:
      return '600px';
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
  animation: ${props =>
    props.isClosing
      ? css`
          ${fadeOut} 0.2s ease-in-out
        `
      : css`
          ${fadeIn} 0.2s ease-in-out
        `};
`;

interface ModalContainerProps {
  size: ModalSize;
  position: ModalPosition;
  animation: ModalAnimation;
  isClosing: boolean;
  $themeStyles: ThemeStyles;
}

const ModalContainer = styled.div<ModalContainerProps>`
  background-color: ${props => props.$themeStyles.colors.background.default};
  border-radius: ${props => props.$themeStyles.borders.radius.medium};
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
        case 'slide':
          return props.isClosing ? slideOut : slideIn;
        case 'scale':
          return props.isClosing ? scaleOut : scaleIn;
        case 'fade':
        default:
          return props.isClosing ? fadeOut : fadeIn;
      }
    };

    return css`
      animation: ${getAnimation()} 0.3s ease-in-out;
    `;
  }}
`;

const ModalHeader = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.$themeStyles.spacing[4]};
  border-bottom: 1px solid ${props => props.$themeStyles.colors.border.primary};
`;

const ModalTitle = styled.h2<{ $themeStyles: ThemeStyles }>`
  margin: 0;
  font-size: ${props => props.$themeStyles.typography.scale.xl};
  font-weight: ${props => props.$themeStyles.typography.weights.semibold};
  color: ${props => props.$themeStyles.colors.text.primary};
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;

  &:hover {
    opacity: 0.7;
  }

  &:focus {
    outline: none;
    opacity: 0.7;
  }
`;

const ModalBody = styled.div<{ $themeStyles: ThemeStyles }>`
  flex: 1;
  padding: ${props => props.$themeStyles.spacing[4]};
  overflow-y: auto;
`;

const ModalFooter = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  justify-content: flex-end;
  padding: ${props => props.$themeStyles.spacing[3]} ${props => props.$themeStyles.spacing[4]};
  border-top: 1px solid ${props => props.$themeStyles.colors.border.primary};

  & > * + * {
    margin-left: ${props => props.$themeStyles.spacing[2]};
  }
`;

/**
 * Modal component for displaying content in an overlay
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
  const modalRef = useRef<HTMLDivElement>(null);
  const [isInDom, setIsInDom] = useState(isOpen);
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);

  // Handle closing animation
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
      setIsInDom(false);
    }, 200); // Match animation duration
  }, [onClose]);

  // Handle escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (closeOnEsc && e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      setIsInDom(true);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    } else {
      document.body.style.overflow = ''; // Restore scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = ''; // Ensure scrolling is restored
    };
  }, [isOpen, closeOnEsc, handleClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isInDom) return null;

  return (
    <ModalOverlay isOpen={isOpen} isClosing={isClosing} onClick={handleBackdropClick}>
      <FocusTrap active={isOpen}>
        <ModalContainer
          ref={modalRef}
          size={size}
          position={position}
          animation={animation}
          isClosing={isClosing}
          className={className}
          id={id}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? `modal-title-${id}` : undefined}
          aria-label={!title ? ariaLabel : undefined}
          aria-describedby={ariaDescription ? `modal-desc-${id}` : undefined}
          $themeStyles={themeStyles}
        >
          {title && (
            <ModalHeader $themeStyles={themeStyles}>
              <ModalTitle id={`modal-title-${id}`} $themeStyles={themeStyles}>
                {title}
              </ModalTitle>
              <CloseButton aria-label="Close modal" onClick={handleClose}>
                ×
              </CloseButton>
            </ModalHeader>
          )}

          <ModalBody $themeStyles={themeStyles}>
            {ariaDescription && (
              <div id={`modal-desc-${id}`} className="sr-only">
                {ariaDescription}
              </div>
            )}
            {children}
          </ModalBody>

          {footer && <ModalFooter $themeStyles={themeStyles}>{footer}</ModalFooter>}
        </ModalContainer>
      </FocusTrap>
    </ModalOverlay>
  );
};

export default Modal;
