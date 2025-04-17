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
      overlay: string;
      paper: string;
      hover: string;
    };
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
    border: {
      primary: string;
      divider: string;
      hover: string;
    };
    focus: {
      ring: string;
    };
  };
  typography: {
    family: string;
    size: {
      sm: string;
      base: string;
      lg: string;
      xl: string;
      xxl: string;
    };
    weight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      none: number;
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  spacing: {
    container: {
      padding: {
        small: string;
        medium: string;
        large: string;
      };
      gap: string;
    };
    content: {
      padding: {
        x: string;
        y: string;
      };
      gap: string;
    };
    element: {
      padding: {
        small: string;
        medium: string;
        large: string;
      };
    };
  };
  borders: {
    width: {
      thin: string;
      normal: string;
      thick: string;
    };
    radius: {
      none: string;
      small: string;
      medium: string;
      large: string;
      full: string;
    };
    style: {
      solid: string;
      dashed: string;
    };
  };
  shadows: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    inner: string;
  };
  animation: {
    duration: {
      fastest: string;
      fast: string;
      normal: string;
      slow: string;
      slowest: string;
    };
    easing: {
      linear: string;
      easeIn: string;
      easeOut: string;
      easeInOut: string;
    };
    transition: {
      property: {
        common: string;
        colors: string;
        transform: string;
        opacity: string;
      };
    };
  };
  zIndex: {
    modal: number;
    overlay: number;
  };
}

// Function to create theme styles from theme context
const createThemeStyles = (theme: ReturnType<typeof useDirectTheme>): ThemeStyles => {
  return {
    colors: {
      background: {
        default: theme.getColor('background.default', '#ffffff'),
        overlay: theme.getColor('background.overlay', 'rgba(0, 0, 0, 0.5)'),
        paper: theme.getColor('background.paper', '#ffffff'),
        hover: theme.getColor('background.hover', '#f5f5f5'),
      },
      text: {
        primary: theme.getColor('text.primary', '#374151'),
        secondary: theme.getColor('text.secondary', '#6b7280'),
        disabled: theme.getColor('text.disabled', '#9ca3af'),
      },
      border: {
        primary: theme.getColor('border.primary', '#e5e7eb'),
        divider: theme.getColor('border.divider', '#f3f4f6'),
        hover: theme.getColor('border.hover', '#d1d5db'),
      },
      focus: {
        ring: theme.getColor('primary.main', '#3b82f6') + '40',
      },
    },
    typography: {
      family: String(theme.getTypography('family.base', 'system-ui')),
      size: {
        sm: String(theme.getTypography('scale.sm', '0.875rem')),
        base: String(theme.getTypography('scale.base', '1rem')),
        lg: String(theme.getTypography('scale.lg', '1.125rem')),
        xl: String(theme.getTypography('scale.xl', '1.25rem')),
        xxl: String(theme.getTypography('scale.xxl', '1.5rem')),
      },
      weight: {
        normal: Number(theme.getTypography('weights.normal', 400)),
        medium: Number(theme.getTypography('weights.medium', 500)),
        semibold: Number(theme.getTypography('weights.semibold', 600)),
        bold: Number(theme.getTypography('weights.bold', 700)),
      },
      lineHeight: {
        none: 1,
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
      },
    },
    spacing: {
      container: {
        padding: {
          small: theme.getSpacing('4', '1rem'),
          medium: theme.getSpacing('6', '1.5rem'),
          large: theme.getSpacing('8', '2rem'),
        },
        gap: theme.getSpacing('4', '1rem'),
      },
      content: {
        padding: {
          x: theme.getSpacing('6', '1.5rem'),
          y: theme.getSpacing('4', '1rem'),
        },
        gap: theme.getSpacing('3', '0.75rem'),
      },
      element: {
        padding: {
          small: theme.getSpacing('2', '0.5rem'),
          medium: theme.getSpacing('3', '0.75rem'),
          large: theme.getSpacing('4', '1rem'),
        },
      },
    },
    borders: {
      width: {
        thin: '1px',
        normal: '2px',
        thick: '3px',
      },
      radius: {
        none: '0',
        small: theme.getBorderRadius('sm', '0.25rem'),
        medium: theme.getBorderRadius('md', '0.375rem'),
        large: theme.getBorderRadius('lg', '0.5rem'),
        full: '9999px',
      },
      style: {
        solid: 'solid',
        dashed: 'dashed',
      },
    },
    shadows: {
      none: 'none',
      sm: theme.getShadow('sm', '0 1px 2px rgba(0, 0, 0, 0.05)'),
      md: theme.getShadow('md', '0 4px 6px -1px rgba(0, 0, 0, 0.1)'),
      lg: theme.getShadow('lg', '0 10px 15px -3px rgba(0, 0, 0, 0.1)'),
      xl: theme.getShadow('xl', '0 20px 25px -5px rgba(0, 0, 0, 0.1)'),
      inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
    },
    animation: {
      duration: {
        fastest: '100ms',
        fast: '150ms',
        normal: '200ms',
        slow: '300ms',
        slowest: '400ms',
      },
      easing: {
        linear: 'linear',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transition: {
        property: {
          common: 'all',
          colors: 'background-color, border-color, color, fill, stroke',
          transform: 'transform',
          opacity: 'opacity',
        },
      },
    },
    zIndex: {
      modal: 1000,
      overlay: 999,
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

const ModalOverlay = styled.div<ModalOverlayProps & { $themeStyles: ThemeStyles }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.$themeStyles.colors.background.overlay};
  display: ${props => (props.isOpen ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
  z-index: ${props => props.$themeStyles.zIndex.overlay};
  animation: ${props =>
    props.isClosing
      ? css`
          ${fadeOut} ${props.$themeStyles.animation.duration.normal} ${props.$themeStyles.animation.easing.easeIn}
        `
      : css`
          ${fadeIn} ${props.$themeStyles.animation.duration.normal} ${props.$themeStyles.animation.easing.easeOut}
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
  background-color: ${props => props.$themeStyles.colors.background.paper};
  border-radius: ${props => props.$themeStyles.borders.radius.medium};
  box-shadow: ${props => props.$themeStyles.shadows.xl};
  width: ${props => getModalWidth(props.size)};
  max-width: 95%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  position: relative;
  font-family: ${props => props.$themeStyles.typography.family};
  z-index: ${props => props.$themeStyles.zIndex.modal};
  animation: ${props => {
    const { duration, easing } = props.$themeStyles.animation;
    const animationDuration = duration.normal;
    const animationEasing = props.isClosing ? easing.easeIn : easing.easeOut;

    switch (props.animation) {
      case 'fade':
        return props.isClosing
          ? css`${fadeOut} ${animationDuration} ${animationEasing}`
          : css`${fadeIn} ${animationDuration} ${animationEasing}`;
      case 'slide':
        return props.isClosing
          ? css`${slideOut} ${animationDuration} ${animationEasing}`
          : css`${slideIn} ${animationDuration} ${animationEasing}`;
      case 'scale':
        return props.isClosing
          ? css`${scaleOut} ${animationDuration} ${animationEasing}`
          : css`${scaleIn} ${animationDuration} ${animationEasing}`;
      default:
        return 'none';
    }
  }};
`;

const ModalHeader = styled.div<{ $themeStyles: ThemeStyles }>`
  padding: ${props => props.$themeStyles.spacing.content.padding.y} ${props => props.$themeStyles.spacing.content.padding.x};
  border-bottom: ${props => props.$themeStyles.borders.width.thin} ${props => props.$themeStyles.borders.style.solid} ${props => props.$themeStyles.colors.border.divider};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ModalTitle = styled.h2<{ $themeStyles: ThemeStyles }>`
  margin: 0;
  font-size: ${props => props.$themeStyles.typography.size.xl};
  font-weight: ${props => props.$themeStyles.typography.weight.semibold};
  color: ${props => props.$themeStyles.colors.text.primary};
  line-height: ${props => props.$themeStyles.typography.lineHeight.tight};
`;

const CloseButton = styled.button<{ $themeStyles: ThemeStyles }>`
  background: none;
  border: none;
  padding: ${props => props.$themeStyles.spacing.element.padding.small};
  cursor: pointer;
  color: ${props => props.$themeStyles.colors.text.secondary};
  font-size: ${props => props.$themeStyles.typography.size.xl};
  line-height: ${props => props.$themeStyles.typography.lineHeight.none};
  border-radius: ${props => props.$themeStyles.borders.radius.small};
  transition: all ${props => props.$themeStyles.animation.duration.fast} ${props => props.$themeStyles.animation.easing.easeInOut};

  &:hover {
    color: ${props => props.$themeStyles.colors.text.primary};
    background-color: ${props => props.$themeStyles.colors.background.hover};
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px ${props => props.$themeStyles.colors.focus.ring};
  }
`;

const ModalContent = styled.div<{ $themeStyles: ThemeStyles }>`
  padding: ${props => props.$themeStyles.spacing.content.padding.y} ${props => props.$themeStyles.spacing.content.padding.x};
  overflow-y: auto;
  color: ${props => props.$themeStyles.colors.text.primary};
  font-size: ${props => props.$themeStyles.typography.size.base};
  line-height: ${props => props.$themeStyles.typography.lineHeight.normal};
`;

const ModalFooter = styled.div<{ $themeStyles: ThemeStyles }>`
  padding: ${props => props.$themeStyles.spacing.content.padding.y} ${props => props.$themeStyles.spacing.content.padding.x};
  border-top: ${props => props.$themeStyles.borders.width.thin} ${props => props.$themeStyles.borders.style.solid} ${props => props.$themeStyles.colors.border.divider};
  display: flex;
  justify-content: flex-end;
  gap: ${props => props.$themeStyles.spacing.content.gap};
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
    <ModalOverlay isOpen={isOpen} isClosing={isClosing} onClick={handleBackdropClick} $themeStyles={themeStyles}>
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
              <CloseButton aria-label="Close modal" onClick={handleClose} $themeStyles={themeStyles}>
                ×
              </CloseButton>
            </ModalHeader>
          )}

          <ModalContent $themeStyles={themeStyles}>
            {ariaDescription && (
              <div id={`modal-desc-${id}`} className="sr-only">
                {ariaDescription}
              </div>
            )}
            {children}
          </ModalContent>

          {footer && <ModalFooter $themeStyles={themeStyles}>{footer}</ModalFooter>}
        </ModalContainer>
      </FocusTrap>
    </ModalOverlay>
  );
};

export default Modal;
