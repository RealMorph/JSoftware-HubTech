import React, { useMemo } from 'react';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

// Types
export interface PaginationProps {
  /** Total number of pages */
  totalPages: number;
  /** Current active page (1-based) */
  currentPage: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Number of pages to show before and after the current page */
  siblingCount?: number;
  /** Whether to show the first and last page buttons */
  showFirstLast?: boolean;
  /** Whether to show the previous and next page buttons */
  showPrevNext?: boolean;
  /** Whether to show the page numbers */
  showPageNumbers?: boolean;
  /** Text for the previous page button */
  prevLabel?: React.ReactNode;
  /** Text for the next page button */
  nextLabel?: React.ReactNode;
  /** Text for the first page button */
  firstLabel?: React.ReactNode;
  /** Text for the last page button */
  lastLabel?: React.ReactNode;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Shape variant */
  shape?: 'rounded' | 'square' | 'circular';
  /** CSS class name */
  className?: string;
}

// Theme styles interface
interface ThemeStyles {
  colors: {
    primary: {
      main: string;
      light: string;
      dark: string;
      contrastText: string;
    };
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
    background: {
      paper: string;
      default: string;
      hover: string;
    };
    border: {
      main: string;
      light: string;
      dark: string;
    };
    focus: {
      ring: string;
    };
  };
  typography: {
    family: string;
    size: {
      small: string;
      medium: string;
      large: string;
    };
    weight: {
      normal: number;
      medium: number;
      bold: number;
    };
    lineHeight: {
      normal: number;
    };
  };
  spacing: {
    button: {
      small: string;
      medium: string;
      large: string;
    };
    padding: {
      small: string;
      medium: string;
      large: string;
    };
    gap: string;
  };
  borders: {
    width: {
      thin: string;
      normal: string;
    };
    radius: {
      none: string;
      small: string;
      medium: string;
      full: string;
    };
    style: {
      solid: string;
    };
  };
  animation: {
    duration: {
      short: string;
      normal: string;
    };
    easing: {
      easeInOut: string;
    };
  };
  states: {
    opacity: {
      disabled: number;
    };
    hover: {
      opacity: number;
    };
  };
}

// Function to create theme styles from DirectTheme
function createThemeStyles(theme: ReturnType<typeof useDirectTheme>): ThemeStyles {
  return {
    colors: {
      primary: {
        main: theme.getColor('primary.main', '#1976d2'),
        light: theme.getColor('primary.light', '#4791db'),
        dark: theme.getColor('primary.dark', '#115293'),
        contrastText: theme.getColor('primary.contrastText', '#ffffff'),
      },
      text: {
        primary: theme.getColor('text.primary', '#333333'),
        secondary: theme.getColor('text.secondary', '#666666'),
        disabled: theme.getColor('text.disabled', '#999999'),
      },
      background: {
        paper: theme.getColor('background.paper', '#ffffff'),
        default: theme.getColor('background.default', '#f5f5f5'),
        hover: theme.getColor('background.hover', '#f0f0f0'),
      },
      border: {
        main: theme.getColor('border.main', '#e0e0e0'),
        light: theme.getColor('border.light', '#f0f0f0'),
        dark: theme.getColor('border.dark', '#cccccc'),
      },
      focus: {
        ring: theme.getColor('primary.main', '#1976d2') + '33',
      },
    },
    typography: {
      family: String(theme.getTypography('family.base', 'system-ui')),
      size: {
        small: String(theme.getTypography('scale.sm', '12px')),
        medium: String(theme.getTypography('scale.base', '14px')),
        large: String(theme.getTypography('scale.lg', '16px')),
      },
      weight: {
        normal: Number(theme.getTypography('weights.normal', 400)),
        medium: Number(theme.getTypography('weights.medium', 500)),
        bold: Number(theme.getTypography('weights.bold', 700)),
      },
      lineHeight: {
        normal: 1.5,
      },
    },
    spacing: {
      button: {
        small: theme.getSpacing('7', '28px'),
        medium: theme.getSpacing('9', '36px'),
        large: theme.getSpacing('10', '40px'),
      },
      padding: {
        small: theme.getSpacing('1', '4px'),
        medium: theme.getSpacing('2', '8px'),
        large: theme.getSpacing('3', '12px'),
      },
      gap: theme.getSpacing('1', '4px'),
    },
    borders: {
      width: {
        thin: '1px',
        normal: '2px',
      },
      radius: {
        none: '0',
        small: theme.getBorderRadius('sm', '4px'),
        medium: theme.getBorderRadius('md', '6px'),
        full: '50%',
      },
      style: {
        solid: 'solid',
      },
    },
    animation: {
      duration: {
        short: '150ms',
        normal: '200ms',
      },
      easing: {
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
    states: {
      opacity: {
        disabled: 0.5,
      },
      hover: {
        opacity: 0.8,
      },
    },
  };
}

// Styled components
const PaginationContainer = styled.nav<{ $themeStyles: ThemeStyles }>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${props => props.$themeStyles.typography.family};
`;

const PaginationList = styled.ul<{ $themeStyles: ThemeStyles }>`
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: ${props => props.$themeStyles.spacing.gap};
`;

const PageItem = styled.li`
  display: flex;
`;

// Type for button props
interface PageButtonProps {
  variant?: 'default' | 'active' | 'ellipsis';
  size?: 'small' | 'medium' | 'large';
  shape?: 'rounded' | 'square' | 'circular';
  disabled?: boolean;
  $themeStyles: ThemeStyles;
}

const PageButton = styled.button<PageButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: ${props => props.$themeStyles.spacing.button[props.size || 'medium']};
  height: ${props => props.$themeStyles.spacing.button[props.size || 'medium']};
  padding: 0 ${props => props.$themeStyles.spacing.padding[props.size || 'medium']};
  border: ${props => props.$themeStyles.borders.width.thin} ${props => props.$themeStyles.borders.style.solid};
  border-color: ${props =>
    props.variant === 'active'
      ? props.$themeStyles.colors.primary.main
      : props.$themeStyles.colors.border.main};
  background-color: ${props => {
    if (props.variant === 'active') return props.$themeStyles.colors.primary.main;
    if (props.variant === 'ellipsis') return 'transparent';
    return props.$themeStyles.colors.background.paper;
  }};
  color: ${props => {
    if (props.variant === 'active') return props.$themeStyles.colors.primary.contrastText;
    if (props.disabled) return props.$themeStyles.colors.text.disabled;
    return props.$themeStyles.colors.text.primary;
  }};
  font-size: ${props => props.$themeStyles.typography.size[props.size || 'medium']};
  font-weight: ${props => props.$themeStyles.typography.weight.normal};
  line-height: ${props => props.$themeStyles.typography.lineHeight.normal};
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  transition: all ${props => props.$themeStyles.animation.duration.normal} ${props => props.$themeStyles.animation.easing.easeInOut};
  border-radius: ${props => {
    switch (props.shape) {
      case 'circular':
        return props.$themeStyles.borders.radius.full;
      case 'square':
        return props.$themeStyles.borders.radius.none;
      default:
        return props.$themeStyles.borders.radius.small;
    }
  }};

  &:hover:not(:disabled) {
    background-color: ${props =>
      props.variant === 'active'
        ? props.$themeStyles.colors.primary.light
        : props.$themeStyles.colors.background.hover};
    border-color: ${props =>
      props.variant === 'active'
        ? props.$themeStyles.colors.primary.light
        : props.$themeStyles.colors.border.dark};
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px ${props => props.$themeStyles.colors.focus.ring};
  }

  &:disabled {
    opacity: ${props => props.$themeStyles.states.opacity.disabled};
  }
`;

/**
 * Pagination component for navigating through pages
 */
export const Pagination: React.FC<PaginationProps> = ({
  totalPages,
  currentPage,
  onPageChange,
  siblingCount = 1,
  showFirstLast = true,
  showPrevNext = true,
  showPageNumbers = true,
  prevLabel = '‹',
  nextLabel = '›',
  firstLabel = '«',
  lastLabel = '»',
  size = 'medium',
  shape = 'rounded',
  className,
}) => {
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);

  // Generate array of page numbers to display
  const pageNumbers = useMemo(() => {
    // Function to create a range of numbers
    const range = (start: number, end: number) => {
      const length = end - start + 1;
      return Array.from({ length }, (_, i) => start + i);
    };

    // Calculate the range of pages to show
    const totalPageNumbers = siblingCount * 2 + 3; // siblings + current + first + last

    // If we have enough space to show all pages
    if (totalPageNumbers >= totalPages) {
      return range(1, totalPages);
    }

    // Calculate sibling indexes and add ellipsis
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    // Case 1: Show right dots only
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = range(1, leftItemCount);
      return [...leftRange, -1, totalPages];
    }

    // Case 2: Show left dots only
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = range(totalPages - rightItemCount + 1, totalPages);
      return [1, -1, ...rightRange];
    }

    // Case 3: Show both dots
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [1, -1, ...middleRange, -2, totalPages];
    }

    return [];
  }, [currentPage, siblingCount, totalPages]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <PaginationContainer className={className} $themeStyles={themeStyles}>
      <PaginationList $themeStyles={themeStyles}>
        {/* First page button */}
        {showFirstLast && (
          <PageItem>
            <PageButton
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              size={size}
              shape={shape}
              $themeStyles={themeStyles}
              aria-label="Go to first page"
            >
              {firstLabel}
            </PageButton>
          </PageItem>
        )}

        {/* Previous page button */}
        {showPrevNext && (
          <PageItem>
            <PageButton
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              size={size}
              shape={shape}
              $themeStyles={themeStyles}
              aria-label="Go to previous page"
            >
              {prevLabel}
            </PageButton>
          </PageItem>
        )}

        {/* Page numbers */}
        {showPageNumbers &&
          pageNumbers.map((pageNumber, i) => (
            <PageItem key={pageNumber < 0 ? `ellipsis-${pageNumber}-${i}` : pageNumber}>
              {pageNumber < 0 ? (
                <PageButton
                  variant="ellipsis"
                  size={size}
                  shape={shape}
                  $themeStyles={themeStyles}
                  disabled
                >
                  &hellip;
                </PageButton>
              ) : (
                <PageButton
                  onClick={() => handlePageChange(pageNumber)}
                  variant={pageNumber === currentPage ? 'active' : 'default'}
                  size={size}
                  shape={shape}
                  $themeStyles={themeStyles}
                  aria-label={`Go to page ${pageNumber}`}
                  aria-current={pageNumber === currentPage ? 'page' : undefined}
                >
                  {pageNumber}
                </PageButton>
              )}
            </PageItem>
          ))}

        {/* Next page button */}
        {showPrevNext && (
          <PageItem>
            <PageButton
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              size={size}
              shape={shape}
              $themeStyles={themeStyles}
              aria-label="Go to next page"
            >
              {nextLabel}
            </PageButton>
          </PageItem>
        )}

        {/* Last page button */}
        {showFirstLast && (
          <PageItem>
            <PageButton
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              size={size}
              shape={shape}
              $themeStyles={themeStyles}
              aria-label="Go to last page"
            >
              {lastLabel}
            </PageButton>
          </PageItem>
        )}
      </PaginationList>
    </PaginationContainer>
  );
};
