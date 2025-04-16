import React, { useMemo } from 'react';
import styled from '@emotion/styled';
import { getThemeValue } from '../../core/theme/styled';
import { useTheme } from '../../core/theme/ThemeProvider';
import { ThemeConfig } from '../../core/theme/theme-persistence';

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

// Styled components
const PaginationContainer = styled.nav`
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${props => getThemeValue(props.theme as ThemeConfig, 'typography.family.primary')};
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
}

const PageButton = styled.button<PageButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: ${props => {
    switch (props.size) {
      case 'small': return '28px';
      case 'large': return '40px';
      default: return '36px';
    }
  }};
  height: ${props => {
    switch (props.size) {
      case 'small': return '28px';
      case 'large': return '40px';
      default: return '36px';
    }
  }};
  padding: 0 ${props => props.size === 'small' ? '4px' : '8px'};
  border: 1px solid;
  border-color: ${props => {
    if (props.variant === 'active') {
      return getThemeValue(props.theme as ThemeConfig, 'colors.primary.main');
    }
    return getThemeValue(props.theme as ThemeConfig, 'colors.border.main');
  }};
  background-color: ${props => {
    if (props.variant === 'active') {
      return getThemeValue(props.theme as ThemeConfig, 'colors.primary.main');
    } else if (props.variant === 'ellipsis') {
      return 'transparent';
    }
    return getThemeValue(props.theme as ThemeConfig, 'colors.background.paper');
  }};
  color: ${props => {
    if (props.variant === 'active') {
      return getThemeValue(props.theme as ThemeConfig, 'colors.primary.contrastText');
    } else if (props.disabled) {
      return getThemeValue(props.theme as ThemeConfig, 'colors.text.disabled');
    }
    return getThemeValue(props.theme as ThemeConfig, 'colors.text.primary');
  }};
  font-size: ${props => {
    switch (props.size) {
      case 'small': return '12px';
      case 'large': return '16px';
      default: return '14px';
    }
  }};
  font-weight: ${props => props.variant === 'active' ? 'bold' : 'normal'};
  cursor: ${props => (props.disabled || props.variant === 'ellipsis') ? 'default' : 'pointer'};
  border-radius: ${props => {
    switch (props.shape) {
      case 'square': return '0';
      case 'circular': return '50%';
      default: return '4px';
    }
  }};
  transition: all 0.2s ease;
  
  &:hover {
    ${props => !props.disabled && props.variant !== 'ellipsis' && props.variant !== 'active' && `
      background-color: ${getThemeValue(props.theme as ThemeConfig, 'colors.gray.100')};
      border-color: ${getThemeValue(props.theme as ThemeConfig, 'colors.border.dark')};
    `}
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${props => getThemeValue(props.theme as ThemeConfig, 'colors.primary.light')};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    border-color: ${props => getThemeValue(props.theme as ThemeConfig, 'colors.border.light')};
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
  const { currentTheme } = useTheme();
  
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
    <PaginationContainer className={className} aria-label="Pagination">
      <PaginationList>
        {/* First page button */}
        {showFirstLast && (
          <PageItem>
            <PageButton
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              aria-label="Go to first page"
              size={size}
              shape={shape}
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
              aria-label="Go to previous page"
              size={size}
              shape={shape}
            >
              {prevLabel}
            </PageButton>
          </PageItem>
        )}
        
        {/* Page numbers */}
        {showPageNumbers && pageNumbers.map((pageNumber, index) => {
          // If page number is -1 or -2, it's a placeholder for ellipsis
          if (pageNumber < 0) {
            return (
              <PageItem key={`ellipsis-${index}`}>
                <PageButton
                  variant="ellipsis"
                  disabled
                  aria-hidden="true"
                  size={size}
                  shape={shape}
                >
                  …
                </PageButton>
              </PageItem>
            );
          }
          
          return (
            <PageItem key={pageNumber}>
              <PageButton
                variant={pageNumber === currentPage ? 'active' : 'default'}
                onClick={() => handlePageChange(pageNumber)}
                aria-label={`Go to page ${pageNumber}`}
                aria-current={pageNumber === currentPage ? 'page' : undefined}
                size={size}
                shape={shape}
              >
                {pageNumber}
              </PageButton>
            </PageItem>
          );
        })}
        
        {/* Next page button */}
        {showPrevNext && (
          <PageItem>
            <PageButton
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Go to next page"
              size={size}
              shape={shape}
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
              aria-label="Go to last page"
              size={size}
              shape={shape}
            >
              {lastLabel}
            </PageButton>
          </PageItem>
        )}
      </PaginationList>
    </PaginationContainer>
  );
}; 