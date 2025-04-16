import React, { forwardRef } from 'react';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';
import styled from '@emotion/styled';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Variant of the card */
  variant?: 'outlined' | 'elevation' | 'flat';
  /** Padding level */
  padding?: 'none' | 'small' | 'medium' | 'large';
  /** Custom background color from theme */
  bgColor?: string;
  /** Custom border color from theme */
  borderColor?: string;
  /** Whether the card should take up the full width of its container */
  fullWidth?: boolean;
  /** Whether the card should have hover effects */
  interactive?: boolean;
  /** Children elements */
  children: React.ReactNode;
  /** Custom class name */
  className?: string;
}

// Styled components for Card parts
const StyledCardHeader = styled.div<{ $customStyles?: React.CSSProperties }>`
  padding: ${props => props.$customStyles?.padding};
  border-bottom: ${props => props.$customStyles?.borderBottom};
`;

const StyledCardContent = styled.div`
  flex: 1;
`;

const StyledCardFooter = styled.div<{ $customStyles?: React.CSSProperties }>`
  padding: ${props => props.$customStyles?.padding};
  border-top: ${props => props.$customStyles?.borderTop};
`;

/**
 * Card component - Container for content with styling and layout options
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'elevation',
      padding = 'medium',
      bgColor,
      borderColor,
      fullWidth = false,
      interactive = false,
      children,
      className,
      ...props
    },
    ref
  ) => {
    // Use DirectThemeProvider hook
    const { getColor, getSpacing, getBorderRadius, getShadow } = useDirectTheme();

    const getPaddingValue = (): string => {
      switch (padding) {
        case 'none': return '0';
        case 'small': return getSpacing('4', '1rem');
        case 'large': return getSpacing('8', '2rem');
        default: return getSpacing('6', '1.5rem'); // medium (default)
      }
    };

    const getBackgroundColor = (): string => {
      if (bgColor) {
        // Try to get color from theme first, fallback to raw value
        return getColor(bgColor, bgColor);
      }
      return getColor('background', '#ffffff');
    };

    const getBorderColor = (): string => {
      if (borderColor) {
        // Try to get color from theme first, fallback to raw value
        return getColor(borderColor, borderColor);
      }
      return getColor('gray.200', '#e5e7eb');
    };

    const getElevation = (): string => {
      if (variant === 'flat' || variant === 'outlined') return 'none';
      return getShadow('sm', '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)');
    };

    const getMediumElevation = (): string => {
      return getShadow('md', '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)');
    };

    const styles: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      width: fullWidth ? '100%' : 'auto',
      padding: getPaddingValue(),
      backgroundColor: getBackgroundColor(),
      borderRadius: getBorderRadius('md', '0.375rem'),
      boxShadow: getElevation(),
      border: variant === 'outlined' ? `1px solid ${getBorderColor()}` : 'none',
      transition: 'box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out',
      cursor: interactive ? 'pointer' : 'default',
      overflow: 'hidden',
    };

    // Add hover effects for interactive cards
    const handleMouseOver = (e: React.MouseEvent<HTMLDivElement>) => {
      if (interactive && e.currentTarget) {
        e.currentTarget.style.boxShadow = getMediumElevation();
        e.currentTarget.style.transform = 'translateY(-2px)';
      }
      props.onMouseOver?.(e);
    };

    const handleMouseOut = (e: React.MouseEvent<HTMLDivElement>) => {
      if (interactive && e.currentTarget) {
        e.currentTarget.style.boxShadow = getElevation();
        e.currentTarget.style.transform = 'translateY(0)';
      }
      props.onMouseOut?.(e);
    };

    return (
      <div
        ref={ref}
        style={styles}
        className={className}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  style,
  ...props
}) => {
  const { getSpacing, getColor } = useDirectTheme();
  
  const customStyles: React.CSSProperties = {
    padding: getSpacing('4', '1rem'),
    borderBottom: `1px solid ${getColor('gray.100', '#f3f4f6')}`,
    ...style,
  };

  return (
    <StyledCardHeader $customStyles={customStyles} style={style} {...props}>
      {children}
    </StyledCardHeader>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  style,
  ...props
}) => {
  return (
    <StyledCardContent style={style} {...props}>
      {children}
    </StyledCardContent>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  style,
  ...props
}) => {
  const { getSpacing, getColor } = useDirectTheme();
  
  const customStyles: React.CSSProperties = {
    padding: getSpacing('4', '1rem'),
    borderTop: `1px solid ${getColor('gray.100', '#f3f4f6')}`,
    ...style,
  };

  return (
    <StyledCardFooter $customStyles={customStyles} style={style} {...props}>
      {children}
    </StyledCardFooter>
  );
}; 