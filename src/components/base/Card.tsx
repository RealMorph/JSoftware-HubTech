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
  children?: React.ReactNode;
  /** Custom class name */
  className?: string;
}

interface ThemeStyles {
  padding: string;
  backgroundColor: string;
  borderRadius: string;
  boxShadow: string;
  border: string;
  mediumElevation: string;
}

const createThemeStyles = (
  themeContext: ReturnType<typeof useDirectTheme>,
  props: CardProps
): ThemeStyles => {
  const getPaddingValue = (): string => {
    switch (props.padding) {
      case 'none':
        return '0';
      case 'small':
        return themeContext.getSpacing('4', '1rem');
      case 'large':
        return themeContext.getSpacing('8', '2rem');
      default:
        return themeContext.getSpacing('6', '1.5rem'); // medium (default)
    }
  };

  const getBackgroundColor = (): string => {
    if (props.bgColor) {
      return themeContext.getColor(props.bgColor, props.bgColor);
    }
    return themeContext.getColor('background', '#ffffff');
  };

  const getBorderColor = (): string => {
    if (props.borderColor) {
      return themeContext.getColor(props.borderColor, props.borderColor);
    }
    return themeContext.getColor('gray.200', '#e5e7eb');
  };

  const getElevation = (): string => {
    if (props.variant === 'flat' || props.variant === 'outlined') return 'none';
    return themeContext.getShadow('sm', '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)');
  };

  const getMediumElevation = (): string => {
    return themeContext.getShadow(
      'md',
      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    );
  };

  return {
    padding: getPaddingValue(),
    backgroundColor: getBackgroundColor(),
    borderRadius: themeContext.getBorderRadius('md', '0.375rem'),
    boxShadow: getElevation(),
    border: props.variant === 'outlined' ? `1px solid ${getBorderColor()}` : 'none',
    mediumElevation: getMediumElevation(),
  };
};

const StyledCard = styled.div<{
  $themeStyles: ThemeStyles;
  $fullWidth?: boolean;
  $interactive?: boolean;
}>`
  display: flex;
  flex-direction: column;
  position: relative;
  width: ${props => (props.$fullWidth ? '100%' : 'auto')};
  padding: ${props => props.$themeStyles.padding};
  background-color: ${props => props.$themeStyles.backgroundColor};
  border-radius: ${props => props.$themeStyles.borderRadius};
  box-shadow: ${props => props.$themeStyles.boxShadow};
  border: ${props => props.$themeStyles.border};
  transition: box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out;
  cursor: ${props => (props.$interactive ? 'pointer' : 'default')};
  overflow: hidden;

  ${props =>
    props.$interactive &&
    `
    &:hover {
      box-shadow: ${props.$themeStyles.mediumElevation};
      transform: translateY(-2px);
    }

    &:not(:hover) {
      transform: translateY(0);
    }
  `}
`;

const StyledCardHeader = styled.div<{ $themeStyles: ThemeStyles }>`
  padding: ${props => props.$themeStyles.padding};
  border-bottom: 1px solid ${() => {
    const theme = useDirectTheme();
    return theme.getColor('gray.100', '#f3f4f6');
  }};
`;

const StyledCardContent = styled.div`
  flex: 1;
`;

const StyledCardFooter = styled.div<{ $themeStyles: ThemeStyles }>`
  padding: ${props => props.$themeStyles.padding};
  border-top: 1px solid ${() => {
    const theme = useDirectTheme();
    return theme.getColor('gray.100', '#f3f4f6');
  }};
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
    const themeContext = useDirectTheme();
    const themeStyles = createThemeStyles(themeContext, {
      variant,
      padding,
      bgColor,
      borderColor,
    });

    return (
      <StyledCard
        ref={ref}
        $themeStyles={themeStyles}
        $fullWidth={fullWidth}
        $interactive={interactive}
        className={className}
        {...props}
      >
        {children}
      </StyledCard>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  ...props
}) => {
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext, { padding: 'medium' });

  return (
    <StyledCardHeader $themeStyles={themeStyles} {...props}>
      {children}
    </StyledCardHeader>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  ...props
}) => {
  return <StyledCardContent {...props}>{children}</StyledCardContent>;
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  ...props
}) => {
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext, { padding: 'medium' });

  return (
    <StyledCardFooter $themeStyles={themeStyles} {...props}>
      {children}
    </StyledCardFooter>
  );
};
