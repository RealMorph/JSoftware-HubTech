/**
 * Card Component
 * 
 * A versatile card component with customizable variants, hover effects,
 * and accessibility features.
 */

import React, { forwardRef, useState } from 'react';
import styled from '@emotion/styled';
import { useTheme } from '../../core/theme/ThemeContext';
import { createThemeStyles } from '../../core/theme/utils/themeUtils';
import { filterTransientProps } from '../../core/styled-components/transient-props';
import { ThemeStyles, StyledComponentProps } from '../../core/theme/types';

// Define card variants
export enum CardVariant {
  ELEVATED = 'elevated',
  OUTLINED = 'outlined',
  FLAT = 'flat',
  INTERACTIVE = 'interactive'
}

// Props for the Card component
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Visual style variant of the card
   * @default CardVariant.ELEVATED
   */
  variant?: CardVariant;
  
  /**
   * Whether to apply hover effects
   * @default false
   */
  hoverable?: boolean;
  
  /**
   * Whether the entire card should be clickable
   * @default false
   */
  clickable?: boolean;
  
  /**
   * Whether to add a subtle border to the card
   * @default false for ELEVATED, true for others
   */
  bordered?: boolean;
  
  /**
   * Whether to add a focus ring when the card is focused
   * Only applies when the card is clickable
   * @default true
   */
  focusVisible?: boolean;
  
  /**
   * Content to render inside the card
   */
  children: React.ReactNode;
  
  /**
   * Optional click handler for the card
   */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  
  /**
   * Additional class name
   */
  className?: string;
  
  /**
   * Removes all padding from the card
   * @default false
   */
  noPadding?: boolean;
  
  /**
   * Compact mode with less padding
   * @default false
   */
  compact?: boolean;
  
  /**
   * Data test ID for testing
   */
  "data-testid"?: string;
}

interface StyledCardProps extends StyledComponentProps {
  $variant: CardVariant;
  $hoverable: boolean;
  $clickable: boolean;
  $bordered: boolean;
  $noPadding: boolean;
  $compact: boolean;
  $active: boolean;
}

const cardVariantStyles = {
  [CardVariant.ELEVATED]: (styles: ThemeStyles) => `
    background-color: ${styles.colors.background.paper};
    box-shadow: ${styles.shadows.card};
  `,
  [CardVariant.OUTLINED]: (styles: ThemeStyles) => `
    background-color: ${styles.colors.background.paper};
    border: 1px solid ${styles.colors.border.main};
  `,
  [CardVariant.FLAT]: (styles: ThemeStyles) => `
    background-color: ${styles.colors.background.subtle};
  `,
  [CardVariant.INTERACTIVE]: (styles: ThemeStyles) => `
    background-color: ${styles.colors.background.paper};
    box-shadow: ${styles.shadows.card};
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: ${styles.shadows.card};
    }
  `
};

// Define the styled component
const StyledCard = styled(filterTransientProps(styled.div``))<StyledCardProps>`
  position: relative;
  border-radius: ${props => props.$themeStyles.borders.radius.medium};
  padding: ${props => 
    props.$noPadding 
      ? '0' 
      : props.$compact 
        ? props.$themeStyles.spacing.sm 
        : props.$themeStyles.spacing.md
  };
  transition: box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out;
  
  ${props => cardVariantStyles[props.$variant](props.$themeStyles)}
  
  ${props => props.$bordered && props.$variant !== CardVariant.OUTLINED && `
    border: 1px solid ${props.$themeStyles.colors.border.main};
  `}
  
  ${props => props.$hoverable && `
    &:hover {
      box-shadow: ${props.$themeStyles.shadows.card};
      ${props.$variant === CardVariant.OUTLINED ? `border-color: ${props.$themeStyles.colors.primary.main};` : ''}
    }
  `}
  
  ${props => props.$clickable && `
    cursor: pointer;
    user-select: none;
    
    &:active {
      transform: translateY(1px);
      box-shadow: ${props.$variant === CardVariant.ELEVATED || props.$variant === CardVariant.INTERACTIVE 
        ? props.$themeStyles.shadows.card
        : 'none'
      };
    }
    
    &:focus-visible {
      outline: none;
      ${!props.$active ? `box-shadow: 0 0 0 2px ${props.$themeStyles.colors.primary.main};` : ''}
    }
  `}
  
  ${props => props.$active && `
    box-shadow: 0 0 0 2px ${props.$themeStyles.colors.primary.main};
  `}
`;

/**
 * Card component for containing related content and actions
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = CardVariant.ELEVATED,
      hoverable = false,
      clickable = false,
      bordered,
      focusVisible = true,
      children,
      onClick,
      className,
      noPadding = false,
      compact = false,
      ...rest
    }, 
    ref
  ) => {
    // Default bordered based on variant if not specified
    const isBordered = bordered ?? (variant !== CardVariant.ELEVATED);
    
    // For focus/active state tracking
    const [isActive, setIsActive] = useState(false);
    
    // Access theme
    const theme = useTheme();
    const themeStyles = createThemeStyles(theme);
    
    // Event handlers for accessible keyboard interaction
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (clickable && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        onClick?.(event as unknown as React.MouseEvent<HTMLDivElement>);
      }
    };
    
    const handleFocus = () => {
      if (focusVisible && clickable) {
        setIsActive(true);
      }
    };
    
    const handleBlur = () => {
      setIsActive(false);
    };
    
    return (
      <StyledCard
        ref={ref}
        $themeStyles={themeStyles}
        $variant={variant}
        $hoverable={hoverable}
        $clickable={clickable}
        $bordered={isBordered}
        $noPadding={noPadding}
        $compact={compact}
        $active={isActive}
        onClick={clickable ? onClick : undefined}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        tabIndex={clickable ? 0 : undefined}
        role={clickable ? 'button' : undefined}
        className={className}
        {...rest}
      >
        {children}
      </StyledCard>
    );
  }
);

Card.displayName = 'Card';

export default Card;
