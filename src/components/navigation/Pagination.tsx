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
  fontFamily: string;
  primaryColor: string;
  primaryContrastText: string;
  primaryLightColor: string;
  textPrimaryColor: string;
  textDisabledColor: string;
  borderColor: string;
  borderDarkColor: string;
  borderLightColor: string;
  backgroundColor: string;
  grayColor: string;
}

// Function to create theme styles from DirectTheme
function createThemeStyles(theme: ReturnType<typeof useDirectTheme>): ThemeStyles {
  const { getColor, getTypography } = theme;

  return {
    fontFamily: getTypography('family.primary', 'system-ui') as string,
    primaryColor: getColor('primary.main', '#1976d2'),
    primaryContrastText: getColor('primary.contrastText', '#ffffff'),
    primaryLightColor: getColor('primary.light', '#4791db'),
    textPrimaryColor: getColor('text.primary', '#333333'),
    textDisabledColor: getColor('text.disabled', '#999999'),
    borderColor: getColor('border.main', '#e0e0e0'),
    borderDarkColor: getColor('border.dark', '#cccccc'),
    borderLightColor: getColor('border.light', '#f0f0f0'),
    backgroundColor: getColor('background.paper', '#ffffff'),
    grayColor: getColor('gray.100', '#f5f5f5'),
  };
}

// Styled components
const PaginationContainer = styled.nav<{ $themeStyles: ThemeStyles }>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${props => props.$themeStyles.fontFamily};
`;

const PaginationList = styled.ul`
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 4px;
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
  min-width: ${props => {
    switch (props.size) {
      case 'small':
        return '28px';
      case 'large':
        return '40px';
      default:
        return '36px';
    }
  }};
  height: ${props => {
    switch (props.size) {
      case 'small':
        return '28px';
      case 'large':
        return '40px';
      default:
        return '36px';
    }
  }};
  padding: 0 ${props => (props.size === 'small' ? '4px' : '8px')};
  border: 1px solid;
  border-color: ${props => {
    if (props.variant === 'active') {
      return props.$themeStyles.primaryColor;
    }
    return props.$themeStyles.borderColor;
  }};
  background-color: ${props => {
    if (props.variant === 'active') {
      return props.$themeStyles.primaryColor;
    } else if (props.variant === 'ellipsis') {
      return 'transparent';
    }
    return props.$themeStyles.backgroundColor;
  }};
  color: ${props => {
    if (props.variant === 'active') {
      return props.$themeStyles.primaryContrastText;
    } else if (props.disabled) {
      return props.$themeStyles.textDisabledColor;
    }
    return props.$themeStyles.textPrimaryColor;
  }};
  font-size: ${props => {
    switch (props.size) {
      case 'small':
        return '12px';
      case 'large':
        return '16px';
      default:
        return '14px';
    }
  }};
  font-weight: ${props => (props.variant === 'active' ? 'bold' : 'normal')};
  cursor: ${props => (props.disabled || props.variant === 'ellipsis' ? 'default' : 'pointer')};
  border-radius: ${props => {
    switch (props.shape) {
      case 'square':
        return '0';
      case 'circular':
        return '50%';
      default:
        return '4px';
    }
  }};
  transition: all 0.2s ease;

  &:hover {
    ${props =>
      !props.disabled &&
      props.variant !== 'ellipsis' &&
      props.variant !== 'active' &&
      `
      background-color: ${props.$themeStyles.grayColor};
      border-color: ${props.$themeStyles.borderDarkColor};
    `}
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${props => props.$themeStyles.primaryLightColor};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    border-color: ${props => props.$themeStyles.borderLightColor};
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
      <PaginationList>
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
